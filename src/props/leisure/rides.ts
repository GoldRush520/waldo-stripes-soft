/**
 * Chair-swing ride and swing-boat (static frames + moving parts with origins at their pivots).
 *
 * - "chairswing.mast": static, rests on y = 0. The crown hub sits at CHAIRSWING_HUB.
 * - "chairswing.top": origin at the hub centre; rotates about +y. Chairs hang outward at 30°.
 * - "swingboat.frame": static; boat pivot at SWINGBOAT_PIVOT.
 * - "swingboat.boat": origin at the pivot on the top bar; swings about the x axis.
 */
import { type Geo, beam, cone, cyl, detail, merge, profile, rotateY, rotateZ, sphere, tintable, translate, tube } from '../../core/geo';
import type { PropDef } from '../registry';
import {
  type Seat,
  type V3,
  bandProfile,
  barX,
  boxAt,
  bulbs,
  canopyProfile,
  drumProfile,
  lodPair,
  prop,
  rope,
  softBox,
  stripedLod,
  tangentHeading,
  wallProfile,
  xfPoint,
} from './kit';

export const CHAIRSWING_HUB: V3 = [0, 8, 0];
const ARM_R = 3.3;
const CHAIN_L = 4.4;
const TILT = Math.PI / 6;
const CHAIRS = 12;

function mastBuild(): Geo {
  const plinth = stripedLod(drumProfile(2.4, 0.45), 16, 3, 1, 'blue', 'ivory');
  const column = stripedLod(drumProfile(0.45, CHAIRSWING_HUB[1] - 0.45, 0.4), 8, 3, 1, 'coral', 'ivory');
  const bolts = detail(
    merge(Array.from({ length: 16 }, (_, i) => rotateY(boxAt(0.12, 0.08, 0.06, 'butterDeep', 0, 0.2, 2.42), (i / 16) * Math.PI * 2 + 0.2))),
  );
  const collar = translate(cyl(0.65, 0.55, 0.35, 'butter', 10), 0, 0.45, 0);
  const steps = [0, 1].map((i) => boxAt(1.6, 0.15 * (i + 1), 0.3, 'stone', 0, 0, 2.95 - i * 0.3));
  const lamp = detail(
    merge([1, -1].map((s) => translate(sphere(0.12, 'butterLight', 6, 4), s * 0.5, CHAIRSWING_HUB[1] - 1.2, 0))),
  );
  return merge(plinth, translate(column, 0, 0.45, 0), collar, steps, lamp, bolts);
}

function chairLocal(): Geo {
  const chains = merge([-1, 1].map((s) => rope([s * 0.25, 0, 0], [s * 0.25, -CHAIN_L, 0], 0.025, 'slate')));
  const seatNear = merge(
    boxAt(0.56, 0.08, 0.46, 'butter', 0, -CHAIN_L - 0.08, 0),
    boxAt(0.56, 0.5, 0.06, 'butter', 0, -CHAIN_L - 0.02, 0.24),
    detail(beam([-0.2, -CHAIN_L - 0.08, -0.22], [-0.2, -CHAIN_L - 0.45, -0.32], 0.03, 'slate')),
    detail(beam([0.2, -CHAIN_L - 0.08, -0.22], [0.2, -CHAIN_L - 0.45, -0.32], 0.03, 'slate')),
  );
  const seatFar = merge(
    boxAt(0.56, 0.55, 0.46, 'butter', 0, -CHAIN_L - 0.08, 0),
    beam([0, 0, 0], [0, -CHAIN_L, 0], 0.06, 'slate'),
  );
  return merge(chains, lodPair(seatNear, seatFar));
}

function chairTransform(i: number): { readonly a: number; readonly tip: V3 } {
  const a = (i / CHAIRS) * Math.PI * 2;
  return { a, tip: [Math.sin(a) * ARM_R, -0.1, Math.cos(a) * ARM_R] };
}

const CHAIR_SEATS: readonly Seat[] = Array.from({ length: CHAIRS }, (_, i) => {
  const { a, tip } = chairTransform(i);
  const p = xfPoint([0, -CHAIN_L, 0], TILT, a - Math.PI / 2, tip);
  return { x: p[0], y: p[1], z: p[2], heading: tangentHeading(a) };
});

function topBuild(): Geo {
  const chair = rotateZ(rotateY(chairLocal(), Math.PI), TILT);
  const chairs = Array.from({ length: CHAIRS }, (_, i) => {
    const { a, tip } = chairTransform(i);
    return translate(rotateY(chair, a - Math.PI / 2), tip[0], tip[1], tip[2]);
  });
  const arms = Array.from({ length: CHAIRS }, (_, i) => {
    const { tip } = chairTransform(i);
    return beam([0, -0.1, 0], [tip[0] * 1.03, -0.1, tip[2] * 1.03], 0.1, 'ivory');
  });
  const roof = stripedLod(canopyProfile(ARM_R + 0.4, 1.8), 12, 3, 1, 'coral', 'ivory');
  const valance = translate(
    stripedLod(wallProfile(ARM_R + 0.4, 0.45, 0.05), 24, 1, 1, 'butter', 'ivory', bandProfile(ARM_R + 0.4, 0.45)),
    0,
    -0.45,
    0,
  );
  const finial = translate(cone(0.25, 0.8, 'butter', 6), 0, 1.75, 0);
  const lights = bulbs(
    Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return [Math.sin(a) * (ARM_R + 0.46), -0.4, Math.cos(a) * (ARM_R + 0.46)] as const;
    }),
  );
  return merge(roof, valance, finial, detail(merge(arms)), chairs, lights);
}

