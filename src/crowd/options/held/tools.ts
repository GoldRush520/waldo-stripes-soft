/**
 * Garden, cleaning, painting and workshop tools. Long-handled tools are carried with the shaft
 * through the fist and the working head near the ground (-y); faces and blades face +z.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cone, cyl, merge, profile, rotateX, rotateY, rotateZ, scale } from '../../../core/geo';
import { type Q, T, at, fine, lathe2, path, s } from '../wardrobe/kit';
import { type HeldDef, held, pole } from './grip';

const wateringCan = (q: Q): Geo =>
  merge(
    T(at(cyl(0.1, 0.1, 0.2, C.sage, s(q, 8, 5)), 0, -0.42, 0)),
    beam([0, -0.38, 0.08], [0, -0.2, 0.3], 0.024, C.sage),
    path(
      q === 'near'
        ? [
            [0, -0.22, -0.08],
            [0, 0.0, -0.035],
            [0, 0.0, 0.035],
            [0, -0.22, 0.06],
          ]
        : [
            [0, -0.22, 0],
            [0, 0, 0],
          ],
      0.016,
      C.sageDeep,
    ),
    ...fine(q, at(rotateX(cone(0.035, 0.05, C.sageDeep, 5), 2.4), 0, -0.19, 0.32)),
  );

const spade = (q: Q): Geo =>
  merge(
    at(box(0.1, 0.03, 0.03, C.timberDeep), 0, -0.015, 0),
    pole(q, -0.56, 0.0, 0.014, C.timber),
    at(box(0.17, 0.24, 0.02, C.slate), 0, -0.79, 0),
    ...fine(q, at(box(0.17, 0.02, 0.03, C.slate), 0, -0.56, 0)),
  );

function rake(q: Q): Geo {
  const tines = [-0.15, -0.09, -0.03, 0.03, 0.09, 0.15].map((x) => beam([x, -0.75, 0], [x, -0.75, 0.07], 0.008, C.slate));
  return merge(
    pole(q, -0.74, 0.45, 0.013, C.timber),
    at(box(0.35, 0.03, 0.03, C.slate), 0, -0.765, 0),
    q === 'near' ? tines : [at(box(0.33, 0.012, 0.07, C.slate), 0, -0.756, 0.035)],
  );
}

const hoe = (q: Q): Geo =>
  merge(
    pole(q, -0.72, 0.45, 0.013, C.timber),
    at(rotateX(box(0.15, 0.08, 0.014, C.slate), 0.5), 0, -0.79, 0.02),
    ...fine(q, beam([0, -0.72, 0], [0, -0.75, 0.02], 0.014, C.slate)),
  );

const shears = (q: Q): Geo =>
  q === 'far'
    ? merge(beam([0, 0.05, 0], [0, -0.25, 0], 0.04, C.timberDeep), at(box(0.04, 0.3, 0.012, C.slate), 0, -0.55, 0))
    : merge(
        [-1, 1].map((sx) => beam([sx * 0.015, 0.05, 0], [sx * 0.02, -0.25, 0], 0.022, C.timberDeep)),
        [-1, 1].map((sx) => at(rotateZ(box(0.03, 0.3, 0.008, C.slate), sx * 0.05), sx * 0.008, -0.55, sx * 0.005)),
      );

const broom = (q: Q): Geo =>
  merge(
    pole(q, -0.5, 0.5, 0.014, C.timber),
    lathe2(
      q,
      [
        [0.001, -0.82],
        [0.1, -0.8],
        [0.05, -0.55],
        [0.025, -0.48],
        [0.001, -0.47],
      ],
      C.butterDeep,
      7,
      5,
      [
        [0.001, -0.82],
        [0.1, -0.8],
        [0.001, -0.47],
      ],
    ),
    ...fine(q, at(cyl(0.044, 0.04, 0.03, C.coral, 7, false), 0, -0.56, 0)),
  );

const mop = (q: Q): Geo =>
  merge(
    pole(q, -0.6, 0.5, 0.014, C.timber),
    lathe2(
      q,
      [
        [0.001, -0.8],
        [0.12, -0.78],
        [0.07, -0.6],
        [0.001, -0.58],
      ],
      C.ivory,
      8,
      5,
    ),
    ...fine(q, ...[-0.09, 0.0, 0.09].map((x) => beam([x, -0.7, 0.05], [x * 1.2, -0.82, 0.08], 0.02, C.ivoryShade))),
  );

const featherDuster = (q: Q): Geo =>
  merge(
    pole(q, -0.1, 0.25, 0.01, C.timberDeep),
    T(at(blob(0.07, 0.1, 0.07, C.coral, s(q, 7, 5), s(q, 4, 3)), 0, 0.33, 0)),
    ...fine(q, ...[-1, 0, 1].map((i) => T(at(rotateZ(blob(0.02, 0.06, 0.02, C.coral, 4, 3), i * 0.5), i * 0.06, 0.42, 0)))),
  );

const paintbrush = (): Geo =>
  merge(
    at(cyl(0.011, 0.009, 0.16, C.timber, 5), 0, -0.06, 0),
    at(box(0.03, 0.03, 0.012, C.slate), 0, 0.1, 0),
    T(at(box(0.028, 0.04, 0.012, C.coral), 0, 0.13, 0)),
  );

/** Painter's palette for the LEFT hand: flat, extending toward the body centre (-x). */
const palette = (q: Q): Geo =>
  merge(
    at(scale(cyl(0.16, 0.16, 0.012, C.clayLight, s(q, 10, 6)), 1, 1, 0.75), -0.08, 0.015, 0.06),
    ...fine(
      q,
      ...(
        [
          [C.coral, -0.02, 0.12],
          [C.blue, -0.08, 0.15],
          [C.butter, -0.15, 0.13],
          [C.sage, -0.2, 0.07],
        ] as const
      ).map(([col, x, z]) => at(blob(0.022, 0.01, 0.02, col, 4, 2), x, 0.03, z)),
      T(at(blob(0.022, 0.01, 0.02, C.ivory, 4, 2), -0.17, 0.03, 0.0)),
    ),
  );

