/** Luggage trolley (+ seeded suitcase heap), porter's sack truck, shopping trolley. Handles toward -z. */
import { type Col, type Geo, beam, blob, merge, rotateY, tintable, translate } from '../../core/geo';
import { createRng } from '../../core/rng';
import { type Q, type V3, boxAt, caster, cylX, nearOnly, sg, soft, tray, wheel } from './kit';

export const LUGGAGE_HANDLE: V3 = [0, 1.02, -0.52];
const DECK_Y = 0.14;

export function luggageTrolley(q: Q): Geo {
  return merge(
    q.far ? [] : [-0.24, 0.24].flatMap((x) => [-0.35, 0.35].map((z) => translate(caster(q, 0.06, 0.04), x, 0, z))),
    boxAt(0.62, 0.05, 0.9, 'slate', 0, DECK_Y - 0.05, 0),
    tintable(boxAt(0.64, 0.03, 0.92, 'blue', 0, DECK_Y, 0)),
    boxAt(0.6, 0.12, 0.04, 'slate', 0, DECK_Y, 0.44),
    [-0.28, 0.28].map((x) => beam([x, DECK_Y, -0.42], [x, LUGGAGE_HANDLE[1], LUGGAGE_HANDLE[2]], 0.04, 'slate')),
    cylX(0.025, 0.62, 'cocoa', sg(q, 6, 4), -0.31, LUGGAGE_HANDLE[1], LUGGAGE_HANDLE[2]),
    nearOnly(q, () => [
      beam([-0.28, 0.6, -0.47], [0.28, 0.6, -0.47], 0.03, 'slate'),
      beam([-0.28, 0.35, -0.44], [0.28, 0.35, -0.44], 0.03, 'slate'),
    ]),
  );
}

const CASE_COLS: readonly Col[] = ['blue', 'sage', 'butter', 'clay', 'coralLight'];

interface CaseSpec {
  readonly w: number;
  readonly h: number;
  readonly d: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rot: number;
  readonly col: Col;
  readonly tint: boolean;
}

/** Deterministic suitcase layout: stacked in layers inside a 0.6 x 0.86 footprint. */
export function caseLayout(count: number, seed: number): CaseSpec[] {
  const rng = createRng(mixKey(seed));
  const out: CaseSpec[] = [];
  let y = 0;
  let i = 0;
  while (i < count) {
    const two = count - i >= 2 && rng.chance(0.6);
    const layerH = rng.range(0.18, 0.28);
    const items = two ? [-0.22, 0.22] : [0];
    for (const z of items) {
      if (i >= count) break;
      out.push({
        w: rng.range(0.42, 0.56),
        h: layerH - rng.range(0, 0.04),
        d: two ? rng.range(0.32, 0.4) : rng.range(0.55, 0.75),
        x: rng.range(-0.03, 0.03),
        y,
        z: z + rng.range(-0.02, 0.02),
        rot: rng.range(-0.12, 0.12),
        col: rng.pick(CASE_COLS),
        tint: rng.chance(0.5),
      });
      i++;
    }
    y += layerH;
  }
  return out;
}

function mixKey(seed: number): number {
  return (seed * 2654435761) >>> 0 || 7;
}

/** A heap of suitcases resting on y = 0 (half of them tint-masked). */
export function suitcases(q: Q, count: number, seed: number): Geo {
  return merge(
    caseLayout(count, seed).map((c) => {
      const body = soft(q, c.w, c.h, c.d, 0.04, c.col);
      const parts = [
        c.tint ? tintable(body) : body,
        ...nearOnly(q, () => boxAt(0.14, 0.035, 0.03, 'cocoa', 0, c.h, 0)),
      ];
      return translate(rotateY(merge(parts), c.rot), c.x, c.y, c.z);
    }),
  );
}

export function luggageTrolleyHeaped(q: Q, count = 5, seed = 11): Geo {
  return merge(luggageTrolley(q), translate(suitcases(q, count, seed), 0, DECK_Y + 0.03, 0.02));
}

