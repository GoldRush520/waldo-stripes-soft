/** Leisure boats: gondola, swan pedal boat, plain pedalo, canopied water taxi. */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  merge,
  profile,
  rotateX,
  rotateY,
  sphere,
  tintable,
  translate,
  tube,
} from '../../core/geo';
import { type Q, type V2, type V3, boxAt, nearOnly, post, sg, soft } from './kit';
import { type HullSpec, hull, hullDeck, sheerAt } from './hull';
import { thwart } from './boats-small';

export const GONDOLA_HULL: HullSpec = {
  length: 6.4,
  beam: 1.25,
  draft: 0.22,
  freeboard: 0.32,
  bowRise: 0.55,
  sternRise: 0.4,
  bowLen: 0.4,
  bowPow: 1.4,
  transom: 0.03,
  floor: -0.06,
  shell: 0.04,
  trimH: 0.06,
  hullCol: 'blueDeep',
  trimCol: 'butter',
  innerCol: 'coralDeep',
  floorCol: 'timber',
};

/** Ferro: the comb-toothed prow ornament, drawn as a side profile in the yz plane. */
function ferro(q: Q): Geo {
  const teeth = q.far ? 2 : 6;
  const front: V2[] = Array.from({ length: teeth }, (_, i): V2[] => {
    const y = 0.12 + i * 0.09;
    return [
      [0.1, y],
      [0.24, y + 0.025],
      [0.1, y + 0.05],
    ];
  }).flat();
  const pts: V2[] = [[0, 0], [0.1, 0.05], ...front, [0.12, 0.7], [0.26, 0.74], [0.3, 0.84], [0.02, 0.8], [-0.04, 0.4]];
  return rotateY(profile(pts, 0.03, 'ivoryShade'), -Math.PI / 2);
}

function curl(): Geo {
  return rotateY(
    profile(
      [
        [0, 0],
        [-0.12, 0.2],
        [-0.05, 0.3],
        [0.05, 0.22],
        [0.04, 0.05],
      ],
      0.04,
      'butter',
    ),
    -Math.PI / 2,
  );
}

export function gondola(q: Q): Geo {
  const bowZ = GONDOLA_HULL.length / 2;
  const sternZ = -bowZ;
  return merge(
    hull(q, GONDOLA_HULL),
    translate(ferro(q), 0, sheerAt(GONDOLA_HULL, bowZ) - 0.12, bowZ - 0.08),
    translate(curl(), 0, sheerAt(GONDOLA_HULL, sternZ) - 0.08, sternZ + 0.04),
    hullDeck(q, GONDOLA_HULL, 0.04, 0.16, 0.3, 'timber'),
    hullDeck(q, GONDOLA_HULL, 0.82, 0.93, 0.3, 'timber'),
    translate(soft(q, 0.9, 0.22, 0.55, 0.08, 'coral'), 0, -0.04, -0.35),
    translate(soft(q, 0.9, 0.4, 0.14, 0.05, 'coral'), 0, 0.14, -0.68),
    nearOnly(q, () => [
      boxAt(0.8, 0.04, 0.5, 'butterLight', 0, 0.18, -0.35),
      beam([0.5, 0.33, -1.8], [0.52, 0.75, -1.85], 0.07, 'timberDeep'),
      thwart(GONDOLA_HULL, 0.9, 0.16, 0.3),
      boxAt(0.25, 0.04, 0.9, 'coralDeep', 0, -0.03, 0.6),
    ]),
  );
}

/* ------------------------------------------------------------------ swan pedal boat */

export const SWAN_HULL: HullSpec = {
  length: 2.4,
  beam: 1.5,
  draft: 0.2,
  freeboard: 0.36,
  bowRise: 0.05,
  transom: 0.7,
  round: 3,
  floor: -0.02,
  shell: 0.05,
  hullCol: 'ivory',
  trimCol: 'butter',
  innerCol: 'ivoryShade',
  floorCol: 'blueLight',
  tint: false,
};

/** Curved swan neck + head + beak rising from `base`, scaled by `scaleK` (1 = pedal-boat size). */
export function swanNeck(q: Q, base: V3, scaleK: number): Geo {
  const k = scaleK;
  const p = (x: number, y: number, z: number): V3 => [base[0] + x * k, base[1] + y * k, base[2] + z * k];
  const path: V3[] = [p(0, 0, 0), p(0, 0.6, 0.1), p(0, 1.05, -0.05), p(0, 1.2, 0.2)];
  const neck = q.far ? tube([path[0] ?? p(0, 0, 0), path[2] ?? p(0, 1, 0), path[3] ?? p(0, 1, 0)], 0.09 * k, 'ivory', 5) : tube(path, 0.09 * k, 'ivory', 5, true);
  const head = translate(blob(0.13 * k, 0.12 * k, 0.17 * k, 'ivory', sg(q, 8, 5), sg(q, 6, 4)), ...p(0, 1.2, 0.28));
  const beak = translate(rotateX(cone(0.05 * k, 0.2 * k, 'coral', sg(q, 6, 4)), Math.PI / 2), ...p(0, 1.18, 0.42));
  return merge(
    neck,
    head,
    beak,
    nearOnly(q, () =>
      [-1, 1].map((sx) => translate(box(0.05 * k, 0.05 * k, 0.05 * k, 'ink'), ...p(sx * 0.1, 1.22, 0.34))),
    ),
  );
}

