/**
 * Street circus: juggling, living statue, mime, stilts, tightrope, unicycle, strongman, hoop,
 * plate spinning, baton toss and the clown.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARMS_BALANCE, ARM_REST, add, armSwing, gaitKeys, key, level, merge, mirror, squat } from './helpers';

/* ---- juggling: cascade with hands at the waist, eyes on the peak ---- */
const J: LimbPose = { fwd: 28, out: 16, twist: -14, bend: 86 };
const TOSS: LimbPose = { fwd: 36, out: 12, twist: -24, bend: 104 };
const CATCH: LimbPose = { fwd: 24, out: 20, twist: -6, bend: 72 };
const cascade = (nod: number): ClipDef['keys'] => [
  key(0, { armR: TOSS, armL: CATCH, head: { nod } }),
  key(0.25, { armR: J, armL: J, head: { nod: nod + 2 } }),
  key(0.5, { armL: TOSS, armR: CATCH, head: { nod } }),
  key(0.75, { armR: J, armL: J, head: { nod: nod + 2 } }),
];
const CLUB_UP: LimbPose = { fwd: 44, out: 14, twist: -26, bend: 118 };
const CLUB_LOW: LimbPose = { fwd: 22, out: 20, twist: -6, bend: 64 };
const juggle: readonly ClipDef[] = [
  { id: 'juggle.balls', duration: 0.9, base: { root: { y: -0.01 }, legL: { fwd: 4, bend: 8 }, legR: { fwd: 4, bend: 8 } }, keys: cascade(-18) },
  {
    id: 'juggle.high',
    duration: 1.4,
    base: { spine: { lean: -4 } },
    keys: [
      key(0, { armR: add(TOSS, { fwd: 14, bend: 10 }), armL: CATCH, head: { nod: -30 } }),
      key(0.25, { armR: J, armL: J, head: { nod: -26, turn: 4 } }),
      key(0.5, { armL: add(TOSS, { fwd: 14, bend: 10 }), armR: CATCH, head: { nod: -30 } }),
      key(0.75, { armR: J, armL: J, head: { nod: -26, turn: -4 } }),
    ],
  },
  {
    id: 'juggle.clubs',
    duration: 1.2,
    keys: [
      key(0, { armR: CLUB_UP, armL: CLUB_LOW, gripR: level(CLUB_UP, -50), gripL: level(CLUB_LOW, 20), head: { nod: -20 } }),
      key(0.25, { armR: J, armL: J, gripR: level(J), gripL: level(J), head: { nod: -18 } }),
      key(0.5, { armL: CLUB_UP, armR: CLUB_LOW, gripL: level(CLUB_UP, -50), gripR: level(CLUB_LOW, 20), head: { nod: -20 } }),
      key(0.75, { armR: J, armL: J, gripR: level(J), gripL: level(J), head: { nod: -18 } }),
    ],
  },
];

/* ---- living statue: frozen heroic pose with tiny shifts and one sly glance ---- */
const STATUE: Pose = {
  armR: { fwd: 150, out: 30, twist: 10, bend: 20 },
  armL: { fwd: 20, out: 10, twist: -50, bend: 115 },
  legL: { fwd: 12, out: 4, bend: 10 },
  footL: -4,
  head: { nod: -8, turn: 15 },
  spine: { side: 2 },
};
const THINKER: Pose = {
  armR: { fwd: 40, out: 8, twist: -34, bend: 140 },
  armL: { fwd: 24, out: 14, twist: -60, bend: 100 },
  spine: { lean: 10 },
  head: { nod: 16, turn: -6 },
  legR: { fwd: 8, out: 6, bend: 6 },
};
const statue: readonly ClipDef[] = [
  {
    id: 'statue.hero',
    duration: 10,
    base: STATUE,
    keys: [
      key(0, {}),
      key(0.4, { armR: { fwd: 1.5 }, head: { turn: 1 } }),
      key(0.6, { head: { turn: 1 } }),
      key(0.63, { head: { turn: -22, nod: 4 } }),
      key(0.7, { head: { turn: -22, nod: 4 } }),
      key(0.73, { head: { turn: 0 } }),
      key(0.9, { spine: { side: -1 }, armR: { out: -1 } }),
    ],
  },
  {
    id: 'statue.thinker',
    duration: 9,
    base: THINKER,
    keys: [key(0, {}), key(0.45, { head: { nod: 1.5 }, spine: { lean: 1 } }), key(0.8, { head: { turn: 1.5 } })],
  },
];

