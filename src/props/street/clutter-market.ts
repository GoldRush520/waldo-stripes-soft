/** Market working clutter: scales, hand truck, pallets, produce pyramids, hanging rails, signs. */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  detail,
  farOnly,
  merge,
  rotateX,
  rotateY,
  rotateZ,
  selectLod,
  shadeY,
  sway,
  translate,
} from '../../core/geo';
import type { PropDef } from '../registry';
import { crate } from './clutter-containers';
import { type GoodsKind, goodsHeap } from './goods';
import { prop } from './kit';

/* ---------------------------------------------------------------- scales */

function dial(r: number): Geo {
  const face = rotateX(cyl(r, r, 0.04, 'ivory', 8), Math.PI / 2);
  const needle = translate(box(0.006, r * 0.8, 0.006, 'coralDeep'), 0, 0, 0.025);
  return merge(face, needle);
}

function hangingScale(): Geo {
  const post = beam([0, 0, -0.3], [0, 1.95, -0.3], 0.08, 'timber');
  const arm = beam([0, 1.9, -0.34], [0, 1.9, 0.12], 0.06, 'timber');
  const foot = translate(box(0.5, 0.06, 0.5, 'timberDeep'), 0, 0, -0.2);
  const scale = translate(dial(0.09), 0, 1.6, 0.08);
  const chains = [-1, 0, 1].map((i) => beam([0, 1.5, 0.08], [i * 0.12, 1.22, 0.08 + (i === 0 ? 0.1 : 0)], 0.008, 'slate'));
  const pan = translate(cone(0.17, 0.06, 'slate', 8), 0, 1.16, 0.08);
  const swing = sway(merge(chains, pan), (_x, y) => Math.max(0, (1.55 - y) / 0.4) * 0.15);
  const hook = beam([0, 1.9, 0.08], [0, 1.7, 0.08], 0.012, 'slate');
  return merge(post, arm, foot, detail(merge(scale, swing, hook)), farOnly(translate(box(0.3, 0.45, 0.1, 'slate'), 0, 1.15, 0.08)));
}

function counterScale(): Geo {
  const base = box(0.24, 0.08, 0.18, 'blueDeep');
  const pillar = translate(box(0.05, 0.12, 0.05, 'blueDeep'), 0, 0.08, 0);
  const pan = translate(cyl(0.11, 0.09, 0.025, 'slate', 8), 0, 0.2, 0);
  const face = translate(rotateX(cyl(0.05, 0.05, 0.02, 'ivory', 7), Math.PI / 2), 0, 0.06, 0.095);
  return merge(base, detail(merge(pillar, pan, face)), farOnly(translate(box(0.2, 0.03, 0.18, 'slate'), 0, 0.08, 0)));
}

/* ---------------------------------------------------------------- hand truck and pallets */

function handTruck(loaded: boolean): Geo {
  const rails = [-0.17, 0.17].map((x) => beam([x, 0.08, 0], [x, 1.25, -0.28], 0.035, 'blueDeep'));
  const grip = beam([-0.19, 1.25, -0.28], [0.19, 1.25, -0.28], 0.03, 'ink');
  const nose = translate(box(0.42, 0.02, 0.3, 'slate'), 0, 0, 0.13);
  const wheel = rotateZ(cyl(0.12, 0.12, 0.05, 'ink', 8), Math.PI / 2);
  const wheels = [-0.24, 0.24].map((x) => translate(wheel, x + (x > 0 ? -0.025 : 0.025), 0.12, -0.1));
  const farWheels = [-0.24, 0.24].map((x) => farOnly(translate(box(0.05, 0.24, 0.22, 'ink'), x, 0, -0.1)));
  const load = merge(
    selectLod(crate(0.42, 0.3, 0.32, 'cabbages', 'timber', 50), 'near'),
    farOnly(box(0.42, 0.3, 0.32, 'timber')),
  );
  const crates = loaded ? [translate(rotateX(load, -0.06), 0, 0.03, 0.12)] : [];
  return merge(rails, detail(grip), nose, detail(merge(wheels)), farWheels, crates);
}

