/**
 * Walking variants. Every clip is a cyclic gait whose stride is derived from its leg angles so the
 * feet do not skate; longer variants chain two cycles to fit a glance or gesture into the loop.
 */
import type { ClipDef, LimbPose } from '../../pose';
import { ARM_BEHIND, gaitCycles, gaitKeys, gaitStride, level, walkWith, RUN_GAIT } from './helpers';

const BRISK = walkWith({ reach: 31, push: -24, armSwing: 36, armBend: 70, lean: 6, twist: 7, hop: 0.016 });
const SHUFFLE = walkWith({ reach: 13, push: -9, frontBend: 16, backBend: 18, liftFwd: 16, liftBend: 30, hop: 0.004, armSwing: 8, armBend: 34, lean: 14, twist: 2 });
const AMBLE = walkWith({ reach: 18, push: -14, liftBend: 50, armSwing: 14, lean: 0, twist: 3 });
const SNEAK = walkWith({ reach: 24, push: -20, frontBend: 26, backBend: 28, liftFwd: 34, liftBend: 80, hop: 0, armSwing: 6, lean: 16, twist: 2 });
const ARMIN = walkWith({ reach: 22, push: -17, liftBend: 50, armSwing: 18, lean: 2, twist: 3 });

const UMBRELLA: LimbPose = { fwd: 52, out: 12, bend: 84, twist: -20 };
const BALLOON: LimbPose = { fwd: 148, out: 16, bend: 12 };
const HOOK_L: LimbPose = { fwd: 16, out: 22, bend: 92, twist: -52 };
const CREEP: LimbPose = { fwd: 40, out: 24, bend: 96, twist: -20 };
const round2 = (v: number): number => Math.round(v * 100) / 100;

export const WALK_CLIPS: readonly ClipDef[] = [
  {
    id: 'walk.brisk',
    duration: 0.92,
    ease: 'linear',
    stride: gaitStride(BRISK),
    keys: gaitKeys(BRISK, { extra: { head: { nod: -2 } } }),
  },
  {
    id: 'walk.shuffle',
    duration: 1.5,
    ease: 'linear',
    stride: gaitStride(SHUFFLE),
    keys: gaitKeys(SHUFFLE, { extra: { head: { nod: -10 } } }),
  },
  {
    id: 'walk.amble',
    duration: 2.7,
    ease: 'linear',
    stride: round2(gaitStride(AMBLE) * 2),
    keys: gaitCycles(AMBLE, { armL: ARM_BEHIND }, [
      { head: { turn: 30, nod: -10 } },
      { head: { turn: -28, nod: -14 } },
    ]),
  },
  {
    id: 'walk.run',
    duration: 0.66,
    ease: 'linear',
    stride: round2(gaitStride(RUN_GAIT) * 1.15),
    keys: gaitKeys(RUN_GAIT),
  },
  {
    id: 'walk.sneak',
    duration: 1.8,
    ease: 'linear',
    stride: gaitStride(SNEAK),
    keys: gaitKeys(SNEAK, {
      armL: CREEP,
      armR: CREEP,
      extra: { footL: 22, footR: 22 },
      contactL: { head: { turn: 20, nod: -6 } },
      contactR: { head: { turn: -20, nod: -6 } },
    }),
  },
  {
    id: 'walk.umbrella',
    duration: 1.1,
    ease: 'linear',
    stride: gaitStride(AMBLE),
    keys: gaitKeys(AMBLE, { armR: UMBRELLA, extra: { gripR: level(UMBRELLA) } }),
  },
  {
    id: 'walk.balloon',
    duration: 2.3,
    ease: 'linear',
    stride: round2(gaitStride(AMBLE) * 2),
    keys: gaitCycles(AMBLE, { armR: BALLOON, extra: { gripR: level(BALLOON) } }, [
      { head: { nod: -24, turn: -8 } },
      { head: { nod: 0, turn: 10 } },
    ]),
  },
  {
    id: 'walk.armin',
    duration: 1.2,
    ease: 'linear',
    stride: gaitStride(ARMIN),
    keys: gaitKeys(ARMIN, { armL: HOOK_L, extra: { spine: { side: 5 }, head: { tilt: 6, turn: 12 } } }),
  },
];

