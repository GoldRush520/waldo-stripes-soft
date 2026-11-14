/**
 * Vests, straps and chest pieces (Cat.Upper) on the Torso part (waist at y = 0, shoulders at
 * y ≈ 0.44, chest front z ≈ 0.12).
 */
import { C } from '../../../core/palette';
import { type Geo, blob, box, cone, cyl, merge, profile, rotateX, rotateZ, scale, sphere, torus } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, type Meta, type Q, T, type V3, at, fine, option, path, s, spec } from './kit';
import { frontZ, shell, shellFront, torsoR } from './torso';

export const upper = (key: string, build: Build, meta: Meta = {}): RigOption =>
  option(key, Cat.Upper, [spec(Part.Torso, Slot.Vertex, build)], meta);

const waistcoatShell = (q: Q): Geo =>
  merge(
    T(shell(q, 0.0, 0.43, 0.014, C.cocoa)),
    ...fine(q, ...[0.08, 0.14, 0.2].map((y) => at(sphere(0.011, C.butter, 4, 2), 0, y, shellFront(0, y, 0.014, 0.006)[2]))),
  );

/** Shirt-coloured V showing at the waistcoat's neck opening. */
const waistcoatV = (): Geo =>
  at(
    rotateX(
      profile(
        [
          [-0.07, 0.06],
          [0, -0.12],
          [0.07, 0.06],
        ],
        0.01,
        C.ivory,
      ),
      -0.1,
    ),
    0,
    0.37,
    0.132,
  );

function hiVis(q: Q): Geo {
  const band = (y: number): Geo =>
    at(scale(cyl(torsoR(y) + 0.026, torsoR(y + 0.035) + 0.026, 0.035, C.ivory, s(q, 10, 6), false), 1, 1, 0.72), 0, y, 0);
  return merge(T(shell(q, 0.0, 0.43, 0.016, C.butter)), band(0.12), ...fine(q, band(0.28)));
}

const lifeJacket = (q: Q): Geo =>
  merge(
    T(shell(q, 0.05, 0.42, 0.045, C.coral)),
    at(box(0.34, 0.03, 0.02, C.ivory), 0, 0.15, shellFront(0, 0.15, 0.045, 0.004)[2]),
    ...fine(
      q,
      at(box(0.32, 0.03, 0.02, C.ivory), 0, 0.27, shellFront(0, 0.27, 0.045, 0.004)[2]),
      at(box(0.04, 0.04, 0.02, C.ink), 0, 0.145, shellFront(0, 0.15, 0.045, 0.014)[2]),
    ),
  );

function suspenders(q: Q): Geo {
  const side = (sx: number): Geo => {
    const x = sx * 0.085;
    const f = (y: number): V3 => [x, y, frontZ(x, y) + 0.012];
    const b = (y: number): V3 => [x, y, -frontZ(x, y) - 0.012];
    const pts: readonly V3[] = q === 'near' ? [f(0.02), f(0.32), [x, 0.48, 0], b(0.32), b(0.02)] : [f(0.02), f(0.44)];
    return T(path(pts, 0.022, C.coral));
  };
  return merge(
    side(-1),
    side(1),
    ...fine(q, ...[-1, 1].map((sx) => at(box(0.035, 0.03, 0.012, C.butterDeep), sx * 0.085, 0.03, frontZ(0.085, 0.04) + 0.024))),
  );
}

const sash = (q: Q): Geo =>
  merge(
    T(at(scale(rotateZ(torus(0.26, 0.018, C.coral, 3, s(q, 12, 6)), 0.85), 1, 1, 0.52), 0, 0.24, 0)),
    ...fine(q, at(blob(0.04, 0.04, 0.012, C.butter, 5, 3), -0.14, 0.07, 0.115)),
  );

const tie = (): Geo =>
  merge(
    T(at(box(0.036, 0.034, 0.03, C.coral), 0, 0.415, 0.108)),
    T(
      at(
        profile(
          [
            [-0.022, 0.41],
            [-0.035, 0.17],
            [0, 0.135],
            [0.035, 0.17],
            [0.022, 0.41],
          ],
          0.012,
          C.coral,
        ),
        0,
        0,
        0.128,
      ),
    ),
  );

const bowTie = (): Geo =>
  merge(
    [-1, 1].map((sx) => T(at(rotateZ(cone(0.026, 0.045, C.coral, 4), sx * (Math.PI / 2)), sx * 0.045, 0.45, 0.1))),
    at(box(0.022, 0.024, 0.024, C.coralDeep), 0, 0.438, 0.1),
  );

function bib(q: Q): Geo {
  const board = (z: number): Geo => T(at(box(0.22, 0.26, 0.012, C.blue), 0, 0.12, z));
  return merge(
    board(0.133),
    board(-0.133),
    at(box(0.13, 0.12, 0.012, C.ivory), 0, 0.19, 0.14),
    ...fine(
      q,
      at(box(0.13, 0.12, 0.012, C.ivory), 0, 0.19, -0.14),
      ...[-0.025, 0.025].map((x) => at(box(0.018, 0.08, 0.008, C.ink), x, 0.21, 0.148)),
    ),
  );
}

export const VEST_OPTIONS: readonly RigOption[] = [
  option('upper.waistcoat', Cat.Upper, [spec(Part.Torso, Slot.Vertex, waistcoatShell), spec(Part.Torso, Slot.Shirt, waistcoatV)]),
  upper('upper.hivis', hiVis),
  upper('upper.lifejacket', lifeJacket),
  upper('upper.suspenders', suspenders),
  upper('upper.sash', sash),
  upper('upper.tie', tie),
  upper('upper.bowtie', bowTie, { nearOnly: true }),
  upper('upper.bib', bib),
];
