/** Parametric clipped hedges: rounded runs, maze walls, low box borders and flower borders. */
import { type Geo, box, merge, rotateY, shadeY, sphere, sway, tintable, translate } from '../../core/geo';
import { type Rng, createRng } from '../../core/rng';
import { type Q, type V3, ell, ground, limb, tiered } from './kit';

export type HedgeTop = 'round' | 'flat';
export type P2 = readonly [number, number];

interface Seg {
  readonly a: P2;
  readonly b: P2;
  readonly len: number;
  readonly yaw: number;
  readonly mid: P2;
}

function segments(points: readonly P2[]): Seg[] {
  const out: Seg[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) continue;
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    if (len < 1e-3) continue;
    out.push({ a, b, len, yaw: Math.atan2(-dz, dx), mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] });
  }
  return out;
}

/** One box-section of hedge along a segment, centred on the segment, shaded at its foot. */
function slab(s: Seg, y: number, h: number, w: number, extra = 0): Geo {
  return translate(rotateY(shadeY(box(s.len + extra, h, w, 'sage'), 0.82, 1), s.yaw), s.mid[0], y, s.mid[1]);
}

function roundSeg(q: Q, s: Seg, h: number, w: number): Geo[] {
  const r = w / 2;
  if (!q.hi) return [slab(s, 0, h, w)];
  const top = limb([s.a[0], h - r, s.a[1]], [s.b[0], h - r, s.b[1]], r, r, 'sage', 8);
  return [slab(s, 0, h - r, w), top];
}

function flatSeg(q: Q, s: Seg, h: number, w: number): Geo[] {
  if (!q.hi) return [slab(s, 0, h, w)];
  const e = Math.min(0.1, w * 0.2);
  const ox = Math.sin(s.yaw) * (w / 2 - e);
  const oz = Math.cos(s.yaw) * (w / 2 - e);
  const edges = [1, -1].map((k) =>
    limb([s.a[0] + k * ox, h - e, s.a[1] + k * oz], [s.b[0] + k * ox, h - e, s.b[1] + k * oz], e, e, 'sageLight', 6),
  );
  return [slab(s, 0, h - e, w), slab(s, h - e, e, w - 2 * e), ...edges];
}

/** Rounded caps at every joint / end of a round-topped run (HI only). */
function joints(q: Q, points: readonly P2[], h: number, w: number): Geo[] {
  if (!q.hi) return [];
  return points.map((p) => translate(sphere(w / 2, 'sage', 6, 4), p[0], h - w / 2, p[1]));
}

function runGeo(q: Q, points: readonly P2[], h: number, w: number, top: HedgeTop): Geo {
  const segs = segments(points);
  const body = segs.flatMap((s) => (top === 'round' ? roundSeg(q, s, h, w) : flatSeg(q, s, h, w)));
  const caps = top === 'round' ? joints(q, points, h, w) : [];
  return sway(tintable(merge(body, caps)), (_x, y) => Math.min(0.12, 0.12 * (y / h)));
}

/** Clipped hedge following a ground polyline ([x, z] points), height h, width w. Tint-masked (sage). */
export function hedgeRun(points: readonly P2[], h = 1.1, w = 0.6, top: HedgeTop = 'round'): Geo {
  return ground(tiered((q) => runGeo(q, points, h, w, top)));
}

/** Straight hedge of a given length centred on the origin along x. */
export function hedge(len: number, h = 1.1, w = 0.6, top: HedgeTop = 'round'): Geo {
  return hedgeRun(
    [
      [-len / 2, 0],
      [len / 2, 0],
    ],
    h,
    w,
    top,
  );
}

/** L-shaped hedge corner (arm lengths a along x, b along z), centred on its bounds. */
export function hedgeCorner(a = 2, b = 2, h = 1.1, w = 0.6): Geo {
  return hedgeRun(
    [
      [-a / 2, -b / 2],
      [a / 2, -b / 2],
      [a / 2, b / 2],
    ],
    h,
    w,
  );
}

/** Tall flat-topped maze wall. */
export function mazeWall(len: number, h = 2.2, w = 0.7): Geo {
  return hedge(len, h, w, 'flat');
}

/** Low clipped box edging. */
export function boxBorder(len: number): Geo {
  return hedge(len, 0.36, 0.3, 'round');
}

function borderGeo(q: Q, len: number, depth: number, rng: Rng): Geo {
  const n = Math.max(2, Math.round(len / 1.1));
  const soil = box(len, 0.12, depth, 'cocoa');
  const leaves = q.hi
    ? Array.from({ length: n }, (_, i) => ell(q, 'small', (i / (n - 1) - 0.5) * (len - depth * 0.8), 0.22, 0, len / n * 0.62, 0.22, depth * 0.45, i % 2 ? 'sage' : 'sageDeep'))
    : [ell(q, 'nub', 0, 0.22, 0, len * 0.48, 0.2, depth * 0.45, 'sage')];
  const blooms = q.hi
    ? Array.from({ length: Math.round(len * 5) }, () => {
        const p: V3 = [rng.range(-0.46, 0.46) * len, rng.range(0.33, 0.48), rng.range(-0.32, 0.32) * depth];
        return tintable(translate(sphere(0.06, 'coral', 4, 2), p[0], p[1], p[2]));
      })
    : [tintable(ell(q, 'nub', 0, 0.36, 0, len * 0.44, 0.1, depth * 0.36, 'coral'))];
  return merge(soil, sway(merge(leaves, blooms), (_x, y) => Math.min(0.3, y * 0.6)));
}

/** Flower border strip (length along x, depth along z): blooms are tint-masked (default coral). */
export function flowerBorder(len = 3, depth = 0.6, seed = 1): Geo {
  return ground(tiered((q) => borderGeo(q, len, depth, createRng(seed))));
}
