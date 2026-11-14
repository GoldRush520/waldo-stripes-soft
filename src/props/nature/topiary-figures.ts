/** Figurative topiary: peacock, rabbit, elephant, swan, teapot, chess knight, snail, escaped creature. */
import { type Col, type Geo, cone, cyl, dome, merge, profile, sphere, translate } from '../../core/geo';
import { type Q, type V3, chain, ell, ellR, hiOnly, limb, orient, pair } from './kit';
import { clip, plinth } from './topiary';

/** Small dark accent ball (eyes, spots). */
export function dot(p: V3, r: number, color: Col = 'ink'): Geo {
  return translate(sphere(r, color, 4, 2), p[0], p[1], p[2]);
}

export function peacock(q: Q): Geo {
  const fan = ellR(q, 'big', [0, 1.25, -0.28], [0.85, 0.72, 0.1], [-0.3, 0, 0], 'sage');
  const body = ell(q, 'mid', 0, 0.75, 0.05, 0.28, 0.3, 0.36, 'sageDeep');
  const neck = limb([0, 0.92, 0.28], [0, 1.32, 0.4], 0.1, 0.07, 'sageDeep', q.s(6, 3));
  const head = ell(q, q.hi ? 'small' : 'nub', 0, 1.42, 0.44, 0.11, 0.11, 0.12, 'sageDeep');
  const spots = hiOnly(q, () => [
    ...[-0.55, -0.28, 0, 0.28, 0.55].map((x) => dot([x, 1.25 + 0.42 * (1 - Math.abs(x)), -0.15 - 0.1 * (1 - Math.abs(x))], 0.06, 'blue')),
    limb([0, 1.5, 0.44], [0, 1.66, 0.4], 0.012, 0.012, 'sageDeep', 3),
    dot([0, 1.68, 0.4], 0.04, 'sageDeep'),
  ]);
  return merge(plinth(q, 0.9, 0.6), clip(merge(fan, body, neck, head)), spots);
}

export function rabbitTopiary(q: Q): Geo {
  const body = ell(q, 'big', 0, 0.75, -0.05, 0.45, 0.48, 0.5, 'sage');
  const head = ell(q, 'mid', 0, 1.32, 0.28, 0.27, 0.26, 0.28, 'sage');
  const ears = pair((s) => ellR(q, 'small', [s * 0.12, 1.72, 0.22], [0.08, 0.3, 0.05], [0, 0, -s * 0.18], 'sageLight'));
  const tail = hiOnly(q, () => ell(q, 'tiny', 0, 0.6, -0.55, 0.14, 0.14, 0.14, 'sageLight'));
  const eyes = hiOnly(q, () => pair((s) => dot([s * 0.15, 1.38, 0.5], 0.035)));
  return merge(plinth(q, 1.0, 1.1), clip(merge(translate(merge(body, head, ears, tail), 0, 0.12, 0))), eyes.map((e) => translate(e, 0, 0.12, 0)));
}

export function elephantTopiary(q: Q): Geo {
  const body = ell(q, 'mid', 0, 1.15, -0.05, 0.62, 0.55, 0.85, 'sage');
  const head = ell(q, 'small', 0, 1.4, 0.82, 0.38, 0.38, 0.34, 'sage');
  const ears = pair((s) => ellR(q, q.hi ? 'tiny' : 'nub', [s * 0.42, 1.38, 0.72], [0.32, 0.36, 0.06], [0, s * 0.45, 0], 'sageLight'));
  const trunkPath: V3[] = q.hi
    ? [
        [0, 1.25, 1.1],
        [0, 0.85, 1.32],
        [0, 0.45, 1.3],
      ]
    : [
        [0, 1.25, 1.1],
        [0, 0.5, 1.3],
      ];
  const trunkGeo = chain(trunkPath, 0.14, 0.08, 'sage', q.s(6, 3));
  const legs = [-0.48, 0.48].flatMap((z) => [1, -1].map((s) => limb([s * 0.34, 0, z], [s * 0.34, 0.85, z], 0.18, 0.17, 'sage', q.s(6, 3))));
  const extras = hiOnly(q, () => [
    ...pair((s) => limb([s * 0.16, 1.15, 1.08], [s * 0.2, 1.0, 1.35], 0.035, 0.012, 'ivory', 4)),
    limb([0, 1.1, -0.85], [0, 0.6, -0.95], 0.03, 0.02, 'sageDeep', 4),
  ]);
  return merge(clip(merge(body, head, ears, trunkGeo, legs)), extras);
}

