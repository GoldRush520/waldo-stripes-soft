/**
 * Standing musicians: guitar, violin, trumpet, trombone, accordion, flute, tuba. Each loop is a
 * short musical phrase (lead-in, accent, hold, breath) rather than an even wiggle.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { add, key, level, merge } from './helpers';

/* ---- guitar (strap guitar on the body; left hand frets the neck to the player's left) ---- */
const FRET: LimbPose = { fwd: 32, out: 30, twist: 15, bend: 76 };
const STRUM_UP: LimbPose = { fwd: 24, out: 14, twist: -46, bend: 94 };
const STRUM_DN: LimbPose = { fwd: 14, out: 16, twist: -28, bend: 70 };

const strum = (i: number, sway: number): Pose => ({
  armL: add(FRET, { bend: i % 4 === 0 ? 6 : 0 }),
  armR: i % 2 === 0 ? STRUM_UP : STRUM_DN,
  head: { nod: i % 2 === 0 ? 2 : 7, turn: i < 4 ? 4 : -6 },
  spine: { side: i < 4 ? sway : -sway },
  footL: i % 2 === 0 ? 0 : -14,
});

const guitar: readonly ClipDef[] = [
  {
    id: 'guitar.strum',
    duration: 2.0,
    keys: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => key(i / 8, strum(i, 2))),
  },
  {
    id: 'guitar.busk',
    duration: 3.6,
    base: { spine: { lean: -3 } },
    keys: [
      ...[0, 1, 2, 3, 4, 5].map((i) => key(i / 10, merge(strum(i, 5), { root: { x: i < 3 ? 0.02 : -0.02 } }))),
      key(0.62, merge(strum(1, 0), { head: { nod: -14, turn: 0 }, spine: { lean: -6 } })),
      key(0.8, merge(strum(0, 0), { head: { nod: -10, turn: 12 }, root: { roll: 2 } })),
      key(0.9, merge(strum(1, 3), { head: { nod: 4 } })),
    ],
  },
];

/* ---- violin (left hand holds the neck forward-left at shoulder height, chin on the instrument) ---- */
const V_NECK: LimbPose = { fwd: 72, out: 38, twist: 10, bend: 70 };
const BOW_FROG: LimbPose = { fwd: 56, out: 30, twist: -36, bend: 112 };
const BOW_TIP: LimbPose = { fwd: 48, out: 60, twist: -10, bend: 40 };
const V_HEAD = { tilt: 13, turn: 16, nod: 8 };

const violin: readonly ClipDef[] = [
  {
    id: 'violin.bow',
    duration: 2.6,
    base: { armL: V_NECK, head: V_HEAD, gripL: level(V_NECK) },
    keys: [
      key(0, { armR: BOW_FROG, gripR: level(BOW_FROG), spine: { side: 3 } }),
      key(0.44, { armR: BOW_TIP, gripR: level(BOW_TIP), spine: { side: -2, lean: 3 } }),
      key(0.52, { armR: { ...BOW_TIP, bend: 44 }, gripR: level(BOW_TIP, 3), head: { nod: 3 } }),
      key(0.92, { armR: { ...BOW_FROG, bend: 108 }, gripR: level(BOW_FROG), spine: { side: 2 } }),
    ],
  },
  {
    id: 'violin.sway',
    duration: 4.4,
    base: { armL: V_NECK, head: V_HEAD, gripL: level(V_NECK) },
    keys: [
      key(0, { armR: BOW_FROG, gripR: level(BOW_FROG), spine: { side: 7, lean: 6 }, root: { roll: 2 } }),
      key(0.3, { armR: BOW_TIP, gripR: level(BOW_TIP), spine: { side: -6, lean: -4 }, head: { nod: -6 } }),
      key(0.45, { armR: { ...BOW_TIP, out: 52, bend: 56 }, gripR: level(BOW_TIP), spine: { side: -8 }, root: { roll: -2 } }),
      key(0.62, { armR: { ...BOW_FROG, bend: 96 }, gripR: level(BOW_FROG), spine: { side: 2, lean: 8 } }),
      key(0.8, { armR: BOW_TIP, gripR: level(BOW_TIP), spine: { side: -4, lean: 2 }, head: { nod: 4 } }),
    ],
  },
];

/* ---- trumpet (both hands raised in front of the mouth, bell forward) ---- */
const TR_R: LimbPose = { fwd: 58, out: 16, twist: -42, bend: 108 };
const TR_L: LimbPose = { fwd: 54, out: 18, twist: -36, bend: 112 };
export const trumpetPose = (lift: number, extra: Pose = {}): Pose =>
  merge(
    {
      armR: add(TR_R, { fwd: lift }),
      armL: add(TR_L, { fwd: lift }),
      gripR: { pitch: 166 + lift },
      gripL: { pitch: 166 + lift },
      head: { nod: -lift * 0.6 },
    },
    extra,
  );

