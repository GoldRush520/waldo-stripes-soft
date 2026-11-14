/**
 * In the water: swimming strokes, floating, treading water, diving, splashing, surfing.
 * Swimmers are placed with their ground point at the water surface; root y ≈ -1.0 lays the body
 * along the surface (pitch 80 = face down, -84 = on the back), -1.44 keeps just the head above water.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARMS_BALANCE, ARM_REST, add, key, merge, mirror, squat } from './helpers';

/* ---- front crawl: arms windmill half a cycle apart, recovery goes out to the side ---- */
const CRAWL: readonly [LimbPose, LimbPose, LimbPose, LimbPose] = [
  { fwd: 175, out: 10, bend: 10 },
  { fwd: 100, out: 4, bend: 40 },
  { fwd: 12, out: 10, bend: 20 },
  { fwd: 80, out: 80, twist: 10, bend: 90 },
];
const crawlKey = (i: number): Pose => ({
  root: { pitch: 80, y: -1.0 },
  armL: CRAWL[i % 4] ?? CRAWL[0],
  armR: CRAWL[(i + 2) % 4] ?? CRAWL[0],
  legL: { fwd: i % 2 === 0 ? 10 : -8, bend: i % 2 === 0 ? 8 : 20 },
  legR: { fwd: i % 2 === 0 ? -8 : 10, bend: i % 2 === 0 ? 20 : 8 },
  footL: 50,
  footR: 50,
  spine: { twist: [10, 4, -10, -4][i] ?? 0 },
  head: { nod: -30, turn: i === 1 ? -50 : i === 0 || i === 2 ? -12 : 0 },
});

/* ---- breaststroke: glide, sweep and breathe, tuck and kick ---- */
const BR_GLIDE: Pose = {
  root: { pitch: 78, y: -1.0 },
  armL: { fwd: 172, out: 8 },
  armR: { fwd: 172, out: 8 },
  legL: { out: 4 },
  legR: { out: 4 },
  footL: 50,
  footR: 50,
  head: { nod: -20 },
};
const BR_SWEEP: Pose = merge(BR_GLIDE, {
  root: { pitch: 70 },
  armL: { fwd: 140, out: 50, bend: 20 },
  armR: { fwd: 140, out: 50, bend: 20 },
  head: { nod: -44 },
});
const BR_TUCK: Pose = merge(BR_GLIDE, {
  root: { pitch: 66 },
  armL: { fwd: 100, out: 20, twist: -40, bend: 120 },
  armR: { fwd: 100, out: 20, twist: -40, bend: 120 },
  legL: { fwd: 30, out: 26, twist: 30, bend: 110 },
  legR: { fwd: 30, out: 26, twist: 30, bend: 110 },
  footL: -20,
  footR: -20,
  head: { nod: -40 },
});
const BR_KICK: Pose = merge(BR_GLIDE, {
  armL: { fwd: 160, out: 10, bend: 30 },
  armR: { fwd: 160, out: 10, bend: 30 },
  legL: { fwd: 6, out: 30, bend: 24 },
  legR: { fwd: 6, out: 30, bend: 24 },
  footL: 20,
  footR: 20,
});

const FLOAT: Pose = {
  root: { pitch: -84, y: -1.0 },
  armL: { fwd: 10, out: 70, bend: 20 },
  armR: { fwd: 10, out: 70, bend: 20 },
  legL: { out: 12, bend: 6 },
  legR: { out: 12, bend: 6 },
  footL: 40,
  footR: 40,
  head: { nod: -8 },
};

/* ---- treading water: eggbeater legs, sculling hands just below the surface ---- */
const TREAD_Y = -1.44;
const egg = (i: number): Pose => ({
  root: { y: TREAD_Y + (i % 2 === 0 ? 0.015 : -0.015) },
  legL: i % 2 === 0 ? { fwd: 40, out: 22, twist: 20, bend: 90 } : { fwd: 20, out: 14, bend: 40 },
  legR: i % 2 === 0 ? { fwd: 20, out: 14, bend: 40 } : { fwd: 40, out: 22, twist: 20, bend: 90 },
  armL: { fwd: 34, out: i % 2 === 0 ? 60 : 36, twist: -20, bend: 40 },
});

const swim: readonly ClipDef[] = [
  { id: 'swim.crawl', duration: 1.4, stride: 1.5, ease: 'linear', keys: [0, 1, 2, 3].map((i) => key(i / 4, crawlKey(i))) },
  {
    id: 'swim.breast',
    duration: 1.9,
    stride: 1.2,
    keys: [key(0, BR_GLIDE), key(0.3, BR_SWEEP), key(0.45, BR_TUCK), key(0.58, BR_KICK), key(0.72, merge(BR_GLIDE, { head: { nod: -18 } }))],
  },
  {
    id: 'swim.float',
    duration: 5.0,
    keys: [
      key(0, FLOAT),
      key(0.3, merge(FLOAT, { root: { y: -0.985 }, armL: { out: 74, twist: 20 }, armR: { out: 66, twist: -10 } })),
      key(0.6, merge(FLOAT, { root: { y: -1.01 }, armL: { out: 66, twist: -10 }, armR: { out: 74, twist: 20 }, head: { turn: 14 } })),
    ],
  },
  {
    id: 'swim.tread-wave',
    duration: 1.6,
    keys: [0, 1, 2, 3].map((i) =>
      key(i / 4, merge(egg(i), { armR: { fwd: 168, out: i % 2 === 0 ? 28 : 52, twist: 10, bend: i % 2 === 0 ? 18 : 34 }, head: { nod: -6 } })),
    ),
  },
  {
    id: 'swim.tread',
    duration: 2.4,
    keys: [0, 1, 2, 3].map((i) =>
      key(i / 4, merge(egg(i), { armR: { fwd: 34, out: i % 2 === 0 ? 60 : 36, twist: -20, bend: 40 }, head: { turn: [20, 6, -20, -6][i] ?? 0 } })),
    ),
  },
];

