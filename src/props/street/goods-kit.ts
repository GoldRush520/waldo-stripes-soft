/**
 * Heap assembly for market goods. A heap is an optional always-drawn container (crate, ice bed,
 * tray), individual `detail()` items placed until a triangle budget runs out, and ONE `farOnly()`
 * stand-in so the far tier still reads as "a crate full of oranges".
 */
import {
  type Col,
  type Geo,
  EMPTY,
  box,
  detail,
  farOnly,
  merge,
  place,
  pyramid,
  shadeY,
  translate,
  triangleCount,
} from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Spot, memo } from './kit';

export interface HeapSpec {
  /** heap area width (x) and depth (z) in metres; the heap rests on y = 0 */
  readonly w: number;
  readonly d: number;
  /** maximum triangles for the whole heap (container + items + stand-in) */
  readonly budget: number;
  readonly rng: Rng;
}

export interface HeapBase {
  readonly geo: Geo;
  /** height of the surface the items rest on */
  readonly top: number;
}

export interface HeapRecipe {
  readonly base?: (w: number, d: number) => HeapBase;
  /** detail templates, resting on y = 0, centred */
  readonly tpls: () => readonly Geo[];
  readonly spots: (w: number, d: number, rng: Rng) => Spot[];
  /** far-tier stand-in resting on y = 0 (farOnly is applied by the assembler) */
  readonly standin: (w: number, d: number) => Geo;
}

/** Template helper: memoised and tagged near-only. */
export function tpl(key: string, make: () => Geo): Geo {
  return memo(`goods:${key}`, () => detail(make()));
}

/** Place templates at spots in order until the budget is spent. */
export function fillSpots(tpls: readonly Geo[], spots: readonly Spot[], budget: number, rng: Rng, y0 = 0): Geo[] {
  const out: Geo[] = [];
  let left = budget;
  for (const s of spots) {
    const t = rng.pick(tpls);
    const c = triangleCount(t);
    if (c > left) break;
    left -= c;
    out.push(place(t, s.x, s.y + y0, s.z, s.ry ?? 0, s.s ?? 1));
  }
  return out;
}

export function buildHeap(recipe: HeapRecipe, spec: HeapSpec): Geo {
  const raw = recipe.base ? recipe.base(spec.w, spec.d) : { geo: EMPTY, top: 0 };
  // thin trays and ice beds are hidden under the far stand-in, so they are near-only
  const base = raw.top <= 0.06 ? { geo: detail(raw.geo), top: raw.top } : raw;
  const far = farOnly(translate(recipe.standin(spec.w, spec.d), 0, base.top, 0));
  const fixed = triangleCount(base.geo) + triangleCount(far);
  const items = fillSpots(recipe.tpls(), recipe.spots(spec.w, spec.d, spec.rng), spec.budget - fixed, spec.rng, base.top);
  return merge(base.geo, far, items);
}

/* ---------------------------------------------------------------- spot generators */

/** Grid of spots, front row (largest z) first; optional stacked layers offset by half a step. */
export function gridSpots(
  w: number,
  d: number,
  sx: number,
  sz: number,
  y: number,
  rng: Rng,
  opts: { readonly jitter?: number; readonly layers?: number; readonly dy?: number } = {},
): Spot[] {
  const out: Spot[] = [];
  const layers = opts.layers ?? 1;
  for (let k = 0; k < layers; k++) {
    const nx = Math.max(1, Math.floor(w / sx) - k);
    const nz = Math.max(1, Math.floor(d / sz) - k);
    for (let iz = nz - 1; iz >= 0; iz--) {
      for (let ix = 0; ix < nx; ix++) {
        out.push({
          x: (ix - (nx - 1) / 2) * sx,
          y: y + k * (opts.dy ?? 0),
          z: (iz - (nz - 1) / 2) * sz,
          ry: (rng.next() - 0.5) * (opts.jitter ?? 0.3),
        });
      }
    }
  }
  return out.sort((a, b) => b.z - a.z || a.y - b.y);
}

/** Packed pyramid of round items of radius r (front first, bottom first). */
export function pyramidSpots(w: number, d: number, r: number, rng: Rng, lift = 1): Spot[] {
  const step = r * 2.02;
  const out: Spot[] = [];
  for (let k = 0; k < 5; k++) {
    const nx = Math.floor(w / step) - k;
    const nz = Math.floor(d / step) - k;
    if (nx < 1 || nz < 1) break;
    for (let iz = 0; iz < nz; iz++) {
      for (let ix = 0; ix < nx; ix++) {
        out.push({
          x: (ix - (nx - 1) / 2) * step,
          y: r * lift + k * r * 1.42,
          z: (iz - (nz - 1) / 2) * step,
          ry: rng.next() * Math.PI * 2,
        });
      }
    }
  }
  return out.sort((a, b) => b.z - a.z || a.y - b.y);
}

/* ---------------------------------------------------------------- bases and stand-ins */

export const crateBase =
  (h: number) =>
  (w: number, d: number): HeapBase => ({ geo: shadeY(box(w, h, d, 'timber'), 0.82, 1), top: h });

export const iceBase = (w: number, d: number): HeapBase => ({ geo: box(w, 0.05, d, 'blueLight'), top: 0.05 });

export const trayBase = (w: number, d: number): HeapBase => ({ geo: box(w, 0.03, d, 'clay'), top: 0.03 });

export const basketBase = (w: number, d: number): HeapBase => ({ geo: box(w, 0.08, d, 'butterDeep'), top: 0.06 });

export const moundOf =
  (color: Col, h: number, fill = 0.9) =>
  (w: number, d: number): Geo =>
    pyramid(w * fill, h, d * fill, color);

export const slabOf =
  (color: Col, h: number, fill = 0.85) =>
  (w: number, d: number): Geo =>
    box(w * fill, h, d * fill, color);
