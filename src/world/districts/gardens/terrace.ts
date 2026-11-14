/** The raised north terrace: stone platform, stairs, the glass palm-house, tea tables and visitors. */
import type { Geo } from '../../../core/geo';
import { platform, stairs } from '../../../props/civic';
import { TABLE_TOP_Y } from '../../../props/street';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { GREENHOUSE, STAIRS, TERRACE, rect, seatedOn } from './plan';

const Y = TERRACE.y;
const geoCache = new Map<string, Geo>();

function cached(key: string, make: () => Geo): Geo {
  const hit = geoCache.get(key);
  if (hit) return hit;
  const g = make();
  geoCache.set(key, g);
  return g;
}

/**
 * Solid footprint of the whole terrace for ground-level people. Called last (after the deck crowd
 * has been filled), because fills test every block regardless of height.
 */
export function sealTerrace(k: Kit): void {
  k.block((TERRACE.x0 + TERRACE.x1) / 2, (TERRACE.z0 + TERRACE.z1) / 2, TERRACE.x1 - TERRACE.x0, TERRACE.z1 - TERRACE.z0);
}

/** A prop standing on the deck, with a footprint so the deck crowd keeps clear of it. */
function deckProp(k: Kit, key: string, at: { x: number; z: number; rot?: number; scale?: number }, w: number, d = w): void {
  k.prop(key, { ...at, y: Y });
  k.block(at.x, at.z, w, d, at.rot ?? 0);
}

function flight(k: Kit, x: number, w: number): void {
  const geo = cached(`stairs:${w}`, () => stairs(w, STAIRS.rise, STAIRS.steps, { run: STAIRS.run, color: 'clayLight', cheek: 'clay' }).geo);
  const L = STAIRS.steps * STAIRS.run;
  const zc = TERRACE.z1 + L / 2;
  k.add(geo, { x, z: zc });
  k.block(x, zc, w + 0.5, L);
  k.surface('stairs', rect(x - w / 2, TERRACE.z1, x + w / 2, TERRACE.z1 + L), STAIRS.rise / 2);
}

function structure(k: Kit): void {
  const poly = rect(TERRACE.x0, TERRACE.z0, TERRACE.x1, TERRACE.z1);
  k.add(cached('terrace', () => platform(poly, Y, 'clay', 'ivory').geo), { x: 0, z: 0 });
  k.surface('deck', poly, Y);
  k.ground(rect(TERRACE.x0 + 0.4, -16.2, TERRACE.x1 - 0.4, TERRACE.z1 - 0.4), 'ivoryShade', Y, 0.02);
  flight(k, STAIRS.main.x, STAIRS.main.w);
  flight(k, STAIRS.west.x, STAIRS.west.w);
  for (const x of [-16, -12, -8, -4, 4, 8, 12, 16, 20]) k.prop('balustrade.4', { x, z: TERRACE.z1 + 0.2, y: Y });
  k.prop('greenhouse.frame', { x: GREENHOUSE.x, z: GREENHOUSE.z, y: Y });
  k.prop('greenhouse.glass', { x: GREENHOUSE.x, z: GREENHOUSE.z, y: Y });
}

/** Plants under glass: a tall palm in the dome, palms, ferns and succulents in the wings. */
function underGlass(k: Kit): void {
  const g = GREENHOUSE;
  deckProp(k, 'tree.palm.tall', { x: g.x, z: g.z - 0.8 }, 0.9);
  deckProp(k, 'tree.palm.short', { x: g.x - 9.5, z: g.z - 1.6, scale: 0.8 }, 0.7);
  deckProp(k, 'tree.palm.short', { x: g.x + 9.5, z: g.z - 1.8, scale: 0.78 }, 0.7);
  const beds: ReadonlyArray<readonly [string, number, number]> = [
    ['plant.fern', -2.4, -2.4],
    ['plant.fern', 2.2, -2.6],
    ['plant.hydrangea', -2.8, 1.2],
    ['plant.fern', 2.9, 0.9],
    ['plant.agave', -6.2, -2.8],
    ['plant.cactus.column', -12.6, -2.6],
    ['plant.agave', -12.2, 2.4],
    ['plant.fern', -7.4, 2.6],
    ['plant.cactus.paddle', 12.6, 2.2],
    ['plant.cactus.column', 12.9, 1.3],
    ['plant.fern', 6.6, -2.8],
    ['plant.hydrangea', 12.4, -2.6],
    ['plant.lavender', 6.2, 2.7],
  ];
  for (const [key, dx, dz] of beds) deckProp(k, key, { x: g.x + dx, z: g.z + dz }, 0.9);
}