/* ---- diving board ---- */
const DIVE: Pose = {
  root: { y: 0.04, pitch: 6 },
  armL: { fwd: 178, out: 4, bend: 0 },
  armR: { fwd: 178, out: 4, bend: 0 },
  footL: 40,
  footR: 40,
  legL: { fwd: 6 },
  legR: { fwd: 6 },
  head: { nod: 12 },
};
const dive: readonly ClipDef[] = [
  { id: 'dive.pose', duration: 6, keys: [key(0, DIVE), key(0.5, merge(DIVE, { root: { y: 0.042, pitch: 6.8 }, spine: { lean: 1 } }))] },
  {
    id: 'dive.ready',
    duration: 2.6,
    keys: [
      key(0, merge(squat(20, 40), { armL: { fwd: 10, out: 8 }, armR: { fwd: 10, out: 8 }, spine: { lean: 10 }, head: { nod: 6 } })),
      key(0.35, merge(squat(46, 90), { armL: { fwd: -40, out: 10, bend: 4 }, armR: { fwd: -40, out: 10, bend: 4 }, spine: { lean: 30 }, head: { nod: -10 } })),
      key(0.55, merge(squat(40, 80), { armL: { fwd: -46, out: 10, bend: 4 }, armR: { fwd: -46, out: 10, bend: 4 }, spine: { lean: 34 }, head: { nod: -14 } })),
      key(0.8, merge(squat(22, 44), { armL: { fwd: 90, out: 10, bend: 6 }, armR: { fwd: 90, out: 10, bend: 6 }, spine: { lean: 14 } })),
    ],
  },
];

/* ---- splashing in the shallows ---- */
const SCOOP: LimbPose = { fwd: 40, out: 14, twist: -20, bend: 10 };
const FLING: LimbPose = { fwd: 124, out: 32, twist: 10, bend: 12 };
const splash: readonly ClipDef[] = [
  {
    id: 'splash.play',
    duration: 1.9,
    keys: [
      key(0, merge(squat(30, 50), { armL: SCOOP, armR: SCOOP, spine: { lean: 40 }, head: { nod: 10 } })),
      key(0.18, merge(squat(36, 60), { armL: add(SCOOP, { fwd: -10 }), armR: add(SCOOP, { fwd: -10 }), spine: { lean: 44 } })),
      key(0.32, { armL: FLING, armR: FLING, spine: { lean: -6 }, head: { nod: -14 }, root: { y: 0.01 } }),
      key(0.5, { armL: add(FLING, { fwd: -20 }), armR: add(FLING, { fwd: -20 }), spine: { lean: -8, side: 4 }, head: { nod: -16, tilt: 8 } }),
      key(0.75, merge(squat(14, 30), { armL: ARM_REST, armR: ARM_REST, spine: { lean: 10 }, head: { turn: 14 } })),
    ],
  },
  {
    id: 'splash.kick',
    duration: 1.4,
    base: { armL: ARMS_BALANCE, armR: add(ARMS_BALANCE, { out: -20 }) },
    keys: [
      key(0, { legR: { fwd: -24, bend: 40 }, footR: 20, spine: { lean: 6 } }),
      key(0.22, { legR: { fwd: 46, bend: 12 }, footR: 30, spine: { lean: -6 }, head: { nod: -8 }, root: { y: 0.01 } }),
      key(0.4, { legR: { fwd: 10, bend: 8 }, root: { y: -0.01 } }),
      key(0.62, mirror({ legR: { fwd: 46, bend: 12 }, footR: 30, spine: { lean: -6 }, root: { y: 0.01 } })),
      key(0.8, { legL: { fwd: -10, bend: 30 }, legR: { bend: 6 } }),
    ],
  },
];

/* ---- surfing: sideways on the board (body yawed 80 deg from the board heading) ---- */
const SURF_LEGS: Pose = {
  root: { yaw: 80, y: -0.09 },
  legL: { fwd: 16, out: 20, bend: 36 },
  legR: { fwd: 16, out: 20, bend: 36 },
  footL: -20,
  footR: -20,
  head: { turn: -66 },
};
const surfTilt = (r: number, dy: number): Pose => ({
  root: { roll: r, y: dy },
  spine: { side: -r, lean: 14 },
  armL: { fwd: 20, out: 70 - r * 3, bend: 30 },
  armR: { fwd: 30, out: 60 + r * 3, bend: 20 },
});
const surf: readonly ClipDef[] = [
  {
    id: 'surf.stance',
    duration: 3.0,
    base: SURF_LEGS,
    keys: [key(0, surfTilt(0, 0)), key(0.3, surfTilt(4, -0.02)), key(0.55, surfTilt(-2, 0.01)), key(0.8, surfTilt(-4, -0.015))],
  },
  {
    id: 'surf.paddle',
    duration: 1.6,
    stride: 1.0,
    ease: 'linear',
    keys: [0, 1, 2, 3].map((i) =>
      key(
        i / 4,
        merge(crawlKey(i), {
          root: { pitch: 88, y: -0.76 },
          armL: add(CRAWL[i % 4] ?? CRAWL[0], { out: 10 }),
          armR: add(CRAWL[(i + 2) % 4] ?? CRAWL[0], { out: 10 }),
          legL: { fwd: -4, bend: 30 },
          legR: { fwd: -4, bend: 30 },
          head: { nod: -50, turn: 0 },
          spine: { lean: -14, twist: 0 },
        }),
      ),
    ),
  },
];

export const WATER_SWIM_CLIPS: readonly ClipDef[] = [...swim, ...dive, ...splash, ...surf];
