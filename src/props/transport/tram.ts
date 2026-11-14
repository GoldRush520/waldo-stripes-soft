/**
 * Heritage tram car (9.5 x 2.4 x 3.3 m) and an open-sided summer trailer car.
 *
 * The tram's window band is real posts with open gaps between them so seated passengers on the
 * longitudinal benches are visible. Body below the waist is tint-masked; waist rail ivory.
 */
import { type Col, type Geo, beam, box, merge, rotateY, sphere, tintable, translate } from '../../core/geo';
import { type Q, type V2, type V3, boxAt, cylX, cylZ, floorPlate, lid, nearOnly, outlineFrames, post, roundRect, sg, soft, wallLoop } from './kit';

export const TRAM_LEN = 9.5;
export const TRAM_W = 2.4;
export const TRAM_FLOOR = 0.75;
export const TRAM_BENCH_Y = TRAM_FLOOR + 0.45;
const WAIST = 1.5;
const WIN_TOP = 2.5;
const EAVE = 2.85;
const ROOF_TOP = 3.12;
const END_R = 0.95;

/** Bench seat z positions (6 per side) and standing spots along the aisle. */
export const TRAM_SEAT_Z: readonly number[] = [-3.0, -1.8, -0.6, 0.6, 1.8, 3.0];
export const TRAM_STAND_Z: readonly number[] = [-2.4, -0.8, 0.8, 2.4];
export const TRAM_BENCH_X = 0.84;

function outline(q: Q, inflate = 0): V2[] {
  return roundRect(TRAM_W + inflate * 2, TRAM_LEN + inflate * 2, END_R + inflate, q.far ? 1 : 3);
}

/** Window posts: every outline vertex on the rounded ends plus evenly spaced posts along the sides. */
function windowPosts(q: Q): Geo[] {
  const ends = outlineFrames(outline(q)).filter(([, z]) => Math.abs(z) > TRAM_LEN / 2 - END_R - 0.01);
  const straight = TRAM_LEN / 2 - END_R;
  const n = q.far ? 3 : 7;
  const sides = [-1, 1].flatMap((sx) =>
    Array.from({ length: n - 1 }, (_, i): readonly [number, number, number] => [
      (sx * TRAM_W) / 2,
      -straight + ((i + 1) * 2 * straight) / n,
      0,
    ]),
  );
  const h = WIN_TOP - WAIST;
  return [...ends, ...sides].map(([x, z, a]) => translate(rotateY(box(0.1, h, 0.12, 'ivoryShade'), a), x * 0.985, WAIST, z * 0.995));
}

function bogie(q: Q, z: number): Geo {
  const wheels = q.far
    ? []
    : [-1, 1].flatMap((sx) => [-0.75, 0.75].map((dz) => cylX(0.33, 0.1, 'slate', 10, sx * 0.72 - 0.05, 0.33, z + dz)));
  return merge(boxAt(1.7, 0.3, 2.2, 'cocoa', 0, 0.22, z), wheels);
}

function benches(q: Q): Geo[] {
  return [-1, 1].flatMap((sx) => [
    boxAt(0.45, 0.45, 7.0, 'timber', sx * (TRAM_BENCH_X + 0.03), TRAM_FLOOR, 0),
    ...nearOnly(q, () => boxAt(0.06, 0.42, 7.0, 'timberDeep', sx * 1.08, TRAM_BENCH_Y, 0)),
  ]);
}

function cabEnd(q: Q, dir: number): Geo[] {
  const z = dir * (TRAM_LEN / 2 - 0.45);
  return [
    translate(cylZ(0.13, 0.08, 'butterLight', sg(q, 10, 5), 0, 1.15, 0), 0, 0, dir * (TRAM_LEN / 2 + 0.02)),
    boxAt(1.3, 0.32, 0.06, 'ivory', 0, WIN_TOP + 0.02, dir * (TRAM_LEN / 2 + 0.03)),
    ...nearOnly(q, () => [
      boxAt(0.3, 0.9, 0.3, 'slate', -0.45, TRAM_FLOOR, z),
      beam([-0.45, TRAM_FLOOR + 0.9, z], [-0.3, TRAM_FLOOR + 0.95, z], 0.04, 'butterDeep'),
      ...[0, 1, 2, 3, 4].map((i) => boxAt(0.14, 0.14, 0.02, 'ink', -0.4 + i * 0.2, WIN_TOP + 0.11, dir * (TRAM_LEN / 2 + 0.07))),
      boxAt(1.8, 0.1, 0.25, 'slate', 0, 0.42, dir * (TRAM_LEN / 2 + 0.1)),
    ]),
  ];
}

function trolleyPole(q: Q): Geo {
  const base: V3 = [0, ROOF_TOP + 0.1, -1.6];
  const tip: V3 = [0, 5.6, -4.5];
  return merge(
    boxAt(0.5, 0.12, 0.5, 'slate', 0, ROOF_TOP, -1.6),
    beam(base, tip, q.far ? 0.08 : 0.05, 'slate'),
    nearOnly(q, () => [cylX(0.06, 0.06, 'cocoa', 8, -0.03, tip[1], tip[2]), beam([0, ROOF_TOP + 0.15, -1.6], [0, ROOF_TOP + 0.15, 3.0], 0.03, 'butterDeep')]),
  );
}

function interior(q: Q): Geo[] {
  return nearOnly(q, () => [
    ...[-0.45, 0.45].map((x) => beam([x, WIN_TOP - 0.05, -3.5], [x, WIN_TOP - 0.05, 3.5], 0.03, 'butterDeep')),
    ...[-0.45, 0.45].flatMap((x) => [-2.4, -0.8, 0.8, 2.4].map((z) => beam([x, WIN_TOP - 0.05, z], [x, WIN_TOP - 0.4, z], 0.02, 'cocoa'))),
    floorPlate(outline(q, -0.08), TRAM_FLOOR + 0.01, 'timberDeep'),
  ]);
}

