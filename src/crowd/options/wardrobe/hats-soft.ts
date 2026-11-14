/**
 * Caps, wraps, helmets and festival headwear (Head part).
 */
import { C } from '../../../core/palette';
import {
  type Geo,
  blob,
  box,
  cone,
  cyl,
  dome,
  merge,
  prism,
  profile,
  rotateX,
  rotateY,
  rotateZ,
  scale,
  sphere,
} from '../../../core/geo';
import type { RigOption } from '../../rig';
import { HR, HY, type Q, T, at, fine, s, tintWhere } from './kit';
import { hat, ribbon, turned } from './hats-brim';

/** Horizontal half-disc (cap bill / peak) pointing toward +z, `n` rim points. */
function bill(rx: number, rz: number, n: number, col: Parameters<typeof box>[3]): Geo {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / (n - 1)) * Math.PI;
    return [Math.cos(a) * rx, Math.sin(a) * rz] as const;
  });
  return rotateX(profile(pts, 0.012, col), Math.PI / 2);
}

const officer = (q: Q): Geo =>
  merge(
    turned(
      q,
      [
        [0.13, 0.05],
        [0.135, 0.1],
        [0.175, 0.15],
        [0.17, 0.168],
        [0.001, 0.162],
      ],
      C.blueDeep,
      [
        [0.13, 0.05],
        [0.135, 0.1],
        [0.175, 0.16],
        [0.001, 0.162],
      ],
      10,
      5,
    ),
    at(rotateX(box(0.17, 0.012, 0.08, C.ink), 0.3), 0, HY + 0.045, 0.14),
    ...fine(q, ribbon(q, 0.137, 0.05, 0.045), at(sphere(0.016, C.butter, 4, 2), 0, HY + 0.12, 0.15)),
  );

const pillbox = (q: Q): Geo =>
  rotateZ(
    merge(
      T(at(cyl(0.1, 0.1, 0.075, C.coral, s(q, 10, 6)), 0, HY + 0.1, 0.01)),
      ...fine(
        q,
        at(cyl(0.103, 0.103, 0.02, C.ivory, 10, false), 0, HY + 0.11, 0.01),
        at(box(0.006, 0.006, 0.12, C.ink), 0, HY + 0.1, 0.06),
      ),
    ),
    0.14,
  );

const baker = (q: Q): Geo =>
  merge(
    at(blob(0.155, 0.06, 0.15, C.white, s(q, 8, 6), s(q, 4, 2)), 0, HY + 0.13, -0.01),
    at(cyl(0.136, 0.14, 0.06, C.ivory, s(q, 10, 5), false), 0, HY + 0.06, 0),
  );

const headscarf = (q: Q): Geo =>
  merge(
    T(at(rotateX(dome(HR + 0.014, C.coral, s(q, 9, 7), s(q, 4, 2)), -0.55), 0, HY + 0.01, -0.01)),
    [-1, 1].map((sx) =>
      T(at(blob(0.03, 0.08, 0.05, C.coral, s(q, 5, 4), s(q, 3, 2)), sx * 0.115, HY - 0.06, 0.02)),
    ),
    T(at(blob(0.035, 0.03, 0.03, C.coral, s(q, 5, 4), s(q, 3, 2)), 0, HY - 0.145, 0.08)),
    ...fine(
      q,
      ...[-0.05, 0.05].map((x) => at(sphere(0.013, C.ivory, 4, 2), x, HY + 0.11, 0.08)),
    ),
  );

const turban = (q: Q): Geo =>
  merge(
    T(
      turned(
        q,
        [
          [0.13, 0.03],
          [0.158, 0.06],
          [0.165, 0.12],
          [0.135, 0.19],
          [0.06, 0.215],
          [0.001, 0.21],
        ],
        C.blue,
        [
          [0.13, 0.03],
          [0.165, 0.11],
          [0.08, 0.21],
          [0.001, 0.21],
        ],
      ),
    ),
    ...fine(q, at(sphere(0.02, C.butter, 5, 3), 0, HY + 0.12, 0.165)),
  );

function crown(q: Q): Geo {
  const points = [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return at(cone(0.03, 0.07, C.butter, s(q, 4, 3)), Math.sin(a) * 0.11, HY + 0.15, Math.cos(a) * 0.11);
  });
  const jewels = [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return at(sphere(0.014, C.coral, 4, 2), Math.sin(a) * 0.118, HY + 0.12, Math.cos(a) * 0.118);
  });
  return merge(
    at(cyl(0.115, 0.115, 0.06, C.butter, s(q, 10, 6), false), 0, HY + 0.095, 0),
    points,
    ...fine(q, ...jewels, T(at(dome(0.11, C.coral, 8, 2), 0, HY + 0.1, 0))),
  );
}

