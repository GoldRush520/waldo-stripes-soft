/** Market containers: crates, barrels, sacks, wicker baskets, fish boxes, ice buckets. */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  detail,
  disc,
  farOnly,
  lathe,
  merge,
  rotateY,
  rotateZ,
  shadeY,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import type { PropDef } from '../registry';
import { type GoodsKind, goodsHeap } from './goods';
import { prop } from './kit';

/* ---------------------------------------------------------------- crates */

/** Open slatted crate: near-only walls, one far block. Optional goods heap inside. */
export function crate(w = 0.5, h = 0.3, d = 0.36, goods?: GoodsKind, color: ColorName = 'timber', budget = 70): Geo {
  const t = 0.02;
  const walls = detail(
    merge(
      [-1, 1].map((s) => translate(box(w, h, t, color), 0, 0, s * (d / 2 - t / 2))),
      [-1, 1].map((s) => translate(box(t, h, d - 2 * t, color), s * (w / 2 - t / 2), 0, 0)),
      translate(box(w - 2 * t, t, d - 2 * t, 'timberDeep'), 0, 0.02, 0),
      [-1, 1].map((s) => translate(box(w * 0.3, 0.035, 0.004, 'cocoa'), 0, h - 0.07, s * (d / 2 + 0.002))),
    ),
  );
  const far = farOnly(shadeY(box(w, h - 0.02, d, color), 0.8, 1));
  const heap = goods ? [translate(goodsHeap(goods, { w: w - 0.06, d: d - 0.06, budget, seed: `crate.${goods}` }), 0, h - 0.08, 0)] : [];
  return merge(walls, far, heap);
}

/* ---------------------------------------------------------------- barrels */

const BARREL_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0.2, 0],
  [0.24, 0.15],
  [0.255, 0.33],
  [0.24, 0.52],
  [0.2, 0.66],
];

function hoop(r: number, y: number): Geo {
  return translate(cyl(r + 0.006, r + 0.006, 0.035, 'cocoa', 8, false), 0, y, 0);
}

/** Barrel; `fill` shows an open top heaped with goods colour instead of a lid. */
export function barrel(fill?: { readonly color: ColorName; readonly goods?: GoodsKind }): Geo {
  const body = detail(merge(lathe(BARREL_PROFILE, 'timber', 8), hoop(0.24, 0.12), hoop(0.24, 0.5)));
  const top = fill
    ? translate(cone(0.19, 0.06, fill.color, 8), 0, 0.62, 0)
    : translate(disc(0.2, 'timberDeep', 8), 0, 0.661, 0);
  const extra = fill?.goods ? [translate(goodsHeap(fill.goods, { w: 0.26, d: 0.26, budget: 40, seed: 'barrel' }), 0, 0.64, 0)] : [];
  const far = farOnly(cyl(0.22, 0.2, 0.66, 'timber', 6));
  return merge(body, detail(top), far, extra);
}

/* ---------------------------------------------------------------- sacks */

export function sackTied(color: ColorName = 'clay'): Geo {
  const body = lathe(
    [
      [0.14, 0],
      [0.19, 0.08],
      [0.18, 0.3],
      [0.09, 0.44],
      [0.05, 0.48],
      [0.08, 0.56],
    ],
    color,
    6,
  );
  const tie = translate(cyl(0.055, 0.055, 0.025, 'cocoa', 6, false), 0, 0.46, 0);
  return merge(detail(merge(body, tie)), farOnly(translate(blob(0.18, 0.28, 0.18, color, 5, 3), 0, 0.28, 0)));
}

export function sackOpen(grain: ColorName = 'butterDeep'): Geo {
  const body = lathe(
    [
      [0.15, 0],
      [0.2, 0.1],
      [0.19, 0.34],
      [0.22, 0.4],
    ],
    'clay',
    6,
  );
  const heap = translate(cone(0.2, 0.08, grain, 6), 0, 0.36, 0);
  const scoop = merge(translate(rotateZ(cyl(0.03, 0.03, 0.06, 'slate', 5), 0.6), 0.05, 0.42, 0.05), beam([0.07, 0.45, 0.05], [0.16, 0.52, 0.05], 0.012, 'timberDeep'));
  return merge(detail(merge(body, heap, scoop)), farOnly(merge(cyl(0.2, 0.21, 0.4, 'clay', 5), translate(cone(0.2, 0.08, grain, 5), 0, 0.4, 0))));
}

function sackPile(): Geo {
  const lying = (x: number, y: number, z: number, ry: number): Geo =>
    translate(rotateY(blob(0.32, 0.13, 0.2, 'clay', 6, 4), ry), x, y + 0.13, z);
  const near = detail(merge(lying(-0.2, 0, 0, 0.1), lying(0.22, 0, 0.05, -0.15), lying(0, 0.22, 0.02, 0.05)));
  return merge(near, farOnly(merge(box(0.9, 0.26, 0.42, 'clay'), translate(box(0.55, 0.2, 0.36, 'clay'), 0, 0.26, 0))));
}

/* ---------------------------------------------------------------- baskets */

