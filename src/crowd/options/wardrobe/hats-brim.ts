/**
 * Brimmed and lathe-turned hats (Head part). Profiles are [radius, y] pairs above the head centre,
 * traced from the brim underside outwards, up the crown and in to the axis so faces point outward.
 */
import { C } from '../../../core/palette';
import { type Col, type Geo, cyl, merge, scale, sphere } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, HY, type Meta, type Q, T, at, fine, lathe2, s, single, tintWhere } from './kit';

type Profile = ReadonlyArray<readonly [number, number]>;

export function hat(key: string, build: Build, meta: Meta = {}): RigOption {
  return single(key, Cat.Hat, Part.Head, Slot.Vertex, build, meta);
}

/** Lathe a hat profile (offset to the head centre). Far tier uses `farPts` at 5 segments. */
export function turned(q: Q, pts: Profile, col: Col, farPts: Profile, nearSeg = 10, farSeg = 5): Geo {
  const lift = (p: Profile): Profile => p.map(([r, y]) => [r, HY + y] as const);
  return lathe2(q, lift(pts), col, nearSeg, farSeg, lift(farPts));
}

/** Open ribbon band around a crown (tinted). */
export const ribbon = (q: Q, r: number, y: number, h: number, col: Col = C.coral): Geo =>
  T(at(cyl(r, r, h, col, s(q, 10, 5), false), 0, HY + y, 0));

const strawWide = (q: Q): Geo =>
  merge(
    turned(
      q,
      [
        [0.125, 0.045],
        [0.3, 0.035],
        [0.305, 0.05],
        [0.14, 0.065],
        [0.128, 0.16],
        [0.001, 0.172],
      ],
      C.butterLight,
      [
        [0.125, 0.045],
        [0.3, 0.035],
        [0.14, 0.065],
        [0.12, 0.165],
        [0.001, 0.172],
      ],
      10,
      4,
    ),
    ...fine(q, ribbon(q, 0.137, 0.07, 0.035)),
  );

const cowboy = (q: Q): Geo =>
  scale(
    merge(
      turned(
        q,
        [
          [0.125, 0.05],
          [0.23, 0.055],
          [0.26, 0.105],
          [0.235, 0.1],
          [0.135, 0.075],
          [0.12, 0.2],
          [0.001, 0.185],
        ],
        C.timber,
        [
          [0.125, 0.05],
          [0.25, 0.09],
          [0.135, 0.075],
          [0.12, 0.2],
          [0.001, 0.185],
        ],
        10,
        4,
      ),
      ...fine(q, ribbon(q, 0.133, 0.08, 0.025, C.cocoa)),
    ),
    0.95,
    1,
    1.12,
  );

const fedora = (q: Q): Geo =>
  merge(
    T(
      turned(
        q,
        [
          [0.125, 0.05],
          [0.2, 0.05],
          [0.205, 0.066],
          [0.135, 0.07],
          [0.12, 0.19],
          [0.06, 0.17],
          [0.001, 0.178],
        ],
        C.slate,
        [
          [0.125, 0.05],
          [0.2, 0.058],
          [0.135, 0.07],
          [0.115, 0.19],
          [0.001, 0.175],
        ],
        10,
        4,
      ),
    ),
    at(cyl(0.134, 0.13, 0.03, C.cocoa, s(q, 10, 4), false), 0, HY + 0.072, 0),
  );

const bowler = (q: Q): Geo =>
  merge(
    turned(
      q,
      [
        [0.125, 0.05],
        [0.17, 0.052],
        [0.18, 0.075],
        [0.138, 0.07],
        [0.14, 0.14],
        [0.09, 0.205],
        [0.001, 0.215],
      ],
      C.cocoa,
      [
        [0.125, 0.05],
        [0.175, 0.065],
        [0.14, 0.13],
        [0.07, 0.205],
        [0.001, 0.212],
      ],
    ),
    ...fine(q, ribbon(q, 0.141, 0.075, 0.022, C.ink)),
  );

const sombrero = (q: Q): Geo =>
  merge(
    T(
      turned(
        q,
        [
          [0.13, 0.05],
          [0.38, 0.06],
          [0.4, 0.11],
          [0.37, 0.095],
          [0.14, 0.075],
          [0.06, 0.29],
          [0.001, 0.295],
        ],
        C.butter,
        [
          [0.13, 0.05],
          [0.39, 0.09],
          [0.14, 0.075],
          [0.05, 0.29],
          [0.001, 0.295],
        ],
        9,
        4,
      ),
    ),
    ...fine(q, at(cyl(0.142, 0.122, 0.04, C.coral, 9, false), 0, HY + 0.08, 0)),
  );

