/**
 * Percussion, seated instruments, conductor, singer and the street-organ grinder.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_REST, HANDS_CHEST, SEAT, key, level, merge } from './helpers';

/* ---- snare: a stick in each hand, drum slung at the waist; tilt < 0 lifts the stick tips ---- */
const STICK: LimbPose = { fwd: 22, out: 20, twist: -30, bend: 78 };
const stickUp = (a: LimbPose, h: number): LimbPose => ({ ...a, fwd: (a.fwd ?? 0) + 6 * h, bend: (a.bend ?? 0) + 22 * h });
export const snareHit = (left: number, right: number, extra: Pose = {}): Pose =>
  merge(
    {
      armL: stickUp(STICK, left),
      armR: stickUp(STICK, right),
      gripL: level(stickUp(STICK, left), -30 * left),
      gripR: level(stickUp(STICK, right), -30 * right),
      head: { nod: 14 },
    },
    extra,
  );

const drums: readonly ClipDef[] = [
  {
    id: 'drum.snare',
    duration: 1.6,
    keys: [
      key(0, snareHit(0, 1)),
      key(0.12, snareHit(1, 0, { head: { nod: 18 } })),
      key(0.25, snareHit(0, 1)),
      key(0.37, snareHit(1, 0)),
      key(0.5, snareHit(0.2, 1.3, { spine: { lean: -2 } })),
      key(0.62, snareHit(0.1, 0, { head: { nod: 20 }, spine: { lean: 3 } })),
      key(0.75, snareHit(1, 0.2)),
      key(0.87, snareHit(0.3, 0.3, { head: { turn: 8 } })),
    ],
  },
  {
    id: 'drum.roll',
    duration: 0.6,
    keys: [
      key(0, snareHit(0.1, 0.6, { root: { y: -0.01 } })),
      key(0.25, snareHit(0.6, 0.1)),
      key(0.5, snareHit(0.1, 0.6, { head: { nod: 17 } })),
      key(0.75, snareHit(0.6, 0.1, { root: { y: -0.01 } })),
    ],
  },
];

/* ---- big bass drum worn on the chest, heads facing sideways; beater in the right hand ---- */
const BD_HOLD: LimbPose = { fwd: 40, out: 20, twist: -24, bend: 84 };
const BEAT_BACK: LimbPose = { fwd: 34, out: 62, twist: 10, bend: 84 };
const BEAT_HIT: LimbPose = { fwd: 40, out: 32, twist: -10, bend: 66 };
const bassDrum: readonly ClipDef[] = [
  {
    id: 'drum.bass',
    duration: 2.0,
    base: { spine: { lean: -6 }, armL: BD_HOLD },
    keys: [
      key(0, { armR: BEAT_BACK, gripR: level(BEAT_BACK, -20), spine: { twist: -4 }, root: { y: -0.01 } }),
      key(0.12, { armR: BEAT_HIT, gripR: level(BEAT_HIT, 10), spine: { twist: 4 }, head: { nod: 6 }, root: { y: -0.03 } }),
      key(0.3, { armR: { ...BEAT_BACK, out: 48 }, gripR: level(BEAT_BACK, -10) }),
      key(0.42, { armR: BEAT_HIT, gripR: level(BEAT_HIT, 10), head: { nod: 3 } }),
      key(0.55, { armR: { ...BEAT_BACK, out: 46 }, gripR: level(BEAT_BACK, -10) }),
      key(0.67, { armR: BEAT_HIT, gripR: level(BEAT_HIT, 10), head: { nod: 3, turn: -8 } }),
      key(0.85, { armR: { ...BEAT_BACK, out: 70, fwd: 40 }, gripR: level(BEAT_BACK, -30), spine: { twist: -8 }, head: { nod: -4 } }),
    ],
  },
  {
    id: 'drum.bass-march',
    duration: 1.2,
    base: { spine: { lean: -6 }, armL: BD_HOLD },
    keys: [
      key(0, { armR: BEAT_HIT, gripR: level(BEAT_HIT, 10), legL: { fwd: 30, bend: 40 }, footL: -10, root: { y: -0.01 } }),
      key(0.25, { armR: BEAT_BACK, gripR: level(BEAT_BACK, -20), root: { y: 0.01 } }),
      key(0.5, { armR: BEAT_HIT, gripR: level(BEAT_HIT, 10), legR: { fwd: 30, bend: 40 }, footR: -10, root: { y: -0.01 } }),
      key(0.75, { armR: BEAT_BACK, gripR: level(BEAT_BACK, -20), root: { y: 0.01 } }),
    ],
  },
];

