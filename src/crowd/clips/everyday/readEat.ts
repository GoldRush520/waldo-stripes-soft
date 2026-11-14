/**
 * Reading, eating and drinking while standing. Held props sit in the right hand unless noted;
 * grip pitch keeps them level (or deliberately tipped toward the mouth when sipping).
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_CHEST, ARM_FRONT, ARM_HANG, ARM_HEAD, ARM_HIP, ARM_MOUTH, level } from './helpers';

const BOOK_L: LimbPose = { ...ARM_FRONT, twist: -36 };
const BOOK_R: LimbPose = ARM_FRONT;
const PAPER: LimbPose = { fwd: 60, out: 30, bend: 60, twist: -10 };
const MAP: LimbPose = { fwd: 50, out: 24, bend: 66, twist: -14 };
const MAP_ONE: LimbPose = { fwd: 46, out: 12, bend: 80, twist: -24 };

const book = (extra: Pose = {}): Pose => ({ armL: BOOK_L, armR: BOOK_R, gripR: level(BOOK_R), head: { nod: 28 }, ...extra });
const paper = (extra: Pose = {}): Pose => ({ armL: PAPER, armR: PAPER, gripR: level(PAPER), head: { nod: 12 }, ...extra });
const map = (extra: Pose = {}): Pose => ({ armL: MAP, armR: MAP, gripR: level(MAP), head: { nod: 22 }, ...extra });

const READ_CLIPS: readonly ClipDef[] = [
  {
    id: 'read.book',
    duration: 8,
    keys: [
      { t: 0, pose: book({ head: { nod: 28, turn: 4 } }) },
      { t: 0.25, pose: book({ head: { nod: 30, turn: -4 } }) },
      { t: 0.4, pose: book({ armL: { ...BOOK_L, out: 20, twist: 10 }, head: { nod: 30, turn: 6 } }) },
      { t: 0.48, pose: book({ head: { nod: 28 } }) },
      { t: 0.72, pose: book({ head: { nod: 26, turn: -6, tilt: 4 } }) },
      { t: 0.86, pose: book({ head: { nod: 4, turn: 18 } }) },
    ],
  },
  {
    id: 'read.paper',
    duration: 8,
    keys: [
      { t: 0, pose: paper({ head: { nod: 12, turn: 10 } }) },
      { t: 0.3, pose: paper({ head: { nod: 14, turn: -12 } }) },
      { t: 0.42, pose: paper({ armL: { ...PAPER, fwd: 70, bend: 50 }, armR: { ...PAPER, fwd: 70, bend: 50 }, gripR: { pitch: 120 } }) },
      { t: 0.5, pose: paper({ head: { nod: 12 } }) },
      { t: 0.75, pose: paper({ head: { nod: 16, turn: 8, tilt: -4 }, spine: { lean: 3 } }) },
    ],
  },
  {
    id: 'read.map',
    duration: 7,
    keys: [
      { t: 0, pose: map() },
      { t: 0.22, pose: map({ head: { nod: 24, turn: -8 } }) },
      { t: 0.38, pose: map({ head: { nod: -4, turn: 30 }, spine: { twist: 8 } }) },
      { t: 0.52, pose: map({ head: { nod: 22, turn: 6 } }) },
      { t: 0.7, pose: { armL: { fwd: 96, out: 20, bend: 8 }, armR: MAP_ONE, gripR: level(MAP_ONE), head: { nod: -2, turn: 16 } } },
      { t: 0.86, pose: map({ head: { nod: 20 } }) },
    ],
  },
  {
    id: 'read.maplost',
    duration: 9,
    keys: [
      { t: 0, pose: map({ head: { nod: 22, tilt: 4 } }) },
      { t: 0.14, pose: { armL: ARM_HEAD, armR: MAP_ONE, gripR: level(MAP_ONE), head: { nod: 20, tilt: 12 } } },
      { t: 0.24, pose: { armL: { ...ARM_HEAD, bend: 120 }, armR: MAP_ONE, gripR: level(MAP_ONE), head: { nod: 20, tilt: -10 } } },
      { t: 0.36, pose: map({ gripR: { pitch: 116, roll: 90 }, head: { nod: 22, tilt: 22 } }) },
      { t: 0.5, pose: map({ gripR: { pitch: 116, roll: 180 }, head: { nod: 22, tilt: 30 }, spine: { side: 6 } }) },
      { t: 0.64, pose: { armL: ARM_HEAD, armR: MAP_ONE, gripR: { pitch: 126, roll: 180 }, head: { nod: -4, turn: 28 } } },
      { t: 0.76, pose: { armL: ARM_HEAD, armR: MAP_ONE, gripR: { pitch: 126, roll: 180 }, head: { nod: -4, turn: -30 } } },
      { t: 0.88, pose: map({ gripR: { pitch: 116, roll: 90 }, head: { nod: 22, tilt: -14 } }) },
    ],
  },
];

const CONE_LOW: LimbPose = ARM_CHEST;
const CONE_UP: LimbPose = { ...ARM_MOUTH, bend: 126 };
const sip = (arm: LimbPose, tip: number): { readonly pitch: number } => ({ pitch: level(arm).pitch - tip });

const EAT_CLIPS: readonly ClipDef[] = [
  {
    id: 'eat.icecream',
    duration: 6,
    base: { armL: ARM_HANG },
    keys: [
      { t: 0, pose: { armR: CONE_LOW, gripR: level(CONE_LOW), head: { nod: 14, turn: 6 } } },
      { t: 0.14, pose: { armR: CONE_UP, gripR: level(CONE_UP), head: { nod: 10, tilt: 8 } } },
      { t: 0.22, pose: { armR: CONE_UP, gripR: level(CONE_UP), head: { nod: -2, tilt: -4 } } },
      { t: 0.3, pose: { armR: CONE_UP, gripR: level(CONE_UP), head: { nod: 10, tilt: 8 } } },
      { t: 0.38, pose: { armR: CONE_UP, gripR: level(CONE_UP), head: { nod: -2, tilt: -4 } } },
      { t: 0.54, pose: { armR: CONE_LOW, gripR: level(CONE_LOW), head: { nod: 0, turn: 26 } } },
      { t: 0.78, pose: { armR: CONE_LOW, gripR: level(CONE_LOW), head: { nod: 2, turn: -20 } } },
    ],
  },
  {
    id: 'eat.sandwich',
    duration: 6,
    keys: [
      { t: 0, pose: { armL: ARM_FRONT, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 8 } } },
      { t: 0.15, pose: { armL: ARM_FRONT, armR: ARM_MOUTH, gripR: level(ARM_MOUTH), head: { nod: 6 }, spine: { lean: 6 } } },
      { t: 0.24, pose: { armL: ARM_FRONT, armR: { ...ARM_MOUTH, bend: 112 }, gripR: level(ARM_MOUTH), head: { nod: -6 } } },
      { t: 0.32, pose: { armL: ARM_FRONT, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 4 } } },
      { t: 0.4, pose: { armL: ARM_FRONT, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 7 } } },
      { t: 0.48, pose: { armL: ARM_FRONT, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 3 } } },
      { t: 0.56, pose: { armL: ARM_FRONT, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 7 } } },
      { t: 0.75, pose: { armL: ARM_HANG, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { turn: 24 } } },
    ],
  },
  {
    id: 'eat.noodle',
    duration: 6.5,
    base: { armL: ARM_FRONT, gripL: level(ARM_FRONT) },
    keys: [
      { t: 0, pose: { armR: { fwd: 40, out: 10, bend: 92, twist: -30 }, head: { nod: 26 }, spine: { lean: 6 } } },
      { t: 0.12, pose: { armR: { fwd: 44, out: 12, bend: 96, twist: -30 }, head: { nod: 28 }, spine: { lean: 8 } } },
      { t: 0.3, pose: { armR: { fwd: 128, out: 26, bend: 70, twist: -20 }, head: { nod: -18 }, spine: { lean: -6 } } },
      { t: 0.44, pose: { armR: { fwd: 150, out: 30, bend: 40, twist: -10 }, head: { nod: -24 }, spine: { lean: -8 } } },
      { t: 0.56, pose: { armR: { fwd: 80, out: 14, bend: 110, twist: -40 }, head: { nod: 4 }, spine: { lean: 2 } } },
      { t: 0.66, pose: { armR: { fwd: 80, out: 14, bend: 110, twist: -40 }, head: { nod: 10 } } },
      { t: 0.84, pose: { armR: { fwd: 40, out: 10, bend: 92, twist: -30 }, head: { nod: 22, turn: 10 } } },
    ],
  },
];

const CUP_LOW: LimbPose = ARM_CHEST;
const CUP_UP: LimbPose = ARM_MOUTH;
const BOTTLE_UP: LimbPose = { fwd: 120, out: 12, bend: 120, twist: -30 };

const DRINK_CLIPS: readonly ClipDef[] = [
  {
    id: 'drink.cup',
    duration: 7,
    base: { armL: ARM_HANG },
    keys: [
      { t: 0, pose: { armR: CUP_LOW, gripR: level(CUP_LOW), head: { nod: 6 } } },
      { t: 0.14, pose: { armR: CUP_UP, gripR: sip(CUP_UP, 20), head: { nod: 2 } } },
      { t: 0.28, pose: { armR: CUP_UP, gripR: sip(CUP_UP, 40), head: { nod: -10 } } },
      { t: 0.4, pose: { armR: CUP_LOW, gripR: level(CUP_LOW), head: { nod: 4, turn: 12 } } },
      { t: 0.66, pose: { armR: CUP_LOW, gripR: level(CUP_LOW), head: { nod: -2, turn: -22 }, spine: { twist: -4 } } },
      { t: 0.84, pose: { armR: CUP_LOW, gripR: level(CUP_LOW), armL: { fwd: 26, out: 4, bend: 70, twist: -30 }, head: { nod: 12 } } },
    ],
  },
  {
    id: 'drink.bottle',
    duration: 6,
    base: { armL: ARM_HIP },
    keys: [
      { t: 0, pose: { armR: { fwd: 6, out: 8, bend: 30 }, gripR: { pitch: 36 }, head: { turn: 10 } } },
      { t: 0.18, pose: { armR: BOTTLE_UP, gripR: sip(BOTTLE_UP, 70), head: { nod: -18 }, spine: { lean: -4 } } },
      { t: 0.38, pose: { armR: { ...BOTTLE_UP, fwd: 130 }, gripR: sip(BOTTLE_UP, 100), head: { nod: -30 }, spine: { lean: -8 } } },
      { t: 0.52, pose: { armR: { fwd: 30, out: 10, bend: 60 }, gripR: { pitch: 90 }, head: { nod: 2 }, spine: { lean: 0 } } },
      { t: 0.62, pose: { armR: { fwd: 26, out: 14, bend: 50 }, gripR: { pitch: 76 }, head: { nod: 6, turn: -6 } } },
      { t: 0.82, pose: { armR: { fwd: 6, out: 8, bend: 30 }, gripR: { pitch: 36 }, head: { turn: -16 } } },
    ],
  },
];

export const READ_EAT_CLIPS: readonly ClipDef[] = [...READ_CLIPS, ...EAT_CLIPS, ...DRINK_CLIPS];
