/**
 * Shop-sign emblems built from geometry. Each emblem is centred on the origin in the x-y plane
 * (thickness along z), about 0.6 m across. Far tier: one simple silhouette; near: crafted detail.
 */
import { type Col, type Geo, beam, cone, detail, farOnly, lathe, merge, tintable, torus, tube } from '../../core/geo';
import { HALF_PI, PI, type V2, type V3, arc, ball, bx, bxc, cy, cyz, fit, slab, unit } from './kit';
import type { SignKind } from './types';

const flat = (pts: readonly V2[]): V3[] => pts.map(([x, y]) => [x, y, 0] as const);
const ellipse = (rx: number, ry: number, n: number): V2[] =>
  arc([0, 0], 1, 0, 2 * PI, n).map(([x, y]) => [x * rx, y * ry] as const);

function pretzel(): Geo {
  const fine = [
    tube(flat(ellipse(0.28, 0.22, 8)), 0.045, 'timber', 3),
    beam([0, 0.2, 0], [-0.16, -0.2, 0], 0.07, 'timber'),
    beam([0, 0.2, 0], [0.16, -0.2, 0], 0.07, 'timber'),
    ...[[-0.2, 0.1], [0.22, -0.08]].map(([x, y]) =>
      bx(0.03, 0.03, 0.03, 'ivory', x ?? 0, (y ?? 0) + 0.02, 0.04),
    ),
  ];
  return merge(detail(merge(fine)), farOnly(tube(flat(ellipse(0.29, 0.23, 4)), 0.07, 'timber', 3)));
}

function fish(): Geo {
  const body: V2[] = [
    [-0.32, 0], [-0.15, 0.13], [0.08, 0.14], [0.2, 0.05], [0.32, 0.14], [0.3, -0.14], [0.2, -0.05], [0.08, -0.14], [-0.15, -0.12],
  ];
  const near = [
    ball([0.035, 0.035, 0.05], 'ivory', [-0.2, 0.03, 0]),
    ball([0.018, 0.018, 0.06], 'ink', [-0.21, 0.035, 0]),
    bx(0.025, 0.16, 0.08, 'blueDeep', -0.1, -0.08, 0),
    slab([[0, 0.12], [0.1, 0.2], [0.12, 0.12]], 0.03, 'blueDeep'),
  ];
  return merge(slab(body, 0.07, 'blue'), detail(merge(near)));
}

function book(): Geo {
  const covers = [-1, 1].map((s) => bxc(0.3, 0.4, 0.03, 'coral', [s * 0.14, 0, 0], 0, 0, 0, ));
  const pages = [-1, 1].map((s) => bxc(0.26, 0.36, 0.03, 'ivory', [s * 0.14, 0, 0.03]));
  const lines = [-1, 1].flatMap((s) =>
    [0.08, 0, -0.08].map((y) => bxc(0.18, 0.02, 0.01, 'blueDeep', [s * 0.14, y, 0.05])),
  );
  return merge(covers, detail(merge(pages, lines, bxc(0.04, 0.42, 0.06, 'coralDeep', [0, 0, 0]))));
}

function teacup(): Geo {
  const far = farOnly(merge(cy(0.17, 0.22, 'ivory', 6, [0, -0.12, 0], 1.2)));
  const near = [
    cy(0.17, 0.22, 'ivory', 8, [0, -0.12, 0], 1.2),
    cy(0.21, 0.04, 'blue', 8, [0, 0.03, 0], 1.0, false),
    cy(0.26, 0.03, 'ivory', 8, [0, -0.15, 0]),
    fit(torus(0.07, 0.018, 'ivory', 3, 8), [1, 1, 1], [0.22, -0.02, 0], HALF_PI),
    tube([[0, 0.14, 0], [0.04, 0.22, 0], [-0.03, 0.3, 0]], 0.012, 'ivoryShade', 3),
  ];
  return merge(far, detail(merge(near)));
}

