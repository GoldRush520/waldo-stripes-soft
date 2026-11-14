/**
 * Carousel: "carousel.base" (static ring, drum, striped canopy) + "carousel.platform"
 * (rotating disc, origin at centre on the ground, rotates about +y).
 */
import { type Geo, beam, cone, detail, merge, place, profile, rotateY, sphere, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import {
  type Seat,
  bandProfile,
  boxAt,
  bulbs,
  canopyProfile,
  drumProfile,
  lodPair,
  post,
  prop,
  revolve,
  stripedLod,
  stripedRevolve,
  tangentHeading,
  wallProfile,
} from './kit';
import { type Mount, horse, rooster, swan, teacup } from './mounts';

export const CAROUSEL_PLATFORM_RADIUS = 4.6;
const MOUNT_R = 3.5;
const DECK_Y = 0.35;
const CANOPY_Y = 4.3;
const CANOPY_R = 5.8;
const MOUNTS = 10;

function ring(): Geo {
  const steps = detail(
    merge(
      [0, 1, 2, 3].map((i) =>
        rotateY(boxAt(1.4, 0.18, 0.4, 'stone', 0, 0, 5.75), (i / 4) * Math.PI * 2 + Math.PI / 4),
      ),
    ),
  );
  return merge(steps, revolve(
    [
      [4.72, DECK_Y],
      [4.72, 0],
      [5.6, 0],
      [5.6, DECK_Y],
      [4.72, DECK_Y],
    ],
    'clay',
    24,
  ));
}

function drum(): Geo {
  const wall = stripedLod(drumProfile(1.2, CANOPY_Y + 0.6), 12, 3, 1, 'coral', 'ivory');
  const mirrors = detail(
    merge(
      Array.from({ length: 6 }, (_, i) =>
        rotateY(translate(profile([[-0.22, 0], [0.22, 0], [0.22, 0.7], [0, 0.85], [-0.22, 0.7]], 0.04, 'blueLight'), 0, 2.2, 1.22), (i / 6) * Math.PI * 2),
      ),
    ),
  );
  return merge(wall, mirrors);
}

function scallops(): Geo {
  const flap = profile(
    [
      [-0.3, 0],
      [0.3, 0],
      [0.21, -0.15],
      [0, -0.22],
      [-0.21, -0.15],
    ],
    0.04,
    'ivory',
  );
  return detail(
    merge(Array.from({ length: 28 }, (_, i) => rotateY(translate(flap, 0, CANOPY_Y - 0.42, CANOPY_R), (i / 28) * Math.PI * 2))),
  );
}

function canopy(): Geo {
  const roof = translate(stripedLod(canopyProfile(CANOPY_R, 2.2), 16, 3, 1, 'coral', 'ivory'), 0, CANOPY_Y, 0);
  const valance = translate(
    stripedLod(wallProfile(CANOPY_R, 0.42, 0.05), 28, 2, 1, 'coral', 'butter', bandProfile(CANOPY_R, 0.42)),
    0,
    CANOPY_Y - 0.42,
    0,
  );
  const lights = bulbs(
    Array.from({ length: 40 }, (_, i) => {
      const a = ((i + 0.5) / 40) * Math.PI * 2;
      return [Math.sin(a) * (CANOPY_R + 0.07), CANOPY_Y - 0.2, Math.cos(a) * (CANOPY_R + 0.07)] as const;
    }),
  );
  const finial = merge(
    translate(sphere(0.3, 'butter', 8, 5), 0, CANOPY_Y + 2.45, 0),
    translate(cone(0.12, 0.7, 'butterDeep', 6), 0, CANOPY_Y + 2.6, 0),
  );
  const flag = detail(post(0, 0, 0.5, 0.02, 'timberDeep', 4, CANOPY_Y + 3.1));
  return merge(roof, valance, scallops(), finial, flag, lights);
}

function baseBuild(): Geo {
  return merge(ring(), drum(), canopy());
}

function deck(): Geo {
  return stripedRevolve(
    [
      [1.35, DECK_Y],
      [1.35, 0.02],
      [CAROUSEL_PLATFORM_RADIUS, 0.02],
      [CAROUSEL_PLATFORM_RADIUS, DECK_Y],
      [1.35, DECK_Y],
    ],
    20,
    1,
    'clay',
    'clayLight',
  );
}

const SADDLES = ['coral', 'blue', 'butter', 'sage', 'coral', 'blue', 'butter'] as const;
const BODIES = ['ivory', 'butterLight', 'ivory', 'clayLight', 'ivory', 'ivoryShade', 'butterLight'] as const;

function mountAt(i: number): Mount {
  if (i === 2) return swan();
  if (i === 5) return teacup();
  if (i === 8) return rooster();
  const k = i % SADDLES.length;
  return horse(BODIES[k] ?? 'ivory', SADDLES[k] ?? 'coral');
}

interface Placed {
  readonly geo: Geo;
  readonly seat: Seat;
}

function placeMount(i: number): Placed {
  const a = (i / MOUNTS) * Math.PI * 2;
  const x = Math.sin(a) * MOUNT_R;
  const z = Math.cos(a) * MOUNT_R;
  const h = tangentHeading(a);
  const m = mountAt(i);
  const c = Math.cos(h);
  const s = Math.sin(h);
  const seat: Seat = {
    x: x + m.seat.x * c + m.seat.z * s,
    y: DECK_Y + m.seat.y,
    z: z - m.seat.x * s + m.seat.z * c,
    heading: h + m.seat.heading,
  };
  return { geo: place(m.geo, x, DECK_Y, z, h), seat };
}

const PLACED: readonly Placed[] = Array.from({ length: MOUNTS }, (_, i) => placeMount(i));

function poles(): Geo {
  const top = CANOPY_Y - 0.05;
  const near = Array.from({ length: MOUNTS }, (_, i) => {
    const a = (i / MOUNTS) * Math.PI * 2;
    return post(Math.sin(a) * MOUNT_R, Math.cos(a) * MOUNT_R, top - DECK_Y, 0.035, 'butter', 6, DECK_Y);
  });
  const far = Array.from({ length: MOUNTS }, (_, i) => {
    const a = (i / MOUNTS) * Math.PI * 2;
    const x = Math.sin(a) * MOUNT_R;
    const z = Math.cos(a) * MOUNT_R;
    return beam([x, DECK_Y, z], [x, top, z], 0.08, 'butter');
  });
  return lodPair(merge(near), merge(far));
}

function platformBuild(): Geo {
  return merge(deck(), poles(), PLACED.map((p) => p.geo));
}

export const CAROUSEL_PROPS: readonly PropDef[] = [
  prop('carousel.base', baseBuild, [11.2, 11.2], 'ride', { tags: ['funfair', 'ride', 'landmark'], tint: 'coral' }),
  prop('carousel.platform', platformBuild, [0, 0], 'ride', {
    origin: 'ground',
    seats: PLACED.map((p) => p.seat),
    tags: ['funfair', 'ride', 'moving', 'rotate:y'],
  }),
];
