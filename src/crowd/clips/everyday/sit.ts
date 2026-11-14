/**
 * Seated and lying clips. Bench / chair clips use the 0.45 m seat convention from SIT_BASE; ground
 * sitting drops the root to -0.78 and lying pitches or rolls the whole body about the hips.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { SIT_BASE } from '../base';
import { ARM_CHIN, ARM_FOLD_R, ARM_MOUTH, level } from './helpers';

/** seated lower body and spine without the arm placement of SIT_BASE */
const SEAT: Pose = { root: SIT_BASE.root, legL: SIT_BASE.legL, legR: SIT_BASE.legR, spine: SIT_BASE.spine };
const LAP_L: LimbPose = SIT_BASE.armL ?? {};
const LAP_R: LimbPose = SIT_BASE.armR ?? {};
const TABLE: LimbPose = { fwd: 40, out: 8, bend: 50, twist: -20 };
const SEAT_BOOK: LimbPose = { fwd: 30, out: 6, bend: 92, twist: -32 };
const BENCH_BACK: LimbPose = { fwd: -12, out: 66, bend: 28 };
const WALL_HAND: LimbPose = { fwd: -8, out: 22, bend: 6 };

const SIT_CLIPS: readonly ClipDef[] = [
  {
    id: 'sit.talk',
    duration: 6,
    base: SEAT,
    keys: [
      { t: 0, pose: { armL: LAP_L, armR: { fwd: 40, out: 14, bend: 88, twist: 20 }, head: { turn: 30 }, spine: { twist: 8 } } },
      { t: 0.18, pose: { armL: LAP_L, armR: { fwd: 58, out: 28, bend: 60, twist: 40 }, head: { turn: 32, nod: -4 }, spine: { twist: 10 } } },
      { t: 0.36, pose: { armL: LAP_L, armR: { fwd: 36, out: 10, bend: 96, twist: 10 }, head: { turn: 26, nod: 6 }, spine: { twist: 8 } } },
      { t: 0.56, pose: { armL: LAP_L, armR: LAP_R, head: { turn: 30, nod: 8 }, spine: { twist: 8 } } },
      { t: 0.68, pose: { armL: LAP_L, armR: LAP_R, head: { turn: 30, nod: -2 }, spine: { twist: 8 } } },
      { t: 0.84, pose: { armL: { fwd: 46, out: 24, bend: 60, twist: 40 }, armR: LAP_R, head: { turn: 4 } } },
    ],
  },
  {
    id: 'sit.eat',
    duration: 6.5,
    base: { ...SEAT, armL: TABLE },
    keys: [
      { t: 0, pose: { armR: TABLE, head: { nod: 22 }, spine: { lean: 6 } } },
      { t: 0.14, pose: { armR: ARM_MOUTH, gripR: level(ARM_MOUTH), head: { nod: 8 }, spine: { lean: 8 } } },
      { t: 0.26, pose: { armR: TABLE, gripR: level(TABLE), head: { nod: 14 }, spine: { lean: 5 } } },
      { t: 0.34, pose: { armR: TABLE, gripR: level(TABLE), head: { nod: 10 } } },
      { t: 0.42, pose: { armR: TABLE, gripR: level(TABLE), head: { nod: 14 } } },
      { t: 0.6, pose: { armR: ARM_MOUTH, gripR: level(ARM_MOUTH), head: { nod: 6 }, spine: { lean: 8 } } },
      { t: 0.74, pose: { armR: TABLE, gripR: level(TABLE), head: { nod: 2, turn: 22 } } },
    ],
  },
  {
    id: 'sit.read',
    duration: 8,
    base: { ...SEAT, armL: SEAT_BOOK, armR: SEAT_BOOK, gripR: level(SEAT_BOOK) },
    keys: [
      { t: 0, pose: { head: { nod: 30 } } },
      { t: 0.3, pose: { head: { nod: 32, turn: -6 } } },
      { t: 0.42, pose: { armL: { out: 16, twist: 40 }, head: { nod: 30, turn: 6 } } },
      { t: 0.5, pose: { head: { nod: 30 } } },
      { t: 0.78, pose: { head: { nod: 4, turn: 22 }, spine: { lean: -4 } } },
    ],
  },
  {
    id: 'sit.crossed',
    duration: 7,
    base: {
      root: SIT_BASE.root,
      spine: { lean: -6 },
      legL: { fwd: 86, out: 6, bend: 88 },
      legR: { fwd: 100, out: -14, bend: 74 },
      armL: BENCH_BACK,
      armR: LAP_R,
    },
    keys: [
      { t: 0, pose: { footR: 0, head: { turn: 10 } } },
      { t: 0.15, pose: { footR: 24, head: { turn: 14, nod: -4 } } },
      { t: 0.3, pose: { footR: -6, head: { turn: 16 } } },
      { t: 0.45, pose: { footR: 22 } },
      { t: 0.62, pose: { footR: 0, head: { turn: -18, tilt: 4 } } },
      { t: 0.82, pose: { footR: 10, head: { turn: -4, nod: -8 } } },
    ],
  },
  {
    id: 'sit.asleep',
    duration: 8,
    base: { ...SEAT, armL: { fwd: 24, out: 10, bend: 30 }, armR: { fwd: 24, out: 10, bend: 30 }, legL: { fwd: 80, out: 8, bend: 78 } },
    keys: [
      { t: 0, pose: { spine: { lean: 12, side: 3 }, head: { nod: 38, tilt: 8 } } },
      { t: 0.25, pose: { spine: { lean: 15, side: 3 }, head: { nod: 42, tilt: 9 } } },
      { t: 0.5, pose: { spine: { lean: 12, side: 3 }, head: { nod: 38, tilt: 8 } } },
      { t: 0.62, pose: { spine: { lean: 16, side: 4 }, head: { nod: 46, tilt: 12 } } },
      { t: 0.68, pose: { spine: { lean: 8, side: 2 }, head: { nod: 10, tilt: 2 } } },
      { t: 0.8, pose: { spine: { lean: 10, side: 3 }, head: { nod: 30, tilt: 6 } } },
    ],
  },
  {
    id: 'sit.ground',
    duration: 8,
    base: {
      root: { y: -0.78 },
      legL: { fwd: 78, out: 42, bend: 140, twist: 40 },
      legR: { fwd: 78, out: 42, bend: 140, twist: 40 },
      footL: 20,
      footR: 20,
    },
    keys: [
      { t: 0, pose: { armL: { fwd: 30, out: 20, bend: 40 }, armR: { fwd: 30, out: 20, bend: 40 }, spine: { lean: 6 } } },
      { t: 0.2, pose: { armL: { fwd: 30, out: 20, bend: 40 }, armR: { fwd: 30, out: 20, bend: 40 }, spine: { lean: 8 }, head: { turn: 20 } } },
      { t: 0.4, pose: { armL: { fwd: -32, out: 22, bend: 4 }, armR: { fwd: -32, out: 22, bend: 4 }, spine: { lean: -14 }, head: { nod: -12 } } },
      { t: 0.62, pose: { armL: { fwd: -32, out: 22, bend: 4 }, armR: { fwd: -32, out: 22, bend: 4 }, spine: { lean: -14 }, head: { nod: -10, turn: -20 } } },
      { t: 0.8, pose: { armL: ARM_CHIN, armR: { fwd: 30, out: 20, bend: 40 }, spine: { lean: 14 }, head: { nod: 6 } } },
    ],
  },
  {
    id: 'sit.wall',
    duration: 4,
    base: { root: SIT_BASE.root, spine: { lean: 4 }, armL: WALL_HAND, armR: WALL_HAND },
    keys: [
      { t: 0, pose: { legL: { fwd: 80, out: 6, bend: 55 }, legR: { fwd: 80, out: 6, bend: 100 }, footL: 10, footR: 20 } },
      { t: 0.25, pose: { legL: { fwd: 80, out: 6, bend: 78 }, legR: { fwd: 80, out: 6, bend: 78 }, head: { turn: 10 } } },
      { t: 0.5, pose: { legL: { fwd: 80, out: 6, bend: 100 }, legR: { fwd: 80, out: 6, bend: 55 }, footL: 20, footR: 10, head: { turn: 14, nod: -4 } } },
      { t: 0.75, pose: { legL: { fwd: 80, out: 6, bend: 78 }, legR: { fwd: 80, out: 6, bend: 78 }, head: { turn: -8 } } },
    ],
  },
];

