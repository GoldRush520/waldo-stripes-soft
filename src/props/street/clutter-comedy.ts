/** Comedy market set pieces: prize pumpkin, runaway cabbages, spilled oranges, giant tuna, toppling fish boxes. */
import {
  type Geo,
  beam,
  blob,
  box,
  cyl,
  detail,
  farOnly,
  lathe,
  merge,
  profile,
  pyramid,
  rotateX,
  rotateY,
  rotateZ,
  scale,
  selectLod,
  sphere,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { crate } from './clutter-containers';
import { goodsHeap } from './goods';
import { prop, restOnGround } from './kit';

function prizePumpkin(): Geo {
  const pallet = box(1.1, 0.12, 1.0, 'timber');
  const lobes = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2;
    return translate(rotateY(blob(0.3, 0.4, 0.22, 'coral', 6, 4), a), Math.sin(a) * 0.24, 0.52, Math.cos(a) * 0.24);
  });
  const stem = translate(rotateZ(cyl(0.05, 0.035, 0.18, 'sageDeep', 5), 0.25), 0, 0.88, 0);
  const rosette = merge(rotateX(cyl(0.1, 0.1, 0.02, 'blue', 8), Math.PI / 2), [-1, 1].map((s) => translate(rotateZ(box(0.05, 0.16, 0.012, 'blue'), s * 0.2), s * 0.03, -0.16, 0)));
  const ribbon = translate(rosette, 0, 0.62, 0.52);
  const far = farOnly(translate(blob(0.52, 0.4, 0.5, 'coral', 6, 4), 0, 0.52, 0));
  return merge(pallet, detail(merge(lobes, stem, ribbon)), far);
}

function cabbageTrail(): Geo {
  const rng = createRng('cabbage.trail');
  const head = merge(blob(0.1, 0.09, 0.1, 'sage', 5, 3), translate(blob(0.115, 0.05, 0.115, 'sageLight', 5, 2), 0, -0.04, 0));
  const farHead = sphere(0.1, 'sage', 4, 2);
  const parts = Array.from({ length: 6 }, (_, i) => {
    const t = i / 5;
    const x = Math.sin(t * Math.PI * 1.4) * 0.5;
    const z = -1.4 + t * 2.8;
    const s = 1 - t * 0.15;
    const ry = rng.next() * Math.PI;
    const tilt = (rng.next() - 0.5) * 0.8;
    const y = 0.09 * s;
    return [
      detail(translate(rotateY(rotateZ(scale(head, s), tilt), ry), x, y, z)),
      farOnly(translate(scale(farHead, s), x, y, z)),
    ];
  });
  return merge(parts);
}

function spilledOranges(): Geo {
  const rng = createRng('oranges.spill');
  const tipped = translate(rotateX(crate(0.5, 0.3, 0.36), Math.PI / 2), 0, 0.18, -0.55);
  const orange = detail(sphere(0.045, 'coral', 4, 3));
  const fruit = Array.from({ length: 13 }, (_, i) => {
    const a = (rng.next() - 0.5) * 1.3;
    const r = 0.25 + (i / 13) * 0.9 + rng.next() * 0.1;
    return translate(orange, Math.sin(a) * r, 0.045, -0.5 + Math.cos(a) * r);
  });
  const far = farOnly(translate(pyramid(0.9, 0.06, 0.9, 'coral'), 0, 0, 0.15));
  return merge(tipped, fruit, far);
}

function trestle(len: number): Geo {
  const frame = (x: number): Geo =>
    merge(
      beam([x, 0, -0.3], [x, 0.82, -0.05], 0.05, 'timberDeep'),
      beam([x, 0, 0.3], [x, 0.82, 0.05], 0.05, 'timberDeep'),
      beam([x, 0.4, -0.18], [x, 0.4, 0.18], 0.04, 'timberDeep'),
    );
  return merge(frame(-len / 2 + 0.3), frame(len / 2 - 0.3), translate(box(len, 0.05, 0.55, 'timber'), 0, 0.82, 0));
}

