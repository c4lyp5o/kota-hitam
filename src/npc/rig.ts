// What a bystander looks like and how they walk: a jointed body built from a profile.
import * as THREE from 'three';
import { G, basic, ink, toon } from '../render/materials';
import { mulberry, type Rng } from '../sim/rng';
import { rnd } from '../sim/state';
import { generateProfile, type Profile, type ProfileOverrides } from './profile';

export type Rig = ReturnType<typeof buildRig>;
export interface Walker {
  g: THREE.Group;
  rig: Rig;
  profile: Profile;
  axis: 'x' | 'z';
  dir: number;
  v: number;
  bob: number;
  pause: number;
  idle: string | null;
  pick: THREE.Mesh;
  idx: number;
  recent: string[];
  thoughts: number;
  followed: number;
}

export function buildRig(p: Profile) {
  const H = p.height,
    b = p.build;
  const root = new THREE.Group(),
    body = new THREE.Group();
  root.add(body);
  const leg = 0.47 * H,
    thigh = leg * 0.52,
    shin = leg * 0.48,
    torsoL = 0.3 * H,
    shY = leg + torsoL;
  const headR = 0.085 * H,
    neck = 0.035 * H,
    upper = 0.19 * H,
    fore = 0.17 * H;
  const skin = toon(p.skin),
    top = toon(p.top),
    bot = toon(p.bottom),
    shoe = toon(0x141416);
  const robe =
    ['kurung', 'saree', 'cheongsam', 'dress', 'nurse'].includes(p.outfit) || p.outfit === 'sarong';
  const legMat = p.outfit === 'singlet' && p.gender === 'm' ? bot : robe ? skin : bot;
  const mkLeg = (sx: number) => {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.055 * b, leg, 0);
    body.add(hip);
    const th = new THREE.Mesh(new THREE.CylinderGeometry(0.045 * b, 0.04 * b, thigh, 7), legMat);
    th.position.y = -thigh / 2;
    hip.add(th);
    const knee = new THREE.Group();
    knee.position.y = -thigh;
    hip.add(knee);
    const sh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038 * b, 0.032 * b, shin, 7),
      robe ? skin : bot,
    );
    sh.position.y = -shin / 2;
    knee.add(sh);
    const ft = new THREE.Mesh(new THREE.BoxGeometry(0.07 * b, 0.04, 0.14), shoe);
    ft.position.set(0, -shin + 0.02, 0.035);
    knee.add(ft);
    return [hip, knee];
  };
  const [hipL, kneeL] = mkLeg(-1),
    [hipR, kneeR] = mkLeg(1);
  // pelvis + torso
  const pel = new THREE.Mesh(new THREE.BoxGeometry(0.2 * b, 0.09 * H, 0.13 * b), bot);
  pel.position.y = leg + 0.02;
  body.add(pel);
  const torso = new THREE.Group();
  torso.position.y = leg;
  body.add(torso);
  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.125 * b, 0.1 * b, torsoL, 9),
    p.outfit === 'singlet' ? toon(0xe9e5dc) : top,
  );
  chest.scale.z = 0.68;
  chest.position.y = torsoL / 2 + 0.02;
  ink(chest, 0.025);
  torso.add(chest);
  if (robe) {
    const len = leg - 0.06,
      flare =
        p.outfit === 'cheongsam'
          ? 0.11
          : p.outfit === 'nurse' || p.outfit === 'dress'
            ? 0.17
            : 0.15;
    const skirtMat = p.outfit === 'sarong' ? toon(p.accent) : top;
    const sk = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.1 * b,
        flare * b,
        p.outfit === 'dress' || p.outfit === 'nurse' ? len * 0.6 : len,
        10,
      ),
      skirtMat,
    );
    sk.scale.z = 0.8;
    sk.position.y =
      leg + 0.04 - (p.outfit === 'dress' || p.outfit === 'nurse' ? len * 0.3 : len / 2);
    ink(sk, 0.025);
    body.add(sk);
  }
  if (p.outfit === 'saree') {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.06, torsoL * 1.1, 0.2 * b), toon(p.accent));
    d.position.set(0.05, torsoL * 0.55, 0.02);
    d.rotation.z = -0.5;
    torso.add(d);
  }
  if (p.outfit === 'office') {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.03, torsoL * 0.7, 0.01), toon(p.accent));
    t.position.set(0, torsoL * 0.58, 0.075 * b);
    torso.add(t);
  }
  if (p.outfit === 'apron') {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.17 * b, torsoL * 0.9, 0.01), toon(0xd8d2c4));
    a.position.set(0, torsoL * 0.2, 0.08 * b);
    torso.add(a);
  }
  if (p.outfit === 'jacket') {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.05, torsoL * 0.8, 0.02), toon(0xe6e3dc));
    l.position.set(0, torsoL * 0.55, 0.078 * b);
    torso.add(l);
  }
  if (p.outfit === 'police') {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.21 * b, 0.03, 0.15 * b), toon(0x3a2a1a));
    belt.position.y = 0.04;
    torso.add(belt);
  }
  // neck & head
  const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, neck, 6), skin);
  nk.position.y = torsoL + neck / 2;
  torso.add(nk);
  const head = new THREE.Group();
  head.position.y = torsoL + neck + headR * 0.9;
  torso.add(head);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(headR, 12, 10), skin);
  hd.scale.set(0.92, 1.08, 1);
  ink(hd, 0.015);
  head.add(hd);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.03, 0.02), skin);
  nose.position.set(0, -0.005, headR * 0.98);
  head.add(nose);
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.01, 0.006), basic(0x111111));
    e.position.set(sx * headR * 0.36, headR * 0.18, headR * 0.92);
    head.add(e);
  }
  const hairMat = toon(p.hairColor);
  if (p.hat === 'tudung') {
    const t = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.12, 12, 10), toon(p.hatColor));
    t.scale.set(0.95, 1.1, 1.02);
    t.position.z = -0.008;
    head.add(t);
    const dr = new THREE.Mesh(
      new THREE.ConeGeometry(0.16 * b, 0.2 * H, 10, 1, true),
      toon(p.hatColor),
    );
    dr.position.y = -headR * 1.1;
    head.add(dr);
    const face = new THREE.Mesh(new THREE.CircleGeometry(headR * 0.62, 12), skin);
    face.position.set(0, -0.004, headR * 1.1);
    head.add(face);
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.01, 0.006), basic(0x111111));
      e.position.set(sx * headR * 0.3, headR * 0.12, headR * 1.12);
      head.add(e);
    }
  } else {
    if (p.style !== 'none') {
      const cap0 = new THREE.Mesh(
        new THREE.SphereGeometry(headR * 1.06, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat,
      );
      cap0.position.y = 0.006;
      cap0.rotation.x = -0.25;
      head.add(cap0);
      if (p.style === 'long') {
        const bk = new THREE.Mesh(
          new THREE.BoxGeometry(headR * 1.7, headR * 2.2, headR * 0.5),
          hairMat,
        );
        bk.position.set(0, -headR * 0.7, -headR * 0.75);
        head.add(bk);
      }
      if (p.style === 'bun') {
        const bn = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.45, 8, 6), hairMat);
        bn.position.set(0, headR * 0.5, -headR * 0.95);
        head.add(bn);
      }
      if (p.style === 'bob') {
        const bk = new THREE.Mesh(
          new THREE.CylinderGeometry(headR * 1.08, headR * 1.12, headR * 1.1, 12, 1, true),
          hairMat,
        );
        bk.position.y = -headR * 0.15;
        head.add(bk);
      }
      if (p.style === 'perm') {
        const pm = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.22, 9, 7), hairMat);
        pm.position.set(0, headR * 0.25, -headR * 0.15);
        pm.scale.set(1, 0.8, 1);
        head.add(pm);
      }
      if (p.style === 'slick') {
        cap0.scale.set(1, 0.85, 1.1);
      }
    }
    if (p.hat === 'songkok') {
      const s = new THREE.Mesh(
        new THREE.CylinderGeometry(headR * 0.95, headR * 1.0, headR * 0.85, 14),
        toon(0x111111),
      );
      s.position.y = headR * 0.75;
      head.add(s);
    }
    if (p.hat === 'fedora') {
      const br = new THREE.Mesh(
        new THREE.CylinderGeometry(headR * 1.75, headR * 1.75, 0.012, 16),
        toon(p.hatColor),
      );
      br.position.y = headR * 0.62;
      head.add(br);
      const cr = new THREE.Mesh(
        new THREE.CylinderGeometry(headR * 0.95, headR * 1.05, headR * 0.8, 14),
        toon(p.hatColor),
      );
      cr.position.y = headR * 1.0;
      head.add(cr);
      const bd = new THREE.Mesh(
        new THREE.CylinderGeometry(headR * 1.06, headR * 1.06, headR * 0.18, 14),
        toon(0x111111),
      );
      bd.position.y = headR * 0.75;
      head.add(bd);
    }
    if (p.hat === 'cap') {
      const c = new THREE.Mesh(
        new THREE.SphereGeometry(headR * 1.08, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
        toon(p.accent),
      );
      c.position.y = 0.01;
      head.add(c);
      const v = new THREE.Mesh(
        new THREE.BoxGeometry(headR * 1.3, 0.01, headR * 0.8),
        toon(p.accent),
      );
      v.position.set(0, headR * 0.25, headR * 1.05);
      head.add(v);
    }
    if (p.hat === 'police') {
      const c = new THREE.Mesh(
        new THREE.CylinderGeometry(headR * 1.25, headR * 1.0, headR * 0.6, 14),
        toon(0x1d2a4d),
      );
      c.position.y = headR * 0.85;
      head.add(c);
      const v = new THREE.Mesh(
        new THREE.BoxGeometry(headR * 1.3, 0.012, headR * 0.7),
        toon(0x111111),
      );
      v.position.set(0, headR * 0.55, headR * 1.0);
      head.add(v);
    }
    if (p.hat === 'nurse') {
      const c = new THREE.Mesh(
        new THREE.BoxGeometry(headR * 1.2, headR * 0.45, headR * 0.9),
        toon(0xffffff),
      );
      c.position.y = headR * 0.95;
      head.add(c);
    }
  }
  // arms
  const sleeve = ['singlet', 'saree'].includes(p.outfit) ? skin : top;
  const mkArm = (sx: number) => {
    const sh = new THREE.Group();
    sh.position.set(sx * (0.125 * b + 0.02), torsoL - 0.02, 0);
    sh.rotation.z = sx * 0.07;
    torso.add(sh);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * b, 0.027 * b, upper, 6), sleeve);
    up.position.y = -upper / 2;
    sh.add(up);
    const el = new THREE.Group();
    el.position.y = -upper;
    sh.add(el);
    const fo = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026 * b, 0.022 * b, fore, 6),
      ['shirt', 'singlet', 'apron', 'dress', 'cheongsam'].includes(p.outfit) ? skin : sleeve,
    );
    fo.position.y = -fore / 2;
    el.add(fo);
    const hand = new THREE.Group();
    hand.position.y = -fore;
    el.add(hand);
    const hm = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), skin);
    hand.add(hm);
    return [sh, el, hand];
  };
  const [shL, elL, handL] = mkArm(-1),
    [shR, elR, handR] = mkArm(1);
  // things they carry
  if (p.acc === 'briefcase') {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.17, 0.24), toon(0x3a2418));
    c.position.y = -0.09;
    ink(c, 0.015);
    handL.add(c);
  }
  if (p.acc === 'basket') {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.1, 10), toon(0x9b7a4a));
    c.position.y = -0.05;
    ink(c, 0.015);
    handL.add(c);
    const fill = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
      toon(p.job === 'flower seller' ? 0xd23a5a : 0x6fa04a),
    );
    fill.position.y = 0;
    handL.add(fill);
  }
  if (p.acc === 'newspaper') {
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.14), toon(0xd8d2c4));
    n.position.set(0.02, -0.04, 0);
    handL.add(n);
  }
  if (p.acc === 'books') {
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.12), toon(p.accent));
    n.position.set(0.02, -0.03, 0);
    handL.add(n);
  }
  if (p.acc === 'bag') {
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.15), toon(0x4a3426));
    n.position.set(0, -0.08, 0);
    handL.add(n);
  }
  let umb: THREE.Group | null = null;
  if (p.umbrella) {
    umb = new THREE.Group();
    umb.position.set(0.04, shY + 0.22 * H, 0.06);
    body.add(umb);
    const cn = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.2, 10), toon(p.accent));
    cn.position.y = 0.22;
    ink(cn, 0.02);
    umb.add(cn);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4), toon(0x16171a));
    pole.position.y = 0;
    umb.add(pole);
  }
  let ember: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null = null;
  if (p.smoker) {
    ember = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 5, 4),
      new THREE.MeshBasicMaterial({ color: 0xff7a2a }),
    );
    ember.position.set(0, -0.01, 0.03);
    handR.add(ember);
    ember.visible = false;
  }
  torso.rotation.x = p.hunch;
  return {
    root,
    body,
    torso,
    head,
    hipL,
    hipR,
    kneeL,
    kneeR,
    shL,
    shR,
    elL,
    elR,
    umb,
    ember,
    eye: shY + neck + headR,
  };
}

