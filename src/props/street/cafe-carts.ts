/** Wheeled café carts and the outdoor bread oven. */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  detail,
  dome,
  merge,
  profile,
  rotateX,
  rotateY,
  rotateZ,
  shadeY,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import type { PropDef } from '../registry';
import { gores, stripedSlab, valance } from './awning';
import { goodsHeap } from './goods';
import { prop, topCyl } from './kit';

/** Wheel with its axle along x, resting on y = 0. */
export function wheel(r: number, w: number, color: ColorName = 'ink', seg = 10): Geo {
  return translate(rotateZ(cyl(r, r, w, color, seg), Math.PI / 2), w / 2, r, 0);
}

/** Wheel with its axle along z (rolls along x), centred at (x, z). */
export function sideWheel(r: number, w: number, x: number, z: number, color: ColorName = 'ink', seg = 10): Geo {
  return translate(rotateY(wheel(r, w, color, seg), Math.PI / 2), x, 0, z);
}

function coffeeCart(): Geo {
  const body = translate(shadeY(box(1.2, 0.75, 0.62, 'ivory'), 0.85, 1), 0, 0.3, 0);
  const band = tintable(translate(box(1.22, 0.18, 0.64, 'coral'), 0, 0.72, 0));
  const top = translate(box(1.3, 0.04, 0.7, 'timber'), 0, 1.05, 0);
  const wheels = [-1, 1].map((s) => sideWheel(0.3, 0.06, 0.3, s * 0.36));
  const legs = [beam([-0.5, 0, -0.2], [-0.5, 0.3, -0.2], 0.05, 'ink'), beam([-0.5, 0, 0.2], [-0.5, 0.3, 0.2], 0.05, 'ink')];
  const handle = beam([0.6, 0.95, 0], [1.0, 1.05, 0], 0.035, 'ink');
  const poles = [-0.6, 0.6].flatMap((x) => [-0.3, 0.3].map((z) => beam([x, 1.09, z], [x, 2.0, z], 0.03, 'ink')));
  const canopy = translate(merge(stripedSlab(1.4, 0.82, 'coral', 0.3), translate(valance(1.4, 'coral', true, true, 0.3), 0, 0, 0.42)), 0, 2.0, 0);
  const machine = translate(merge(box(0.4, 0.36, 0.3, 'slate'), translate(dome(0.1, 'butterDeep', 6, 2), 0, 0.36, 0)), -0.25, 1.09, -0.1);
  const cups = [0.1, 0.22].map((x) => translate(cyl(0.04, 0.045, 0.22, 'ivory', 6), x, 1.09, 0.1));
  const sign = translate(box(0.5, 0.16, 0.02, 'ink'), 0, 0.55, 0.32);
  return merge(body, band, top, wheels, legs, handle, poles, canopy, machine, detail(merge(cups, sign)));
}

function iceCreamCart(): Geo {
  const body = translate(box(1.0, 0.6, 0.6, 'ivory'), 0, 0.35, 0);
  const stripes = [-0.3, 0, 0.3].map((x) => tintable(translate(box(0.12, 0.6, 0.62, 'coral'), x, 0.35, 0)));
  const lids = [-0.3, -0.1, 0.1, 0.3].map((x, i) => translate(topCyl(0.08, 0.08, 0.04, i % 2 ? 'coralLight' : 'butterLight', 8), x, 0.95, 0));
  const front = merge(wheel(0.28, 0.06), beam([0, 0.28, 0], [0, 0.95, 0.35], 0.04, 'ink'));
  const rear = [-1, 1].map((s) => sideWheel(0.22, 0.05, 0.3, s * 0.33));
  const frontWheel = translate(rotateY(front, Math.PI / 2), -0.85, 0, 0);
  const bars = merge(beam([-0.55, 1.0, -0.25], [-0.55, 1.0, 0.25], 0.035, 'ink'), beam([-0.85, 0.28, 0], [-0.8, 0.93, 0], 0.035, 'ink'));
  const saddle = translate(blob(0.12, 0.04, 0.1, 'ink', 5, 2), -0.75, 0.95, 0);
  const pole = beam([0.35, 0.95, -0.2], [0.35, 2.15, -0.2], 0.035, 'ivoryDeep');
  const umbrella = translate(gores(0.85, 0.32, 8, 'coral'), 0.35, 1.95, -0.2);
  const cones = [0.42, 0.5].map((z) => translate(rotateX(cone(0.03, 0.12, 'butterDeep', 5), Math.PI), -0.2, 1.07, z - 0.2));
  const scoop = translate(sphere(0.035, 'coralLight', 5, 3), -0.2, 1.09, 0.3);
  return merge(body, stripes, frontWheel, rear, bars, saddle, pole, umbrella, detail(merge(lids, cones, scoop)));
}

function drinksTrolley(): Geo {
  const shelves = [0.25, 0.8].map((y) => translate(box(0.8, 0.03, 0.45, 'timber'), 0, y, 0));
  const posts = [-0.38, 0.38].flatMap((x) => [-0.2, 0.2].map((z) => beam([x, 0.05, z], [x, 0.85, z], 0.03, 'butterDeep')));
  const handle = beam([-0.45, 0.95, -0.2], [-0.45, 0.95, 0.2], 0.025, 'butterDeep');
  const wheels = [-0.35, 0.35].flatMap((x) => [-0.18, 0.18].map((z) => translate(wheel(0.05, 0.02, 'ink', 6), x, 0, z)));
  const bottles = [-0.25, -0.12, 0.02].map((x, i) => translate(cyl(0.035, 0.035, 0.24, i === 1 ? 'coralDeep' : 'sageDeep', 5), x, 0.83, -0.08));
  const glasses = [0.15, 0.27].map((x) => translate(cyl(0.03, 0.035, 0.1, 'blueLight', 5), x, 0.83, 0.08));
  const crates = translate(box(0.5, 0.18, 0.35, 'clay'), 0, 0.28, 0);
  return merge(shelves, posts, detail(merge(handle, wheels, bottles, glasses, crates)));
}

