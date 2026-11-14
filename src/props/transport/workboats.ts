/** Working boats: fishing trawler, harbour tug, canal barge with deck planters. */
import { type Col, type Geo, beam, blob, cone, cyl, merge, rotateZ, scale, sphere, tintable, torus, translate } from '../../core/geo';
import { type Q, boxAt, cylX, nearOnly, post, sg, soft } from './kit';
import { type HullSpec, beamAt, floorAt, hull, sheerAt } from './hull';

export const TRAWLER_HULL: HullSpec = {
  length: 9,
  beam: 3,
  draft: 0.5,
  freeboard: 0.95,
  bowRise: 0.4,
  sternRise: 0.05,
  transom: 0.7,
  floor: 0.45,
  shell: 0.08,
  round: 2.6,
  trimH: 0.14,
  hullCol: 'blue',
  trimCol: 'ivory',
  bottomCol: 'coralDeep',
  floorCol: 'timber',
};

const T_DECK = 0.45;

function wheelhouse(q: Q, z: number): Geo {
  const top = T_DECK + 1.9;
  return merge(
    translate(soft(q, 2.0, 1.9, 1.8, 0.14, 'ivory'), 0, T_DECK, z),
    translate(soft(q, 2.3, 0.14, 2.1, 0.05, 'coral'), 0, top, z),
    boxAt(1.7, 0.5, 0.04, 'blueDeep', 0, T_DECK + 1.2, z + 0.9),
    nearOnly(q, () => [
      ...[-1, 1].map((sx) => boxAt(0.04, 0.5, 1.2, 'blueDeep', sx * 1.0, T_DECK + 1.2, z)),
      ...[-0.45, 0.45].map((x) => boxAt(0.05, 0.52, 0.05, 'ivory', x, T_DECK + 1.19, z + 0.91)),
      boxAt(0.7, 1.4, 0.04, 'coralDeep', 0.4, T_DECK, z - 0.9),
      translate(rotateZ(torus(0.25, 0.05, 'coral', 4, 10), Math.PI / 2), -1.03, T_DECK + 1.0, z - 0.3),
      boxAt(0.12, 0.35, 0.12, 'butter', 0.7, top + 0.14, z - 0.5),
      translate(sphere(0.1, 'butterLight', 6, 4), 0.7, top + 0.6, z - 0.5),
    ]),
  );
}

function netDrum(q: Q, z: number): Geo {
  const y = T_DECK + 0.75;
  return merge(
    cylX(0.42, 1.5, 'sageDeep', sg(q, 12, 6), -0.75, y, z),
    ...[-0.8, 0.8].map((x) => cylX(0.55, 0.06, 'coral', sg(q, 12, 6), x - 0.03, y, z)),
    ...[-0.85, 0.85].map((x) => beam([x, T_DECK, z - 0.4], [x, y, z], 0.12, 'slate')),
    ...[-0.85, 0.85].map((x) => beam([x, T_DECK, z + 0.4], [x, y, z], 0.12, 'slate')),
    nearOnly(q, () => [
      cylX(0.45, 1.3, 'blueDeep', 12, -0.65, y, z),
      ...[-0.5, 0, 0.5].map((x) => translate(sphere(0.07, 'butter', 6, 4), x, y + 0.48, z)),
    ]),
  );
}

function gantry(q: Q, z: number): Geo {
  const h = 3.4;
  return merge(
    ...[-1.05, 1.05].map((x) => beam([x, T_DECK, z], [x * 0.85, h, z + 0.2], 0.16, 'coral')),
    beam([-0.95, h, z + 0.2], [0.95, h, z + 0.2], 0.18, 'coral'),
    nearOnly(q, () => [
      beam([0, h, z + 0.2], [0, T_DECK + 1.3, z - 0.3], 0.02, 'ivoryDeep'),
      boxAt(0.18, 0.25, 0.12, 'slate', 0, h - 0.35, z + 0.2),
    ]),
  );
}

function mast(q: Q, z: number): Geo {
  const top = 6.2;
  return merge(
    post(q, 0.08, T_DECK, top, 'ivory', 0, z),
    beam([-0.7, top - 1.4, z], [0.7, top - 1.4, z], 0.07, 'ivory'),
    beam([0, T_DECK + 1.2, z - 0.05], [0, top - 1.8, z - 2.2], 0.08, 'coral'),
    nearOnly(q, () => [
      beam([0, top, z], [0, sheerAt(TRAWLER_HULL, 4.4) + 0.05, 4.4], 0.015, 'ivoryDeep'),
      beam([0, top, z], [-1.2, T_DECK + 0.5, z - 1.0], 0.015, 'ivoryDeep'),
      beam([0, top, z], [1.2, T_DECK + 0.5, z - 1.0], 0.015, 'ivoryDeep'),
      beam([0, top, z], [0, T_DECK + 2.3, z - 3.3], 0.015, 'ivoryDeep'),
      translate(cyl(0.07, 0.05, 0.18, 'butter', 6), 0, top, z),
      ...[-0.7, 0.7].map((x) => translate(sphere(0.06, x > 0 ? 'sage' : 'coral', 6, 4), x, top - 1.35, z)),
    ]),
  );
}