function dressing(k: Kit): void {
  for (const x of [-14.5, -6.2, 6.2, 14.5]) deckProp(k, x > 0 ? 'tree.potted.orange' : 'tree.potted.lemon', { x, z: -15.6 }, 0.8);
  for (const x of [-21, 21]) deckProp(k, 'tree.potted.bay', { x, z: -12.9 }, 0.6);
  deckProp(k, 'veg.seedlings', { x: -18.4, z: -24.6, rot: Math.PI / 2 }, 1.6, 0.6);
  deckProp(k, 'veg.seedlings', { x: -18.4, z: -21.2, rot: Math.PI / 2 }, 1.6, 0.6);
  deckProp(k, 'garden.urn', { x: -20.8, z: -27 }, 0.5);
  deckProp(k, 'garden.urn', { x: 20.8, z: -27 }, 0.5);
  deckProp(k, 'cart.wheelbarrowSoil', { x: -16.6, z: -18.6, rot: 0.6 }, 0.7, 1.75);
  deckProp(k, 'lamp.classic', { x: -2.8, z: -12.9 }, 0.3);
  deckProp(k, 'lamp.classic', { x: 2.8, z: -12.9 }, 0.3);
}

function benches(k: Kit): void {
  for (const x of [-11, 11]) {
    seatedOn(k, 'bench.park.long', { x, z: -13, y: Y }, { fill: 0.75, clips: ['sit', 'sit.talk', 'sit.read', 'sit.crossed'] });
    k.block(x, -13, 2.3, 0.7);
  }
}

function lookers(k: Kit): void {
  const spots: ReadonlyArray<readonly [number, string]> = [
    [-15.4, 'point'],
    [-14.6, 'lookout'],
    [-6.8, 'photo.camera'],
    [7.4, 'point.across'],
    [15.2, 'lookout'],
    [16, 'talk'],
  ];
  for (const [x, clip] of spots) k.person({ x, z: -12.75, y: Y, heading: k.rng.range(-0.35, 0.35), clip, age: k.rng.chance(0.2) ? 'child' : 'adult' });
  k.group(-9.2, -15, 3, { y: Y, clips: ['talk', 'talk.laugh', 'idle.shift'] });
  k.group(17.6, -14.6, 2, { y: Y, clips: ['talk', 'talk.nod'] });
  k.person({ x: -17.2, z: -23, y: Y, heading: -Math.PI / 2, clip: 'garden.plant', hold: [{ key: 'upper.apron', tint: 'sage' }], look: { hat: 'hat.sun', hatTint: 'butter' } });
  k.person({ x: -17.4, z: -19.8, y: Y, heading: 2.2, clip: 'carry.stack', hold: [{ key: 'upper.apron', tint: 'sage' }], look: { hat: 'hat.cap', hatTint: 'sage' } });
}

function tea(k: Kit): void {
  k.vignette({ id: 'tea-thief', title: 'Cake on the terrace', story: 'A ginger cat crouches on the tea-room table, eyes on the last slice of cake, while the diners are busy admiring the view and a waiter hurries over too late.' }, () => {
    seatedOn(k, 'cafe.set.round2', { x: 17.4, z: -24.2, y: Y, rot: Math.PI / 2, tint: 'butter' }, { fill: 1, clips: ['sit.talk', 'sit.eat'] });
    seatedOn(k, 'cafe.set.round2', { x: 18.2, z: -20.2, y: Y, rot: Math.PI / 2, tint: 'blue' }, { fill: 1, clips: ['sit.talk', 'sit.crossed'] });
    k.block(17.4, -24.2, 1.8, 1.0);
    k.block(18.2, -20.2, 1.8, 1.0);
    k.prop('tabletop.tea', { x: 17.4, z: -24.2, y: Y + TABLE_TOP_Y });
    k.prop('tabletop.tea', { x: 18.2, z: -20.2, y: Y + TABLE_TOP_Y });
    k.prop('animal.cat.pounce', { x: 18.45, z: -20, y: Y + TABLE_TOP_Y + 0.02, rot: -2.4 });
    k.person({ x: 19.8, z: -17.6, y: Y, heading: -2.6, clip: 'serve.tray', hold: [{ key: 'upper.apron', tint: 'ivory' }], look: { hat: null, shirt: 'ivory', pants: 'ink' } });
    k.person({ x: 15.6, z: -18.8, y: Y, face: [18.4, -20.1], clip: 'point', age: 'child' });
  });
  k.prop('parasol.open', { x: 20.6, z: -26.4, y: Y, tint: 'coral' });
}

