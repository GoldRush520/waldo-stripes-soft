/**
 * Idle standing clips: people waiting, loitering and fidgeting. Long loops with glances and weight
 * shifts so a crowd of idlers never looks cloned.
 */
import type { ClipDef, Pose } from '../../pose';
import {
  ARM_BEHIND,
  ARM_CHEST,
  ARM_FOLD_L,
  ARM_FOLD_R,
  ARM_HANG,
  ARM_HIP,
  RELAX,
  level,
  planted,
} from './helpers';

/** weight on the left leg, right knee relaxed */
const ONTO_L: Pose = planted({
  root: { x: 0.025, roll: -2 },
  spine: { side: 2 },
  legL: { out: 2 },
  legR: { fwd: 6, out: 6, bend: 12 },
  footR: 6,
});
const ONTO_R: Pose = planted({
  root: { x: -0.025, roll: 2 },
  spine: { side: -2 },
  legR: { out: 2 },
  legL: { fwd: 6, out: 6, bend: 12 },
  footL: 6,
});

const PHONE_ARM = ARM_CHEST;

export const IDLE_CLIPS: readonly ClipDef[] = [
  {
    id: 'idle.shift',
    duration: 7,
    base: RELAX,
    keys: [
      { t: 0, pose: ONTO_L },
      { t: 0.22, pose: { ...ONTO_L, head: { turn: 18, nod: 2 } } },
      { t: 0.45, pose: { ...ONTO_R, head: { turn: 6, tilt: 3 } } },
      { t: 0.68, pose: { ...ONTO_R, head: { turn: -22 }, armR: { fwd: 6, out: 8, bend: 30 } } },
      { t: 0.86, pose: { head: { nod: 6 } } },
    ],
  },
  {
    id: 'idle.hips',
    duration: 6,
    base: { armL: ARM_HIP, armR: ARM_HIP, spine: { lean: -3 } },
    keys: [
      { t: 0, pose: ONTO_L },
      { t: 0.3, pose: { ...ONTO_L, head: { turn: 26, nod: -4 }, spine: { twist: 8 } } },
      { t: 0.55, pose: { ...ONTO_R, head: { turn: -10, nod: 3 } } },
      { t: 0.8, pose: { ...ONTO_R, head: { turn: -28, tilt: -4 }, spine: { twist: -8 } } },
    ],
  },
  {
    id: 'idle.arms',
    duration: 6.5,
    base: { armL: ARM_FOLD_L, armR: ARM_FOLD_R },
    keys: [
      { t: 0, pose: { ...ONTO_R, head: { tilt: 4 } } },
      { t: 0.25, pose: { ...ONTO_R, head: { tilt: 6, nod: 8 } } },
      { t: 0.5, pose: { ...ONTO_L, head: { turn: 20, nod: -2 } } },
      { t: 0.75, pose: { ...ONTO_L, head: { turn: -14, tilt: -4 }, spine: { lean: -3 } } },
    ],
  },
  {
    id: 'idle.behind',
    duration: 5.5,
    base: { armL: ARM_BEHIND, armR: ARM_BEHIND, spine: { lean: -2 } },
    keys: [
      { t: 0, pose: { head: { turn: 10 } } },
      { t: 0.2, pose: { root: { y: 0.035 }, footL: 26, footR: 26, head: { nod: -4, turn: 14 } } },
      { t: 0.35, pose: { head: { turn: 4 } } },
      { t: 0.6, pose: { head: { turn: -26, nod: 2 }, spine: { twist: -6 } } },
      { t: 0.8, pose: { root: { y: 0.03 }, footL: 22, footR: 22, head: { turn: -8, nod: -3 } } },
    ],
  },
  {
    id: 'idle.watch',
    duration: 6,
    base: { armR: ARM_HANG },
    keys: [
      { t: 0, pose: { armL: ARM_HANG, head: { turn: 16 } } },
      { t: 0.18, pose: { armL: { fwd: 58, out: 2, bend: 112, twist: -62 }, head: { nod: 26, turn: -6 } } },
      { t: 0.36, pose: { armL: { fwd: 60, out: 2, bend: 114, twist: -58 }, head: { nod: 24, turn: -8, tilt: 4 } } },
      { t: 0.46, pose: { armL: { fwd: 48, out: 4, bend: 100, twist: -40 }, head: { nod: 4, turn: 22 } } },
      { t: 0.62, pose: { armL: ARM_HANG, head: { turn: 28, nod: -4 }, spine: { twist: 6 } } },
      { t: 0.84, pose: { armL: ARM_HANG, head: { turn: -18 }, ...ONTO_R } },
    ],
  },
  {
    id: 'idle.phone',
    duration: 7,
    base: { armR: PHONE_ARM, gripR: level(PHONE_ARM), armL: ARM_HANG, head: { nod: 24 }, spine: { lean: 4 } },
    keys: [
      { t: 0, pose: { ...ONTO_L, head: { turn: -4 } } },
      { t: 0.2, pose: { ...ONTO_L, armR: { bend: 5 }, head: { turn: -6, tilt: 4 } } },
      { t: 0.4, pose: { ...ONTO_L, armR: { bend: -3 } } },
      { t: 0.55, pose: { head: { nod: -20, turn: 24 }, spine: { lean: -4 } } },
      { t: 0.68, pose: { ...ONTO_R, armL: { fwd: 14, out: 8, bend: 40 } } },
      { t: 0.88, pose: { ...ONTO_R, armR: { bend: 4 }, head: { tilt: -3 } } },
    ],
  },
  {
    id: 'idle.stretch',
    duration: 8,
    keys: [
      { t: 0, pose: { ...RELAX, head: { turn: 6 } } },
      {
        t: 0.16,
        pose: {
          root: { y: 0.02 },
          armL: { fwd: 168, out: 22, bend: 26 },
          armR: { fwd: 168, out: 22, bend: 26 },
          spine: { lean: -10 },
          head: { nod: -22 },
          footL: 14,
          footR: 14,
        },
      },
      {
        t: 0.3,
        pose: {
          armL: { fwd: 172, out: 34, bend: 12 },
          armR: { fwd: 172, out: 34, bend: 12 },
          spine: { lean: -12, side: 6 },
          head: { nod: -26, tilt: 6 },
        },
      },
      {
        t: 0.44,
        pose: { armL: ARM_HANG, armR: { fwd: 100, out: 22, bend: 140, twist: -30 }, head: { nod: 12, tilt: -6 } },
      },
      {
        t: 0.58,
        pose: { armL: ARM_HANG, armR: { fwd: 104, out: 26, bend: 136, twist: -28 }, head: { nod: 16, tilt: 8 } },
      },
      { t: 0.74, pose: { ...ONTO_L, ...RELAX, head: { turn: -18 } } },
    ],
  },
  {
    id: 'idle.tap',
    duration: 4,
    base: { armL: ARM_FOLD_L, armR: ARM_FOLD_R, root: { x: 0.02, roll: -1 } },
    keys: [
      { t: 0, pose: { legR: { fwd: 10, out: 6, bend: 4 }, footR: -22, head: { turn: -12 } } },
      { t: 0.12, pose: { legR: { fwd: 10, out: 6, bend: 4 }, footR: 4 } },
      { t: 0.24, pose: { legR: { fwd: 10, out: 6, bend: 4 }, footR: -22, head: { turn: -16, nod: -4 } } },
      { t: 0.36, pose: { legR: { fwd: 10, out: 6, bend: 4 }, footR: 4 } },
      { t: 0.48, pose: { legR: { fwd: 10, out: 6, bend: 4 }, footR: -22, head: { turn: 14 } } },
      { t: 0.6, pose: { legR: { fwd: 10, out: 6, bend: 4 }, footR: 4, head: { turn: 18, tilt: 4 } } },
      { t: 0.8, pose: { legR: { fwd: 4, out: 4, bend: 2 }, head: { nod: 8, turn: 2 }, spine: { side: -2 } } },
    ],
  },
];
