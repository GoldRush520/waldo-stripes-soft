/**
 * Shared build context for the harbour modules: reserved hero spots that crowds must leave open,
 * water lots already taken by boats, and small placement helpers that respect both.
 */
import type { Kit, PersonSpec } from '../../kit';

export interface Rect {
  readonly x0: number;
  readonly z0: number;
  readonly x1: number;
  readonly z1: number;
}

export interface Ctx {
  readonly k: Kit;
  /** points kept free for target spots (local x, z, y, heading) */
  readonly reserved: Array<readonly [number, number, number, number]>;
  /** water rectangles already occupied by hulls, piers and rocks */
  readonly water: Rect[];
}

export function createCtx(k: Kit): Ctx {
  return { k, reserved: [], water: [] };
}

/** Clear of blocks, people and reserved hero spots. */
export function free(c: Ctx, x: number, z: number, r = 0.32): boolean {
  if (c.reserved.some(([rx, rz]) => Math.hypot(rx - x, rz - z) < 0.85)) return false;
  return c.k.isFree(x, z, r);
}

/** Place a standing person only where there is room; returns the id or -1. */
export function stand(c: Ctx, spec: PersonSpec, r = 0.32): number {
  if (!free(c, spec.x, spec.z, r)) return -1;
  return c.k.person(spec);
}

/** Axis-aligned rectangle of a hull of size w × l centred at (x, z) with heading rot (0 or ±π/2 or π). */
export function hullRect(x: number, z: number, w: number, l: number, rot: number, pad = 0.35): Rect {
  const across = Math.abs(Math.sin(rot)) > 0.7;
  const hx = (across ? l : w) / 2 + pad;
  const hz = (across ? w : l) / 2 + pad;
  return { x0: x - hx, z0: z - hz, x1: x + hx, z1: z + hz };
}

export function waterFree(c: Ctx, r: Rect): boolean {
  return !c.water.some((o) => r.x0 < o.x1 && r.x1 > o.x0 && r.z0 < o.z1 && r.z1 > o.z0);
}

export function claim(c: Ctx, r: Rect): void {
  c.water.push(r);
}
