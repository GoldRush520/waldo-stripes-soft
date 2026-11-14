/**
 * Service and market-stall clips: waiters, stallholders and hawkers.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_BEHIND, ARM_CHEST, ARM_FRONT, ARM_HANG, ARM_HIP, ARM_MOUTH, level, planted, squat } from './helpers';

const TRAY: LimbPose = { fwd: 24, out: 16, bend: 74, twist: 12 };
const TRAY_OFFER: LimbPose = { fwd: 46, out: 14, bend: 46, twist: 12 };
const JUG: LimbPose = { fwd: 46, out: 12, bend: 44, twist: -10 };
const GLASS_L: LimbPose = { fwd: 34, out: 4, bend: 80, twist: -30 };
const PAD_L: LimbPose = { fwd: 22, out: 6, bend: 104, twist: -40 };
const PEN_R: LimbPose = { fwd: 26, out: 4, bend: 100, twist: -40 };
const pour = (arm: LimbPose, tip: number): { readonly pitch: number } => ({ pitch: level(arm).pitch + tip });

const wipe = (fwd: number, out: number): Pose =>
  planted({
    spine: { lean: 30 },
    legL: { fwd: 6, bend: 8 },
    legR: { fwd: 6, bend: 8 },
    armL: { fwd: 56, out: 16, bend: 12 },
    armR: { fwd, out, bend: 16, twist: -10 },
    head: { nod: 14 },
  });

const SERVE_CLIPS: readonly ClipDef[] = [
  {
    id: 'serve.tray',
    duration: 7,
    base: { armL: ARM_BEHIND },
    keys: [
      { t: 0, pose: { armR: TRAY, gripR: level(TRAY), head: { turn: 10 } } },
      { t: 0.2, pose: { armR: TRAY, gripR: level(TRAY), head: { turn: -16 } } },
      { t: 0.36, pose: { armR: TRAY_OFFER, gripR: level(TRAY_OFFER), spine: { lean: 12 }, head: { nod: 10 } } },
      { t: 0.5, pose: { armR: TRAY_OFFER, gripR: level(TRAY_OFFER), spine: { lean: 14 }, head: { nod: 4, tilt: 6 } } },
      { t: 0.66, pose: { armR: TRAY, gripR: level(TRAY), spine: { lean: 2 }, head: { nod: 2 } } },
      { t: 0.84, pose: { armR: TRAY, gripR: level(TRAY), head: { turn: 22 } } },
    ],
  },
  {
    id: 'serve.pour',
    duration: 6,
    base: { armL: GLASS_L, gripL: level(GLASS_L), spine: { lean: 8 }, head: { nod: 22 } },
    keys: [
      { t: 0, pose: { armR: JUG, gripR: level(JUG) } },
      { t: 0.15, pose: { armR: { ...JUG, fwd: 52 }, gripR: pour(JUG, 50) } },
      { t: 0.4, pose: { armR: { ...JUG, fwd: 54 }, gripR: pour(JUG, 64), head: { nod: 2 } } },
      { t: 0.55, pose: { armR: JUG, gripR: level(JUG) } },
      { t: 0.75, pose: { armR: { fwd: 10, out: 8, bend: 30 }, gripR: { pitch: 40 }, head: { nod: -16, turn: 14 } } },
    ],
  },
  {
    id: 'serve.order',
    duration: 6,
    base: { armL: PAD_L, gripL: level(PAD_L) },
    keys: [
      { t: 0, pose: { armR: PEN_R, head: { nod: -2, turn: 6 } } },
      { t: 0.15, pose: { armR: PEN_R, head: { nod: 6, turn: 6 } } },
      { t: 0.3, pose: { armR: { ...PEN_R, twist: -46 }, head: { nod: 26 } } },
      { t: 0.38, pose: { armR: { ...PEN_R, twist: -34, bend: 104 }, head: { nod: 27 } } },
      { t: 0.46, pose: { armR: { ...PEN_R, twist: -46 }, head: { nod: 26 } } },
      { t: 0.54, pose: { armR: { ...PEN_R, twist: -34, bend: 104 }, head: { nod: 28 } } },
      { t: 0.7, pose: { armR: PEN_R, head: { nod: -2, tilt: 6 } } },
      { t: 0.84, pose: { armR: PEN_R, head: { nod: 8, tilt: 4 } } },
    ],
  },
  {
    id: 'serve.wipe',
    duration: 5,
    keys: [
      { t: 0, pose: wipe(56, 8) },
      { t: 0.12, pose: wipe(66, 24) },
      { t: 0.24, pose: wipe(56, 38) },
      { t: 0.36, pose: wipe(46, 24) },
      { t: 0.48, pose: wipe(56, 8) },
      { t: 0.6, pose: wipe(66, 24) },
      { t: 0.72, pose: { armL: ARM_HIP, armR: { fwd: 20, out: 10, bend: 40 }, head: { turn: 20 } } },
      { t: 0.88, pose: wipe(46, 24) },
    ],
  },
];

const HAWK_UP: LimbPose = { fwd: 150, out: 30, bend: 40, twist: 10 };
const SCALE: LimbPose = { fwd: 50, out: 10, bend: 90, twist: -20 };
const HAND_OVER: LimbPose = { fwd: 76, out: 10, bend: 16 };
const PALM_L: LimbPose = { fwd: 30, out: 4, bend: 84, twist: 10 };
const PICK_R: LimbPose = { fwd: 34, out: 2, bend: 92, twist: -44 };

const arrange = (reachL: number, reachR: number, turn: number): Pose =>
  squat(30, 50, 0, {
    spine: { lean: 34, twist: turn },
    armL: { fwd: reachL, out: 14, bend: 24 },
    armR: { fwd: reachR, out: 14, bend: 24 },
    head: { nod: 20, turn: turn * 0.6 },
  });

const VEND_CLIPS: readonly ClipDef[] = [
  {
    id: 'vend.hawk',
    duration: 5,
    keys: [
      { t: 0, pose: { armR: HAWK_UP, gripR: level(HAWK_UP), armL: ARM_MOUTH, head: { nod: -10, turn: 10 } } },
      { t: 0.14, pose: { armR: { ...HAWK_UP, fwd: 160 }, gripR: level(HAWK_UP), armL: ARM_MOUTH, head: { nod: -14, turn: 12 }, spine: { lean: -4 } } },
      { t: 0.3, pose: { armR: HAWK_UP, gripR: level(HAWK_UP), armL: ARM_MOUTH, head: { nod: -10, turn: -14 } } },
      { t: 0.44, pose: { armR: { ...HAWK_UP, fwd: 160 }, gripR: level(HAWK_UP), armL: ARM_MOUTH, head: { nod: -14, turn: -20 }, spine: { lean: -4 } } },
      { t: 0.6, pose: { armR: { fwd: 60, out: 20, bend: 70 }, gripR: { pitch: 130 }, armL: ARM_HANG, head: { turn: 0, nod: 4 } } },
      { t: 0.8, pose: { armR: { fwd: 60, out: 20, bend: 70 }, gripR: { pitch: 130 }, armL: ARM_HIP, head: { turn: 20 } } },
    ],
  },
  {
    id: 'vend.weigh',
    duration: 6,
    base: { armR: SCALE, gripR: level(SCALE), head: { nod: 6 } },
    keys: [
      { t: 0, pose: { armL: { fwd: 50, out: 20, bend: 40 } } },
      { t: 0.14, pose: { armL: { fwd: 60, out: 8, bend: 60, twist: -20 }, head: { nod: 2 } } },
      { t: 0.28, pose: { armL: { fwd: 40, out: 16, bend: 50 }, head: { nod: 4, turn: -6 } } },
      { t: 0.4, pose: { armL: { fwd: 62, out: 8, bend: 62, twist: -20 }, head: { nod: 2 } } },
      { t: 0.56, pose: { armL: ARM_HIP, armR: { bend: 8 }, gripR: { pitch: 8 }, head: { nod: -4, tilt: 6 } } },
      { t: 0.7, pose: { armL: ARM_HIP, armR: { bend: 8 }, gripR: { pitch: 8 }, head: { nod: -4, tilt: -4 } } },
      { t: 0.86, pose: { armL: { fwd: 30, out: 20, bend: 50 }, head: { turn: 18 } } },
    ],
  },
  {
    id: 'vend.handover',
    duration: 6,
    keys: [
      { t: 0, pose: { armL: ARM_FRONT, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 18 } } },
      { t: 0.2, pose: { armL: { fwd: 40, out: 10, bend: 50 }, armR: HAND_OVER, gripR: level(HAND_OVER), spine: { lean: 12 }, head: { nod: 4 } } },
      { t: 0.34, pose: { armL: { fwd: 40, out: 10, bend: 50 }, armR: HAND_OVER, gripR: level(HAND_OVER), spine: { lean: 12 }, head: { nod: 8, tilt: 4 } } },
      { t: 0.48, pose: { armL: { fwd: 70, out: 8, bend: 30, twist: 30 }, armR: ARM_HANG, spine: { lean: 10 }, head: { nod: 10 } } },
      { t: 0.62, pose: { armL: PALM_L, armR: ARM_HANG, head: { nod: 22 } } },
      { t: 0.8, pose: { armL: ARM_HANG, armR: { fwd: 20, out: 10, bend: 70 }, head: { nod: 2, turn: 14 } } },
    ],
  },
  {
    id: 'vend.coins',
    duration: 5,
    base: { armL: PALM_L, head: { nod: 26 }, spine: { lean: 4 } },
    keys: [
      { t: 0, pose: { armR: PICK_R } },
      { t: 0.1, pose: { armR: { ...PICK_R, bend: 98, twist: -50 }, head: { nod: 2 } } },
      { t: 0.2, pose: { armR: PICK_R } },
      { t: 0.3, pose: { armR: { ...PICK_R, bend: 98, twist: -50 }, head: { nod: 2 } } },
      { t: 0.4, pose: { armR: PICK_R, head: { tilt: 4 } } },
      { t: 0.5, pose: { armR: { ...PICK_R, bend: 98, twist: -50 }, head: { nod: 2 } } },
      { t: 0.66, pose: { armR: { fwd: 60, out: 10, bend: 30 }, head: { nod: -22, turn: 6 } } },
      { t: 0.84, pose: { armR: PICK_R, head: { nod: -4 } } },
    ],
  },
  {
    id: 'vend.arrange',
    duration: 7,
    keys: [
      { t: 0, pose: arrange(64, 40, 0) },
      { t: 0.16, pose: arrange(40, 70, -10) },
      { t: 0.32, pose: arrange(70, 40, 10) },
      { t: 0.48, pose: arrange(46, 64, 14) },
      { t: 0.62, pose: { armL: ARM_HIP, armR: ARM_HIP, spine: { lean: -4 }, head: { nod: 12 } } },
      { t: 0.8, pose: arrange(56, 56, -6) },
    ],
  },
];

export const TRADE_CLIPS: readonly ClipDef[] = [...SERVE_CLIPS, ...VEND_CLIPS];
