/**
 * Running, stretching, yoga, calisthenics, rope games and skateboarding.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import type { GaitSpec } from './helpers';
import { ARMS_BALANCE, add, armSwing, gaitKeys, key, level, merge, squat } from './helpers';

/* ---- running gaits (linear, cyclic) ---- */
const runSpec = (amp: number, lean: number): Omit<GaitSpec, 'upper'> => ({
  front: { fwd: 40 * amp, bend: 20 },
  back: { fwd: -26 * amp, bend: 40 * amp },
  lift: { fwd: 50 * amp, bend: 110 * amp },
  stance: { fwd: 6, bend: 30 },
  footFront: -10,
  footBack: 30,
  footLift: 20,
  lowY: -0.03,
  highY: 0.03,
  lean,
  twist: 8 * amp,
});
const runArms = (amp: number): ((phase: number) => Pose) =>
  armSwing({ fwd: 40 * amp, out: 8, bend: 100 }, { fwd: -30 * amp, out: 8, bend: 80 }, { fwd: 6, out: 8, bend: 90 });

const running: readonly ClipDef[] = [
  { id: 'jog.run', duration: 0.72, stride: 1.8, ease: 'linear', keys: gaitKeys({ ...runSpec(1, 8), upper: runArms(1) }) },
  { id: 'jog.easy', duration: 0.8, stride: 1.45, ease: 'linear', keys: gaitKeys({ ...runSpec(0.8, 6), upper: runArms(0.75) }) },
  {
    id: 'sprint.run',
    duration: 0.56,
    stride: 2.8,
    ease: 'linear',
    keys: gaitKeys({
      ...runSpec(1.25, 14),
      lift: { fwd: 75, bend: 130 },
      upper: armSwing({ fwd: 70, out: 6, bend: 90 }, { fwd: -45, out: 6, bend: 70 }, { fwd: 10, out: 6, bend: 90 }),
    }),
  },
];

/* ---- stretching ---- */
const LUNGE: Pose = {
  root: { y: -0.27 },
  legL: { fwd: 80, out: 6, bend: 86 },
  legR: { fwd: -50, out: 4, bend: 10 },
  footL: -6,
  footR: 34,
  armL: { fwd: 50, out: 10, twist: -20, bend: 30 },
  armR: { fwd: 50, out: 10, twist: -20, bend: 30 },
  spine: { lean: 10 },
};
const stretch: readonly ClipDef[] = [
  {
    id: 'stretch.lunge',
    duration: 4.0,
    keys: [
      key(0, LUNGE),
      key(0.2, merge(LUNGE, { root: { y: -0.31 }, legL: { bend: 92 }, legR: { fwd: -54 } })),
      key(0.4, LUNGE),
      key(0.55, merge(LUNGE, { root: { y: -0.3 }, armL: { fwd: 170, out: 14, bend: 6 }, armR: { fwd: 170, out: 14, bend: 6 }, spine: { lean: -8 }, head: { nod: -12 } })),
      key(0.8, merge(LUNGE, { armL: { fwd: 170, out: 14, bend: 6 }, armR: { fwd: 170, out: 14, bend: 6 }, spine: { lean: -6 } })),
    ],
  },
  {
    id: 'stretch.reach',
    duration: 5.0,
    base: { legL: { out: 10 }, legR: { out: 10 }, armL: { fwd: 170, out: 10, bend: 10 }, armR: { fwd: 170, out: 10, bend: 10 } },
    keys: [
      key(0, { head: { nod: -6 } }),
      key(0.25, { spine: { side: 18 }, root: { x: -0.03 }, head: { tilt: 8 } }),
      key(0.45, { spine: { side: 16 }, root: { x: -0.03 }, head: { tilt: 8 } }),
      key(0.7, { spine: { side: -18 }, root: { x: 0.03 }, head: { tilt: -8 } }),
      key(0.88, { spine: { side: -16 }, root: { x: 0.03 }, head: { tilt: -8 } }),
    ],
  },
];

