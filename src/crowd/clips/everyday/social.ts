/**
 * Conversation and greeting clips. Each loop alternates the key gesture with a quieter beat so two
 * people talking to each other read as a conversation, not a pair of metronomes.
 */
import type { ClipDef, LimbPose } from '../../pose';
import { ARM_BEHIND, ARM_FOLD_L, ARM_FOLD_R, ARM_FRONT, ARM_HANG, ARM_HIP, ARM_MOUTH, planted } from './helpers';

const PALM_UP: LimbPose = { fwd: 46, out: 26, bend: 70, twist: 48 };
const JAB: LimbPose = { fwd: 62, out: 8, bend: 34, twist: 10 };
const BELLY: LimbPose = { fwd: 26, out: 6, bend: 84, twist: -40 };

const TALK_CLIPS: readonly ClipDef[] = [
  {
    id: 'talk.animated',
    duration: 5.5,
    keys: [
      { t: 0, pose: { armL: { fwd: 30, out: 14, bend: 70, twist: 20 }, armR: { fwd: 52, out: 30, bend: 60, twist: 40 } } },
      {
        t: 0.16,
        pose: { armL: { fwd: 54, out: 34, bend: 52, twist: 44 }, armR: { fwd: 70, out: 22, bend: 46, twist: 30 }, head: { nod: -6, turn: 8 } },
      },
      {
        t: 0.32,
        pose: { armL: { fwd: 26, out: 10, bend: 80, twist: 10 }, armR: { fwd: 44, out: 10, bend: 96, twist: 10 }, head: { nod: 6 }, spine: { lean: 5 } },
      },
      {
        t: 0.5,
        pose: { armL: ARM_HANG, armR: { fwd: 90, out: 30, bend: 70, twist: 30 }, head: { turn: -10, tilt: 4 }, spine: { twist: -6 } },
      },
      { t: 0.68, pose: { armL: ARM_HIP, armR: { fwd: 40, out: 20, bend: 88, twist: 30 }, head: { nod: 3, turn: 4 } } },
      {
        t: 0.84,
        pose: { armL: { fwd: 40, out: 24, bend: 64, twist: 40 }, armR: { fwd: 60, out: 40, bend: 50, twist: 50 }, head: { nod: -4 } },
      },
    ],
  },
  {
    id: 'talk.nod',
    duration: 6,
    base: { armL: ARM_FOLD_L, armR: ARM_FOLD_R, head: { tilt: 4 } },
    keys: [
      { t: 0, pose: { head: { nod: 0 } } },
      { t: 0.1, pose: { head: { nod: 12 } } },
      { t: 0.2, pose: { head: { nod: -2 } } },
      { t: 0.3, pose: { head: { nod: 10 } } },
      { t: 0.45, pose: { head: { nod: 2, tilt: 6 }, spine: { lean: 3 } } },
      { t: 0.65, pose: { head: { nod: 4, turn: 8, tilt: -4 } } },
      { t: 0.75, pose: { head: { nod: 13, turn: 6 } } },
      { t: 0.86, pose: { head: { nod: -2 } } },
    ],
  },
  {
    id: 'talk.laugh',
    duration: 4.5,
    keys: [
      { t: 0, pose: { armL: ARM_HANG, armR: { fwd: 20, out: 10, bend: 50 }, head: { nod: 2 } } },
      { t: 0.14, pose: { armL: BELLY, armR: { fwd: 30, out: 20, bend: 40 }, head: { nod: -26 }, spine: { lean: -10 } } },
      { t: 0.24, pose: { armL: BELLY, armR: { fwd: 26, out: 22, bend: 46 }, head: { nod: -18 }, spine: { lean: -6 } } },
      { t: 0.34, pose: { armL: BELLY, armR: { fwd: 32, out: 20, bend: 40 }, head: { nod: -26, tilt: 6 }, spine: { lean: -10 } } },
      {
        t: 0.5,
        pose: planted({ armL: BELLY, armR: { fwd: 40, out: 10, bend: 30 }, head: { nod: 12 }, spine: { lean: 22 }, legL: { fwd: 6, bend: 10 }, legR: { fwd: 6, bend: 10 } }),
      },
      { t: 0.62, pose: { armL: BELLY, armR: { fwd: 30, out: 10, bend: 40 }, head: { nod: -10 }, spine: { lean: -4 } } },
      { t: 0.8, pose: { armL: ARM_HANG, armR: { fwd: 16, out: 10, bend: 40 }, head: { turn: 10, nod: 2 } } },
    ],
  },
  {
    id: 'talk.haggle',
    duration: 5,
    keys: [
      { t: 0, pose: { armL: PALM_UP, armR: PALM_UP, head: { turn: 0, tilt: 6 }, spine: { lean: -3 } } },
      { t: 0.14, pose: { armL: { ...PALM_UP, out: 40 }, armR: { ...PALM_UP, out: 40 }, head: { tilt: -6, nod: -4 } } },
      { t: 0.3, pose: { armL: ARM_HIP, armR: JAB, head: { nod: 4 }, spine: { lean: 6 } } },
      { t: 0.38, pose: { armL: ARM_HIP, armR: { ...JAB, fwd: 50, bend: 50 }, head: { nod: 8 }, spine: { lean: 8 } } },
      { t: 0.46, pose: { armL: ARM_HIP, armR: JAB, head: { nod: 4 }, spine: { lean: 6 } } },
      { t: 0.6, pose: { armL: ARM_FOLD_L, armR: ARM_FOLD_R, head: { turn: -16 } } },
      { t: 0.72, pose: { armL: ARM_FOLD_L, armR: ARM_FOLD_R, head: { turn: 14 } } },
      { t: 0.84, pose: { armL: ARM_FOLD_L, armR: ARM_FOLD_R, head: { turn: -8, nod: 4 } } },
    ],
  },
  {
    id: 'talk.whisper',
    duration: 6,
    base: { armL: ARM_HANG },
    keys: [
      { t: 0, pose: { armR: ARM_HANG, head: { turn: 4 } } },
      {
        t: 0.15,
        pose: { armR: { ...ARM_MOUTH, out: 18, twist: -14 }, spine: { lean: 10, side: 8 }, head: { tilt: 12, turn: 10 } },
      },
      {
        t: 0.5,
        pose: { armR: { ...ARM_MOUTH, out: 20, twist: -12, bend: 124 }, spine: { lean: 12, side: 9 }, head: { tilt: 13, turn: 12, nod: 4 } },
      },
      { t: 0.66, pose: { armR: ARM_HANG, spine: { lean: 2 }, head: { turn: -18, nod: -3 } } },
      { t: 0.84, pose: { armR: ARM_HANG, head: { turn: 22, nod: 2 } } },
    ],
  },
  {
    id: 'talk.shrug',
    duration: 4.5,
    keys: [
      { t: 0, pose: { armL: ARM_HANG, armR: ARM_HANG } },
      {
        t: 0.2,
        pose: {
          armL: { fwd: 12, out: 24, bend: 92, twist: 62 },
          armR: { fwd: 12, out: 24, bend: 92, twist: 62 },
          spine: { lean: -4 },
          head: { tilt: 12, nod: -4 },
        },
      },
      {
        t: 0.4,
        pose: {
          armL: { fwd: 14, out: 28, bend: 90, twist: 66 },
          armR: { fwd: 14, out: 28, bend: 90, twist: 66 },
          spine: { lean: -5 },
          head: { tilt: 14, nod: -6 },
        },
      },
      { t: 0.56, pose: { armL: ARM_HANG, armR: ARM_HANG, head: { tilt: 2, turn: -10 } } },
      { t: 0.8, pose: { armL: ARM_HIP, armR: ARM_HANG, head: { turn: 10 } } },
    ],
  },
];