/* ---- mime ---- */
const PALM: LimbPose = { fwd: 82, out: 22, twist: 30, bend: 52 };
const mime: readonly ClipDef[] = [
  {
    id: 'mime.wall',
    duration: 5.0,
    base: { spine: { lean: 4 } },
    keys: [
      key(0, { armL: PALM, armR: PALM }),
      key(0.15, { armL: PALM, armR: add(PALM, { fwd: 36, out: 6 }), head: { nod: -10 } }),
      key(0.3, { armL: add(PALM, { fwd: 30, out: -8 }), armR: add(PALM, { fwd: 36, out: 14 }), spine: { side: -4 }, root: { x: -0.04 } }),
      key(0.45, { armL: add(PALM, { out: -12 }), armR: add(PALM, { out: 18 }), spine: { side: -6 }, root: { x: -0.08 }, head: { turn: -14 } }),
      key(0.6, { armL: add(PALM, { fwd: -10 }), armR: add(PALM, { fwd: -14, out: 10 }), root: { y: -0.08, x: -0.06 }, legL: { fwd: 26, bend: 46 }, legR: { fwd: 26, bend: 46 }, footL: -20, footR: -20 }),
      key(0.8, { armL: PALM, armR: PALM, head: { turn: 10, tilt: 8 }, root: { x: -0.02 } }),
    ],
  },
  {
    id: 'mime.rope',
    duration: 2.4,
    base: { spine: { lean: -8 }, root: { y: -0.03 }, legL: { fwd: 22, bend: 20 }, legR: { fwd: -8, bend: 14 } },
    keys: [
      key(0, { armL: { fwd: 82, out: 6, twist: -30, bend: 10 }, armR: { fwd: 40, out: 10, twist: -40, bend: 90 } }),
      key(0.45, { armL: { fwd: 40, out: 10, twist: -40, bend: 90 }, armR: { fwd: 82, out: 6, twist: -30, bend: 10 }, spine: { lean: -4 } }),
      key(0.5, { armL: { fwd: 40, out: 10, twist: -40, bend: 92 }, armR: { fwd: 82, out: 6, twist: -30, bend: 10 } }),
      key(0.95, { armL: { fwd: 82, out: 6, twist: -30, bend: 10 }, armR: { fwd: 40, out: 10, twist: -40, bend: 88 }, spine: { lean: -4 } }),
    ],
  },
];

/* ---- stilts: legs nearly straight, body vaults over each stilt ---- */
const STILT_GAIT = {
  front: { fwd: 18, bend: 3 },
  back: { fwd: -16, bend: 3 },
  lift: { fwd: 10, bend: 10 },
  stance: { fwd: 0, bend: 2 },
  footFront: 0,
  footBack: 0,
  footLift: 0,
  lowY: -0.05,
  highY: 0,
  lean: 2,
  twist: 4,
} as const;
const stilts: ClipDef = {
  id: 'stilts.walk',
  duration: 1.8,
  stride: 1.6,
  keys: gaitKeys({
    ...STILT_GAIT,
    upper: armSwing({ fwd: 30, out: 30, bend: 20 }, { fwd: -10, out: 30, bend: 16 }, { fwd: 10, out: 34, bend: 18 }),
  }),
};

