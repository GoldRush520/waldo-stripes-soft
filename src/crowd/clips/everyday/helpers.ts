/**
 * Shared pose fragments and builders for the everyday clip library.
 *
 * Everything here is immutable data or pure functions returning new objects. The ground helpers use
 * the rig metrics so feet stay planted when knees bend or the body pitches.
 */
import type { ClipKey, LimbPose, Pose } from '../../pose';
import { withPose } from '../../pose';
import { RIG } from '../../skeleton';

const D2R = Math.PI / 180;

/* ------------------------------------------------------------------ arm fragments */

export const ARM_HANG: LimbPose = { fwd: 2, out: 7, bend: 12 };
export const RELAX: Pose = { armL: ARM_HANG, armR: ARM_HANG };
/** hand resting on the hip (same values work for either side) */
export const ARM_HIP: LimbPose = { fwd: -20, out: 36, bend: 85, twist: -54 };
/** forearms folded across the chest (left under, right over so they do not intersect) */
export const ARM_FOLD_L: LimbPose = { fwd: 24, out: 2, bend: 90, twist: -78 };
export const ARM_FOLD_R: LimbPose = { fwd: 30, out: 4, bend: 98, twist: -72 };
/** hands clasped at the small of the back */
export const ARM_BEHIND: LimbPose = { fwd: -24, out: 12, bend: 62, twist: -82 };
/** both hands meeting in front of the belly (holding a book, a bowl, clapping height) */
export const ARM_FRONT: LimbPose = { fwd: 36, out: 6, bend: 88, twist: -32 };
/** hand raised to the mouth (eating, sipping, blowing a kiss) */
export const ARM_MOUTH: LimbPose = { fwd: 80, out: 4, bend: 120, twist: -42 };
/** forearm up in front of the chest, hand at chest height (phone, pad, coins) */
export const ARM_CHEST: LimbPose = { fwd: 16, out: 6, bend: 100, twist: -30 };
/** hand up at eye level in front of the face (camera, binoculars, shading the eyes) */
export const ARM_EYE: LimbPose = { fwd: 80, out: 4, bend: 110, twist: -30 };
/** hand cupping the chin (thinking) */
export const ARM_CHIN: LimbPose = { fwd: 64, out: 2, bend: 125, twist: -48 };
/** palm over the face (facepalm, sneeze) */
export const ARM_FACE: LimbPose = { fwd: 100, out: 4, bend: 105, twist: -48 };
/** hand beside the ear (phone call, cupping to listen) */
export const ARM_EAR: LimbPose = { fwd: 100, out: 8, bend: 140, twist: -24 };
/** hand on the back of the head (scratching, sunbathing) */
export const ARM_HEAD: LimbPose = { fwd: 140, out: 48, bend: 128, twist: -20 };
/** relaxed forearm forward, as if holding a bag handle or a cup low */
export const ARM_HOLD: LimbPose = { fwd: 18, out: 8, bend: 64, twist: -10 };

/** grip pitch that keeps an upright prop level for a given arm pose */
export const level = (arm: LimbPose): { readonly pitch: number } => ({
  pitch: (arm.fwd ?? 0) + (arm.bend ?? 0),
});

/** mirror of a limb used when building one-sided gestures */
export const limb = (base: LimbPose, over: LimbPose): LimbPose => ({ ...base, ...over });

/* ------------------------------------------------------------------ ground contact */

const SOLE_PTS: readonly (readonly [number, number])[] = [
  [-RIG.ANKLE_H, -0.04],
  [-RIG.ANKLE_H, 0.13],
];

/** vertical distance from the hip joint down to the lowest heel/toe point of one leg */
const legDrop = (leg: LimbPose | undefined, foot: number, pitch: number): number => {
  const a = ((leg?.fwd ?? 0) - pitch) * D2R;
  const b = (leg?.bend ?? 0) * D2R;
  const o = Math.cos((leg?.out ?? 0) * D2R);
  const f = foot * D2R + b - a;
  const soleDrop = Math.max(...SOLE_PTS.map(([y, z]) => -(Math.cos(f) * y - Math.sin(f) * z)));
  return o * (RIG.THIGH * Math.cos(a) + RIG.SHIN * Math.cos(a - b)) + soleDrop;
};