const dixie = (q: Q): Geo =>
  turned(
    q,
    [
      [0.125, 0.04],
      [0.15, 0.03],
      [0.165, 0.09],
      [0.15, 0.095],
      [0.13, 0.17],
      [0.001, 0.18],
    ],
    C.white,
    [
      [0.125, 0.04],
      [0.165, 0.09],
      [0.13, 0.17],
      [0.001, 0.18],
    ],
  );

const bucket = (q: Q): Geo =>
  merge(
    T(
      turned(
        q,
        [
          [0.13, 0.04],
          [0.21, -0.01],
          [0.215, 0.006],
          [0.14, 0.07],
          [0.125, 0.17],
          [0.001, 0.175],
        ],
        C.sage,
        [
          [0.13, 0.04],
          [0.215, 0.0],
          [0.14, 0.07],
          [0.125, 0.17],
          [0.001, 0.175],
        ],
      ),
    ),
    ...fine(q, at(cyl(0.142, 0.136, 0.02, C.ivory, 10, false), 0, HY + 0.075, 0)),
  );

const magician = (q: Q): Geo =>
  merge(
    turned(
      q,
      [
        [0.125, 0.05],
        [0.19, 0.055],
        [0.195, 0.07],
        [0.115, 0.075],
        [0.122, 0.36],
        [0.001, 0.362],
      ],
      C.ink,
      [
        [0.125, 0.05],
        [0.19, 0.06],
        [0.115, 0.075],
        [0.122, 0.36],
        [0.001, 0.362],
      ],
      10,
      4,
    ),
    T(at(cyl(0.121, 0.121, 0.045, C.coral, s(q, 10, 4), false), 0, HY + 0.085, 0)),
  );

const fez = (q: Q): Geo =>
  merge(
    T(at(cyl(0.118, 0.095, 0.15, C.coralDeep, s(q, 10, 6)), 0, HY + 0.08, 0)),
    ...fine(
      q,
      at(cyl(0.004, 0.004, 0.08, C.ink, 4), 0.0, HY + 0.17, -0.06),
      at(sphere(0.012, C.ink, 5, 3), 0.0, HY + 0.165, -0.1),
    ),
  );

const beekeeper = (q: Q): Geo =>
  turned(
      q,
      [
        [0.17, 0.06],
        [0.17, -0.2],
        [0.188, -0.21],
        [0.19, 0.05],
        [0.27, 0.05],
        [0.272, 0.066],
        [0.13, 0.08],
        [0.122, 0.17],
        [0.001, 0.178],
      ],
      C.ivory,
      [
        [0.18, -0.21],
        [0.19, 0.05],
        [0.27, 0.06],
        [0.125, 0.17],
        [0.001, 0.178],
      ],
      8,
      5,
    );

/** Flower crown: a sage ring with tinted blossoms (soft-striped ring in the far tier). */
function flowerCrown(q: Q): Geo {
  if (q === 'far') {
    const ring = at(cyl(0.142, 0.142, 0.04, C.sage, 8, false), 0, HY + 0.07, 0);
    return tintWhere(ring, (x, _y, z) => Math.sin(Math.atan2(x, z) * 4) > 0);
  }
  const ring = at(cyl(0.14, 0.14, 0.022, C.sageDeep, 10, false), 0, HY + 0.08, 0);
  const blossoms = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return T(at(sphere(0.03, C.coral, 5, 3), Math.sin(a) * 0.142, HY + 0.09, Math.cos(a) * 0.142));
  });
  return merge(ring, blossoms);
}

export const BRIM_HATS: readonly RigOption[] = [
  hat('hat.straw.wide', strawWide),
  hat('hat.cowboy', cowboy),
  hat('hat.fedora', fedora),
  hat('hat.bowler', bowler),
  hat('hat.sombrero', sombrero),
  hat('hat.dixie', dixie),
  hat('hat.bucket', bucket),
  hat('hat.top.tall', magician),
  hat('hat.fez', fez),
  hat('hat.beekeeper', beekeeper),
  hat('hat.flowercrown', flowerCrown),
];