/* ---- yoga ---- */
const PRAYER: LimbPose = { fwd: 30, out: 6, twist: -50, bend: 120 };
const OVERHEAD: LimbPose = { fwd: 172, out: 6, bend: 10 };
const TREE: Pose = { legR: { fwd: 30, out: 46, twist: 60, bend: 130 }, footR: 30, legL: { fwd: 0, out: -2 } };
const WARRIOR: Pose = {
  root: { y: -0.12 },
  legL: { out: 36, twist: 80, bend: 80 },
  legR: { out: 40, twist: 30 },
  head: { turn: 70 },
};
const T_ARM: LimbPose = { fwd: 4, out: 88, twist: 10, bend: 4 };
const yoga: readonly ClipDef[] = [
  {
    id: 'yoga.tree',
    duration: 9,
    base: TREE,
    keys: [
      key(0, { armL: PRAYER, armR: PRAYER }),
      key(0.25, { armL: OVERHEAD, armR: OVERHEAD, head: { nod: -4 } }),
      key(0.45, { armL: OVERHEAD, armR: OVERHEAD, root: { roll: 1.5 }, spine: { side: -1.5 } }),
      key(0.62, { armL: OVERHEAD, armR: OVERHEAD, root: { roll: -1 }, spine: { side: 1 } }),
      key(0.82, { armL: PRAYER, armR: PRAYER }),
    ],
  },
  {
    id: 'yoga.warrior',
    duration: 10,
    base: WARRIOR,
    keys: [
      key(0, { armL: T_ARM, armR: T_ARM }),
      key(0.3, { armL: add(T_ARM, { fwd: 2 }), armR: add(T_ARM, { fwd: -2 }), spine: { lean: -2 } }),
      key(0.45, { armL: { fwd: 6, out: 150, bend: 4 }, armR: { fwd: -4, out: 12, bend: 2 }, spine: { side: -20, lean: -6 }, head: { nod: -14, turn: -50 } }),
      key(0.7, { armL: { fwd: 6, out: 152, bend: 4 }, armR: { fwd: -4, out: 12, bend: 2 }, spine: { side: -22, lean: -6 }, head: { nod: -16, turn: -50 } }),
      key(0.85, { armL: T_ARM, armR: T_ARM }),
    ],
  },
];

/* ---- calisthenics ---- */
const PUSH_TOP: Pose = {
  root: { pitch: 68, y: -0.45 },
  armL: { fwd: 68, out: 14, bend: 8 },
  armR: { fwd: 68, out: 14, bend: 8 },
  footL: 10,
  footR: 10,
  head: { nod: -30 },
};
const PUSH_LOW: Pose = merge(PUSH_TOP, {
  root: { pitch: 76, y: -0.6 },
  armL: { fwd: 10, out: 20, bend: 100 },
  armR: { fwd: 10, out: 20, bend: 100 },
  head: { nod: -36 },
});
const STAR_CLOSED: Pose = { armL: { fwd: 2, out: 6, bend: 4 }, armR: { fwd: 2, out: 6, bend: 4 } };
const STAR_AIR: Pose = { root: { y: 0.08 }, legL: { out: 10 }, legR: { out: 10 }, footL: 30, footR: 30, armL: { out: 90, bend: 6 }, armR: { out: 90, bend: 6 } };
const STAR_OPEN: Pose = { root: { y: -0.02 }, legL: { out: 16, bend: 8 }, legR: { out: 16, bend: 8 }, armL: { fwd: 0, out: 160, bend: 6 }, armR: { fwd: 0, out: 160, bend: 6 } };
const calisthenics: readonly ClipDef[] = [
  {
    id: 'pushup.rep',
    duration: 1.8,
    keys: [key(0, PUSH_TOP), key(0.4, PUSH_LOW), key(0.48, PUSH_LOW), key(0.82, PUSH_TOP)],
  },
  {
    id: 'starjump.jump',
    duration: 1.0,
    keys: [key(0, merge(STAR_CLOSED, squat(6, 12))), key(0.25, STAR_AIR), key(0.5, STAR_OPEN), key(0.75, STAR_AIR)],
  },
];

/* ---- skipping rope: rope handles in both hands, small wrist circles ---- */
const ROPE_LOW: LimbPose = { fwd: 24, out: 26, twist: 10, bend: 40 };
const ROPE_BACK: LimbPose = { fwd: 10, out: 32, twist: 10, bend: 30 };
const rope: readonly ClipDef[] = [
  {
    id: 'skiprope.jump',
    duration: 0.56,
    keys: [
      key(0, merge(squat(8, 16), { armL: ROPE_LOW, armR: ROPE_LOW, gripL: level(ROPE_LOW, 40), gripR: level(ROPE_LOW, 40) })),
      key(0.5, { root: { y: 0.07 }, footL: 30, footR: 30, legL: { bend: 8 }, legR: { bend: 8 }, armL: ROPE_BACK, armR: ROPE_BACK, gripL: level(ROPE_BACK, -40), gripR: level(ROPE_BACK, -40) }),
    ],
  },
  {
    id: 'skiprope.step',
    duration: 1.1,
    keys: [
      key(0, { root: { y: 0.03 }, legL: { fwd: 30, bend: 60 }, footL: 30, footR: 24, armL: ROPE_LOW, armR: ROPE_LOW, gripL: level(ROPE_LOW, 40), gripR: level(ROPE_LOW, 40) }),
      key(0.25, { armL: ROPE_BACK, armR: ROPE_BACK, gripL: level(ROPE_BACK, -40), gripR: level(ROPE_BACK, -40), legL: { bend: 6 }, legR: { bend: 6 } }),
      key(0.5, { root: { y: 0.03 }, legR: { fwd: 30, bend: 60 }, footR: 30, footL: 24, armL: ROPE_LOW, armR: ROPE_LOW, gripL: level(ROPE_LOW, 40), gripR: level(ROPE_LOW, 40) }),
      key(0.75, { armL: ROPE_BACK, armR: ROPE_BACK, gripL: level(ROPE_BACK, -40), gripR: level(ROPE_BACK, -40), legL: { bend: 6 }, legR: { bend: 6 } }),
    ],
  },
];