export function createNPC(seed: number, overrides?: ProfileOverrides) {
  const rng = mulberry(seed * 7919 + 13);
  const profile = generateProfile(rng, overrides || {});
  const rig = buildRig(profile);
  return { profile, rig };
}

export const CROSS = [-11.6, -2.6, 2.6, 11.6];
export function makeWalkers(rand: Rng) {
  G.walkers = [];
  const pickMat = new THREE.MeshBasicMaterial();
  // a few fixed characters for the street's regulars; everyone else is generated
  const regulars: ProfileOverrides[] = [
    { job: 'reporter at Warta Malam', gender: 'm', community: 'chinese', temper: 'cynical' },
    { job: 'kuih seller', community: 'malay', gender: 'f', age: 58 },
    { job: 'beat constable' },
  ];
  const count = G.mobile ? 14 : 22;
  for (let k = 0; k < count; k++) {
    const npc = createNPC(1000 + k * 37, regulars[k]);
    const g = npc.rig.root;
    const pk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.8, 6), pickMat);
    pk.visible = false;
    pk.position.y = 0.9;
    g.add(pk);
    const axis = k % 2 ? 'x' : 'z',
      c = CROSS[k % 4];
    const p = rnd(-13, 13);
    if (axis === 'x') g.position.set(p, 0.2, c);
    else g.position.set(c, 0.2, p);
    G.scene.add(g);
    const w: Walker = {
      g,
      rig: npc.rig,
      profile: npc.profile,
      axis,
      dir: rand() < 0.5 ? -1 : 1,
      v: npc.profile.pace,
      bob: rand() * 6,
      pause: 0,
      idle: null,
      pick: pk,
      idx: k,
      recent: [],
      thoughts: 0,
      followed: 0,
    };
    pk.userData.walker = w;
    G.walkers.push(w);
  }
}
export function lerpTo(o: { x: number; y: number }, prop: 'x' | 'y', v: number, k: number) {
  o[prop] += (v - o[prop]) * k;
}
export function animateRig(w: Walker, dt: number, time: number, moving: boolean) {
  const r = w.rig,
    p = w.profile,
    k = Math.min(1, dt * 8);
  if (moving) {
    const ph = w.bob,
      a = p.stride;
    r.hipL.rotation.x = Math.sin(ph) * a;
    r.hipR.rotation.x = -Math.sin(ph) * a;
    r.kneeL.rotation.x = Math.max(0, -Math.cos(ph)) * a * 1.5;
    r.kneeR.rotation.x = Math.max(0, Math.cos(ph)) * a * 1.5;
    const carryL = p.acc && p.acc !== null;
    lerpTo(r.shL.rotation, 'x', carryL ? Math.sin(ph) * a * 0.25 : -Math.sin(ph) * a * 0.8, k);
    lerpTo(r.elL.rotation, 'x', carryL ? 0 : -0.25, k);
    if (p.umbrella) {
      lerpTo(r.shR.rotation, 'x', -0.75, k);
      lerpTo(r.elR.rotation, 'x', -1.1, k);
    } else {
      lerpTo(r.shR.rotation, 'x', Math.sin(ph) * a * 0.8, k);
      lerpTo(r.elR.rotation, 'x', -0.25, k);
    }
    r.body.position.y = Math.abs(Math.cos(ph)) * 0.022;
    r.torso.rotation.y = Math.sin(ph) * 0.07;
    lerpTo(r.head.rotation, 'y', 0, k * 0.5);
    if (r.ember) r.ember.visible = false;
  } else {
    (['hipL', 'hipR', 'kneeL', 'kneeR'] as const).forEach((n) => lerpTo(r[n].rotation, 'x', 0, k));
    lerpTo(r.shL.rotation, 'x', 0, k);
    lerpTo(r.elL.rotation, 'x', -0.1, k);
    r.body.position.y = 0;
    r.torso.rotation.y *= 0.9;
    if (w.idle === 'smoke' && !p.umbrella) {
      const puff = (Math.sin(time * 1.1 + w.idx) + 1) / 2;
      lerpTo(r.shR.rotation, 'x', -0.5 - puff * 0.7, k);
      lerpTo(r.elR.rotation, 'x', -1.6 * puff - 0.3, k);
      if (r.ember) {
        r.ember.visible = true;
        r.ember.material.color.setHex(0xff7a2a).multiplyScalar(1 + puff * 1.5);
      }
      lerpTo(r.head.rotation, 'y', Math.sin(time * 0.3 + w.idx) * 0.3, k * 0.3);
    } else {
      if (p.umbrella) {
        lerpTo(r.shR.rotation, 'x', -0.75, k);
        lerpTo(r.elR.rotation, 'x', -1.1, k);
      } else {
        lerpTo(r.shR.rotation, 'x', 0, k);
        lerpTo(r.elR.rotation, 'x', -0.1, k);
      }
      lerpTo(r.head.rotation, 'y', Math.sin(time * 0.6 + w.idx * 1.7) * 0.75, k * 0.3);
    }
  }
}
export function npcStep(w: Walker, dt: number, vis: number, time: number) {
  const pos = w.g.position;
  if (w.pause > 0) {
    w.pause -= dt * vis;
    animateRig(w, dt, time, false);
    return;
  }
  const key = w.axis,
    prev = pos[key];
  pos[key] += w.dir * w.v * dt * vis;
  w.bob += dt * w.v * 7.5 * vis;
  for (const c2 of CROSS) {
    if ((prev - c2) * (pos[key] - c2) < 0 && Math.random() < 0.4) {
      pos[key] = c2;
      w.axis = key === 'x' ? 'z' : 'x';
      w.dir = Math.random() < 0.5 ? -1 : 1;
      break;
    }
  }
  const k2 = w.axis;
  if (Math.abs(pos[k2]) > 13) {
    pos[k2] = Math.sign(pos[k2]) * 13;
    w.dir = -w.dir;
  }
  pos.y = 0.2;
  const yaw = w.axis === 'x' ? (w.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : w.dir > 0 ? 0 : Math.PI;
  w.g.rotation.y += angDiff(w.g.rotation.y, yaw) * Math.min(1, dt * 6);
  if (vis > 0 && Math.random() < dt * vis * 0.045) {
    w.pause = rnd(2, 6);
    w.idle = w.profile.smoker && Math.random() < 0.55 ? 'smoke' : 'look';
  }
  animateRig(w, dt, time, true);
}

export function angDiff(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
