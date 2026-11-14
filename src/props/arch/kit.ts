/**
 * Arch-kit helpers: cached unit primitives placed with a single transform copy, so parametric
 * builders that run hundreds of times avoid re-creating THREE geometries for every part.
 */
import * as THREE from 'three';
import {
  type Col,
  type Geo,
  bounds,
  box,
  cyl,
  profile,
  sphere,
  translate,
  xform,
} from '../../core/geo';

export type V2 = readonly [number, number];
export type V3 = readonly [number, number, number];

export const PI = Math.PI;
export const HALF_PI = Math.PI / 2;

const units = new Map<string, Geo>();

function colKey(c: Col): string {
  return typeof c === 'string' ? c : c.map((v) => v.toFixed(4)).join(',');
}

/** Memoise a unit primitive per kind + colour (pure: built once, never mutated). */
export function unit(kind: string, col: Col, make: () => Geo): Geo {
  const key = `${kind}|${colKey(col)}`;
  const hit = units.get(key);
  if (hit) return hit;
  const g = make();
  units.set(key, g);
  return g;
}

const mat = new THREE.Matrix4();
const quat = new THREE.Quaternion();
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const vPos = new THREE.Vector3();
const vScale = new THREE.Vector3();

/** Scale, rotate (Euler YXZ: z, then x tilt, then heading y) and translate a Geo in one copy. */
export function fit(
  g: Geo,
  s: V3,
  p: V3,
  rx = 0,
  ry = 0,
  rz = 0,
): Geo {
  euler.set(rx, ry, rz, 'YXZ');
  quat.setFromEuler(euler);
  vPos.set(p[0], p[1], p[2]);
  vScale.set(s[0], s[1], s[2]);
  return xform(g, mat.compose(vPos, quat, vScale));
}

/** Box resting on its base at (x,y,z), optionally turned about y. */
export function bx(w: number, h: number, d: number, col: Col, x = 0, y = 0, z = 0, ry = 0): Geo {
  return fit(unit('box', col, () => box(1, 1, 1, col)), [w, h, d], [x, y, z], 0, ry);
}

/** Box centred on (x,y,z) with a full YXZ rotation (slopes, slats, leaning boards). */
export function bxc(
  w: number,
  h: number,
  d: number,
  col: Col,
  p: V3,
  rx = 0,
  ry = 0,
  rz = 0,
): Geo {
  const u = unit('cbox', col, () => translate(box(1, 1, 1, col), 0, -0.5, 0));
  return fit(u, [w, h, d], p, rx, ry, rz);
}

/** Vertical cylinder (radius r, height h) resting at (x,y,z). `taper` = top radius / bottom radius. */
export function cy(
  r: number,
  h: number,
  col: Col,
  seg: number,
  p: V3,
  taper = 1,
  capped = true,
): Geo {
  const u = unit(`cyl${seg}-${taper}-${capped ? 1 : 0}`, col, () => cyl(1, taper, 1, col, seg, capped));
  return fit(u, [r, h, r], p);
}

/** Cylinder whose axis points along +z from p (round windows, wheels, discs on walls). */
export function cyz(r: number, len: number, col: Col, seg: number, p: V3): Geo {
  const u = unit(`cyl${seg}-1-1`, col, () => cyl(1, 1, 1, col, seg, true));
  return fit(u, [r, len, r], p, HALF_PI);
}

/** Cylinder whose axis points along +x from p (rails, rolls, barrels on their side). */
export function cyx(r: number, len: number, col: Col, seg: number, p: V3): Geo {
  const u = unit(`cyl${seg}-1-1`, col, () => cyl(1, 1, 1, col, seg, true));
  return fit(u, [r, len, r], p, 0, 0, -HALF_PI);
}

/** Low-poly ellipsoid centred on p. */
export function ball(r: V3, col: Col, p: V3, wSeg = 6, hSeg = 4): Geo {
  const u = unit(`sph${wSeg}x${hSeg}`, col, () => sphere(1, col, wSeg, hSeg));
  return fit(u, r, p);
}

/** Flat slab from a side profile ([x,y] polygon in the x-y plane), thickness along z. */
export function slab(points: readonly V2[], depth: number, col: Col): Geo {
  return profile(points, depth, col);
}

/** Points of a circular arc (centre c, radius r) from a0 to a1, n segments (n+1 points). */
export function arc(c: V2, r: number, a0: number, a1: number, n: number): V2[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r] as const;
  });
}

/** Re-rest a Geo on y = 0 and centre it on x/z (for registry variants of wall-mounted parts). */
export function grounded(g: Geo): Geo {
  const b = bounds(g);
  return translate(g, -(b.min[0] + b.max[0]) / 2, -b.min[1], -(b.min[2] + b.max[2]) / 2);
}

/** Clamp helper. */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Evenly spaced centres of n slots across width w (centred on 0). */
export function slots(n: number, w: number): number[] {
  return Array.from({ length: n }, (_, i) => -w / 2 + ((i + 0.5) * w) / n);
}

/** Triangle counts of the near tier (drops far-only) and far tier (drops near-only), allocation-free. */
export function tierTris(g: Geo): { near: number; far: number } {
  let near = 0;
  let far = 0;
  for (let i = 0; i < g.idx.length; i += 3) {
    const a = g.lod[g.idx[i] as number] ?? 0;
    const b = g.lod[g.idx[i + 1] as number] ?? 0;
    const c = g.lod[g.idx[i + 2] as number] ?? 0;
    if (a !== 2 && b !== 2 && c !== 2) near++;
    if (a !== 1 && b !== 1 && c !== 1) far++;
  }
  return { near, far };
}
