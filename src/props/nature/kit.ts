/**
 * Shared helpers for the nature library (plants, garden pieces, animals, airborne things).
 *
 * Every nature prop is authored once as `build(q)` and rendered twice by `tiered`:
 * the HI pass (smooth segment counts + small features) is tagged near-only via `detail()`,
 * the LO pass (coarse segment counts, silhouette only) is tagged far-only via `farOnly()`.
 * Builders keep LO ≤ 35 % of HI so the far tier stays cheap.
 */
import * as THREE from 'three';
import {
  type Col,
  type Geo,
  blob,
  bounds,
  cyl,
  detail,
  farOnly,
  merge,
  sway,
  tintable,
  translate,
  xform,
} from '../../core/geo';

/** Quality pass handed to every builder. */
export interface Q {
  readonly hi: boolean;
  /** pick a value for the HI or LO pass */
  s(hi: number, lo: number): number;
}

export const HI: Q = { hi: true, s: (h) => h };
export const LO: Q = { hi: false, s: (_h, l) => l };

/** Build a prop in both quality passes and tag them near-only / far-only. */
export function tiered(build: (q: Q) => Geo): Geo {
  return merge(detail(build(HI)), farOnly(build(LO)));
}

/** Only in the HI pass (small features that vanish at distance). */
export function hiOnly(q: Q, make: () => Geo | readonly Geo[]): Geo[] {
  if (!q.hi) return [];
  const g = make();
  return Array.isArray(g) ? [...(g as readonly Geo[])] : [g as Geo];
}

/** Segment presets [wSeg, hSeg] for ellipsoids per size class. */
export type Size = 'big' | 'mid' | 'body' | 'small' | 'tiny' | 'nub';
const SEG: Record<Size, readonly [number, number, number, number]> = {
  big: [8, 6, 5, 3],
  mid: [7, 5, 4, 3],
  body: [7, 4, 4, 3],
  small: [6, 4, 4, 2],
  tiny: [5, 3, 3, 2],
  nub: [4, 3, 3, 2],
};

/** Ellipsoid centred at (x, y, z) with quality-dependent segments. */
export function ell(
  q: Q,
  size: Size,
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number,
  color: Col,
): Geo {
  const s = SEG[size];
  return translate(blob(rx, ry, rz, color, q.s(s[0], s[2]), q.s(s[1], s[3])), x, y, z);
}

/** Ellipsoid rotated by [pitch, yaw, roll] (see `orient`) about its own centre, then moved to p. */
export function ellR(
  q: Q,
  size: Size,
  p: readonly [number, number, number],
  r: readonly [number, number, number],
  rot: readonly [number, number, number],
  color: Col,
): Geo {
  const s = SEG[size];
  return orient(blob(r[0], r[1], r[2], color, q.s(s[0], s[2]), q.s(s[1], s[3])), rot, p);
}

/** Rotate (roll z, then pitch x — positive tips +z downward — then yaw y) and translate. */
export function orient(
  g: Geo,
  rot: readonly [number, number, number],
  p: readonly [number, number, number] = [0, 0, 0],
): Geo {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(p[0], p[1], p[2]),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], 'YXZ')),
    new THREE.Vector3(1, 1, 1),
  );
  return xform(g, m);
}

export type V3 = readonly [number, number, number];

/** Open-ended tapered cylinder from a to b (limbs, trunks, stems, stalks). */
export function limb(a: V3, b: V3, r0: number, r1: number, color: Col, seg = 5): Geo {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const len = Math.max(1e-4, va.distanceTo(vb));
  const dir = vb.clone().sub(va).normalize();
  const m = new THREE.Matrix4().compose(
    va,
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir),
    new THREE.Vector3(1, 1, 1),
  );
  return xform(cyl(r0, r1, len, color, seg, false), m);
}

/** Chain of limbs through a polyline, radius tapering from r0 to r1. */
export function chain(path: readonly V3[], r0: number, r1: number, color: Col, seg = 5): Geo[] {
  const out: Geo[] = [];
  const n = path.length - 1;
  for (let i = 0; i < n; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (!a || !b) continue;
    const ra = r0 + ((r1 - r0) * i) / n;
    const rb = r0 + ((r1 - r0) * (i + 1)) / n;
    out.push(limb(a, b, ra, rb, color, seg));
  }
  return out;
}

/** Translate so the lowest vertex sits exactly on y = 0. */
export function ground(g: Geo): Geo {
  const b = bounds(g);
  return Math.abs(b.min[1]) < 1e-6 ? g : translate(g, 0, -b.min[1], 0);
}

/** Foliage sway rising from `lo` at y0 to `hi` at y1, plus a little outward boost. */
export function leafSway(g: Geo, y0: number, y1: number, lo = 0.15, hi = 0.4): Geo {
  const span = Math.max(1e-3, y1 - y0);
  return sway(g, (x, y, z) => {
    const t = Math.min(1, Math.max(0, (y - y0) / span));
    const out = Math.min(1, Math.hypot(x, z) / span);
    return Math.min(hi, lo + (hi - lo) * (0.7 * t + 0.3 * out));
  });
}

/** Sway growing linearly with distance from an anchor point (cloth, tails, scarves). */
export function swayFrom(g: Geo, anchor: V3, reach: number, max = 1): Geo {
  return sway(g, (x, y, z) =>
    Math.min(max, Math.hypot(x - anchor[0], y - anchor[1], z - anchor[2]) / Math.max(1e-3, reach)),
  );
}

/** Tint-mask a list of parts. */
export function tinted(parts: readonly Geo[], mask = 1): Geo[] {
  return parts.map((p) => tintable(p, mask));
}

/** Mirror helper: returns [f(1), f(-1)] for left/right symmetric parts. */
export function pair(f: (side: 1 | -1) => Geo): Geo[] {
  return [f(1), f(-1)];
}

/** Deterministic lumpiness: push vertices away from `c` by up to ±amt (relative), keyed on position. */
export function lumpy(g: Geo, c: V3, amt: number, seed = 1): Geo {
  const pos = new Float32Array(g.pos.length);
  for (let i = 0; i < pos.length; i += 3) {
    const x = g.pos[i] ?? 0;
    const y = g.pos[i + 1] ?? 0;
    const z = g.pos[i + 2] ?? 0;
    const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 4.1) * 43758.5453;
    const k = 1 + amt * ((h - Math.floor(h)) * 2 - 1);
    pos[i] = c[0] + (x - c[0]) * k;
    pos[i + 1] = c[1] + (y - c[1]) * k;
    pos[i + 2] = c[2] + (z - c[2]) * k;
  }
  return { ...g, pos };
}
