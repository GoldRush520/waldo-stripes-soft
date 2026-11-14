/**
 * Kitchen crafts and heavy labour: dough, pancakes, stirring, chopping, building, crane signals,
 * hoisting, scrubbing, luggage and porters, pushing a stuck cart.
 * Grip conventions as in craft-workshop.ts (absolute pitch for swung tools, `level` for carried ones).
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_REST, HANDS_ON_HIPS, KNEEL_BOTH, KNEEL_ONE, add, gaitKeys, key, level, merge, mirror, squat } from './helpers';

/* ---- dough ---- */
const KNEAD: LimbPose = { fwd: 50, out: 12, twist: -30, bend: 40 };
const PIN: LimbPose = { fwd: 46, out: 26, twist: -10, bend: 46 };
const dough: readonly ClipDef[] = [
  {
    id: 'dough.knead',
    duration: 2.2,
    base: { spine: { lean: 18 }, head: { nod: 18 } },
    keys: [
      key(0, { armL: KNEAD, armR: KNEAD }),
      key(0.3, { armL: { fwd: 64, out: 12, twist: -30, bend: 12 }, armR: { fwd: 64, out: 12, twist: -30, bend: 12 }, spine: { lean: 12 }, root: { z: 0.03 } }),
      key(0.42, { armL: { fwd: 64, out: 12, twist: -30, bend: 14 }, armR: { fwd: 64, out: 12, twist: -30, bend: 14 }, spine: { lean: 12 }, root: { z: 0.03 } }),
      key(0.65, { armL: { fwd: 40, out: 10, twist: -40, bend: 90 }, armR: { fwd: 50, out: 14, twist: -20, bend: 70 }, spine: { twist: 6 } }),
      key(0.82, { armL: add(KNEAD, { bend: 10 }), armR: add(KNEAD, { bend: 10 }) }),
    ],
  },
  {
    id: 'dough.roll',
    duration: 1.6,
    base: { spine: { lean: 20 }, head: { nod: 16 } },
    keys: [
      key(0, { armL: PIN, armR: PIN, gripR: level(PIN) }),
      key(0.45, { armL: add(PIN, { fwd: 24, bend: -32 }), armR: add(PIN, { fwd: 24, bend: -32 }), gripR: level(add(PIN, { fwd: 24, bend: -32 })), spine: { lean: 10 }, root: { z: 0.03 } }),
      key(0.55, { armL: add(PIN, { fwd: 24, bend: -30 }), armR: add(PIN, { fwd: 24, bend: -30 }), gripR: level(add(PIN, { fwd: 24, bend: -30 })), spine: { lean: 10 }, root: { z: 0.03 } }),
    ],
  },
];

/* ---- pancake: pan held level in the right hand, flick, watch, catch ---- */
const PAN: LimbPose = { fwd: 34, out: 14, twist: -10, bend: 60 };
const pan = (d: LimbPose, tilt: number, extra: Pose = {}): Pose => merge({ armR: add(PAN, d), gripR: level(add(PAN, d), tilt) }, extra);
const pancake: ClipDef = {
  id: 'pancake.flip',
  duration: 3.2,
  base: { armL: HANDS_ON_HIPS },
  keys: [
    key(0, pan({}, 0, { head: { nod: 12 } })),
    key(0.1, pan({ fwd: 4, bend: -4 }, 2, { head: { nod: 12 } })),
    key(0.2, pan({ fwd: -6, bend: -10 }, 12, { root: { y: -0.02 }, legL: { fwd: 8, bend: 16 }, legR: { fwd: 8, bend: 16 } })),
    key(0.28, pan({ fwd: 16, bend: 14 }, -24, { head: { nod: -20 }, spine: { lean: -4 } })),
    key(0.42, pan({ fwd: 8, bend: 4 }, -4, { head: { nod: -28 } })),
    key(0.52, pan({ fwd: -4, bend: -6 }, 6, { head: { nod: 8 }, root: { y: -0.015 } })),
    key(0.62, pan({}, 0, { head: { nod: 12, tilt: 8 } })),
    key(0.8, pan({ out: 6 }, 4, { head: { nod: 12, turn: 14 } })),
  ],
};