function jester(q: Q): Geo {
  const base = tintWhere(at(dome(HR + 0.012, C.ivory, s(q, 9, 6), s(q, 3, 2)), 0, HY + 0.03, 0), (x) => x > 0);
  const horn = (sx: number): Geo => {
    const g = at(rotateZ(cone(0.05, 0.2, C.ivory, s(q, 6, 4)), -sx * 1.15), sx * 0.08, HY + 0.12, 0);
    return sx > 0 ? T(g) : g;
  };
  return merge(
    base,
    horn(-1),
    horn(1),
    ...fine(q, ...[-1, 1].map((sx) => at(sphere(0.025, C.butter, 5, 3), sx * 0.27, HY + 0.18, 0))),
  );
}

function tricorn(q: Q): Geo {
  const R = 0.26;
  const corners = [0, 1, 2].map((i) => [Math.sin((i * 2 * Math.PI) / 3) * R, Math.cos((i * 2 * Math.PI) / 3) * R] as const);
  if (q === 'far') {
    return merge(
      at(prism(corners, 0.07, C.cocoa), 0, HY + 0.05, 0),
      at(dome(0.12, C.cocoa, 5, 2), 0, HY + 0.06, 0),
    );
  }
  const walls = [1, 3, 5].map((k) => {
    const m = (k * Math.PI) / 3;
    const wall = rotateY(rotateX(box(0.42, 0.08, 0.02, C.cocoa), 0.3), m);
    const trim = rotateY(rotateX(at(box(0.42, 0.012, 0.026, C.butterLight), 0, 0.08, 0), 0.3), m);
    return [at(wall, Math.sin(m) * 0.13, HY + 0.05, Math.cos(m) * 0.13), at(trim, Math.sin(m) * 0.13, HY + 0.05, Math.cos(m) * 0.13)];
  });
  return merge(at(dome(0.122, C.cocoa, 8, 3), 0, HY + 0.06, 0), walls);
}

const cycling = (q: Q): Geo =>
  merge(
    T(at(scale(rotateX(dome(0.15, C.coral, s(q, 10, 7), s(q, 4, 3)), -0.15), 1, 0.85, 1.22), 0, HY + 0.035, -0.01)),
    ...fine(q, ...[-0.05, 0, 0.05].map((x) => at(box(0.018, 0.012, 0.2, C.ivory), x, HY + 0.155, -0.01))),
  );

const swimcap = (q: Q): Geo =>
  merge(
    T(at(scale(rotateX(dome(HR + 0.007, C.blue, s(q, 10, 7), s(q, 4, 3)), -0.3), 1, 1.08, 1), 0, HY + 0.0, -0.005)),
    ...fine(
      q,
      at(sphere(0.03, C.ivory, 5, 3), 0.09, HY + 0.1, 0.06),
      at(sphere(0.014, C.butter, 5, 3), 0.1, HY + 0.11, 0.085),
    ),
  );

const earflap = (q: Q): Geo =>
  merge(
    T(at(scale(dome(HR + 0.013, C.sage, s(q, 9, 6), s(q, 4, 2)), 1, 1.1, 1), 0, HY + 0.035, 0)),
    [-1, 1].map((sx) => T(at(box(0.022, 0.1, 0.075, C.sage), sx * 0.135, HY - 0.07, -0.01))),
    ...fine(
      q,
      at(cyl(0.147, 0.147, 0.035, C.ivory, 9, false), 0, HY + 0.035, 0),
      at(sphere(0.035, C.ivory, 5, 3), 0, HY + 0.185, 0),
    ),
  );

const graduation = (q: Q): Geo =>
  merge(
    at(dome(HR + 0.01, C.ink, s(q, 9, 6), s(q, 3, 2)), 0, HY + 0.04, 0),
    at(rotateY(box(0.3, 0.018, 0.3, C.ink), Math.PI / 4), 0, HY + 0.165, 0),
    ...fine(
      q,
      at(cyl(0.012, 0.012, 0.012, C.ink, 4), 0, HY + 0.183, 0),
      T(at(box(0.006, 0.006, 0.16, C.butter), 0.003, HY + 0.19, 0.08)),
      T(at(cyl(0.012, 0.008, 0.07, C.butter, 4), 0.003, HY + 0.12, 0.16)),
    ),
  );

