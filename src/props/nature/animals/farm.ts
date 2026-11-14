/** Farm and riding animals: goat, donkey with panniers, pony, horse (rideable), sheep, piglet. */
import { type Geo, box, merge, tintable, translate } from '../../../core/geo';
import { type Q, type V3, ell, ellR, hiOnly, limb, pair } from '../kit';
import { type Pose, type Species, STAND, quadruped } from './rig';

const WALK: Pose = {
  ...STAND,
  feet: [
    [0.22, 0],
    [-0.1, 0.08],
    [-0.18, 0],
    [0.15, 0.06],
  ],
};

export const HORSE: Species = {
  body: [0.72, 0.27, 0.32],
  legLen: 0.92,
  legR: 0.06,
  headR: 0.14,
  neck: [0.42, 0.28],
  snout: [0.3, 0.1],
  ear: 'up',
  earSize: 0.6,
  tail: 'long',
  tailLen: 0.6,
  coat: 'timber',
  accent: 'cocoa',
  headSize: 'tiny',
};

export const PONY: Species = {
  ...HORSE,
  body: [0.5, 0.2, 0.25],
  legLen: 0.5,
  legR: 0.05,
  headR: 0.12,
  neck: [0.26, 0.18],
  snout: [0.2, 0.085],
  tailLen: 0.45,
  coat: 'butterLight',
};

export const DONKEY: Species = {
  ...PONY,
  body: [0.48, 0.2, 0.24],
  legLen: 0.55,
  neck: [0.2, 0.2],
  legSeg: 3,
  ear: 'long',
  earSize: 1.3,
  tail: 'long',
  coat: 'stone',
  accent: 'slate',
};

export const GOAT: Species = {
  body: [0.36, 0.14, 0.17],
  legLen: 0.42,
  legR: 0.03,
  headR: 0.09,
  neck: [0.18, 0.1],
  snout: [0.1, 0.05],
  ear: 'drop',
  tail: 'up',
  tailLen: 0.08,
  headSize: 'tiny',
  coat: 'ivory',
  accent: 'clayDeep',
};

export const SHEEP: Species = {
  body: [0.38, 0.25, 0.26],
  bodySize: 'mid',
  headSize: 'tiny',
  legSeg: 3,
  legLen: 0.3,
  legR: 0.028,
  headR: 0.1,
  neck: [0.08, 0.1],
  snout: [0.08, 0.06],
  ear: 'drop',
  earSize: 0.8,
  tail: 'stub',
  coat: 'ivory',
  accent: 'cocoa',
  legCol: 'cocoa',
  faceCol: 'cocoa',
  eye: 'ivory',
};

export const PIGLET: Species = {
  body: [0.22, 0.13, 0.13],
  bodySize: 'small',
  legLen: 0.08,
  legR: 0.028,
  headR: 0.1,
  neck: [0.02, 0.06],
  snout: [0.06, 0.055],
  ear: 'up',
  earSize: 0.7,
  tail: 'curl',
  tailLen: 0.08,
  coat: 'coralLight',
  accent: 'coral',
};

/** Mane ridge along the neck plus forelock (HI); one ridge blob in LO. */
function mane(q: Q, base: V3, head: V3, col: 'cocoa' | 'ivory' | 'timberDeep'): Geo {
  const mid: V3 = [0, (base[1] + head[1]) / 2 + 0.08, (base[2] + head[2]) / 2 - 0.05];
  const tilt = Math.atan2(head[2] - base[2], head[1] - base[1]);
  return ellR(q, q.hi ? 'tiny' : 'nub', mid, [0.05, Math.hypot(head[1] - base[1], head[2] - base[2]) * 0.6, 0.07], [tilt, 0, 0], col);
}

/** Rideable standing horse; returns the saddle seat height too. */
export function horse(q: Q): Geo {
  const r = quadruped(q, HORSE, { ...STAND, head: [-0.35, 0], tailUp: -1.1 });
  const back: V3 = [0, r.centre[1] + HORSE.body[2] * 0.95, 0];
  const saddle = hiOnly(q, () => [
    translate(box(0.62, 0.04, 0.5, 'coral'), 0, back[1] - 0.04, -0.02),
    translate(box(0.4, 0.06, 0.36, 'cocoa'), 0, back[1] - 0.01, 0),
  ]);
  return merge(r.geo, mane(q, [0, r.centre[1] + 0.2, 0.55], r.head, 'cocoa'), saddle);
}

/** Saddle (hip) seat height of the standing horse. */
export const HORSE_SEAT_Y = (HORSE.legLen + HORSE.body[2] * 0.55) + HORSE.body[2] * 0.95 + 0.05;

export function pony(q: Q): Geo {
  const r = quadruped(q, PONY, { ...WALK, head: [-0.25, 0.2], tailUp: -1.0 });
  return merge(r.geo, mane(q, [0, r.centre[1] + 0.15, 0.4], r.head, 'ivory'));
}

export function donkeyPanniers(q: Q): Geo {
  const r = quadruped(q, DONKEY, { ...STAND, head: [-0.2, 0], tailUp: -1.1 });
  const y = r.centre[1];
  const bw = DONKEY.body[1] + 0.08;
  const baskets = q.hi
    ? [...pair((s) => translate(box(0.14, 0.32, 0.4, 'butterDeep'), s * bw, y - 0.2, 0)), translate(box(bw * 2, 0.05, 0.5, 'coral'), 0, y + DONKEY.body[2] * 0.8, 0)]
    : [translate(box(bw * 2 + 0.14, 0.32, 0.4, 'butterDeep'), 0, y - 0.2, 0)];
  return merge(r.geo, baskets);
}

export function goat(q: Q): Geo {
  const r = quadruped(q, GOAT, { ...STAND, head: [0.15, 0] });
  const h = r.head;
  const horns = hiOnly(q, () =>
    pair((s) => limb([h[0] + s * 0.04, h[1] + 0.07, h[2] - 0.02], [h[0] + s * 0.07, h[1] + 0.16, h[2] - 0.12], 0.018, 0.006, 'clayDeep', 4)),
  );
  const beard = hiOnly(q, () => ell(q, 'nub', h[0], h[1] - 0.1, h[2] + 0.1, 0.025, 0.05, 0.025, 'ivoryShade'));
  return merge(r.geo, horns, beard);
}

export function sheep(q: Q): Geo {
  const r = quadruped(q, SHEEP, { ...STAND, head: [-0.1, 0] });
  const topknot = hiOnly(q, () => tintable(ell(q, 'nub', r.head[0], r.head[1] + 0.08, r.head[2] - 0.02, 0.07, 0.05, 0.07, 'ivory')));
  return merge(r.geo, topknot);
}

export function piglet(q: Q): Geo {
  const r = quadruped(q, PIGLET, { ...STAND, head: [0, 0] });
  return r.geo;
}
