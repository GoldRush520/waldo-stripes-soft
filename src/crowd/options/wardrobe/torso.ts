/**
 * Torso-space helpers: the body's lathe profile (see body.ts) so garments can hug it, plus a
 * neckline curve that cords, straps and garlands follow over the shoulders.
 */
import { type Col, type Geo, box, lathe, rotateX, scale, translate } from '../../../core/geo';
import { type Q, type V3 } from './kit';

/** Torso half-width (lathe radius) at height y above the waist, matching body.ts. */
const PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.15],
  [0.12, 0.163],
  [0.3, 0.184],
  [0.39, 0.19],
  [0.452, 0.13],
  [0.478, 0.06],
];
/** Body lathe depth scale. */
export const TORSO_Z = 0.66;

export function torsoR(y: number): number {
  if (y <= 0) return 0.165;
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const a = PROFILE[i];
    const b = PROFILE[i + 1];
    if (a && b && y <= b[0]) return a[1] + ((b[1] - a[1]) * (y - a[0])) / (b[0] - a[0]);
  }
  return 0.06;
}

/** Front (+z) surface depth of the torso at (x, y); 0 when x lies outside the body. */
export function frontZ(x: number, y: number): number {
  const r = torsoR(y);
  return Math.abs(x) >= r ? 0 : TORSO_Z * Math.sqrt(r * r - x * x);
}

/**
 * A garment shell hugging the torso from y0 to y1, inflated by `d`. Near: up to 5 rings x 10
 * segments (≤ 80 triangles); far: 3 rings x 6 segments (24 triangles).
 */
export function shell(q: Q, y0: number, y1: number, d: number, col: Col, zs = 0.72): Geo {
  const breaks = [0.12, 0.3, 0.39].filter((y) => y > y0 + 0.02 && y < y1 - 0.02);
  const ys = q === 'near' ? [y0, ...breaks, y1] : [y0, Math.max(y0 + 0.05, Math.min(0.36, y1 - 0.05)), y1];
  const pts = ys.map((y) => [torsoR(y) + d, y] as const);
  return scale(lathe(pts, col, q === 'near' ? 10 : 6), 1, 1, zs);
}

/**
 * Point on the neckline loop: t = 0 at the chest front, ±π/2 over the shoulders, π behind the
 * neck. `drop` lowers the front of the loop.
 */
export function neckPoint(t: number, drop = 0.075): V3 {
  const c = Math.cos(t);
  return [0.1 * Math.sin(t), 0.475 - drop * Math.pow(Math.max(0, c), 1.5), 0.035 + 0.095 * c];
}

/** Cord path from behind the neck over each shoulder down to an item hanging at `item`. */
export function cordSides(item: V3): readonly (readonly V3[])[] {
  return [-1, 1].map((sx) => [
    neckPoint(Math.PI),
    neckPoint((sx * Math.PI) / 2),
    neckPoint((sx * Math.PI) / 4, 0.04),
    [item[0] + sx * 0.012, item[1], item[2]] as V3,
  ]);
}

/** Loop of `n` points around the neck (for beads, garlands, scarves). */
export function neckLoop(n: number, drop = 0.075): readonly V3[] {
  return Array.from({ length: n }, (_, i) => neckPoint((i / n) * Math.PI * 2, drop));
}

/** A flat strip (width along x, thickness along z) running from `a` to `b` in a y-z plane. */
export function slab(a: V3, b: V3, w: number, t: number, col: Col): Geo {
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const len = Math.hypot(dy, dz);
  return translate(rotateX(box(w, len, t, col), Math.atan2(dz, dy)), a[0], a[1], a[2]);
}

/** Point on the front of a shell inflated by `d` (see `shell`), pushed out by `out`. */
export function shellFront(x: number, y: number, d: number, out = 0, zs = 0.72): V3 {
  const r = torsoR(y) + d;
  return [x, y, zs * Math.sqrt(Math.max(0, r * r - x * x)) + out];
}
