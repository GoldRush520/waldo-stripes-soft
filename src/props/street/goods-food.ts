/** Market food goods: fish & shellfish on ice, fruit pyramids, vegetable crates, bakery, dairy, deli. */
import {
  type Col,
  beam,
  blob,
  box,
  cone,
  cyl,
  dome,
  merge,
  prism,
  rotateZ,
  scale,
  sphere,
  sway,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import type { Rng } from '../../core/rng';
import {
  type HeapBase,
  type HeapRecipe,
  basketBase,
  crateBase,
  gridSpots,
  iceBase,
  moundOf,
  pyramidSpots,
  slabOf,
  tpl,
  trayBase,
} from './goods-kit';

/* ---------------------------------------------------------------- seafood */

function fishGeo(c: ColorName) {
  const body = translate(blob(0.1, 0.022, 0.035, c, 5, 3), 0, 0.022, 0);
  const tail = translate(scale(rotateZ(cone(0.034, 0.05, c, 3), -Math.PI / 2), 1, 0.3, 1), -0.145, 0.022, 0);
  return merge(body, tail);
}

function crabGeo() {
  const body = translate(blob(0.065, 0.028, 0.05, 'coralDeep', 5, 3), 0, 0.028, 0);
  const claws = [-0.06, 0.06].map((x) => translate(sphere(0.022, 'coral', 4, 2), x, 0.02, 0.05));
  return merge(body, claws);
}

function lobsterGeo() {
  const body = translate(blob(0.11, 0.026, 0.035, 'coralDeep', 5, 3), 0, 0.026, 0);
  const claws = [-0.04, 0.04].map((z) => translate(blob(0.035, 0.016, 0.02, 'coral', 4, 2), 0.13, 0.02, z));
  return merge(body, claws);
}

const fish: HeapRecipe = {
  base: iceBase,
  tpls: () => (['slate', 'blueDeep', 'ivoryShade', 'coralLight'] as const).map((c) => tpl(`fish.${c}`, () => fishGeo(c))),
  spots: (w, d, rng) => gridSpots(w, d, 0.25, 0.085, 0, rng, { jitter: 0.6 }),
  standin: slabOf('slate', 0.04),
};

const crabs: HeapRecipe = {
  base: iceBase,
  tpls: () => [tpl('crab', crabGeo), tpl('crab', crabGeo), tpl('lobster', lobsterGeo)],
  spots: (w, d, rng) => gridSpots(w, d, 0.18, 0.13, 0, rng, { jitter: 0.8 }),
  standin: slabOf('coralDeep', 0.05),
};

const oysters: HeapRecipe = {
  base: iceBase,
  tpls: () => [
    tpl('oyster.stone', () => translate(blob(0.045, 0.014, 0.032, 'stone', 5, 2), 0, 0.014, 0)),
    tpl('oyster.clay', () => translate(blob(0.042, 0.014, 0.03, 'clay', 5, 2), 0, 0.014, 0)),
    tpl('lemon.half', () => dome(0.028, 'butter', 5, 2)),
  ],
  spots: (w, d, rng) => gridSpots(w, d, 0.095, 0.075, 0, rng, { jitter: 1.2 }),
  standin: slabOf('stone', 0.03),
};

/* ---------------------------------------------------------------- fruit pyramids */

function roundRecipe(
  name: string,
  colors: readonly ColorName[],
  r: number,
  squash: number,
  base: (w: number, d: number) => HeapBase,
  far: Col,
): HeapRecipe {
  return {
    base,
    tpls: () =>
      colors.map((c) => tpl(`${name}.${c}`, () => scale(sphere(r, c, 4, 3), squash > 1 ? squash : 1, Math.min(1, squash), 1))),
    spots: (w, d, rng) => pyramidSpots(w, d, r * Math.max(1, squash), rng, Math.min(1, squash)),
    standin: moundOf(far, r * 3.2),
  };
}

const oranges = roundRecipe('orange', ['coral', 'coral', 'coralDeep'], 0.045, 1, trayBase, 'coral');
const apples = roundRecipe('apple', ['coralDeep', 'sage', 'coralDeep'], 0.042, 0.92, trayBase, 'coralDeep');
const lemons = roundRecipe('lemon', ['butter', 'butter', 'butterLight'], 0.038, 1.2, trayBase, 'butter');
const tomatoes = roundRecipe('tomato', ['coralDeep', 'coral'], 0.034, 0.85, crateBase(0.12), 'coralDeep');
const cabbages = roundRecipe('cabbage', ['sage', 'sageLight', 'sage'], 0.075, 0.9, basketBase, 'sage');

const melons: HeapRecipe = {
  base: trayBase,
  tpls: () => [
    tpl('melon.green', () => blob(0.12, 0.095, 0.095, 'sageDeep', 6, 3)),
    tpl('melon.gold', () => blob(0.1, 0.09, 0.09, 'butterDeep', 6, 3)),
    tpl('melon.half', () => merge(dome(0.1, 'sageDeep', 6, 2), translate(cyl(0.092, 0.092, 0.012, 'coral', 6), 0, -0.012, 0))),
  ],
  spots: (w, d, rng) => pyramidSpots(w, d, 0.11, rng, 0.85),
  standin: moundOf('sageDeep', 0.3),
};

/* ---------------------------------------------------------------- vegetables */

function carrotGeo() {
  const root = rotateZ(cone(0.022, 0.16, 'coral', 4), -Math.PI / 2);
  const top = rotateZ(cone(0.016, 0.06, 'sage', 3), Math.PI / 2);
  return translate(merge(root, top), 0, 0.022, 0);
}

function leekGeo() {
  const stem = rotateZ(cyl(0.022, 0.022, 0.22, 'ivory', 4), -Math.PI / 2);
  const leaves = rotateZ(cone(0.032, 0.16, 'sageDeep', 4), Math.PI / 2);
  return translate(merge(stem, leaves), -0.03, 0.022, 0);
}

const carrots: HeapRecipe = {
  base: crateBase(0.12),
  tpls: () => [tpl('carrot', carrotGeo)],
  spots: (w, d, rng) => gridSpots(w, d, 0.22, 0.048, 0, rng, { jitter: 0.25, layers: 2, dy: 0.035 }),
  standin: slabOf('coral', 0.04),
};

const leeks: HeapRecipe = {
  base: crateBase(0.1),
  tpls: () => [tpl('leek', leekGeo)],
  spots: (w, d, rng) => gridSpots(w, d, 0.4, 0.05, 0, rng, { jitter: 0.15, layers: 2, dy: 0.035 }),
  standin: slabOf('sageLight', 0.05),
};

/* ---------------------------------------------------------------- bakery */

const bread: HeapRecipe = {
  base: basketBase,
  tpls: () => [
    tpl('loaf', () => translate(blob(0.1, 0.05, 0.06, 'butterDeep', 5, 3), 0, 0.045, 0)),
    tpl('boule', () => dome(0.07, 'butterDeep', 5, 2)),
    tpl('baguette', () => translate(rotateZ(cyl(0.025, 0.025, 0.38, 'butter', 4), Math.PI / 2), 0.19, 0.025, 0)),
  ],
  spots: (w, d, rng) => gridSpots(w, d, 0.22, 0.13, 0, rng, { jitter: 0.5, layers: 2, dy: 0.05 }),
  standin: moundOf('butterDeep', 0.14),
};

const pastries: HeapRecipe = {
  base: trayBase,
  tpls: () => [
    tpl('croissant', () => translate(blob(0.045, 0.02, 0.026, 'butterDeep', 4, 3), 0, 0.02, 0)),
    tpl('bun', () => dome(0.035, 'butter', 5, 2)),
    tpl('tart', () => merge(cyl(0.04, 0.04, 0.02, 'butterDeep', 6), translate(cyl(0.032, 0.032, 0.006, 'coral', 6, false), 0, 0.02, 0))),
  ],
  spots: (w, d, rng) => gridSpots(w, d, 0.1, 0.09, 0, rng, { jitter: 1 }),
  standin: slabOf('butter', 0.04),
};

/* ---------------------------------------------------------------- dairy & deli */

const cheese: HeapRecipe = {
  base: (w, d) => ({ geo: box(w, 0.03, d, 'timber'), top: 0.03 }),
  tpls: () => [
    tpl('cheese.wheel', () => cyl(0.13, 0.13, 0.08, 'butter', 8)),
    tpl('cheese.small', () => cyl(0.08, 0.08, 0.07, 'butterLight', 7)),
    tpl('cheese.wedge', () =>
      prism(
        [
          [-0.06, -0.05],
          [0.08, 0],
          [-0.06, 0.05],
        ],
        0.07,
        'butter',
      ),
    ),
  ],
  spots: (w, d, rng) => gridSpots(w, d, 0.29, 0.28, 0, rng, { jitter: 0.4, layers: 3, dy: 0.08 }),
  standin: moundOf('butter', 0.22),
};

const eggs: HeapRecipe = {
  base: (w, d) => ({ geo: box(w, 0.04, d, 'clayLight'), top: 0.04 }),
  tpls: () => [
    tpl('egg.ivory', () => translate(blob(0.022, 0.03, 0.022, 'ivory', 5, 2), 0, 0.02, 0)),
    tpl('egg.clay', () => translate(blob(0.022, 0.03, 0.022, 'clayLight', 5, 2), 0, 0.02, 0)),
  ],
  spots: (w, d, rng) => gridSpots(w, d, 0.055, 0.055, 0, rng, { jitter: 0 }),
  standin: slabOf('ivoryShade', 0.04),
};

function jarGeo(c: ColorName) {
  return merge(cyl(0.04, 0.04, 0.09, c, 5), translate(box(0.06, 0.02, 0.06, 'ivory'), 0, 0.09, 0));
}

const jars: HeapRecipe = {
  base: trayBase,
  tpls: () => (['butterDeep', 'coralDeep', 'sageDeep', 'butterDeep'] as const).map((c, i) => tpl(`jar.${c}.${i % 2}`, () => jarGeo(c))),
  spots: (w, d, rng) => gridSpots(w, d, 0.1, 0.1, 0, rng, { jitter: 0.5, layers: 2, dy: 0.11 }),
  standin: slabOf('butterDeep', 0.12),
};

function hangingGeo(rx: number, ry: number, c: ColorName) {
  const g = translate(blob(rx, ry, rx, c, 4, 3), 0, -ry, 0);
  return sway(g, (_x, y) => Math.min(0.3, (-y / (2 * ry)) * 0.3));
}

function sausageRack(w: number, d: number): HeapBase {
  const posts = [-w / 2 + 0.03, w / 2 - 0.03].map((x) => beam([x, 0, 0], [x, 0.66, 0], 0.035, 'timberDeep'));
  const rail = beam([-w / 2 + 0.02, 0.64, 0], [w / 2 - 0.02, 0.64, 0], 0.03, 'timberDeep');
  const foot = box(0.05, 0.03, Math.min(0.24, d), 'timberDeep');
  const feet = [-w / 2 + 0.03, w / 2 - 0.03].map((x) => translate(foot, x, 0, 0));
  return { geo: merge(posts, rail, feet), top: 0 };
}

function hookSpots(w: number, _d: number, rng: Rng) {
  const n = Math.max(2, Math.floor((w - 0.1) / 0.065));
  return Array.from({ length: n }, (_, i) => ({
    x: (i - (n - 1) / 2) * 0.065,
    y: 0.62,
    z: (rng.next() - 0.5) * 0.02,
  }));
}

const sausages: HeapRecipe = {
  base: sausageRack,
  tpls: () => [
    tpl('sausage', () => hangingGeo(0.018, 0.08, 'coralDeep')),
    tpl('sausage.long', () => hangingGeo(0.016, 0.11, 'clayDeep')),
    tpl('ham', () => hangingGeo(0.045, 0.09, 'clayDeep')),
  ],
  spots: hookSpots,
  standin: (w) => translate(box(w * 0.8, 0.2, 0.05, 'coralDeep'), 0, 0.4, 0),
};

export const FOOD_GOODS = {
  fish,
  crabs,
  oysters,
  oranges,
  apples,
  lemons,
  melons,
  tomatoes,
  cabbages,
  carrots,
  leeks,
  bread,
  pastries,
  cheese,
  eggs,
  jars,
  sausages,
} as const satisfies Record<string, HeapRecipe>;
