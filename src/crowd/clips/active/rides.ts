/**
 * Playground equipment, fairground rides and personal vehicles. Seated clips put the hips ~0.47 m
 * above the person's ground point (a 0.45 m seat); saddles are noted per clip.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_REST, GROUND_SIT, SEAT, add, gaitKeys, key, merge, mirror } from './helpers';

/* ---- swing: hands on the chains, legs pump with the arc (pair with a Swing motion) ---- */
const CHAIN: LimbPose = { fwd: 24, out: 20, twist: -6, bend: 100 };
const swing: readonly ClipDef[] = [
  {
    id: 'swing.pump',
    duration: 2.8,
    base: { root: { y: -0.43 }, armL: CHAIN, armR: CHAIN },
    keys: [
      key(0, { legL: { fwd: 84, out: 6, bend: 12 }, legR: { fwd: 84, out: 6, bend: 12 }, footL: 30, footR: 30, spine: { lean: -20 }, head: { nod: -10 }, armL: { fwd: 10, bend: -20 }, armR: { fwd: 10, bend: -20 } }),
      key(0.5, { legL: { fwd: 60, out: 6, bend: 120 }, legR: { fwd: 60, out: 6, bend: 120 }, spine: { lean: 12 }, head: { nod: 6 } }),
    ],
  },
  {
    id: 'swing.gentle',
    duration: 4.4,
    base: merge(SEAT, { armL: CHAIN, armR: CHAIN }),
    keys: [
      key(0, { legL: { bend: -20 }, head: { turn: 14 } }),
      key(0.3, { legR: { bend: -24 }, head: { turn: -6, nod: 6 } }),
      key(0.6, { legL: { bend: -10 }, legR: { bend: 6 }, head: { turn: -18 } }),
    ],
  },
];

/* ---- see-saw: hands on the handle, legs push off at the low point (pair with a Rock motion) ---- */
const HANDLE: LimbPose = { fwd: 40, out: 10, twist: -25, bend: 50 };
const seesaw: ClipDef = {
  id: 'seesaw.bounce',
  duration: 2.6,
  base: { root: { y: -0.43 }, armL: HANDLE, armR: HANDLE },
  keys: [
    key(0, { legL: { fwd: 70, out: 14, bend: 104 }, legR: { fwd: 70, out: 14, bend: 104 }, spine: { lean: 12 }, root: { y: -0.02 } }),
    key(0.15, { legL: { fwd: 56, out: 14, bend: 50 }, legR: { fwd: 56, out: 14, bend: 50 }, spine: { lean: -6 }, head: { nod: -10 } }),
    key(0.5, { legL: { fwd: 40, out: 14, bend: 30 }, legR: { fwd: 40, out: 14, bend: 30 }, spine: { lean: -4 }, head: { nod: -14 }, footL: 30, footR: 30 }),
    key(0.8, { legL: { fwd: 64, out: 14, bend: 90 }, legR: { fwd: 64, out: 14, bend: 90 }, spine: { lean: 6 } }),
  ],
};

/* ---- slide: sitting on the chute, arms up ---- */
const SLIDE_UP: LimbPose = { fwd: 160, out: 30, bend: 20 };
const slide: ClipDef = {
  id: 'slide.down',
  duration: 1.2,
  base: merge(GROUND_SIT, { spine: { lean: -14 }, head: { nod: -10 } }),
  keys: [
    key(0, { armL: SLIDE_UP, armR: add(SLIDE_UP, { fwd: -14, bend: 14 }) }),
    key(0.5, { armL: add(SLIDE_UP, { fwd: -14, bend: 14 }), armR: SLIDE_UP, head: { tilt: 6 } }),
  ],
};

/* ---- ladder (in place; raise the person along the ladder externally) ---- */
const climbKey: Pose = {
  armL: { fwd: 160, out: 14, bend: 30 },
  armR: { fwd: 112, out: 14, twist: -10, bend: 90 },
  legR: { fwd: 62, bend: 104 },
  footR: -30,
  legL: { fwd: 2, bend: 10 },
  spine: { lean: 6 },
  head: { nod: -14 },
};
const ladder: ClipDef = {
  id: 'ladder.climb',
  duration: 1.8,
  keys: [
    key(0, climbKey),
    key(0.25, merge(climbKey, { armR: { fwd: 140, bend: 50 }, legR: { fwd: 30, bend: 50 }, legL: { fwd: 20, bend: 50 }, root: { y: -0.02 } })),
    key(0.5, mirror(climbKey)),
    key(0.75, merge(mirror(climbKey), { armL: { fwd: 140, bend: 50 }, legL: { fwd: 30, bend: 50 }, legR: { fwd: 20, bend: 50 }, root: { y: -0.02 } })),
  ],
};