function palletStack(n = 4): Geo {
  const pallet = merge(
    translate(box(1.0, 0.025, 0.8, 'timber'), 0, 0.1, 0),
    [-0.4, 0, 0.4].map((x) => translate(box(0.1, 0.1, 0.8, 'timberDeep'), x, 0, 0)),
    [-0.3, 0.3].map((z) => translate(box(1.0, 0.004, 0.04, 'cocoa'), 0, 0.125, z)),
  );
  const near = detail(merge(Array.from({ length: n }, (_, i) => translate(rotateY(pallet, (i % 2) * 0.05 - 0.02), 0, i * 0.125, 0))));
  return merge(near, farOnly(shadeY(box(1.0, n * 0.125, 0.8, 'timber'), 0.75, 1)));
}

/* ---------------------------------------------------------------- produce pyramids */

function producePyramid(kind: GoodsKind, w: number, d: number): Geo {
  const stand = shadeY(box(w, 0.5, d, 'timber'), 0.8, 1);
  const heap = translate(goodsHeap(kind, { w: w - 0.04, d: d - 0.04, budget: 250, seed: `pyramid.${kind}` }), 0, 0.5, 0);
  const tag = detail(merge(beam([w / 2 - 0.1, 0.5, d / 2 - 0.05], [w / 2 - 0.1, 0.72, d / 2 - 0.05], 0.012, 'timberDeep'), translate(box(0.14, 0.09, 0.012, 'ink'), w / 2 - 0.1, 0.68, d / 2 - 0.05)));
  return merge(stand, heap, tag);
}

/* ---------------------------------------------------------------- hanging rails */

function hangingRail(kind: 'garlic' | 'sausage'): Geo {
  const legs = [-0.6, 0.6].flatMap((x) => [beam([x, 0, -0.25], [x, 1.7, 0], 0.05, 'timber'), beam([x, 0, 0.25], [x, 1.7, 0], 0.05, 'timber')]);
  const rail = beam([-0.65, 1.68, 0], [0.65, 1.68, 0], 0.05, 'timberDeep');
  const n = kind === 'garlic' ? 6 : 8;
  const items = Array.from({ length: n }, (_, i) => {
    const x = -0.5 + (i / (n - 1)) * 1.0;
    const g =
      kind === 'garlic'
        ? merge(
            [0, 1, 2].map((k) => translate(blob(0.04, 0.036, 0.04, k % 2 ? 'ivory' : 'ivoryShade', 4, 2), (k % 2) * 0.02 - 0.01, -0.1 - k * 0.09, 0)),
            beam([0, 0, 0], [0, -0.36, 0], 0.012, 'butterDeep'),
          )
        : merge(translate(blob(0.022, 0.12, 0.022, i % 3 ? 'coralDeep' : 'clayDeep', 4, 3), 0, -0.14, 0), beam([0, 0, 0], [0, -0.03, 0], 0.01, 'ink'));
    return translate(sway(g, (_x, y) => Math.min(0.35, -y)), x, 1.66, 0);
  });
  const far = farOnly(translate(box(1.05, 0.32, 0.05, kind === 'garlic' ? 'ivoryShade' : 'coralDeep'), 0, 1.28, 0));
  return merge(legs, rail, detail(merge(items)), far);
}

/* ---------------------------------------------------------------- weighing table and signs */

function weighingTable(): Geo {
  const top = translate(box(1.2, 0.05, 0.7, 'timber'), 0, 0.85, 0);
  const legs = [-0.55, 0.55].flatMap((x) => [-0.3, 0.3].map((z) => translate(box(0.06, 0.85, 0.06, 'timberDeep'), x, 0, z)));
  const scale = detail(translate(selectLod(counterScale(), 'near'), -0.25, 0.9, 0));
  const paper = detail(translate(rotateY(box(0.3, 0.01, 0.4, 'ivory'), 0.2), 0.3, 0.9, 0.05));
  const weights = detail(merge([0, 1, 2].map((i) => translate(cyl(0.03 + i * 0.008, 0.03 + i * 0.008, 0.05, 'slate', 6), 0.1 + i * 0.09, 0.9, -0.2))));
  return merge(top, legs, scale, paper, weights);
}

