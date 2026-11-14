/**
 * Everyday carried things: luggage, bags, flowers, reading matter, gadgets and lights. Luggage
 * hangs below the fist; reading matter is flat and centred just above it.
 */
import { C } from '../../../core/palette';
import { type Col, type Geo, beam, box, cone, cyl, merge, rotateX, rotateY, rotateZ, scale, sphere, torus } from '../../../core/geo';
import { type Q, T, at, fine, lathe2, s } from '../wardrobe/kit';
import { type HeldDef, bail, held, pole, zCyl } from './grip';

/** Case hanging from a top handle: thickness along x, length along z. */
const luggage = (w: number, h: number, l: number, col: Col, tint: boolean) => (q: Q): Geo => {
  const body = at(box(w, h, l, col), 0, -0.06 - h, 0);
  return merge(
    tint ? T(body) : body,
    bail(q, -0.06, 0.06, C.ink, 0.016),
    ...fine(q, ...[-0.3, 0.3].map((f) => at(box(w + 0.006, h + 0.006, 0.03, C.ivory), 0, -0.063 - h, l * f))),
  );
};

const briefcase = (q: Q): Geo =>
  merge(
    at(box(0.1, 0.3, 0.42, C.timberDeep), 0, -0.37, 0),
    bail(q, -0.07, 0.05, C.cocoa, 0.016),
    ...fine(q, ...[-0.12, 0.12].map((z) => at(box(0.104, 0.025, 0.03, C.butter), 0, -0.1, z))),
  );

const shoppingBag = (q: Q): Geo =>
  merge(
    T(at(box(0.12, 0.34, 0.3, C.butter), 0, -0.42, 0)),
    q === 'near'
      ? [-0.1, 0.1].flatMap((z) => [beam([0, -0.08, z], [0, 0, z * 0.25], 0.012, C.timberDeep)])
      : [beam([0, -0.08, 0], [0, 0, 0], 0.02, C.timberDeep)],
    at(cyl(0.02, 0.018, 0.25, C.sage, s(q, 5, 4)), 0.02, -0.15, 0.06),
    ...fine(q, at(cyl(0.02, 0.018, 0.22, C.sageDeep, 5), -0.02, -0.15, -0.05)),
  );

const produceBasket = (q: Q): Geo =>
  merge(
    scale(
      lathe2(
        q,
        [
          [0.001, -0.36],
          [0.15, -0.36],
          [0.18, -0.18],
          [0.16, -0.18],
          [0.13, -0.34],
          [0.001, -0.34],
        ],
        C.timber,
        7,
        5,
        [
          [0.001, -0.36],
          [0.15, -0.36],
          [0.18, -0.18],
          [0.001, -0.19],
        ],
      ),
      0.75,
      1,
      1,
    ),
    bail(q, -0.18, 0.17, C.timberDeep, 0.016),
    ...fine(
      q,
      ...(
        [
          [0.03, 0.06, C.coral],
          [-0.04, -0.05, C.sage],
          [0.0, -0.01, C.butter],
        ] as const
      ).map(([x, z, col]) => at(sphere(0.04, col, 4, 2), x, -0.2, z)),
    ),
  );

const bouquet = (q: Q): Geo =>
  merge(
    at(rotateX(cone(0.06, 0.25, C.ivory, s(q, 6, 4)), Math.PI), 0, 0.08, 0),
    q === 'near'
      ? (
          [
            [0, 0.17, 0],
            [0.05, 0.13, 0.03],
            [-0.05, 0.13, 0.02],
            [0.02, 0.13, -0.05],
            [-0.02, 0.14, 0.06],
          ] as const
        ).map(([x, y, z]) => T(at(sphere(0.045, C.coral, 5, 3), x, y, z)))
      : [T(at(sphere(0.08, C.coral, 5, 3), 0, 0.15, 0))],
  );

const rose = (): Geo =>
  merge(
    beam([0, -0.1, 0], [0, 0.18, 0], 0.008, C.sageDeep),
    T(at(sphere(0.025, C.coral, 5, 4), 0, 0.2, 0)),
    at(rotateZ(box(0.04, 0.02, 0.012, C.sage), 0.5), 0.02, 0.05, 0),
  );

const newspaper = (q: Q): Geo =>
  merge(
    at(box(0.02, 0.3, 0.22, C.ivory), 0, -0.25, 0),
    ...fine(
      q,
      ...[-1, 1].flatMap((sx) => [-0.1, -0.18].map((y) => at(box(0.004, 0.02, 0.18, C.ink), sx * 0.011, y, 0))),
    ),
  );

