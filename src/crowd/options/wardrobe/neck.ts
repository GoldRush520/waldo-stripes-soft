/**
 * Things worn around the neck (Cat.Neck), authored on the Torso part. Cords follow the neckline
 * curve from torso.ts so they sit on the shoulders and drop to the chest.
 */
import { C } from '../../../core/palette';
import { type Col, type Geo, box, cyl, merge, profile, rotateX, scale, sphere, sway, torus } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, type Meta, type Q, T, type V3, at, fine, option, path, s, spec } from './kit';
import { cordSides, neckLoop, slab } from './torso';

const neck = (key: string, build: Build, meta: Meta = {}): RigOption =>
  option(key, Cat.Neck, [spec(Part.Torso, Slot.Vertex, build)], meta);

const cord = (item: V3, t: number, col: Col): Geo => merge(cordSides(item).map((pts) => path(pts, t, col)));

/** Cylinder with its axis along z (lenses, discs facing forward). */
const fwdCyl = (r: number, h: number, col: Col, seg: number): Geo => rotateX(at(cyl(r, r, h, col, seg), 0, -h / 2, 0), Math.PI / 2);

const camera = (q: Q): Geo =>
  merge(
    at(box(0.12, 0.08, 0.05, C.ink), 0, 0.25, 0.15),
    at(fwdCyl(0.026, 0.045, C.slate, s(q, 6, 4)), 0, 0.29, 0.19),
    ...fine(q, cord([0, 0.31, 0.15], 0.008, C.cocoa), at(box(0.02, 0.012, 0.02, C.coral), 0.04, 0.33, 0.15)),
  );

const binoculars = (q: Q): Geo =>
  merge(
    [-1, 1].map((sx) => at(cyl(0.026, 0.024, 0.11, C.sageDeep, s(q, 6, 4)), sx * 0.032, 0.2, 0.155)),
    ...fine(q, at(box(0.04, 0.03, 0.03, C.ink), 0, 0.27, 0.155), cord([0, 0.3, 0.15], 0.008, C.cocoa)),
  );

const medal = (): Geo =>
  merge(T(cord([0, 0.3, 0.135], 0.016, C.coral)), at(fwdCyl(0.035, 0.008, C.butter, 8), 0, 0.27, 0.14));

const whistle = (): Geo =>
  merge(
    T(cord([0, 0.31, 0.134], 0.006, C.coral)),
    at(rotateX(cyl(0.012, 0.012, 0.05, C.slate, 5), Math.PI / 2), 0, 0.295, 0.12),
    at(box(0.02, 0.02, 0.02, C.slate), 0, 0.282, 0.14),
  );

const shortScarf = (q: Q): Geo =>
  merge(
    T(at(scale(torus(0.085, 0.035, C.blue, s(q, 4, 3), s(q, 10, 5)), 1, 1, 0.95), 0, 0.475, 0.0)),
    sway(T(slab([0.05, 0.46, 0.11], [0.06, 0.3, 0.135], 0.07, 0.02, C.blue)), (_x, y) => Math.min(1, (0.46 - y) / 0.16)),
    ...fine(q, at(box(0.07, 0.025, 0.022, C.ivory), 0.06, 0.3, 0.135)),
  );

function beads(): Geo {
  const pts = neckLoop(12, 0.06);
  return merge(pts.map(([x, y, z], i) => (i % 2 === 0 ? T(at(sphere(0.016, C.ivory, 4, 2), x, y, z + 0.004)) : at(sphere(0.014, C.ivory, 4, 2), x, y, z + 0.004))));
}

const bandanaNeck = (q: Q): Geo =>
  merge(
    T(at(torus(0.08, 0.022, C.coral, s(q, 4, 3), s(q, 10, 5)), 0, 0.47, 0.0)),
    T(
      at(
        rotateX(
          profile(
            [
              [-0.08, 0],
              [0, -0.12],
              [0.08, 0],
            ],
            0.014,
            C.coral,
          ),
          -0.3,
        ),
        0,
        0.46,
        0.1,
      ),
    ),
  );

const lanyard = (): Geo =>
  merge(
    T(cord([0, 0.27, 0.132], 0.01, C.blue)),
    at(box(0.07, 0.1, 0.008, C.white), 0, 0.15, 0.136),
    at(box(0.02, 0.025, 0.012, C.slate), 0, 0.245, 0.135),
  );

export const NECK_OPTIONS: readonly RigOption[] = [
  neck('neck.camera', camera),
  neck('neck.binoculars', binoculars),
  neck('neck.medal', medal, { nearOnly: true }),
  neck('neck.whistle', whistle, { nearOnly: true }),
  neck('neck.scarf.short', shortScarf),
  neck('neck.beads', beads, { nearOnly: true }),
  neck('neck.bandana', bandanaNeck),
  neck('neck.lanyard', lanyard, { nearOnly: true }),
];
