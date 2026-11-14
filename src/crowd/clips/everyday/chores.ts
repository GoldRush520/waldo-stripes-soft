/**
 * Cleaning, gardening and laundry. Long-handled tools are held in the right hand with the grip
 * pitched so the tool head trails forward-down toward the ground.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_HIP, KNEEL, gaitKeys, gaitStride, level, planted, squat, walkWith } from './helpers';

/** grip pitch for a long tool whose head should point forward-down by `drop` degrees from vertical */
const tool = (arm: LimbPose, drop: number): { readonly pitch: number } => ({ pitch: level(arm).pitch - drop });

const sweep = (twist: number, reach: number): Pose => {
  const armR: LimbPose = { fwd: 26 + reach, out: 12 - twist * 0.4, bend: 30, twist: -10 };
  return planted({
    spine: { lean: 14, twist },
    legL: { fwd: 8, out: 8, bend: 14 },
    legR: { fwd: -4, out: 8, bend: 10 },
    armL: { fwd: 34, out: 2, bend: 78, twist: -36 },
    armR,
    gripR: tool(armR, 34),
    head: { nod: 18, turn: twist * 0.4 },
  });
};

const mop = (twist: number, reach: number): Pose => {
  const armR: LimbPose = { fwd: 34 + reach, out: 10, bend: 22, twist: -10 };
  return planted({
    spine: { lean: 20, twist },
    legL: { fwd: 12, out: 10, bend: 18 },
    legR: { fwd: 4, out: 10, bend: 14 },
    armL: { fwd: 46 + reach * 0.5, out: 0, bend: 60, twist: -40 },
    armR,
    gripR: tool(armR, 40),
    head: { nod: 20 },
  });
};

const windowArm = (dFwd: number, dOut: number): LimbPose => ({ fwd: 104 + dFwd, out: 22 + dOut, bend: 40, twist: -16 });

const CLEAN_CLIPS: readonly ClipDef[] = [
  {
    id: 'clean.sweep',
    duration: 4,
    keys: [
      { t: 0, pose: sweep(14, 14) },
      { t: 0.18, pose: sweep(-12, 0) },
      { t: 0.32, pose: sweep(12, 14) },
      { t: 0.5, pose: sweep(-14, 0) },
      { t: 0.64, pose: { ...sweep(0, 6), head: { nod: -4, turn: 20 }, spine: { lean: 4 } } },
      { t: 0.82, pose: sweep(-10, 2) },
    ],
  },
  {
    id: 'clean.mop',
    duration: 4.5,
    keys: [
      { t: 0, pose: mop(16, 10) },
      { t: 0.15, pose: mop(0, 24) },
      { t: 0.3, pose: mop(-16, 10) },
      { t: 0.45, pose: mop(0, 0) },
      { t: 0.6, pose: mop(16, 10) },
      { t: 0.72, pose: { ...mop(0, 4), spine: { lean: 4 }, head: { nod: -6, turn: 16 } } },
      { t: 0.88, pose: mop(-10, 4) },
    ],
  },
  {
    id: 'clean.window',
    duration: 4,
    base: { armL: ARM_HIP, head: { nod: -10 } },
    keys: [
      { t: 0, pose: { armR: windowArm(0, -12) } },
      { t: 0.1, pose: { armR: windowArm(14, 0) } },
      { t: 0.2, pose: { armR: windowArm(0, 14) } },
      { t: 0.3, pose: { armR: windowArm(-14, 0) } },
      { t: 0.4, pose: { armR: windowArm(0, -12) } },
      { t: 0.5, pose: { armR: windowArm(14, 0) } },
      { t: 0.6, pose: { armR: windowArm(0, 14) } },
      { t: 0.7, pose: { armR: windowArm(-14, 0) } },
      { t: 0.85, pose: { armR: { fwd: 30, out: 14, bend: 60 }, head: { nod: 4, turn: 20 }, spine: { lean: -4 } } },
    ],
  },
  {
    id: 'clean.rug',
    duration: 3,
    base: { armL: { fwd: 20, out: 18, bend: 30 } },
    keys: [
      { t: 0, pose: { armR: { fwd: 156, out: 20, bend: 70 }, spine: { lean: -6, twist: -6 }, head: { nod: -10 } } },
      { t: 0.12, pose: { armR: { fwd: 84, out: 16, bend: 8 }, spine: { lean: 10, twist: 6 }, head: { nod: 0 } } },
      { t: 0.28, pose: { armR: { fwd: 156, out: 20, bend: 70 }, spine: { lean: -6, twist: -6 }, head: { nod: -10 } } },
      { t: 0.4, pose: { armR: { fwd: 84, out: 16, bend: 8 }, spine: { lean: 10, twist: 6 }, head: { nod: 0 } } },
      { t: 0.56, pose: { armR: { fwd: 156, out: 20, bend: 70 }, spine: { lean: -6, twist: -6 }, head: { nod: -10 } } },
      { t: 0.68, pose: { armR: { fwd: 84, out: 16, bend: 8 }, spine: { lean: 10, twist: 6 }, head: { nod: 0 } } },
      { t: 0.84, pose: { armR: { fwd: 30, out: 12, bend: 30 }, armL: { fwd: 80, out: 10, bend: 100 }, head: { turn: 18, nod: 6 } } },
    ],
  },
];

