/**
 * Balcony unit. Local frame: centred on x, wall plane z = 0, slab top (where people stand) at
 * y = 0, projecting toward +z. Far tier: slab + one solid railing panel; balusters, rails,
 * brackets and flower boxes are near-only.
 */
import { type Col, type Geo, detail, farOnly, merge, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { windowBox } from './flowers';
import { bx, cy } from './kit';

export interface BalconyOpts {
  readonly w: number;
  readonly depth?: number;
  readonly rail?: Col;
  readonly floor?: Col;
  readonly flowers?: boolean;
  readonly petal?: Col;
}

const RAIL_H = 0.95;

function balusters(w: number, depth: number, rail: Col): Geo[] {
  const nFront = Math.max(3, Math.round(w / 0.25));
  const nSide = Math.max(1, Math.round(depth / 0.28));
  const front = Array.from({ length: nFront }, (_, i) =>
    cy(0.014, RAIL_H, rail, 3, [-w / 2 + ((i + 0.5) * w) / nFront, 0, depth - 0.04], 1, false),
  );
  const sides = [-1, 1].flatMap((s) =>
    Array.from({ length: nSide }, (_, i) =>
      cy(0.014, RAIL_H, rail, 3, [s * (w / 2 - 0.03), 0, ((i + 0.5) * (depth - 0.06)) / nSide], 1, false),
    ),
  );
  return [...front, ...sides];
}

export function balconyUnit(opts: BalconyOpts, rng: Rng): Geo {
  const { w, depth = 0.85, rail = 'blueDeep', floor = 'stone', flowers = false, petal = 'coral' } = opts;
  const slabG = bx(w, 0.14, depth, floor, 0, -0.14, depth / 2);
  const near: Geo[] = [
    bx(w, 0.05, 0.05, rail, 0, RAIL_H, depth - 0.04),
    ...[-1, 1].map((s) => bx(0.05, 0.05, depth, rail, s * (w / 2 - 0.03), RAIL_H, depth / 2)),
    ...[-1, 1].map((s) => bx(0.12, 0.3, depth * 0.6, 'stone', s * (w / 2 - 0.2), -0.44, depth * 0.3)),
    ...balusters(w, depth, rail),
  ];
  const parts = [slabG, detail(merge(near)), farOnly(bx(w, 0.3, 0.04, rail, 0, RAIL_H - 0.25, depth - 0.04))];
  if (flowers) {
    const bw = Math.min(1.2, w * 0.6);
    parts.push(translate(windowBox({ w: bw, petal, farBlock: false }, rng), 0, RAIL_H - 0.3, depth));
  }
  return merge(parts);
}
