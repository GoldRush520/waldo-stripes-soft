/**
 * Shared helpers for the leisure library (funfair, sports/playground, beach).
 * Everything returns new immutable Geos built from the core geometry kit.
 */
import * as THREE from 'three';
import {
  type Col,
  type Geo,
  beam,
  box,
  cyl,
  detail,
  farOnly,
  fromThree,
  merge,
  profile,
  rbox,
  rotateX,
  rotateZ,
  sphere,
  sway,
  tintable,
  translate,
} from '../../core/geo';
import type { PropDef } from '../registry';

export type V3 = readonly [number, number, number];
export type Size = 'clutter' | 'furniture' | 'stall' | 'ride' | 'house' | 'landmark';
export type Origin = 'ground' | 'pivot' | 'waterline' | 'sunk' | 'decal';

/** [full, far] triangle budgets per size class (contract §Performance). */
export const BUDGET: Readonly<Record<Size, readonly [number, number]>> = {
  clutter: [150, 40],
  furniture: [300, 80],
  stall: [1200, 350],
  ride: [2500, 800],
  house: [3000, 700],
  landmark: [4000, 1200],
};

export interface Seat {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
}

export interface PropOpts {
  readonly tint?: Col;
  readonly tags?: readonly string[];
  readonly seats?: readonly Seat[];
  readonly seatKind?: 'hip' | 'feet';
  readonly origin?: Origin;
  readonly material?: 'solid' | 'glass' | 'water';
}

/** Build a PropDef with standard leisure tags: `size:*`, `origin:*`, `seat:*`. */
export function prop(
  key: string,
  build: () => Geo,
  footprint: readonly [number, number],
  size: Size,
  opts: PropOpts = {},
): PropDef {
  const seatTag = opts.seats && opts.seats.length > 0 ? [`seat:${opts.seatKind ?? 'hip'}`] : [];
  const tags = ['leisure', `size:${size}`, `origin:${opts.origin ?? 'ground'}`, ...seatTag, ...(opts.tags ?? [])];
  return {
    key,
    build,
    footprint,
    tags,
    ...(opts.tint !== undefined ? { defaultTint: opts.tint } : {}),
    ...(opts.material !== undefined ? { material: opts.material } : {}),
    ...(opts.seats !== undefined ? { seats: opts.seats } : {}),
  };
}

/** Near-only detail plus a cheap far-only stand-in. */
export function lodPair(near: Geo, far: Geo): Geo {
  return merge(detail(near), farOnly(far));
}

/** Rounded box near, plain box far (same outer size). Base-rested, centred on x/z. */
export function softBox(w: number, h: number, d: number, r: number, col: Col): Geo {
  return lodPair(rbox(w, h, d, r, col), box(w, h, d, col));
}

/** Apply rotateZ(rz), then rotateY(ry), then translate(t) to a point (mirrors the Geo transforms). */
export function xfPoint(p: V3, rz: number, ry: number, t: V3): V3 {
  const x1 = p[0] * Math.cos(rz) - p[1] * Math.sin(rz);
  const y1 = p[0] * Math.sin(rz) + p[1] * Math.cos(rz);
  const z1 = p[2];
  return [x1 * Math.cos(ry) + z1 * Math.sin(ry) + t[0], y1 + t[1], -x1 * Math.sin(ry) + z1 * Math.cos(ry) + t[2]];
}

/** Heading that faces along the tangent of a circle at angle `a` (increasing a). */
export function tangentHeading(a: number): number {
  return a + Math.PI / 2;
}

/**
 * Surface of revolution about y with per-segment (crisp) profile normals, smooth around the axis.
 * Profile points are [radius, y]; traverse counter-clockwise in (r, y) so normals face outward
 * (e.g. bottom -> top for an outer wall). Optional partial sweep for striped gores.
 */
export function revolve(
  profile: ReadonlyArray<readonly [number, number]>,
  color: Col,
  seg = 12,
  phi0 = 0,
  phiLen = Math.PI * 2,
): Geo {
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < profile.length - 1; i++) {
    const a = profile[i];
    const b = profile[i + 1];
    if (!a || !b) continue;
    const dr = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dr, dy);
    if (len < 1e-6) continue;
    const nr = dy / len;
    const ny = -dr / len;
    const base = pos.length / 3;
    for (let k = 0; k <= seg; k++) {
      const phi = phi0 + (phiLen * k) / seg;
      const s = Math.sin(phi);
      const c = Math.cos(phi);
      for (const p of [a, b]) {
        pos.push(Math.max(1e-4, p[0]) * s, p[1], Math.max(1e-4, p[0]) * c);
        nor.push(nr * s, ny, nr * c);
      }
    }
    for (let k = 0; k < seg; k++) {
      const v = base + k * 2;
      idx.push(v, v + 2, v + 1, v + 1, v + 2, v + 3);
    }
  }
  return fixWinding(fromThree(bufferOf(pos, nor, idx), color));
}