/* ---- tightrope: feet on one line, arms out, constant small corrections ---- */
const ROPE_FEET: Pose = { legL: { fwd: 6, out: -3, bend: 4 }, legR: { fwd: -6, out: -3, bend: 4 } };
const tilt = (r: number, x: number): Pose => ({
  root: { roll: r, x },
  spine: { side: -r * 1.3 },
  armL: add(ARMS_BALANCE, { out: -r * 3, fwd: r }),
  armR: add(ARMS_BALANCE, { out: r * 3, fwd: -r }),
  head: { tilt: -r * 0.5, nod: 10 },
});
const tightrope: readonly ClipDef[] = [
  {
    id: 'tightrope.balance',
    duration: 3.0,
    base: ROPE_FEET,
    keys: [key(0, tilt(0, 0)), key(0.25, tilt(5, 0.02)), key(0.45, tilt(-2, -0.01)), key(0.7, tilt(-6, -0.02)), key(0.85, tilt(2, 0.01))],
  },
  {
    id: 'tightrope.walk',
    duration: 2.4,
    stride: 0.5,
    keys: gaitKeys({
      front: { fwd: 12, out: -3, bend: 6 },
      back: { fwd: -8, out: -3, bend: 8 },
      lift: { fwd: 16, out: -4, bend: 30 },
      stance: { fwd: 2, out: -3, bend: 6 },
      footFront: -6,
      footBack: 10,
      footLift: 10,
      lowY: -0.012,
      highY: 0,
      lean: 4,
      twist: 0,
      upper: (i) => tilt([3, -1, -4, 2][i] ?? 0, 0),
    }),
  },
];

/* ---- unicycle: hips on the saddle (~1.0 m), pedals circle the axle; place the person on the ground ---- */
const PEDAL: readonly [LimbPose, LimbPose, LimbPose, LimbPose] = [
  { fwd: 47, bend: 96 },
  { fwd: 45, bend: 70 },
  { fwd: 15, bend: 31 },
  { fwd: 25, bend: 71 },
];
const pedalFoot = (l: LimbPose): number => (l.fwd ?? 0) - (l.bend ?? 0);
const uniKey = (i: number, upper: Pose): Pose => {
  const l = PEDAL[i % 4] ?? PEDAL[0];
  const r = PEDAL[(i + 2) % 4] ?? PEDAL[0];
  return merge({ root: { y: 0.1 }, legL: l, legR: r, footL: pedalFoot(l), footR: pedalFoot(r) }, upper);
};
const unicycle: readonly ClipDef[] = [
  {
    id: 'unicycle.pedal',
    duration: 1.2,
    stride: 1.55,
    ease: 'linear',
    keys: [0, 1, 2, 3].map((i) => key(i / 4, uniKey(i, merge(tilt([2, -1, -2, 1][i] ?? 0, 0), { spine: { lean: 4 } })))),
  },
  {
    id: 'unicycle.idle',
    duration: 2.0,
    keys: [
      key(0, uniKey(1, tilt(3, 0.01))),
      key(0.5, uniKey(3, tilt(-3, -0.01))),
    ],
  },
];

/* ---- strongman: squat, clean, press overhead, hold, lower. Barbell held level in the right hand ---- */
const BAR_FLOOR: LimbPose = { fwd: 10, out: 18, bend: 4 };
const BAR_CHEST: LimbPose = { fwd: 30, out: 22, twist: -40, bend: 140 };
const BAR_UP: LimbPose = { fwd: 170, out: 22, bend: 6 };
const lift = (arm: LimbPose, legs: Pose, extra: Pose = {}): Pose =>
  merge(legs, { armL: arm, armR: arm, gripR: level(arm), gripL: level(arm) }, extra);
const strongman: readonly ClipDef[] = [
  {
    id: 'strongman.lift',
    duration: 6.0,
    keys: [
      key(0, lift(BAR_FLOOR, squat(64, 110), { spine: { lean: 28 }, head: { nod: -14 } })),
      key(0.14, lift(BAR_FLOOR, squat(30, 50), { spine: { lean: 16 } })),
      key(0.24, lift(BAR_CHEST, squat(22, 44), { spine: { lean: -4 } })),
      key(0.36, lift(BAR_CHEST, squat(18, 36), { spine: { lean: -6 }, head: { nod: -6 } })),
      key(0.46, lift(BAR_UP, { legL: { fwd: -6, bend: 4 }, legR: { fwd: 16, bend: 8 } }, { spine: { lean: -4 }, head: { nod: -10 } })),
      key(0.6, lift(add(BAR_UP, { out: 3 }), { legL: { fwd: -6, bend: 4 }, legR: { fwd: 16, bend: 8 } }, { root: { roll: 2 }, spine: { side: -2 } })),
      key(0.7, lift(BAR_UP, { legL: { fwd: -6, bend: 4 }, legR: { fwd: 16, bend: 8 } }, { root: { roll: -1 } })),
      key(0.8, lift(BAR_CHEST, squat(16, 30))),
      key(0.92, lift(BAR_FLOOR, squat(56, 100), { spine: { lean: 26 } })),
    ],
  },
  {
    id: 'strongman.flex',
    duration: 4.0,
    base: { spine: { lean: -6 }, legL: { out: 10 }, legR: { out: 10 } },
    keys: [
      key(0, { armL: { out: 82, twist: 90, bend: 120 }, armR: { out: 82, twist: 90, bend: 120 }, head: { nod: -8 } }),
      key(0.3, { armL: { out: 82, twist: 90, bend: 136 }, armR: { out: 82, twist: 90, bend: 136 }, spine: { lean: -9 } }),
      key(0.5, { armL: { fwd: 10, out: 30, twist: -60, bend: 110 }, armR: { fwd: 10, out: 30, twist: -60, bend: 110 }, spine: { lean: 10 }, root: { y: -0.03 }, legL: { fwd: 10, out: 10, bend: 20 }, legR: { fwd: 10, out: 10, bend: 20 } }),
      key(0.75, { armL: ARM_REST, armR: { out: 82, twist: 90, bend: 130 }, head: { turn: -30, nod: -4 }, spine: { twist: -10 } }),
    ],
  },
];