/* ---- big pot: long spoon in both hands stirring circles; or stir and taste ---- */
const STIR: readonly LimbPose[] = [
  { fwd: 48, out: 20, twist: -30, bend: 60 },
  { fwd: 56, out: 14, twist: -34, bend: 46 },
  { fwd: 48, out: 6, twist: -40, bend: 62 },
  { fwd: 40, out: 14, twist: -34, bend: 76 },
];
const stirKey = (i: number): Pose => {
  const a = STIR[i % 4] ?? { fwd: 48 };
  return { armR: a, armL: add(a, { fwd: -6, bend: 8 }), gripR: level(a, 170), spine: { twist: [6, 0, -6, 0][i % 4] ?? 0, lean: 18 }, head: { nod: 18 } };
};
const pot: readonly ClipDef[] = [
  { id: 'pot.stir', duration: 2.4, ease: 'linear', keys: [0, 1, 2, 3].map((i) => key(i / 4, stirKey(i))) },
  {
    id: 'pot.taste',
    duration: 6.0,
    keys: [
      ...[0, 1, 2, 3, 0, 1].map((i, n) => key(n * 0.09, merge(stirKey(i), { armL: ARM_REST }))),
      key(0.62, { armR: { fwd: 52, out: 10, twist: -40, bend: 130 }, gripR: level({ fwd: 52, bend: 130 }, 100), armL: { fwd: 30, out: 6, twist: -40, bend: 100 }, head: { nod: 2 } }),
      key(0.72, { armR: { fwd: 52, out: 10, twist: -40, bend: 134 }, gripR: level({ fwd: 52, bend: 134 }, 100), armL: { fwd: 30, out: 6, twist: -40, bend: 100 }, head: { nod: -6, tilt: 10 } }),
      key(0.86, merge(stirKey(1), { armL: ARM_REST, head: { nod: 10, turn: 10 } })),
    ],
  },
];

/* ---- chopping: knife on a board, or an axe on a block ---- */
const VEG: LimbPose = { fwd: 40, out: 6, twist: -30, bend: 70 };
const KN_UP: LimbPose = { fwd: 40, out: 16, twist: -20, bend: 92 };
const KN_DN: LimbPose = { fwd: 36, out: 16, twist: -20, bend: 62 };
const chopKeys = (): ClipDef['keys'] => [
  ...[0, 1, 2, 3, 4, 5].map((i) =>
    key(i * 0.1, { armR: i % 2 === 0 ? KN_UP : KN_DN, gripR: { pitch: i % 2 === 0 ? 120 : 150 }, armL: add(VEG, { out: -i * 0.6 }) }),
  ),
  key(0.7, { armR: add(KN_DN, { out: 14, twist: 20 }), gripR: { pitch: 160 }, armL: add(VEG, { out: 12 }), head: { turn: 10 } }),
];
const AXE_UP: LimbPose = { fwd: 165, out: 10, twist: -20, bend: 50 };
const AXE_HIT: LimbPose = { fwd: 50, out: 6, twist: -30, bend: 10 };
const chop: readonly ClipDef[] = [
  { id: 'chop.board', duration: 1.8, base: { spine: { lean: 16 }, head: { nod: 20 } }, keys: chopKeys() },
  {
    id: 'chop.wood',
    duration: 2.4,
    keys: [
      key(0, merge(squat(10, 20, 14), { armL: AXE_HIT, armR: AXE_HIT, gripR: { pitch: 120 }, spine: { lean: 20 }, head: { nod: 14 } })),
      key(0.35, { armL: AXE_UP, armR: AXE_UP, gripR: { pitch: 80 }, spine: { lean: -8 }, head: { nod: -4 } }),
      key(0.44, { armL: add(AXE_UP, { fwd: 4 }), armR: add(AXE_UP, { fwd: 4 }), gripR: { pitch: 76 }, spine: { lean: -10 } }),
      key(0.54, merge(squat(24, 48, 14), { armL: AXE_HIT, armR: AXE_HIT, gripR: { pitch: 130 }, spine: { lean: 30 }, head: { nod: 18 } })),
      key(0.75, merge(squat(12, 24, 14), { armL: AXE_HIT, armR: AXE_HIT, gripR: { pitch: 120 }, spine: { lean: 22 }, head: { nod: 20 } })),
    ],
  },
];