function bufferOf(pos: number[], nor: number[], idx: number[]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/** Flip any triangle whose face winding disagrees with its vertex normals. */
function fixWinding(g: Geo): Geo {
  const idx = new Uint32Array(g.idx);
  const P = (i: number, k: number): number => g.pos[i * 3 + k] as number;
  const N = (i: number, k: number): number => g.nor[i * 3 + k] as number;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] as number;
    const b = idx[t + 1] as number;
    const c = idx[t + 2] as number;
    const ux = P(b, 0) - P(a, 0);
    const uy = P(b, 1) - P(a, 1);
    const uz = P(b, 2) - P(a, 2);
    const vx = P(c, 0) - P(a, 0);
    const vy = P(c, 1) - P(a, 1);
    const vz = P(c, 2) - P(a, 2);
    const fx = uy * vz - uz * vy;
    const fy = uz * vx - ux * vz;
    const fz = ux * vy - uy * vx;
    const dot = fx * (N(a, 0) + N(b, 0) + N(c, 0)) + fy * (N(a, 1) + N(b, 1) + N(c, 1)) + fz * (N(a, 2) + N(b, 2) + N(c, 2));
    if (dot < 0) {
      idx[t + 1] = c;
      idx[t + 2] = b;
    }
  }
  return { ...g, idx };
}

/**
 * Striped revolved surface: `n` gores alternating a tint-masked colour and a contrast colour
 * (ivory by default). Used for umbrellas, tents, canopies and the helter-skelter.
 */
export function stripedRevolve(
  profile: ReadonlyArray<readonly [number, number]>,
  n: number,
  segPerGore = 1,
  tintCol: Col = 'coral',
  contrast: Col = 'ivory',
  phiOffset = 0,
): Geo {
  const step = (Math.PI * 2) / n;
  const parts = Array.from({ length: n }, (_, i) => {
    const g = revolve(profile, i % 2 === 0 ? tintCol : contrast, segPerGore, phiOffset + i * step, step);
    return i % 2 === 0 ? tintable(g) : g;
  });
  return merge(parts);
}

/**
 * Closed canopy (cone roof with thickness): rim radius r at y = 0, apex at y = h,
 * underside sagging `under` below the apex line. Normals out on top, down underneath.
 */
export function canopyProfile(r: number, h: number, lip = 0.06): Array<readonly [number, number]> {
  return [
    [0, h * 0.55],
    [r, -lip],
    [r, 0],
    [0, h],
  ];
}

/** Vertical striped wall ring with thickness (tents, huts): inner radius r - t, outer r. */
export function wallProfile(r: number, h: number, t = 0.06): Array<readonly [number, number]> {
  return [
    [r - t, h],
    [r - t, 0],
    [r, 0],
    [r, h],
    [r - t, h],
  ];
}

/** Thin vertical post (cylinder) at x/z. */
export function post(x: number, z: number, h: number, r: number, col: Col, seg = 6, y = 0): Geo {
  return translate(cyl(r, r, h, col, seg), x, y, z);
}

/** Thin rope/chain/rail between two points — near-only detail. */
export function rope(a: V3, b: V3, t = 0.025, col: Col = 'slate'): Geo {
  return detail(beam(a, b, t, col));
}

/** Horizontal bar along z (rotate the result for other axes), centred at origin. */
export function barZ(len: number, r: number, col: Col, seg = 6): Geo {
  return rotateX(translate(cyl(r, r, len, col, seg), 0, -len / 2, 0), Math.PI / 2);
}

/** Horizontal bar along x, centred at origin. */
export function barX(len: number, r: number, col: Col, seg = 6): Geo {
  return rotateZ(translate(cyl(r, r, len, col, seg), 0, -len / 2, 0), Math.PI / 2);
}

/**
 * Planar lattice truss from a to b: two chords offset by ±off plus zigzag diagonals in `n` panels.
 * Usually near-only (pair it with a single far beam via `lodPair`).
 */
