/**
 * Standalone architectural elements: external stair with landing, porch / portico and one
 * arcade bay. All rest on y = 0, centred on x/z, front toward +z.
 */
import { type Col, type Geo, beam, detail, farOnly, merge, translate } from '../../core/geo';
import { PI, type V2, arc, ball, bx, cy, fit, slab } from './kit';
import { triPrism } from './roofShapes';
import type { Anchor } from './types';

export interface StairOpts {
  /** height of the landing */
  readonly rise?: number;
  /** flight width (z) */
  readonly w?: number;
  /** landing length (x) */
  readonly landing?: number;
  readonly col?: Col;
  readonly rail?: Col;
}

export interface StairResult {
  readonly geo: Geo;
  /** feet position at the centre of the landing (facing the door in the wall behind: heading π) */
  readonly landing: Anchor;
  /** feet position at the foot of the flight, facing up the stair */
  readonly foot: Anchor;
  readonly footprint: readonly [number, number];
}

/**
 * Straight external stair climbing toward +x along a wall that lies behind it (z = -w/2),
 * ending in a landing. Far tier: a solid ramp silhouette; near: real steps and railings.
 */
export function externalStair(opts: StairOpts = {}): StairResult {
  const { rise = 2.9, w = 1.0, landing = 1.3, col = 'ivoryShade', rail = 'blueDeep' } = opts;
  const n = Math.max(2, Math.round(rise / 0.18));
  const sh = rise / n;
  const tread = 0.28;
  const run = (n - 1) * tread;
  const len = run + landing;
  const under: V2[] = [[len, rise], [len, rise - 0.28], [run, rise - 0.32], [0.35, 0]];
  // near: one solid block per step (stacked from the ground, hidden faces are back-to-back)
  const stepped = Array.from({ length: n - 1 }, (_, i) => bx(tread, (i + 1) * sh, w, col, (i + 0.5) * tread, 0, 0));
  const landingG = bx(landing, 0.28, w, col, run + landing / 2, rise - 0.28, 0);
  const ramp = slab([[0, 0], [run, rise], ...under], w, col);
  const railZ = w / 2 - 0.04;
  const posts = Array.from({ length: Math.ceil(n / 3) + 1 }, (_, i) => {
    const x = Math.min(run, i * 3 * tread);
    return bx(0.04, 0.95, 0.04, rail, x, (x / Math.max(run, 0.01)) * rise, railZ);
  });
  const near = [
    ...stepped,
    landingG,
    ...posts,
    bx(0.04, 0.95, 0.04, rail, len - 0.04, rise, railZ),
    beam([0, 0.95, railZ], [run, rise + 0.95, railZ], 0.05, rail),
    beam([run, rise + 0.95, railZ], [len, rise + 0.95, railZ], 0.05, rail),
    bx(0.05, 0.05, w, rail, len - 0.03, rise + 0.92, 0),
  ];
  const parts = [farOnly(ramp), detail(merge(near)), bx(0.3, rise - 0.28, 0.3, col, len - 0.2, 0, 0)];
  const geo = translate(merge(parts), -len / 2, 0, 0);
  return {
    geo,
    landing: { x: len / 2 - landing / 2, y: rise, z: 0, heading: PI },
    foot: { x: -len / 2 - 0.4, y: 0, z: 0, heading: Math.PI / 2 },
    footprint: [len, w],
  };
}

/** Porch / portico: plinth, two columns, entablature and pediment; back edge on z = -d/2. */
export function portico(w = 2.6, d = 1.6, col: Col = 'ivory', roofCol: Col = 'clayDeep'): Geo {
  const h = 2.7;
  const xs = [-1, 1].map((s) => s * (w / 2 - 0.25));
  const zc = d / 2 - 0.25;
  const near = [
    ...xs.map((x) => cy(0.14, h - 0.3, col, 10, [x, 0.4, zc], 0.9)),
    ...xs.flatMap((x) => [bx(0.36, 0.15, 0.36, col, x, 0.25, zc), bx(0.36, 0.15, 0.36, col, x, h - 0.05, zc)]),
    bx(w, 0.12, 0.2, 'stone', 0, 0.13, d / 2 + 0.1),
    ...Array.from({ length: Math.round(w / 0.25) }, (_, i) =>
      bx(0.08, 0.08, 0.06, col, -w / 2 + 0.12 + i * 0.25, h + 0.12, d / 2 + 0.03),
    ),
    cy(0.012, 0.35, 'ink', 4, [0, h - 0.25, 0]),
    ball([0.1, 0.13, 0.1], 'butterLight', [0, h - 0.35, 0], 6, 4),
  ];
  return merge(
    bx(w, 0.25, d, 'stone', 0, 0, 0),
    ...xs.map((x) => farOnly(bx(0.28, h - 0.15, 0.28, col, x, 0.25, zc))),
    bx(w + 0.12, 0.32, d + 0.06, col, 0, h + 0.1, 0.03),
    fit(triPrism(roofCol), [w + 0.24, 0.6, d + 0.1], [0, h + 0.42, 0.03]),
    detail(merge(near)),
  );
}

/** One arcade bay: two piers carrying an arch band and a cornice slab (walk-through). */
export function arcadeBay(w = 3, d = 2.6, col: Col = 'clayLight'): Geo {
  const pier = 0.5;
  const r = w / 2 - pier;
  const ys = 2.3;
  const top = ys + r + 0.45;
  const band = (segs: number): Geo =>
    slab([[-w / 2, top], [-w / 2, ys], ...arc([0, ys], r, PI, 0, segs), [w / 2, ys], [w / 2, top]], d, col);
  const near = [
    band(8),
    ...[-1, 1].flatMap((s) => [
      bx(pier + 0.08, 0.14, d + 0.08, 'ivory', s * (w / 2 - pier / 2), ys - 0.14, 0),
      bx(pier + 0.1, 0.35, d + 0.1, 'stone', s * (w / 2 - pier / 2), 0, 0),
    ]),
    bx(0.3, 0.4, 0.12, 'ivory', 0, ys + r - 0.1, d / 2 + 0.02),
    bx(w + 0.04, 0.12, 0.14, 'ivory', 0, ys + r + 0.05, d / 2 + 0.03),
    cy(0.012, 0.5, 'ink', 4, [0, ys + r - 0.55, 0]),
    ball([0.12, 0.16, 0.12], 'butterLight', [0, ys + r - 0.68, 0], 6, 4),
  ];
  return merge(
    [-1, 1].map((s) => bx(pier, ys, d, col, s * (w / 2 - pier / 2), 0, 0)),
    farOnly(band(3)),
    bx(w + 0.2, 0.22, d + 0.2, 'ivory', 0, top, 0),
    detail(merge(near)),
  );
}