const hammer = (q: Q): Geo =>
  merge(
    pole(q, -0.22, 0.06, 0.013, C.timber),
    at(box(0.03, 0.035, 0.13, C.slate), 0, -0.26, 0.0),
    ...fine(q, at(rotateX(box(0.024, 0.02, 0.05, C.slate), -0.5), 0, -0.24, -0.07)),
  );

const saw = (): Geo =>
  merge(
    at(box(0.03, 0.1, 0.07, C.timber), 0, -0.05, 0.01),
    at(
      rotateY(
        profile(
          [
            [-0.06, -0.05],
            [0.04, -0.05],
            [0.03, -0.55],
            [-0.03, -0.55],
          ],
          0.01,
          C.slate,
        ),
        Math.PI / 2,
      ),
      0,
      0,
      0,
    ),
  );

const wrench = (): Geo =>
  merge(beam([0, 0.04, 0], [0, -0.18, 0], 0.018, C.slate), at(box(0.05, 0.04, 0.014, C.slate), 0, -0.22, 0));

const spiritLevel = (q: Q): Geo =>
  merge(
    at(box(0.03, 0.6, 0.06, C.butter), 0, -0.45, 0),
    ...fine(q, at(box(0.034, 0.05, 0.03, C.sage), 0, -0.18, 0), at(box(0.034, 0.03, 0.062, C.ink), 0, 0.13, 0)),
  );

const trowel = (q: Q): Geo =>
  merge(
    pole(q, -0.06, 0.06, 0.014, C.timber),
    at(
      profile(
        [
          [-0.05, -0.07],
          [0.05, -0.07],
          [0, -0.22],
        ],
        0.012,
        C.slate,
      ),
      0,
      0,
      0.0,
    ),
  );

const plank = (q: Q): Geo =>
  merge(
    at(box(0.03, 1.0, 0.2, C.timber), 0, -0.7, 0),
    ...fine(q, ...[-0.05, 0.05].map((z) => at(box(0.034, 0.9, 0.008, C.timberDeep), 0, -0.65, z))),
  );

export const TOOL_PROPS: readonly HeldDef[] = [
  held('wateringcan', wateringCan),
  held('spade', spade),
  held('rake', rake),
  held('hoe', hoe),
  held('shears', shears),
  held('broom', broom),
  held('mop', mop),
  held('featherduster', featherDuster),
  held('paintbrush', paintbrush, 'R', { nearOnly: true }),
  held('palette', palette, 'L'),
  held('hammer', hammer),
  held('saw', saw),
  held('wrench', wrench, 'R', { nearOnly: true }),
  held('spiritlevel', spiritLevel),
  held('trowel', trowel),
  held('plank', plank),
];