/**
 * Root height offset that puts the lowest heel or toe on the ground for this leg pose (sagittal
 * approximation that matches the rig's hip / knee / ankle rotation order).
 */
export const groundY = (pose: Pose): number => {
  const pitch = pose.root?.pitch ?? 0;
  const drop = Math.max(legDrop(pose.legL, pose.footL ?? 0, pitch), legDrop(pose.legR, pose.footR ?? 0, pitch));
  return Math.round((drop - RIG.THIGH - RIG.SHIN - RIG.ANKLE_H) * 1000) / 1000;
};

/** Returns the pose with root.y set so the feet touch the ground (plus an optional lift). */
export const planted = (pose: Pose, lift = 0): Pose => ({
  ...pose,
  root: { ...pose.root, y: groundY(pose) + lift },
});

/** Horizontal distance between the two soles of a double-support pose (metres). */
export const footSpan = (front: LimbPose, back: LimbPose): number => {
  const reach = (leg: LimbPose): number => {
    const a = (leg.fwd ?? 0) * D2R;
    const b = (leg.bend ?? 0) * D2R;
    return RIG.THIGH * Math.sin(a) + RIG.SHIN * Math.sin(a - b);
  };
  return Math.abs(reach(front) - reach(back));
};

/* ------------------------------------------------------------------ gaits */

export interface GaitSpec {
  /** thigh forward angle of the leading leg at contact */
  readonly reach: number;
  /** thigh angle (negative) of the trailing leg at contact */
  readonly push: number;
  /** knee bend of the leading / trailing leg at contact */
  readonly frontBend: number;
  readonly backBend: number;
  /** swing-leg thigh and knee at the passing pose */
  readonly liftFwd: number;
  readonly liftBend: number;
  /** extra root lift at the passing pose (flight for runs and skips) */
  readonly hop: number;
  readonly armSwing: number;
  readonly armBend: number;
  readonly lean: number;
  readonly twist: number;
}

export const WALK_GAIT: GaitSpec = {
  reach: 26,
  push: -20,
  frontBend: 6,
  backBend: 14,
  liftFwd: 14,
  liftBend: 56,
  hop: 0.012,
  armSwing: 24,
  armBend: 22,
  lean: 3,
  twist: 5,
};

export const RUN_GAIT: GaitSpec = {
  reach: 40,
  push: -28,
  frontBend: 24,
  backBend: 30,
  liftFwd: 42,
  liftBend: 112,
  hop: 0.07,
  armSwing: 46,
  armBend: 88,
  lean: 12,
  twist: 8,
};

/** distance per loop (two steps) for a walking gait */
export const gaitStride = (g: GaitSpec, scale = 1): number => {
  const span = footSpan({ fwd: g.reach, bend: g.frontBend }, { fwd: g.push, bend: g.backBend });
  return Math.round(2 * span * scale * 100) / 100;
};

export interface GaitOverride {
  readonly armL?: LimbPose;
  readonly armR?: LimbPose;
  /** pose merged on top of every key (head, spine, grips) */
  readonly extra?: Pose;
  /** pose merged on the left-contact and right-contact keys only */
  readonly contactL?: Pose;
  readonly contactR?: Pose;
}