/* ---- building site ---- */
const hodStep: Pose = {
  armR: { fwd: 30, out: 12, twist: -30, bend: 140 },
  armL: { fwd: 120, out: 14, bend: 50 },
  legR: { fwd: 60, bend: 96 },
  footR: -20,
  legL: { fwd: 0, bend: 8 },
  spine: { lean: 10 },
  head: { nod: -8 },
};
const BRICK_REACH: Pose = { spine: { lean: 22, twist: 30 }, armL: { fwd: 40, out: 50, bend: 20 }, head: { turn: 30, nod: 14 } };
const building: readonly ClipDef[] = [
  {
    id: 'hod.climb',
    duration: 1.8,
    keys: [
      key(0, hodStep),
      key(0.5, merge(hodStep, { legL: { fwd: 60, bend: 96 }, legR: { fwd: 0, bend: 8 }, footL: -20, footR: 0, armL: { fwd: 100, bend: 70 } })),
    ],
  },
  {
    id: 'brick.kneel',
    duration: 5.0,
    base: KNEEL_ONE,
    keys: [
      key(0, merge(BRICK_REACH, { armR: { fwd: 40, out: 14, twist: -20, bend: 60 }, gripR: { pitch: 150 } })),
      key(0.2, merge(BRICK_REACH, { armL: { fwd: 30, out: 46, bend: 40 }, armR: { fwd: 40, out: 14, twist: -20, bend: 60 }, gripR: { pitch: 150 } })),
      key(0.38, { spine: { lean: 34 }, armL: { fwd: 60, out: 10, twist: -20, bend: 40 }, armR: { fwd: 40, out: 14, twist: -20, bend: 60 }, gripR: { pitch: 150 }, head: { nod: 20 } }),
      key(0.52, { spine: { lean: 34 }, armL: { fwd: 50, out: 20, bend: 30 }, armR: { fwd: 60, out: 14, twist: -20, bend: 84 }, gripR: { pitch: 120 }, head: { nod: 22 } }),
      key(0.58, { spine: { lean: 34 }, armL: { fwd: 50, out: 20, bend: 30 }, armR: { fwd: 58, out: 14, twist: -20, bend: 64 }, gripR: { pitch: 160 }, head: { nod: 22 } }),
      key(0.72, { spine: { lean: 30 }, armL: { fwd: 20, out: 20, bend: 30 }, armR: { fwd: 56, out: 34, twist: 0, bend: 40 }, gripR: { pitch: 160 }, head: { nod: 18, turn: -10 } }),
      key(0.86, { spine: { lean: 20 }, armL: { fwd: 10, out: 14, bend: 20 }, armR: { fwd: 46, out: 10, twist: -30, bend: 60 }, gripR: { pitch: 150 }, head: { nod: 10 } }),
    ],
  },
];

/* ---- crane signalman: hoist (circling finger), stop (arm out), lower (circling low), all clear ---- */
const crane: readonly ClipDef[] = [
  {
    id: 'crane.signal',
    duration: 8.0,
    base: { armL: HANDS_ON_HIPS, head: { nod: -14 } },
    keys: [
      key(0, { armR: { fwd: 168, out: 18, bend: 30 } }),
      key(0.06, { armR: { fwd: 168, out: 26, bend: 34, twist: 20 } }),
      key(0.12, { armR: { fwd: 168, out: 18, bend: 30 } }),
      key(0.18, { armR: { fwd: 168, out: 26, bend: 34, twist: 20 } }),
      key(0.28, { armR: { fwd: 0, out: 90, bend: 0 }, head: { turn: -20 } }),
      key(0.45, { armR: { fwd: 2, out: 90, bend: 0 }, head: { turn: -20 } }),
      key(0.52, { armR: { fwd: 40, out: 30, bend: 10 }, head: { nod: 4 } }),
      key(0.58, { armR: { fwd: 46, out: 40, bend: 16, twist: 20 }, head: { nod: 4 } }),
      key(0.64, { armR: { fwd: 40, out: 30, bend: 10 }, head: { nod: 4 } }),
      key(0.7, { armR: { fwd: 46, out: 40, bend: 16, twist: 20 }, head: { nod: 4 } }),
      key(0.82, { armR: { fwd: 90, out: 20, twist: 40, bend: 70 }, head: { turn: 10 } }),
      key(0.92, { armR: ARM_REST }),
    ],
  },
  {
    id: 'crane.stop',
    duration: 1.4,
    keys: [
      key(0, { armL: { fwd: 0, out: 90 }, armR: { fwd: 0, out: 90 }, head: { nod: -14 } }),
      key(0.5, { armL: { fwd: 70, out: 40 }, armR: { fwd: 70, out: 40 }, head: { nod: -12 } }),
    ],
  },
];

