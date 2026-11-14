/** Helpers shared by district modules: cached geometry variants and common palettes. */
import type { Geo } from '../../core/geo';
import { house } from '../../props/arch/house';
import type { HouseOpts, HouseResult } from '../../props/arch/types';
import { type TreeKind, tree } from '../../props/nature/trees';

const trees = new Map<string, Geo>();

/** One of a few cached silhouettes per tree kind, so hundreds of trees share geometry builds. */
export function treeGeo(kind: TreeKind, variant = 0, h?: number): Geo {
  const key = `${kind}:${variant}:${h ?? 0}`;
  let g = trees.get(key);
  if (!g) {
    g = tree({ kind, seed: 11 + variant * 7, h });
    trees.set(key, g);
  }
  return g;
}

const houses = new Map<string, HouseResult>();

/** Cached house build (identical option objects with the same key share one geometry). */
export function houseCached(key: string, opts: HouseOpts): HouseResult {
  let h = houses.get(key);
  if (!h) {
    h = house(opts);
    houses.set(key, h);
  }
  return h;
}

export const WALLS = ['ivory', 'ivoryShade', 'butterLight', 'blueLight', 'coralLight', 'sageLight', 'clayLight'] as const;
export const ROOFS = ['clay', 'coral', 'butter', 'blue', 'sage', 'clayDeep'] as const;
export const CLOTHS = ['coral', 'butter', 'blue', 'sage', 'coralDeep', 'blueDeep', 'clay'] as const;
