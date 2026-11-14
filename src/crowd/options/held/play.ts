/**
 * Toys, sport and festival props.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cone, cyl, dome, merge, profile, rotateX, rotateZ, scale, sphere, torus } from '../../../core/geo';
import { type Q, T, type V3, at, fine, lathe2, path, s, tintWhere } from '../wardrobe/kit';
import { type HeldDef, held, pole, zCyl } from './grip';

const club = (q: Q): Geo =>
  merge(
    T(
      lathe2(
        q,
        [
          [0.001, -0.1],
          [0.015, -0.09],
          [0.012, 0.05],
          [0.04, 0.17],
          [0.045, 0.24],
          [0.001, 0.3],
        ],
        C.coral,
        6,
        5,
        [
          [0.001, -0.1],
          [0.014, 0.04],
          [0.045, 0.22],
          [0.001, 0.3],
        ],
      ),
    ),
    ...fine(q, at(cyl(0.031, 0.04, 0.05, C.ivory, 6, false), 0, 0.12, 0)),
  );

/** Hula hoop hanging from the fist in the y-z plane. */
const hoop = (q: Q): Geo =>
  at(
    tintWhere(rotateZ(torus(0.38, 0.012, C.ivory, 3, s(q, 14, 7)), Math.PI / 2), (_x, y, z) => Math.cos(Math.atan2(y, z) * 4) > -0.3),
    0,
    -0.37,
    0,
  );

const racket = (q: Q): Geo =>
  merge(
    pole(q, -0.12, 0.06, 0.016, C.ink),
    T(at(rotateX(scale(torus(0.11, 0.009, C.coral, 3, s(q, 10, 5)), 1, 1, 1.3), Math.PI / 2), 0, -0.33, 0)),
    ...fine(
      q,
      beam([0, -0.12, 0], [-0.04, -0.2, 0], 0.012, C.coral),
      beam([0, -0.12, 0], [0.04, -0.2, 0], 0.012, C.coral),
      at(box(0.2, 0.26, 0.012, C.ivoryShade), 0, -0.46, 0),
    ),
  );

const ttBat = (q: Q): Geo =>
  merge(pole(q, -0.06, 0.05, 0.014, C.timber), T(at(zCyl(0.075, 0.012, C.coral, s(q, 8, 6)), 0, -0.14, 0)));

/** Football tucked between the forearm and the hip (toward +x, the body side of the right hand). */
const football = (q: Q): Geo =>
  merge(
    at(sphere(0.11, C.white, s(q, 8, 6), s(q, 5, 3)), 0.1, 0.12, 0.03),
    ...fine(
      q,
      ...(
        [
          [0, 1, 0],
          [0.7, 0, 0.7],
          [-0.7, 0, 0.7],
          [0, -0.6, 0.8],
        ] as const
      ).map(([x, y, z]) => at(blob(0.03, 0.03, 0.03, C.ink, 4, 2), 0.1 + x * 0.095, 0.12 + y * 0.095, 0.03 + z * 0.095)),
    ),
  );

const beachBall = (q: Q): Geo =>
  at(
    tintWhere(sphere(0.18, C.ivory, s(q, 10, 6), s(q, 6, 3)), (x, _y, z) => Math.sin(Math.atan2(x, z) * 3) > 0),
    0,
    -0.16,
    0.06,
  );

function teddy(q: Q): Geo {
  const fur = C.clay;
  const near: readonly Geo[] = [
    T(at(sphere(0.07, fur, 6, 4), 0, -0.13, 0)),
    T(at(blob(0.07, 0.09, 0.06, fur, 6, 4), 0, -0.28, 0)),
    ...[-1, 1].map((sx) => T(at(sphere(0.025, fur, 4, 2), sx * 0.055, -0.07, 0))),
    at(sphere(0.03, C.clayLight, 4, 2), 0, -0.14, 0.06),
    T(beam([0.0, 0.0, 0.0], [0.05, -0.2, 0.0], 0.04, fur)),
    T(at(blob(0.025, 0.05, 0.025, fur, 4, 2), -0.08, -0.26, 0.02)),
    ...[-1, 1].map((sx) => T(at(blob(0.03, 0.05, 0.03, fur, 4, 2), sx * 0.04, -0.38, 0.03))),
  ];
  const far: readonly Geo[] = [
    T(at(sphere(0.07, fur, 5, 2), 0, -0.13, 0)),
    T(at(blob(0.07, 0.09, 0.06, fur, 5, 3), 0, -0.28, 0)),
    T(beam([0.0, 0.0, 0.0], [0.05, -0.2, 0.0], 0.04, fur)),
  ];
  return merge(q === 'near' ? near : far);
}

const doll = (q: Q): Geo =>
  merge(
    at(sphere(0.06, C.clayLight, s(q, 6, 5), s(q, 4, 2)), 0, -0.1, 0),
    T(at(rotateX(cone(0.07, 0.17, C.coral, s(q, 6, 4)), Math.PI), 0, -0.17, 0)),
    beam([0, 0, 0], [0.03, -0.16, 0], 0.03, C.clayLight),
    ...fine(
      q,
      at(dome(0.064, C.cocoa, 6, 2), 0, -0.095, -0.005),
      at(blob(0.035, 0.05, 0.03, C.coral, 5, 3), 0, -0.2, 0),
      ...[-1, 1].map((sx) => beam([sx * 0.03, -0.33, 0], [sx * 0.035, -0.42, 0], 0.022, C.clayLight)),
    ),
  );

const trophy = (q: Q): Geo =>
  merge(
    lathe2(
      q,
      [
        [0.001, 0.03],
        [0.05, 0.03],
        [0.05, 0.05],
        [0.015, 0.07],
        [0.015, 0.12],
        [0.06, 0.16],
        [0.07, 0.24],
        [0.001, 0.23],
      ],
      C.butterDeep,
      6,
      5,
      [
        [0.001, 0.03],
        [0.05, 0.04],
        [0.07, 0.24],
        [0.001, 0.23],
      ],
    ),
    ...fine(
      q,
      ...[-1, 1].map((sx) => {
        const pts: readonly V3[] = [
          [sx * 0.06, 0.22, 0],
          [sx * 0.1, 0.2, 0],
          [sx * 0.06, 0.16, 0],
        ];
        return path(pts, 0.012, C.butterDeep);
      }),
    ),
  );

const handFan = (q: Q): Geo => {
  const n = s(q, 7, 5);
  const arc = Array.from({ length: n }, (_, i) => {
    const t = 0.35 + (i / (n - 1)) * (Math.PI - 0.7);
    return [Math.cos(t) * 0.2, Math.sin(t) * 0.2] as const;
  });
  return merge(
    beam([0, -0.08, 0], [0, 0.02, 0], 0.02, C.timberDeep),
    T(at(profile([[0, 0], ...arc], 0.012, C.coral), 0, 0.01, 0)),
    ...fine(q, ...[-0.5, 0, 0.5].map((a) => at(rotateZ(box(0.01, 0.2, 0.016, C.ivory), a), 0, 0.01, 0))),
  );
};

export const PLAY_PROPS: readonly HeldDef[] = [
  held('club', club),
  held('hoop', hoop),
  held('racket.tennis', racket),
  held('bat.tabletennis', ttBat),
  held('football', football),
  held('beachball', beachBall, 'RL'),
  held('teddy', teddy, 'RL'),
  held('doll', doll, 'RL'),
  held('trophy', trophy),
  held('handfan', handFan, 'RL'),
];
