/**
 * Queueing grown-ups and restless kids.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import {
  ARM_EYE,
  ARM_FOLD_L,
  ARM_FOLD_R,
  ARM_HANG,
  ARM_HIP,
  gaitKeys,
  gaitStride,
  planted,
  runWith,
  squat,
} from './helpers';

const POCKET: LimbPose = { fwd: -4, out: 10, bend: 22, twist: -10 };
const SHADE: LimbPose = { ...ARM_EYE, fwd: 104, out: 30, bend: 128, twist: -40 };

const tiptoe = (side: number, turn: number): Pose => ({
  root: { y: 0.045 },
  footL: 32,
  footR: 32,
  spine: { side, lean: -2 },
  head: { nod: -6, turn, tilt: side * 0.6 },
});

const QUEUE_CLIPS: readonly ClipDef[] = [
  {
    id: 'queue.shuffle',
    duration: 9,
    base: { armL: POCKET, armR: POCKET },
    keys: [
      { t: 0, pose: planted({ legR: { fwd: 6, out: 4, bend: 10 }, root: { x: 0.02, roll: -1 }, head: { nod: 6 } }) },
      { t: 0.18, pose: planted({ legR: { fwd: 6, out: 4, bend: 10 }, root: { x: 0.02, roll: -1 }, head: { nod: 10, turn: -10 } }) },
      { t: 0.3, pose: planted({ legL: { fwd: 12, bend: 20 }, root: { z: 0.04 }, footL: -6 }) },
      { t: 0.38, pose: { root: { z: 0.06 }, head: { turn: 14 } } },
      { t: 0.56, pose: { root: { z: 0.06 }, spine: { lean: -5 }, head: { nod: -14, turn: 4 } } },
      { t: 0.68, pose: planted({ legL: { fwd: -6, bend: 14 }, root: { z: 0.03 } }) },
      { t: 0.8, pose: planted({ legL: { fwd: 4, out: 4, bend: 10 }, root: { x: -0.02, roll: 1 }, head: { turn: -18 } }) },
    ],
  },
  {
    id: 'queue.tiptoe',
    duration: 6,
    base: { armL: ARM_HIP },
    keys: [
      { t: 0, pose: { armR: ARM_HANG, head: { turn: 4 } } },
      { t: 0.14, pose: { ...tiptoe(8, -10), armR: SHADE } },
      { t: 0.3, pose: { ...tiptoe(9, -14), armR: SHADE } },
      { t: 0.4, pose: { armR: ARM_HANG, head: { nod: 6 } } },
      { t: 0.56, pose: { ...tiptoe(-8, 12), armR: ARM_HANG } },
      { t: 0.7, pose: { ...tiptoe(-9, 16), armR: ARM_HANG } },
      { t: 0.84, pose: { armR: ARM_HANG, spine: { lean: -2 }, head: { nod: -10, turn: -20 } } },
    ],
  },
  {
    id: 'queue.impatient',
    duration: 5,
    base: { armL: ARM_FOLD_L, armR: ARM_FOLD_R, legR: { fwd: 12, out: 8, bend: 4 }, root: { x: 0.02, roll: -1 } },
    keys: [
      { t: 0, pose: { footR: -24, head: { turn: -14 } } },
      { t: 0.08, pose: { footR: 2 } },
      { t: 0.16, pose: { footR: -24, head: { turn: -18, nod: -4 } } },
      { t: 0.24, pose: { footR: 2 } },
      { t: 0.32, pose: { footR: -24, head: { turn: 10 } } },
      { t: 0.4, pose: { footR: 2, head: { turn: 14 } } },
      { t: 0.56, pose: { head: { nod: -18, tilt: 8 }, spine: { lean: -6 } } },
      { t: 0.72, pose: { head: { nod: 10, tilt: -6 }, spine: { lean: 3 } } },
      { t: 0.86, pose: { footR: -22, head: { turn: -10 } } },
    ],
  },
];

const KID_RUN = runWith({ reach: 38, push: -30, armSwing: 40, armBend: 50, lean: 8 });
const FLAIL_A: Pose = { armL: { fwd: 120, out: 50, bend: 30 }, armR: { fwd: -20, out: 60, bend: 20 } };
const FLAIL_B: Pose = { armL: { fwd: -20, out: 60, bend: 20 }, armR: { fwd: 120, out: 50, bend: 30 } };

const skipStep = (lead: 'L' | 'R'): Pose => {
  const stance: LimbPose = { fwd: -8, bend: 6 };
  const knee: LimbPose = { fwd: 70, bend: 90 };
  const armUp: LimbPose = { fwd: 80, out: 20, bend: 60 };
  const armBack: LimbPose = { fwd: -30, out: 14, bend: 20 };
  return planted({
    legL: lead === 'L' ? stance : knee,
    legR: lead === 'L' ? knee : stance,
    armL: lead === 'L' ? armUp : armBack,
    armR: lead === 'L' ? armBack : armUp,
    footL: lead === 'L' ? 30 : 20,
    footR: lead === 'L' ? 20 : 30,
    spine: { lean: 4 },
  }, 0.1);
};

const skipLand = (lead: 'L' | 'R'): Pose =>
  planted({
    legL: lead === 'L' ? { fwd: 20, bend: 18 } : { fwd: -16, bend: 30 },
    legR: lead === 'L' ? { fwd: -16, bend: 30 } : { fwd: 20, bend: 18 },
    armL: { fwd: 20, out: 16, bend: 40 },
    armR: { fwd: 20, out: 16, bend: 40 },
    spine: { lean: 3 },
  });

const hop = (air: boolean, extra: Pose = {}): Pose =>
  air
    ? { root: { y: 0.16 }, legL: { fwd: 8, bend: 30 }, legR: { fwd: 8, bend: 30 }, footL: 30, footR: 30, armL: { fwd: 60, out: 30, bend: 40 }, armR: { fwd: 60, out: 30, bend: 40 }, ...extra }
    : squat(30, 56, 0, { armL: { fwd: -10, out: 16, bend: 30 }, armR: { fwd: -10, out: 16, bend: 30 }, spine: { lean: 10 }, ...extra });

const tug = (pull: number): Pose => ({
  armR: { fwd: 142 - pull, out: 8, bend: 10 + pull * 0.4 },
  armL: { fwd: 10 + pull, out: 14, bend: 30 },
  spine: { lean: -4 - pull * 0.3 },
  head: { nod: -32 },
  root: { z: -pull * 0.002 },
});

const tantrum = (k: number): Pose => ({
  root: { y: -0.78, pitch: -34 },
  spine: { lean: 8 },
  legL: { fwd: 40 + k * 26, out: 16, bend: 50 - k * 40 },
  legR: { fwd: 66 - k * 26, out: 16, bend: 10 + k * 40 },
  armL: { fwd: 30 + k * 70, out: 24, bend: 60 - k * 40 },
  armR: { fwd: 100 - k * 70, out: 24, bend: 20 + k * 40 },
  head: { nod: -10, turn: 22 - k * 44 },
});

const KID_CLIPS: readonly ClipDef[] = [
  {
    id: 'kid.run',
    duration: 0.78,
    ease: 'linear',
    stride: Math.round(gaitStride(KID_RUN) * 1.1 * 100) / 100,
    keys: gaitKeys(KID_RUN, { contactL: FLAIL_A, contactR: FLAIL_B, extra: { head: { nod: -6 } } }),
  },
  {
    id: 'kid.skip',
    duration: 0.9,
    stride: 1.5,
    keys: [
      { t: 0, pose: skipLand('L') },
      { t: 0.25, pose: skipStep('L') },
      { t: 0.5, pose: skipLand('R') },
      { t: 0.75, pose: skipStep('R') },
    ],
  },
  {
    id: 'kid.hop',
    duration: 3,
    keys: [
      { t: 0, pose: hop(false) },
      { t: 0.1, pose: hop(true, { head: { nod: -10 } }) },
      { t: 0.2, pose: hop(false) },
      { t: 0.3, pose: hop(true, { head: { nod: -10, tilt: 8 } }) },
      { t: 0.4, pose: hop(false) },
      { t: 0.5, pose: hop(true, { head: { nod: -12, tilt: -8 } }) },
      { t: 0.6, pose: hop(false) },
      { t: 0.78, pose: { armL: ARM_HANG, armR: ARM_HANG, head: { turn: 16 } } },
    ],
  },
  {
    id: 'kid.tug',
    duration: 3.5,
    keys: [
      { t: 0, pose: tug(0) },
      { t: 0.1, pose: tug(24) },
      { t: 0.2, pose: tug(0) },
      { t: 0.3, pose: tug(24) },
      { t: 0.4, pose: tug(0) },
      { t: 0.56, pose: { ...tug(4), root: { y: 0.03 }, footL: 20, footR: 20 } },
      { t: 0.7, pose: { ...tug(30), spine: { lean: -14 }, head: { nod: -26, turn: 10 } } },
      { t: 0.86, pose: tug(10) },
    ],
  },
  {
    id: 'kid.crouch',
    duration: 7,
    keys: [
      { t: 0, pose: squat(84, 140, 0, { spine: { lean: 30 }, armL: { fwd: 50, out: 20, bend: 40 }, armR: { fwd: 50, out: 20, bend: 40 }, head: { nod: 30 } }) },
      { t: 0.2, pose: squat(84, 140, 0, { spine: { lean: 32 }, armL: { fwd: 50, out: 20, bend: 40 }, armR: { fwd: 64, out: 8, bend: 4 }, head: { nod: 34 } }) },
      { t: 0.3, pose: squat(84, 140, 0, { spine: { lean: 32 }, armL: { fwd: 50, out: 20, bend: 40 }, armR: { fwd: 58, out: 8, bend: 10 }, head: { nod: 34, tilt: 8 } }) },
      { t: 0.4, pose: squat(84, 140, 0, { spine: { lean: 32 }, armL: { fwd: 50, out: 20, bend: 40 }, armR: { fwd: 64, out: 8, bend: 4 }, head: { nod: 34 } }) },
      { t: 0.6, pose: squat(84, 140, 0, { spine: { lean: 22 }, armL: { fwd: 50, out: 20, bend: 40 }, armR: { fwd: 50, out: 20, bend: 40 }, head: { nod: 0, turn: 30 } }) },
      { t: 0.8, pose: squat(84, 140, 0, { spine: { lean: 30 }, armL: { fwd: 40, out: 30, bend: 60 }, armR: { fwd: 40, out: 30, bend: 60 }, head: { nod: 28, tilt: -6 } }) },
    ],
  },
  {
    id: 'kid.tantrum',
    duration: 2.4,
    keys: [
      { t: 0, pose: tantrum(0) },
      { t: 0.12, pose: tantrum(1) },
      { t: 0.24, pose: tantrum(0) },
      { t: 0.36, pose: tantrum(1) },
      { t: 0.48, pose: tantrum(0) },
      { t: 0.6, pose: tantrum(1) },
      { t: 0.8, pose: { ...tantrum(0.5), spine: { lean: -8 }, head: { nod: -24, turn: 0 } } },
    ],
  },
];

export const KID_CLIPS_ALL: readonly ClipDef[] = [...QUEUE_CLIPS, ...KID_CLIPS];
