// The rules of the game: the hourly tick, the rival, raids and player actions.
// Everything visible goes through ports, so this file has no UI or rendering imports.
import {
  BIZ,
  BLOCKS,
  RIVAL_TYPES,
  TRAITS,
  WIN_LOTS,
  blockOf,
  lotAddress,
  type BizDef,
  type BizType,
  type PriceKey,
} from './data';
import { ports } from './ports';
import {
  S,
  bizHeatHour,
  bizIncomeHour,
  blockAdjacent,
  clamp,
  expandCost,
  expandRespect,
  fmt,
  isClosed,
  newCandidate,
  ownedCount,
  pick,
  rnd,
  shares,
  slotsOf,
  staffEff,
  tillCap,
  type Lot,
  type Staff,
} from './state';

export interface PayPlan {
  kind: 'clean' | 'dirty';
  amt: number;
  ok: boolean;
  alt?: number;
  cleanAmt?: number;
  markup?: boolean;
}

function indexedLots(): [Lot, number][] {
  return S.lots.map((l, i) => [l, i]);
}

export function collect(i: number, fee?: number) {
  const l = S.lots[i],
    b = l.biz!,
    amt = (b.till || 0) * (1 - (fee || 0));
  if (amt <= 0) return 0;
  if (BIZ[b.type].money === 'clean') S.clean += amt;
  else S.dirty += amt;
  b.till = 0;
  if (!fee) {
    ports.floatText(i, '+' + fmt(amt) + (BIZ[b.type].money === 'clean' ? ' clean' : ''));
    ports.sfx.cash();
    ports.updateHUD();
    ports.renderFile();
  }
  return amt;
}

export function stamp() {
  const d = Math.floor(S.t / 24),
    h = Math.floor(S.t % 24);
  return `D${d + 1} ${String(h).padStart(2, '0')}:00`;
}
export function log(text: string, kind = '') {
  S.log.unshift({ t: stamp(), text, kind });
  S.log.length = Math.min(S.log.length, 30);
  ports.renderLog();
}
export function weekEvent(sev: number, head: string, deck: string) {
  S.week.events.push({ sev, head, deck });
}

export function advance(hours: number) {
  const target = S.t + hours;
  while (Math.floor(S.t) < Math.floor(target)) {
    S.t = Math.floor(S.t) + 1;
    hourTick();
    if (S.flags.over) return;
  }
  S.t = target;
}

export function hourTick() {
  const h = S.t % 24,
    sh = shares().you;
  let heatDelta = -(S.lieLow ? 6 : 1.5) / 24;
  for (const l of S.lots) {
    if (l.owner !== 'you' || !l.biz) continue;
    const def = BIZ[l.biz!.type];
    const cap = tillCap(l.biz),
      inc = Math.min(bizIncomeHour(l, h, sh), Math.max(0, cap - (l.biz!.till || 0)));
    l.biz!.till = (l.biz!.till || 0) + inc;
    S.week.income += inc;
    heatDelta += bizHeatHour(l);
    if (def.launder && !isClosed(l.biz) && l.biz!.staff.length) {
      const amt = Math.min(
        Math.max(S.dirty, 0),
        (def.launder / 24) * staffEff(l.biz) * (1 + (l.biz!.tier - 1) * 0.5),
      );
      S.dirty -= amt;
      S.clean += amt * def.rate!;
      S.week.laundered += amt;
    }
  }
  S.heat = clamp(S.heat + heatDelta, 0, 100);

  // rival income
  S.rival.cash +=
    S.lots.filter((l) => l.owner === 'rival' && l.biz && !isClosed(l.biz)).length * 14;

  // raids
  if (S.heat >= 40) {
    const p = ((S.heat - 35) / 1500) * (S.heat >= 80 ? 1.8 : 1);
    if (Math.random() < p) raid();
  }
  // fires burn out
  S.fires = S.fires.filter((f) => f.until > S.t);
  if (S.policeUntil < S.t) S.policeLot = -1;

  if (h === 0) dayEnd();
  if (h === 6 && Math.floor(S.t / 24) % 7 === 0 && S.t > 24) ports.queuePaper();
  if (h === 6) {
    S.board = [newCandidate(), newCandidate(), newCandidate(), newCandidate()];
  }

  if (S.t >= S.rival.nextMove) rivalMove();
  if (
    !S.flags.tip &&
    S.t > 24 * 5 &&
    S.lots.some((l) => l.owner === 'rival') &&
    Math.random() < 0.015
  ) {
    S.flags.tip = true;
    ports.queueTip();
  }

  if (S.heat >= 100 && !S.flags.over) {
    S.flags.over = true;
    ports.fall();
    return;
  }
  if (ownedCount() >= WIN_LOTS && !S.flags.actDone) {
    S.flags.actDone = true;
    ports.actComplete();
  }
  ports.refreshFile();
  ports.updateGoals();
}