function flower(): Geo {
  const star = arc([0, 0], 1, HALF_PI, HALF_PI + 2 * PI, 10)
    .slice(0, 10)
    .map(([x, y], i) => [x * (i % 2 === 0 ? 0.24 : 0.1), 0.06 + y * (i % 2 === 0 ? 0.24 : 0.1)] as const);
  const near = [
    cyz(0.07, 0.08, 'butter', 8, [0, 0.06, -0.04]),
    bx(0.03, 0.26, 0.03, 'sageDeep', 0, -0.3, 0),
    slab([[0, -0.22], [0.14, -0.12], [0.03, -0.17]], 0.03, 'sage'),
  ];
  return merge(tintable(slab(star, 0.05, 'coral')), detail(merge(near)));
}

function boot(): Geo {
  const shape: V2[] = [[-0.08, 0.28], [0.08, 0.28], [0.08, -0.08], [0.3, -0.12], [0.3, -0.24], [-0.1, -0.24], [-0.1, 0.0]];
  const near = [
    bx(0.42, 0.05, 0.1, 'cocoa', 0.1, -0.29, 0),
    bx(0.08, 0.08, 0.1, 'cocoa', -0.06, -0.29, 0),
    ...[0.15, 0.06, -0.03].map((y) => bxc(0.16, 0.02, 0.08, 'ivory', [0.0, y, 0])),
    bx(0.2, 0.04, 0.1, 'timberDeep', 0, 0.26, 0),
  ];
  return merge(slab(shape, 0.08, 'timber'), detail(merge(near)));
}

function scissors(): Geo {
  const blade: V2[] = [[0, 0], [0.04, 0.02], [0.02, 0.36]];
  const blades = [-0.35, 0.35].map((a) => fit(slab(blade, 0.025, 'stone'), [1, 1, 1], [0, -0.04, 0], 0, 0, a));
  const rings = [-1, 1].map((s) =>
    fit(torus(0.07, 0.022, 'coral', 3, 8), [1, 1, 1], [s * 0.1, -0.2, 0], HALF_PI),
  );
  const farRings = [-1, 1].map((s) => bx(0.12, 0.12, 0.04, 'coral', s * 0.1, -0.26, 0));
  return merge(blades, detail(merge(rings, ball([0.025, 0.025, 0.04], 'ink', [0, -0.04, 0]))), farOnly(merge(farRings)));
}

function key(): Geo {
  const near = [
    fit(torus(0.1, 0.03, 'butterDeep', 3, 10), [1, 1, 1], [0, 0.18, 0], HALF_PI),
    bx(0.08, 0.05, 0.04, 'butterDeep', 0.05, -0.2, 0),
    bx(0.06, 0.04, 0.04, 'butterDeep', 0.04, -0.12, 0),
    bx(0.1, 0.04, 0.05, 'butterDeep', 0, 0.04, 0),
  ];
  return merge(
    bx(0.05, 0.36, 0.04, 'butterDeep', 0, -0.24, 0),
    detail(merge(near)),
    farOnly(cyz(0.13, 0.04, 'butterDeep', 6, [0, 0.18, -0.02])),
  );
}

function anchor(): Geo {
  const outer = arc([0, -0.05], 0.26, PI + 0.3, 2 * PI - 0.3, 4);
  const inner = arc([0, -0.05], 0.2, 2 * PI - 0.35, PI + 0.35, 4);
  const near = [
    bx(0.3, 0.05, 0.05, 'blueDeep', 0, 0.16, 0),
    fit(torus(0.06, 0.02, 'blueDeep', 3, 8), [1, 1, 1], [0, 0.3, 0], HALF_PI),
    ...[-1, 1].map((s) => slab([[s * 0.27, -0.12], [s * 0.2, -0.14], [s * 0.3, -0.02]], 0.05, 'blueDeep')),
  ];
  return merge(bx(0.05, 0.5, 0.05, 'blueDeep', 0, -0.26, 0), slab([...outer, ...inner], 0.05, 'blueDeep'), detail(merge(near)));
}

