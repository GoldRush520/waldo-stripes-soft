/**
 * Lower-body garments (Cat.Lower), authored on the Pelvis (hip centre; waist at y ≈ 0.05, the
 * ground at y = -0.9). Skirts are lathes slightly flattened front-to-back like basic.ts skirts.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cyl, lathe, merge, rotateZ, scale, sway, torus } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, type Q, T, at, fine, lathe2, option, s, spec, tintWhere } from './kit';

const lower = (key: string, build: Build, slot: (typeof Slot)[keyof typeof Slot] = Slot.Vertex): RigOption =>
  option(key, Cat.Lower, [spec(Part.Pelvis, slot, build)]);

const tutu = (q: Q): Geo =>
  scale(
    merge(
      T(lathe2(q, [[0.18, -0.13], [0.33, -0.1], [0.34, -0.08], [0.17, 0.06]], C.coralLight, 12, 6)),
      ...fine(q, lathe([[0.3, -0.115], [0.36, -0.105], [0.3, -0.09]], C.ivory, 12)),
    ),
    1,
    1,
    0.85,
  );

const kiltCloth = (q: Q): Geo =>
  at(scale(cyl(0.265, 0.17, 0.48, C.coral, s(q, 10, 6)), 1, 1, 0.82), 0, -0.43, 0);

const sporran = (q: Q): Geo =>
  merge(
    at(box(0.1, 0.12, 0.03, C.timberDeep), 0, -0.2, 0.16),
    ...fine(q, at(box(0.11, 0.03, 0.035, C.ivory), 0, -0.12, 0.16), at(box(0.3, 0.012, 0.012, C.cocoa), 0, -0.07, 0.15)),
  );

function coatTails(q: Q): Geo {
  const tail = (sx: number): Geo => T(at(rotateZ(box(0.13, 0.6, 0.02, C.cocoa), sx * 0.08), sx * 0.075, -0.5, -0.135));
  return merge(
    tail(-1),
    tail(1),
    ...fine(q, ...[-1, 1].map((sx) => at(box(0.02, 0.02, 0.012, C.butter), sx * 0.06, 0.0, -0.148))),
  );
}

const gownSkirt = (q: Q): Geo =>
  scale(
    lathe2(
      q,
      [
        [0.46, -0.865],
        [0.5, -0.85],
        [0.33, -0.55],
        [0.2, -0.12],
        [0.168, 0.07],
      ],
      C.coral,
      12,
      5,
      [
        [0.44, -0.865],
        [0.5, -0.85],
        [0.28, -0.4],
        [0.168, 0.07],
      ],
    ),
    1,
    1,
    0.9,
  );

const gownSash = (q: Q): Geo =>
  merge(
    ...fine(
      q,
      T(at(scale(cyl(0.178, 0.178, 0.045, C.butter, 12, false), 1, 1, 0.9), 0, 0.02, 0)),
      T(at(blob(0.04, 0.03, 0.025, C.butter, 5, 3), 0, 0.04, -0.17)),
    ),
  );

const sarong = (q: Q): Geo =>
  merge(
    T(at(scale(cyl(0.24, 0.175, 0.66, C.blue, s(q, 10, 6)), 1, 1, 0.82), 0, -0.61, 0)),
    T(at(blob(0.04, 0.05, 0.03, C.blue, s(q, 5, 4), s(q, 3, 2)), 0.15, -0.02, 0.07)),
    ...fine(q, at(rotateZ(box(0.42, 0.025, 0.015, C.ivory), 0.4), 0.02, -0.33, 0.188)),
  );

function hula(q: Q): Geo {
  const base = lathe2(q, [[0.29, -0.45], [0.25, -0.3], [0.17, 0.04]], C.sage, 9, 6);
  const blades = fine(
    q,
    ...[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const a = ((i - 3) / 7) * Math.PI * 2;
      const top: readonly [number, number, number] = [Math.sin(a) * 0.19, 0.0, Math.cos(a) * 0.19 * 0.85];
      const bot: readonly [number, number, number] = [Math.sin(a) * 0.3, -0.46, Math.cos(a) * 0.3 * 0.85];
      return beam(top, bot, 0.02, C.sageDeep);
    }),
  );
  const band = T(at(cyl(0.18, 0.18, 0.04, C.coral, s(q, 8, 5), false), 0, 0.01, 0));
  return sway(merge(scale(base, 1, 1, 0.85), blades, band), (_x, y) => Math.min(1, Math.max(0, -y * 1.5)));
}

const apronSkirt = (q: Q): Geo =>
  merge(
    T(at(box(0.32, 0.36, 0.02, C.butter), 0, -0.33, 0.14)),
    at(scale(cyl(0.178, 0.178, 0.03, C.ivory, s(q, 8, 4), false), 1, 1, 0.82), 0, 0.0, 0),
    ...fine(
      q,
      at(box(0.14, 0.09, 0.012, C.ivory), 0.06, -0.3, 0.155),
      at(box(0.32, 0.025, 0.012, C.ivory), 0, -0.48, 0.155),
    ),
  );

function swimRing(q: Q): Geo {
  const ring = scale(torus(0.23, 0.07, C.ivory, s(q, 5, 3), s(q, 12, 7)), 1, 1, 0.9);
  return at(tintWhere(ring, (x, _y, z) => Math.cos(Math.atan2(x, z) * 4) > -0.2), 0, 0.02, 0);
}

export const LOWER_OPTIONS: readonly RigOption[] = [
  lower('lower.tutu', tutu),
  option('lower.kilt', Cat.Lower, [spec(Part.Pelvis, Slot.Pants, kiltCloth), spec(Part.Pelvis, Slot.Vertex, sporran)]),
  lower('lower.coattails', coatTails),
  option('lower.ballgown', Cat.Lower, [spec(Part.Pelvis, Slot.Shirt, gownSkirt), spec(Part.Pelvis, Slot.Vertex, gownSash)]),
  lower('lower.sarong', sarong),
  lower('lower.hula', hula),
  lower('lower.apronskirt', apronSkirt),
  lower('lower.swimring', swimRing),
];
