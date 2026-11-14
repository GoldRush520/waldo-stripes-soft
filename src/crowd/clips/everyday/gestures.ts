/**
 * Cheering, pointing and photo-taking clips.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_CHEST, ARM_EYE, ARM_HANG, ARM_HIP, level, planted, squat } from './helpers';

const CLAP_IN: LimbPose = { fwd: 50, out: 2, bend: 80, twist: -40 };
const CLAP_OUT: LimbPose = { fwd: 46, out: 22, bend: 72, twist: -8 };
const clap = (shut: boolean, extra: Pose = {}): Pose => ({
  armL: shut ? CLAP_IN : CLAP_OUT,
  armR: shut ? CLAP_IN : CLAP_OUT,
  ...extra,
});

const PUMP_UP: LimbPose = { fwd: 168, out: 18, bend: 16 };
const PUMP_DOWN: LimbPose = { fwd: 120, out: 34, bend: 96 };
const ARMS_UP: Pose = { armL: { fwd: 160, out: 34, bend: 20 }, armR: { fwd: 160, out: 34, bend: 20 } };

const CHEER_CLIPS: readonly ClipDef[] = [
  {
    id: 'cheer.clap',
    duration: 3.2,
    keys: [
      { t: 0, pose: clap(true, { head: { nod: -2 } }) },
      { t: 0.08, pose: clap(false, { root: { y: 0.01 } }) },
      { t: 0.16, pose: clap(true, { head: { nod: 2 } }) },
      { t: 0.24, pose: clap(false, { root: { y: 0.01 } }) },
      { t: 0.32, pose: clap(true, { head: { nod: -2, turn: 8 } }) },
      { t: 0.4, pose: clap(false, { root: { y: 0.01 }, head: { turn: 10 } }) },
      { t: 0.48, pose: clap(true, { head: { turn: 8 } }) },
      { t: 0.7, pose: { armL: { fwd: 30, out: 8, bend: 60 }, armR: { fwd: 30, out: 8, bend: 60 }, head: { turn: -10, nod: -4 } } },
      { t: 0.88, pose: clap(false, { head: { nod: -2 } }) },
    ],
  },
  {
    id: 'cheer.fistpump',
    duration: 3,
    base: { armL: ARM_HIP },
    keys: [
      { t: 0, pose: { armR: PUMP_DOWN, head: { nod: -4 } } },
      { t: 0.12, pose: { armR: PUMP_UP, head: { nod: -14 }, root: { y: 0.015 }, footL: 10, footR: 10 } },
      { t: 0.24, pose: { armR: PUMP_DOWN, head: { nod: -4 } } },
      { t: 0.36, pose: { armR: PUMP_UP, head: { nod: -14 }, root: { y: 0.015 }, footL: 10, footR: 10 } },
      { t: 0.48, pose: { armR: PUMP_DOWN, head: { nod: -2 }, spine: { lean: 4 } } },
      { t: 0.7, pose: { armR: { fwd: 30, out: 20, bend: 90, twist: -20 }, head: { turn: 14 } } },
      { t: 0.88, pose: { armR: PUMP_DOWN, head: { turn: -4 } } },
    ],
  },
  {
    id: 'cheer.jump',
    duration: 2.4,
    keys: [
      { t: 0, pose: { armL: ARM_HANG, armR: ARM_HANG, head: { nod: -4 } } },
      { t: 0.18, pose: squat(34, 62, 0, { spine: { lean: 14 }, armL: { fwd: -30, out: 10, bend: 20 }, armR: { fwd: -30, out: 10, bend: 20 } }) },
      {
        t: 0.36,
        pose: {
          ...ARMS_UP,
          root: { y: 0.22 },
          legL: { fwd: -8, bend: 64 },
          legR: { fwd: -8, bend: 64 },
          footL: 30,
          footR: 30,
          spine: { lean: -6 },
          head: { nod: -16 },
        },
      },
      { t: 0.52, pose: squat(26, 48, 0, { ...ARMS_UP, spine: { lean: 8 }, head: { nod: -6 } }) },
      { t: 0.66, pose: { ...ARMS_UP, root: { y: 0.02 }, footL: 14, footR: 14, head: { nod: -10 } } },
      { t: 0.84, pose: { armL: { fwd: 60, out: 30, bend: 60 }, armR: { fwd: 60, out: 30, bend: 60 }, head: { turn: 10 } } },
    ],
  },
];

const POINT_CLIPS: readonly ClipDef[] = [
  {
    id: 'point.sky',
    duration: 5.5,
    keys: [
      { t: 0, pose: { armL: ARM_HANG, armR: { fwd: 156, out: 22, bend: 4 }, head: { nod: -30, turn: -6 }, spine: { lean: -6 } } },
      { t: 0.25, pose: { armL: ARM_HANG, armR: { fwd: 150, out: 30, bend: 6 }, head: { nod: -28, turn: -14 }, spine: { lean: -6 } } },
      { t: 0.4, pose: { armL: { fwd: 30, out: 10, bend: 50 }, armR: { fwd: 140, out: 26, bend: 10 }, head: { nod: -4, turn: 30 } } },
      {
        t: 0.6,
        pose: { armL: { fwd: 118, out: 34, bend: 128, twist: -40 }, armR: { fwd: 158, out: 18, bend: 4 }, head: { nod: -32 }, spine: { lean: -8 } },
      },
      { t: 0.82, pose: { armL: { fwd: 118, out: 34, bend: 128, twist: -40 }, armR: ARM_HANG, head: { nod: -28, turn: 8 }, spine: { lean: -6 } } },
    ],
  },
  {
    id: 'point.down',
    duration: 5,
    base: { armL: { fwd: 10, out: 8, bend: 30 } },
    keys: [
      { t: 0, pose: planted({ armR: { fwd: 42, out: 8, bend: 4 }, spine: { lean: 14 }, head: { nod: 30 }, legL: { fwd: 4, bend: 6 }, legR: { fwd: 4, bend: 6 } }) },
      { t: 0.22, pose: planted({ armR: { fwd: 36, out: 14, bend: 6 }, spine: { lean: 16, twist: 6 }, head: { nod: 32, turn: 6 }, legL: { fwd: 4, bend: 6 }, legR: { fwd: 4, bend: 6 } }) },
      { t: 0.42, pose: { armR: { fwd: 40, out: 10, bend: 10 }, spine: { lean: 8 }, head: { nod: 6, turn: 28 } } },
      { t: 0.62, pose: planted({ armR: { fwd: 46, out: 6, bend: 4 }, spine: { lean: 16 }, head: { nod: 34 }, legL: { fwd: 4, bend: 6 }, legR: { fwd: 4, bend: 6 } }) },
      { t: 0.82, pose: { armR: ARM_HANG, spine: { lean: 4 }, head: { nod: 20, turn: -10 } } },
    ],
  },
  {
    id: 'point.across',
    duration: 5,
    base: { armL: ARM_HIP },
    keys: [
      { t: 0, pose: { armR: { fwd: 86, out: -18, bend: 6, twist: 0 }, spine: { twist: 18 }, head: { turn: 34 } } },
      { t: 0.2, pose: { armR: { fwd: 92, out: -14, bend: 10 }, spine: { twist: 20 }, head: { turn: 36, nod: -4 } } },
      { t: 0.4, pose: { armR: { fwd: 84, out: -20, bend: 4 }, spine: { twist: 16 }, head: { turn: 4 } } },
      { t: 0.6, pose: { armR: { fwd: 90, out: -16, bend: 8 }, spine: { twist: 20 }, head: { turn: 38 } } },
      { t: 0.8, pose: { armR: ARM_HANG, spine: { twist: 4 }, head: { turn: 10, nod: 3 } } },
    ],
  },
];

const CAMERA_UP: Pose = { armL: { ...ARM_EYE, twist: -36 }, armR: ARM_EYE, gripR: level(ARM_EYE), head: { nod: 2 } };
const SELFIE: LimbPose = { fwd: 118, out: 30, bend: 12, twist: -10 };
const PEACE: LimbPose = { fwd: 140, out: 36, bend: 122, twist: -30 };

const PHOTO_CLIPS: readonly ClipDef[] = [
  {
    id: 'photo.camera',
    duration: 7,
    keys: [
      { t: 0, pose: CAMERA_UP },
      { t: 0.14, pose: { ...CAMERA_UP, head: { nod: 6 }, spine: { twist: 4 } } },
      { t: 0.24, pose: { ...CAMERA_UP, spine: { twist: 10 }, root: { yaw: 6 } } },
      { t: 0.36, pose: { ...CAMERA_UP, spine: { twist: 12, lean: 2 }, root: { yaw: 6 }, head: { nod: 6 } } },
      {
        t: 0.52,
        pose: { armL: { fwd: 20, out: 6, bend: 90, twist: -40 }, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 26 }, spine: { lean: 5 } },
      },
      {
        t: 0.7,
        pose: { armL: ARM_HANG, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 2, turn: 26 } },
      },
      { t: 0.86, pose: { ...CAMERA_UP, head: { nod: 2, turn: -6 } } },
    ],
  },
  {
    id: 'photo.selfie',
    duration: 6,
    keys: [
      { t: 0, pose: { armL: ARM_HANG, armR: SELFIE, gripR: { pitch: 145 }, head: { tilt: 8, nod: -6 } } },
      { t: 0.2, pose: { armL: PEACE, armR: SELFIE, gripR: { pitch: 145 }, head: { tilt: 12, nod: -8 }, spine: { side: 4 } } },
      { t: 0.4, pose: { armL: PEACE, armR: { ...SELFIE, out: 36 }, gripR: { pitch: 145 }, head: { tilt: -8, nod: -8 }, spine: { side: -3 } } },
      { t: 0.58, pose: { armL: ARM_HANG, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 26 } } },
      { t: 0.78, pose: { armL: ARM_HANG, armR: ARM_CHEST, gripR: level(ARM_CHEST), head: { nod: 24, tilt: 4 } } },
    ],
  },
  {
    id: 'photo.tripod',
    duration: 7,
    keys: [
      { t: 0, pose: squat(62, 96, 0, { spine: { lean: 14 }, armL: { fwd: 64, out: 4, bend: 100, twist: -30 }, armR: { fwd: 64, out: 4, bend: 100, twist: -30 }, head: { nod: -6 } }) },
      { t: 0.3, pose: squat(62, 96, 0, { spine: { lean: 16 }, armL: { fwd: 62, out: 4, bend: 104, twist: -30 }, armR: { fwd: 66, out: 4, bend: 98, twist: -30 }, head: { nod: -4 } }) },
      { t: 0.48, pose: squat(60, 94, 0, { spine: { lean: 6 }, armL: { fwd: 40, out: 10, bend: 70 }, armR: { fwd: 64, out: 4, bend: 100, twist: -30 }, head: { nod: -10, turn: 26 } }) },
      { t: 0.66, pose: squat(60, 94, 0, { spine: { lean: 6 }, armL: { fwd: 120, out: 30, bend: 70 }, armR: { fwd: 64, out: 4, bend: 100, twist: -30 }, head: { nod: -12, turn: 30 } }) },
      { t: 0.84, pose: squat(62, 96, 0, { spine: { lean: 14 }, armL: { fwd: 64, out: 4, bend: 100, twist: -30 }, armR: { fwd: 64, out: 4, bend: 100, twist: -30 }, head: { nod: -6 } }) },
    ],
  },
];

export const GESTURE_CLIPS: readonly ClipDef[] = [...CHEER_CLIPS, ...POINT_CLIPS, ...PHOTO_CLIPS];