/* ---- cymbals: one in each hand, faces toward each other ---- */
const CY_APART: LimbPose = { fwd: 50, out: 28, twist: -8, bend: 80 };
const CY_WIDE: LimbPose = { fwd: 62, out: 46, twist: 6, bend: 72 };
const CY_CRASH: LimbPose = { fwd: 54, out: 8, twist: -44, bend: 92 };
const CY_FLARE: LimbPose = { fwd: 122, out: 52, twist: 10, bend: 30 };
const cy = (a: LimbPose, extra: Pose = {}): Pose =>
  merge({ armL: a, armR: a, gripL: level(a), gripR: level(a) }, extra);
const cymbal: ClipDef = {
  id: 'cymbal.crash',
  duration: 2.8,
  keys: [
    key(0, cy(CY_APART)),
    key(0.2, cy(CY_WIDE, { spine: { lean: -4 }, head: { nod: -4 } })),
    key(0.28, cy(CY_CRASH, { spine: { lean: 4 }, root: { y: -0.03 }, legL: { fwd: 10, bend: 22 }, legR: { fwd: 10, bend: 22 } })),
    key(0.42, cy(CY_FLARE, { spine: { lean: -6 }, head: { nod: -12 } })),
    key(0.62, cy({ ...CY_FLARE, fwd: 116 }, { spine: { lean: -5 }, head: { nod: -10, turn: 10 } })),
    key(0.82, cy({ ...CY_APART, fwd: 40 })),
  ],
};

/* ---- seated: harp, piano, cello ---- */
const HARP_L: LimbPose = { fwd: 62, out: 6, twist: -20, bend: 60 };
const HARP_R: LimbPose = { fwd: 50, out: 12, twist: -30, bend: 78 };
const harp: ClipDef = {
  id: 'harp.pluck',
  duration: 3.6,
  base: merge(SEAT, { spine: { lean: 8 }, head: { tilt: -6, turn: -6 } }),
  keys: [
    key(0, { armL: HARP_L, armR: HARP_R }),
    key(0.15, { armL: { ...HARP_L, bend: 70 }, armR: { ...HARP_R, out: 18 } }),
    key(0.3, { armL: { ...HARP_L, fwd: 52, bend: 66 }, armR: { ...HARP_R, fwd: 42, bend: 84 }, head: { nod: 6 } }),
    key(0.45, { armL: { ...HARP_L, fwd: 44, bend: 72 }, armR: { ...HARP_R, fwd: 34, bend: 88 }, spine: { lean: 4 } }),
    key(0.6, { armL: { ...HARP_L, fwd: 70, bend: 54 }, armR: { ...HARP_R, fwd: 58, bend: 70 }, head: { nod: -4 } }),
    key(0.8, { armL: { ...HARP_L, bend: 64 }, armR: { ...HARP_R, out: 20, bend: 72 } }),
  ],
};

const KEYS: LimbPose = { fwd: 36, out: 14, twist: -22, bend: 74 };
const keysAt = (shift: number, lift = 0): Pose => ({
  armL: { ...KEYS, out: (KEYS.out ?? 0) + Math.max(0, -shift) * 18, fwd: (KEYS.fwd ?? 0) + lift, bend: (KEYS.bend ?? 0) + lift },
  armR: { ...KEYS, out: (KEYS.out ?? 0) + Math.max(0, shift) * 18, fwd: (KEYS.fwd ?? 0) + lift, bend: (KEYS.bend ?? 0) + lift },
  spine: { twist: -shift * 8, side: shift * 3 },
});
const piano: readonly ClipDef[] = [
  {
    id: 'piano.play',
    duration: 3.2,
    base: SEAT,
    keys: [
      key(0, keysAt(0)),
      key(0.18, merge(keysAt(-0.6), { head: { nod: 8 } })),
      key(0.34, keysAt(0.2)),
      key(0.5, merge(keysAt(0.9), { head: { turn: -8 } })),
      key(0.62, merge(keysAt(0.4, 14), { head: { nod: -4 }, spine: { lean: -4 } })),
      key(0.72, keysAt(0.3)),
      key(0.88, merge(keysAt(-0.2), { spine: { lean: 6 } })),
    ],
  },
  {
    id: 'piano.flourish',
    duration: 4.4,
    base: SEAT,
    keys: [
      key(0, keysAt(-0.8)),
      key(0.2, keysAt(0.9)),
      key(0.3, merge(keysAt(0.6, 36), { spine: { lean: -8 }, head: { nod: -14 } })),
      key(0.42, merge(keysAt(0.2), { spine: { lean: 8 }, head: { nod: 10 } })),
      key(0.62, merge(keysAt(-0.4), { spine: { lean: 5 } })),
      key(0.8, merge(keysAt(0, 6), { head: { turn: 14 } })),
    ],
  },
];