export function tramCar(q: Q, bodyCol: Col = 'coral'): Geo {
  const ol = outline(q);
  return merge(
    bogie(q, -3.0),
    bogie(q, 3.0),
    boxAt(TRAM_W - 0.3, 0.2, TRAM_LEN - 1.0, 'slate', 0, 0.52, 0),
    q.far ? floorPlate(outline(q, -0.08), TRAM_FLOOR + 0.01, 'timberDeep') : [],
    tintable(wallLoop(ol, 0.55, WAIST, 0.06, bodyCol, { inCol: 'ivoryShade', rimCol: 'ivory' })),
    wallLoop(outline(q, 0.02), WAIST, WAIST + 0.12, 0.08, 'ivory'),
    windowPosts(q),
    tintable(wallLoop(ol, WIN_TOP, EAVE, 0.06, bodyCol, { inCol: 'ivoryShade', rimCol: bodyCol })),
    lid(outline(q, 0.1), EAVE, ROOF_TOP, 0.55, 'ivoryDeep'),
    translate(soft(q, 1.1, 0.16, 6.2, 0.06, 'ivoryShade'), 0, ROOF_TOP - 0.02, 0),
    [-1, 1].map((sx) => boxAt(0.28, 0.05, 7.6, 'timberDeep', sx * (TRAM_W / 2 + 0.12), 0.34, 0)),
    benches(q),
    cabEnd(q, 1),
    cabEnd(q, -1),
    trolleyPole(q),
    interior(q),
    nearOnly(q, () => [
      ...[-1, 1].map((sx) => boxAt(0.02, 0.1, 7.0, 'butter', sx * (TRAM_W / 2 + 0.005), 0.95, 0)),
      translate(sphere(0.08, 'butter', 6, 4), 0, ROOF_TOP + 0.2, 4.0),
    ]),
  );
}

/* ------------------------------------------------------------------ summer trailer */

export const TRAILER_LEN = 8.0;
export const TRAILER_BENCH_Z: readonly number[] = Array.from({ length: 6 }, (_, i) => -2.9 + i * 1.16);
export const TRAILER_SEAT_Y = TRAM_FLOOR + 0.45;

function canopy(q: Q): Geo {
  const n = q.far ? 4 : 8;
  const len = TRAILER_LEN + 0.3;
  const w = len / n;
  return merge(
    Array.from({ length: n }, (_, i) => {
      const b = boxAt(2.5, 0.1, w, i % 2 === 0 ? 'coral' : 'ivory', 0, 2.95, -len / 2 + w * (i + 0.5));
      return i % 2 === 0 ? tintable(b) : b;
    }),
    nearOnly(q, () => [-1, 1].map((sx) => tintable(boxAt(0.04, 0.18, len, 'coral', sx * 1.27, 2.8, 0)))),
    translate(soft(q, 1.6, 0.14, len - 0.4, 0.05, 'ivory'), 0, 3.05, 0),
  );
}

function crossBench(q: Q, z: number): Geo[] {
  return [
    boxAt(2.0, 0.08, 0.42, 'timber', 0, TRAILER_SEAT_Y - 0.08, z),
    ...nearOnly(q, () => [
      boxAt(2.0, 0.42, 0.06, 'timberDeep', 0, TRAILER_SEAT_Y, z - 0.24),
      ...[-0.9, 0.9].map((x) => boxAt(0.06, 0.37, 0.36, 'slate', x, TRAM_FLOOR, z)),
    ]),
  ];
}

export function summerTrailer(q: Q): Geo {
  const half = TRAILER_LEN / 2;
  const postZ = q.far ? [-half + 0.2, half - 0.2] : [-half + 0.2, -half / 3, half / 3, half - 0.2];
  return merge(
    bogie(q, -2.6),
    bogie(q, 2.6),
    boxAt(2.1, 0.2, TRAILER_LEN - 0.6, 'slate', 0, 0.52, 0),
    boxAt(2.3, 0.1, TRAILER_LEN, 'timber', 0, TRAM_FLOOR - 0.1, 0),
    [-1, 1].map((sx) => tintable(boxAt(0.06, 0.3, TRAILER_LEN, 'coral', sx * 1.18, 0.5, 0))),
    [-1, 1].map((sx) => boxAt(0.07, 0.06, TRAILER_LEN, 'ivory', sx * 1.18, 0.8, 0)),
    [-1, 1].map((sx) => boxAt(0.28, 0.05, TRAILER_LEN - 0.6, 'timberDeep', sx * 1.35, 0.34, 0)),
    [-1, 1].flatMap((sx) => postZ.map((z) => (q.far ? boxAt(0.1, 2.2, 0.1, 'ivoryShade', sx * 1.1, TRAM_FLOOR, z) : post(q, 0.045, TRAM_FLOOR, 2.95, 'ivoryShade', sx * 1.1, z)))),
    [-1, 1].map((dir) => boxAt(2.2, 0.9, 0.08, 'ivory', 0, TRAM_FLOOR, dir * (half - 0.04))),
    TRAILER_BENCH_Z.flatMap((z) => crossBench(q, z)),
    canopy(q),
    nearOnly(q, () => [
      ...[-1, 1].map((dir) => boxAt(0.3, 0.12, 0.3, 'cocoa', 0, 0.45, dir * (half + 0.12))),
      ...[-1, 1].map((sx) => beam([sx * 1.1, TRAM_FLOOR + 0.9, -half + 0.2], [sx * 1.1, TRAM_FLOOR + 0.9, half - 0.2], 0.03, 'butterDeep')),
    ]),
  );
}