/* ------------------------------------------------------------------ sack truck */

export const SACK_TRUCK_HANDLE: V3 = [0, 1.28, -0.2];

export function sackTruck(q: Q): Geo {
  return merge(
    [-0.24, 0.24].map((x) => translate(wheel(q, 0.13, 0.06, { disc: 'ivoryShade' }), x, 0, -0.06)),
    nearOnly(q, () => cylX(0.02, 0.48, 'slate', 6, -0.24, 0.13, -0.06)),
    nearOnly(q, () => boxAt(0.42, 0.02, 0.24, 'slate', 0, 0, 0.1)),
    [-0.18, 0.18].map((x) => beam([x, 0.02, 0.0], [x, SACK_TRUCK_HANDLE[1], SACK_TRUCK_HANDLE[2]], 0.04, 'coral')),
    q.far
      ? beam([-0.2, SACK_TRUCK_HANDLE[1], SACK_TRUCK_HANDLE[2]], [0.2, SACK_TRUCK_HANDLE[1], SACK_TRUCK_HANDLE[2]], 0.05, 'cocoa')
      : cylX(0.024, 0.4, 'cocoa', 6, -0.2, SACK_TRUCK_HANDLE[1], SACK_TRUCK_HANDLE[2]),
    q.far
      ? translate(blob(0.2, 0.32, 0.14, 'clay', 5, 3), 0, 0.36, 0.1)
      : [
          translate(blob(0.2, 0.32, 0.14, 'clay', 8, 5), 0, 0.36, 0.1),
          translate(blob(0.18, 0.26, 0.13, 'butterLight', 8, 5), 0, 0.92, 0.0),
          ...[0.35, 0.7, 1.0].map((y) => beam([-0.18, y, -y * 0.16], [0.18, y, -y * 0.16], 0.025, 'coral')),
        ],
  );
}

/* ------------------------------------------------------------------ shopping trolley */

export const SHOPPING_HANDLE: V3 = [0, 1.0, -0.52];

export function shoppingTrolley(q: Q): Geo {
  const by = 0.45;
  return merge(
    q.far ? [] : [-0.22, 0.22].flatMap((x) => [-0.35, 0.35].map((z) => translate(caster(q, 0.06, 0.035), x, 0, z))),
    [-0.22, 0.22].map((x) => beam([x, 0.12, 0.38], [x, by, -0.35], 0.03, 'ivoryDeep')),
    [-0.22, 0.22].map((x) => beam([x, 0.12, -0.35], [x, 0.12, 0.38], 0.03, 'ivoryDeep')),
    translate(q.far ? boxAt(0.55, 0.45, 0.85, 'blueLight', 0, 0, 0) : tray(0.56, 0.86, 0.44, 0.7, 0.45, 0.015, 'blueLight', 'blueLight', 'ivoryDeep'), 0, by, 0),
    [-0.26, 0.26].map((x) => beam([x, by + 0.42, -0.42], [x, SHOPPING_HANDLE[1], SHOPPING_HANDLE[2]], 0.03, 'ivoryDeep')),
    tintable(cylX(0.025, 0.56, 'coral', sg(q, 6, 4), -0.28, SHOPPING_HANDLE[1], SHOPPING_HANDLE[2])),
    nearOnly(q, () => [
      ...[0.15, 0.3].map((dy) => beam([-0.27, by + dy, 0.43], [0.27, by + dy, 0.43], 0.012, 'ivoryDeep')),
      ...[-0.15, 0.15].map((z) => beam([0.285, by + 0.1, z], [0.285, by + 0.4, z], 0.012, 'ivoryDeep')),
      ...[-0.15, 0.15].map((z) => beam([-0.285, by + 0.1, z], [-0.285, by + 0.4, z], 0.012, 'ivoryDeep')),
      boxAt(0.5, 0.02, 0.6, 'ivoryDeep', 0, 0.15, 0),
    ]),
  );
}