export function swanTopiary(q: Q): Geo {
  const body = ell(q, 'mid', 0, 0.85, -0.05, 0.45, 0.35, 0.7, 'sage');
  const wings = pair((s) => ellR(q, 'small', [s * 0.3, 1.12, -0.15], [0.12, 0.3, 0.55], [0, 0, s * 0.45], 'sageLight'));
  const neckPath: V3[] = q.hi
    ? [
        [0, 1.0, 0.45],
        [0, 1.4, 0.58],
        [0, 1.75, 0.42],
        [0, 1.92, 0.55],
      ]
    : [
        [0, 1.0, 0.45],
        [0, 1.9, 0.5],
      ];
  const neck = chain(neckPath, 0.12, 0.08, 'sage', q.s(6, 3));
  const head = ell(q, q.hi ? 'tiny' : 'nub', 0, 1.95, 0.62, 0.11, 0.1, 0.14, 'sage');
  const beak = hiOnly(q, () => orient(cone(0.05, 0.16, 'butter', 4), [Math.PI / 2, 0, 0], [0, 1.94, 0.74]));
  return merge(plinth(q, 1.0, 1.5), clip(merge(body, wings, neck, head)), beak);
}

export function teapotTopiary(q: Q): Geo {
  const body = ell(q, 'big', 0, 0.75, 0, 0.7, 0.62, 0.7, 'sage');
  const lid = translate(dome(0.4, 'sageLight', q.s(8, 5), q.s(3, 2)), 0, 1.3, 0);
  const knob = hiOnly(q, () => ell(q, 'tiny', 0, 1.76, 0, 0.1, 0.1, 0.1, 'sageDeep'));
  const spoutPath: V3[] = q.hi
    ? [
        [0, 0.6, 0.55],
        [0, 0.92, 0.95],
        [0, 1.2, 1.15],
      ]
    : [
        [0, 0.6, 0.55],
        [0, 1.2, 1.15],
      ];
  const handlePath: V3[] = q.hi
    ? [
        [0, 1.12, -0.55],
        [0, 1.22, -0.95],
        [0, 0.78, -1.02],
        [0, 0.45, -0.62],
      ]
    : [
        [0, 1.12, -0.55],
        [0, 1.0, -1.0],
        [0, 0.45, -0.62],
      ];
  const spout = chain(spoutPath, 0.16, 0.08, 'sage', q.s(6, 3));
  const handle = chain(handlePath, 0.1, 0.1, 'sage', q.s(5, 3));
  return clip(merge(body, lid, knob, spout, handle));
}

const KNIGHT_HI: ReadonlyArray<readonly [number, number]> = [
  [-0.35, 0],
  [0.35, 0],
  [0.3, 0.25],
  [0.15, 0.45],
  [0.35, 0.7],
  [0.62, 0.82],
  [0.65, 0.98],
  [0.45, 1.12],
  [0.2, 1.25],
  [0.08, 1.42],
  [-0.05, 1.3],
  [-0.25, 1.15],
  [-0.4, 0.8],
  [-0.42, 0.4],
];
const KNIGHT_LO: ReadonlyArray<readonly [number, number]> = [
  [-0.35, 0],
  [0.35, 0],
  [0.2, 0.45],
  [0.65, 0.85],
  [0.5, 1.1],
  [0.08, 1.42],
  [-0.3, 1.1],
  [-0.42, 0.4],
];