export const DIRTY_MARKUP = 1.6,
  CHANGER_MAX = 1500,
  CHANGER_RATE = 0.6;
export function hasFront() {
  return S.lots.some((l) => l.owner === 'you' && l.biz && BIZ[l.biz!.type].launder);
}
// how a business gets paid for: clean money normally; a front can also be built with dirty cash, at a markup
export function payPlan(def: BizDef, rebuild: number): PayPlan {
  if (def.money !== 'clean')
    return { kind: 'dirty', amt: def.cost + rebuild, ok: S.dirty >= def.cost + rebuild };
  const c = def.cost + rebuild,
    d = Math.round((def.cost * DIRTY_MARKUP + rebuild) / 100) * 100;
  if (S.clean >= c) return { kind: 'clean', amt: c, ok: true, alt: d };
  return { kind: 'dirty', amt: d, ok: S.dirty >= d, cleanAmt: c, markup: true };
}
export function changerReady() {
  return S.t - (S.washAt == null ? -99 : S.washAt) >= 12;
}
export function dayEnd() {
  let wages = 0,
    upkeep = 0;
  for (const l of S.lots) {
    if (l.owner !== 'you' || !l.biz) continue;
    upkeep += 40;
    for (const s of l.biz!.staff) wages += TRAITS[s.trait].wage;
  }
  wages += S.muscle * 80;
  const total = wages + upkeep;
  S.dirty -= total;
  S.week.wages += total;
  if (S.dirty < 0) {
    const all: [Lot, Staff][] = [];
    S.lots.forEach((l) => {
      if (l.owner === 'you' && l.biz) l.biz!.staff.forEach((s) => all.push([l, s]));
    });
    if (all.length) {
      const [l, s] = pick(all);
      l.biz!.staff = l.biz!.staff.filter((x) => x !== s);
      S.respect = clamp(S.respect - 5, 0, 100);
      log(
        `Payroll came up short. ${s.name} walked out of ${BIZ[l.biz!.type].name.toLowerCase()} for good.`,
        'bad',
      );
    } else if (S.muscle > 0) {
      S.muscle--;
      log('Payroll came up short. One of your enforcers quit.', 'bad');
    }
  }
  if (!hasFront() && S.clean < BIZ.front.cost && !S.flags.washHint) {
    S.flags.washHint = true;
    log(
      'Tip: you have no laundering front and little clean cash. Use the money changer, or build a kopitiam with dirty cash at a markup.',
      'good',
    );
  }
  // respect drifts up with held turf
  S.respect = clamp(S.respect + ownedCount() * 0.4, 0, 100);
  ports.autosave();
}

export function raid() {
  const targets = indexedLots().filter(
    ([l]) => l.owner === 'you' && l.biz && BIZ[l.biz!.type].vice && !isClosed(l.biz),
  );
  if (!targets.length) return;
  const [l, i] = pick(targets);
  const seized = Math.round(Math.max(S.dirty, 0) * 0.1 + (l.biz!.till || 0));
  l.biz!.till = 0;
  l.biz!.closedUntil = S.t + 48;
  S.dirty -= seized;
  S.week.seized += seized;
  S.heat = clamp(S.heat - 8, 0, 100);
  S.respect = clamp(S.respect - 4, 0, 100);
  S.policeLot = i;
  S.policeUntil = S.t + 10;
  log(
    `POLICE RAID on your ${BIZ[l.biz!.type].name.toLowerCase()} at ${lotAddress(i)}. ${fmt(seized)} seized, shut for two days.`,
    'bad',
  );
  weekEvent(
    3,
    `Police raid ${BIZ[l.biz!.type].name.toLowerCase()} in Chow Kit`,
    `Officers seize ${fmt(seized)} in cash at ${lotAddress(i)}; operators remain at large.`,
  );
  ports.news('raid', i);
  ports.sfx.siren();
  ports.vignette('raid', 'Blue and red on wet tarmac. Somebody talked. Somebody always talks.');
}

