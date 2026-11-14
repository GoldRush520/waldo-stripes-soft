/**
 * Ferris wheel: static frame, rotating wheel and hanging gondolas (three separate props).
 *
 * - "ferris.frame": rests on y = 0; the wheel hub centre sits at FERRIS_HUB.
 * - "ferris.wheel": origin at the hub centre; lies in the x/y plane and rotates about +z.
 * - "ferris.gondola": origin at its hanging pivot; the engine keeps it upright while the wheel turns.
 */
import { type Geo, beam, cyl, detail, merge, rbox, rotateX, sphere, tintable, torus, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type Seat, type V3, barZ, boxAt, bulbs, lodPair, post, prop, rope, softBox, stripesX, truss } from './kit';

export const FERRIS_RADIUS = 14;
export const FERRIS_HUB: V3 = [0, 16.5, 0];
const RIM_Z = 1.0;
const SPOKES = 12;

/** The 12 gondola pivot positions in wheel space (origin = hub centre, wheel in the x/y plane). */
export const FERRIS_PIVOTS: readonly V3[] = Array.from({ length: SPOKES }, (_, i) => {
  const a = (i / SPOKES) * Math.PI * 2;
  return [Math.sin(a) * FERRIS_RADIUS, -Math.cos(a) * FERRIS_RADIUS, 0] as const;
});

function legs(): Geo {
  const tops: V3[] = [
    [0, FERRIS_HUB[1], -1.55],
    [0, FERRIS_HUB[1], 1.55],
  ];
  const parts = tops.flatMap((top) => {
    const sz = Math.sign(top[2]);
    return [-1, 1].map((sx) => {
      const foot: V3 = [sx * 6.2, 0.45, sz * 3.4];
      const near = truss(foot, top, [0.22, 0, 0], 14, 0.12, 'ivory');
      return merge(lodPair(near, beam(foot, top, 0.4, 'ivory')), boxAt(1.0, 0.45, 1.0, 'stone', foot[0], 0, foot[2]));
    });
  });
  const braces = [-1, 1].flatMap((sz) =>
    [5.5, 11].map((y) => {
      const half = 6.2 * (1 - y / FERRIS_HUB[1]);
      const z = sz * (3.4 - (3.4 - 1.55) * (y / FERRIS_HUB[1]));
      return beam([-half, y, z], [half, y, z], 0.22, 'clay');
    }),
  );
  return merge(parts, braces);
}

function bearings(): Geo {
  return merge(
    [-1, 1].map((sz) => translate(softBox(1.0, 1.0, 0.45, 0.12, 'clayDeep'), 0, FERRIS_HUB[1] - 0.5, sz * 1.5)),
  );
}

function platform(): Geo {
  const deck = softBox(7, 0.45, 5, 0.06, 'clay');
  const edge = detail(boxAt(7.04, 0.06, 5.04, 'clayDeep', 0, 0.42, 0));
  const steps = [0, 1, 2].map((i) => boxAt(2.4, 0.15 * (i + 1), 0.35, 'stone', 0, 0, 3.55 - i * 0.35));
  const rails = [-1, 1].flatMap((sx) => [
    detail(post(sx * 1.3, 2.6, 0.95, 0.03, 'slate', 5, 0.45)),
    rope([sx * 1.3, 1.4, 2.6], [sx * 1.3, 1.4, -2.3], 0.04, 'slate'),
    detail(post(sx * 1.3, -2.3, 0.95, 0.03, 'slate', 5, 0.45)),
  ]);
  return merge(deck, edge, steps, rails, queue(), booth());
}

function queue(): Geo {
  const lanes = [4.4, 5.4, 6.4];
  const posts = lanes.flatMap((z) => [-3, 0, 3].map((x) => post(x, z, 1.0, 0.04, 'timberDeep', 5)));
  const rails = lanes.map((z) => rope([-3, 0.9, z], [3, 0.9, z], 0.04, 'coral'));
  return merge(lodPair(merge(posts), merge(lanes.map((z) => boxAt(6, 0.9, 0.06, 'timberDeep', 0, 0, z)))), rails);
}

function booth(): Geo {
  const body = softBox(1.4, 2.0, 1.2, 0.08, 'butter');
  const roof = translate(softBox(1.7, 0.2, 1.5, 0.06, 'coral'), 0, 2.0, 0);
  const window = detail(boxAt(0.8, 0.6, 0.04, 'blueLight', 0, 1.1, 0.6));
  return translate(merge(body, roof, window), 4.6, 0, 3.4);
}

function frameBuild(): Geo {
  return merge(legs(), bearings(), platform());
}

function rimRing(z: number): Geo {
  const near = rotateX(torus(FERRIS_RADIUS, 0.16, 'coral', 6, 48), Math.PI / 2);
  const far = rotateX(torus(FERRIS_RADIUS, 0.2, 'coral', 3, 36), Math.PI / 2);
  const inner = rotateX(torus(5, 0.1, 'butter', 4, 24), Math.PI / 2);
  const innerFar = rotateX(torus(5, 0.12, 'butter', 3, 16), Math.PI / 2);
  const lights = bulbs(
    Array.from({ length: 36 }, (_, i) => {
      const a = ((i + 0.5) / 36) * Math.PI * 2;
      return [Math.sin(a) * (FERRIS_RADIUS + 0.22), Math.cos(a) * (FERRIS_RADIUS + 0.22), z] as const;
    }),
  );
  return translate(merge(lodPair(merge(near, inner), merge(far, innerFar)), lights), 0, 0, z);
}

