/**
 * Parade marching (locomotion with stride) and dancing.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_REST, HANDS_ON_HIPS, armSwing, gaitKeys, key, level, merge, mirror, squat } from './helpers';
import type { GaitSpec } from './helpers';
import { snareHit } from './music-percussion-keys';
import { trumpetPose } from './music-strings-brass';

/* ---- march: high-knee parade step ---- */
const MARCH: Omit<GaitSpec, 'upper'> = {
  front: { fwd: 30, bend: 10 },
  back: { fwd: -14, bend: 12 },
  lift: { fwd: 70, bend: 92 },
  stance: { fwd: 2, bend: 2 },
  footFront: -6,
  footBack: 14,
  footLift: 30,
  lowY: -0.012,
  highY: 0.02,
  lean: -3,
  twist: 0,
};
const FLAG_R: LimbPose = { fwd: 52, out: 8, twist: -30, bend: 74 };
const FLAG_L: LimbPose = { fwd: 30, out: 10, twist: -36, bend: 64 };
const BATON_UP: LimbPose = { fwd: 152, out: 22, bend: 30 };

const march: readonly ClipDef[] = [
  {
    id: 'march.band',
    duration: 1.2,
    stride: 1.0,
    keys: gaitKeys({
      ...MARCH,
      upper: armSwing({ fwd: 32, out: 6, bend: 8 }, { fwd: -24, out: 6, bend: 6 }, { fwd: 4, out: 6, bend: 8 }),
    }),
  },
  {
    id: 'march.drummer',
    duration: 1.2,
    stride: 0.95,
    keys: gaitKeys({ ...MARCH, upper: (i) => snareHit(i % 2 === 0 ? 1 : 0.1, i % 2 === 0 ? 0.1 : 1) }),
  },
  {
    id: 'march.trumpet',
    duration: 1.2,
    stride: 0.95,
    keys: gaitKeys({ ...MARCH, upper: (i) => trumpetPose(i % 2 === 0 ? 12 : 16) }),
  },
  {
    id: 'march.leader',
    duration: 1.3,
    stride: 1.0,
    keys: gaitKeys({
      ...MARCH,
      lean: -6,
      upper: (i) => ({
        armL: HANDS_ON_HIPS,
        armR: { ...BATON_UP, twist: [-40, 0, 40, 0][i] ?? 0, out: i === 1 ? 34 : 22 },
        gripR: { pitch: level(BATON_UP).pitch, roll: [-70, 0, 70, 0][i] ?? 0 },
        head: { nod: -6 },
      }),
    }),
  },
  {
    id: 'march.flag',
    duration: 1.3,
    stride: 1.0,
    keys: gaitKeys({
      ...MARCH,
      lift: { fwd: 52, bend: 70 },
      lean: -6,
      upper: (i) => ({
        armR: FLAG_R,
        armL: FLAG_L,
        gripR: level(FLAG_R, i === 1 ? 4 : 0),
        gripL: level(FLAG_L, i === 1 ? 4 : 0),
        head: { nod: -5 },
      }),
    }),
  },
];

/* ---- twirl ---- */
const UP_L: LimbPose = { fwd: 168, out: 26, bend: 22 };
const OPEN: LimbPose = { fwd: 70, out: 70, twist: 30, bend: 20 };
const twirl: readonly ClipDef[] = [
  {
    id: 'twirl.spin',
    duration: 3.2,
    keys: [
      key(0, merge(squat(10, 22), { armL: { fwd: 40, out: 30, bend: 70 }, armR: { fwd: 40, out: 30, bend: 70 } })),
      key(0.3, { root: { yaw: 360, y: 0.03 }, armL: UP_L, armR: { ...UP_L, out: 18 }, footL: 26, footR: 26 }),
      key(0.42, { root: { yaw: 360 }, armL: OPEN, armR: OPEN, head: { nod: -6 } }),
      key(0.52, merge(squat(10, 22), { root: { yaw: 360 }, armL: { fwd: 40, out: 30, bend: 70 }, armR: { fwd: 40, out: 30, bend: 70 } })),
      key(0.82, { root: { yaw: 0, y: 0.03 }, armL: UP_L, armR: { ...UP_L, out: 18 }, footL: 26, footR: 26 }),
      key(0.92, { armL: OPEN, armR: OPEN, head: { nod: -6, tilt: 6 } }),
    ],
  },
  {
    id: 'twirl.skirt',
    duration: 2.6,
    keys: [
      key(0, { armL: { fwd: 20, out: 40, bend: 20 }, armR: { fwd: 20, out: 40, bend: 20 }, root: { yaw: -40 } }),
      key(0.35, { root: { yaw: 140, y: 0.02 }, armL: { fwd: 30, out: 70, bend: 10 }, armR: { fwd: 30, out: 70, bend: 10 }, footL: 20, footR: 20, head: { nod: -8 } }),
      key(0.5, { root: { yaw: 140 }, armL: { fwd: 20, out: 46, bend: 20 }, armR: { fwd: 20, out: 46, bend: 20 }, head: { tilt: 8 } }),
      key(0.85, { root: { yaw: -40, y: 0.02 }, armL: { fwd: 30, out: 70, bend: 10 }, armR: { fwd: 30, out: 70, bend: 10 }, footL: 20, footR: 20 }),
    ],
  },
];