/* ---- hoop: hips circle (linear), the hoop itself is a spinning prop ---- */
const HOOP_ARMS_UP: Pose = { armL: { fwd: 150, out: 50, bend: 30 }, armR: { fwd: 150, out: 50, bend: 30 } };
const HOOP_ARMS_OUT: Pose = { armL: { fwd: 10, out: 85, bend: 12 }, armR: { fwd: 10, out: 85, bend: 12 }, head: { turn: 20 } };
const hipCircle = (arms: Pose): ClipDef['keys'] =>
  [
    { x: 0.04, z: 0, roll: 3, pitch: 0 },
    { x: 0, z: 0.04, roll: 0, pitch: -3 },
    { x: -0.04, z: 0, roll: -3, pitch: 0 },
    { x: 0, z: -0.04, roll: 0, pitch: 3 },
  ].map((r, i) => key(i / 4, merge({ root: { ...r, y: -0.015 }, legL: { fwd: 6, bend: 12 }, legR: { fwd: 6, bend: 12 } }, arms)));
const hoop: readonly ClipDef[] = [
  { id: 'hoop.hips', duration: 0.8, ease: 'linear', keys: hipCircle(HOOP_ARMS_UP) },
  { id: 'hoop.arms-out', duration: 0.75, ease: 'linear', keys: hipCircle(HOOP_ARMS_OUT) },
];

/* ---- plate spinning: stick held upright overhead (grip keeps it vertical) ---- */
const PLATE: LimbPose = { fwd: 150, out: 16, bend: 20 };
const plateCircle = (i: number): LimbPose => add(PLATE, { fwd: [3, 0, -3, 0][i % 4] ?? 0, out: [0, 3, 0, -3][i % 4] ?? 0 });
const plates: readonly ClipDef[] = [
  {
    id: 'plates.spin',
    duration: 2.4,
    keys: Array.from({ length: 8 }, (_, i) =>
      key(i / 8, { armR: plateCircle(i), gripR: level(plateCircle(i)), armL: add(ARMS_BALANCE, { out: -20 }), head: { nod: -22 }, root: { x: i < 4 ? 0.02 : -0.02 } }),
    ),
  },
  {
    id: 'plates.two',
    duration: 2.0,
    keys: Array.from({ length: 4 }, (_, i) =>
      key(i / 4, {
        armR: plateCircle(i),
        gripR: level(plateCircle(i)),
        armL: plateCircle(i + 2),
        gripL: level(plateCircle(i + 2)),
        head: { nod: -22, turn: i < 2 ? 10 : -10 },
      }),
    ),
  },
];

