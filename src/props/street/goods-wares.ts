/** Market wares: flowers in buckets, spice sacks, pottery, hats, books, toys, balloons, cloth bolts. */
import {
  beam,
  blob,
  box,
  cone,
  cyl,
  lathe,
  merge,
  profile,
  rotateX,
  sphere,
  sway,
  tintable,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import type { Rng } from '../../core/rng';
import { type HeapRecipe, crateBase, gridSpots, moundOf, slabOf, tpl } from './goods-kit';
import type { Spot } from './kit';

/* ---------------------------------------------------------------- flowers */

function bouquet(fixed: readonly ColorName[]) {
  const bucket = cyl(0.07, 0.09, 0.2, 'slate', 5);
  const greens = translate(blob(0.09, 0.07, 0.09, 'sage', 5, 2), 0, 0.24, 0);
  const blooms = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2;
    const g = translate(sphere(0.035, fixed[i % Math.max(1, fixed.length)] ?? 'coral', 4, 2), Math.sin(a) * 0.06, 0.29, Math.cos(a) * 0.06);
    return fixed.length === 0 || i % 2 === 0 ? tintable(g) : g;
  });
  const crown = tintable(translate(sphere(0.04, 'coral', 4, 2), 0, 0.33, 0));
  return merge(bucket, greens, blooms, crown);
}

const flowers: HeapRecipe = {
  tpls: () => [tpl('bouquet.tint', () => bouquet([])), tpl('bouquet.mix', () => bouquet(['butter', 'ivory', 'blueLight']))],
  spots: (w, d, rng) => gridSpots(w, d, 0.21, 0.21, 0, rng, { jitter: 1 }),
  standin: (w, d) => merge(box(w * 0.8, 0.2, d * 0.6, 'slate'), translate(tintable(moundOf('coral', 0.16)(w, d * 0.7)), 0, 0.2, 0)),
};

/* ---------------------------------------------------------------- spices */

function sackGeo(spice: ColorName) {
  const sack = lathe(
    [
      [0.09, 0],
      [0.115, 0.08],
      [0.105, 0.19],
      [0.12, 0.22],
    ],
    'clay',
    6,
  );
  return merge(sack, translate(cone(0.108, 0.07, spice, 6), 0, 0.18, 0));
}

const spices: HeapRecipe = {
  tpls: () => (['coral', 'butterDeep', 'clayDeep', 'sageDeep', 'butter'] as const).map((c) => tpl(`sack.${c}`, () => sackGeo(c))),
  spots: (w, d, rng) => gridSpots(w, d, 0.25, 0.25, 0, rng, { jitter: 1 }),
  standin: moundOf('butterDeep', 0.28),
};

/* ---------------------------------------------------------------- pottery */

function vaseGeo(c: ColorName) {
  return lathe(
    [
      [0.045, 0],
      [0.085, 0.08],
      [0.07, 0.18],
      [0.035, 0.22],
      [0.048, 0.25],
    ],
    c,
    6,
  );
}

const pottery: HeapRecipe = {
  tpls: () => [
    tpl('vase.clay', () => vaseGeo('clay')),
    tpl('vase.blue', () => vaseGeo('blue')),
    tpl('vase.coral', () => vaseGeo('coralDeep')),
    tpl('bowls', () => merge(cyl(0.05, 0.09, 0.05, 'sage', 6), translate(cyl(0.05, 0.09, 0.05, 'sageLight', 6), 0, 0.05, 0))),
    tpl('pot', () => cyl(0.07, 0.06, 0.12, 'clayDeep', 6)),
  ],
  spots: (w, d, rng) => gridSpots(w, d, 0.19, 0.19, 0, rng, { jitter: 1 }),
  standin: slabOf('clay', 0.18, 0.75),
};

/* ---------------------------------------------------------------- hats */

function hatGeo(c: ColorName) {
  const brim = cyl(0.16, 0.16, 0.012, c, 8);
  const crown = translate(cyl(0.085, 0.075, 0.08, c, 7), 0, 0.012, 0);
  const band = tintable(translate(cyl(0.087, 0.084, 0.022, 'coral', 7, false), 0, 0.014, 0));
  return merge(brim, crown, band);
}

const hats: HeapRecipe = {
  tpls: () => [tpl('hat.butter', () => hatGeo('butter')), tpl('hat.ivory', () => hatGeo('ivory')), tpl('hat.light', () => hatGeo('butterLight'))],
  spots: (w, d, rng) => gridSpots(w, d, 0.34, 0.3, 0, rng, { jitter: 1, layers: 2, dy: 0.026 }),
  standin: slabOf('butter', 0.09),
};

/* ---------------------------------------------------------------- books */

const BOOK_COLORS = ['coral', 'blue', 'sage', 'butter', 'clayDeep', 'blueDeep'] as const;

