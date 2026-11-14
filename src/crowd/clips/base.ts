/**
 * Foundational clips. These establish the pose conventions (see pose.ts) that every other clip
 * library follows: angles in degrees, loops that close back to their first key.
 */
import type { ClipDef, Pose } from '../pose';

const RELAX: Pose = {
  armL: { fwd: 2, out: 7, bend: 12 },
  armR: { fwd: 2, out: 7, bend: 12 },
};

export const SIT_BASE: Pose = {
  root: { y: -0.43 },
  legL: { fwd: 86, out: 6, bend: 88 },
  legR: { fwd: 86, out: 6, bend: 88 },
  armL: { fwd: 28, out: 8, bend: 62 },
  armR: { fwd: 28, out: 8, bend: 62 },
  spine: { lean: 3 },
};

const walkKey = (lead: 'L' | 'R'): Pose => {
  const front = { fwd: 27, bend: 6 };
  const back = { fwd: -21, bend: 14 };
  const armFront = { fwd: 26, out: 6, bend: 26 };
  const armBack = { fwd: -22, out: 6, bend: 12 };
  return lead === 'L'
    ? {
        root: { y: -0.014 },
        spine: { twist: -5, lean: 3 },
        legL: front,
        legR: back,
        armL: armBack,
        armR: armFront,
        footL: -14,
        footR: 18,
      }
    : {
        root: { y: -0.014 },
        spine: { twist: 5, lean: 3 },
        legL: back,
        legR: front,
        armL: armFront,
        armR: armBack,
        footL: 18,
        footR: -14,
      };
};

const passKey = (swing: 'L' | 'R'): Pose => {
  const stance = { fwd: 3, bend: 3 };
  const lift = { fwd: 14, bend: 58 };
  const arm = { fwd: 2, out: 6, bend: 18 };
  return {
    root: { y: 0.014 },
    spine: { lean: 3 },
    legL: swing === 'L' ? lift : stance,
    legR: swing === 'R' ? lift : stance,
    armL: arm,
    armR: arm,
    footL: swing === 'L' ? 22 : 0,
    footR: swing === 'R' ? 22 : 0,
  };
};

