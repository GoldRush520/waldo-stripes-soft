/** Dodgem arena (floor, bumper rail, roof on posts) and the tint-masked dodgem car. */
import { type Geo, beam, merge, rotateY, scale, tintable, torus, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { boxAt, bulbs, lodPair, post, prop, rope, softBox, stripesX } from './kit';

const W = 12;
const D = 8;
const ROOF_Y = 4.0;

function railRun(len: number): Geo {
  return stripesX(len, 0.45, 0.2, Math.max(2, Math.round(len / 0.8)), 'coral', 'ivory');
}

function rail(): Geo {
  const back = translate(railRun(W), 0, 0.12, -D / 2 + 0.1);
  const frontL = translate(railRun(W / 2 - 1.0), -(W / 4 + 0.5), 0.12, D / 2 - 0.1);
  const frontR = translate(railRun(W / 2 - 1.0), W / 4 + 0.5, 0.12, D / 2 - 0.1);
  const sides = [-1, 1].map((s) => translate(rotateY(railRun(D - 0.4), Math.PI / 2), s * (W / 2 - 0.1), 0.12, 0));
  const near = merge(back, frontL, frontR, sides);
  const far = merge(
    boxAt(W, 0.45, 0.2, 'coral', 0, 0.12, -D / 2 + 0.1),
    boxAt(W / 2 - 1.0, 0.45, 0.2, 'coral', -(W / 4 + 0.5), 0.12, D / 2 - 0.1),
    boxAt(W / 2 - 1.0, 0.45, 0.2, 'coral', W / 4 + 0.5, 0.12, D / 2 - 0.1),
    boxAt(0.2, 0.45, D - 0.4, 'coral', -(W / 2 - 0.1), 0.12, 0),
    boxAt(0.2, 0.45, D - 0.4, 'coral', W / 2 - 0.1, 0.12, 0),
  );
  return lodPair(near, tintable(far));
}

function valance(n: number): Geo {
  const front = translate(stripesX(W + 0.6, 0.5, 0.06, n, 'butter', 'ivory'), 0, ROOF_Y - 0.4, D / 2 + 0.33);
  const back = translate(stripesX(W + 0.6, 0.5, 0.06, n, 'butter', 'ivory'), 0, ROOF_Y - 0.4, -D / 2 - 0.33);
  const m = Math.max(3, Math.round((n * (D + 0.6)) / (W + 0.6)) | 1);
  const sides = [-1, 1].map((s) =>
    translate(rotateY(stripesX(D + 0.6, 0.5, 0.06, m, 'butter', 'ivory'), Math.PI / 2), s * (W / 2 + 0.33), ROOF_Y - 0.4, 0),
  );
  return merge(front, back, sides);
}

function roof(): Geo {
  const slab = translate(softBox(W + 0.6, 0.25, D + 0.6, 0.06, 'clay'), 0, ROOF_Y, 0);
  const grid = Array.from({ length: 5 }, (_, i) => {
    const x = -W / 2 + ((i + 1) * W) / 6;
    return rope([x, ROOF_Y - 0.03, -D / 2], [x, ROOF_Y - 0.03, D / 2], 0.04, 'slate');
  });
  const lights = bulbs(Array.from({ length: 16 }, (_, i) => [-W / 2 + (i + 0.5) * (W / 16), ROOF_Y - 0.42, D / 2 + 0.4] as const));
  const sign = merge(boxAt(4, 0.8, 0.12, 'ivory', 0, ROOF_Y + 0.25, D / 2 + 0.2), boxAt(3.4, 0.4, 0.18, 'coral', 0, ROOF_Y + 0.45, D / 2 + 0.2));
  return merge(slab, lodPair(valance(17), valance(9)), grid, lights, sign);
}

function arenaBuild(): Geo {
  const floor = softBox(W, 0.12, D, 0.04, 'blueDeep');
  const postsNear = [-1, 0, 1].flatMap((sx) =>
    [-1, 1].map((sz) => post(sx * (W / 2 - 0.1), sz * (D / 2 - 0.1), ROOF_Y, 0.09, 'ivory', 8)),
  );
  const postsFar = [-1, 0, 1].flatMap((sx) =>
    [-1, 1].map((sz) => boxAt(0.18, ROOF_Y, 0.18, 'ivory', sx * (W / 2 - 0.1), 0, sz * (D / 2 - 0.1))),
  );
  return merge(floor, rail(), lodPair(merge(postsNear), merge(postsFar)), roof());
}

function carBuild(): Geo {
  const body = tintable(softBox(1.1, 0.42, 1.55, 0.14, 'coral'));
  const bumper = lodPair(
    translate(scale(torus(1, 0.09, 'slate', 4, 16), 0.62, 1, 0.84), 0, 0.14, 0),
    boxAt(1.3, 0.16, 1.75, 'slate', 0, 0.06, 0),
  );
  const back = tintable(softBox(0.9, 0.42, 0.18, 0.06, 'coral'));
  const seat = boxAt(0.7, 0.08, 0.42, 'ivory', 0, 0.42, -0.25);
  const wheel = merge(beam([0, 0.42, 0.45], [0, 0.72, 0.32], 0.04, 'slate'), boxAt(0.32, 0.04, 0.32, 'cocoa', 0, 0.72, 0.32));
  const pole = merge(beam([0, 0.8, -0.7], [0, 3.5, -0.7], 0.035, 'slate'), boxAt(0.2, 0.08, 0.1, 'butterDeep', 0, 3.5, -0.7));
  return merge(
    translate(body, 0, 0.05, 0),
    bumper,
    translate(back, 0, 0.45, -0.55),
    seat,
    lodPair(merge(wheel, pole), beam([0, 0.8, -0.7], [0, 3.5, -0.7], 0.05, 'slate')),
  );
}

export const DODGEM_PROPS: readonly PropDef[] = [
  prop('dodgem.arena', arenaBuild, [W, D], 'ride', { tags: ['funfair', 'ride'] }),
  prop('dodgem.car', carBuild, [1.3, 1.75], 'stall', {
    tint: 'coral',
    seats: [{ x: 0, y: 0.5, z: -0.25, heading: 0 }],
    tags: ['funfair', 'ride', 'moving'],
  }),
];