/* ---- tug of war: leaning back on the rope, hands one behind the other ---- */
const TUG: Pose = {
  root: { pitch: -20, y: 0 },
  legL: { fwd: 10, bend: 35 },
  legR: { fwd: -10, bend: 20 },
  footL: -20,
  footR: -6,
  armL: { fwd: 50, out: 6, twist: -30, bend: 20 },
  armR: { fwd: 34, out: 10, twist: -30, bend: 50 },
  head: { nod: 14 },
};
const tug: ClipDef = {
  id: 'tug.pull',
  duration: 2.2,
  keys: [
    key(0, TUG),
    key(0.2, merge(TUG, { root: { pitch: -27, y: -0.02 }, armL: { bend: 40, fwd: 44 }, armR: { bend: 70, fwd: 30 }, spine: { lean: -6 }, head: { nod: 20 } })),
    key(0.4, merge(TUG, { root: { pitch: -25, y: -0.01 }, legR: { fwd: -24, bend: 26 }, legL: { fwd: 16, bend: 40 } })),
    key(0.6, merge(TUG, { root: { pitch: -18 }, armL: { fwd: 56, bend: 14 }, armR: { fwd: 40, bend: 40 }, head: { nod: 10 } })),
    key(0.8, merge(TUG, { root: { pitch: -24, y: -0.01 }, spine: { lean: -4 } })),
  ],
};

/* ---- skateboard: sideways stance (yaw 80 from the board heading) ---- */
const SKATE: Pose = merge(squat(30, 60, 18), { root: { yaw: 80 }, head: { turn: -66 }, spine: { lean: 12 } });
const skate: readonly ClipDef[] = [
  {
    id: 'skate.crouch',
    duration: 2.6,
    keys: [
      key(0, merge(SKATE, { armL: ARMS_BALANCE, armR: { fwd: 30, out: 50, bend: 30 }, root: { roll: 2 } })),
      key(0.5, merge(SKATE, { armL: { fwd: 30, out: 60, bend: 30 }, armR: ARMS_BALANCE, root: { roll: -3 }, spine: { side: 3 } })),
    ],
  },
  {
    id: 'skate.push',
    duration: 1.3,
    stride: 1.8,
    base: { root: { y: 0.04 }, legL: { fwd: 10, bend: 30 }, footL: -20, spine: { lean: 14 }, head: { nod: -8 } },
    keys: [
      key(0, { legR: { fwd: 20, bend: 26 }, footR: -6, armL: { fwd: -20, out: 10, bend: 20 }, armR: { fwd: 30, out: 10, bend: 30 } }),
      key(0.35, { legR: { fwd: -34, bend: 8 }, footR: 30, root: { y: -0.02 }, armL: { fwd: 30, out: 10, bend: 30 }, armR: { fwd: -20, out: 10, bend: 20 } }),
      key(0.65, { legR: { fwd: 0, bend: 60 }, footR: 20, armL: { fwd: 6, out: 14, bend: 20 }, armR: { fwd: 6, out: 14, bend: 20 } }),
    ],
  },
];

export const SPORT_FITNESS_CLIPS: readonly ClipDef[] = [
  ...running,
  ...stretch,
  ...yoga,
  ...calisthenics,
  ...rope,
  tug,
  ...skate,
  {
    id: 'pushup.slow',
    duration: 3.2,
    keys: [key(0, PUSH_TOP), key(0.45, PUSH_LOW), key(0.6, merge(PUSH_LOW, { head: { nod: -40 } })), key(0.9, PUSH_TOP)],
  },
];
