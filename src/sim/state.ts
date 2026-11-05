// The live game state and everything derived from it. No browser APIs.
import {
  BIZ,
  BLOCKS,
  CORE_BLOCKS,
  LOT_COUNT,
  NAMES,
  PRICE,
  type BizDef,
  type BizType,
  type PriceKey,
  type Trait,
} from './data';

export interface Staff {
  name: string;
  trait: Trait;
  id: string;
}
export interface Biz {
  type: BizType;
  tier: number;
  price: PriceKey;
  staff: Staff[];
  closedUntil: number;
  undercutUntil: number;
  till: number;
}
export interface Lot {
  owner: 'you' | 'rival' | 'sale' | 'locked';
  biz: Biz | null;
  price: number;
  burned: boolean;
}
export interface GameState {
  v: number;
  t: number;
  dirty: number;
  clean: number;
  respect: number;
  muscle: number;
  heat: number;
  lieLow: boolean;
  bribeAt: number;
  sitAt: number;
  washAt?: number;
  truceUntil: number;
  discount?: number;
  lots: Lot[];
  blocks: number[];
  rival: { cash: number; muscle: number; nextMove: number };
  board: Staff[];
  log: { t: string; text: string; kind: string }[];
  news?: { t: number; kind: string; lot: number; extra?: string }[];
  week: {
    income: number;
    wages: number;
    laundered: number;
    seized: number;
    heat0: number;
    events: { sev: number; head: string; deck: string }[];
  };
  flags: {
    firstOpen: boolean;
    firstTake: boolean;
    actDone: boolean;
    over: boolean;
    tip: boolean;
    washHint?: boolean;
    g1?: boolean;
    g2?: boolean;
  };
  policeLot: number;
  policeUntil: number;
  fires: { lot: number; until: number }[];
}

// Null until a game starts, and on the title screen. Code that can run then has to check it first.
export let S: GameState = null as unknown as GameState;
export function setS(next: GameState | null) {
  S = next as GameState;
}

export function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}
export function pick<T>(a: readonly T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}
export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
export function fmt(n: number) {
  return 'RM ' + Math.round(n).toLocaleString('en-US');
}

export function newCandidate(): Staff {
  const trait = pick<Trait>([
    'honest',
    'honest',
    'sharp',
    'sticky',
    'talker',
    'tough',
    'tough',
    'sharp',
  ]);
  return { name: pick(NAMES), trait, id: Math.random().toString(36).slice(2, 8) };
}
export function newState(): GameState {
  const lots: Lot[] = [];
  for (let i = 0; i < LOT_COUNT; i++)
    lots.push({
      owner: i < 16 ? 'sale' : 'locked',
      biz: null,
      price: 2000 + Math.round(Math.random() * 7) * 200,
      burned: false,
    });
  lots[9] = {
    owner: 'you',
    biz: {
      type: 'den',
      tier: 1,
      price: 'fair',
      staff: [{ name: 'Ah Keong', trait: 'honest', id: 'k0' }],
      closedUntil: 0,
      undercutUntil: 0,
      till: 120,
    },
    price: 2400,
    burned: false,
  };
  const rivalSet: Record<number, BizType> = {
    2: 'bola',
    5: 'bar',
    7: 'ahlong',
    11: 'den',
    13: 'smokes',
    15: 'parlour',
  };
  for (const k in rivalSet)
    lots[+k] = {
      owner: 'rival',
      biz: {
        type: rivalSet[+k],
        tier: 1,
        price: 'fair',
        staff: [],
        closedUntil: 0,
        undercutUntil: 0,
        till: 0,
      },
      price: 2600,
      burned: false,
    };
  return {
    v: 3,
    t: 20,
    dirty: 2400,
    clean: 4200,
    respect: 15,
    muscle: 1,
    heat: 10,
    lieLow: false,
    bribeAt: -99,
    sitAt: -999,
    truceUntil: 0,
    lots,
    blocks: [],
    rival: { cash: 1500, muscle: 3, nextMove: 44 },
    board: [newCandidate(), newCandidate(), newCandidate(), newCandidate()],
    log: [],
    week: { income: 0, wages: 0, laundered: 0, seized: 0, heat0: 10, events: [] },
    flags: { firstOpen: false, firstTake: false, actDone: false, over: false, tip: false },
    policeLot: -1,
    policeUntil: 0,
    fires: [],
  };
}