export function rivalMove() {
  S.rival.nextMove = S.t + rnd(30, 50);
  if (S.truceUntil > S.t) return;
  const sh = shares();
  const myBiz = indexedLots().filter(([l]) => l.owner === 'you' && l.biz);
  const sale = indexedLots().filter(([l]) => l.owner === 'sale');
  const opts: [string, number][] = [];
  if (sale.length && S.rival.cash > 1800) opts.push(['expand', 4]);
  if (myBiz.length) opts.push(['undercut', 3], ['sabotage', 2]);
  if (myBiz.some(([l]) => l.biz!.staff.length)) opts.push(['poach', 2]);
  if (S.t > 72 && myBiz.length >= 2 && sh.you > 0.28) opts.push(['torch', 1 + sh.you * 6]);
  if (!opts.length) return;
  let r = Math.random() * opts.reduce((a, o) => a + o[1], 0),
    move = opts[0][0];
  for (const o of opts) {
    if ((r -= o[1]) <= 0) {
      move = o[0];
      break;
    }
  }
  const toughAt = (l: Lot) => l.biz!.staff.some((s) => s.trait === 'tough');

  if (move === 'expand') {
    const [l, i] = pick(sale);
    S.rival.cash -= Math.min(S.rival.cash, l.price);
    l.owner = 'rival';
    l.burned = false;
    l.biz = {
      type: pick(RIVAL_TYPES),
      tier: 1,
      price: 'fair',
      staff: [],
      closedUntil: 0,
      undercutUntil: 0,
      till: 0,
    };
    ports.news('rivalbought', i);
    log(
      `Geng Lorong bought ${lotAddress(i)} and opened a ${BIZ[l.biz!.type].name.toLowerCase()}.`,
      'rival',
    );
  } else if (move === 'undercut') {
    const [l] = myBiz.sort((a, b) => BIZ[b[0].biz!.type].perDay - BIZ[a[0].biz!.type].perDay)[0];
    l.biz!.undercutUntil = S.t + 48;
    log(
      `Mat Botak is undercutting your ${BIZ[l.biz!.type].name.toLowerCase()}. Takings down 40% for two days.`,
      'rival',
    );
  } else if (move === 'poach') {
    const withStaff = myBiz.filter(([l]) => l.biz!.staff.length);
    const [l] = pick(withStaff);
    if (Math.random() < 0.6 - S.respect / 250) {
      const s = l.biz!.staff.sort(
        (a, b) => Number(b.trait === 'sharp') - Number(a.trait === 'sharp'),
      )[0];
      l.biz!.staff = l.biz!.staff.filter((x) => x !== s);
      log(
        `${s.name} took Geng Lorong's money and left your ${BIZ[l.biz!.type].name.toLowerCase()}.`,
        'bad',
      );
      S.respect = clamp(S.respect - 2, 0, 100);
    } else log(`Geng Lorong tried to buy off your staff. Nobody bit.`, 'good');
  } else if (move === 'sabotage') {
    const [l, i] = pick(myBiz);
    if (toughAt(l) || Math.random() < 0.2 + S.muscle * 0.05) {
      log(`Your people ran off Geng Lorong boys loitering at ${lotAddress(i)}.`, 'good');
      S.respect = clamp(S.respect + 1, 0, 100);
    } else {
      l.biz!.closedUntil = Math.max(l.biz!.closedUntil, S.t + 24);
      S.heat = clamp(S.heat + 8, 0, 100);
      log(
        `Sabotage: someone tipped off the police and smashed up your ${BIZ[l.biz!.type].name.toLowerCase()}. Shut for a day, heat +8.`,
        'bad',
      );
    }
  } else if (move === 'torch') {
    const [l, i] = myBiz.sort((a, b) => BIZ[b[0].biz!.type].perDay - BIZ[a[0].biz!.type].perDay)[0];
    const chance = 0.5 - S.muscle * 0.07 - (toughAt(l) ? 0.3 : 0);
    if (Math.random() < chance) {
      const name = BIZ[l.biz!.type].name;
      l.biz = null;
      l.burned = true;
      S.respect = clamp(S.respect - 4, 0, 100);
      S.fires.push({ lot: i, until: S.t + 8 });
      log(
        `FIRE at ${lotAddress(i)}. Geng Lorong torched your ${name.toLowerCase()}. The lot is still yours.`,
        'bad',
      );
      ports.news('fire', i);
      weekEvent(
        4,
        `Shophouse blaze on Jalan Raja Bot`,
        `Fire department suspects arson; neighbours speak of a gang feud.`,
      );
      ports.sfx.fire();
      ports.vignette('fire', 'Petrol and a match. Mat Botak never was subtle.');
    } else {
      S.respect = clamp(S.respect + 3, 0, 100);
      log(
        `Your boys caught two Geng Lorong runners with petrol cans behind ${lotAddress(i)}.`,
        'good',
      );
    }
  }
}