/* ---- hoisting on a vertical rope ---- */
const R_HIGH: LimbPose = { fwd: 165, out: 8, twist: -20, bend: 20 };
const R_LOW: LimbPose = { fwd: 60, out: 10, twist: -30, bend: 120 };
const HOIST_LEGS: Pose = { legL: { fwd: 16, bend: 14 }, legR: { fwd: -10, bend: 10 }, root: { y: -0.02 } };
const hoist: readonly ClipDef[] = [
  {
    id: 'hoist.rope',
    duration: 1.9,
    base: HOIST_LEGS,
    keys: [
      key(0, { armL: R_HIGH, armR: R_LOW, spine: { lean: -4 }, head: { nod: -14 } }),
      key(0.45, { armL: R_LOW, armR: R_HIGH, spine: { lean: -10 }, head: { nod: -10 } }),
      key(0.5, { armL: add(R_LOW, { bend: 4 }), armR: R_HIGH, spine: { lean: -4 }, head: { nod: -14 } }),
      key(0.95, { armL: R_HIGH, armR: add(R_LOW, { bend: 4 }), spine: { lean: -10 }, head: { nod: -10 } }),
    ],
  },
  {
    id: 'hoist.heave',
    duration: 2.4,
    keys: [
      key(0, merge(squat(8, 16), { armL: R_HIGH, armR: add(R_HIGH, { fwd: -10 }), head: { nod: -16 } })),
      key(0.4, merge(squat(34, 64), { armL: R_LOW, armR: add(R_LOW, { fwd: 10 }), spine: { lean: 8 }, head: { nod: 6 } })),
      key(0.5, merge(squat(36, 68), { armL: R_LOW, armR: add(R_LOW, { fwd: 10 }), spine: { lean: 10 }, head: { nod: 8 } })),
      key(0.85, merge(squat(10, 20), { armL: add(R_HIGH, { fwd: -6 }), armR: add(R_HIGH, { fwd: -16 }), head: { nod: -14 } })),
    ],
  },
];

/* ---- scrubbing the deck on both knees ---- */
const SCRUB: LimbPose = { fwd: 72, out: 14, twist: -30, bend: 16 };
const scrub: ClipDef = {
  id: 'deck.scrub',
  duration: 1.4,
  base: merge(KNEEL_BOTH, { spine: { lean: 66 }, head: { nod: -24 } }),
  keys: [
    key(0, { armL: SCRUB, armR: SCRUB }),
    key(0.45, { armL: add(SCRUB, { fwd: 30, bend: -10 }), armR: add(SCRUB, { fwd: 30, bend: -10 }), spine: { lean: 5 }, root: { z: 0.04 } }),
    key(0.55, { armL: add(SCRUB, { fwd: 28, bend: -8 }), armR: add(SCRUB, { fwd: 28, bend: -8 }), spine: { lean: 5 }, root: { z: 0.04 } }),
  ],
};