/* ------------------------------------------------------------------ swing boat */

export const SWINGBOAT_PIVOT: V3 = [0, 4.6, 0];
const BOAT_DROP = 3.7;

function swingFrameBuild(): Geo {
  const top = SWINGBOAT_PIVOT[1];
  const legs = [-1.2, 1.2].flatMap((x) => [
    [[x, 0.1, -2.6], [x, top, 0]] as const,
    [[x, 0.1, 2.6], [x, top, 0]] as const,
  ]);
  const aFrames = merge(
    lodPair(
      merge(legs.map(([a, b]) => tube([a, b], 0.1, 'coral', 8))),
      merge(legs.map(([a, b]) => beam(a, b, 0.18, 'coral'))),
    ),
    [-1.2, 1.2].map((x) => beam([x, 1.4, -1.8], [x, 1.4, 1.8], 0.12, 'ivory')),
    detail(merge(legs.map(([a]) => boxAt(0.3, 0.1, 0.3, 'slate', a[0], 0, a[2])))),
  );
  const bar = translate(barX(2.8, 0.1, 'butter', 8), 0, top, 0);
  const deck = softBox(3.0, 0.2, 2.4, 0.04, 'clay');
  const fence = merge(
    [-1.6, 1.6].map((x) => rope([x, 0.9, -2.8], [x, 0.9, 2.8], 0.04, 'ivory')),
    [-1.6, 1.6].flatMap((x) => [-2.8, 0, 2.8].map((z) => detail(boxAt(0.06, 0.95, 0.06, 'timberDeep', x, 0, z)))),
  );
  const sign = translate(stripedSign(), 0, top + 0.12, 0);
  return merge(aFrames, bar, deck, fence, sign);
}

function stripedSign(): Geo {
  return merge(boxAt(2.4, 0.5, 0.08, 'ivory', 0, 0, 0), detail(boxAt(2.0, 0.28, 0.1, 'coral', 0, 0.11, 0)));
}

function hull(): Geo {
  const side = profile(
    [
      [-1.9, 0.75],
      [-1.5, 0.15],
      [-0.9, 0],
      [0.9, 0],
      [1.5, 0.15],
      [1.9, 0.75],
      [1.6, 0.75],
      [1.2, 0.3],
      [-1.2, 0.3],
      [-1.6, 0.75],
    ],
    1.3,
    'coral',
  );
  return tintable(rotateY(side, Math.PI / 2));
}

function boatBuild(): Geo {
  const y0 = -BOAT_DROP - 0.3;
  const sides = tintable(
    merge([-1, 1].map((s) => translate(softBox(0.08, 0.4, 2.5, 0.03, 'coral'), s * 0.62, y0 + 0.3, 0))),
  );
  const benches = merge([-1, 1].map((s) => translate(softBox(0.3, 0.12, 2.3, 0.04, 'ivory'), s * 0.4, y0 + 0.45, 0)));
  const planks = detail(merge([-0.45, -0.15, 0.15, 0.45].map((x) => boxAt(0.02, 0.02, 2.4, 'coralDeep', x, y0 + 0.3, 0))));
  const trim = detail(merge([-1, 1].map((s) => boxAt(0.1, 0.06, 2.5, 'ivory', s * 0.62, y0 + 0.7, 0))));
  const hangers = [-1, 1].flatMap((sx) =>
    [-1, 1].map((sz) => beam([sx * 0.7, 0, 0], [sx * 0.62, y0 + 0.7, sz * 1.2], 0.06, 'slate')),
  );
  const ropes = detail(merge([-1, 1].map((sz) => beam([0, -0.8, 0], [0, y0 + 0.75, sz * 1.85], 0.03, 'timber'))));
  return merge(translate(hull(), 0, y0, 0), sides, benches, planks, trim, hangers, ropes);
}

const BOAT_SEATS: readonly Seat[] = [-1, 1].flatMap((s) =>
  [-0.8, 0, 0.8].map((z) => ({ x: s * 0.4, y: -BOAT_DROP + 0.27, z, heading: s < 0 ? Math.PI / 2 : -Math.PI / 2 })),
);

export const RIDE_PROPS: readonly PropDef[] = [
  prop('chairswing.mast', mastBuild, [4.8, 4.8], 'ride', { tags: ['funfair', 'ride'] }),
  prop('chairswing.top', topBuild, [0, 0], 'ride', {
    origin: 'pivot',
    seats: CHAIR_SEATS,
    tags: ['funfair', 'ride', 'moving', 'rotate:y'],
  }),
  prop('swingboat.frame', swingFrameBuild, [3.2, 5.6], 'ride', { tags: ['funfair', 'ride'] }),
  prop('swingboat.boat', boatBuild, [0, 0], 'stall', {
    origin: 'pivot',
    tint: 'blue',
    seats: BOAT_SEATS,
    tags: ['funfair', 'ride', 'moving', 'rotate:x'],
  }),
];
