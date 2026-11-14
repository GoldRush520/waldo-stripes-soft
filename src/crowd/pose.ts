/**
 * Pose authoring and baking.
 *
 * Clips are authored as sparse key poses using intuitive joint angles in DEGREES, then baked at a
 * fixed rate into rows of the shared pose texture. The vertex shader blends two adjacent rows, so a
 * clip costs nothing on the CPU at runtime.
 *
 * Angle semantics (all default 0 = relaxed standing pose, arms hanging, legs straight):
 *  root:  x/y/z offset in metres from the standing hip position (y < 0 lowers the body, e.g. -0.42
 *         to sit on a 0.45 m seat); yaw turns left(+); pitch leans the whole body forward(+);
 *         roll tips toward the character's left(+)
 *  spine: lean forward(+), side toward left(+), twist to the left(+)
 *  head:  nod down(+), turn left(+), tilt toward left shoulder(+)
 *  arm:   fwd raises the arm forward (90 = horizontal ahead, 180 = straight up; negative = back),
 *         out spreads it sideways away from the body (90 = T-pose), twist rotates about its length,
 *         bend flexes the elbow (0 straight .. 150)
 *  leg:   fwd swings the thigh forward (negative = back), out spreads it sideways, twist turns the
 *         knee outward(+), bend flexes the knee (0 straight .. 150)
 *  grip:  pitch/roll re-orient a held prop relative to the forearm (e.g. keep an umbrella upright)
 *  foot:  toe-down(+) ankle angle
 */
import { POSE_COLS, PoseCol } from './skeleton';

export interface LimbPose {
  readonly fwd?: number;
  readonly out?: number;
  readonly twist?: number;
  readonly bend?: number;
}

export interface Pose {
  readonly root?: {
    readonly x?: number;
    readonly y?: number;
    readonly z?: number;
    readonly yaw?: number;
    readonly pitch?: number;
    readonly roll?: number;
  };
  readonly spine?: { readonly lean?: number; readonly side?: number; readonly twist?: number };
  readonly head?: { readonly nod?: number; readonly turn?: number; readonly tilt?: number };
  readonly armL?: LimbPose;
  readonly armR?: LimbPose;
  readonly legL?: LimbPose;
  readonly legR?: LimbPose;
  readonly gripL?: { readonly pitch?: number; readonly roll?: number };
  readonly gripR?: { readonly pitch?: number; readonly roll?: number };
  readonly footL?: number;
  readonly footR?: number;
}

export interface ClipKey {
  /** normalised time 0..1 within the loop (keys must be ascending; the loop wraps to the first key) */
  readonly t: number;
  readonly pose: Pose;
}

export interface ClipDef {
  readonly id: string;
  /** seconds for one loop at speed 1 */
  readonly duration: number;
  /** pose merged underneath every key (e.g. a seated base) */
  readonly base?: Pose;
  readonly keys: readonly ClipKey[];
  /** 'smooth' eases in/out of each key (gestures); 'linear' is constant-rate (cyclic gaits) */
  readonly ease?: 'smooth' | 'linear';
  /** true for locomotion clips whose loop covers `stride` metres of travel */
  readonly stride?: number;
}

/** Row width in floats. */
export const POSE_ROW_FLOATS = POSE_COLS * 4;
const BAKE_FPS = 12;
const MAX_ROWS = 96;
const D2R = Math.PI / 180;

function limb(out: Float32Array, col: number, a: LimbPose | undefined, b: LimbPose | undefined): void {
  const o = col * 4;
  out[o] = ((a?.fwd ?? 0) + (b?.fwd ?? 0)) * D2R;
  out[o + 1] = ((a?.out ?? 0) + (b?.out ?? 0)) * D2R;
  out[o + 2] = ((a?.twist ?? 0) + (b?.twist ?? 0)) * D2R;
  out[o + 3] = ((a?.bend ?? 0) + (b?.bend ?? 0)) * D2R;
}