const openBook = (q: Q): Geo =>
  merge(
    T(at(box(0.32, 0.012, 0.22, C.blue), 0, 0.012, 0.08)),
    [-1, 1].map((sx) => at(rotateZ(box(0.15, 0.02, 0.2, C.ivory), sx * -0.08), sx * 0.075, 0.024, 0.08)),
    ...fine(
      q,
      ...[-1, 1].flatMap((sx) => [0.03, 0.09].map((z) => at(box(0.1, 0.004, 0.012, C.ink), sx * 0.075, 0.046, z + 0.02))),
    ),
  );

/** Unfolded map extending toward the other hand (+x); a coral north arrow marks its top edge. */
function map(flipped: boolean) {
  return (q: Q): Geo => {
    const panels = (q === 'near' ? [-0.225, -0.075, 0.075, 0.225] : [-0.15, 0.15]).map((x, i) =>
      at(rotateZ(box(q === 'near' ? 0.15 : 0.3, 0.012, 0.4, i % 2 ? C.ivory : C.butterLight), i % 2 ? 0.04 : -0.04), x, 0.02, 0),
    );
    const features = merge(
      at(box(0.4, 0.006, 0.04, C.blue), 0.02, 0.034, -0.05),
      ...fine(
        q,
        at(box(0.12, 0.006, 0.12, C.sage), -0.15, 0.034, 0.08),
        at(rotateX(cone(0.04, 0.08, C.coral, 3), Math.PI / 2), 0.17, 0.035, 0.1),
      ),
    );
    return at(merge(panels, flipped ? rotateY(features, Math.PI) : features), 0.2, 0, 0.06);
  };
}

const phone = (): Geo =>
  merge(at(box(0.07, 0.14, 0.012, C.ink), 0, -0.02, 0.02), at(box(0.06, 0.12, 0.004, C.blueLight), 0, -0.01, 0.028));

const camera = (q: Q): Geo =>
  merge(
    at(box(0.12, 0.08, 0.06, C.ink), 0, -0.01, 0.02),
    at(zCyl(0.028, 0.05, C.slate, s(q, 6, 4)), 0, 0.03, 0.07),
    ...fine(q, at(box(0.03, 0.02, 0.02, C.ivory), 0.04, 0.075, 0.02)),
  );

const magnifier = (q: Q): Geo =>
  merge(
    pole(q, -0.08, 0.05, 0.012, C.timber),
    at(rotateX(torus(0.06, 0.008, C.butterDeep, 3, s(q, 10, 5)), Math.PI / 2), 0, -0.15, 0),
    ...fine(q, at(zCyl(0.058, 0.006, C.blueLight, 8), 0, -0.15, 0)),
  );

const telescope = (q: Q): Geo =>
  merge(
    at(cyl(0.032, 0.032, 0.25, C.butterDeep, s(q, 6, 4)), 0, -0.45, 0),
    at(cyl(0.025, 0.025, 0.22, C.timberDeep, s(q, 6, 4)), 0, -0.2, 0),
    ...fine(
      q,
      at(cyl(0.018, 0.018, 0.12, C.butterDeep, 6), 0, 0.02, 0),
      at(cyl(0.035, 0.035, 0.02, C.butterDeep, 6, false), 0, -0.21, 0),
    ),
  );

const lantern = (q: Q): Geo =>
  merge(
    at(cone(0.07, 0.06, C.cocoa, s(q, 6, 4)), 0, -0.14, 0),
    at(cyl(0.055, 0.055, 0.14, C.butterLight, s(q, 6, 5)), 0, -0.28, 0),
    bail(q, -0.08, 0.04, C.cocoa, 0.01),
    ...fine(
      q,
      at(cyl(0.065, 0.065, 0.03, C.cocoa, 6), 0, -0.31, 0),
      ...[-1, 1].map((sx) => beam([sx * 0.056, -0.28, 0], [sx * 0.056, -0.14, 0], 0.01, C.cocoa)),
    ),
  );

export const EVERYDAY_PROPS: readonly HeldDef[] = [
  held('suitcase.small', luggage(0.13, 0.3, 0.42, C.coral, true), 'RL'),
  held('suitcase.large', luggage(0.2, 0.45, 0.58, C.blue, true), 'RL'),
  held('briefcase', briefcase, 'RL'),
  held('shoppingbag', shoppingBag, 'RL'),
  held('basket.produce', produceBasket, 'RL'),
  held('bouquet', bouquet, 'RL'),
  held('rose', rose, 'R', { nearOnly: true }),
  held('newspaper', newspaper, 'RL'),
  held('book.open', openBook, 'RL'),
  held('map', map(false), 'RL'),
  held('map.upsidedown', map(true)),
  held('phone', phone, 'RL', { nearOnly: true }),
  held('camera', camera),
  held('magnifier', magnifier, 'RL'),
  held('telescope', telescope),
  held('lantern', lantern, 'RL'),
];