const contactKey = (g: GaitSpec, lead: 'L' | 'R'): Pose => {
  const front: LimbPose = { fwd: g.reach, bend: g.frontBend };
  const back: LimbPose = { fwd: g.push, bend: g.backBend };
  const armF: LimbPose = { fwd: g.armSwing, out: 6, bend: g.armBend };
  const armB: LimbPose = { fwd: -g.armSwing * 0.85, out: 6, bend: g.armBend * 0.5 };
  const sgn = lead === 'L' ? -1 : 1;
  return planted({
    spine: { twist: sgn * g.twist, lean: g.lean },
    legL: lead === 'L' ? front : back,
    legR: lead === 'L' ? back : front,
    armL: lead === 'L' ? armB : armF,
    armR: lead === 'L' ? armF : armB,
    footL: lead === 'L' ? -12 : 18,
    footR: lead === 'L' ? 18 : -12,
  });
};

const passKey = (g: GaitSpec, swing: 'L' | 'R'): Pose => {
  const stance: LimbPose = { fwd: 2, bend: Math.max(3, g.frontBend * 0.6) };
  const lift: LimbPose = { fwd: g.liftFwd, bend: g.liftBend };
  const arm: LimbPose = { fwd: 4, out: 6, bend: g.armBend * 0.8 };
  return planted(
    {
      spine: { lean: g.lean },
      legL: swing === 'L' ? lift : stance,
      legR: swing === 'R' ? lift : stance,
      armL: arm,
      armR: arm,
      footL: swing === 'L' ? 24 : 0,
      footR: swing === 'R' ? 24 : 0,
    },
    g.hop,
  );
};

const applyOver = (p: Pose, o: GaitOverride, extraKey?: Pose): Pose => {
  const arms: Pose = { armL: o.armL ?? p.armL, armR: o.armR ?? p.armR };
  const withArms = { ...p, ...arms };
  const withExtra = o.extra ? withPose(withArms, o.extra) : withArms;
  return extraKey ? withPose(withExtra, extraKey) : withExtra;
};

/** Four-key cyclic gait (contact L, pass R, contact R, pass L). */
export const gaitKeys = (g: GaitSpec, o: GaitOverride = {}): readonly ClipKey[] => [
  { t: 0, pose: applyOver(contactKey(g, 'L'), o, o.contactL) },
  { t: 0.25, pose: applyOver(passKey(g, 'R'), o) },
  { t: 0.5, pose: applyOver(contactKey(g, 'R'), o, o.contactR) },
  { t: 0.75, pose: applyOver(passKey(g, 'L'), o) },
];

/** Builds a gait spec from the walk with a few tweaks. */
export const walkWith = (over: Partial<GaitSpec>): GaitSpec => ({ ...WALK_GAIT, ...over });
export const runWith = (over: Partial<GaitSpec>): GaitSpec => ({ ...RUN_GAIT, ...over });

/* ------------------------------------------------------------------ crouches */

/** symmetric knee bend with the feet planted (thigh forward, knee bend, optional hip pitch) */
export const squat = (fwd: number, bend: number, pitch = 0, over: Pose = {}): Pose =>
  planted(
    withPose(
      {
        root: { pitch },
        legL: { fwd, out: 8, bend },
        legR: { fwd, out: 8, bend },
        footL: Math.max(-40, fwd - bend - pitch),
        footR: Math.max(-40, fwd - bend - pitch),
      },
      over,
    ),
  );

/** one knee on the ground, the other foot planted ahead (gardening, tying a lace) */
export const KNEEL: Pose = {
  root: { y: -0.43 },
  legL: { fwd: 92, out: 10, bend: 100 },
  legR: { fwd: -4, out: 6, bend: 100 },
  footL: -8,
  footR: -12,
  spine: { lean: 18 },
};

/**
 * Several gait cycles in one clip so a walker can look around or gesture over a longer loop. Each
 * entry of `cycles` is merged over the four keys of that cycle; stride must be multiplied by
 * `cycles.length`.
 */
export const gaitCycles = (g: GaitSpec, o: GaitOverride, cycles: readonly Pose[]): readonly ClipKey[] =>
  cycles.flatMap((extra, c) =>
    gaitKeys(g, o).map((k) => ({ t: (c + k.t) / cycles.length, pose: withPose(k.pose, extra) })),
  );