const CAN: LimbPose = { fwd: 32, out: 12, bend: 22 };
const SPADE_L: LimbPose = { fwd: 40, out: 4, bend: 70, twist: -30 };
const SPADE_R: LimbPose = { fwd: 30, out: 10, bend: 40, twist: -16 };
const SHEARS: LimbPose = { fwd: 150, out: 18, bend: 30, twist: -10 };

const rake = (reach: number): Pose => {
  const armR: LimbPose = { fwd: 30 + reach, out: 10, bend: 50 - reach * 0.8, twist: -10 };
  return planted({
    spine: { lean: 10 + reach * 0.4 },
    legL: { fwd: 14, out: 8, bend: 14 },
    legR: { fwd: -8, out: 8, bend: 10 },
    armL: { fwd: 40 + reach * 0.6, out: 2, bend: 70 - reach * 0.6, twist: -36 },
    armR,
    gripR: tool(armR, 50),
    head: { nod: 20 },
  });
};

const dig = (phase: 'push' | 'lift' | 'toss'): Pose => {
  if (phase === 'push') {
    return planted({ armL: SPADE_L, armR: SPADE_R, gripR: tool(SPADE_R, 10), legR: { fwd: 30, out: 6, bend: 44 }, footR: 10, spine: { lean: 8 }, head: { nod: 20 } });
  }
  if (phase === 'lift') {
    return squat(24, 40, 0, { armL: { fwd: 50, out: 4, bend: 40, twist: -30 }, armR: { fwd: 46, out: 10, bend: 16 }, gripR: { pitch: 30 }, spine: { lean: 32 }, head: { nod: 16 } });
  }
  return planted({ armL: { fwd: 70, out: 4, bend: 40, twist: -30 }, armR: { fwd: 76, out: 30, bend: 20 }, gripR: { pitch: 60 }, spine: { lean: 14, twist: 22 }, head: { turn: 20, nod: 10 } });
};