/* ---- baton toss: twirl at the chest, throw high, watch, catch, flourish ---- */
const baton: ClipDef = {
  id: 'baton.toss',
  duration: 3.6,
  base: { armL: { fwd: 10, out: 30, bend: 20 } },
  keys: [
    key(0, { armR: { fwd: 60, out: 14, twist: -30, bend: 64 }, gripR: { roll: -60 } }),
    key(0.12, { armR: { fwd: 60, out: 14, twist: 20, bend: 64 }, gripR: { roll: 60 } }),
    key(0.22, merge(squat(14, 30), { armR: { fwd: 40, out: 14, twist: -20, bend: 80 }, gripR: { roll: -40 } })),
    key(0.32, { armR: { fwd: 172, out: 18, bend: 8 }, head: { nod: -26 }, root: { y: 0.02 }, footL: 20, footR: 20 }),
    key(0.55, { armR: { fwd: 150, out: 24, bend: 20 }, head: { nod: -36 } }),
    key(0.66, { armR: { fwd: 104, out: 18, bend: 40 }, head: { nod: -10 } }),
    key(0.8, { armR: { fwd: 150, out: 40, twist: 20, bend: 10 }, armL: { fwd: 20, out: 40, bend: -10 }, head: { nod: -6, turn: 10 } }),
  ],
};

/* ---- clown: slip, windmill, wobble, recover with a bow ---- */
const flail = (phase: number): Pose => ({
  armL: { fwd: [150, 60, 100][phase] ?? 150, out: [60, 80, 30][phase] ?? 60, bend: 20 },
  armR: { fwd: [60, 150, 30][phase] ?? 60, out: [80, 60, 70][phase] ?? 80, bend: 20 },
});
const clown: readonly ClipDef[] = [
  {
    id: 'clown.pratfall',
    duration: 3.4,
    keys: [
      key(0, { armL: ARM_REST, armR: ARM_REST }),
      key(0.12, merge(flail(0), { root: { pitch: -16 }, legR: { fwd: 30, bend: 4 }, legL: { fwd: -16, bend: 6 }, footR: -20, head: { nod: -14 } })),
      key(0.24, merge(flail(1), { root: { pitch: 10 }, legL: { fwd: 10, bend: 10 }, legR: { fwd: 0, bend: 10 }, head: { nod: 10 } })),
      key(0.36, merge(flail(2), { root: { pitch: -12, roll: 4 }, legL: { fwd: -12, bend: 6 }, legR: { fwd: 14, bend: 6 }, footR: -18 })),
      key(0.48, merge(flail(0), { root: { pitch: 6, roll: -3 }, legL: { fwd: 6, bend: 8 }, legR: { fwd: 6, bend: 8 } })),
      key(0.62, { armL: { fwd: 30, out: 80, bend: 10 }, armR: { fwd: 30, out: 80, bend: 10 }, head: { nod: -6, tilt: 10 } }),
      key(0.78, { root: { pitch: 40 }, legL: { fwd: 40 }, legR: { fwd: 40 }, armR: { fwd: 70, out: 10, twist: -40, bend: 100 }, armL: { fwd: 10, out: 60, bend: 10 }, head: { nod: 10 } }),
      key(0.9, { armL: ARM_REST, armR: ARM_REST, head: { tilt: -6 } }),
    ],
  },
  {
    id: 'clown.bow',
    duration: 3.0,
    keys: [
      key(0, { armL: ARM_REST, armR: { fwd: 160, out: 30, bend: 14 }, head: { nod: -6 } }),
      key(0.25, { armL: ARM_REST, armR: { fwd: 100, out: 60, bend: 10 }, head: { nod: -4 } }),
      key(0.45, { root: { pitch: 50 }, legL: { fwd: 50, bend: 2 }, legR: { fwd: 46, bend: 2 }, armR: { fwd: 70, out: 10, twist: -40, bend: 96 }, armL: { fwd: -20, out: 30, bend: 10 }, head: { nod: 6 } }),
      key(0.65, { root: { pitch: 52 }, legL: { fwd: 52, bend: 2 }, legR: { fwd: 48, bend: 2 }, armR: { fwd: 70, out: 10, twist: -40, bend: 96 }, armL: { fwd: -24, out: 34, bend: 10 }, head: { nod: 4, turn: 10 } }),
      key(0.85, { armL: ARM_REST, armR: { fwd: 130, out: 40, bend: 16 }, head: { nod: -8, tilt: 6 } }),
    ],
  },
];

export const CIRCUS_CLIPS: readonly ClipDef[] = [
  ...juggle,
  ...statue,
  ...mime,
  stilts,
  ...tightrope,
  ...unicycle,
  ...strongman,
  ...hoop,
  ...plates,
  baton,
  ...clown,
];
