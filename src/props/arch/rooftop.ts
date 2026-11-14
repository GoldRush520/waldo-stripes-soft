/**
 * Rooftop elements. Every builder rests on y = 0 centred on x/z (authors place them at a roof
 * or terrace height): water tank, roof-garden planter, skylight, pigeon loft, weathervane,
 * flag pole with a swaying flag, and lantern-string posts.
 */
import { type Col, type Geo, cone, detail, farOnly, merge, sway, tintable, tube } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { flowerRow } from './flowers';
import { HALF_PI, type V2, type V3, ball, bx, bxc, cy, fit, slab, unit } from './kit';
import { triPrism } from './roofShapes';

function coneU(col: Col, seg: number): Geo {
  return unit(`cone${seg}`, col, () => cone(1, 1, col, seg));
}

export function waterTank(): Geo {
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => bx(0.1, 1.3, 0.1, 'timberDeep', sx * 0.5, 0, sz * 0.5)));
  const near = [
    ...[1.6, 2.1, 2.6].map((y) => cy(0.72, 0.05, 'cocoa', 12, [0, y, 0], 1, false)),
    bx(1.3, 0.08, 1.3, 'timber', 0, 1.22, 0),
    ...[0.2, 0.5, 0.8, 1.1].map((y) => bx(0.4, 0.04, 0.05, 'timberDeep', 0, y, 0.55)),
    ...[-1, 1].map((s) => bx(0.04, 1.3, 0.04, 'timberDeep', s * 0.2, 0, 0.55)),
    cy(0.05, 0.2, 'cocoa', 5, [0, 3.2, 0]),
    cy(0.7, 1.6, 'timber', 12, [0, 1.3, 0]),
    fit(coneU('clayDeep', 12), [0.8, 0.35, 0.8], [0, 2.9, 0]),
  ];
  const far = [cy(0.7, 1.6, 'timber', 6, [0, 1.3, 0]), fit(coneU('clayDeep', 6), [0.8, 0.35, 0.8], [0, 2.9, 0])];
  return merge(legs, detail(merge(near)), farOnly(merge(far)));
}

/** Roof-garden planter: box of soil with shrubs and tint-masked flowers. */
export function roofPlanter(w: number, d: number, rng: Rng): Geo {
  const n = Math.max(2, Math.round(w / 0.45));
  const shrubs = Array.from({ length: n }, (_, i) =>
    ball(
      [0.22, 0.2, 0.2],
      rng.pick(['sage', 'sageDeep'] as const),
      [-w / 2 + ((i + 0.5) * w) / n, 0.62, rng.range(-0.08, 0.08)],
      5,
      3,
    ),
  );
  const near = [
    bx(w - 0.08, 0.04, d - 0.08, 'cocoa', 0, 0.5, 0),
    ...shrubs,
    fit(flowerRow(w - 0.2, rng), [1, 1, 1], [0, 0.5, d / 2 - 0.12]),
    bx(w + 0.06, 0.05, d + 0.06, 'clayDeep', 0, 0.5, 0),
  ];
  return merge(
    bx(w, 0.5, d, 'clay', 0, 0, 0),
    detail(merge(near)),
    farOnly(bx(w - 0.1, 0.35, d - 0.1, 'sage', 0, 0.5, 0)),
  );
}

export function skylight(): Geo {
  const glass = fit(triPrism('blueLight'), [1.2, 0.5, 1.6], [0, 0.3, 0]);
  const near = [
    bx(0.05, 0.05, 1.66, 'ivory', 0, 0.78, 0),
    ...[-0.4, 0, 0.4].flatMap((z) =>
      [-1, 1].map((s) => bxc(0.035, 0.78, 0.035, 'ivory', [s * 0.315, 0.565, z], 0, 0, s * 0.876)),
    ),
    bx(0.2, 0.08, 0.06, 'butterDeep', 0.65, 0.4, 0),
  ];
  return merge(bx(1.4, 0.3, 1.8, 'ivoryShade', 0, 0, 0), glass, detail(merge(near)));
}

export function pigeonLoft(rng: Rng): Geo {
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => bx(0.08, 0.8, 0.08, 'timberDeep', sx * 0.6, 0, sz * 0.35)));
  const holes = [-0.4, 0, 0.4].map((x) => bx(0.16, 0.2, 0.04, 'cocoa', x, 1.15, 0.43));
  const birds = Array.from({ length: 4 }, (_, i) => {
    const x = -0.6 + i * 0.4 + rng.range(-0.05, 0.05);
    const c: Col = rng.pick(['ivory', 'slate', 'stone'] as const);
    const z = rng.range(-0.1, 0.1);
    return merge(ball([0.07, 0.06, 0.1], c, [x, 1.92, z], 5, 3), ball([0.04, 0.04, 0.04], c, [x, 2.0, z + 0.08], 4, 3));
  });
  const near = [
    ...holes,
    bx(1.4, 0.04, 0.2, 'timber', 0, 1.0, 0.5),
    ...birds,
    ...[-0.15, 0.15].map((x) => bx(0.04, 0.6, 0.02, 'ivoryShade', x, 0.85, 0.42)),
  ];
  return merge(
    legs,
    bx(1.5, 0.75, 0.85, 'ivory', 0, 0.8, 0),
    fit(triPrism('coralDeep'), [1.0, 0.4, 1.75], [0, 1.55, 0], 0, HALF_PI),
    detail(merge(near)),
  );
}

