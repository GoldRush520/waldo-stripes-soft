/**
 * Heavy and awkward loads carried with both arms or on the shoulder (Cat.Special, Torso part),
 * plus `wear.stilts` on the shins. The right shoulder top is at x ≈ -0.2, y ≈ 0.48.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cyl, merge, profile, rotateX, rotateY, rotateZ, scale, sphere } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Q, T, at, fine, lathe2, option, s, spec } from './kit';
import { carry } from './special-music';

const boxStack = (q: Q): Geo =>
  merge(
    [0, 1, 2].map((i) =>
      at(rotateY(box(0.42 - i * 0.04, 0.3, 0.34 - i * 0.03, C.clay), [0.05, -0.12, 0.15][i] ?? 0), [0, 0.03, -0.02][i] ?? 0, -0.02 + i * 0.3, 0.33),
    ),
    ...fine(
      q,
      ...[0, 1, 2].map((i) => at(rotateY(box(0.08, 0.305, 0.345 - i * 0.03, C.clayDeep), [0.05, -0.12, 0.15][i] ?? 0), [0, 0.03, -0.02][i] ?? 0, -0.022 + i * 0.3, 0.33)),
      ...[0, 1, 2].map((i) => T(at(box(0.1, 0.07, 0.012, C.ivory), 0.08, 0.1 + i * 0.3, 0.5 - i * 0.015))),
    ),
  );

const sack = (q: Q): Geo =>
  merge(
    T(at(rotateX(blob(0.17, 0.22, 0.15, C.clay, s(q, 7, 5), s(q, 5, 3)), -0.5), -0.13, 0.3, -0.24)),
    at(rotateX(cyl(0.04, 0.03, 0.14, C.clay, s(q, 6, 4)), 0.9), -0.18, 0.44, -0.08),
    ...fine(q, at(cyl(0.042, 0.042, 0.02, C.cocoa, 6, false), -0.18, 0.47, -0.04)),
  );

const longPlank = (q: Q): Geo =>
  merge(
    at(box(0.2, 0.04, 3.2, C.timber), -0.2, 0.49, 0.3),
    ...fine(q, ...[-0.05, 0.05].map((x) => at(box(0.012, 0.044, 3.0, C.timberDeep), -0.2 + x, 0.488, 0.3))),
  );

const laundry = (q: Q): Geo =>
  merge(
    at(
      scale(
        lathe2(
          q,
          [
            [0.001, -0.12],
            [0.2, -0.12],
            [0.24, 0.08],
            [0.22, 0.08],
            [0.18, -0.1],
            [0.001, -0.1],
          ],
          C.timber,
          8,
          5,
          [
            [0.001, -0.12],
            [0.2, -0.12],
            [0.24, 0.08],
            [0.001, 0.1],
          ],
        ),
        1,
        1,
        0.7,
      ),
      -0.3,
      0.08,
      0.08,
    ),
    q === 'near'
      ? (
          [
            [-0.36, 0.17, 0.08, C.blueLight],
            [-0.25, 0.17, 0.12, C.ivory],
            [-0.3, 0.2, 0.03, C.coralLight],
          ] as const
        ).map(([x, y, z, col], i) => {
          const g = at(blob(0.09, 0.05, 0.07, col, 5, 3), x, y, z);
          return i === 0 ? T(g) : g;
        })
      : [T(at(blob(0.18, 0.05, 0.12, C.blueLight, 4, 2), -0.3, 0.17, 0.08))],
  );

const babyBlanket = (q: Q): Geo =>
  T(at(rotateZ(blob(0.2, 0.09, 0.1, C.blueLight, s(q, 8, 5), s(q, 5, 3)), 0.15), 0.02, 0.28, 0.21));

const babyHead = (q: Q): Geo => at(sphere(0.075, C.clayLight, s(q, 7, 5), s(q, 5, 3)), 0.21, 0.33, 0.2);

const breadTray = (q: Q): Geo =>
  merge(
    at(box(0.6, 0.03, 0.4, C.timber), 0, 0.1, 0.38),
    q === 'near'
      ? [-0.2, -0.1, 0, 0.1, 0.2].map((x, i) => at(blob(0.05, 0.04, 0.15, i % 2 ? C.butterDeep : C.timber, 5, 3), x, 0.16, 0.38))
      : [at(blob(0.25, 0.05, 0.15, C.butterDeep, 6, 2), 0, 0.15, 0.38)],
  );

const trunk = (q: Q): Geo =>
  merge(
    T(at(box(0.7, 0.36, 0.4, C.blue), 0, -0.05, 0.36)),
    at(box(0.72, 0.08, 0.42, C.clayDeep), 0, 0.31, 0.36),
    ...fine(
      q,
      ...[-0.22, 0.22].map((x) => at(box(0.05, 0.445, 0.425, C.butterDeep), x, -0.055, 0.36)),
      at(box(0.06, 0.06, 0.02, C.butter), 0, 0.27, 0.575),
    ),
  );

const hod = (q: Q): Geo =>
  merge(
    [-1, 1].map((sx) => at(rotateZ(box(0.16, 0.02, 0.5, C.timber), sx * 0.6), -0.2 + sx * 0.06, 0.53, 0.05)),
    beam([-0.2, 0.48, 0.15], [-0.2, -0.3, 0.32], 0.035, C.timberDeep),
    ...fine(
      q,
      ...[-0.25, 0.25].map((z) => at(box(0.22, 0.12, 0.02, C.timber), -0.2, 0.5, 0.05 + z)),
      ...[-0.15, -0.05, 0.05, 0.15].map((z, i) => at(box(0.1, 0.06, 0.09, C.coralDeep), -0.2 + (i % 2 ? 0.02 : -0.02), 0.6, 0.05 + z)),
    ),
  );

const surfboard = (q: Q): Geo =>
  merge(
    T(at(blob(0.03, 0.25, 1.1, C.coral, s(q, 8, 6), s(q, 4, 2)), -0.31, 0.05, 0.2)),
    at(box(0.064, 0.04, 2.0, C.ivory), -0.31, 0.03, 0.2),
    ...fine(
      q,
      at(
        rotateY(
          profile(
            [
              [0, 0],
              [0.12, 0],
              [0.02, 0.1],
            ],
            0.012,
            C.ink,
          ),
          Math.PI / 2,
        ),
        -0.31,
        -0.2,
        -0.7,
      ),
    ),
  );

const carpet = (q: Q): Geo =>
  merge(
    T(at(rotateX(cyl(0.12, 0.12, 2.4, C.coral, s(q, 8, 6)), Math.PI / 2), -0.2, 0.57, -1.1)),
    ...fine(
      q,
      ...[-1.1, 1.22].map((z) => at(rotateX(cyl(0.123, 0.123, 0.08, C.ivory, 8, false), Math.PI / 2), -0.2, 0.57, z)),
    ),
  );

const cheque = (q: Q): Geo =>
  merge(
    at(box(1.0, 0.5, 0.02, C.ivory), 0, 0.0, 0.38),
    T(at(box(1.0, 0.1, 0.024, C.sage), 0, 0.4, 0.38)),
    ...fine(
      q,
      ...[0.28, 0.2].map((y) => at(box(0.6, 0.025, 0.012, C.ink), -0.1, y, 0.394)),
      at(box(0.22, 0.07, 0.012, C.coralDeep), 0.3, 0.12, 0.394),
      at(rotateZ(box(0.18, 0.012, 0.012, C.ink), 0.2), 0.3, 0.05, 0.394),
    ),
  );

function suitcaseTower(q: Q): Geo {
  const cols = [C.coral, C.blue, C.sage, C.butter] as const;
  const cases = [0, 1, 2, 3].map((i) => {
    const g = at(rotateZ(box(0.5 - i * 0.05, 0.22, 0.3, cols[i] ?? C.coral), i * 0.04), i * i * 0.012, -0.02 + i * 0.23, 0.33);
    return i === 0 ? T(g) : g;
  });
  if (q === 'far') {
    return merge(cases.slice(0, 2), at(rotateZ(box(0.42, 0.45, 0.3, C.sage), 0.1), 0.06, 0.44, 0.33));
  }
  return merge(cases, [0, 1, 2, 3].map((i) => at(box(0.1, 0.03, 0.03, C.ink), i * i * 0.012, 0.2 + i * 0.23, 0.33)));
}

function ladder(q: Q): Geo {
  const rails = [0.49, 0.1].map((y) => at(box(0.04, 0.05, 3.2, C.timber), -0.28, y, 0.15));
  const rungs = Array.from({ length: 8 }, (_, i) => beam([-0.28, 0.14, -1.25 + i * 0.4], [-0.28, 0.5, -1.25 + i * 0.4], 0.025, C.timberDeep));
  return merge(rails, ...fine(q, ...rungs));
}

function walkingFrame(q: Q): Geo {
  const leg = (x: number, z: number): Geo => beam([x * 0.25, -0.06, z], [x * 0.27, -0.88, z], 0.025, C.slate);
  const front = [leg(-1, 0.5), leg(1, 0.5), beam([-0.25, -0.06, 0.5], [0.25, -0.06, 0.5], 0.025, C.slate)];
  if (q === 'far') return merge(front);
  return merge(
    front,
    leg(-1, 0.2),
    leg(1, 0.2),
    [-1, 1].map((sx) => beam([sx * 0.25, -0.06, 0.2], [sx * 0.25, -0.06, 0.5], 0.025, C.slate)),
    [-1, 1].map((sx) => T(at(box(0.04, 0.03, 0.12, C.coral), sx * 0.25, -0.04, 0.3))),
  );
}

/** Stilt leg: trouser cloth (tinted; set the Special tint to the trouser colour) down to a fake shoe 0.9 m lower. */
const stiltCloth = (q: Q): Geo =>
  merge(
    T(at(scale(cyl(0.075, 0.072, 0.96, C.blue, s(q, 8, 6), false), 1, 1, 1.75), 0, -1.32, 0.045)),
    ...fine(q, at(scale(cyl(0.078, 0.078, 0.04, C.ivory, 8, false), 1, 1, 1.75), 0, -1.32, 0.045)),
  );

