/** Bakery display pieces: loaf rack, baguette basket, pretzel stand, wedding cake, croissant tray. */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  detail,
  farOnly,
  lathe,
  merge,
  rotateX,
  rotateY,
  sphere,
  torus,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { goodsHeap } from './goods';
import { prop, topCyl } from './kit';

function loafRack(): Geo {
  const w = 1.2;
  const d = 0.45;
  const uprights = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => beam([sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03)], [sx * (w / 2 - 0.03), 1.6, sz * (d / 2 - 0.03)], 0.05, 'timberDeep')));
  const levels = [0.35, 0.8, 1.25];
  const shelves = levels.map((y) => translate(box(w, 0.03, d, 'timber'), 0, y, 0));
  const kinds = ['bread', 'pastries', 'bread'] as const;
  const heaps = levels.map((y, i) => translate(goodsHeap(kinds[i] ?? 'bread', { w: w - 0.1, d: d - 0.06, budget: 240, seed: `rack.${i}` }), 0, y + 0.03, 0));
  const crest = detail(translate(box(w * 0.6, 0.16, 0.03, 'ivory'), 0, 1.5, d / 2 - 0.02));
  return merge(uprights, shelves, heaps, crest);
}

function baguetteBasket(): Geo {
  const rng = createRng('baguettes');
  const basket = lathe([[0.14, 0], [0.17, 0.2], [0.19, 0.36]], 'butterDeep', 8);
  const liner = translate(cyl(0.18, 0.18, 0.01, 'ivory', 8), 0, 0.3, 0);
  const sticks = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const tilt = 0.12 + rng.next() * 0.12;
    const stick = rotateX(cyl(0.024, 0.022, 0.62, 'butter', 4), tilt);
    return translate(rotateY(stick, a), Math.sin(a) * 0.07, 0.04, Math.cos(a) * 0.07);
  });
  const far = farOnly(translate(cone(0.16, 0.5, 'butter', 5), 0, 0.3, 0));
  return merge(basket, detail(merge(liner, sticks)), far);
}

function pretzelStand(): Geo {
  const pole = beam([0, 0, 0], [0, 1.5, 0], 0.045, 'timberDeep');
  const base = cyl(0.25, 0.28, 0.05, 'timberDeep', 6);
  const pegs = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const y = 0.75 + (i % 2) * 0.35;
    const peg = beam([0, y, 0], [Math.sin(a) * 0.2, y + 0.05, Math.cos(a) * 0.2], 0.025, 'timber');
    const pretzel = translate(rotateY(rotateX(torus(0.07, 0.018, 'butterDeep', 3, 8), Math.PI / 2), a), Math.sin(a) * 0.17, y - 0.04, Math.cos(a) * 0.17);
    return merge(peg, pretzel);
  });
  const far = farOnly(translate(box(0.4, 0.5, 0.4, 'butterDeep'), 0, 0.75, 0));
  return merge(pole, base, detail(merge(pegs)), far);
}

function weddingCake(): Geo {
  const radii = [0.24, 0.19, 0.14, 0.09];
  const tiers = (seg: number): Geo[] => radii.map((r, i) => translate(topCyl(r, r, 0.11, 'white', seg), 0, 0.04 + i * 0.11, 0));
  const frosting = radii.map((r, i) => translate(cyl(r + 0.008, r + 0.008, 0.02, i % 2 ? 'coralLight' : 'butterLight', 10, false), 0, 0.04 + i * 0.11, 0));
  const stand = topCyl(0.27, 0.28, 0.04, 'ivoryShade', 8);
  const topper = [-1, 1].map((s) => translate(blob(0.025, 0.05, 0.025, s > 0 ? 'ink' : 'white', 4, 3), s * 0.03, 0.54, 0));
  const roses = [0, 1, 2, 3, 4].map((i) => translate(sphere(0.022, 'coral', 4, 2), Math.sin(i * 1.26) * 0.2, 0.16, Math.cos(i * 1.26) * 0.2));
  return merge(detail(merge(tiers(10), frosting, stand, topper, roses)), farOnly(merge(tiers(6))));
}

function croissantTray(): Geo {
  const tray = box(0.5, 0.025, 0.36, 'slate');
  const croissant = blob(0.05, 0.022, 0.028, 'butterDeep', 4, 3);
  const items = Array.from({ length: 8 }, (_, i) => translate(rotateY(croissant, (i % 3) * 0.5 - 0.4), -0.18 + (i % 4) * 0.12, 0.045, i < 4 ? -0.08 : 0.08));
  return merge(detail(merge(tray, items)), farOnly(box(0.5, 0.05, 0.36, 'butterDeep')));
}

export const BAKERY_PROPS: readonly PropDef[] = [
  prop('bakery.rack.loaves', [1.2, 0.45], 'stall', loafRack, { tags: ['bakery', 'market', 'goods'] }),
  prop('bakery.basket.baguettes', [0.4, 0.4], 'furniture', baguetteBasket, { tags: ['bakery', 'market'] }),
  prop('bakery.rack.pretzels', [0.56, 0.56], 'furniture', pretzelStand, { tags: ['bakery', 'market'] }),
  prop('cake.wedding', [0.56, 0.56], 'furniture', weddingCake, { tags: ['bakery', 'cafe', 'comedy', 'place:on-table:0.75'] }),
  prop('bakery.tray.croissants', [0, 0], 'small', croissantTray, { tags: ['bakery', 'cafe', 'place:on-table:0.75'] }),
];