const trumpet: readonly ClipDef[] = [
  {
    id: 'trumpet.play',
    duration: 3.2,
    keys: [
      key(0, trumpetPose(-6, { spine: { lean: 3 } })),
      key(0.12, trumpetPose(0, { spine: { lean: -4 } })),
      key(0.24, trumpetPose(4, { head: { nod: 2 } })),
      key(0.34, trumpetPose(2, { spine: { lean: -2 } })),
      key(0.44, trumpetPose(6)),
      key(0.62, trumpetPose(22, { spine: { lean: -9 }, root: { y: 0.01 } })),
      key(0.8, trumpetPose(24, { spine: { lean: -10, side: 3 } })),
      key(0.92, trumpetPose(4, { spine: { lean: 2 } })),
    ],
  },
  {
    id: 'trumpet.fanfare',
    duration: 2.2,
    keys: [
      key(0, trumpetPose(14, { root: { y: -0.02 }, legL: { fwd: 8, bend: 16 }, legR: { fwd: 8, bend: 16 } })),
      key(0.2, trumpetPose(30, { spine: { lean: -10 } })),
      key(0.35, trumpetPose(26, { spine: { lean: -8 }, head: { turn: 10 } })),
      key(0.5, trumpetPose(32, { spine: { lean: -12 }, head: { turn: -8 } })),
      key(0.75, trumpetPose(34, { spine: { lean: -13 } })),
    ],
  },
];

/* ---- trombone (left hand holds at the mouth, right hand works the slide) ---- */
const TB_L: LimbPose = { fwd: 56, out: 14, twist: -40, bend: 112 };
const SLIDE_IN: LimbPose = { fwd: 62, out: 8, twist: -20, bend: 100 };
const SLIDE_OUT: LimbPose = { fwd: 84, out: 6, twist: -8, bend: 14 };
const slide = (f: number): LimbPose => ({
  fwd: 62 + 22 * f,
  out: 8 - 2 * f,
  twist: -20 + 12 * f,
  bend: 100 - 86 * f,
});

const trombone: ClipDef = {
  id: 'trombone.slide',
  duration: 2.8,
  base: { armL: TB_L, gripL: level(TB_L), head: { nod: -4 } },
  keys: [
    key(0, { armR: SLIDE_IN, gripR: level(SLIDE_IN) }),
    key(0.15, { armR: slide(0.45), gripR: level(slide(0.45)), spine: { lean: -2 } }),
    key(0.28, { armR: slide(0.2), gripR: level(slide(0.2)) }),
    key(0.48, { armR: SLIDE_OUT, gripR: level(SLIDE_OUT), spine: { lean: -6 }, head: { nod: -10 } }),
    key(0.62, { armR: { ...SLIDE_OUT, bend: 18 }, gripR: level(SLIDE_OUT, 4), spine: { lean: -6 } }),
    key(0.8, { armR: slide(0.6), gripR: level(slide(0.6)), spine: { lean: 2 } }),
  ],
};

/* ---- accordion (right hand on keys at the chest, left hand works the bellows) ---- */
const ACC_R: LimbPose = { fwd: 36, out: 14, twist: -30, bend: 96 };
const BELLOWS_IN: LimbPose = { fwd: 30, out: 22, twist: -20, bend: 100 };
const BELLOWS_OUT: LimbPose = { fwd: 26, out: 54, twist: 10, bend: 74 };

const accordion: readonly ClipDef[] = [
  {
    id: 'accordion.squeeze',
    duration: 3.0,
    base: { spine: { lean: -3 } },
    keys: [
      key(0, { armR: ACC_R, armL: BELLOWS_IN, head: { tilt: 6 }, root: { roll: 2 } }),
      key(0.4, { armR: { ...ACC_R, bend: 90 }, armL: BELLOWS_OUT, head: { tilt: -6, turn: 10 }, spine: { side: -4 } }),
      key(0.5, { armR: ACC_R, armL: { ...BELLOWS_OUT, out: 50 }, head: { tilt: -4, nod: 4 }, footR: -14 }),
      key(0.86, { armR: { ...ACC_R, bend: 100 }, armL: BELLOWS_IN, head: { tilt: 8 }, root: { roll: 3 }, spine: { side: 4 } }),
    ],
  },
  {
    id: 'accordion.polka',
    duration: 1.6,
    keys: [
      key(0, { armR: ACC_R, armL: BELLOWS_IN, root: { y: -0.02 }, legL: { fwd: 10, bend: 20 }, legR: { fwd: 10, bend: 20 } }),
      key(0.25, { armR: ACC_R, armL: { ...BELLOWS_OUT, out: 40 }, root: { y: 0.01 }, footL: -18, head: { nod: -4 } }),
      key(0.5, { armR: { ...ACC_R, bend: 92 }, armL: BELLOWS_OUT, root: { y: -0.02 }, legL: { fwd: 10, bend: 20 }, legR: { fwd: 10, bend: 20 } }),
      key(0.75, { armR: ACC_R, armL: { ...BELLOWS_IN, out: 30 }, root: { y: 0.01 }, footR: -18, head: { nod: -4, turn: 8 } }),
    ],
  },
];

