/**
 * Shared pose fragments and pure builders for the active clip library (performance, sport, craft,
 * rides). Angle semantics follow pose.ts. Every export is immutable data or a pure function that
 * returns new objects.
 */
import type { ClipKey, LimbPose, Pose } from '../../pose';
import { withPose } from '../../pose';
import { RIG } from '../../skeleton';

export { SIT_BASE } from '../base';

const D2R = Math.PI / 180;
const LEG = RIG.THIGH + RIG.SHIN;

/** A key at normalised time t. */
export const key = (t: number, pose: Pose): ClipKey => ({ t, pose });

/** Field-wise merge, later poses override earlier ones (not additive). */
export const merge = (...poses: readonly Pose[]): Pose =>
  poses.reduce<Pose>((acc, p) => withPose(acc, p), {});

/** Relaxed hanging arm, matching the base library. */
export const ARM_REST: LimbPose = { fwd: 2, out: 7, bend: 12 };
export const RELAX: Pose = { armL: ARM_REST, armR: ARM_REST };

/** Hands resting on the hips, elbows out. */
export const HANDS_ON_HIPS: LimbPose = { fwd: -8, out: 45, twist: -90, bend: 90 };

/** Hands meeting in front of the chest (instrument, ball, tool held in both hands). */
export const HANDS_CHEST: LimbPose = { fwd: 40, out: 10, twist: -35, bend: 95 };

/** Arms spread for balance. */
export const ARMS_BALANCE: LimbPose = { fwd: 4, out: 82, twist: 10, bend: 14 };

/** Sitting on the ground with legs out in front. */
export const GROUND_SIT: Pose = {
  root: { y: -0.78 },
  legL: { fwd: 90, out: 8, bend: 10 },
  legR: { fwd: 90, out: 8, bend: 10 },
  footL: -10,
  footR: -10,
  spine: { lean: 6 },
};

/** Kneeling on the right knee, left foot planted in front. */
export const KNEEL_ONE: Pose = {
  root: { y: -0.41 },
  legL: { fwd: 86, out: 8, bend: 90 },
  legR: { fwd: -6, out: 4, bend: 98 },
  footL: -4,
  footR: -22,
};

/** Kneeling on both knees, thighs upright. */
export const KNEEL_BOTH: Pose = {
  root: { y: -0.41 },
  legL: { fwd: 2, out: 7, bend: 94 },
  legR: { fwd: 2, out: 7, bend: 94 },
  footL: 50,
  footR: 50,
};

/** Root drop (m) that keeps the ankle on the ground for a thigh swing / knee bend. */
export function legDrop(fwd: number, bend: number): number {
  const reach = RIG.THIGH * Math.cos(fwd * D2R) + RIG.SHIN * Math.cos((fwd - bend) * D2R);
  return Math.round((reach - LEG) * 1000) / 1000;
}

/** Symmetric crouch with both feet flat on the ground. */
export function squat(fwd: number, bend: number, out = 6): Pose {
  const leg: LimbPose = { fwd, out, bend };
  return { root: { y: legDrop(fwd, bend) }, legL: leg, legR: leg, footL: fwd - bend, footR: fwd - bend };
}

/** Grip pitch that keeps a held prop in its authored (hanging-arm) orientation, plus a tilt. */
export const level = (arm: LimbPose, tilt = 0): { pitch: number } => ({
  pitch: (arm.fwd ?? 0) + (arm.bend ?? 0) + tilt,
});

const neg = (v: number | undefined): number | undefined => (v === undefined ? undefined : -v);

/** Left/right mirror of a pose (swaps limbs, negates lateral channels). */
export function mirror(p: Pose): Pose {
  return {
    root: p.root && { ...p.root, x: neg(p.root.x), yaw: neg(p.root.yaw), roll: neg(p.root.roll) },
    spine: p.spine && { ...p.spine, side: neg(p.spine.side), twist: neg(p.spine.twist) },
    head: p.head && { ...p.head, turn: neg(p.head.turn), tilt: neg(p.head.tilt) },
    armL: p.armR,
    armR: p.armL,
    legL: p.legR,
    legR: p.legL,
    gripL: p.gripR,
    gripR: p.gripL,
    footL: p.footR,
    footR: p.footL,
  };
}

/** Four-key cyclic gait description (left contact, right passing, right contact, left passing). */
export interface GaitSpec {
  readonly front: LimbPose;
  readonly back: LimbPose;
  readonly lift: LimbPose;
  readonly stance: LimbPose;
  readonly footFront: number;
  readonly footBack: number;
  readonly footLift: number;
  readonly lowY: number;
  readonly highY: number;
  readonly lean: number;
  readonly twist: number;
  /** extra pose per phase 0..3 (arms, head) merged over the legs */
  readonly upper?: (phase: number) => Pose;
}

export function gaitKeys(s: GaitSpec): readonly ClipKey[] {
  const contactL: Pose = {
    root: { y: s.lowY },
    spine: { lean: s.lean, twist: -s.twist },
    legL: s.front,
    legR: s.back,
    footL: s.footFront,
    footR: s.footBack,
  };
  const passR: Pose = {
    root: { y: s.highY },
    spine: { lean: s.lean },
    legL: s.stance,
    legR: s.lift,
    footL: 0,
    footR: s.footLift,
  };
  const legs = [contactL, passR, mirror(contactL), mirror(passR)];
  return legs.map((p, i) => key(i * 0.25, s.upper ? merge(p, s.upper(i)) : p));
}

/** Counter-swinging arms for a gait: phase 0 has the left leg (so the right arm) in front. */
export function armSwing(front: LimbPose, back: LimbPose, mid: LimbPose): (phase: number) => Pose {
  return (phase) => {
    if (phase === 0) return { armL: back, armR: front };
    if (phase === 2) return { armL: front, armR: back };
    return { armL: mid, armR: mid };
  };
}

/** Same upper-body pose on every gait phase. */
export const fixedUpper = (pose: Pose): ((phase: number) => Pose) => () => pose;

/** Seated on a 0.45 m seat: SIT_BASE legs and root without its arms (keys supply the arms). */
export const SEAT: Pose = {
  root: { y: -0.43 },
  legL: { fwd: 86, out: 6, bend: 88 },
  legR: { fwd: 86, out: 6, bend: 88 },
  spine: { lean: 3 },
  footL: -2,
  footR: -2,
};

/** Channel-wise sum of two limb poses (adds a delta to a named limb pose). */
export const add = (a: LimbPose, d: LimbPose): LimbPose => ({
  fwd: (a.fwd ?? 0) + (d.fwd ?? 0),
  out: (a.out ?? 0) + (d.out ?? 0),
  twist: (a.twist ?? 0) + (d.twist ?? 0),
  bend: (a.bend ?? 0) + (d.bend ?? 0),
});
