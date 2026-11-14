/** Shared tree parts: clustered canopy blobs, trunks and terracotta pots. */
import { type Col, type Geo, disc, lathe, merge, sphere, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Q, type Size, type V3, chain, ell, leafSway } from './kit';

export interface Leaf {
  readonly p: V3;
  readonly r: V3;
  readonly size: Size;
  readonly col?: Col;
  /** false keeps the blob its authored colour (inner shade blobs) */
  readonly tint?: boolean;
}

/** Clustered canopy: tint-masked blobs with sway rising from y0 to y1. */
export function canopy(q: Q, leaves: readonly Leaf[], y0: number, y1: number, lo = 0.15, hi = 0.4): Geo {
  const parts = leaves.map((l) => {
    const g = ell(q, l.size, l.p[0], l.p[1], l.p[2], l.r[0], l.r[1], l.r[2], l.col ?? 'sage');
    return l.tint === false ? g : tintable(g);
  });
  return leafSway(merge(parts), y0, y1, lo, hi);
}

/** Trunk along a polyline in timber. */
export function trunk(q: Q, path: readonly V3[], r0: number, r1: number, color: Col = 'timber'): Geo[] {
  const pts = q.hi || path.length <= 2 ? path : [path[0] as V3, path[path.length - 1] as V3];
  return chain(pts, r0, r1, color, q.s(6, 3));
}

/** n jitter values in [-1, 1], drawn up front so both quality passes match. */
export function jitter(rng: Rng, n: number): number[] {
  return Array.from({ length: n }, () => rng.range(-1, 1));
}

/** j[i] with a zero fallback. */
export function jv(j: readonly number[], i: number): number {
  return j[i] ?? 0;
}

/** Terracotta pot (lathe) with a soil disc; radius r at the rim, height h. */
export function pot(q: Q, r: number, h: number, color: Col = 'clayDeep'): Geo {
  const prof: ReadonlyArray<readonly [number, number]> = q.hi
    ? [
        [r * 0.68, 0],
        [r * 0.94, h * 0.78],
        [r * 1.06, h * 0.8],
        [r * 1.06, h],
      ]
    : [
        [r * 0.68, 0],
        [r * 1.05, h],
      ];
  const soil = translate(disc(r * 1.0, 'cocoa', q.s(8, 4)), 0, h * 0.96, 0);
  return merge(lathe(prof, color, q.s(8, 5)), soil);
}

/** Small round fruit (HI only), tiny sphere. */
export function fruit(p: V3, r: number, color: Col): Geo {
  return translate(sphere(r, color, 4, 2), p[0], p[1], p[2]);
}
