/** Goods catalogue: every heap kind a stall (or a standalone crate) can display. */
import type { Geo } from '../../core/geo';
import { createRng } from '../../core/rng';
import { FOOD_GOODS } from './goods-food';
import { type HeapRecipe, buildHeap } from './goods-kit';
import { WARE_GOODS } from './goods-wares';

export const GOODS = { ...FOOD_GOODS, ...WARE_GOODS } as const satisfies Record<string, HeapRecipe>;

export type GoodsKind = keyof typeof GOODS;

export const GOODS_KINDS = Object.keys(GOODS) as GoodsKind[];

export interface GoodsHeapOptions {
  readonly w: number;
  readonly d: number;
  /** triangle budget for the whole heap (default 160) */
  readonly budget?: number;
  readonly seed?: number | string;
}

/** A heap of goods resting on y = 0, centred; items are near-only with one far-tier stand-in. */
export function goodsHeap(kind: GoodsKind, opts: GoodsHeapOptions): Geo {
  const rng = createRng(opts.seed ?? `heap.${kind}`);
  return buildHeap(GOODS[kind], { w: opts.w, d: opts.d, budget: opts.budget ?? 160, rng });
}
