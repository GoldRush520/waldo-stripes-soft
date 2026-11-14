/**
 * Food and drink. Treats on sticks and cones point up from the fist; cups sit upright in the
 * hand; trays, plates and boxes are flat, centred ≈ 0.02 m above the fist.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cone, cyl, lathe, merge, rotateX, sphere, torus } from '../../../core/geo';
import { type Q, T, at, fine, lathe2, s } from '../wardrobe/kit';
import { type HeldDef, held, pole, zCyl } from './grip';

const iceCream = (q: Q): Geo =>
  merge(
    at(rotateX(cone(0.036, 0.13, C.butterDeep, s(q, 6, 4)), Math.PI), 0, 0.06, 0),
    T(at(sphere(0.042, C.coralLight, s(q, 6, 5), s(q, 4, 3)), 0, 0.085, 0)),
    at(sphere(0.036, C.ivory, s(q, 6, 4), s(q, 4, 2)), 0, 0.14, 0),
    ...fine(q, at(sphere(0.012, C.coralDeep, 4, 2), 0, 0.18, 0)),
  );

const cottonCandy = (q: Q): Geo =>
  merge(
    pole(q, -0.08, 0.14, 0.006, C.ivory),
    T(at(blob(0.09, 0.11, 0.09, C.coralLight, s(q, 7, 5), s(q, 4, 3)), 0, 0.22, 0)),
    ...fine(q, ...[-1, 1].map((sx) => T(at(sphere(0.05, C.coralLight, 5, 3), sx * 0.07, 0.25, 0.02)))),
  );

const lollipop = (q: Q): Geo =>
  merge(
    pole(q, -0.06, 0.17, 0.006, C.ivory),
    T(at(zCyl(0.07, 0.02, C.coral, s(q, 8, 6)), 0, 0.23, 0)),
    ...fine(q, at(rotateX(torus(0.04, 0.008, C.ivory, 3, 8), Math.PI / 2), 0, 0.23, 0.012)),
  );

const toffeeApple = (q: Q): Geo =>
  merge(
    pole(q, -0.06, 0.13, 0.006, C.timber),
    at(sphere(0.046, C.coralDeep, s(q, 7, 5), s(q, 5, 3)), 0, 0.16, 0),
    ...fine(q, at(blob(0.03, 0.012, 0.03, C.coralDeep, 5, 2), 0, 0.12, 0)),
  );

const sandwich = (): Geo =>
  merge(
    at(box(0.1, 0.12, 0.018, C.butterLight), 0, -0.02, 0.016),
    at(box(0.1, 0.12, 0.018, C.butterLight), 0, -0.02, -0.016),
    at(box(0.106, 0.11, 0.014, C.sage), 0, -0.015, 0),
  );

const baguette = (q: Q): Geo =>
  merge(
    lathe2(
      q,
      [
        [0.001, -0.42],
        [0.02, -0.41],
        [0.03, -0.32],
        [0.03, 0.08],
        [0.02, 0.17],
        [0.001, 0.18],
      ],
      C.butterDeep,
      6,
      5,
      [
        [0.001, -0.42],
        [0.03, -0.34],
        [0.03, 0.1],
        [0.001, 0.18],
      ],
    ),
    ...fine(q, ...[-0.25, -0.12, 0.01].map((y) => at(rotateX(box(0.02, 0.05, 0.012, C.butterLight), 0.4), 0, y, 0.026))),
  );

const pretzel = (q: Q): Geo =>
  merge(
    at(rotateX(torus(0.06, 0.016, C.timber, s(q, 4, 3), s(q, 10, 6)), Math.PI / 2), 0, 0.09, 0),
    ...fine(q, beam([-0.04, 0.05, 0], [0.04, 0.12, 0], 0.024, C.timber), beam([0.04, 0.05, 0], [-0.04, 0.12, 0], 0.024, C.timber)),
  );

const mug = (): Geo =>
  merge(
    T(at(cyl(0.04, 0.04, 0.09, C.blue, 8), 0, -0.045, 0.065)),
    at(cyl(0.034, 0.034, 0.005, C.cocoa, 6), 0, 0.044, 0.065),
    at(torus(0.026, 0.007, C.blue, 3, 6), 0, 0.0, 0.012),
  );

const teaCup = (): Geo =>
  merge(
    at(cyl(0.065, 0.055, 0.012, C.ivory, 8), 0, 0.014, 0.03),
    T(at(cyl(0.03, 0.042, 0.045, C.blueLight, 8), 0, 0.026, 0.03)),
    at(rotateX(torus(0.016, 0.005, C.ivory, 3, 5), Math.PI / 2), 0.05, 0.05, 0.03),
  );

const wineGlass = (): Geo =>
  merge(
    lathe(
      [
        [0.001, -0.05],
        [0.035, -0.05],
        [0.035, -0.044],
        [0.006, -0.038],
        [0.006, 0.03],
        [0.035, 0.06],
        [0.04, 0.11],
        [0.001, 0.08],
      ],
      C.blueLight,
      7,
    ),
    at(cyl(0.03, 0.03, 0.012, C.coralDeep, 6), 0, 0.075, 0),
  );

const bottle = (q: Q): Geo =>
  merge(
    lathe2(
      q,
      [
        [0.001, -0.1],
        [0.035, -0.1],
        [0.037, 0.1],
        [0.015, 0.15],
        [0.013, 0.19],
        [0.001, 0.195],
      ],
      C.sageDeep,
      6,
      5,
      [
        [0.001, -0.1],
        [0.037, 0.1],
        [0.013, 0.19],
        [0.001, 0.195],
      ],
    ),
    ...fine(q, T(at(cyl(0.039, 0.039, 0.07, C.coral, 6, false), 0, -0.04, 0))),
  );

export const FOOD_PROPS: readonly HeldDef[] = [
  held('icecream', iceCream, 'RL'),
  held('cottoncandy', cottonCandy, 'RL'),
  held('lollipop', lollipop, 'RL'),
  held('toffeeapple', toffeeApple),
  held('sandwich', sandwich, 'R', { nearOnly: true }),
  held('baguette', baguette, 'RL'),
  held('pretzel', pretzel),
  held('mug', mug, 'RL', { nearOnly: true }),
  held('teacup', teaCup, 'R', { nearOnly: true }),
  held('wineglass', wineGlass, 'R', { nearOnly: true }),
  held('bottle', bottle, 'RL'),
];
