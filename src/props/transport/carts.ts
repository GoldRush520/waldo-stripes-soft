/**
 * Pushed carts. Every cart's push handle sits toward -z (the pusher stands behind it facing +z);
 * handle positions are exported for the PropDefs.
 */
import { type Col, type Geo, beam, blob, cyl, dome, merge, scale, sphere, tintable, translate } from '../../core/geo';
import { type Q, type V3, boxAt, caster, cylX, nearOnly, sg, soft, tray, wheel } from './kit';

/* ------------------------------------------------------------------ hand cart */

export const HAND_CART_HANDLE: V3 = [0, 0.85, -1.35];
const BED_Y = 0.5;

function handCartBase(q: Q, body: Col): Geo {
  return merge(
    [-0.56, 0.56].map((x) => translate(wheel(q, 0.45, 0.07, { tyre: 'timberDeep', hub: 'timber', spokes: 8 }), x, 0, -0.05)),
    cylX(0.035, 1.12, 'slate', sg(q, 6, 4), -0.56, 0.45, -0.05),
    translate(q.far ? boxAt(1.0, 0.3, 1.3, body, 0, 0, 0) : tray(1.0, 1.3, 1.0, 1.3, 0.3, 0.035, body, 'timber', 'timberDeep'), 0, BED_Y, 0),
    [-0.3, 0.3].map((x) => beam([x, BED_Y + 0.05, -0.6], [x, HAND_CART_HANDLE[1], HAND_CART_HANDLE[2]], 0.05, 'timberDeep')),
    cylX(0.025, 0.7, 'timberDeep', sg(q, 6, 4), -0.35, HAND_CART_HANDLE[1], HAND_CART_HANDLE[2]),
    beam([0, BED_Y, 0.6], [0, 0, 0.62], 0.05, 'timberDeep'),
    nearOnly(q, () =>
      [-1, 1].flatMap((sx) => [-0.4, 0.4].map((z) => boxAt(0.02, 0.28, 0.05, 'slate', sx * 0.51, BED_Y + 0.01, z))),
    ),
  );
}

export function handCart(q: Q, loaded: boolean): Geo {
  const top = BED_Y + 0.04;
  const load = loaded
    ? q.far
      ? [translate(scale(dome(1, 'clay', 6, 3), 0.48, 0.45, 0.6), 0, top, 0)]
      : [
          ...[-0.22, 0.22].map((x) => translate(blob(0.2, 0.15, 0.3, 'clay', 8, 5), x, top + 0.12, -0.3)),
          translate(blob(0.2, 0.15, 0.3, 'butterLight', 8, 5), 0, top + 0.36, -0.25),
          boxAt(0.4, 0.3, 0.35, 'blue', -0.2, top, 0.35),
          boxAt(0.36, 0.25, 0.3, 'sage', 0.22, top, 0.3),
          boxAt(0.32, 0.22, 0.3, 'butter', 0.0, top + 0.3, 0.35),
          tintable(boxAt(0.9, 0.03, 0.6, 'coral', 0, top + 0.52, 0.35)),
          beam([-0.48, top + 0.25, -0.3], [0.48, top + 0.25, -0.3], 0.025, 'butterDeep'),
        ]
    : [];
  return merge(handCartBase(q, loaded ? 'sage' : 'clay'), load);
}

/* ------------------------------------------------------------------ flower cart */

const FLOWER: readonly Col[] = ['coral', 'butter', 'ivory', 'coralLight', 'blueLight', 'butterLight'];

function bucket(q: Q, x: number, y: number, z: number, i: number): Geo {
  return merge(
    q.far ? [] : [translate(cyl(0.12, 0.1, 0.2, 'slate', 5), x, y, z)],
    q.far
      ? translate(scale(sphere(0.17, FLOWER[i % FLOWER.length] ?? 'coral', 4, 3), 1, 1.6, 1), x, y + 0.24, z)
      : merge(
          translate(sphere(0.15, 'sage', 5, 4), x, y + 0.27, z),
          [0, 1, 2].map((k) =>
            translate(sphere(0.07, FLOWER[(i + k) % FLOWER.length] ?? 'coral', 5, 3), x + (k - 1) * 0.08, y + 0.4 + (k % 2) * 0.04, z + (k === 1 ? 0.05 : -0.03)),
          ),
        ),
  );
}

export function flowerCart(q: Q): Geo {
  const top = BED_Y + 0.04;
  return merge(
    handCartBase(q, 'sage'),
    tintable(boxAt(1.02, 0.08, 1.32, 'sage', 0, BED_Y + 0.22, 0)),
    boxAt(0.9, 0.22, 0.45, 'timber', 0, top, 0.2),
    [-0.32, 0, 0.32].map((x, i) => bucket(q, x, top + 0.22, 0.25, i)),
    [-0.32, 0, 0.32].map((x, i) => bucket(q, x, top, -0.3, i + 3)),
    nearOnly(q, () => boxAt(0.5, 0.18, 0.03, 'ivory', 0, BED_Y + 0.05, 0.67)),
  );
}