const books: HeapRecipe = {
  tpls: () => [
    ...BOOK_COLORS.map((c) => tpl(`book.flat.${c}`, () => box(0.15, 0.032, 0.21, c))),
    tpl('book.upright', () => merge(box(0.03, 0.2, 0.14, 'blueDeep'), translate(box(0.03, 0.18, 0.13, 'coral'), 0.032, 0, 0))),
  ],
  spots: (w, d, rng) => gridSpots(w, d, 0.17, 0.24, 0, rng, { jitter: 0.3, layers: 3, dy: 0.034 }),
  standin: slabOf('blue', 0.08),
};

/* ---------------------------------------------------------------- toys */

function teddyGeo() {
  const body = translate(blob(0.055, 0.06, 0.045, 'clayDeep', 5, 3), 0, 0.06, 0);
  const head = translate(sphere(0.04, 'clayDeep', 5, 3), 0, 0.15, 0);
  const ears = [-0.03, 0.03].map((x) => translate(sphere(0.015, 'clay', 4, 2), x, 0.185, 0));
  return merge(body, head, ears);
}

const toys: HeapRecipe = {
  tpls: () => [
    tpl('toy.ball', () => translate(sphere(0.06, 'coral', 5, 3), 0, 0.06, 0)),
    tpl('toy.ballblue', () => translate(sphere(0.05, 'blue', 5, 3), 0, 0.05, 0)),
    tpl('toy.blocks', () => merge(box(0.06, 0.06, 0.06, 'butter'), translate(box(0.06, 0.06, 0.06, 'sage'), 0.01, 0.06, 0))),
    tpl('toy.top', () => merge(translate(rotateX(cone(0.05, 0.05, 'coral', 6), Math.PI), 0, 0.05, 0), translate(cone(0.05, 0.04, 'blue', 6), 0, 0.05, 0))),
    tpl('toy.boat', () => merge(box(0.14, 0.04, 0.06, 'blue'), translate(profile([[0, 0], [0.06, 0], [0, 0.1]], 0.008, 'ivory'), -0.02, 0.04, 0))),
    tpl('toy.teddy', teddyGeo),
  ],
  spots: (w, d, rng) => gridSpots(w, d, 0.15, 0.14, 0, rng, { jitter: 1.2 }),
  standin: moundOf('coral', 0.14),
};

/* ---------------------------------------------------------------- balloons */

function balloonGeo(c: ColorName, h: number) {
  const ball = translate(blob(0.1, 0.13, 0.1, c, 5, 3), 0, h + 0.13, 0);
  const string = stringGeo(h);
  return sway(merge(string, ball), (_x, y) => Math.min(1, y / (h + 0.26)) * 0.6);
}

function stringGeo(h: number) {
  return beam([0, 0, 0], [0, h, 0], 0.008, 'ink');
}

function balloonSpots(w: number, d: number, rng: Rng): Spot[] {
  return gridSpots(w, d, 0.2, 0.16, 0, rng, { jitter: 0.4 }).map((s) => ({
    ...s,
    x: s.x + (rng.next() - 0.5) * 0.05,
  }));
}

const balloons: HeapRecipe = {
  base: (w, d) => ({ geo: box(Math.min(0.3, w), 0.04, Math.min(0.15, d), 'slate'), top: 0.04 }),
  tpls: () => [
    tpl('balloon.coral', () => balloonGeo('coral', 0.55)),
    tpl('balloon.blue', () => balloonGeo('blue', 0.62)),
    tpl('balloon.butter', () => balloonGeo('butter', 0.5)),
    tpl('balloon.sage', () => balloonGeo('sage', 0.66)),
  ],
  spots: balloonSpots,
  standin: (w, d) => tintable(translate(blob(Math.min(0.3, w * 0.4), 0.2, Math.min(0.18, d * 0.6), 'coral', 5, 3), 0, 0.72, 0)),
};

/* ---------------------------------------------------------------- cloth bolts */

const CLOTH = ['coral', 'blue', 'sage', 'butter', 'ivory', 'clay', 'coralLight', 'blueLight'] as const;

const cloth: HeapRecipe = {
  base: crateBase(0.04),
  tpls: () => CLOTH.map((c) => tpl(`bolt.${c}`, () => translate(rotateX(cyl(0.05, 0.05, 0.26, c, 6), Math.PI / 2), 0, 0.05, -0.13))),
  spots: (w, d, rng) => gridSpots(w, d, 0.104, 0.28, 0, rng, { jitter: 0.05, layers: 3, dy: 0.087 }),
  standin: slabOf('coralLight', 0.2),
};

export const WARE_GOODS = { flowers, spices, pottery, hats, books, toys, balloons, cloth } as const satisfies Record<
  string,
  HeapRecipe
>;