/* ---- flute (held horizontally out to the player's right) ---- */
const FL_L: LimbPose = { fwd: 70, out: 4, twist: -55, bend: 120 };
const FL_R: LimbPose = { fwd: 52, out: 42, twist: -30, bend: 104 };
const flute: ClipDef = {
  id: 'flute.play',
  duration: 4.0,
  base: { armL: FL_L, armR: FL_R, gripL: level(FL_L), gripR: level(FL_R), head: { turn: -12, tilt: -14 } },
  keys: [
    key(0, { spine: { side: 2, lean: 2 } }),
    key(0.25, { spine: { side: -3, lean: -3 }, armR: { bend: -4 }, head: { nod: -4 }, root: { roll: -2 } }),
    key(0.45, { spine: { side: -4, lean: -2 }, armL: { bend: 4 }, root: { roll: -2 } }),
    key(0.7, { spine: { side: 4, lean: 4 }, armR: { bend: 4 }, head: { nod: 4 }, root: { roll: 2 } }),
  ],
};

/* ---- tuba (big horn hugged to the chest, oom-pah bounce) ---- */
const TU_L: LimbPose = { fwd: 34, out: 30, twist: -40, bend: 108 };
const TU_R: LimbPose = { fwd: 44, out: 18, twist: -42, bend: 120 };
const tuba: ClipDef = {
  id: 'tuba.hug',
  duration: 1.4,
  base: { armL: TU_L, armR: TU_R, spine: { lean: -8 } },
  keys: [
    key(0, { root: { y: -0.025 }, legL: { fwd: 9, bend: 18 }, legR: { fwd: 9, bend: 18 }, footL: -9, footR: -9, head: { nod: 4 } }),
    key(0.22, { root: { y: 0 }, head: { nod: -3 }, spine: { lean: -2 } }),
    key(0.5, { root: { y: -0.02 }, legL: { fwd: 8, bend: 16 }, legR: { fwd: 8, bend: 16 }, footL: -8, footR: -8, head: { nod: 3 } }),
    key(0.7, { root: { y: 0 }, head: { nod: -2, turn: 6 }, armR: { bend: -6 } }),
  ],
};

export const MUSIC_A_CLIPS: readonly ClipDef[] = [
  ...guitar,
  ...violin,
  ...trumpet,
  trombone,
  ...accordion,
  flute,
  tuba,
  {
    id: 'trombone.sway',
    duration: 3.6,
    base: { armL: TB_L, gripL: level(TB_L), head: { nod: -6 } },
    keys: [
      key(0, { armR: SLIDE_IN, gripR: level(SLIDE_IN), spine: { side: 5 }, root: { roll: 2 } }),
      key(0.3, { armR: slide(0.7), gripR: level(slide(0.7)), spine: { side: -5, lean: -4 }, root: { roll: -2 } }),
      key(0.5, { armR: slide(0.3), gripR: level(slide(0.3)), spine: { side: 5 }, root: { roll: 2 } }),
      key(0.75, { armR: SLIDE_OUT, gripR: level(SLIDE_OUT), spine: { side: -5, lean: -6 }, root: { roll: -2 } }),
    ],
  },
  {
    id: 'flute.trill',
    duration: 2.4,
    base: { armL: FL_L, armR: FL_R, gripL: level(FL_L), gripR: level(FL_R), head: { turn: -12, tilt: -14 } },
    keys: [
      key(0, { spine: { lean: 4 }, root: { y: -0.02 }, legL: { fwd: 8, bend: 16 }, legR: { fwd: 8, bend: 16 } }),
      key(0.3, { spine: { lean: -6 }, head: { nod: -8 }, armL: { fwd: 6 }, armR: { fwd: 6 } }),
      key(0.4, { spine: { lean: -6 }, head: { nod: -10 }, armL: { fwd: 8 }, armR: { fwd: 8, bend: 3 } }),
      key(0.5, { spine: { lean: -6 }, head: { nod: -8 }, armL: { fwd: 6 }, armR: { fwd: 6 } }),
      key(0.75, { spine: { lean: 2, side: 3 }, head: { nod: 2 } }),
    ],
  },
];