function crates(q: Q, x0: number, z0: number): Geo {
  if (q.far) return boxAt(1.1, 0.6, 0.85, 'blue', x0, T_DECK, z0);
  const cols: readonly Col[] = ['blue', 'sage', 'butter', 'blueLight', 'coralLight'];
  const spots: ReadonlyArray<readonly [number, number, number]> = [
    [-0.28, 0, -0.21],
    [0.28, 0, -0.21],
    [-0.28, 0, 0.21],
    [0.28, 0, 0.21],
    [0, 0.3, 0],
  ];
  return merge(
    spots.map(([dx, dy, dz], i) => boxAt(0.52, 0.28, 0.4, cols[i % cols.length] ?? 'blue', x0 + dx, T_DECK + dy, z0 + dz)),
    [-0.12, 0.12].map((dx) => translate(blob(0.1, 0.035, 0.07, 'blueLight', 6, 4), x0 + dx, T_DECK + 0.6, z0)),
  );
}

function fenders(z: readonly number[]): Geo[] {
  return z.flatMap((zz) =>
    [-1, 1].map((sx) => {
      const x = sx * (beamAt(TRAWLER_HULL, zz, 0.6) + 0.06);
      return translate(blob(0.08, 0.18, 0.08, 'coral', 6, 4), x, 0.6, zz);
    }),
  );
}

export function trawler(q: Q): Geo {
  return merge(
    hull(q, TRAWLER_HULL),
    wheelhouse(q, 0.9),
    netDrum(q, -2.9),
    gantry(q, -3.9),
    mast(q, 2.6),
    crates(q, -0.5, -1.3),
    crates(q, 0.6, -1.6),
    nearOnly(q, () => [...fenders([-2, 0.2, 2.2]), boxAt(0.6, 0.12, 0.4, 'timberDeep', 0, T_DECK, 3.4)]),
  );
}

/* ------------------------------------------------------------------ tug */

export const TUG_HULL: HullSpec = {
  length: 6.5,
  beam: 2.6,
  draft: 0.5,
  freeboard: 0.85,
  bowRise: 0.35,
  transom: 0.75,
  floor: 0.45,
  shell: 0.08,
  round: 2.8,
  trimH: 0.13,
  hullCol: 'coral',
  trimCol: 'ivory',
  bottomCol: 'blueDeep',
  floorCol: 'timber',
};

const TUG_DECK = 0.45;

function tyreFender(q: Q, x: number, y: number, z: number): Geo {
  if (q.far) return cylX(0.24, 0.12, 'cocoa', 6, x - 0.06, y, z);
  return translate(rotateZ(torus(0.17, 0.07, 'cocoa', 4, 10), Math.PI / 2), x, y, z);
}

export function tug(q: Q): Geo {
  const houseTop = TUG_DECK + 1.0;
  const fenderZ = [-2.0, -0.7, 0.6, 1.8];
  return merge(
    hull(q, TUG_HULL),
    translate(soft(q, 1.8, 1.0, 2.8, 0.15, 'ivory'), 0, TUG_DECK, -0.2),
    translate(soft(q, 1.6, 1.0, 1.4, 0.14, 'ivory'), 0, houseTop, 0.45),
    translate(soft(q, 1.8, 0.12, 1.6, 0.05, 'blueDeep'), 0, houseTop + 1.0, 0.45),
    boxAt(1.4, 0.38, 0.04, 'blueDeep', 0, houseTop + 0.5, 1.15),
    translate(cyl(0.36, 0.32, 1.5, 'butter', sg(q, 12, 6)), 0, houseTop - 0.05, -0.9),
    translate(cyl(0.375, 0.37, 0.3, 'coral', sg(q, 12, 6)), 0, houseTop + 0.85, -0.9),
    translate(scale(cyl(1, 1, 0.5, 'cocoa', sg(q, 10, 6)), 1.1, 1, 0.35), 0, 0.35, 3.15),
    fenderZ.flatMap((z) => [-1, 1].map((sx) => tyreFender(q, sx * (beamAt(TUG_HULL, z, 0.55) + 0.06), 0.5, z))),
    nearOnly(q, () => [
      ...[-1, 1].map((sx) => boxAt(0.04, 0.38, 0.9, 'blueDeep', sx * 0.8, houseTop + 0.5, 0.45)),
      translate(cyl(0.33, 0.33, 0.06, 'cocoa', 12), 0, houseTop + 1.45, -0.9),
      cylX(0.08, 0.7, 'slate', 6, -0.35, TUG_DECK + 0.3, -2.6),
      ...[-0.3, 0.3].map((x) => translate(cyl(0.07, 0.07, 0.35, 'slate', 6), x, TUG_DECK, -2.6)),
      translate(torus(0.2, 0.04, 'butterDeep', 4, 10), 0.4, TUG_DECK + 0.05, -2.1),
      translate(cone(0.12, 0.25, 'coral', 6), 0, houseTop + 1.12, 0.6),
      translate(rotateZ(torus(0.22, 0.05, 'coral', 4, 10), Math.PI / 2), 0.92, TUG_DECK + 0.5, -0.4),
    ]),
  );
}