function palmHouse(k: Kit): void {
  const g = GREENHOUSE;
  k.vignette({ id: 'tiny-cactus', title: 'The smallest star of the palm house', story: 'A guide holds her umbrella high beside the giant palm, but her whole tour group has crowded round to photograph one tiny cactus in the corner.' }, () => {
    k.person({ x: g.x + 4.8, z: g.z + 1.6, y: Y, face: [g.x, g.z - 0.8], clip: 'point.sky', hold: [{ key: 'hold.umbrella', tint: 'coral' }], look: { hat: 'hat.boater', hatTint: 'coral', lower: 'lower.skirt' } });
    const cx = g.x + 12.4;
    const cz = g.z + 0.4;
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + i * 0.42;
      k.person({
        x: cx - 1.3 - Math.cos(a) * 1.2,
        z: cz + Math.sin(a) * 1.4,
        y: Y,
        face: [g.x + 12.9, g.z + 1.3],
        clip: k.rng.pick(['photo.camera', 'photo.camera', 'point', 'lookout', 'photo.selfie']),
        hold: i % 3 === 0 ? ['back.pack', 'neck.camera'] : ['neck.camera'],
        look: { hat: k.rng.pick(['hat.sun', 'hat.cap', null]), glasses: i % 2 ? 'face.sunglasses' : null },
      });
    }
  });
  k.vignette({ id: 'botanist', title: 'Notes on a fern', story: 'A botanist bends over a fern with her notebook while a boy behind her pokes the spiky agave and instantly regrets it.' }, () => {
    k.person({ x: g.x - 7.6, z: g.z + 1.2, y: Y, face: [g.x - 7.4, g.z + 2.6], clip: 'read.book', look: { hat: 'hat.sun', hatTint: 'sage', glasses: 'face.glasses.round', shirt: 'sageLight' } });
    k.person({ x: g.x - 5.6, z: g.z - 1.4, y: Y, face: [g.x - 6.2, g.z - 2.8], clip: 'point.down', age: 'child' });
    k.person({ x: g.x - 4.8, z: g.z - 0.4, y: Y, face: [g.x - 5.6, g.z - 1.4], clip: 'talk.shrug' });
  });
  k.group(g.x - 2.6, g.z + 3.0, 3, { y: Y, clips: ['point.sky', 'lookout', 'talk'] });
  k.group(g.x - 11.4, g.z + 0.2, 2, { y: Y, clips: ['lookout', 'talk.whisper'] });
  k.group(g.x + 7.6, g.z - 1.6, 2, { y: Y, clips: ['photo.camera', 'point.sky'] });
}

function flows(k: Kit): void {
  k.walkers(
    [
      [TERRACE.x0 + 1.5, Y, -14.6],
      [0, Y, -14.9],
      [TERRACE.x1 - 1.5, Y, -14.6],
    ],
    10,
    { lanes: [0.3, 0.9], speed: [0.6, 1.0], hold: (rng) => (rng.chance(0.2) ? [{ key: 'hold.umbrella', tint: rng.pick(CLOTHS) }] : undefined) },
  );
}

export function terrace(k: Kit): void {
  structure(k);
  underGlass(k);
  dressing(k);
  benches(k);
  lookers(k);
  tea(k);
  palmHouse(k);
  flows(k);
}
