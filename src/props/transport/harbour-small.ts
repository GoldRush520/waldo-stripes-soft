/** Small harbour clutter: bollard, cleat, rope coil, lobster pots, net heap, fish crates, pile, fender. */
import {
  type Col,
  type Geo,
  beam,
  blob,
  box,
  capsule,
  cone,
  cyl,
  dome,
  lathe,
  merge,
  profile,
  rotateY,
  scale,
  sphere,
  torus,
  translate,
} from '../../core/geo';
import { type Q, type V2, boxAt, cylX, nearOnly, tray } from './kit';

export function bollard(q: Q): Geo {
  if (q.far) {
    return lathe(
      [
        [0.16, 0],
        [0.11, 0.1],
        [0.17, 0.5],
        [0.0001, 0.6],
      ],
      'blueDeep',
      5,
    );
  }
  return merge(
    lathe(
      [
        [0.16, 0],
        [0.16, 0.05],
        [0.12, 0.1],
        [0.11, 0.42],
        [0.17, 0.48],
      ],
      'blueDeep',
      10,
    ),
    lathe(
      [
        [0.17, 0.48],
        [0.17, 0.54],
        [0.0001, 0.6],
      ],
      'ivory',
      10,
    ),
  );
}

export function cleat(q: Q): Geo {
  if (q.far) return merge(box(0.12, 0.04, 0.3, 'slate'), boxAt(0.08, 0.04, 0.42, 'slate', 0, 0.06, 0));
  return merge(
    box(0.14, 0.03, 0.3, 'slate'),
    ...[-0.08, 0.08].map((z) => translate(cyl(0.028, 0.022, 0.08, 'slate', 6), 0, 0.02, z)),
    translate(rotateY(cylX(0.026, 0.42, 'slate', 6, -0.21, 0.09, 0), Math.PI / 2), 0, 0, 0),
  );
}

export function ropeCoil(q: Q): Geo {
  if (q.far) return cyl(0.34, 0.3, 0.16, 'butterDeep', 8);
  const rings: ReadonlyArray<readonly [number, number]> = [
    [0.27, 0.04],
    [0.24, 0.1],
    [0.21, 0.155],
  ];
  return merge(
    rings.map(([R, y]) => translate(torus(R, 0.045, 'butterDeep', 4, 10), 0, y, 0)),
    beam([0.27, 0.04, 0], [0.45, 0.025, 0.2], 0.05, 'butterDeep'),
    beam([0.45, 0.025, 0.2], [0.5, 0.025, 0.45], 0.05, 'butterDeep'),
  );
}

const ARCH: readonly V2[] = Array.from({ length: 7 }, (_, i): V2 => {
  const a = (Math.PI * i) / 6;
  return [Math.cos(a) * 0.3, 0.06 + Math.sin(a) * 0.26];
});

/** One lobster pot (0.6 x 0.5 x 0.32), length along z. `ribs` timber hoops in the near build. */
export function lobsterPot(q: Q, net: Col = 'sage', ribs = 2): Geo {
  if (q.far) {
    return merge(
      box(0.6, 0.06, 0.5, 'timber'),
      profile(
        [
          [-0.3, 0.06],
          [0.3, 0.06],
          [0.2, 0.3],
          [-0.2, 0.3],
        ],
        0.48,
        net,
      ),
    );
  }
  const pts = ARCH.filter((_, i) => i % 2 === 0);
  const hoop = (z: number): Geo[] =>
    pts.slice(0, -1).map((p, i) => {
      const n = pts[i + 1] ?? p;
      return beam([p[0] * 1.03, p[1], z], [n[0] * 1.03, n[1], z], 0.025, 'timberDeep');
    });
  const zs = ribs === 1 ? [0] : Array.from({ length: ribs }, (_, i) => -0.2 + (0.4 * i) / (ribs - 1));
  return merge(box(0.62, 0.06, 0.5, 'timber'), profile(ARCH, 0.46, net), zs.flatMap(hoop));
}