/* ------------------------------------------------------------------ canal barge */

export const BARGE_HULL: HullSpec = {
  length: 9,
  beam: 2.2,
  draft: 0.4,
  freeboard: 0.55,
  bowRise: 0.14,
  transom: 0.85,
  bowLen: 0.25,
  bowPow: 2.5,
  round: 5,
  floor: 0.35,
  shell: 0.06,
  trimH: 0.1,
  hullCol: 'sage',
  trimCol: 'butter',
  bottomCol: 'cocoa',
  floorCol: 'timber',
};

const B_DECK = 0.35;

function planter(q: Q, len: number, x: number, y: number, z: number, seed: number): Geo {
  const flowers: readonly Col[] = ['coral', 'butter', 'ivory', 'coralLight', 'blueLight'];
  return merge(
    boxAt(0.32, 0.22, len, 'timberDeep', x, y, z),
    translate(blob(0.18, 0.13, len / 2, 'sageDeep', sg(q, 8, 5), sg(q, 5, 3)), x, y + 0.24, z),
    nearOnly(q, () =>
      Array.from({ length: Math.round(len / 0.22) }, (_, i) => {
        const zz = z - len / 2 + 0.11 + i * 0.22;
        const dx = ((i * 37 + seed) % 5) * 0.03 - 0.06;
        return translate(sphere(0.07, flowers[(i + seed) % flowers.length] ?? 'coral', 6, 4), x + dx, y + 0.34, zz);
      }),
    ),
  );
}

export function barge(q: Q): Geo {
  const cabinY = B_DECK - 0.05;
  const roofY = cabinY + 0.95;
  return merge(
    hull(q, BARGE_HULL),
    translate(soft(q, 1.9, 0.95, 5.4, 0.12, 'ivory'), 0, cabinY, -0.9),
    tintable(boxAt(1.95, 0.16, 5.45, 'sage', 0, cabinY + 0.55, -0.9)),
    translate(soft(q, 2.0, 0.08, 5.6, 0.04, 'coralDeep'), 0, roofY, -0.9),
    planter(q, 1.6, -0.55, roofY + 0.08, -2.2, 1),
    planter(q, 1.6, 0.55, roofY + 0.08, 0.2, 3),
    planter(q, 1.0, 0.0, B_DECK, 3.0, 2),
    nearOnly(q, () => [
      ...[-1, 1].flatMap((sx) => [-2.8, -1.6, -0.4, 0.8].map((z) => boxAt(0.04, 0.24, 0.3, 'blueDeep', sx * 0.96, cabinY + 0.5, z))),
      translate(cyl(0.06, 0.06, 0.5, 'cocoa', 6), 0.55, roofY + 0.08, -3.1),
      boxAt(0.5, 0.75, 0.04, 'coral', 0, cabinY, 1.86),
      beam([0, 0.75, -4.0], [0, 0.6, -4.7], 0.06, 'timberDeep'),
      ...[-0.45, 0.45].map((x) => translate(cyl(0.18, 0.15, 0.3, 'coralDeep', 8), x, B_DECK, 2.2)),
      ...[-0.45, 0.45].map((x) => translate(sphere(0.17, 'sage', 6, 4), x, B_DECK + 0.38, 2.2)),
    ]),
  );
}

/** Deck heights used for standing / seat anchors. */
export const WORKBOAT_DECKS = {
  trawler: T_DECK,
  tug: TUG_DECK,
  barge: B_DECK,
  trawlerFloorAt: (z: number): number => floorAt(TRAWLER_HULL, z),
} as const;