/* ---- monkey bars: hanging (place the person ~0.5 m up), swinging hand over hand ---- */
const BAR: LimbPose = { fwd: 176, out: 14, bend: 6 };
const monkey: readonly ClipDef[] = [
  {
    id: 'monkeybars.cross',
    duration: 2.2,
    base: { legL: { fwd: 30, bend: 60 }, legR: { fwd: 26, bend: 70 }, footL: 30, footR: 30, head: { nod: -12 } },
    keys: [
      key(0, { armL: BAR, armR: BAR, root: { pitch: -10 } }),
      key(0.25, { armL: BAR, armR: { fwd: 150, out: 10, bend: 10 }, root: { pitch: 10 }, legL: { fwd: -20 }, legR: { fwd: -20 } }),
      key(0.5, { armL: BAR, armR: BAR, root: { pitch: -10 } }),
      key(0.75, { armR: BAR, armL: { fwd: 150, out: 10, bend: 10 }, root: { pitch: 10 }, legL: { fwd: -20 }, legR: { fwd: -20 } }),
    ],
  },
  {
    id: 'monkeybars.swing',
    duration: 1.8,
    base: { armL: BAR, armR: BAR, head: { nod: -8 } },
    keys: [
      key(0, { root: { pitch: -14 }, legL: { fwd: 50, bend: 30 }, legR: { fwd: 50, bend: 30 }, footL: 30, footR: 30 }),
      key(0.5, { root: { pitch: 12 }, legL: { fwd: -10, bend: 70 }, legR: { fwd: -6, bend: 76 }, footL: 30, footR: 30 }),
    ],
  },
];

/* ---- carousel horse: astride the saddle, holding the brass pole ---- */
const ASTRIDE: Pose = {
  root: { y: -0.43 },
  legL: { fwd: 30, out: 26, bend: 50 },
  legR: { fwd: 30, out: 26, bend: 50 },
  footL: -10,
  footR: -10,
};
const POLE_HI: LimbPose = { fwd: 100, out: 6, twist: -30, bend: 60 };
const POLE_LO: LimbPose = { fwd: 70, out: 8, twist: -30, bend: 80 };
const carousel: readonly ClipDef[] = [
  {
    id: 'carousel.ride',
    duration: 4.0,
    base: merge(ASTRIDE, { armR: POLE_HI, armL: POLE_LO }),
    keys: [
      key(0, { head: { turn: 20 }, spine: { lean: 4 } }),
      key(0.35, { head: { turn: -10, nod: -6 }, spine: { lean: -4 } }),
      key(0.65, { head: { turn: 30, tilt: 6 }, spine: { side: 3 } }),
    ],
  },
  {
    id: 'carousel.wave',
    duration: 2.2,
    base: merge(ASTRIDE, { armL: POLE_LO, head: { turn: 40 }, spine: { twist: 10 } }),
    keys: [
      key(0, { armR: { fwd: 160, out: 30, bend: 18, twist: 10 } }),
      key(0.25, { armR: { fwd: 160, out: 54, bend: 34, twist: 10 } }),
      key(0.5, { armR: { fwd: 160, out: 30, bend: 18, twist: 10 } }),
      key(0.75, { armR: { fwd: 160, out: 54, bend: 34, twist: 10 } }),
    ],
  },
];

/* ---- fairground ride seats ---- */
const BAR_HOLD: LimbPose = { fwd: 40, out: 12, twist: -25, bend: 60 };
const ride: readonly ClipDef[] = [
  {
    id: 'ride.cheer',
    duration: 0.9,
    base: SEAT,
    keys: [
      key(0, { armL: { fwd: 150, out: 30, bend: 30 }, armR: { fwd: 150, out: 30, bend: 30 }, head: { nod: -6 } }),
      key(0.5, { armL: { fwd: 176, out: 24, bend: 6 }, armR: { fwd: 176, out: 24, bend: 6 }, head: { nod: -14 }, spine: { lean: -6 } }),
    ],
  },
  {
    id: 'ride.scream',
    duration: 3.0,
    base: SEAT,
    keys: [
      key(0, { armL: BAR_HOLD, armR: BAR_HOLD, spine: { lean: 6 }, head: { nod: 6 } }),
      key(0.2, { armL: add(BAR_HOLD, { bend: 10 }), armR: add(BAR_HOLD, { bend: 10 }), spine: { lean: 10 }, head: { nod: 10 } }),
      key(0.35, { armL: { fwd: 166, out: 30, bend: 16 }, armR: { fwd: 166, out: 30, bend: 16 }, spine: { lean: -14 }, head: { nod: -20 } }),
      key(0.6, { armL: { fwd: 170, out: 36, bend: 12 }, armR: { fwd: 170, out: 36, bend: 12 }, spine: { lean: -16, side: 4 }, head: { nod: -22, tilt: 8 } }),
      key(0.8, { armL: BAR_HOLD, armR: BAR_HOLD, spine: { lean: 2 } }),
    ],
  },
];