/* ---- waltz: two bars of box step with down-up-up rise and fall ---- */
const waltzStep = (beat: number, back: boolean): Pose => {
  const s = back ? -1 : 1;
  const down = beat % 3 === 0;
  const legs: readonly Pose[] = [
    { legL: { fwd: 22 * s, bend: 10 }, legR: { fwd: -6 * s, bend: 14 } },
    { legL: { fwd: 4 * s, bend: 2 }, legR: { out: 14, bend: 2 } },
    { legL: { bend: 2 }, legR: { bend: 2 } },
    { legR: { fwd: -20 * s, bend: 10 }, legL: { fwd: 6 * s, bend: 14 } },
    { legR: { fwd: -4 * s, bend: 2 }, legL: { out: 14, bend: 2 } },
    { legL: { bend: 2 }, legR: { bend: 2 } },
  ];
  const p = merge(legs[beat] ?? {}, {
    root: { y: down ? -0.03 : 0.015, yaw: beat * 4 - 10 },
    footL: down ? 0 : 14,
    footR: down ? 0 : 14,
  });
  return back ? mirror(p) : p;
};
const HOLD_UP: LimbPose = { fwd: 70, out: 60, twist: 40, bend: 80 };
const waltz: readonly ClipDef[] = [
  {
    id: 'waltz.lead',
    duration: 2.6,
    base: { armL: HOLD_UP, armR: { fwd: 62, out: 16, twist: -44, bend: 96 }, head: { turn: 14, nod: -4 } },
    keys: [0, 1, 2, 3, 4, 5].map((b) => key(b / 6, waltzStep(b, false))),
  },
  {
    id: 'waltz.follow',
    duration: 2.6,
    base: { armR: HOLD_UP, armL: { fwd: 80, out: 10, twist: -30, bend: 60 }, head: { turn: -16, nod: -6, tilt: 4 } },
    keys: [0, 1, 2, 3, 4, 5].map((b) => key(b / 6, waltzStep(b, true))),
  },
];

/* ---- jig: hop and kick ---- */
const jigHalf = (arms: Pose): readonly Pose[] => [
  merge(squat(10, 22), arms),
  merge({ root: { y: 0.05 }, legL: { fwd: 2, bend: 6 }, legR: { fwd: 58, bend: 8 }, footL: 30, footR: 34 }, arms),
  merge(squat(10, 22), arms),
  merge({ root: { y: 0.03 }, legL: { fwd: 2, bend: 6 }, legR: { fwd: -18, bend: 96 }, footL: 26, footR: 36 }, arms),
];
const jigKeys = (arms: Pose): ClipDef['keys'] => {
  const half = jigHalf(arms);
  return [...half, ...half.map(mirror)].map((p, i) => key(i / 8, p));
};
const jig: readonly ClipDef[] = [
  { id: 'jig.kick', duration: 1.6, keys: jigKeys({ armL: { fwd: 0, out: 5, bend: 2 }, armR: { fwd: 0, out: 5, bend: 2 }, head: { nod: -4 } }) },
  { id: 'jig.hands-hips', duration: 1.8, keys: jigKeys({ armL: HANDS_ON_HIPS, armR: HANDS_ON_HIPS, head: { nod: -2 } }) },
];

