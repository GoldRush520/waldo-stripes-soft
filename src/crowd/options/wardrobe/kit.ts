/**
 * Shared authoring kit for the extra wardrobe and held-prop options.
 *
 * Every option is written once as a `Build` — a function of the view tier. The near build may use
 * up to 140 triangles; the far build (≤ 45 triangles) repeats only the silhouette with coarser
 * segment counts. `option()` tags the near build `detail` and the far build `farOnly`, so the rig
 * builder's `selectLod` picks exactly one of them per tier. Near-only options skip the far build.
 */
import {
  type Geo,
  beam,
  detail,
  farOnly,
  lathe,
  merge,
  scale,
  tintable,
  translate,
  vertexCount,
} from '../../../core/geo';
import type { Col } from '../../../core/geo';
import { type CatId, type PartId, RIG, type SlotId } from '../../skeleton';
import { type RigOption, piece } from '../../rig';

export type Q = 'near' | 'far';
export type Build = (q: Q) => Geo;
export type V3 = readonly [number, number, number];

export const HY = RIG.HEAD_CENTER_Y;
export const HR = RIG.HEAD_R;

/** Segment count by tier. */
export const s = (q: Q, near: number, far: number): number => (q === 'near' ? near : far);

/** Parts that exist only in the near build. */
export const fine = (q: Q, ...parts: readonly Geo[]): readonly Geo[] => (q === 'near' ? parts : []);

export const T = tintable;
export const at = translate;

/** Mirror across the body's sagittal plane (right-hand prop -> left-hand prop). */
export const mirrorX = (g: Geo): Geo => scale(g, -1, 1, 1);

/** Lathe with a per-tier segment count and an optional coarser far profile. */
export function lathe2(
  q: Q,
  pts: ReadonlyArray<readonly [number, number]>,
  col: Col,
  nearSeg: number,
  farSeg: number,
  farPts?: ReadonlyArray<readonly [number, number]>,
): Geo {
  return q === 'near' ? lathe(pts, col, nearSeg) : lathe(farPts ?? pts, col, farSeg);
}

/** A polyline of square beams (straps, cords, wire handles). */
export function path(points: readonly V3[], thickness: number, col: Col): Geo {
  const segs: Geo[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (a && b) segs.push(beam(a, b, thickness, col));
  }
  return merge(segs);
}

/** Mark the vertices that satisfy `pred` as tintable (soft stripes, panels). */
export function tintWhere(g: Geo, pred: (x: number, y: number, z: number) => boolean): Geo {
  const fx = new Float32Array(g.fx);
  const n = vertexCount(g);
  for (let i = 0; i < n; i++) {
    if (pred(g.pos[i * 3] as number, g.pos[i * 3 + 1] as number, g.pos[i * 3 + 2] as number)) fx[i * 2] = 1;
  }
  return { ...g, fx };
}

/* ------------------------------------------------------------------ option assembly */

export interface Spec {
  readonly part: PartId;
  readonly slot: SlotId;
  readonly build: Build;
}

export interface Meta {
  readonly nearOnly?: boolean;
  readonly reach?: number;
}

export const spec = (part: PartId, slot: SlotId, build: Build): Spec => ({ part, slot, build });

function tiered(build: Build, nearOnly: boolean): Geo {
  if (nearOnly) return build('near');
  return merge(detail(build('near')), farOnly(build('far')));
}

export function option(key: string, cat: CatId, specs: readonly Spec[], meta: Meta = {}): RigOption {
  const pieces = specs.map((sp) => piece(tiered(sp.build, meta.nearOnly === true), sp.part, sp.slot));
  return { key, cat, pieces, ...meta };
}

export function single(key: string, cat: CatId, part: PartId, slot: SlotId, build: Build, meta: Meta = {}): RigOption {
  return option(key, cat, [spec(part, slot, build)], meta);
}