const CELLO_L: LimbPose = { fwd: 52, out: 24, twist: -22, bend: 108 };
const CB_FROG: LimbPose = { fwd: 28, out: 22, twist: -45, bend: 88 };
const CB_TIP: LimbPose = { fwd: 20, out: 62, twist: -5, bend: 36 };
const cello: ClipDef = {
  id: 'cello.bow',
  duration: 3.0,
  base: merge(SEAT, {
    legL: { fwd: 80, out: 22, bend: 84 },
    legR: { fwd: 80, out: 22, bend: 84 },
    spine: { lean: 6 },
    head: { tilt: 10, turn: 10 },
  }),
  keys: [
    key(0, { armL: CELLO_L, armR: CB_FROG, gripR: level(CB_FROG) }),
    key(0.45, { armL: { ...CELLO_L, fwd: 46, bend: 112 }, armR: CB_TIP, gripR: level(CB_TIP), spine: { side: -3 } }),
    key(0.53, { armL: { ...CELLO_L, fwd: 46, bend: 112 }, armR: { ...CB_TIP, bend: 40 }, gripR: level(CB_TIP) }),
    key(0.95, { armL: CELLO_L, armR: { ...CB_FROG, bend: 84 }, gripR: level(CB_FROG), spine: { side: 2 } }),
  ],
};

/* ---- conductor: baton in the right hand follows the forearm (no grip correction) ---- */
const B_DOWN: LimbPose = { fwd: 58, out: 14, twist: -10, bend: 36 };
const B_IN: LimbPose = { fwd: 70, out: 4, twist: -42, bend: 70 };
const B_OUT: LimbPose = { fwd: 76, out: 46, twist: 6, bend: 30 };
const B_UP: LimbPose = { fwd: 124, out: 22, twist: -10, bend: 52 };
const conductor: readonly ClipDef[] = [
  {
    id: 'conductor.baton',
    duration: 5.6,
    keys: [
      key(0, { armR: B_UP, armL: { fwd: 30, out: 20, bend: 70 }, head: { nod: -2 } }),
      key(0.08, { armR: B_DOWN, armL: { fwd: 34, out: 22, bend: 66 }, root: { y: -0.015 } }),
      key(0.16, { armR: B_IN, armL: { fwd: 40, out: 24, bend: 64 } }),
      key(0.24, { armR: B_OUT, armL: { fwd: 46, out: 30, bend: 60 }, spine: { twist: -6 } }),
      key(0.32, { armR: B_UP, armL: { fwd: 70, out: 34, bend: 50 }, spine: { lean: -4 } }),
      key(0.44, { armR: { ...B_UP, fwd: 160, out: 30 }, armL: { fwd: 160, out: 34, bend: 30 }, spine: { lean: -8 }, head: { nod: -12 } }),
      key(0.54, { armR: { ...B_DOWN, fwd: 76, out: 30 }, armL: { fwd: 80, out: 40, bend: 20 }, spine: { lean: 10 }, root: { y: -0.04 }, legL: { fwd: 12, bend: 26 }, legR: { fwd: 12, bend: 26 } }),
      key(0.68, { armR: { ...B_IN, bend: 80 }, armL: { fwd: 64, out: 8, twist: 60, bend: 40 }, spine: { lean: 14 }, head: { nod: 10, turn: -14 }, root: { y: -0.05 }, legL: { fwd: 14, bend: 30 }, legR: { fwd: 14, bend: 30 } }),
      key(0.8, { armR: { ...B_OUT, fwd: 90 }, armL: { fwd: 50, out: 30, bend: 50 }, spine: { lean: 2, twist: 8 }, head: { turn: 12 } }),
      key(0.9, { armR: B_DOWN, armL: { fwd: 30, out: 20, bend: 70 } }),
    ],
  },
  {
    id: 'conductor.gentle',
    duration: 2.4,
    base: { armL: { fwd: 24, out: 14, bend: 62 } },
    keys: [
      key(0, { armR: B_UP, head: { nod: -2 } }),
      key(0.3, { armR: B_DOWN, root: { y: -0.01 } }),
      key(0.6, { armR: B_OUT, head: { turn: -8 } }),
      key(0.8, { armR: { ...B_UP, fwd: 110 } }),
    ],
  },
];