export function unlockedCenters() {
  return CORE_BLOCKS.concat((S.blocks || []).map((b) => BLOCKS[b].c));
}
export function blockAdjacent(b: number) {
  const [x, z] = BLOCKS[b].c;
  return unlockedCenters().some(([ux, uz]) => Math.abs(ux - x) + Math.abs(uz - z) === 14);
}
export function blockVisible(b: number) {
  return (S.blocks || []).includes(b) || blockAdjacent(b);
}
export function expandCost() {
  return Math.round(((6000 + 3000 * (S.blocks || []).length) * (S.discount || 1)) / 100) * 100;
}
export function expandRespect() {
  return 15 + 5 * (S.blocks || []).length;
}

export function isClosed(b: Biz) {
  return b.closedUntil > S.t;
}
export function tillCap(b: Biz) {
  return BIZ[b.type].perDay * 1.5 * (1 + (b.tier - 1) * 0.5);
}
export function canCollect(i: number) {
  const l = S && S.lots[i];
  return !!(
    l &&
    l.owner === 'you' &&
    l.biz &&
    (l.biz.till || 0) >= Math.max(40, tillCap(l.biz) * 0.12)
  );
}
export function staffEff(b: Biz) {
  const def = BIZ[b.type],
    slots = def.slots + (b.tier - 1);
  let eff = 0;
  for (const s of b.staff) eff += s.trait === 'sharp' ? 1.25 : 1;
  return Math.min(eff, slots * 1.25) / slots;
}
export function slotsOf(b: Biz) {
  return BIZ[b.type].slots + (b.tier - 1);
}
export function phaseOf(h: number) {
  return h >= 6 && h < 9
    ? 'morning'
    : h >= 9 && h < 18
      ? 'day'
      : h >= 18 && h < 21
        ? 'dusk'
        : 'night';
}
export function phaseMult(def: BizDef, h: number) {
  const p = phaseOf(h);
  return p === 'night' || p === 'dusk' ? def.night : def.day;
}
export function lotScore(l: Lot, who: 'you' | 'rival') {
  if (!l.biz) return 0;
  let s = 1 + (l.biz.tier - 1) * 0.5;
  if (isClosed(l.biz)) s *= 0.5;
  if (who === 'you') s *= PRICE[l.biz.price].share;
  return s;
}
export function shares() {
  let y = 0,
    r = 0,
    n = 0;
  for (const l of S.lots) {
    if (l.owner === 'you') y += l.biz ? lotScore(l, 'you') : 0.35;
    else if (l.owner === 'rival') r += lotScore(l, 'rival');
    else if (l.owner === 'sale') n += 0.45;
  }
  y *= 0.8 + S.respect / 250;
  const tot = y + r + n || 1;
  return { you: y / tot, riv: r / tot, open: n / tot };
}
export function ownedCount() {
  return S.lots.filter((l) => l.owner === 'you').length;
}
export function heatLevel() {
  return clamp(Math.floor(S.heat / 20), 0, 4);
}
export function bizIncomeHour(l: Lot, h: number, sh: number) {
  const b = l.biz!,
    def = BIZ[b.type];
  if (isClosed(b) || !b.staff.length) return 0;
  let inc =
    (def.perDay / 24) *
    phaseMult(def, h) *
    staffEff(b) *
    PRICE[b.price].inc *
    (1 + (b.tier - 1) * 0.5) *
    (0.55 + 0.9 * sh);
  if (b.undercutUntil > S.t) inc *= 0.6;
  if (def.vice && S.lieLow) inc *= 0.3;
  const sticky = b.staff.filter((s) => s.trait === 'sticky').length;
  inc *= 1 - (0.25 * sticky) / slotsOf(b);
  return inc;
}
export function bizHeatHour(l: Lot) {
  const b = l.biz!,
    def = BIZ[b.type];
  if (isClosed(b) || !b.staff.length) return 0;
  let h = (def.heat / 24) * (1 + (b.tier - 1) * 0.3);
  if (h > 0) {
    const talk = b.staff.filter((s) => s.trait === 'talker').length;
    h *= 1 + 0.6 * talk;
    if (S.lieLow) h *= 0.3;
  }
  return h;
}
export function estDaily(l: Lot) {
  const sh = shares().you;
  let inc = 0,
    heat = 0;
  for (let h = 0; h < 24; h++) {
    inc += bizIncomeHour(l, h, sh);
    heat += bizHeatHour(l);
  }
  return { inc, heat };
}