const ROOSTER: readonly V2[] = [
  [-0.15, 0], [0.12, 0], [0.2, 0.12], [0.16, 0.26], [0.08, 0.2], [0.02, 0.1], [-0.1, 0.12], [-0.2, 0.26], [-0.22, 0.08],
];

export function weathervane(): Geo {
  const rooster = unit('rooster', 'butterDeep', () => slab(ROOSTER, 0.03, 'butterDeep'));
  const near = [
    ...[0, HALF_PI].map((r) => bxc(0.5, 0.025, 0.025, 'ink', [0, 0.9, 0], 0, r)),
    bxc(0.8, 0.03, 0.03, 'ink', [0, 1.3, 0], 0, 0.5),
    ball([0.05, 0.05, 0.05], 'butterDeep', [0, 1.78, 0], 5, 3),
  ];
  const farBird = slab([[-0.26, 0], [0.26, 0], [-0.26, 0.34]], 0.03, 'butterDeep');
  return merge(
    cy(0.03, 1.78, 'ink', 4, [0, 0, 0], 1, false),
    detail(merge(near, bx(0.3, 0.12, 0.3, 'stone', 0, 0, 0), fit(rooster, [1.3, 1.3, 1.3], [0, 1.38, 0], 0, 0.5))),
    farOnly(fit(farBird, [1, 1, 1], [0, 1.38, 0], 0, 0.5)),
  );
}

/** Flag pole; the flag (tint-masked, real thickness) sways with distance from the pole. */
export function flagPole(height = 4.5): Geo {
  const fw = 1.1;
  const flag = tintable(bx(fw, 0.7, 0.03, 'coral', fw / 2 + 0.05, height - 0.85, 0));
  const swayed = sway(flag, (x) => Math.min(1, Math.max(0, x / fw)));
  const stripe = sway(bx(fw, 0.16, 0.036, 'ivory', fw / 2 + 0.05, height - 0.58, 0), (x) => Math.min(1, Math.max(0, x / fw)));
  const near = [
    cy(0.05, height, 'ivory', 8, [0, 0, 0], 0.7),
    ball([0.07, 0.07, 0.07], 'butterDeep', [0, height + 0.07, 0], 6, 4),
    bx(0.3, 0.1, 0.3, 'stone', 0, 0, 0),
    bx(0.04, 0.16, 0.06, 'cocoa', 0.06, 1.1, 0),
    bx(0.08, 0.08, 0.08, 'stone', 0, height - 0.12, 0),
    tube([[0.05, 1.2, 0], [0.05, height - 0.1, 0]], 0.008, 'ivoryShade', 3),
  ];
  return merge(farOnly(cy(0.05, height, 'ivory', 4, [0, 0, 0], 0.7, false)), swayed, stripe, detail(merge(near)));
}

/** Two posts with a sagging string of tint-masked lanterns between them, `span` apart (along x). */
export function lanternPosts(span = 4, rng?: Rng): Geo {
  const h = 2.6;
  const posts = [-1, 1].map((s) => cy(0.05, h, 'timberDeep', 5, [(s * span) / 2, 0, 0]));
  const n = Math.max(3, Math.round(span / 0.7));
  const pts: V3[] = Array.from({ length: n + 2 }, (_, i) => {
    const t = i / (n + 1);
    return [-span / 2 + t * span, h - 0.08 - 0.45 * 4 * t * (1 - t), 0] as const;
  });
  const lanterns = pts.slice(1, -1).map(([x, y]) => {
    const s = 0.08 + (rng ? rng.range(-0.01, 0.015) : 0);
    return ball([s, s * 1.3, s], 'coral', [x, y - 0.14, 0], 5, 3);
  });
  const swayOf = (_x: number, y: number): number => Math.min(1, Math.max(0, (h - y) / 0.8));
  const near = [
    sway(tintable(merge(lanterns)), swayOf),
    sway(tube(pts, 0.008, 'ink', 3), swayOf),
    ...[-1, 1].map((s) => bx(0.26, 0.08, 0.26, 'stone', (s * span) / 2, 0, 0)),
  ];
  const farLine = sway(
    tintable(merge(pts.slice(1, -1).filter((_, i) => i % 2 === 0).map(([x, y]) => bx(0.14, 0.18, 0.14, 'coral', x, y - 0.22, 0)))),
    swayOf,
  );
  return merge(posts, detail(merge(near)), farOnly(farLine));
}
