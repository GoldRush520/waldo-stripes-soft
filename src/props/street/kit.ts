/**
 * Shared helpers for the street library: prop definition shorthand with budget tags, raw triangle
 * meshes (built through the kit's `fromThree`), placement of template copies, sag curves.
 */
import * as THREE from 'three';
import { type Col, type Geo, bounds, cyl, disc, fromThree, merge, translate } from '../../core/geo';
import type { PropDef } from '../registry';

export type V3 = readonly [number, number, number];

export interface Seat {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
}

/** A standing spot on the ground (people placement): heading 0 faces +z. */
export interface GroundSpot {
  readonly x: number;
  readonly z: number;
  readonly heading: number;
}

export type Budget = 'small' | 'furniture' | 'stall' | 'house' | 'landmark';

/** Contract triangle budgets (full tier / far tier). */
export const BUDGETS: Readonly<Record<Budget, { readonly full: number; readonly far: number }>> = {
  small: { full: 150, far: 40 },
  furniture: { full: 300, far: 80 },
  stall: { full: 1200, far: 350 },
  house: { full: 3000, far: 700 },
  landmark: { full: 4000, far: 1200 },
};

export interface PropOpts {
  readonly tint?: Col;
  readonly material?: 'solid' | 'glass' | 'water';
  readonly tags?: readonly string[];
  readonly seats?: readonly Seat[];
}

/** PropDef shorthand; the budget class is recorded as a `budget:<class>` tag. */
export function prop(
  key: string,
  footprint: readonly [number, number],
  budget: Budget,
  build: () => Geo,
  opts: PropOpts = {},
): PropDef {
  return {
    key,
    build,
    footprint,
    tags: [`budget:${budget}`, ...(opts.tags ?? [])],
    ...(opts.tint !== undefined ? { defaultTint: opts.tint } : {}),
    ...(opts.material !== undefined ? { material: opts.material } : {}),
    ...(opts.seats !== undefined ? { seats: opts.seats } : {}),
  };
}

const memoStore = new Map<string, Geo>();

/** Build a shared immutable template once (Geos are never mutated, so sharing is safe). */
export function memo(key: string, make: () => Geo): Geo {
  const hit = memoStore.get(key);
  if (hit) return hit;
  const g = make();
  memoStore.set(key, g);
  return g;
}

/** Flat-shaded triangle soup: every 3 points form one triangle (counter-clockwise seen from outside). */
export function tris(points: readonly V3[], color: Col): Geo {
  const flat = new Float32Array(points.length * 3);
  points.forEach((p, i) => {
    flat[i * 3] = p[0];
    flat[i * 3 + 1] = p[1];
    flat[i * 3 + 2] = p[2];
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(flat, 3));
  return fromThree(g, color, true);
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Order a triangle so its face normal points toward `toward`. */
export function orient(a: V3, b: V3, c: V3, toward: V3): V3[] {
  return dot(cross(sub(b, a), sub(c, a)), toward) >= 0 ? [a, b, c] : [a, c, b];
}

export interface Spot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly ry?: number;
  readonly s?: number;
}

export function lerp3(a: V3, b: V3, t: number): V3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Parabolic sag between two points (good catenary stand-in): n+1 points, a first, b last. */
export function sagCurve(a: V3, b: V3, sag: number, n: number): V3[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const p = lerp3(a, b, t);
    return [p[0], p[1] - sag * 4 * t * (1 - t), p[2]] as V3;
  });
}

/** Y rotation that maps local +x onto the horizontal direction a -> b. */
export function yawAlong(a: V3, b: V3): number {
  return Math.atan2(-(b[2] - a[2]), b[0] - a[0]);
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Odd band count (both edges tinted) for stripes of roughly `band` metres across `width`. */
export function oddBands(width: number, band: number, min = 5): number {
  const n = Math.max(min, Math.round(width / band));
  return n % 2 === 1 ? n : n + 1;
}

/** Drop a Geo so its lowest point rests on y = 0. */
export function restOnGround(g: Geo): Geo {
  return translate(g, 0, -bounds(g).min[1], 0);
}

/** Cylinder with a top cap only (3 x seg triangles): for seats, table tops and lids seen from above. */
export function topCyl(rBottom: number, rTop: number, h: number, color: Col, seg = 8): Geo {
  return merge(cyl(rBottom, rTop, h, color, seg, false), translate(disc(rTop, color, seg), 0, h, 0));
}