function swanWings(q: Q, y: number, z: number, k: number, x: number): Geo[] {
  return [-1, 1].map((sx) =>
    translate(blob(0.18 * k, 0.32 * k, 0.75 * k, 'ivory', sg(q, 7, 5), sg(q, 5, 3)), sx * x, y, z),
  );
}

export function swanBoat(q: Q): Geo {
  return merge(
    hull(q, SWAN_HULL),
    swanNeck(q, [0, 0.3, 0.85], 1),
    swanWings(q, 0.42, -0.15, 1, 0.68),
    translate(rotateX(cone(0.2, 0.45, 'ivory', sg(q, 8, 4)), -0.9), 0, 0.35, -1.1),
    thwart(SWAN_HULL, -0.1, 0.25, 0.4),
    boxAt(1.1, 0.4, 0.1, 'butter', 0, 0.25, -0.38),
    nearOnly(q, () => [
      ...[-0.3, 0.3].map((x) => boxAt(0.12, 0.08, 0.1, 'slate', x, 0.02, 0.5)),
      boxAt(0.9, 0.05, 0.12, 'timberDeep', 0, -0.0, 0.5),
    ]),
  );
}

/** Plain two-pontoon pedalo with a moulded bench. */
export function pedalo(q: Q): Geo {
  const pontoon = (x: number): Geo =>
    tintable(translate(blob(0.3, 0.26, 1.3, 'blue', sg(q, 10, 6), sg(q, 7, 4)), x, 0.04, 0));
  return merge(
    pontoon(-0.62),
    pontoon(0.62),
    boxAt(1.5, 0.06, 1.7, 'ivory', 0, 0.22, -0.05),
    translate(soft(q, 1.1, 0.25, 0.45, 0.08, 'butter'), 0, 0.28, -0.3),
    translate(soft(q, 1.1, 0.45, 0.1, 0.04, 'butter'), 0, 0.28, -0.55),
    nearOnly(q, () => [
      ...[-0.25, 0.25].map((x) => boxAt(0.12, 0.1, 0.1, 'slate', x, 0.28, 0.45)),
      boxAt(1.0, 0.05, 0.05, 'timberDeep', 0, 0.5, 0.75),
    ]),
  );
}

/* ------------------------------------------------------------------ water taxi */

export const TAXI_HULL: HullSpec = {
  length: 6.2,
  beam: 2.2,
  draft: 0.32,
  freeboard: 0.55,
  bowRise: 0.2,
  transom: 0.75,
  floor: 0.0,
  shell: 0.06,
  round: 2.6,
  hullCol: 'ivory',
  trimCol: 'blue',
  bottomCol: 'blueDeep',
  floorCol: 'timber',
  tint: false,
};

export const TAXI_BENCH_Z: readonly number[] = [-1.9, -0.9, 0.1, 1.1];
export const TAXI_BENCH_Y = 0.42;

function canopy(q: Q): Geo {
  const y0 = 2.15;
  const stripes = q.far ? 3 : 7;
  const len = 4.4;
  const w = len / stripes;
  return merge(
    Array.from({ length: stripes }, (_, i) => {
      const b = boxAt(2.1, 0.08, w, i % 2 === 0 ? 'coral' : 'ivory', 0, y0, -2.4 + w * (i + 0.5));
      return i % 2 === 0 ? tintable(b) : b;
    }),
    nearOnly(q, () =>
      [-1, 1].map((sx) => tintable(boxAt(0.03, 0.14, len, 'coral', sx * 1.06, y0 - 0.1, -0.2))),
    ),
  );
}

export function waterTaxi(q: Q): Geo {
  const posts: ReadonlyArray<readonly [number, number]> = [
    [-0.88, -2.3],
    [0.88, -2.3],
    [-0.85, 1.2],
    [0.85, 1.2],
  ];
  return merge(
    hull(q, TAXI_HULL),
    TAXI_BENCH_Z.map((z) => thwart(TAXI_HULL, z, TAXI_BENCH_Y, 0.42)),
    posts.map(([x, z]) => (q.far ? boxAt(0.08, 1.86, 0.08, 'ivoryDeep', x, 0.3, z) : post(q, 0.04, 0.3, 2.16, 'ivoryDeep', x, z))),
    canopy(q),
    boxAt(0.45, 0.75, 0.35, 'blue', 0.4, 0.0, 1.85),
    nearOnly(q, () => [
      ...TAXI_BENCH_Z.map((z) => boxAt(1.4, 0.35, 0.05, 'timberDeep', 0, TAXI_BENCH_Y + 0.02, z - 0.22)),
      boxAt(0.4, 0.04, 0.3, 'blueDeep', 0.4, 0.75, 1.85),
      translate(rotateX(cone(0.12, 0.04, 'cocoa', 8), -0.6), 0.4, 0.82, 1.75),
      boxAt(0.6, 0.25, 0.04, 'blueLight', 0, 0.6, 2.4),
      ...TAXI_BENCH_Z.map((z) => boxAt(1.3, 0.05, 0.36, 'coralLight', 0, TAXI_BENCH_Y, z)),
      ...[-1, 1].flatMap((sx) => [-1.4, 0.4].map((z) => translate(blob(0.07, 0.16, 0.07, 'blue', 6, 4), sx * 1.13, 0.3, z))),
    ]),
  );
}
