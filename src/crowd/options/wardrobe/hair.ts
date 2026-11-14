/**
 * Extra hairstyles (Slot.Hair, Head part). Each style is a skull cap plus a few volumes; the far
 * build keeps the cap and the defining volumes at very low segment counts.
 */
import { C } from '../../../core/palette';
import { type Geo, blob, cone, dome, merge, profile, rotateX, rotateY, rotateZ, scale, sphere } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, HR, HY, type Q, at, fine, s, single } from './kit';

const H = C.cocoa;

/** Skull cap: a dome tilted back so it covers the crown and the back of the head. */
function cap(q: Q, r = HR + 0.009, tilt = -0.42, sx = 1): Geo {
  const d = dome(r, H, s(q, 8, 7), s(q, 4, 2));
  return at(scale(rotateX(d, tilt), sx, 1, 1), 0, HY + 0.012, -0.004);
}

/** Small round lump (bun, curl, pigtail tuft). */
const lump = (q: Q, rx: number, ry: number, rz: number): Geo =>
  blob(rx, ry, rz, H, s(q, 6, 4), s(q, 4, 2));

function hair(key: string, build: Build): RigOption {
  return single(key, Cat.Hair, Part.Head, Slot.Hair, build);
}

const pigtails = (q: Q): Geo =>
  merge(
    cap(q),
    [-1, 1].map((sx) => at(rotateZ(lump(q, 0.04, 0.095, 0.042), sx * 0.45), sx * 0.15, HY - 0.06, -0.05)),
  );

function braids(q: Q): Geo {
  const strand = (sx: number): Geo[] =>
    q === 'near'
      ? [0, 1].map((i) => at(sphere(0.036 - i * 0.006, H, 4, 3), sx * 0.1, HY - 0.085 - i * 0.07, -0.08))
      : [at(rotateX(cone(0.035, 0.2, H, 4), Math.PI), sx * 0.1, HY - 0.04, -0.08)];
  return merge(cap(q), strand(-1), strand(1));
}

const longWavy = (q: Q): Geo =>
  merge(
    cap(q, HR + 0.012),
    at(blob(0.155, 0.2, 0.08, H, s(q, 7, 5), s(q, 4, 3)), 0, HY - 0.08, -0.075),
    ...fine(q, ...[-1, 1].map((sx) => at(blob(0.04, 0.1, 0.05, H, 5, 3), sx * 0.13, HY - 0.07, 0.02))),
  );

const afro = (q: Q): Geo => at(sphere(0.205, H, s(q, 10, 6), s(q, 6, 4)), 0, HY + 0.06, -0.03);

function mohawk(q: Q): Geo {
  const fin = profile(
    [
      [0.1, 0],
      [0.13, 0.06],
      [0.05, 0.13],
      [-0.06, 0.12],
      [-0.16, 0.03],
      [-0.12, -0.02],
    ],
    0.045,
    H,
  );
  return merge(cap(q, HR + 0.003, -0.3, 0.92), at(rotateY(fin, -Math.PI / 2), 0, HY + 0.11, 0));
}

function spiky(q: Q): Geo {
  const spikes: ReadonlyArray<readonly [number, number, number]> =
    q === 'near'
      ? [
          [0, 0.0, 0.02],
          [0.4, 0.3, 0.06],
          [-0.4, 0.3, 0.06],
          [0.3, -0.4, -0.04],
          [-0.3, -0.4, -0.04],
          [0, -0.7, -0.08],
        ]
      : [
          [0.3, 0.2, 0.02],
          [-0.3, 0.2, 0.02],
          [0, -0.5, -0.06],
        ];
  return merge(
    cap(q),
    spikes.map(([rz, rx, z]) => at(rotateX(rotateZ(cone(0.04, 0.12, H, s(q, 5, 4)), rz), rx), 0, HY + 0.1, z)),
  );
}

const quiff = (q: Q): Geo =>
  merge(
    cap(q, HR + 0.005, -0.3, 0.88),
    at(rotateX(blob(0.07, 0.05, 0.07, H, s(q, 7, 5), s(q, 4, 2)), -0.4), 0, HY + 0.12, 0.07),
  );

const elderSides = (q: Q): Geo =>
  merge(
    [-1, 1].map((sx) => at(lump(q, 0.035, 0.055, 0.075), sx * 0.118, HY + 0.01, -0.03)),
    at(lump(q, 0.1, 0.055, 0.04), 0, HY + 0.0, -0.105),
  );

const topknot = (q: Q): Geo => merge(cap(q), at(sphere(0.05, H, s(q, 6, 4), s(q, 4, 2)), 0, HY + 0.15, -0.02));

const twinBuns = (q: Q): Geo =>
  merge(
    cap(q),
    [-1, 1].map((sx) => at(sphere(0.048, H, s(q, 6, 4), s(q, 4, 2)), sx * 0.09, HY + 0.12, -0.02)),
  );

const curtain = (q: Q): Geo =>
  merge(
    cap(q, HR + 0.01),
    [-1, 1].map((sx) => at(rotateZ(lump(q, 0.05, 0.035, 0.035), sx * 0.5), sx * 0.06, HY + 0.08, 0.1)),
  );

const crew = (q: Q): Geo => cap(q, HR + 0.004, -0.28);

const longFringe = (q: Q): Geo =>
  merge(
    cap(q, HR + 0.01),
    at(blob(0.14, 0.19, 0.07, H, s(q, 7, 5), s(q, 4, 3)), 0, HY - 0.07, -0.08),
    ...fine(q, at(rotateX(blob(0.1, 0.03, 0.04, H, 6, 3), 0.3), 0, HY + 0.075, 0.105)),
  );

function shortCurly(q: Q): Geo {
  const curls: ReadonlyArray<readonly [number, number, number]> =
    q === 'near'
      ? [
          [-0.075, 0.1, 0.02],
          [0.075, 0.1, 0.02],
          [0, 0.13, -0.04],
          [0, 0.06, -0.11],
        ]
      : [
          [-0.06, 0.11, 0],
          [0.06, 0.11, 0],
        ];
  return merge(
    cap(q, HR + 0.012),
    curls.map(([x, y, z]) => at(sphere(0.055, H, s(q, 5, 4), s(q, 3, 2)), x, HY + y, z)),
  );
}

export const HAIR_OPTIONS: readonly RigOption[] = [
  hair('hair.pigtails', pigtails),
  hair('hair.braids', braids),
  hair('hair.long.wavy', longWavy),
  hair('hair.afro', afro),
  hair('hair.mohawk', mohawk),
  hair('hair.spiky', spiky),
  hair('hair.quiff', quiff),
  hair('hair.elder', elderSides),
  hair('hair.topknot', topknot),
  hair('hair.buns.twin', twinBuns),
  hair('hair.curtain', curtain),
  hair('hair.crew', crew),
  hair('hair.long.fringe', longFringe),
  hair('hair.curly.short', shortCurly),
];