/* ---- dodgems: low seat, hands on the wheel ---- */
const WHEEL: LimbPose = { fwd: 45, out: 12, twist: -30, bend: 70 };
const DODGEM_SEAT: Pose = merge(SEAT, { legL: { fwd: 80, bend: 50 }, legR: { fwd: 80, bend: 50 }, footL: 20, footR: 20 });
const turnWheel = (d: number, extra: Pose = {}): Pose =>
  merge({ armL: add(WHEEL, { fwd: 10 * d, out: 4 * d }), armR: add(WHEEL, { fwd: -10 * d, out: -4 * d }), spine: { twist: -6 * d }, head: { turn: -14 * d } }, extra);
const dodgem: readonly ClipDef[] = [
  {
    id: 'dodgem.steer',
    duration: 2.6,
    base: DODGEM_SEAT,
    keys: [key(0, turnWheel(0)), key(0.25, turnWheel(1.2)), key(0.45, turnWheel(0.8)), key(0.7, turnWheel(-1.2, { root: { roll: 3 } })), key(0.88, turnWheel(-0.4))],
  },
  {
    id: 'dodgem.bump',
    duration: 2.2,
    base: DODGEM_SEAT,
    keys: [
      key(0, turnWheel(0.3, { spine: { lean: 8 } })),
      key(0.1, turnWheel(0, { spine: { lean: -16 }, head: { nod: -18 } })),
      key(0.2, turnWheel(-0.3, { spine: { lean: 14 }, head: { nod: 10 } })),
      key(0.35, turnWheel(0, { spine: { lean: -6 }, head: { nod: -14, turn: 20 } })),
      key(0.7, turnWheel(1, { head: { turn: -30 } })),
    ],
  },
];

/* ---- kites: line handle held up in both hands ---- */
const KITE: LimbPose = { fwd: 120, out: 10, twist: -20, bend: 40 };
const kite: readonly ClipDef[] = [
  {
    id: 'kite.fly',
    duration: 3.2,
    base: { head: { nod: -30 } },
    keys: [
      key(0, { armL: KITE, armR: KITE, legL: { fwd: 14, bend: 8 }, legR: { fwd: -8, bend: 6 } }),
      key(0.15, { armL: { fwd: 84, out: 10, twist: -30, bend: 74 }, armR: { fwd: 84, out: 10, twist: -30, bend: 74 }, spine: { lean: -6 }, legL: { fwd: 22, bend: 12 }, legR: { fwd: -14, bend: 8 }, root: { y: -0.02 } }),
      key(0.4, { armL: add(KITE, { fwd: 10 }), armR: add(KITE, { fwd: 10 }), legL: { fwd: 14, bend: 8 }, legR: { fwd: -8, bend: 6 }, head: { turn: 10 } }),
      key(0.55, { armL: { fwd: 90, out: 10, twist: -30, bend: 64 }, armR: { fwd: 90, out: 10, twist: -30, bend: 64 }, spine: { lean: -4 }, legL: { fwd: 18, bend: 10 }, legR: { fwd: -12, bend: 6 } }),
      key(0.8, { armL: KITE, armR: KITE, legL: { fwd: 14, bend: 8 }, legR: { fwd: -8, bend: 6 }, head: { turn: -8 } }),
    ],
  },
  {
    id: 'kite.run',
    duration: 0.8,
    stride: 1.6,
    ease: 'linear',
    keys: gaitKeys({
      front: { fwd: 34, bend: 18 },
      back: { fwd: -22, bend: 34 },
      lift: { fwd: 40, bend: 90 },
      stance: { fwd: 6, bend: 24 },
      footFront: -10,
      footBack: 26,
      footLift: 20,
      lowY: -0.025,
      highY: 0.025,
      lean: 2,
      twist: 4,
      upper: (i) => ({
        armR: { fwd: 140, out: 20, bend: 20 },
        armL: { fwd: i === 0 ? -20 : i === 2 ? 30 : 6, out: 10, bend: 70 },
        head: { nod: -26, turn: 10 },
      }),
    }),
  },
];

