/**
 * Slapstick moments for the search-and-find crowd: slips, trips, scares, chases and sneezes.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_FACE, ARM_FRONT, ARM_HANG, ARM_HIP, gaitKeys, gaitStride, planted, runWith } from './helpers';

const slip = (a: number): Pose =>
  planted({
    root: { pitch: -16 - a * 4, x: a * 0.02 },
    spine: { lean: -10 + a * 4, side: a * 6 },
    legL: { fwd: -6, out: 10, bend: 16 },
    legR: { fwd: 64 + a * 8, out: 8, bend: 8 },
    footR: -20,
    armL: { fwd: 150 + a * 20, out: 50 - a * 16, bend: 30 },
    armR: { fwd: 110 - a * 30, out: 60 + a * 14, bend: 20 },
    head: { nod: -14, tilt: -a * 8 },
  });

const trip = (a: number): Pose =>
  planted({
    root: { pitch: 22 + a * 4 },
    spine: { lean: 6 },
    legR: { fwd: 30, out: 6, bend: 34 },
    legL: { fwd: -30, out: 6, bend: 40 + a * 14 },
    footL: 30,
    armL: { fwd: 96 + a * 12, out: 30 + a * 10, bend: 10 },
    armR: { fwd: 104 - a * 12, out: 34 - a * 8, bend: 14 },
    head: { nod: -26, turn: a * 8 },
  });

const CHASE = runWith({ reach: 40, push: -30, armSwing: 40 });
const FLEE = runWith({ reach: 38, push: -28, armSwing: 50, armBend: 60, lean: 8 });
const REACH: LimbPose = { fwd: 96, out: 8, bend: 12 };
const FIST: LimbPose = { fwd: 118, out: 22, bend: 104, twist: -20 };
const run2 = (stride: number): number => Math.round(stride * 1.12 * 100) / 100;

const COMEDY_A: readonly ClipDef[] = [
  {
    id: 'comedy.slip',
    duration: 2.2,
    keys: [
      { t: 0, pose: slip(0) },
      { t: 0.25, pose: slip(1) },
      { t: 0.5, pose: slip(-0.4) },
      { t: 0.75, pose: slip(0.7) },
    ],
  },
  {
    id: 'comedy.trip',
    duration: 2,
    keys: [
      { t: 0, pose: trip(0) },
      { t: 0.25, pose: trip(1) },
      { t: 0.5, pose: trip(-0.5) },
      { t: 0.75, pose: trip(0.6) },
    ],
  },
  {
    id: 'comedy.startle',
    duration: 4.5,
    keys: [
      { t: 0, pose: { armL: ARM_HANG, armR: ARM_HANG, head: { turn: 8 } } },
      {
        t: 0.08,
        pose: {
          root: { y: 0.09, z: -0.04 },
          legL: { fwd: -6, bend: 22 },
          legR: { fwd: 10, bend: 30 },
          footL: 26,
          footR: 26,
          armL: { fwd: 110, out: 44, bend: 70, twist: 20 },
          armR: { fwd: 110, out: 44, bend: 70, twist: 20 },
          spine: { lean: -14 },
          head: { nod: -12 },
        },
      },
      {
        t: 0.2,
        pose: planted({
          root: { z: -0.1 },
          legL: { fwd: -14, out: 8, bend: 20 },
          legR: { fwd: 14, out: 8, bend: 12 },
          armL: { fwd: 96, out: 40, bend: 80, twist: 20 },
          armR: { fwd: 96, out: 40, bend: 80, twist: 20 },
          spine: { lean: -10 },
          head: { nod: -6 },
        }),
      },
      { t: 0.42, pose: planted({ root: { z: -0.1 }, legL: { fwd: -6, bend: 8 }, armL: ARM_HANG, armR: ARM_FRONT, spine: { lean: 4 }, head: { nod: 10 } }) },
      { t: 0.62, pose: planted({ root: { z: -0.06 }, armL: ARM_HIP, armR: ARM_FRONT, head: { nod: 4, turn: -10 } }) },
      { t: 0.82, pose: { root: { z: -0.02 }, armL: ARM_HANG, armR: ARM_HANG, head: { turn: 4 } } },
    ],
  },
  {
    id: 'comedy.chase',
    duration: 0.64,
    ease: 'linear',
    stride: run2(gaitStride(CHASE)),
    keys: gaitKeys(CHASE, { armR: REACH, extra: { head: { nod: -10 } } }),
  },
  {
    id: 'comedy.flee',
    duration: 0.72,
    ease: 'linear',
    stride: run2(gaitStride(FLEE)),
    keys: gaitKeys(FLEE, {
      extra: { head: { turn: 64, nod: -6 }, spine: { twist: 22 } },
      contactL: { armL: { fwd: 130, out: 40, bend: 40 } },
      contactR: { armR: { fwd: 130, out: 40, bend: 40 } },
    }),
  },
];

const COMEDY_B: readonly ClipDef[] = [
  {
    id: 'comedy.fist',
    duration: 3.5,
    base: { armL: ARM_HIP, spine: { lean: 8 } },
    keys: [
      { t: 0, pose: { armR: FIST, head: { nod: -4 } } },
      { t: 0.08, pose: { armR: { ...FIST, fwd: 128, bend: 92 }, head: { nod: 2 } } },
      { t: 0.16, pose: { armR: FIST, head: { nod: -4 } } },
      { t: 0.24, pose: { armR: { ...FIST, fwd: 128, bend: 92 }, head: { nod: 2 } } },
      { t: 0.32, pose: { armR: FIST, head: { nod: -4 } } },
      { t: 0.4, pose: { armR: { ...FIST, fwd: 128, bend: 92 }, head: { nod: 2 } } },
      { t: 0.6, pose: { armR: ARM_HIP, head: { turn: -14, nod: 4 }, spine: { lean: -6 } } },
      { t: 0.8, pose: { armR: FIST, head: { nod: -2, tilt: 4 } } },
    ],
  },
  {
    id: 'comedy.facepalm',
    duration: 5,
    base: { armL: ARM_HANG },
    keys: [
      { t: 0, pose: { armR: ARM_HANG, head: { nod: 2 } } },
      { t: 0.14, pose: { armR: ARM_FACE, head: { nod: 20 }, spine: { lean: 6 } } },
      { t: 0.3, pose: { armR: ARM_FACE, head: { nod: 22, turn: 8 }, spine: { lean: 6 } } },
      { t: 0.44, pose: { armR: ARM_FACE, head: { nod: 22, turn: -8 }, spine: { lean: 6 } } },
      { t: 0.58, pose: { armR: ARM_FACE, head: { nod: 24, turn: 6 }, spine: { lean: 7 } } },
      { t: 0.74, pose: { armR: ARM_HANG, head: { nod: -14 }, spine: { lean: -6 } } },
      { t: 0.88, pose: { armR: ARM_HANG, head: { nod: 6, tilt: 4 } } },
    ],
  },
  {
    id: 'comedy.sneeze',
    duration: 4.5,
    keys: [
      { t: 0, pose: { armL: ARM_HANG, armR: ARM_HANG } },
      { t: 0.14, pose: { armL: ARM_HANG, armR: { fwd: 60, out: 10, bend: 90, twist: -30 }, head: { nod: -16 }, spine: { lean: -6 } } },
      { t: 0.26, pose: { armL: { fwd: 10, out: 14, bend: 20 }, armR: { fwd: 76, out: 8, bend: 100, twist: -40 }, head: { nod: -26 }, spine: { lean: -10 }, root: { y: 0.015 }, footL: 8, footR: 8 } },
      { t: 0.32, pose: planted({ armL: { fwd: 20, out: 16, bend: 30 }, armR: ARM_FACE, head: { nod: 30 }, spine: { lean: 26 }, legL: { fwd: 8, bend: 14 }, legR: { fwd: 8, bend: 14 } }) },
      { t: 0.44, pose: { armL: ARM_HANG, armR: ARM_FACE, head: { nod: 16 }, spine: { lean: 10 } } },
      { t: 0.6, pose: { armL: ARM_HANG, armR: { ...ARM_FACE, out: 14, bend: 98 }, head: { nod: 10, tilt: 6 } } },
      { t: 0.8, pose: { armL: ARM_HANG, armR: ARM_HANG, head: { nod: 2, turn: 10 } } },
    ],
  },
];

export const COMEDY_CLIPS: readonly ClipDef[] = [...COMEDY_A, ...COMEDY_B];