const visor = (q: Q): Geo =>
  merge(
    T(at(cyl(0.137, 0.137, 0.04, C.coral, s(q, 10, 6), false), 0, HY + 0.05, 0)),
    T(at(rotateX(bill(0.11, 0.1, s(q, 7, 5), C.coral), 0.15), 0, HY + 0.06, 0.1)),
  );

const bandana = (q: Q): Geo =>
  merge(
    T(at(rotateX(dome(HR + 0.011, C.coral, s(q, 9, 7), s(q, 4, 2)), -0.5), 0, HY + 0.012, -0.005)),
    T(at(blob(0.03, 0.025, 0.025, C.coral, s(q, 5, 4), s(q, 3, 2)), 0, HY + 0.03, -0.14)),
    ...fine(
      q,
      ...[-1, 1].map((sx) => T(at(rotateZ(box(0.03, 0.09, 0.014, C.coral), sx * 0.35), sx * 0.02, HY - 0.03, -0.145))),
      ...[-0.06, 0.06].map((x) => at(sphere(0.012, C.ivory, 4, 2), x, HY + 0.12, 0.075)),
    ),
  );

const tiara = (): Geo =>
  rotateX(
    merge(
      at(cyl(0.105, 0.105, 0.014, C.butter, 8, false), 0, HY + 0.09, 0),
      [-0.5, 0, 0.5].map((a) => at(cone(0.016, 0.05 - Math.abs(a) * 0.03, C.butter, 4), Math.sin(a) * 0.105, HY + 0.1, Math.cos(a) * 0.105)),
      [-0.5, 0, 0.5].map((a) => at(sphere(0.011, C.blueLight, 4, 2), Math.sin(a) * 0.108, HY + 0.11, Math.cos(a) * 0.108)),
    ),
    -0.3,
  );

function headdress(q: Q): Geo {
  const band = T(at(cyl(0.137, 0.137, 0.04, C.coral, s(q, 10, 6), false), 0, HY + 0.06, 0));
  if (q === 'far') {
    return merge(band, T(at(rotateX(bill(0.2, 0.2, 7, C.coral), -Math.PI / 2), 0, HY + 0.1, -0.06)));
  }
  const feathers = [-3, -2, -1, 0, 1, 2, 3].map((i) => {
    const a = i * 0.38;
    const f = at(rotateZ(blob(0.026, 0.12, 0.012, C.ivory, 4, 3), -a), Math.sin(a) * 0.15, HY + 0.11 + Math.cos(a) * 0.12, -0.06);
    return i % 2 === 0 ? T(f) : f;
  });
  return merge(band, feathers);
}

const deerstalker = (q: Q): Geo =>
  merge(
    T(at(scale(dome(HR + 0.013, C.clay, s(q, 9, 6), s(q, 4, 2)), 1, 1.05, 1.05), 0, HY + 0.035, 0)),
    at(rotateX(bill(0.08, 0.07, s(q, 6, 4), C.clayDeep), 0.25), 0, HY + 0.045, 0.125),
    at(rotateY(rotateX(bill(0.08, 0.07, s(q, 6, 4), C.clayDeep), 0.25), Math.PI), 0, HY + 0.045, -0.125),
    ...fine(q, ...[-1, 1].map((sx) => at(rotateZ(box(0.02, 0.08, 0.06, C.clayDeep), sx * 0.4), sx * 0.07, HY + 0.17, 0))),
  );

export const SOFT_HATS: readonly RigOption[] = [
  hat('hat.officer', officer),
  hat('hat.pillbox', pillbox),
  hat('hat.baker', baker),
  hat('hat.headscarf', headscarf),
  hat('hat.turban', turban),
  hat('hat.crown', crown),
  hat('hat.jester', jester),
  hat('hat.tricorn', tricorn),
  hat('hat.cycling', cycling),
  hat('hat.swimcap', swimcap),
  hat('hat.earflap', earflap),
  hat('hat.graduation', graduation),
  hat('hat.visor', visor),
  hat('hat.bandana', bandana),
  hat('hat.headdress', headdress),
  hat('hat.deerstalker', deerstalker),
  hat('hat.tiara', tiara, { nearOnly: true }),
];