/* ---- bicycle: hips on the saddle (~0.85 m) with the person placed on the ground; root y -0.05 ---- */
const BIKE: readonly [LimbPose, LimbPose, LimbPose, LimbPose] = [
  { fwd: 89, bend: 120 },
  { fwd: 72, bend: 76 },
  { fwd: 43, bend: 55 },
  { fwd: 52, bend: 100 },
];
const pedal = (i: number, upper: Pose): Pose => {
  const l = BIKE[i % 4] ?? BIKE[0];
  const r = BIKE[(i + 2) % 4] ?? BIKE[0];
  const flat = (a: LimbPose): number => ((a.fwd ?? 0) - (a.bend ?? 0)) * 0.6;
  return merge({ root: { y: -0.05 }, legL: l, legR: r, footL: flat(l), footR: flat(r) }, upper);
};
const BARS: LimbPose = { fwd: 60, out: 12, twist: -20, bend: 30 };
const bike: readonly ClipDef[] = [
  {
    id: 'bike.pedal',
    duration: 0.85,
    stride: 3.0,
    ease: 'linear',
    keys: [0, 1, 2, 3].map((i) => key(i / 4, pedal(i, { armL: BARS, armR: BARS, spine: { lean: 25, twist: [2, 0, -2, 0][i] ?? 0 }, head: { nod: -16 } }))),
  },
  {
    id: 'bike.cruise',
    duration: 1.2,
    stride: 3.0,
    ease: 'linear',
    keys: [0, 1, 2, 3].map((i) =>
      key(i / 4, pedal(i, { armL: add(BARS, { fwd: -14, bend: 20 }), armR: add(BARS, { fwd: -14, bend: 20 }), spine: { lean: 8 }, head: { turn: [10, 14, 6, 0][i] ?? 0 } })),
    ),
  },
];

/* ---- kick scooter: left foot on the deck, right foot pushes ---- */
const SCOOT_BAR: LimbPose = { fwd: 44, out: 12, twist: -25, bend: 36 };
const scooter: readonly ClipDef[] = [
  {
    id: 'scooter.push',
    duration: 1.2,
    stride: 1.6,
    base: { root: { y: 0.05 }, legL: { fwd: 6, bend: 16 }, footL: -10, armL: SCOOT_BAR, armR: SCOOT_BAR, spine: { lean: 8 } },
    keys: [
      key(0, { legR: { fwd: 14, bend: 16 }, footR: -4, root: { y: -0.03 } }),
      key(0.3, { legR: { fwd: -36, bend: 8 }, footR: 30, root: { y: -0.02 } }),
      key(0.55, { legR: { fwd: -10, bend: 70 }, footR: 20 }),
      key(0.8, { legR: { fwd: 20, bend: 40 }, footR: 0 }),
    ],
  },
  {
    id: 'scooter.glide',
    duration: 2.0,
    stride: 2.4,
    base: { root: { y: 0.06 }, legL: { fwd: 6, bend: 10 }, legR: { fwd: -10, bend: 14 }, footR: 20, armL: SCOOT_BAR, armR: SCOOT_BAR },
    keys: [
      key(0, { root: { roll: 2 }, head: { turn: 10 } }),
      key(0.5, { root: { roll: -2 }, head: { turn: -10 }, spine: { lean: 4 } }),
    ],
  },
];

/* ---- wheelchair: hands push the rims ---- */
const wheelchair: readonly ClipDef[] = [
  {
    id: 'wheelchair.push',
    duration: 1.4,
    stride: 1.0,
    base: SEAT,
    keys: [
      key(0, { armL: { fwd: -20, out: 16, bend: 30 }, armR: { fwd: -20, out: 16, bend: 30 }, spine: { lean: 0 } }),
      key(0.35, { armL: { fwd: 30, out: 16, bend: 10 }, armR: { fwd: 30, out: 16, bend: 10 }, spine: { lean: 12 }, head: { nod: 4 } }),
      key(0.65, { armL: { fwd: 0, out: 26, bend: 40 }, armR: { fwd: 0, out: 26, bend: 40 }, spine: { lean: 4 } }),
    ],
  },
  {
    id: 'wheelchair.idle',
    duration: 6.0,
    base: SEAT,
    keys: [
      key(0, { armL: { fwd: 30, out: 10, twist: -20, bend: 60 }, armR: ARM_REST, head: { turn: 16 } }),
      key(0.4, { armL: { fwd: 30, out: 10, twist: -20, bend: 60 }, armR: { fwd: 0, out: 18, bend: 20 }, head: { turn: -20, nod: 4 } }),
      key(0.75, { armL: { fwd: 34, out: 10, twist: -20, bend: 64 }, armR: { fwd: 4, out: 18, bend: 24 }, head: { turn: 6, nod: -4 } }),
    ],
  },
];

export const RIDE_CLIPS: readonly ClipDef[] = [
  ...swing,
  seesaw,
  slide,
  ladder,
  ...monkey,
  ...carousel,
  ...ride,
  ...dodgem,
  ...kite,
  ...bike,
  ...scooter,
  ...wheelchair,
];