export function lobsterPotStack(q: Q): Geo {
  if (q.far) {
    return merge(
      boxAt(1.3, 0.3, 0.5, 'sage', 0, 0, 0.02),
      translate(lobsterPot(q, 'coralLight'), 0, 0.3, 0.02),
    );
  }
  const pot = (x: number, y: number, z: number, net: Col, rot = 0): Geo =>
    translate(rotateY(lobsterPot(q, net, 1), rot), x, y, z);
  return merge(
    pot(-0.34, 0, 0, 'sage'),
    pot(0.34, 0, 0.05, 'blue'),
    pot(0.0, 0.32, 0.02, 'coralLight', 0.15),
    nearOnly(q, () => beam([0.62, 0.05, 0.3], [0.9, 0.02, 0.5], 0.03, 'butterDeep')),
  );
}

export function netHeap(q: Q): Geo {
  if (q.far) return scale(dome(1, 'sageDeep', 6, 3), 0.75, 0.42, 0.6);
  const floats: readonly Col[] = ['butter', 'coral', 'butter', 'coral'];
  const spots: ReadonlyArray<readonly [number, number, number]> = [
    [-0.4, 0.22, 0.25],
    [0.15, 0.36, 0.2],
    [0.45, 0.18, -0.2],
    [-0.1, 0.3, -0.3],
  ];
  return merge(
    scale(dome(1, 'sageDeep', 12, 5), 0.75, 0.42, 0.6),
    translate(scale(dome(1, 'blue', 8, 4), 0.4, 0.2, 0.3), 0.35, 0.18, 0.25),
    spots.map(([x, y, z], i) => translate(sphere(0.07, floats[i] ?? 'butter', 5, 3), x, y, z)),
  );
}

/** One fish crate, optionally with fish on ice. */
export function fishCrate(q: Q, color: Col = 'blue', withFish = true): Geo {
  if (q.far) return box(0.6, 0.22, 0.4, color);
  return merge(
    tray(0.6, 0.4, 0.58, 0.38, 0.22, 0.025, color, 'blueLight'),
    withFish
      ? [-0.14, 0.02, 0.16].map((x, i) => translate(blob(0.045, 0.03, 0.15, i === 1 ? 'clay' : 'blueLight', 5, 3), x, 0.2, 0))
      : [],
  );
}

export function fishCrateStack(q: Q): Geo {
  if (q.far) return merge(boxAt(0.6, 0.44, 0.82, 'blue', -0.32, 0, 0), boxAt(0.6, 0.22, 0.4, 'sage', 0.32, 0, 0.2));
  return merge(
    translate(fishCrate(q, 'blue', false), -0.32, 0, -0.21),
    translate(fishCrate(q, 'sage', false), -0.32, 0, 0.21),
    translate(fishCrate(q, 'butter', false), -0.32, 0.22, 0),
    translate(fishCrate(q, 'coral', true), 0.34, 0, 0.15),
  );
}

/** Timber mooring pile with an iron band and a loop of rope. */
export function mooringPile(q: Q): Geo {
  if (q.far) return cyl(0.18, 0.17, 1.2, 'timber', 5);
  return merge(
    cyl(0.18, 0.17, 1.2, 'timber', 8),
    translate(cyl(0.185, 0.185, 0.12, 'slate', 8), 0, 0.85, 0),
    translate(cone(0.17, 0.08, 'timberDeep', 8), 0, 1.2, 0),
    translate(torus(0.22, 0.04, 'butterDeep', 3, 8), 0, 0.7, 0),
  );
}

/** Sausage fender standing on its end (rope eye at the top). */
export function fender(q: Q): Geo {
  if (q.far) return cyl(0.12, 0.12, 0.62, 'coral', 5);
  return merge(capsule(0.12, 0.62, 'coral', 8), beam([0, 0.6, 0], [0, 0.85, 0], 0.025, 'ivoryDeep'));
}