const GARDEN_CLIPS: readonly ClipDef[] = [
  {
    id: 'garden.water',
    duration: 7,
    base: { armL: { fwd: 10, out: 10, bend: 30 }, armR: CAN, head: { nod: 26 }, spine: { lean: 6 } },
    keys: [
      { t: 0, pose: { gripR: level(CAN) } },
      { t: 0.12, pose: { gripR: { pitch: level(CAN).pitch + 50 }, armR: { fwd: 8 } } },
      { t: 0.4, pose: { gripR: { pitch: level(CAN).pitch + 54 }, armR: { fwd: 10 }, spine: { twist: 14 }, head: { turn: 8 } } },
      { t: 0.55, pose: { gripR: level(CAN), spine: { twist: 6 }, head: { nod: -14, turn: -16 } } },
      { t: 0.7, pose: { gripR: { pitch: level(CAN).pitch + 50 }, armR: { fwd: 8 }, spine: { twist: -10 } } },
      { t: 0.88, pose: { gripR: level(CAN), spine: { twist: -4 } } },
    ],
  },
  {
    id: 'garden.dig',
    duration: 5,
    keys: [
      { t: 0, pose: dig('push') },
      { t: 0.14, pose: planted({ ...dig('push'), legR: { fwd: 24, out: 6, bend: 30 }, spine: { lean: 12 } }) },
      { t: 0.32, pose: dig('lift') },
      { t: 0.5, pose: dig('toss') },
      { t: 0.66, pose: { armL: ARM_HIP, armR: SPADE_R, gripR: tool(SPADE_R, 10), spine: { lean: -6 }, head: { nod: -8, turn: -14 } } },
      { t: 0.84, pose: { armL: SPADE_L, armR: SPADE_R, gripR: tool(SPADE_R, 10), spine: { lean: 6 }, head: { nod: 18 } } },
    ],
  },
  {
    id: 'garden.rake',
    duration: 4.5,
    keys: [
      { t: 0, pose: rake(40) },
      { t: 0.22, pose: rake(0) },
      { t: 0.38, pose: rake(40) },
      { t: 0.6, pose: rake(0) },
      { t: 0.74, pose: { ...rake(4), spine: { lean: 0 }, head: { nod: -2, turn: 18 } } },
      { t: 0.88, pose: rake(30) },
    ],
  },
  {
    id: 'garden.plant',
    duration: 7,
    base: KNEEL,
    keys: [
      { t: 0, pose: { spine: { lean: 22 }, armL: { fwd: 46, out: 10, bend: 14 }, armR: { fwd: 50, out: 8, bend: 12 }, head: { nod: 30 } } },
      { t: 0.14, pose: { spine: { lean: 24 }, armL: { fwd: 50, out: 10, bend: 22 }, armR: { fwd: 44, out: 8, bend: 4 }, head: { nod: 30 } } },
      { t: 0.28, pose: { spine: { lean: 22 }, armL: { fwd: 46, out: 10, bend: 14 }, armR: { fwd: 50, out: 8, bend: 22 }, head: { nod: 30 } } },
      { t: 0.42, pose: { spine: { lean: 24 }, armL: { fwd: 50, out: 10, bend: 22 }, armR: { fwd: 44, out: 8, bend: 4 }, head: { nod: 32 } } },
      { t: 0.6, pose: { spine: { lean: 0 }, armL: { fwd: 30, out: 10, bend: 40 }, armR: { fwd: 100, out: 20, bend: 120, twist: -40 }, head: { nod: -6, turn: 18 } } },
      { t: 0.8, pose: { spine: { lean: 14 }, armL: { fwd: 40, out: 10, bend: 30 }, armR: { fwd: 40, out: 10, bend: 30 }, head: { nod: 20, turn: -8 } } },
    ],
  },
  {
    id: 'garden.prune',
    duration: 5,
    base: { armR: SHEARS, gripR: level(SHEARS), head: { nod: -26 }, spine: { lean: -6 } },
    keys: [
      { t: 0, pose: { armL: { ...SHEARS, out: 28 } } },
      { t: 0.08, pose: { armL: { ...SHEARS, out: 14, twist: -20 } } },
      { t: 0.16, pose: { armL: { ...SHEARS, out: 28 } } },
      { t: 0.24, pose: { armL: { ...SHEARS, out: 14, twist: -20 } } },
      { t: 0.34, pose: { armL: { ...SHEARS, out: 28 }, spine: { twist: 10 }, head: { turn: 8 } } },
      { t: 0.42, pose: { armL: { ...SHEARS, out: 14, twist: -20 }, spine: { twist: 10 }, head: { turn: 8 } } },
      { t: 0.6, pose: { armL: { fwd: 10, out: 10, bend: 20 }, armR: { fwd: -80, bend: -10 }, gripR: { pitch: -90 }, head: { nod: 30, turn: -10 }, spine: { lean: 8 } } },
      { t: 0.8, pose: { armL: { ...SHEARS, out: 28 }, spine: { twist: -8 }, head: { turn: -8 } } },
    ],
  },
];