export function truss(a: V3, b: V3, off: V3, n: number, t: number, col: Col): Geo {
  const at = (p: number, s: number): V3 => [
    a[0] + (b[0] - a[0]) * p + off[0] * s,
    a[1] + (b[1] - a[1]) * p + off[1] * s,
    a[2] + (b[2] - a[2]) * p + off[2] * s,
  ];
  const chords = [beam(at(0, 1), at(1, 1), t, col), beam(at(0, -1), at(1, -1), t, col)];
  const diags = Array.from({ length: n }, (_, i) =>
    beam(at(i / n, i % 2 === 0 ? 1 : -1), at((i + 1) / n, i % 2 === 0 ? -1 : 1), t * 0.6, col),
  );
  return merge(chords, diags);
}

/** Small light bulbs along a polyline, near-only. */
export function bulbs(points: readonly V3[], col: Col = 'butterLight', r = 0.06): Geo {
  const b = sphere(r, col, 4, 3);
  return detail(merge(points.map((p) => translate(b, p[0], p[1], p[2]))));
}

/** Box placed by its centre-bottom at (x, y, z). */
export function boxAt(w: number, h: number, d: number, col: Col, x: number, y: number, z: number): Geo {
  return translate(box(w, h, d, col), x, y, z);
}

/** Box without its ±x end faces (8 triangles): interior stripe of a striped band. */
function slab4(w: number, h: number, d: number, col: Col): Geo {
  const g = box(w, h, d, col);
  return { ...g, idx: g.idx.slice(12) };
}

/**
 * Alternating stripes along x across a width w (count n): band height h, depth d, base on y = 0.
 * Interior stripes skip their hidden end faces (8 tris each). Colour `a` stripes are tint-masked.
 */
export function stripesX(w: number, h: number, d: number, n: number, a: Col, b: Col, tintA = true): Geo {
  const sw = w / n;
  return merge(
    Array.from({ length: n }, (_, i) => {
      const col = i % 2 === 0 ? a : b;
      const g = i === 0 || i === n - 1 ? box(sw, h, d, col) : slab4(sw, h, d, col);
      const placed = translate(g, -w / 2 + sw * (i + 0.5), 0, 0);
      return tintA && i % 2 === 0 ? tintable(placed) : placed;
    }),
  );
}

/** Solid cylinder profile (outer wall + top cap) for revolve: radius r, height h. */
export function drumProfile(r: number, h: number, r2 = r): Array<readonly [number, number]> {
  return [
    [r, 0],
    [r2, h],
    [0.01, h],
  ];
}

/** Outer skin only (single segment) — cheap far stand-in for a band / wall ring. */
export function bandProfile(r: number, h: number): Array<readonly [number, number]> {
  return [
    [r, 0],
    [r, h],
  ];
}

/** Striped revolve with a finer near tier and a coarser far tier (same gore count & colours). */
export function stripedLod(
  profile: ReadonlyArray<readonly [number, number]>,
  n: number,
  segNear: number,
  segFar: number,
  a: Col = 'coral',
  b: Col = 'ivory',
  farProfile?: ReadonlyArray<readonly [number, number]>,
  phiOffset = 0,
): Geo {
  return lodPair(
    stripedRevolve(profile, n, segNear, a, b, phiOffset),
    stripedRevolve(farProfile ?? profile, n, segFar, a, b, phiOffset),
  );
}

/** Small triangular pennant flag (thin prism) hanging from a point, tip pointing down; sway to tip. */
export function pennant(col: Col, w = 0.3, h = 0.4): Geo {
  const flag = profile(
    [
      [-w / 2, 0],
      [w / 2, 0],
      [0, -h],
    ],
    0.02,
    col,
  );
  return sway(flag, (_x, y) => Math.min(1, -y / h));
}

/** Triangular flag on a short staff, base on y = 0; cloth sways toward the free edge. */
export function flagOnPole(h: number, col: Col, tint = true): Geo {
  const cloth = profile(
    [
      [0, 0],
      [0.4, -0.13],
      [0, -0.26],
    ],
    0.02,
    col,
  );
  const swayed = sway(translate(cloth, 0.015, h, 0), (x) => Math.min(1, x / 0.4));
  return merge(post(0, 0, h + 0.02, 0.015, 'timberDeep', 4), tint ? tintable(swayed) : swayed);
}