export function knightTopiary(q: Q): Geo {
  const base = cyl(0.62, 0.55, 0.3, 'sageDeep', q.s(12, 6));
  const collar = hiOnly(q, () => translate(cyl(0.45, 0.4, 0.18, 'sage', 10), 0, 0.3, 0));
  const head = orient(profile(q.hi ? KNIGHT_HI : KNIGHT_LO, 0.5, 'sage'), [0, -Math.PI / 2, 0], [0, 0.44, 0]);
  const mane = hiOnly(q, () =>
    [0.55, 0.8, 1.05].map((y, i) => ell(q, 'nub', 0, 0.44 + y, -0.36 + i * 0.05, 0.2, 0.14, 0.12, 'sageLight')),
  );
  const eyes = hiOnly(q, () => pair((s) => dot([s * 0.26, 1.48, 0.25], 0.04)));
  return merge(clip(merge(base, collar, head, mane), 0.06), eyes);
}

export function snailTopiary(q: Q): Geo {
  const foot = ell(q, 'mid', 0, 0.2, 0.15, 0.36, 0.22, 1.0, 'sageDeep');
  const head = ell(q, 'small', 0, 0.48, 1.0, 0.22, 0.22, 0.22, 'sageDeep');
  const shell = ell(q, 'big', 0, 0.95, -0.15, 0.44, 0.72, 0.72, 'sage');
  const whorls = pair((s) => ell(q, 'small', s * 0.38, 0.98, -0.12, 0.12, 0.42, 0.42, 'sageLight'));
  const stalks = hiOnly(q, () =>
    pair((s) => merge(limb([s * 0.08, 0.62, 1.05], [s * 0.18, 0.95, 1.18], 0.03, 0.025, 'sageDeep', 4), dot([s * 0.18, 0.97, 1.19], 0.06))),
  );
  return merge(clip(merge(foot, head, shell, whorls)), stalks);
}

/** Comedy prop: a clipped rabbit that has pulled its roots out of the bed and is legging it. */
export function escapedTopiary(q: Q): Geo {
  const body = ellR(q, 'mid', [0, 1.2, 0], [0.5, 0.45, 0.62], [0.25, 0, 0], 'sage');
  const head = ell(q, 'mid', 0, 1.62, 0.62, 0.3, 0.28, 0.3, 'sage');
  const ears = pair((s) => ellR(q, q.hi ? 'tiny' : 'nub', [s * 0.14, 2.0, 0.48], [0.08, 0.3, 0.05], [-0.5, 0, -s * 0.2], 'sageLight'));
  const leg = (hip: V3, knee: V3, foot: V3): Geo[] =>
    q.hi ? chain([hip, knee, foot], 0.08, 0.05, 'timber', 5) : [limb(hip, foot, 0.07, 0.05, 'timber', 3)];
  const legs = [
    ...leg([0.2, 1.0, 0.3], [0.25, 0.7, 0.75], [0.28, 0.3, 1.0]),
    ...leg([-0.2, 1.0, 0.3], [-0.22, 0.5, 0.3], [-0.25, 0, 0.45]),
    ...leg([0.22, 0.95, -0.35], [0.26, 0.45, -0.55], [0.28, 0, -0.95]),
    ...leg([-0.22, 0.95, -0.35], [-0.24, 0.6, -0.8], [-0.26, 0.45, -1.2]),
  ];
  const feet: ReadonlyArray<readonly [V3, number]> = [
    [[-0.25, 0, 0.45], 0],
    [[0.28, 0, -0.95], Math.PI],
  ];
  const toes = hiOnly(q, () =>
    feet.flatMap(([f, yaw]) =>
      [-0.6, 0, 0.6].map((a) => limb(f, [f[0] + Math.sin(yaw + a) * 0.22, 0.01, f[2] + Math.cos(yaw + a) * 0.22], 0.025, 0.01, 'timberDeep', 3)),
    ),
  );
  const clod = ell(q, 'nub', -0.26, 0.38, -1.3, 0.16, 0.12, 0.16, 'cocoa');
  const eyes = hiOnly(q, () => pair((s) => dot([s * 0.16, 1.7, 0.88], 0.045)));
  return merge(clip(merge(body, head, ears)), legs, toes, clod, eyes);
}