function runawayBreadCart(): Geo {
  const bed = translate(box(1.4, 0.06, 0.8, 'timber'), 0, 0.42, 0);
  const sides = merge(
    [-1, 1].map((s) => translate(box(1.4, 0.22, 0.04, 'timberDeep'), 0, 0.48, s * 0.38)),
    [-1, 1].map((s) => translate(box(0.04, 0.22, 0.72, 'timberDeep'), s * 0.68, 0.48, 0)),
  );
  const wheels = [-0.5, 0.5].flatMap((x) => [-1, 1].map((s) => sideWheel(0.2, 0.06, x, s * 0.45, 'ink', 8)));
  const axles = [-0.5, 0.5].map((x) => merge(beam([x, 0.2, -0.45], [x, 0.2, 0.45], 0.04, 'ink'), translate(box(0.08, 0.22, 0.5, 'timberDeep'), x, 0.2, 0)));
  const handle = merge(beam([-0.7, 0.5, -0.25], [-1.3, 0.75, -0.2], 0.035, 'timberDeep'), beam([-0.7, 0.5, 0.25], [-1.3, 0.75, 0.2], 0.035, 'timberDeep'), beam([-1.3, 0.75, -0.25], [-1.3, 0.75, 0.25], 0.035, 'timberDeep'));
  const load = translate(goodsHeap('bread', { w: 1.3, d: 0.7, budget: 420, seed: 'runaway' }), 0, 0.48, 0);
  const flying = detail(
    merge(
      translate(rotateZ(blob(0.1, 0.05, 0.06, 'butterDeep', 5, 3), 0.7), 0.95, 1.05, 0.1),
      translate(rotateZ(rotateY(cyl(0.025, 0.025, 0.38, 'butter', 4), 0.4), 1.2), 1.15, 0.85, -0.15),
      translate(rotateY(rotateZ(cyl(0.025, 0.025, 0.38, 'butter', 4), Math.PI / 2), 0.7), 1.35, 0.025, 0.3),
    ),
  );
  return merge(bed, sides, wheels, axles, handle, load, flying);
}

function outdoorOven(): Geo {
  const base = shadeY(box(1.4, 0.85, 1.2, 'clay'), 0.75, 1);
  const hearth = translate(box(1.5, 0.08, 1.3, 'stone'), 0, 0.85, 0);
  const shell = translate(shadeY(dome(0.62, 'clayDeep', 10, 4), 0.85, 1.05), 0, 0.93, -0.05);
  const mouth = translate(
    profile([[-0.22, 0], [0.22, 0], [0.22, 0.18], [0.12, 0.3], [0, 0.33], [-0.12, 0.3], [-0.22, 0.18]], 0.05, 'ink'),
    0,
    0.93,
    0.57,
  );
  const chimney = merge(translate(cyl(0.09, 0.09, 0.9, 'clayDeep', 6), 0, 1.4, -0.35), translate(box(0.26, 0.04, 0.26, 'stone'), 0, 2.3, -0.35));
  const logs = [0, 1, 2, 3, 4].map((i) => translate(rotateZ(cyl(0.05, 0.05, 0.5, i % 2 ? 'timber' : 'timberDeep', 5), Math.PI / 2), 0.25 + (i % 3) * 0.1 - 0.3, 0.05 + Math.floor(i / 3) * 0.09, 0.66 + (i % 3) * 0.0));
  const glow = [translate(blob(0.14, 0.06, 0.06, 'coral', 5, 2), 0, 0.97, 0.5), translate(blob(0.08, 0.05, 0.05, 'butter', 5, 2), 0.05, 0.99, 0.52)];
  const peel = merge(beam([0.6, 0, 0.62], [0.68, 1.4, 0.5], 0.03, 'timber'), translate(rotateX(box(0.22, 0.26, 0.015, 'timber'), -0.08), 0.6, 0.0, 0.64));
  return merge(base, hearth, shell, mouth, chimney, detail(merge(logs, glow, peel)));
}

export const CART_PROPS: readonly PropDef[] = [
  prop('cart.coffee', [1.4, 0.7], 'stall', coffeeCart, { tint: 'coral', tags: ['cafe', 'cart'] }),
  prop('cart.icecream', [1.9, 0.7], 'stall', iceCreamCart, { tint: 'coral', tags: ['cafe', 'cart', 'beach', 'overhang'] }),
  prop('trolley.drinks', [0.9, 0.5], 'furniture', drinksTrolley, { tags: ['cafe', 'cart'] }),
  prop('cart.bread.runaway', [1.4, 0.95], 'stall', runawayBreadCart, { tags: ['bakery', 'cart', 'comedy'] }),
  prop('oven.outdoor', [1.4, 1.2], 'stall', outdoorOven, { tags: ['bakery', 'cafe'] }),
];