/* ---- luggage: lifting a case onto an overhead rack; porter with a tower of cases ---- */
const CASE_CHEST: LimbPose = { fwd: 50, out: 14, twist: -30, bend: 120 };
const CASE_UP: LimbPose = { fwd: 160, out: 16, bend: 30 };
const CASE_PUSH: LimbPose = { fwd: 140, out: 16, bend: 10 };
const lug = (a: LimbPose, extra: Pose = {}): Pose => merge({ armL: a, armR: a, gripR: level(a) }, extra);
const TOWER_R: LimbPose = { fwd: 160, out: 22, bend: 60 };
const TOWER_L: LimbPose = { fwd: 150, out: 28, bend: 70 };
const luggage: readonly ClipDef[] = [
  {
    id: 'luggage.rack',
    duration: 4.4,
    keys: [
      key(0, lug({ fwd: 14, out: 16, bend: 10 }, merge(squat(50, 90), { spine: { lean: 30 }, head: { nod: 10 } }))),
      key(0.18, lug(CASE_CHEST, squat(20, 40))),
      key(0.36, lug(CASE_UP, { root: { y: 0.04 }, footL: 30, footR: 30, spine: { lean: -6 }, head: { nod: -20 } })),
      key(0.48, lug(CASE_PUSH, { root: { y: 0.04 }, footL: 30, footR: 30, spine: { lean: -2 }, head: { nod: -22 } })),
      key(0.6, { armL: add(CASE_PUSH, { fwd: 10, bend: 10 }), armR: add(CASE_PUSH, { fwd: 10, bend: 10 }), head: { nod: -18 } }),
      key(0.75, { armL: HANDS_ON_HIPS, armR: { fwd: 40, out: 20, twist: -40, bend: 140 }, head: { nod: -4, turn: 10 } }),
    ],
  },
  {
    id: 'porter.balance',
    duration: 3.6,
    keys: [
      key(0, { armR: TOWER_R, armL: TOWER_L, root: { roll: 0 } }),
      key(0.25, { armR: add(TOWER_R, { out: -4 }), armL: add(TOWER_L, { out: 6 }), root: { roll: 3, x: 0.02 }, spine: { side: -4 }, legL: { out: 6 } }),
      key(0.5, { armR: TOWER_R, armL: TOWER_L, root: { roll: -1 } }),
      key(0.72, { armR: add(TOWER_R, { out: 8 }), armL: add(TOWER_L, { out: -4 }), root: { roll: -3, x: -0.02 }, spine: { side: 4 }, legR: { out: 6 } }),
    ],
  },
  {
    id: 'porter.walk',
    duration: 1.3,
    stride: 1.0,
    keys: gaitKeys({
      front: { fwd: 20, bend: 8 },
      back: { fwd: -16, bend: 12 },
      lift: { fwd: 14, bend: 46 },
      stance: { fwd: 3, bend: 4 },
      footFront: -10,
      footBack: 14,
      footLift: 18,
      lowY: -0.02,
      highY: 0.006,
      lean: 0,
      twist: 0,
      upper: (i) => ({ armR: add(TOWER_R, { out: [0, 3, 0, -3][i] ?? 0 }), armL: TOWER_L, root: { roll: [1, 0, -1, 0][i] ?? 0 } }),
    }),
  },
];

/* ---- shoving a stuck cart: body pitched forward, legs drive behind ---- */
const SHOVE: LimbPose = { fwd: 100, out: 14, twist: -30, bend: 20 };
const shoveStep = (lead: 'L' | 'R', heave: number): Pose => {
  const p: Pose = {
    root: { pitch: 30 + heave, y: -0.03 },
    legL: { fwd: 40, bend: 56 },
    legR: { fwd: 6, bend: 6 },
    footL: -16,
    footR: 30,
    armL: add(SHOVE, { bend: heave * 2 }),
    armR: add(SHOVE, { bend: heave * 2 }),
    spine: { lean: heave },
    head: { nod: -26 + heave * 3 },
  };
  return lead === 'L' ? p : mirror(p);
};
const cart: ClipDef = {
  id: 'cart.push',
  duration: 2.6,
  keys: [
    key(0, shoveStep('L', 0)),
    key(0.2, shoveStep('L', 5)),
    key(0.32, shoveStep('L', 2)),
    key(0.5, shoveStep('R', 0)),
    key(0.7, shoveStep('R', 5)),
    key(0.82, shoveStep('R', 2)),
  ],
};

export const CRAFT_LABOUR_CLIPS: readonly ClipDef[] = [
  ...dough,
  pancake,
  ...pot,
  ...chop,
  ...building,
  ...crane,
  ...hoist,
  scrub,
  ...luggage,
  cart,
];