const waveUp = (out: number, bend: number): LimbPose => ({ fwd: 166, out, bend, twist: 10 });

const GREET_CLIPS: readonly ClipDef[] = [
  {
    id: 'greet.bigwave',
    duration: 4,
    keys: [
      { t: 0, pose: { root: { y: 0.02 }, footL: 16, footR: 16, armL: waveUp(26, 14), armR: waveUp(54, 34), head: { nod: -8 } } },
      { t: 0.12, pose: { armL: waveUp(54, 34), armR: waveUp(26, 14), head: { nod: -8, tilt: 4 } } },
      { t: 0.24, pose: { root: { y: 0.02 }, footL: 16, footR: 16, armL: waveUp(26, 14), armR: waveUp(54, 34), head: { nod: -10 } } },
      { t: 0.36, pose: { armL: waveUp(54, 34), armR: waveUp(26, 14), head: { nod: -8, tilt: -4 } } },
      { t: 0.48, pose: { root: { y: 0.02 }, footL: 16, footR: 16, armL: waveUp(26, 14), armR: waveUp(54, 34), head: { nod: -8 } } },
      { t: 0.64, pose: { armL: ARM_HANG, armR: { fwd: 150, out: 30, bend: 30 }, head: { nod: -2 } } },
      { t: 0.84, pose: { armL: ARM_HANG, armR: { fwd: 40, out: 20, bend: 40 }, head: { turn: 8 } } },
    ],
  },
  {
    id: 'greet.hattip',
    duration: 5,
    base: { armL: ARM_HANG },
    keys: [
      { t: 0, pose: { armR: ARM_HANG } },
      { t: 0.2, pose: { armR: { fwd: 122, out: 14, bend: 118, twist: -40 }, head: { nod: -4 } } },
      { t: 0.36, pose: { armR: { fwd: 128, out: 18, bend: 112, twist: -36 }, head: { nod: 14 }, spine: { lean: 8 } } },
      { t: 0.52, pose: { armR: { fwd: 90, out: 24, bend: 80, twist: 10 }, head: { nod: 2 }, spine: { lean: 2 } } },
      { t: 0.7, pose: { armR: ARM_HANG, head: { turn: 14 } } },
    ],
  },
  {
    id: 'greet.handshake',
    duration: 4,
    base: { armL: ARM_HANG, spine: { lean: 6 } },
    keys: [
      { t: 0, pose: { armR: { fwd: 40, out: 4, bend: 30 }, head: { nod: 4 } } },
      { t: 0.12, pose: { armR: { fwd: 30, out: 4, bend: 36 }, head: { nod: 8 } } },
      { t: 0.24, pose: { armR: { fwd: 46, out: 4, bend: 26 }, head: { nod: 2 } } },
      { t: 0.36, pose: { armR: { fwd: 30, out: 4, bend: 36 }, head: { nod: 8 } } },
      { t: 0.48, pose: { armR: { fwd: 42, out: 4, bend: 30 }, head: { nod: 2, tilt: 4 } } },
      { t: 0.75, pose: { armR: { fwd: 40, out: 4, bend: 30 }, armL: { fwd: 30, out: 6, bend: 40 }, head: { tilt: -3 } } },
    ],
  },
  {
    id: 'greet.bow',
    duration: 5,
    base: { armL: ARM_BEHIND },
    keys: [
      { t: 0, pose: { armR: ARM_HANG } },
      { t: 0.2, pose: { armR: ARM_FRONT, spine: { lean: 34 }, root: { pitch: 8 }, head: { nod: 10 } } },
      { t: 0.5, pose: { armR: ARM_FRONT, spine: { lean: 36 }, root: { pitch: 9 }, head: { nod: 12 } } },
      { t: 0.68, pose: { armR: ARM_HANG, spine: { lean: -2 }, head: { nod: -4 } } },
      { t: 0.85, pose: { armR: ARM_HANG, head: { turn: 10 } } },
    ],
  },
  {
    id: 'greet.hug',
    duration: 5,
    keys: [
      { t: 0, pose: { armL: ARM_HANG, armR: ARM_HANG } },
      {
        t: 0.2,
        pose: { armL: { fwd: 74, out: 62, bend: 18 }, armR: { fwd: 74, out: 62, bend: 18 }, spine: { lean: -6 }, head: { nod: -8 } },
      },
      {
        t: 0.4,
        pose: {
          root: { y: 0.02 },
          footL: 18,
          footR: 18,
          armL: { fwd: 80, out: 30, bend: 82, twist: -44 },
          armR: { fwd: 76, out: 26, bend: 90, twist: -44 },
          spine: { lean: 6 },
          head: { tilt: 10, turn: -10 },
        },
      },
      {
        t: 0.62,
        pose: {
          root: { y: 0.02 },
          footL: 18,
          footR: 18,
          armL: { fwd: 80, out: 30, bend: 86, twist: -44 },
          armR: { fwd: 76, out: 26, bend: 94, twist: -44 },
          spine: { lean: 6, side: 3 },
          head: { tilt: 12, turn: -12 },
        },
      },
      { t: 0.8, pose: { armL: { fwd: 30, out: 12, bend: 40 }, armR: { fwd: 30, out: 12, bend: 40 } } },
    ],
  },
  {
    id: 'greet.kiss',
    duration: 4,
    base: { armL: ARM_HIP },
    keys: [
      { t: 0, pose: { armR: ARM_HANG, head: { tilt: 4 } } },
      { t: 0.22, pose: { armR: ARM_MOUTH, head: { nod: 6, tilt: 8 } } },
      { t: 0.36, pose: { armR: { fwd: 96, out: 34, bend: 10, twist: 40 }, head: { nod: -6, tilt: 10 }, spine: { lean: 4 } } },
      { t: 0.5, pose: { armR: { fwd: 90, out: 40, bend: 14, twist: 40 }, head: { nod: -4, tilt: 12 } } },
      { t: 0.75, pose: { armR: ARM_HANG, head: { tilt: 6, turn: 8 } } },
    ],
  },
];

export const SOCIAL_CLIPS: readonly ClipDef[] = [...TALK_CLIPS, ...GREET_CLIPS];
