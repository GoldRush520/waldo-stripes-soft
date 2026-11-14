/** Potted trees and the public seeded `tree()` builder. */
import { type Col, type Geo, box, merge, translate } from '../../core/geo';
import { type Rng, createRng } from '../../core/rng';
import { type Q, type V3, ground, hiOnly, limb, tiered } from './kit';
import { canopy, fruit, jitter, jv, pot, trunk } from './tree-parts';
import { cypress, lollipopTree, palm, roundTree, umbrellaPine, willow } from './trees-a';
import { bareTree, birch, blossomTree, cubeTree, espalier, fruitTree } from './trees-b';

/** Potted orange (or lemon) tree for terraces, ~1.7 m. */
export function pottedOrange(q: Q, h: number, rng: Rng, fruitCol: Col = 'butterDeep'): Geo {
  const j = jitter(rng, 12);
  const ph = 0.26 * h;
  const c = 0.72 * h;
  const R = 0.2 * h;
  const crown = canopy(
    q,
    [
      { p: [0, c, 0], r: [R, R * 0.9, R], size: 'big' },
      { p: [R * 0.45, c + R * 0.6, 0], r: [R * 0.5, R * 0.45, R * 0.5], size: 'small', col: 'sageLight' },
    ],
    ph,
    h,
    0.12,
    0.25,
  );
  const fruits = hiOnly(q, () =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + jv(j, i) * 0.4;
      return fruit([Math.sin(a) * R * 0.92, c + jv(j, i + 6) * R * 0.4, Math.cos(a) * R * 0.92], 0.045, fruitCol);
    }),
  );
  return merge(pot(q, 0.2 * h * 0.9, ph), trunk(q, [[0, ph * 0.8, 0], [0, c, 0]], 0.03, 0.022), crown, fruits);
}

/** Potted olive: gnarled split trunk with silvery leaf puffs. */
export function pottedOlive(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 8);
  const ph = 0.25 * h;
  const fork: V3 = [0.04, 0.5 * h, 0];
  const R = 0.12 * h;
  const spots: V3[] = [
    [0.2 * h, 0.78 * h, 0.04],
    [-0.16 * h, 0.82 * h, -0.05],
    [0.02, 0.95 * h - R * 0.6, 0.06],
    [0.05 * h * jv(j, 0), 0.7 * h, 0.14 * h],
  ];
  const crown = canopy(
    q,
    spots.map((p, i) => ({ p, r: [R, R * 0.7, R] as V3, size: 'small' as const, col: (i % 2 ? 'sageLight' : 'sage') as Col })),
    0.5 * h,
    h,
    0.15,
    0.3,
  );
  const arms = q.hi ? spots.slice(0, 2).map((p) => limb(fork, [p[0] * 0.8, p[1] - R * 0.5, p[2]], 0.03, 0.015, 'timberDeep', 4)) : [];
  return merge(pot(q, 0.17 * h, ph), trunk(q, [[0, ph * 0.8, 0], [-0.05, 0.36 * h, 0], fork], 0.05, 0.035, 'timberDeep'), arms, crown);
}

/** Bay-laurel clipped ball standing in a square timber tub with an ivory band. */
export function bayBall(q: Q, h: number, _rng: Rng): Geo {
  const t = 0.24 * h;
  const tw = 0.28 * h;
  const R = 0.22 * h;
  const band = hiOnly(q, () => translate(box(tw + 0.03, t * 0.18, tw + 0.03, 'ivory'), 0, t * 0.62, 0));
  const tub = [box(tw, t, tw, 'timber'), band];
  const soil = hiOnly(q, () => translate(box(tw - 0.04, 0.02, tw - 0.04, 'cocoa'), 0, t, 0));
  const ball = canopy(q, [{ p: [0, h - R, 0], r: [R, R, R], size: 'big' }], h - 2 * R, h, 0.12, 0.2);
  return merge(tub, soil, trunk(q, [[0, t, 0], [0, h - 1.6 * R, 0]], 0.025, 0.02), ball);
}

export type TreeKind =
  | 'round'
  | 'lollipop'
  | 'cypress'
  | 'umbrellaPine'
  | 'palm'
  | 'willow'
  | 'blossom'
  | 'orange'
  | 'lemon'
  | 'birch'
  | 'cube'
  | 'espalier'
  | 'bare'
  | 'pottedOrange'
  | 'pottedLemon'
  | 'pottedOlive'
  | 'bayBall';

type KindBuilder = (q: Q, h: number, rng: Rng) => Geo;

const KINDS: Record<TreeKind, KindBuilder> = {
  round: roundTree,
  lollipop: lollipopTree,
  cypress,
  umbrellaPine,
  palm,
  willow,
  blossom: blossomTree,
  orange: (q, h, r) => fruitTree(q, h, r, 'butterDeep'),
  lemon: (q, h, r) => fruitTree(q, h, r, 'butter'),
  birch,
  cube: cubeTree,
  espalier,
  bare: bareTree,
  pottedOrange: (q, h, r) => pottedOrange(q, h, r),
  pottedLemon: (q, h, r) => pottedOrange(q, h, r, 'butter'),
  pottedOlive,
  bayBall,
};

/** Typical heights (m) per kind, used when `h` is omitted. */
export const TREE_HEIGHTS: Readonly<Record<TreeKind, number>> = {
  round: 6.5,
  lollipop: 4,
  cypress: 7,
  umbrellaPine: 7.5,
  palm: 7,
  willow: 7,
  blossom: 5.5,
  orange: 3.6,
  lemon: 3.4,
  birch: 6.5,
  cube: 3.8,
  espalier: 2.2,
  bare: 5,
  pottedOrange: 1.7,
  pottedLemon: 1.6,
  pottedOlive: 1.8,
  bayBall: 1.5,
};

export interface TreeOptions {
  readonly kind: TreeKind;
  /** overall height in metres (defaults per kind) */
  readonly h?: number;
  /** seed for silhouette jitter */
  readonly seed?: number;
}

/** Seeded parametric tree. Same options always give the same mesh. */
export function tree(opts: TreeOptions): Geo {
  const h = Math.max(0.5, opts.h ?? TREE_HEIGHTS[opts.kind]);
  const seed = opts.seed ?? 1;
  const make = KINDS[opts.kind];
  return ground(tiered((q) => make(q, h, createRng(seed))));
}

/** Trunk-sized footprint for a tree of a kind and height. */
export function treeFootprint(kind: TreeKind, h: number): readonly [number, number] {
  if (kind === 'espalier') return [1.1 * h, 0.25];
  if (kind === 'pottedOrange' || kind === 'pottedLemon') return [0.36 * h, 0.36 * h];
  if (kind === 'pottedOlive' || kind === 'bayBall') return [0.3 * h, 0.3 * h];
  const d = Math.max(0.25, Math.min(1, 0.1 * h));
  return [d, d];
}