/** Flatten a pose (plus optional base pose, added channel-wise) into one texture row. */
export function poseToRow(pose: Pose, base?: Pose): Float32Array {
  const r = new Float32Array(POSE_ROW_FLOATS);
  const p = pose;
  const b = base;
  let o = PoseCol.RootPos * 4;
  r[o] = (p.root?.x ?? 0) + (b?.root?.x ?? 0);
  r[o + 1] = (p.root?.y ?? 0) + (b?.root?.y ?? 0);
  r[o + 2] = (p.root?.z ?? 0) + (b?.root?.z ?? 0);
  r[o + 3] = ((p.root?.yaw ?? 0) + (b?.root?.yaw ?? 0)) * D2R;
  o = PoseCol.RootRot * 4;
  r[o] = ((p.root?.pitch ?? 0) + (b?.root?.pitch ?? 0)) * D2R;
  r[o + 1] = ((p.root?.roll ?? 0) + (b?.root?.roll ?? 0)) * D2R;
  o = PoseCol.Spine * 4;
  r[o] = ((p.spine?.lean ?? 0) + (b?.spine?.lean ?? 0)) * D2R;
  r[o + 1] = ((p.spine?.side ?? 0) + (b?.spine?.side ?? 0)) * D2R;
  r[o + 2] = ((p.spine?.twist ?? 0) + (b?.spine?.twist ?? 0)) * D2R;
  o = PoseCol.Head * 4;
  r[o] = ((p.head?.nod ?? 0) + (b?.head?.nod ?? 0)) * D2R;
  r[o + 1] = ((p.head?.turn ?? 0) + (b?.head?.turn ?? 0)) * D2R;
  r[o + 2] = ((p.head?.tilt ?? 0) + (b?.head?.tilt ?? 0)) * D2R;
  limb(r, PoseCol.ArmL, p.armL, b?.armL);
  limb(r, PoseCol.ArmR, p.armR, b?.armR);
  limb(r, PoseCol.LegL, p.legL, b?.legL);
  limb(r, PoseCol.LegR, p.legR, b?.legR);
  o = PoseCol.Grip * 4;
  r[o] = ((p.gripL?.pitch ?? 0) + (b?.gripL?.pitch ?? 0)) * D2R;
  r[o + 1] = ((p.gripL?.roll ?? 0) + (b?.gripL?.roll ?? 0)) * D2R;
  r[o + 2] = ((p.gripR?.pitch ?? 0) + (b?.gripR?.pitch ?? 0)) * D2R;
  r[o + 3] = ((p.gripR?.roll ?? 0) + (b?.gripR?.roll ?? 0)) * D2R;
  o = PoseCol.Feet * 4;
  r[o] = ((p.footL ?? 0) + (b?.footL ?? 0)) * D2R;
  r[o + 1] = ((p.footR ?? 0) + (b?.footR ?? 0)) * D2R;
  return r;
}

export interface BakedClip {
  readonly id: string;
  readonly duration: number;
  readonly stride: number;
  /** number of baked rows */
  readonly rows: number;
  /** rows * POSE_ROW_FLOATS */
  readonly data: Float32Array;
}

const smooth = (t: number): number => t * t * (3 - 2 * t);

/** Bake a clip to evenly spaced rows. Deterministic and allocation-light (runs once at startup). */
export function bakeClip(def: ClipDef): BakedClip {
  if (def.keys.length === 0) throw new Error(`Clip ${def.id} has no keys`);
  const keyRows = def.keys.map((k) => poseToRow(k.pose, def.base));
  const times = def.keys.map((k) => k.t);
  const rows = def.keys.length === 1 ? 1 : Math.max(2, Math.min(MAX_ROWS, Math.round(def.duration * BAKE_FPS)));
  const data = new Float32Array(rows * POSE_ROW_FLOATS);
  const n = def.keys.length;
  for (let r = 0; r < rows; r++) {
    const u = r / rows;
    let i = n - 1;
    for (let k = 0; k < n; k++) {
      if ((times[k] as number) <= u) i = k;
    }
    if (u < (times[0] as number)) i = n - 1;
    const j = (i + 1) % n;
    const t0 = times[i] as number;
    let t1 = times[j] as number;
    let uu = u;
    if (j <= i) {
      t1 += 1;
      if (uu < t0) uu += 1;
    }
    const span = t1 - t0;
    let f = span > 1e-6 ? (uu - t0) / span : 0;
    f = Math.max(0, Math.min(1, f));
    if (def.ease !== 'linear') f = smooth(f);
    const a = keyRows[i] as Float32Array;
    const b = keyRows[j] as Float32Array;
    const o = r * POSE_ROW_FLOATS;
    for (let c = 0; c < POSE_ROW_FLOATS; c++) data[o + c] = (a[c] as number) + ((b[c] as number) - (a[c] as number)) * f;
  }
  return { id: def.id, duration: def.duration, stride: def.stride ?? 0, rows, data };
}

/** Convenience: a held (static) pose as a one-key clip. */
export function still(id: string, pose: Pose): ClipDef {
  return { id, duration: 1, keys: [{ t: 0, pose }] };
}

/** Convenience: add small per-channel deltas on top of a pose (returns a new pose). */
export function withPose(base: Pose, over: Pose): Pose {
  return {
    root: { ...base.root, ...over.root },
    spine: { ...base.spine, ...over.spine },
    head: { ...base.head, ...over.head },
    armL: { ...base.armL, ...over.armL },
    armR: { ...base.armR, ...over.armR },
    legL: { ...base.legL, ...over.legL },
    legR: { ...base.legR, ...over.legR },
    gripL: { ...base.gripL, ...over.gripL },
    gripR: { ...base.gripR, ...over.gripR },
    footL: over.footL ?? base.footL,
    footR: over.footR ?? base.footR,
  };
}
