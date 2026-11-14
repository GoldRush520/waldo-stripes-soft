/**
 * Table-top sets. Authors place them on a table at y = 0.75. Everything is near-only detail plus one
 * tiny far-tier block so a laid table still reads in the overview.
 */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  detail,
  disc,
  dome,
  farOnly,
  lathe,
  merge,
  prism,
  rotateX,
  rotateY,
  rotateZ,
  sphere,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import type { PropDef } from '../registry';
import { prop, topCyl } from './kit';

const saucer = (): Geo => topCyl(0.07, 0.075, 0.012, 'ivory', 8);
const plate = (r = 0.13): Geo => topCyl(r - 0.01, r, 0.015, 'ivory', 8);

function cup(drink: ColorName, body: ColorName = 'ivory'): Geo {
  const wall = cyl(0.035, 0.042, 0.065, body, 6, false);
  const surface = translate(disc(0.039, drink, 6), 0, 0.058, 0);
  const handle = translate(box(0.012, 0.04, 0.026, body), 0.048, 0.015, 0);
  return merge(wall, surface, handle);
}

function cupOnSaucer(drink: ColorName): Geo {
  return merge(saucer(), translate(cup(drink), 0, 0.012, 0));
}

function glass(drink: ColorName, h = 0.12): Geo {
  return merge(cyl(0.032, 0.036, h, 'blueLight', 5, false), translate(disc(0.034, drink, 5), 0, h * 0.75, 0));
}

function wineGlass(): Geo {
  const bowl = translate(rotateX(cone(0.04, 0.07, 'blueLight', 5), Math.PI), 0, 0.16, 0);
  const wine = translate(disc(0.026, 'coralDeep', 5), 0, 0.115, 0);
  return merge(disc(0.035, 'blueLight', 5), beam([0, 0, 0], [0, 0.09, 0], 0.008, 'blueLight'), bowl, wine);
}

function farBlock(w: number, d: number): Geo {
  return farOnly(box(w, 0.04, d, 'ivory'));
}

function coffeeForTwo(): Geo {
  const a = translate(cupOnSaucer('cocoa'), -0.16, 0, 0.12);
  const b = translate(rotateY(cupOnSaucer('clayDeep'), Math.PI), 0.16, 0, -0.12);
  const spoons = [-0.07, 0.25].map((x, i) => translate(rotateY(box(0.09, 0.006, 0.012, 'stone'), 0.4), x, 0.013, i ? -0.08 : 0.15));
  const sugar = translate(topCyl(0.04, 0.045, 0.05, 'blue', 6), 0, 0, 0);
  return merge(detail(merge(a, b, spoons, sugar)), farBlock(0.4, 0.3));
}

function teaAndCake(): Geo {
  const pot = merge(
    lathe([[0.06, 0], [0.085, 0.05], [0.07, 0.11], [0.03, 0.13]], 'blue', 6),
    translate(sphere(0.018, 'ivory', 4, 2), 0, 0.14, 0),
    translate(rotateZ(cone(0.018, 0.08, 'blue', 3), -0.9), 0.08, 0.05, 0),
    translate(box(0.015, 0.07, 0.03, 'blue'), -0.09, 0.035, 0),
  );
  const cups = [-1, 1].map((s) => translate(cupOnSaucer('clay'), s * 0.2, 0, 0.12));
  const tiers = [0.0, 0.12, 0.24].map((y, i) => translate(topCyl(0.12 - i * 0.025, 0.12 - i * 0.025, 0.01, 'ivory', 6), 0, y + 0.01, 0));
  const rod = beam([0, 0, 0], [0, 0.38, 0], 0.012, 'butterDeep');
  const cakes = [0, 1].flatMap((t) =>
    [0, 1].map((k) => {
      const a = k * Math.PI + t;
      const r = 0.07 - t * 0.02;
      return translate(k % 2 ? dome(0.025, 'coralLight', 4, 2) : box(0.04, 0.03, 0.04, 'butter'), Math.sin(a) * r, 0.02 + t * 0.12, Math.cos(a) * r);
    }),
  );
  const stand = translate(merge(tiers, rod, cakes), 0.06, 0, -0.12);
  return merge(detail(merge(translate(pot, -0.16, 0, -0.1), cups, stand)), farBlock(0.5, 0.36));
}