/* ---- hands-up sway ---- */
const swayKey: Pose = {
  root: { x: 0.04, roll: 3 },
  spine: { side: -6 },
  armL: { fwd: 165, out: 30, bend: 18 },
  armR: { fwd: 158, out: 22, bend: 26 },
  head: { tilt: -5, nod: -6 },
};
const sway: readonly ClipDef[] = [
  {
    id: 'sway.hands-up',
    duration: 2.4,
    keys: [
      key(0, swayKey),
      key(0.25, merge(squat(10, 22), { armL: { fwd: 170, out: 24, bend: 12 }, armR: { fwd: 170, out: 24, bend: 12 } })),
      key(0.5, mirror(swayKey)),
      key(0.75, merge(squat(10, 22), { armL: { fwd: 170, out: 24, bend: 12 }, armR: { fwd: 170, out: 24, bend: 12 } })),
    ],
  },
  {
    id: 'sway.wave',
    duration: 3.0,
    keys: [
      key(0, merge(swayKey, { armR: { fwd: 150, out: -4, bend: 10 }, armL: { fwd: 150, out: 50, bend: 10 } })),
      key(0.5, merge(mirror(swayKey), { armL: { fwd: 150, out: -4, bend: 10 }, armR: { fwd: 150, out: 50, bend: 10 } })),
    ],
  },
];

/* ---- conga line: 1-2-3-kick over two bars, hands on the shoulders ahead ---- */
const step = (lead: 'L' | 'R', roll: number): Pose => {
  const p: Pose = { legL: { fwd: 16, bend: 8 }, legR: { fwd: -10, bend: 14 }, root: { roll, y: -0.012 }, footR: 10 };
  return lead === 'L' ? p : mirror(p);
};
const kick = (side: 'L' | 'R'): Pose => {
  const p: Pose = { legL: { fwd: 14, out: 34, bend: 2 }, legR: { fwd: 0, bend: 10 }, footL: 24, root: { roll: -4, y: 0.01 }, spine: { side: 6 } };
  return side === 'L' ? p : mirror(p);
};
const congaArms: Pose = { armL: { fwd: 80, out: 10, twist: -10, bend: 20 }, armR: { fwd: 80, out: 10, twist: -10, bend: 20 }, spine: { lean: 6 } };
const conga: ClipDef = {
  id: 'conga.shuffle',
  duration: 3.2,
  stride: 1.4,
  keys: [step('R', 3), step('L', -3), step('R', 3), kick('L'), step('L', -3), step('R', 3), step('L', -3), kick('R')].map(
    (p, i) => key(i / 8, merge(p, congaArms)),
  ),
};

/* ---- ballet ---- */
const arabesque = (wob: number): Pose => ({
  root: { pitch: 22 + wob, roll: wob * 0.6 },
  legL: { fwd: 22 + wob, bend: 0 },
  legR: { fwd: -58 + wob, out: 4, bend: 0 },
  footR: 40,
  armL: { fwd: 98 - wob * 2, out: 10, bend: 10 },
  armR: { fwd: 8, out: 96 + wob * 2, twist: 10, bend: 10 },
  head: { nod: -24 },
});
const ballet: readonly ClipDef[] = [
  {
    id: 'ballet.arabesque',
    duration: 4.0,
    keys: [key(0, arabesque(0)), key(0.3, arabesque(1.5)), key(0.55, arabesque(-1)), key(0.8, arabesque(0.8))],
  },
  {
    id: 'ballet.plie',
    duration: 4.0,
    base: { legL: { out: 18, twist: 40 }, legR: { out: 18, twist: 40 } },
    keys: [
      key(0, { armL: { fwd: 30, out: 40, twist: -20, bend: 40 }, armR: { fwd: 30, out: 40, twist: -20, bend: 40 }, footL: 0 }),
      key(0.35, merge(squat(30, 64, 0), { armL: { fwd: 60, out: 30, twist: -30, bend: 60 }, armR: { fwd: 60, out: 30, twist: -30, bend: 60 }, head: { nod: 8 } })),
      key(0.6, { armL: { fwd: 168, out: 24, bend: 30 }, armR: { fwd: 168, out: 24, bend: 30 }, footL: 30, footR: 30, root: { y: 0.04 }, head: { nod: -10 } }),
      key(0.82, { armL: { fwd: 20, out: 70, twist: 20, bend: 20 }, armR: { fwd: 20, out: 70, twist: 20, bend: 20 }, head: { turn: 14 } }),
    ],
  },
];