const PEG_UP: LimbPose = { fwd: 160, out: 14, bend: 34, twist: -20 };
const SHEET_UP: LimbPose = { fwd: 104, out: 24, bend: 16 };
const SHEET_DOWN: LimbPose = { fwd: 62, out: 24, bend: 26 };
const HIP_BASKET: LimbPose = { fwd: 8, out: 34, bend: 92, twist: -40 };
const BASKET_GAIT = walkWith({ reach: 22, push: -18, liftBend: 50, lean: 2 });

const LAUNDRY_CLIPS: readonly ClipDef[] = [
  {
    id: 'laundry.peg',
    duration: 7,
    keys: [
      { t: 0, pose: { armL: PEG_UP, armR: PEG_UP, gripR: level(PEG_UP), head: { nod: -26 }, root: { y: 0.03 }, footL: 18, footR: 18 } },
      { t: 0.14, pose: { armL: { ...PEG_UP, out: 20 }, armR: { ...PEG_UP, bend: 40 }, gripR: level(PEG_UP), head: { nod: -28, turn: -6 }, root: { y: 0.03 }, footL: 18, footR: 18 } },
      { t: 0.28, pose: { armL: PEG_UP, armR: PEG_UP, gripR: level(PEG_UP), head: { nod: -24, turn: 6 } } },
      { t: 0.46, pose: squat(30, 50, 0, { armL: { fwd: 70, out: 10, bend: 10 }, armR: { fwd: 70, out: 10, bend: 10 }, gripR: { pitch: 80 }, spine: { lean: 46 }, head: { nod: 20 } }) },
      { t: 0.6, pose: { armL: { fwd: 90, out: 20, bend: 40 }, armR: { fwd: 90, out: 20, bend: 40 }, gripR: { pitch: 130 }, spine: { lean: 4 }, head: { nod: -6 } } },
      { t: 0.8, pose: { armL: PEG_UP, armR: PEG_UP, gripR: level(PEG_UP), head: { nod: -26 } } },
    ],
  },
  {
    id: 'laundry.shake',
    duration: 4.5,
    keys: [
      { t: 0, pose: { armL: SHEET_DOWN, armR: SHEET_DOWN, gripR: level(SHEET_DOWN), spine: { lean: 4 } } },
      { t: 0.1, pose: { armL: SHEET_UP, armR: SHEET_UP, gripR: level(SHEET_UP), spine: { lean: -4 }, root: { y: 0.02 }, footL: 10, footR: 10 } },
      { t: 0.2, pose: { armL: SHEET_DOWN, armR: SHEET_DOWN, gripR: level(SHEET_DOWN), spine: { lean: 6 } } },
      { t: 0.3, pose: { armL: SHEET_UP, armR: SHEET_UP, gripR: level(SHEET_UP), spine: { lean: -4 }, root: { y: 0.02 }, footL: 10, footR: 10 } },
      { t: 0.4, pose: { armL: SHEET_DOWN, armR: SHEET_DOWN, gripR: level(SHEET_DOWN), spine: { lean: 6 } } },
      { t: 0.6, pose: { armL: { fwd: 70, out: 4, bend: 50, twist: -30 }, armR: { fwd: 70, out: 4, bend: 50, twist: -30 }, gripR: { pitch: 120 }, head: { nod: 10 } } },
      { t: 0.8, pose: { armL: { fwd: 50, out: 30, bend: 30 }, armR: { fwd: 50, out: 30, bend: 30 }, gripR: { pitch: 80 }, head: { nod: 6, turn: 12 } } },
    ],
  },
  {
    id: 'laundry.basket',
    duration: 1.2,
    ease: 'linear',
    stride: gaitStride(BASKET_GAIT),
    keys: gaitKeys(BASKET_GAIT, { armL: HIP_BASKET, extra: { gripL: level(HIP_BASKET), spine: { side: -7 }, root: { x: -0.02 } } }),
  },
];

export const CHORE_CLIPS: readonly ClipDef[] = [...CLEAN_CLIPS, ...GARDEN_CLIPS, ...LAUNDRY_CLIPS];