/** Wicker basket with a handle; the interior is closed by a liner or a heap of goods. */
export function wickerBasket(goods?: GoodsKind): Geo {
  const shell = lathe(
    [
      [0.13, 0],
      [0.18, 0.1],
      [0.2, 0.2],
    ],
    'butterDeep',
    8,
  );
  const rim = translate(cyl(0.205, 0.205, 0.025, 'timber', 8, false), 0, 0.19, 0);
  const liner = translate(disc(0.18, goods ? 'clayDeep' : 'ivory', 8), 0, 0.17, 0);
  const handle = merge(beam([-0.18, 0.2, 0], [-0.1, 0.36, 0], 0.018, 'timber'), beam([-0.1, 0.36, 0], [0.1, 0.36, 0], 0.018, 'timber'), beam([0.1, 0.36, 0], [0.18, 0.2, 0], 0.018, 'timber'));
  const heap = goods ? [translate(goodsHeap(goods, { w: 0.28, d: 0.26, budget: 60, seed: `basket.${goods}` }), 0, 0.15, 0)] : [];
  return merge(detail(merge(shell, rim, liner, handle)), farOnly(cyl(0.18, 0.2, 0.21, 'butterDeep', 5)), heap);
}

/* ---------------------------------------------------------------- fish box and ice bucket */

function fishBox(): Geo {
  const walls = crate(0.6, 0.16, 0.4, undefined, 'blue');
  return merge(walls, translate(goodsHeap('fish', { w: 0.54, d: 0.34, budget: 90, seed: 'fishbox' }), 0, 0.06, 0));
}

function iceBucket(): Geo {
  const bucket = cyl(0.13, 0.16, 0.28, 'slate', 8);
  const ice = [0, 1, 2, 3].map((i) => translate(rotateY(box(0.06, 0.05, 0.06, 'blueLight'), i), Math.sin(i * 1.7) * 0.06, 0.27, Math.cos(i * 1.7) * 0.06));
  const bottle = translate(cyl(0.025, 0.025, 0.22, 'sageDeep', 5), 0.03, 0.2, -0.03);
  const handles = [-1, 1].map((s) => translate(box(0.03, 0.03, 0.06, 'slate'), s * 0.165, 0.22, 0));
  return merge(detail(merge(bucket, ice, bottle, handles)), farOnly(cyl(0.13, 0.16, 0.3, 'slate', 6)));
}

export const CONTAINER_PROPS: readonly PropDef[] = [
  prop('crate.empty', [0.5, 0.36], 'small', () => crate(), { tags: ['market', 'clutter'] }),
  prop('crate.apples', [0.5, 0.36], 'small', () => crate(0.5, 0.3, 0.36, 'apples'), { tags: ['market', 'clutter', 'goods'] }),
  prop('crate.oranges', [0.5, 0.36], 'small', () => crate(0.5, 0.3, 0.36, 'oranges'), { tags: ['market', 'clutter', 'goods'] }),
  prop('crate.fish', [0.5, 0.36], 'small', () => crate(0.5, 0.22, 0.36, 'fish', 'blue'), { tags: ['market', 'clutter', 'goods'] }),
  prop('crate.cabbages', [0.5, 0.36], 'small', () => crate(0.5, 0.3, 0.36, 'cabbages'), { tags: ['market', 'clutter', 'goods'] }),
  prop('crate.tomatoes', [0.5, 0.36], 'small', () => crate(0.5, 0.3, 0.36, 'tomatoes'), { tags: ['market', 'clutter', 'goods'] }),
  prop(
    'crate.stack',
    [0.55, 0.4],
    'furniture',
    () => merge(crate(), translate(rotateY(crate(), 0.08), 0, 0.3, 0), translate(rotateY(crate(0.5, 0.3, 0.36, 'apples', 'timber', 40), -0.06), 0.02, 0.6, 0)),
    { tags: ['market', 'clutter'] },
  ),
  prop('barrel', [0.5, 0.5], 'small', () => barrel(), { tags: ['market', 'clutter'] }),
  prop('barrel.open.apples', [0.5, 0.5], 'small', () => barrel({ color: 'coralDeep', goods: 'apples' }), { tags: ['market', 'clutter'] }),
  prop('barrel.open.fish', [0.5, 0.5], 'small', () => barrel({ color: 'blueLight', goods: 'fish' }), { tags: ['market', 'clutter'] }),
  prop('sack.tied', [0.38, 0.38], 'small', () => sackTied(), { tags: ['market', 'clutter'] }),
  prop('sack.grain.open', [0.42, 0.42], 'small', () => sackOpen(), { tags: ['market', 'clutter'] }),
  prop('sack.pile', [0.9, 0.42], 'small', sackPile, { tags: ['market', 'clutter'] }),
  prop('basket.wicker', [0.4, 0.4], 'small', () => wickerBasket(), { tags: ['market', 'clutter'] }),
  prop('basket.wicker.apples', [0.4, 0.4], 'small', () => wickerBasket('apples'), { tags: ['market', 'clutter'] }),
  prop('basket.wicker.bread', [0.4, 0.4], 'small', () => wickerBasket('bread'), { tags: ['market', 'bakery', 'clutter'] }),
  prop('fishbox.ice', [0.6, 0.4], 'small', fishBox, { tags: ['market', 'clutter', 'fish'] }),
  prop('icebucket', [0.32, 0.32], 'small', iceBucket, { tags: ['market', 'cafe', 'clutter'] }),
];