/* ---- robot: snap to a pose, hold, snap ---- */
const R1: Pose = { armL: { out: 80, twist: 90, bend: 90 }, armR: { out: 80, twist: -90, bend: 90 }, head: { turn: 30 } };
const R2: Pose = { armL: { fwd: 90, bend: 90 }, armR: { fwd: 90, bend: 90 }, spine: { twist: 14 } };
const R3: Pose = merge(squat(8, 18), { armL: { fwd: 90, bend: 0 }, armR: { fwd: 0, out: 10, bend: 90 }, head: { turn: -30 } });
const robotKeys = (poses: readonly Pose[]): ClipDef['keys'] =>
  poses.flatMap((p, i) => [key(i / poses.length, p), key((i + 0.75) / poses.length, merge(p, { head: { nod: 2 } }))]);
const robot: readonly ClipDef[] = [
  { id: 'robot.pop', duration: 3.2, keys: robotKeys([R1, R2, R3, mirror(R1)]) },
  { id: 'robot.wave', duration: 2.4, keys: robotKeys([R2, mirror(R1), R1, merge(R2, { spine: { twist: -14 } })]) },
];

/* ---- hip swing with clap ---- */
const CLAP: LimbPose = { fwd: 50, out: 10, twist: -42, bend: 96 };
const CLAP_OPEN: LimbPose = { fwd: 46, out: 34, twist: -6, bend: 86 };
const hip: Pose = { root: { x: 0.05, roll: 4 }, spine: { side: -6 }, armL: CLAP, armR: CLAP, head: { tilt: -4 } };
const groove: readonly ClipDef[] = [
  {
    id: 'groove.hip-clap',
    duration: 1.6,
    keys: [
      key(0, hip),
      key(0.25, { armL: CLAP_OPEN, armR: CLAP_OPEN, root: { y: -0.02 }, legL: { fwd: 8, bend: 16 }, legR: { fwd: 8, bend: 16 } }),
      key(0.5, mirror(hip)),
      key(0.75, { armL: CLAP_OPEN, armR: CLAP_OPEN, root: { y: -0.02 }, legL: { fwd: 8, bend: 16 }, legR: { fwd: 8, bend: 16 } }),
    ],
  },
  {
    id: 'groove.shimmy',
    duration: 1.2,
    keys: [
      key(0, { root: { x: 0.03, roll: 3 }, spine: { twist: 10 }, armL: { fwd: 30, out: 40, bend: 80 }, armR: { fwd: 30, out: 40, bend: 80 } }),
      key(0.5, { root: { x: -0.03, roll: -3 }, spine: { twist: -10 }, armL: { fwd: 30, out: 40, bend: 80 }, armR: { fwd: 30, out: 40, bend: 80 } }),
    ],
  },
];

/* ---- ribbon dance: right arm sweeps big circles; the ribbon stick extends the forearm ---- */
const CIRCLE: readonly LimbPose[] = [
  { fwd: 10, out: 14, bend: 10 },
  { fwd: 10, out: 90, bend: 6 },
  { fwd: 0, out: 165, bend: 6 },
  { fwd: 150, out: -6, bend: 10 },
  { fwd: 70, out: -10, twist: -30, bend: 14 },
];
const ribbon: readonly ClipDef[] = [
  {
    id: 'ribbon.circles',
    duration: 2.4,
    ease: 'linear',
    keys: CIRCLE.map((a, i) =>
      key(i / CIRCLE.length, { armR: a, armL: { fwd: 10, out: 50, bend: 20 }, spine: { side: i === 2 ? 6 : i === 4 ? -4 : 0 }, head: { turn: -10 + i * 5 } }),
    ),
  },
  {
    id: 'ribbon.spiral',
    duration: 3.6,
    keys: [
      ...CIRCLE.map((a, i) => key(i * 0.12, { armR: a, armL: { fwd: 20, out: 60, bend: 20 }, root: { yaw: i * 18 } })),
      key(0.62, merge(squat(14, 30), { armR: { fwd: 30, out: 40, bend: 10 }, armL: ARM_REST, root: { yaw: 70 } })),
      key(0.8, { armR: { fwd: 170, out: 30, bend: 8 }, armL: { fwd: 40, out: 70, bend: 10 }, root: { yaw: 30, y: 0.02 }, footL: 20, footR: 20 }),
    ],
  },
];

export const MARCH_DANCE_CLIPS: readonly ClipDef[] = [
  ...march,
  ...twirl,
  ...waltz,
  ...jig,
  ...sway,
  conga,
  ...ballet,
  ...robot,
  ...groove,
  ...ribbon,
];