/* ------------------------------------------------------------------ bread cart */

export const BREAD_CART_HANDLE: V3 = [0, 0.95, -0.95];

export function breadCart(q: Q): Geo {
  const y0 = 0.3;
  return merge(
    [-0.45, 0.45].map((x) => translate(wheel(q, 0.3, 0.05, { spokes: 6 }), x, 0, -0.2)),
    translate(caster(q, 0.08, 0.04), 0, 0, 0.5),
    beam([0, y0, 0.45], [0, 0.08, 0.5], 0.04, 'slate'),
    tintable(translate(soft(q, 0.8, 0.75, 1.1, 0.08, 'butter'), 0, y0, 0)),
    boxAt(0.82, 0.12, 1.12, 'ivory', 0, y0 + 0.45, 0),
    translate(soft(q, 0.86, 0.06, 1.16, 0.03, 'timber'), 0, y0 + 0.75, 0),
    [-0.25, 0.25].map((x) => beam([x, y0 + 0.5, -0.55], [x, BREAD_CART_HANDLE[1], BREAD_CART_HANDLE[2]], 0.04, 'slate')),
    cylX(0.022, 0.6, 'slate', sg(q, 6, 4), -0.3, BREAD_CART_HANDLE[1], BREAD_CART_HANDLE[2]),
    nearOnly(q, () => [
      ...[-0.2, 0.05, 0.3].map((z, i) => translate(blob(0.13, 0.07, 0.07, i === 1 ? 'butterDeep' : 'clay', 8, 5), -0.15, y0 + 0.85, z)),
      ...[-0.2, 0.1].map((z) => translate(blob(0.06, 0.06, 0.2, 'butterDeep', 6, 4), 0.2, y0 + 0.86, z)),
      boxAt(0.4, 0.15, 0.02, 'coral', 0, y0 + 0.2, 0.56),
      boxAt(0.02, 0.4, 0.02, 'slate', 0, y0 + 0.15, 0.565),
    ]),
  );
}

/* ------------------------------------------------------------------ wheelbarrow */

export const WHEELBARROW_HANDLE: V3 = [0, 0.5, -0.95];
export type BarrowLoad = 'empty' | 'soil' | 'bricks';

function bricks(q: Q, y: number): Geo {
  if (q.far) return boxAt(0.42, 0.18, 0.5, 'coralDeep', 0, y, 0.05);
  const cols: readonly Col[] = ['coralDeep', 'clayDeep', 'coral'];
  return merge(
    [0, 1, 2].flatMap((row) =>
      [-0.11, 0.11].flatMap((x) =>
        [-0.13, 0.13].map((z, k) => boxAt(0.2, 0.065, 0.24, cols[(row + k) % cols.length] ?? 'coralDeep', x + (row % 2) * 0.01, y + row * 0.07, z + 0.05)),
      ),
    ),
  );
}

export function wheelbarrow(q: Q, load: BarrowLoad): Geo {
  const ty = 0.28;
  const content =
    load === 'soil'
      ? [translate(scale(dome(1, 'timberDeep', sg(q, 10, 6), sg(q, 4, 2)), 0.3, 0.12, 0.42), 0, ty + 0.25, 0.05)]
      : load === 'bricks'
        ? [bricks(q, ty + 0.05)]
        : [];
  return merge(
    translate(wheel(q, 0.18, 0.07, { spokes: 6 }), 0, 0, 0.62),
    translate(q.far ? boxAt(0.6, 0.3, 0.85, 'sage', 0, 0, 0) : tray(0.66, 0.92, 0.42, 0.58, 0.32, 0.025, 'sage', 'sageDeep'), 0, ty, 0.05),
    [-1, 1].map((sx) => beam([sx * 0.22, ty, 0.62], [sx * 0.27, WHEELBARROW_HANDLE[1], WHEELBARROW_HANDLE[2]], 0.04, 'timberDeep')),
    [-1, 1].map((sx) => beam([sx * 0.2, ty + 0.02, -0.25], [sx * 0.22, 0, -0.3], 0.04, 'timberDeep')),
    content,
    nearOnly(q, () => [
      ...[-1, 1].map((sx) => cylX(0.024, 0.1, 'cocoa', 6, sx * 0.27 - 0.05, WHEELBARROW_HANDLE[1], WHEELBARROW_HANDLE[2] + 0.05)),
      beam([-0.22, 0.18, 0.62], [0.22, 0.18, 0.62], 0.025, 'slate'),
    ]),
  );
}