function spokes(z: number): Geo {
  const near = Array.from({ length: SPOKES }, (_, i) => {
    const a = (i / SPOKES) * Math.PI * 2;
    return beam([Math.sin(a) * 0.7, -Math.cos(a) * 0.7, z], [Math.sin(a) * 14, -Math.cos(a) * 14, z], 0.12, 'ivory');
  });
  const far = Array.from({ length: SPOKES / 2 }, (_, i) => {
    const a = (i / SPOKES) * Math.PI * 2;
    return beam([-Math.sin(a) * 14, Math.cos(a) * 14, z], [Math.sin(a) * 14, -Math.cos(a) * 14, z], 0.16, 'ivory');
  });
  return lodPair(merge(near), merge(far));
}

function crossTies(): Geo {
  const near = FERRIS_PIVOTS.map((p, i) => {
    const q = FERRIS_PIVOTS[(i + 1) % SPOKES] ?? p;
    return beam([p[0], p[1], -RIM_Z], [q[0], q[1], RIM_Z], 0.08, 'ivoryDeep');
  });
  return detail(merge(near));
}

function axles(): Geo {
  const near = FERRIS_PIVOTS.map((p) => translate(barZ(2 * RIM_Z + 0.1, 0.07, 'slate', 6), p[0], p[1], 0));
  const far = FERRIS_PIVOTS.map((p) => beam([p[0], p[1], -RIM_Z], [p[0], p[1], RIM_Z], 0.14, 'slate'));
  return lodPair(merge(near), merge(far));
}

function wheelBuild(): Geo {
  const hub = translate(rotateX(cyl(0.9, 0.9, 2.2, 'butter', 12), Math.PI / 2), 0, 0, -1.1);
  const cap = detail(merge([-1, 1].map((s) => translate(sphere(0.35, 'butterDeep', 6, 4), 0, 0, s * 1.15))));
  return merge(
    rimRing(-RIM_Z),
    rimRing(RIM_Z),
    spokes(-RIM_Z),
    spokes(RIM_Z),
    crossTies(),
    axles(),
    hub,
    cap,
  );
}

function gondolaTub(): Geo {
  const walls = merge(
    translate(rbox(1.9, 0.08, 1.4, 0.03, 'coral'), 0, -2.05, 0),
    translate(rbox(0.08, 0.75, 1.4, 0.03, 'coral'), -0.91, -2.05, 0),
    translate(rbox(0.08, 0.75, 1.4, 0.03, 'coral'), 0.91, -2.05, 0),
    translate(rbox(1.9, 0.75, 0.08, 0.03, 'coral'), 0, -2.05, -0.66),
    translate(rbox(1.9, 0.75, 0.08, 0.03, 'coral'), 0, -2.05, 0.66),
  );
  const far = boxAt(1.9, 0.75, 1.4, 'coral', 0, -2.05, 0);
  const benches = merge([-1, 1].map((s) => boxAt(0.4, 0.4, 1.2, 'ivory', s * 0.62, -1.99, 0)));
  const trim = detail(boxAt(1.96, 0.06, 1.46, 'ivory', 0, -1.32, 0));
  return merge(tintable(lodPair(walls, far)), benches, trim);
}

function gondolaBuild(): Geo {
  const hangers = [-1, 1].map((s) =>
    merge(beam([0, 0.05, s * 0.72], [-0.85, -1.3, s * 0.62], 0.06, 'slate'), beam([0, 0.05, s * 0.72], [0.85, -1.3, s * 0.62], 0.06, 'slate')),
  );
  const collar = merge([-1, 1].map((s) => translate(barZ(0.14, 0.09, 'slate', 6), 0, 0, s * 0.72)));
  const canopy = translate(stripesX(2.1, 0.1, 1.7, 6, 'coral', 'ivory'), 0, -0.45, 0);
  const crown = translate(rbox(0.5, 0.18, 0.5, 0.06, 'butter'), 0, -0.35, 0);
  return merge(gondolaTub(), merge(hangers), detail(collar), canopy, crown);
}

const GONDOLA_SEATS: readonly Seat[] = [
  { x: -0.62, y: -1.59, z: 0, heading: Math.PI / 2 },
  { x: 0.62, y: -1.59, z: 0, heading: -Math.PI / 2 },
];

export const FERRIS_PROPS: readonly PropDef[] = [
  prop('ferris.frame', frameBuild, [13, 7.5], 'landmark', { tags: ['funfair', 'landmark', 'ride'] }),
  prop('ferris.wheel', wheelBuild, [0, 0], 'landmark', {
    origin: 'pivot',
    tags: ['funfair', 'landmark', 'ride', 'moving', 'rotate:z'],
  }),
  prop('ferris.gondola', gondolaBuild, [0, 0], 'stall', {
    origin: 'pivot',
    tint: 'coral',
    seats: GONDOLA_SEATS,
    tags: ['funfair', 'ride', 'moving', 'hang'],
  }),
];
