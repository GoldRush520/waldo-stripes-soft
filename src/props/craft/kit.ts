/**
 * Shared authoring helpers for the craft / music / luggage / rooftop library.
 * Everything returns new Geos; nothing here mutates its inputs.
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
  merge,
  place,
  rbox,
  rotateX,
  rotateZ,
  tintable,
  translate,
  xform,
} from '../../core/geo';
import type { PropDef } from '../registry';

export const PI = Math.PI;

/** Triangle budget classes from the contract: [full, far]. */
export type Budget = 'clutter' | 'furniture' | 'stall' | 'house' | 'landmark';
export const BUDGETS: Readonly<Record<Budget, { readonly full: number; readonly far: number }>> = {
  clutter: { full: 150, far: 40 },
  furniture: { full: 300, far: 80 },
  stall: { full: 1200, far: 350 },
  house: { full: 3000, far: 700 },
  landmark: { full: 4000, far: 1200 },
};

export interface Seat {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
}

export interface PropOpts {
  readonly budget: Budget;
  readonly tags?: readonly string[];
  readonly tint?: Col;
  readonly seats?: readonly Seat[];
  /** where the seat anchor goes: hips (sitting) or feet (standing on it) */
  readonly seatKind?: 'hip' | 'feet';
}

/** Build a PropDef with the library's standard tags (`craft`, `budget:*`, `seat:*`). */
export function prop(
  key: string,
  footprint: readonly [number, number],
  opts: PropOpts,
  build: () => Geo,
): PropDef {
  const tags = [
    'craft',
    `budget:${opts.budget}`,
    ...(opts.tags ?? []),
    ...(opts.seats ? [`seat:${opts.seatKind ?? 'hip'}`] : []),
  ];
  return {
    key,
    build,
    footprint,
    tags,
    ...(opts.tint !== undefined ? { defaultTint: opts.tint } : {}),
    ...(opts.seats ? { seats: opts.seats } : {}),
  };
}

/** Place shortcut: translate + optional yaw. */
export function at(g: Geo, x: number, y: number, z: number, rotY = 0): Geo {
  return place(g, x, y, z, rotY);
}

/** Non-uniform scale then place. */
export function stretch(g: Geo, sx: number, sy: number, sz: number, x = 0, y = 0, z = 0, rotY = 0): Geo {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY),
    new THREE.Vector3(sx, sy, sz),
  );
  return xform(g, m);
}

/** Near-only detailed form plus a far-only cheap stand-in of the same thing. */
export function lodPair(near: Geo, far: Geo): Geo {
  return merge(detail(near), farOnly(far));
}

/** Soft rounded box up close, plain box from afar. */
export function soft(w: number, h: number, d: number, r: number, col: Col): Geo {
  return lodPair(rbox(w, h, d, r, col), box(w, h, d, col));
}

/** Thin near-only strut between two points. */
export function rod(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
  col: Col,
): Geo {
  return detail(beam(a, b, t, col));
}

/** Four box legs under a w x d top at height h (near-only). */
export function legs(w: number, d: number, h: number, t: number, col: Col): Geo {
  const x = w / 2 - t / 2;
  const z = d / 2 - t / 2;
  const leg = box(t, h, t, col);
  return detail(merge(at(leg, -x, 0, -z), at(leg, x, 0, -z), at(leg, -x, 0, z), at(leg, x, 0, z)));
}

/** Cylinder lying with its axis along z, centred on the origin (axis at y = 0). */
export function lyingZ(r: number, len: number, col: Col, seg = 10): Geo {
  return translate(rotateX(cyl(r, r, len, col, seg), PI / 2), 0, 0, -len / 2);
}

/** Cylinder lying with its axis along x, centred on the origin (axis at y = 0). */
export function lyingX(r: number, len: number, col: Col, seg = 10): Geo {
  return translate(rotateZ(cyl(r, r, len, col, seg), -PI / 2), -len / 2, 0, 0);
}

/**
 * A box of `n` alternating stripes along x (tint-masked colour + ivory), w x h x d, base-rested.
 * Even stripes take the tint; odd stripes stay ivory.
 */
export function stripedBox(w: number, h: number, d: number, n: number, axis: 'x' | 'y' = 'x'): Geo {
  const parts: Geo[] = [];
  const span = axis === 'x' ? w : h;
  const step = span / n;
  for (let i = 0; i < n; i++) {
    const tinted = i % 2 === 0;
    const col: Col = tinted ? 'coral' : 'ivory';
    const piece =
      axis === 'x'
        ? at(box(step, h, d, col), -w / 2 + step * (i + 0.5), 0, 0)
        : at(box(w, step, d, col), 0, step * i, 0);
    parts.push(tinted ? tintable(piece) : piece);
  }
  return merge(parts);
}

/** Rotate a base-rested centred box-like Geo about z by `a`, then lift so it rests on y = 0 again. */
export function tiltRest(g: Geo, w: number, h: number, a: number): Geo {
  const centred = translate(g, 0, -h / 2, 0);
  const lift = (w / 2) * Math.abs(Math.sin(a)) + (h / 2) * Math.cos(a);
  return translate(rotateZ(centred, a), 0, lift, 0);
}

/** Linear sway that grows from 0 at `anchorY` down to 1 at `anchorY - drop`. */
export function hangSway(anchorY: number, drop: number): (x: number, y: number, z: number) => number {
  return (_x, y) => Math.max(0, Math.min(1, (anchorY - y) / drop));
}

/** Linear sway that grows from 0 at `baseY` up to 1 at `baseY + rise`. */
export function riseSway(baseY: number, rise: number): (x: number, y: number, z: number) => number {
  return (_x, y) => Math.max(0, Math.min(1, (y - baseY) / rise));
}
