/**
 * Props held up high: umbrellas, flags, signs, balloons. Poles run along +y from the fist; the clip
 * raises the arm or pitches the grip so the pole stands upright.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cone, dome, merge, profile, rotateY, rotateZ, scale, sphere, sway, torus } from '../../../core/geo';
import { type Q, T, type V3, at, fine, lathe2, path, s } from '../wardrobe/kit';
import { type HeldDef, held, pole, xCyl } from './grip';

const closedUmbrella = (q: Q): Geo =>
  merge(
    pole(q, -0.8, 0.03, 0.009, C.timberDeep),
    T(
      lathe2(
        q,
        [
          [0.001, -0.68],
          [0.04, -0.45],
          [0.035, -0.25],
          [0.012, -0.15],
          [0.001, -0.14],
        ],
        C.coral,
        6,
        5,
        [
          [0.001, -0.68],
          [0.04, -0.4],
          [0.001, -0.14],
        ],
      ),
    ),
    ...fine(
      q,
      path(
        [
          [0, 0.02, 0],
          [0, 0.09, 0],
          [0, 0.11, -0.04],
          [0, 0.08, -0.07],
        ],
        0.016,
        C.timberDeep,
      ),
      at(box(0.02, 0.025, 0.09, C.coralDeep), 0, -0.37, 0.0),
    ),
  );

const parasol = (q: Q): Geo =>
  merge(
    pole(q, -0.12, 0.78, 0.008, C.timber),
    T(at(scale(dome(0.36, C.coralLight, s(q, 8, 6), s(q, 3, 2)), 1, 0.45, 1), 0, 0.66, 0)),
    ...fine(q, at(torus(0.36, 0.012, C.ivory, 3, 8), 0, 0.665, 0), at(cone(0.015, 0.05, C.ivory, 4), 0, 0.82, 0)),
  );

function flag(q: Q): Geo {
  const cloth = merge(
    T(at(box(0.012, 0.32, 0.5, C.coral), 0, 0.75, -0.26)),
    at(box(0.014, 0.08, 0.5, C.ivory), 0, 0.87, -0.26),
  );
  return merge(
    pole(q, -0.3, 1.1, 0.011, C.timber),
    sway(cloth, (_x, _y, z) => Math.min(1, Math.max(0, -z * 2))),
    ...fine(q, at(sphere(0.022, C.butter, 4, 3), 0, 1.11, 0)),
  );
}

const pennant = (q: Q): Geo =>
  merge(
    pole(q, -0.1, 0.5, 0.008, C.timber),
    sway(
      T(
        rotateY(
          profile(
            [
              [0, 0.3],
              [0.32, 0.39],
              [0, 0.48],
            ],
            0.012,
            C.blue,
          ),
          Math.PI / 2,
        ),
      ),
      (_x, _y, z) => Math.min(1, -z * 3),
    ),
  );

function pinwheel(q: Q): Geo {
  const blade = (i: number): Geo => {
    const g = at(
      rotateZ(
        profile(
          [
            [0, 0],
            [0.09, 0.02],
            [0.07, 0.09],
          ],
          0.012,
          C.ivory,
        ),
        (i * Math.PI) / 2,
      ),
      0,
      0.42,
      0.025,
    );
    return i % 2 === 0 ? T(g) : g;
  };
  return merge(
    pole(q, -0.12, 0.42, 0.007, C.ivoryDeep),
    q === 'near' ? [0, 1, 2, 3].map(blade) : [blade(0), blade(2)],
    ...fine(q, at(sphere(0.014, C.butter, 4, 2), 0, 0.42, 0.04)),
  );
}

const placard = (q: Q): Geo =>
  merge(
    pole(q, -0.3, 0.8, 0.012, C.timber),
    T(at(box(0.6, 0.4, 0.02, C.butter), 0, 0.75, 0.02)),
    at(box(0.5, 0.3, 0.022, C.ivory), 0, 0.8, 0.024),
    ...fine(q, ...[-0.15, 0, 0.15].map((x) => at(box(0.08, 0.16, 0.012, C.ink), x, 0.87, 0.04))),
  );

function balloons(q: Q): Geo {
  const knots: readonly V3[] = [
    [-0.16, 1.18, 0.05],
    [0.0, 1.34, -0.05],
    [0.16, 1.14, 0.0],
  ];
  const cols = [C.coral, C.butter, C.blue] as const;
  const bodies = knots.map(([x, y, z], i) => {
    const g = at(blob(0.15, 0.19, 0.15, cols[i] ?? C.coral, s(q, 6, 4), s(q, 3, 2)), x, y + 0.2, z);
    return i === 0 ? T(g) : g;
  });
  if (q === 'far') return merge(bodies, beam([0, 0, 0], [0, 1.15, 0], 0.012, C.ivoryDeep));
  return merge(
    bodies,
    knots.map((k) => beam([0, 0.0, 0.0], k, 0.006, C.ivoryDeep)),
    knots.map(([x, y, z], i) => at(cone(0.025, 0.035, cols[i] ?? C.coral, 4), x, y - 0.01, z)),
  );
}

const selfieStick = (q: Q): Geo =>
  merge(
    pole(q, -0.06, 0.85, 0.01, C.ink),
    at(box(0.08, 0.15, 0.014, C.ink), 0, 0.83, 0.02),
    ...fine(q, at(box(0.068, 0.13, 0.004, C.blueLight), 0, 0.84, 0.03)),
  );

const paintRoller = (q: Q): Geo =>
  merge(
    pole(q, -0.25, 1.0, 0.012, C.timber),
    T(at(xCyl(0.04, 0.22, C.coral, s(q, 6, 4)), 0, 1.12, 0.06)),
    ...fine(
      q,
      beam([0, 1.0, 0], [0, 1.07, 0.06], 0.012, C.slate),
      beam([0.0, 1.07, 0.06], [0.11, 1.12, 0.06], 0.01, C.slate),
    ),
  );

export const ALOFT_PROPS: readonly HeldDef[] = [
  held('umbrella.closed', closedUmbrella, 'RL'),
  held('parasol', parasol, 'RL', { reach: 0.2 }),
  held('flag', flag, 'RL', { reach: 0.6 }),
  held('pennant', pennant),
  held('pinwheel', pinwheel),
  held('placard', placard, 'R', { reach: 0.4 }),
  held('balloons', balloons, 'RL', { reach: 1.8 }),
  held('selfiestick', selfieStick),
  held('paintroller', paintRoller, 'R', { reach: 0.4 }),
];