export const BASE_CLIPS: readonly ClipDef[] = [
  {
    id: 'stand',
    duration: 5,
    base: RELAX,
    keys: [
      { t: 0, pose: {} },
      { t: 0.3, pose: { spine: { side: 2 }, head: { turn: 14, nod: 2 }, root: { roll: 1 } } },
      { t: 0.62, pose: { spine: { side: -2 }, head: { turn: -18 }, root: { roll: -1 } } },
      { t: 0.85, pose: { head: { turn: -4, nod: 5 } } },
    ],
  },
  {
    id: 'walk',
    duration: 1.05,
    stride: 1.42,
    keys: [
      { t: 0, pose: walkKey('L') },
      { t: 0.25, pose: passKey('R') },
      { t: 0.5, pose: walkKey('R') },
      { t: 0.75, pose: passKey('L') },
    ],
  },
  {
    id: 'wave',
    duration: 1.1,
    base: { armL: { fwd: 2, out: 7, bend: 12 }, spine: { side: -3 }, head: { tilt: -4 } },
    keys: [
      { t: 0, pose: { armR: { fwd: 168, out: 28, bend: 18, twist: 10 } } },
      { t: 0.5, pose: { armR: { fwd: 168, out: 52, bend: 34, twist: 10 } } },
    ],
  },
  {
    id: 'talk',
    duration: 3.2,
    base: { armL: { fwd: 12, out: 8, bend: 38 } },
    keys: [
      { t: 0, pose: { armR: { fwd: 38, out: 12, bend: 92, twist: 20 }, head: { nod: 2 } } },
      { t: 0.22, pose: { armR: { fwd: 58, out: 28, bend: 62, twist: 35 }, head: { nod: -4, turn: 6 } } },
      { t: 0.45, pose: { armR: { fwd: 40, out: 10, bend: 100, twist: 10 }, head: { nod: 6 }, spine: { lean: 4 } } },
      { t: 0.7, pose: { armR: { fwd: 62, out: 34, bend: 48, twist: 40 }, armL: { fwd: 30, out: 20, bend: 40 }, head: { turn: -8 } } },
    ],
  },
  {
    id: 'sit',
    duration: 6,
    base: SIT_BASE,
    keys: [
      { t: 0, pose: {} },
      { t: 0.4, pose: { head: { turn: 20, nod: 4 }, spine: { twist: 6 } } },
      { t: 0.75, pose: { head: { turn: -16 }, spine: { twist: -4, lean: 4 } } },
    ],
  },
  {
    id: 'carry',
    duration: 1.05,
    stride: 1.3,
    base: {
      armL: { fwd: 44, out: 4, bend: 78, twist: -18 },
      armR: { fwd: 44, out: 4, bend: 78, twist: -18 },
      spine: { lean: -5 },
    },
    keys: [
      { t: 0, pose: { root: { y: -0.012 }, legL: { fwd: 24, bend: 6 }, legR: { fwd: -19, bend: 14 }, footR: 16 } },
      { t: 0.25, pose: { root: { y: 0.012 }, legL: { fwd: 3, bend: 3 }, legR: { fwd: 13, bend: 54 } } },
      { t: 0.5, pose: { root: { y: -0.012 }, legR: { fwd: 24, bend: 6 }, legL: { fwd: -19, bend: 14 }, footL: 16 } },
      { t: 0.75, pose: { root: { y: 0.012 }, legR: { fwd: 3, bend: 3 }, legL: { fwd: 13, bend: 54 } } },
    ],
  },
  {
    id: 'cheer',
    duration: 0.9,
    keys: [
      {
        t: 0,
        pose: {
          root: { y: -0.03 },
          armL: { fwd: 150, out: 30, bend: 30 },
          armR: { fwd: 150, out: 30, bend: 30 },
          legL: { fwd: 12, bend: 24 },
          legR: { fwd: 12, bend: 24 },
        },
      },
      {
        t: 0.5,
        pose: {
          root: { y: 0.06 },
          armL: { fwd: 176, out: 24, bend: 6 },
          armR: { fwd: 176, out: 24, bend: 6 },
          head: { nod: -12 },
          footL: 30,
          footR: 30,
        },
      },
    ],
  },
  {
    id: 'point',
    duration: 3.4,
    base: { armL: { fwd: 2, out: 7, bend: 12 } },
    keys: [
      { t: 0, pose: { armR: { fwd: 84, out: 8, bend: 4 }, head: { nod: -3 }, spine: { twist: -6 } } },
      { t: 0.5, pose: { armR: { fwd: 92, out: 22, bend: 10 }, head: { turn: -20 }, spine: { twist: -12, lean: 4 } } },
    ],
  },
  {
    id: 'lookout',
    duration: 4.2,
    base: { armL: { fwd: 0, out: 30, bend: 100, twist: -60 }, armR: { fwd: 118, out: 34, bend: 128, twist: -40 } },
    keys: [
      { t: 0, pose: { head: { turn: 30, nod: -6 }, spine: { twist: 12 } } },
      { t: 0.5, pose: { head: { turn: -34, nod: -6 }, spine: { twist: -14 } } },
    ],
  },
  {
    id: 'stroll.stick',
    duration: 1.3,
    stride: 1.25,
    keys: [
      { t: 0, pose: { ...walkKey('L'), armR: { fwd: 30, out: 8, bend: 30 }, gripR: { pitch: 34 } } },
      { t: 0.25, pose: { ...passKey('R'), armR: { fwd: 14, out: 8, bend: 34 }, gripR: { pitch: 30 } } },
      { t: 0.5, pose: { ...walkKey('R'), armR: { fwd: -6, out: 8, bend: 28 }, gripR: { pitch: 4 } } },
      { t: 0.75, pose: { ...passKey('L'), armR: { fwd: 22, out: 8, bend: 42 }, gripR: { pitch: 40 } } },
    ],
  },
  {
    id: 'stand.stick',
    duration: 6,
    base: {
      armL: { fwd: 2, out: 7, bend: 12 },
      armR: { fwd: 24, out: 14, bend: 34 },
      gripR: { pitch: 22, roll: 8 },
    },
    keys: [
      { t: 0, pose: {} },
      { t: 0.3, pose: { head: { turn: 22, nod: -3 }, spine: { twist: 5 } } },
      { t: 0.55, pose: { head: { turn: -26 }, spine: { twist: -6, side: 2 } } },
      { t: 0.8, pose: { head: { nod: 6, turn: -4 }, armL: { fwd: 150, out: 30, bend: 40 } } },
    ],
  },
];