function giantTuna(): Geo {
  const body = lathe(
    [
      [0.02, 0],
      [0.12, 0.18],
      [0.24, 0.55],
      [0.27, 0.95],
      [0.22, 1.35],
      [0.1, 1.72],
      [0.04, 1.9],
    ],
    'slate',
    8,
  );
  const laid = translate(scale(rotateZ(body, -Math.PI / 2), 1, 1, 0.72), -0.95, 0, 0);
  const belly = translate(blob(0.75, 0.12, 0.17, 'ivoryShade', 6, 3), -0.1, -0.12, 0);
  const tail = translate(
    profile(
      [
        [0, 0],
        [0.24, 0.36],
        [0.16, 0.02],
        [0.16, -0.02],
        [0.24, -0.36],
      ],
      0.03,
      'blueDeep',
    ),
    0.92,
    0,
    0,
  );
  const fin = (x: number, y: number, h: number): Geo =>
    translate(profile([[0, 0], [0.22, 0], [0.18, h]], 0.025, 'blueDeep'), x, y, 0);
  const fins = merge(fin(-0.05, 0.22, 0.2), fin(-0.05, -0.2, -0.16));
  const eyes = detail(merge([-1, 1].map((s) => translate(sphere(0.035, 'ink', 4, 2), -0.75, 0.05, s * 0.15))));
  const ice = detail(merge(Array.from({ length: 8 }, (_, i) => translate(rotateY(box(0.08, 0.05, 0.08, 'blueLight'), i), -1.0 + i * 0.28, -0.24, (i % 2 ? 1 : -1) * 0.18))));
  const fish = translate(merge(laid, belly, tail, fins, eyes, ice), 0, 1.13, 0);
  const sign = detail(translate(merge(box(0.5, 0.3, 0.03, 'ink'), translate(box(0.36, 0.05, 0.01, 'butter'), 0, 0.17, 0.02), translate(box(0.28, 0.04, 0.01, 'ivory'), 0, 0.08, 0.02)), 0.5, 0.35, 0.3));
  return merge(trestle(2.5), fish, sign);
}

function topplingFishBoxes(): Geo {
  const boxGeo = (seed: number): Geo =>
    merge(
      box(0.6, 0.18, 0.4, 'blue'),
      detail(translate(box(0.54, 0.02, 0.34, 'blueLight'), 0, 0.18, 0)),
      translate(selectLod(goodsHeap('fish', { w: 0.5, d: 0.32, budget: 54, seed }), 'near'), 0, 0.18, 0),
    );
  const stack = [
    translate(boxGeo(1), 0, 0, 0),
    translate(rotateY(boxGeo(2), 0.06), 0.02, 0.2, 0),
    translate(rotateY(rotateZ(boxGeo(3), 0.12), -0.1), 0.12, 0.42, 0.03),
    translate(rotateZ(box(0.6, 0.18, 0.4, 'blue'), 0.45), 0.36, 0.66, -0.02),
  ];
  const fallen = translate(restOnGround(rotateZ(boxGeo(4), -1.2)), 0.85, 0, 0.1);
  const loose = translate(selectLod(goodsHeap('fish', { w: 0.5, d: 0.3, budget: 60, seed: 'spill' }), 'near'), 0.75, 0, 0.42);
  return merge(stack, fallen, loose);
}

export const COMEDY_PROPS: readonly PropDef[] = [
  prop('pumpkin.prize', [1.1, 1.0], 'furniture', prizePumpkin, { tags: ['market', 'comedy'] }),
  prop('cabbages.runaway', [0, 0], 'furniture', cabbageTrail, { tags: ['market', 'comedy', 'loose'] }),
  prop('oranges.spilled', [0, 0], 'furniture', spilledOranges, { tags: ['market', 'comedy', 'loose'] }),
  prop('tuna.trestle', [2.5, 0.6], 'stall', giantTuna, { tags: ['market', 'comedy', 'fish'] }),
  prop('fishboxes.toppling', [1.2, 0.6], 'furniture', topplingFishBoxes, { tags: ['market', 'comedy', 'fish'] }),
];
