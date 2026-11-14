/**
 * Carrying, pushing and pulling. Locomotion clips are built from the shared gait so their stride
 * matches the foot travel; the held arms are fixed overrides on top of the legs.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { gaitKeys, gaitStride, level, planted, walkWith } from './helpers';

const HEAVY = walkWith({ reach: 20, push: -17, liftBend: 46, armSwing: 0, lean: 6, twist: 3, hop: 0.006 });
const STACK = walkWith({ reach: 18, push: -16, liftBend: 44, lean: -8, twist: 2, hop: 0.006 });
const BAGS = walkWith({ reach: 22, push: -18, liftBend: 50, lean: 4, twist: 4 });
const PUSH = walkWith({ reach: 22, push: -22, liftBend: 50, lean: 12, twist: 2 });
const PULL = walkWith({ reach: 18, push: -16, liftBend: 42, lean: -12, twist: 2, hop: 0.004 });

const SHOULDER_R: LimbPose = { fwd: 118, out: 46, bend: 142, twist: -24 };
const STACK_ARM: LimbPose = { fwd: 72, out: 8, bend: 62, twist: -24 };
const BAG_L: LimbPose = { fwd: 2, out: 14, bend: 6 };
const BAG_R: LimbPose = { fwd: 2, out: 14, bend: 6 };
const TRAY_UP: LimbPose = { fwd: 152, out: 26, bend: 34, twist: 10 };
const PLANK_R: LimbPose = { fwd: 108, out: 40, bend: 140, twist: -24 };
const CART: LimbPose = { fwd: 50, out: 10, bend: 40, twist: -10 };
const PRAM: LimbPose = { fwd: 44, out: 8, bend: 36, twist: -10 };
const LEAD: LimbPose = { fwd: 62, out: 6, bend: 12 };
const DRAG: LimbPose = { fwd: -28, out: 10, bend: 4 };

const wobble = (x: number, side: number, lean: number, step?: 'L' | 'R'): Pose =>
  planted({
    root: { x, roll: -side * 0.5 },
    spine: { side, lean: -8 + lean },
    armL: { ...STACK_ARM, out: 8 + Math.max(0, -side) * 2 },
    armR: { ...STACK_ARM, out: 8 + Math.max(0, side) * 2 },
    gripR: level(STACK_ARM),
    head: { nod: -10, tilt: -side },
    legL: step === 'L' ? { fwd: 18, out: 10, bend: 26 } : { out: 4 },
    legR: step === 'R' ? { fwd: 18, out: 10, bend: 26 } : { out: 4 },
  });

const CARRY_CLIPS: readonly ClipDef[] = [
  {
    id: 'carry.sack',
    duration: 1.3,
    ease: 'linear',
    stride: gaitStride(HEAVY),
    keys: gaitKeys(HEAVY, {
      armR: SHOULDER_R,
      armL: { fwd: 8, out: 12, bend: 20 },
      extra: { gripR: level(SHOULDER_R), spine: { side: 7 }, head: { tilt: 8, nod: 4 } },
    }),
  },
  {
    id: 'carry.stack',
    duration: 1.35,
    ease: 'linear',
    stride: gaitStride(STACK),
    keys: gaitKeys(STACK, { armL: STACK_ARM, armR: STACK_ARM, extra: { gripR: level(STACK_ARM), head: { nod: -12 } } }),
  },
  {
    id: 'carry.bags',
    duration: 1.2,
    ease: 'linear',
    stride: gaitStride(BAGS),
    keys: gaitKeys(BAGS, {
      armL: BAG_L,
      armR: BAG_R,
      extra: { gripL: level(BAG_L), gripR: level(BAG_R) },
      contactL: { spine: { side: 2 } },
      contactR: { spine: { side: -2 } },
    }),
  },
  {
    id: 'carry.trayup',
    duration: 1.1,
    ease: 'linear',
    stride: gaitStride(BAGS),
    keys: gaitKeys(BAGS, { armR: TRAY_UP, extra: { gripR: level(TRAY_UP), spine: { side: 3 }, head: { nod: -4 } } }),
  },
  {
    id: 'carry.plank',
    duration: 1.25,
    ease: 'linear',
    stride: gaitStride(HEAVY),
    keys: gaitKeys(HEAVY, {
      armR: PLANK_R,
      armL: { fwd: 6, out: 10, bend: 20 },
      extra: { gripR: level(PLANK_R), spine: { side: 4 }, head: { tilt: 6 } },
    }),
  },
  {
    id: 'carry.wobble',
    duration: 3.6,
    keys: [
      { t: 0, pose: wobble(0, 0, 0) },
      { t: 0.15, pose: wobble(0.03, 9, 4, 'L') },
      { t: 0.3, pose: wobble(0.01, -6, -4) },
      { t: 0.45, pose: wobble(-0.03, -10, 2, 'R') },
      { t: 0.6, pose: wobble(-0.01, 7, 6) },
      { t: 0.75, pose: wobble(0.02, 4, -6, 'L') },
      { t: 0.88, pose: wobble(0, -3, 0) },
    ],
  },
];

const PUSH_CLIPS: readonly ClipDef[] = [
  {
    id: 'push.cart',
    duration: 1.25,
    ease: 'linear',
    stride: gaitStride(PUSH),
    keys: gaitKeys(PUSH, { armL: CART, armR: CART, extra: { head: { nod: -6 } } }),
  },
  {
    id: 'push.pram',
    duration: 1.4,
    ease: 'linear',
    stride: gaitStride(PUSH),
    keys: gaitKeys(PUSH, {
      armL: PRAM,
      armR: PRAM,
      extra: { spine: { lean: -4 } },
      contactL: { head: { nod: 18 } },
      contactR: { head: { nod: 4, turn: 10 } },
    }),
  },
];

const PULL_CLIPS: readonly ClipDef[] = [
  {
    id: 'pull.lead',
    duration: 1.4,
    ease: 'linear',
    stride: gaitStride(PULL),
    keys: gaitKeys(PULL, {
      armR: LEAD,
      armL: { fwd: 48, out: 4, bend: 30, twist: -10 },
      extra: { gripR: level(LEAD), head: { nod: 6 } },
      contactL: { armR: { fwd: 70 } },
      contactR: { armR: { fwd: 56 } },
    }),
  },
  {
    id: 'pull.suitcase',
    duration: 1.15,
    ease: 'linear',
    stride: gaitStride(BAGS),
    keys: gaitKeys(BAGS, { armR: DRAG, extra: { gripR: level(DRAG), spine: { twist: -4 } } }),
  },
];

export const CARRY_CLIPS_ALL: readonly ClipDef[] = [...CARRY_CLIPS, ...PUSH_CLIPS, ...PULL_CLIPS];