/* ---------- player actions ---------- */
export function act(kind: string, i: number, arg?: string) {
  const l = S.lots[i];
  switch (kind) {
    case 'buy':
      if (S.clean < l.price) return;
      S.clean -= l.price;
      l.owner = 'you';
      l.biz = null;
      log(`You bought ${lotAddress(i)} for ${fmt(l.price)} clean.`, 'good');
      ports.sfx.cash();
      ports.news('bought', i);
      break;
    case 'open': {
      const def = BIZ[arg as BizType],
        rebuild = l.burned ? 400 : 0;
      if (def.respect && S.respect < def.respect) return;
      const plan = payPlan(def, rebuild);
      if (!plan.ok) return;
      if (plan.kind === 'clean') S.clean -= plan.amt;
      else S.dirty -= plan.amt;
      if (plan.markup) {
        S.heat = clamp(S.heat + 3, 0, 100);
        log(
          `No clean money, so the contractor took ${fmt(plan.amt)} in dirty cash and asked no questions. Heat +3.`,
          '',
        );
      }
      l.biz = {
        type: arg as BizType,
        tier: 1,
        price: 'fair',
        staff: [],
        closedUntil: 0,
        undercutUntil: 0,
        till: 0,
      };
      l.burned = false;
      S.respect = clamp(S.respect + 2, 0, 100);
      log(
        `Opened a ${def.name.toLowerCase()} at ${lotAddress(i)}. Hire staff to get it running.`,
        'good',
      );
      ports.sfx.cash();
      if (!S.flags.firstOpen) {
        S.flags.firstOpen = true;
        ports.vignette(
          'open',
          'Another door, another back room. The neon said open. The ledger said more.',
          i,
        );
      }
      break;
    }
    case 'upgrade': {
      const def = BIZ[l.biz!.type],
        c = Math.round(def.cost * 1.2);
      if (def.money === 'clean' ? S.clean < c : S.dirty < c) return;
      if (def.money === 'clean') S.clean -= c;
      else S.dirty -= c;
      l.biz!.tier = 2;
      log(`${def.name} at ${lotAddress(i)} expanded into the floor upstairs.`, 'good');
      ports.sfx.cash();
      break;
    }
    case 'price':
      l.biz!.price = arg as PriceKey;
      break;
    case 'hire': {
      const c = S.board.find((x) => x.id === arg);
      if (!c) return;
      const fee = TRAITS[c.trait].wage * 2;
      if (S.dirty < fee || l.biz!.staff.length >= slotsOf(l.biz!)) return;
      S.dirty -= fee;
      l.biz!.staff.push({ name: c.name, trait: c.trait, id: c.id });
      S.board = S.board.filter((x) => x !== c);
      log(`${c.name} (${TRAITS[c.trait].label.toLowerCase()}) starts tonight at ${lotAddress(i)}.`);
      ports.sfx.click();
      break;
    }
    case 'fire':
      l.biz!.staff = l.biz!.staff.filter((s) => s.id !== arg);
      ports.sfx.click();
      break;
    case 'collect':
      collect(i);
      return;
    case 'expand': {
      const b = blockOf(i),
        cost = expandCost();
      if (
        b < 0 ||
        !blockAdjacent(b) ||
        S.clean < cost ||
        S.respect < expandRespect() ||
        S.blocks.includes(b)
      )
        return;
      S.clean -= cost;
      S.blocks.push(b);
      S.discount = 1;
      ports.news('expand', i, BLOCKS[b].name);
      for (let k = 0; k < 4; k++) {
        const L = S.lots[16 + b * 4 + k];
        L.owner = 'sale';
        L.price = 1800 + Math.round(Math.random() * 6) * 200;
      }
      log(`You paid the headman. ${BLOCKS[b].name} is open: four plots for sale.`, 'good');
      weekEvent(
        2,
        `Shophouses in ${BLOCKS[b].name} change hands`,
        `A newcomer is buying up the street; long-time tenants say the offers were hard to refuse.`,
      );
      ports.sfx.cash();
      ports.floatText(i, BLOCKS[b].name + ' is open');
      ports.focusCamera(BLOCKS[b].c[0], BLOCKS[b].c[1]);
      break;
    }
    case 'close':
      log(
        `You shut the ${BIZ[l.biz!.type].name.toLowerCase()} at ${lotAddress(i)}. The room is empty again.`,
      );
      l.biz = null;
      break;
    case 'strong': {
      if (S.dirty < 400 || S.muscle < 1) return;
      S.dirty -= 400;
      const ok = Math.random() < 0.5 + 0.08 * S.muscle - 0.06 * S.rival.muscle + S.respect / 400;
      if (ok) {
        ports.news('strong', i);
        l.biz!.closedUntil = S.t + 48;
        S.heat = clamp(S.heat + 5, 0, 100);
        S.respect = clamp(S.respect + 2, 0, 100);
        log(
          `Your enforcers leaned on Geng Lorong's ${BIZ[l.biz!.type].name.toLowerCase()}. Shut for two days.`,
          'good',
        );
        ports.sfx.thud();
      } else {
        S.heat = clamp(S.heat + 6, 0, 100);
        S.respect = clamp(S.respect - 3, 0, 100);
        if (Math.random() < 0.4 && S.muscle > 0) {
          S.muscle--;
          log('The shakedown went wrong. One of your enforcers is in Pudu lock-up.', 'bad');
        } else log('The shakedown went wrong. Geng Lorong stood their ground.', 'bad');
      }
      break;
    }
    case 'torch': {
      if (S.dirty < 900 || S.muscle < 2) return;
      S.dirty -= 900;
      const ok = Math.random() < 0.42 + 0.08 * S.muscle - 0.05 * S.rival.muscle;
      if (ok) {
        const name = BIZ[l.biz!.type].name;
        l.owner = 'sale';
        l.biz = null;
        l.burned = true;
        l.price = Math.round((l.price * 0.7) / 100) * 100;
        S.heat = clamp(S.heat + 14, 0, 100);
        S.respect = clamp(S.respect + 5, 0, 100);
        S.fires.push({ lot: i, until: S.t + 8 });
        log(
          `${lotAddress(i)} burned. Geng Lorong lost their ${name.toLowerCase()}. The lot is up for sale.`,
          'good',
        );
        ports.news('torch', i);
        weekEvent(
          4,
          `Night fire guts Chow Kit ${name.toLowerCase()}`,
          `Witnesses saw men with jerry cans; police appeal for information.`,
        );
        ports.sfx.fire();
        ports.vignette(
          'fire',
          "You don't argue with a man about his shop. You argue with the shop.",
        );
      } else {
        S.heat = clamp(S.heat + 10, 0, 100);
        S.respect = clamp(S.respect - 4, 0, 100);
        if (S.muscle > 0) S.muscle--;
        log(
          'The torch job failed. Geng Lorong caught one of your men and sent him back without his teeth.',
          'bad',
        );
      }
      break;
    }
    case 'buyout': {
      const c = l.price * 2;
      if (S.clean < c || S.respect < 45) return;
      S.clean -= c;
      l.owner = 'you';
      l.biz!.staff = [];
      l.biz!.closedUntil = 0;
      l.biz!.till = 0;
      S.heat = clamp(S.heat + 2, 0, 100);
      log(
        `You made Geng Lorong an offer for ${lotAddress(i)}. They took it. It's yours, staff not included.`,
        'good',
      );
      ports.sfx.cash();
      if (!S.flags.firstTake) {
        S.flags.firstTake = true;
        ports.vignette('take', 'Money talks. Clean money talks in a nicer voice.', i);
      }
      break;
    }
  }
  ports.updateHUD();
  ports.renderFile();
  ports.updateGoals();
}