function music(): Geo {
  const head = cyz(0.09, 0.06, 'coralDeep', 6, [0, 0, -0.03]);
  const tilted = fit(head, [1.25, 0.85, 1], [-0.08, -0.2, 0], 0, 0, 0.35);
  const flag = slab([[0.02, 0.3], [0.18, 0.12], [0.16, 0.05], [0.02, 0.2]], 0.04, 'coralDeep');
  const near = [cyz(0.04, 0.07, 'coralLight', 6, [-0.11, -0.18, -0.02]), bx(0.02, 0.4, 0.05, 'coral', 0.02, -0.18, 0.0)];
  return merge(tilted, bx(0.035, 0.5, 0.04, 'coralDeep', 0.0, -0.2, 0), flag, detail(merge(near)));
}

function cheese(): Geo {
  const wedge = slab([[-0.3, -0.18], [0.3, -0.18], [-0.3, 0.16]], 0.24, 'butter');
  const rind = slab([[-0.31, -0.19], [-0.31, 0.17], [-0.27, 0.15], [-0.27, -0.19]], 0.25, 'butterDeep');
  const holes = (
    [
      [-0.15, -0.05, 0.12],
      [0.05, -0.1, 0.12],
      [-0.2, 0.07, 0.12],
      [-0.05, -0.08, -0.15],
    ] as const
  ).map(([x, y, z]) => cyz(0.035, 0.03, 'butterDeep', 6, [x, y, z]));
  return merge(wedge, detail(merge(rind, holes)));
}

function wine(): Geo {
  const prof: V2[] = [[0.0, -0.3], [0.1, -0.3], [0.1, 0.02], [0.06, 0.1], [0.035, 0.14], [0.035, 0.28], [0.0, 0.28]];
  const near = [
    lathe(prof, 'sageDeep', 8),
    cy(0.03, 0.05, 'timber', 6, [0, 0.27, 0]),
    cy(0.104, 0.12, 'ivory', 8, [0, -0.2, 0], 1, false),
    cy(0.04, 0.04, 'coral', 6, [0, 0.2, 0], 1, false),
  ];
  const far = [cy(0.1, 0.34, 'sageDeep', 6, [0, -0.3, 0]), cy(0.04, 0.24, 'sageDeep', 4, [0, 0.04, 0])];
  return merge(detail(merge(near)), farOnly(merge(far)));
}

function icecream(): Geo {
  const coneU = unit('cone6', 'butterDeep', () => cone(1, 1, 'butterDeep', 6));
  const waffle = fit(coneU, [0.13, 0.36, 0.13], [0, 0.04, 0], PI);
  const near = [
    tintable(ball([0.16, 0.13, 0.16], 'coral', [0, 0.12, 0], 8, 5)),
    ball([0.035, 0.035, 0.035], 'coralDeep', [0.02, 0.28, 0], 5, 3),
    ...[-0.12, -0.2].map((y) => bxc(0.2 + y * 0.4, 0.015, 0.2 + y * 0.4, 'timber', [0, y, 0])),
  ];
  return merge(waffle, detail(merge(near)), farOnly(tintable(ball([0.16, 0.13, 0.16], 'coral', [0, 0.12, 0], 5, 3))));
}

function hat(): Geo {
  const always = [cy(0.14, 0.3, 'blueDeep', 6, [0, -0.12, 0], 1.08), cy(0.27, 0.035, 'blueDeep', 6, [0, -0.15, 0])];
  const near = [cy(0.145, 0.07, 'coral', 10, [0, -0.1, 0], 1.02, false), cy(0.153, 0.31, 'blueDeep', 10, [0, -0.125, 0], 1.08, false)];
  return merge(always, detail(merge(near)));
}

const BUILDERS: Record<SignKind, () => Geo> = {
  pretzel,
  fish,
  book,
  teacup,
  flower,
  boot,
  scissors,
  key,
  anchor,
  music,
  cheese,
  wine,
  icecream,
  hat,
};

/** Emblem geometry (cached per kind; petal / scoop parts are tint-masked). */
export function emblem(kind: SignKind): Geo {
  return unit(`emblem:${kind}`, 'ivory', BUILDERS[kind]);
}

/** Default tint for emblems with tint-masked parts. */
export const EMBLEM_TINT: Partial<Record<SignKind, Col>> = { flower: 'coral', icecream: 'coralLight' };