const stiltShoe = (q: Q): Geo => at(blob(0.056, 0.042, 0.125, C.ink, s(q, 6, 4), s(q, 3, 2)), 0, -1.322, 0.05);

const stilts = (): RigOption =>
  option(
    'wear.stilts',
    Cat.Special,
    [
      spec(Part.ShinL, Slot.Vertex, stiltCloth),
      spec(Part.ShinR, Slot.Vertex, stiltCloth),
      spec(Part.ShinL, Slot.Shoes, stiltShoe),
      spec(Part.ShinR, Slot.Shoes, stiltShoe),
    ],
    { reach: 0.9 },
  );

export const LOAD_CARRIES: readonly RigOption[] = [
  carry('carry.boxes', boxStack, { reach: 0.4 }),
  carry('carry.sack', sack),
  carry('carry.plank', longPlank, { reach: 1.6 }),
  carry('carry.laundry', laundry),
  option('carry.baby', Cat.Special, [spec(Part.Torso, Slot.Vertex, babyBlanket), spec(Part.Torso, Slot.Skin, babyHead)]),
  carry('carry.breadtray', breadTray),
  carry('carry.trunk', trunk),
  carry('carry.hod', hod),
  carry('carry.surfboard', surfboard, { reach: 1.2 }),
  carry('carry.carpet', carpet, { reach: 1.1 }),
  carry('carry.cheque', cheque),
  carry('carry.suitcases', suitcaseTower, { reach: 0.3 }),
  carry('carry.ladder', ladder, { reach: 1.6 }),
  carry('wear.walkingframe', walkingFrame, { reach: 0.2 }),
  stilts(),
];