/* ---- singer ---- */
const WIDE: LimbPose = { fwd: 52, out: 68, twist: 30, bend: 20 };
const HEART: LimbPose = { fwd: 30, out: 6, twist: -55, bend: 120 };
const singer: readonly ClipDef[] = [
  {
    id: 'singer.wide',
    duration: 5.0,
    keys: [
      key(0, { armL: ARM_REST, armR: ARM_REST, spine: { lean: 4 }, head: { nod: 6 } }),
      key(0.12, { armL: HANDS_CHEST, armR: HANDS_CHEST, spine: { lean: -2 }, head: { nod: 0 } }),
      key(0.3, { armL: WIDE, armR: WIDE, spine: { lean: -6 }, head: { nod: -14 }, root: { y: 0.01 }, footL: 8, footR: 8 }),
      key(0.5, { armL: { ...WIDE, fwd: 60 }, armR: { ...WIDE, fwd: 60 }, spine: { lean: -7 }, head: { nod: -16, tilt: 4 } }),
      key(0.62, { armL: HEART, armR: { ...WIDE, fwd: 70, out: 40 }, spine: { lean: 0 }, head: { nod: 4, turn: -10 } }),
      key(0.82, { armL: HEART, armR: { fwd: 84, out: 30, twist: 40, bend: 14 }, head: { nod: -4, turn: -16 }, spine: { twist: -6 } }),
    ],
  },
  {
    id: 'singer.heart',
    duration: 4.2,
    base: { armL: HEART },
    keys: [
      key(0, { armR: ARM_REST, head: { nod: 4 } }),
      key(0.3, { armR: { fwd: 70, out: 40, twist: 30, bend: 30 }, head: { nod: -10, tilt: 6 }, spine: { lean: -4 } }),
      key(0.55, { armR: { fwd: 96, out: 30, twist: 40, bend: 16 }, head: { nod: -12, tilt: -4 }, spine: { lean: -5, side: 3 } }),
      key(0.8, { armR: { fwd: 40, out: 24, twist: 20, bend: 50 }, head: { nod: 6 } }),
    ],
  },
];

/* ---- street organ: right hand turns the crank in a vertical circle ---- */
const CRANK = [
  { fwd: 50, out: 20, twist: -6, bend: 66 },
  { fwd: 46, out: 20, twist: -6, bend: 30 },
  { fwd: 22, out: 20, twist: -6, bend: 38 },
  { fwd: 24, out: 20, twist: -6, bend: 84 },
] as const;
const crankKeys = (n: number, head: (i: number) => Pose): ClipDef['keys'] =>
  Array.from({ length: n * 4 }, (_, i) =>
    key(i / (n * 4), merge({ armR: CRANK[i % 4] ?? CRANK[0] }, head(i))),
  );
const organ: readonly ClipDef[] = [
  {
    id: 'organ.crank',
    duration: 3.2,
    ease: 'linear',
    base: { armL: { fwd: 40, out: 10, twist: -10, bend: 50 }, spine: { lean: 4 } },
    keys: crankKeys(2, (i) => ({ head: { turn: i < 4 ? 12 : -14, nod: i % 4 === 2 ? 4 : 0 } })),
  },
  {
    id: 'organ.crank-sing',
    duration: 4.0,
    ease: 'linear',
    base: { armL: { fwd: 40, out: 10, twist: -10, bend: 50 } },
    keys: crankKeys(2, (i) => ({ head: { nod: i < 4 ? -10 : 2, tilt: i < 4 ? 6 : -6 }, spine: { side: i < 4 ? 3 : -3 } })),
  },
];

export const MUSIC_B_CLIPS: readonly ClipDef[] = [
  ...drums,
  ...bassDrum,
  cymbal,
  harp,
  ...piano,
  cello,
  ...conductor,
  ...singer,
  ...organ,
];