const BEHIND_HEAD: LimbPose = { fwd: 168, out: 52, bend: 130, twist: -10 };
const PROP_ELBOW: LimbPose = { fwd: 63, out: 14, bend: 96, twist: -20 };

const LIE_CLIPS: readonly ClipDef[] = [
  {
    id: 'lie.sunbathe',
    duration: 9,
    base: { root: { y: -0.8, pitch: -88 }, armL: BEHIND_HEAD, armR: BEHIND_HEAD, legR: { fwd: 4, out: 4 } },
    keys: [
      { t: 0, pose: { legL: { fwd: 46, out: 4, bend: 84 }, spine: { lean: 0 }, head: { nod: 6 } } },
      { t: 0.25, pose: { legL: { fwd: 46, out: 14, bend: 84 }, spine: { lean: 2 }, head: { nod: 6, turn: 6 } } },
      { t: 0.5, pose: { legL: { fwd: 46, out: 4, bend: 84 }, spine: { lean: 0 }, head: { nod: 8 }, footR: -12 } },
      { t: 0.62, pose: { legL: { fwd: 46, out: 4, bend: 84 }, spine: { lean: 2 }, head: { nod: 8 }, footR: 14 } },
      { t: 0.8, pose: { legL: { fwd: 46, out: -4, bend: 84 }, spine: { lean: 0 }, head: { nod: 4, turn: -10 } } },
    ],
  },
  {
    id: 'lie.front',
    duration: 6,
    base: { root: { y: -0.8, pitch: 88 }, spine: { lean: -25 }, armL: PROP_ELBOW, armR: PROP_ELBOW, head: { nod: -36 } },
    keys: [
      { t: 0, pose: { legL: { bend: 20 }, legR: { bend: 90 }, footL: 30, footR: 20 } },
      { t: 0.25, pose: { legL: { bend: 90 }, legR: { bend: 20 }, footL: 20, footR: 30, head: { tilt: 6 } } },
      { t: 0.5, pose: { legL: { bend: 20 }, legR: { bend: 90 }, footL: 30, footR: 20, armL: { bend: 20 }, head: { turn: 10 } } },
      { t: 0.75, pose: { legL: { bend: 90 }, legR: { bend: 20 }, footL: 20, footR: 30, armR: { bend: 20 }, head: { tilt: -6, turn: -8 } } },
    ],
  },
  {
    id: 'lie.bench',
    duration: 8,
    base: {
      root: { y: -0.31, roll: 90 },
      legL: { fwd: 72, out: 4, bend: 104 },
      legR: { fwd: 66, out: 0, bend: 110 },
      armL: { fwd: 96, out: 6, bend: 128, twist: -30 },
      armR: ARM_FOLD_R,
      head: { tilt: 12 },
    },
    keys: [
      { t: 0, pose: { spine: { lean: 22 }, head: { nod: 18 } } },
      { t: 0.3, pose: { spine: { lean: 25 }, head: { nod: 20 } } },
      { t: 0.6, pose: { spine: { lean: 22 }, head: { nod: 18 } } },
      { t: 0.72, pose: { spine: { lean: 20 }, head: { nod: 16 }, legR: { fwd: 6, bend: -6 } } },
      { t: 0.86, pose: { spine: { lean: 24 }, head: { nod: 19 } } },
    ],
  },
];

export const SIT_CLIPS_ALL: readonly ClipDef[] = [...SIT_CLIPS, ...LIE_CLIPS];