function lettering(w: number, rows: number, y0: number, z: number): Geo {
  return detail(
    merge(
      Array.from({ length: rows }, (_, r) =>
        Array.from({ length: 3 }, (_, i) =>
          translate(box(w * (0.18 + ((r + i) % 2) * 0.08), 0.035, 0.006, i === 2 ? 'butter' : 'ivory'), (i - 1) * w * 0.3, y0 - r * 0.09, z),
        ),
      ),
    ),
  );
}

function chalkAFrame(): Geo {
  const frame = detail(
    merge(
      [-1, 1].map((s) => translate(box(0.035, 0.84, 0.036, 'timber'), s * 0.25, 0, 0)),
      translate(box(0.54, 0.04, 0.036, 'timber'), 0, 0.8, 0),
    ),
  );
  const board = box(0.5, 0.82, 0.03, 'ink');
  const front = translate(rotateX(merge(board, frame, lettering(0.42, 2, 0.62, 0.018)), -0.12), 0, 0, 0.1);
  const back = translate(rotateX(board, 0.12), 0, 0, -0.1);
  return merge(front, back);
}

function priceStake(): Geo {
  const stake = beam([0, 0, 0], [0, 0.5, 0], 0.025, 'timberDeep');
  const card = translate(box(0.26, 0.17, 0.02, 'ink'), 0, 0.42, 0.015);
  const frame = translate(box(0.29, 0.2, 0.012, 'timber'), 0, 0.405, 0);
  return merge(stake, card, detail(merge(frame, lettering(0.24, 2, 0.53, 0.03))));
}

export const MARKET_CLUTTER_PROPS: readonly PropDef[] = [
  prop('scale.hanging', [0.5, 0.5], 'furniture', hangingScale, { tags: ['market', 'clutter'] }),
  prop('scale.counter', [0.24, 0.18], 'small', counterScale, { tags: ['market', 'clutter', 'tabletop'] }),
  prop('handtruck', [0.5, 0.5], 'furniture', () => handTruck(false), { tags: ['market', 'clutter'] }),
  prop('handtruck.loaded', [0.5, 0.5], 'furniture', () => handTruck(true), { tags: ['market', 'clutter'] }),
  prop('pallet.stack', [1.0, 0.8], 'furniture', () => palletStack(), { tags: ['market', 'harbour', 'clutter'] }),
  prop('pyramid.oranges', [0.7, 0.55], 'furniture', () => producePyramid('oranges', 0.7, 0.55), { tags: ['market', 'goods'] }),
  prop('pyramid.apples', [0.7, 0.55], 'furniture', () => producePyramid('apples', 0.7, 0.55), { tags: ['market', 'goods'] }),
  prop('pyramid.lemons', [0.6, 0.5], 'furniture', () => producePyramid('lemons', 0.6, 0.5), { tags: ['market', 'goods'] }),
  prop('pyramid.melons', [0.8, 0.6], 'furniture', () => producePyramid('melons', 0.8, 0.6), { tags: ['market', 'goods'] }),
  prop('rail.garlic', [1.3, 0.55], 'furniture', () => hangingRail('garlic'), { tags: ['market', 'clutter'] }),
  prop('rail.sausage', [1.3, 0.55], 'furniture', () => hangingRail('sausage'), { tags: ['market', 'clutter'] }),
  prop('table.weighing', [1.2, 0.7], 'furniture', weighingTable, { tags: ['market'] }),
  prop('sign.chalk.aframe', [0.56, 0.3], 'small', chalkAFrame, { tags: ['market', 'cafe', 'sign'] }),
  prop('sign.price.stake', [0.3, 0.1], 'small', priceStake, { tags: ['market', 'sign'] }),
];