function breakfast(): Geo {
  const egg = merge(translate(disc(0.045, 'white', 8), 0, 0.017, 0), translate(dome(0.018, 'butter', 5, 2), 0, 0.017, 0));
  const eggs = [-0.04, 0.04].map((x) => translate(egg, x, 0, 0.02));
  const toast = [0, 1].map((i) => translate(rotateY(box(0.08, 0.012, 0.08, 'butterDeep'), 0.3 * i), 0.18, 0.003 + i * 0.012, -0.05));
  const juice = translate(glass('coral', 0.11), -0.2, 0, -0.08);
  const croissant = translate(rotateY(blob(0.05, 0.022, 0.028, 'butterDeep', 4, 3), 0.6), 0.16, 0.022, 0.1);
  const coffee = translate(cupOnSaucer('cocoa'), -0.18, 0, 0.12);
  const butter = translate(box(0.04, 0.02, 0.03, 'butterLight'), 0.06, 0.015, -0.08);
  return merge(detail(merge(plate(), eggs, toast, juice, croissant, coffee, butter)), farBlock(0.5, 0.34));
}

function wineAndCheese(): Geo {
  const bottle = lathe([[0.035, 0], [0.036, 0.2], [0.013, 0.27], [0.013, 0.32], [0.016, 0.33]], 'sageDeep', 6);
  const glasses = [-1, 1].map((s) => translate(wineGlass(), s * 0.14, 0, 0.12));
  const board = translate(box(0.28, 0.02, 0.18, 'timber'), 0.12, 0, -0.08);
  const wedge = prism([[-0.04, -0.035], [0.05, 0], [-0.04, 0.035]], 0.045, 'butter');
  const wedges = [0, 1, 2].map((i) => translate(rotateY(wedge, i * 1.9), 0.05 + i * 0.07, 0.02, -0.08));
  const grapes = [0, 1, 2, 3, 4].map((i) => translate(sphere(0.014, 'sageDeep', 4, 2), 0.2 + (i % 2) * 0.02, 0.034 + Math.floor(i / 2) * 0.012, -0.12 + i * 0.012));
  return merge(detail(merge(translate(bottle, -0.15, 0, -0.08), glasses, board, wedges, grapes)), farBlock(0.48, 0.34));
}

function pancakeStack(): Geo {
  const n = 7;
  const pts = Array.from({ length: n * 2 + 1 }, (_, i): readonly [number, number] => [
    i === n * 2 ? 0.02 : i % 2 === 0 ? 0.088 : 0.098,
    0.015 + i * 0.0125,
  ]);
  const stack = lathe(pts, 'butterDeep', 7);
  const top = 0.015 + n * 2 * 0.0125;
  const butter = translate(box(0.04, 0.02, 0.04, 'butterLight'), 0, top - 0.004, 0);
  const syrup = translate(blob(0.06, 0.012, 0.05, 'clayDeep', 5, 2), 0.02, top - 0.006, 0.01);
  const fork = translate(rotateY(box(0.17, 0.006, 0.014, 'stone'), 0.3), 0.08, 0.017, 0.11);
  return merge(detail(merge(plate(), stack, butter, syrup, fork)), farBlock(0.24, 0.24));
}

function spilledDrink(): Geo {
  const tipped = translate(rotateZ(merge(cyl(0.032, 0.036, 0.12, 'blueLight', 6, false), disc(0.034, 'blueLight', 6)), Math.PI / 2 - 0.08), 0.06, 0.035, 0);
  const puddle = translate(blob(0.17, 0.005, 0.11, 'blueLight', 6, 2), -0.1, 0.003, 0.03);
  const ice = [0, 1, 2].map((i) => translate(rotateY(box(0.025, 0.022, 0.025, 'white'), i), -0.12 + i * 0.06, 0.006, 0.05 - i * 0.03));
  const straw = beam([-0.02, 0.01, 0.02], [-0.2, 0.015, 0.1], 0.008, 'coral');
  const coaster = translate(cyl(0.05, 0.05, 0.006, 'clay', 6), 0.12, 0, -0.1);
  return merge(detail(merge(tipped, puddle, ice, straw, coaster)), farOnly(translate(box(0.3, 0.012, 0.2, 'blueLight'), -0.06, 0, 0.02)));
}

const TOP = ['cafe', 'tabletop', 'place:on-table:0.75'];

export const TABLETOP_PROPS: readonly PropDef[] = [
  prop('tabletop.coffee2', [0, 0], 'furniture', coffeeForTwo, { tags: TOP }),
  prop('tabletop.tea', [0, 0], 'furniture', teaAndCake, { tags: TOP }),
  prop('tabletop.breakfast', [0, 0], 'furniture', breakfast, { tags: TOP }),
  prop('tabletop.wine', [0, 0], 'furniture', wineAndCheese, { tags: TOP }),
  prop('tabletop.pancakes', [0, 0], 'furniture', pancakeStack, { tags: [...TOP, 'comedy'] }),
  prop('tabletop.spill', [0, 0], 'furniture', spilledDrink, { tags: [...TOP, 'comedy'] }),
];
