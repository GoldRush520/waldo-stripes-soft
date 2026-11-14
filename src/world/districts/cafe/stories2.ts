/**
 * Lane and terrace microstories: balcony gossip, the watered window cleaner, the pancake summit,
 * the rooftop toast, the sneezing florist customer and the sweeper versus the pigeon feeder.
 */
import type { BalconyAnchor } from '../../../props/arch/types';
import type { Kit } from '../../kit';
import { clip, opt, opts } from './catalog';
import { table, waiter } from './dining';
import { EDGE_ROT } from './plan';
import { type PlacedHouse, frontOf } from './terraces';

const R = EDGE_ROT;

function balconyNearest(h: PlacedHouse, side: 1 | -1): BalconyAnchor | undefined {
  return [...h.result.balconies].sort((a, b) => side * (b.x - a.x) || a.y - b.y)[0];
}

export function balconyGossip(k: Kit, left: PlacedHouse, right: PlacedHouse): void {
  k.vignette(
    {
      id: 'balcony-gossip',
      title: 'Over the balcony rail',
      story: 'Two neighbours lean across from their balconies to swap the latest gossip, while a man in the lane below pretends to read his paper and listens to every word.',
    },
    () => {
      const a = balconyNearest(left, 1);
      const b = balconyNearest(right, -1);
      if (!a || !b) return;
      const pa = k.rel(left, a.x + a.w / 2 - 0.35, a.z, a.heading + 1.1);
      const pb = k.rel(right, b.x - b.w / 2 + 0.35, b.z, b.heading - 1.1);
      k.person({ ...pa, y: a.y, clip: clip('talk.whisper', 'talk'), blob: 0, look: { hat: 'hat.beret', hatTint: 'coral' } });
      k.person({ ...pb, y: b.y, clip: clip('talk.whisper', 'talk.animated', 'talk'), blob: 0, age: 'elder' });
      const below = frontOf(k, left, 2.2, left.w / 2 - 0.2);
      k.person({ ...below, heading: below.heading + Math.PI - 0.3, clip: clip('read.paper', 'lookout'), look: { hat: 'hat.top', hatTint: 'blueDeep' } });
      const dog = frontOf(k, left, 2.5, left.w / 2 + 0.5);
      k.prop('animal.cat.sleep', { x: dog.x, z: dog.z, rot: 0.6 });
    },
  );
}

export function wateredCleaner(k: Kit, h: PlacedHouse): void {
  k.vignette(
    {
      id: 'watered-cleaner',
      title: 'Rain from a clear sky',
      story: 'A window cleaner polishes the café window while the lady on the balcony above waters her geraniums straight onto his head.',
    },
    () => {
      const b = [...h.result.balconies].sort((p, q) => q.y - p.y)[0];
      if (b) {
        const pb = k.rel(h, b.x, b.z, b.heading);
        k.person({ ...pb, y: b.y, clip: clip('garden.water', 'point.down', 'point'), blob: 0, age: 'elder', look: { hat: 'hat.sun', hatTint: 'butter' } });
      }
      const at = frontOf(k, h, 0.55, b ? b.x : 0);
      const cleaner = k.person({ ...at, heading: at.heading + Math.PI, clip: clip('clean.window', 'wave'), look: { hat: 'hat.cap', hatTint: 'sage', shirt: 'sage', pattern: 0 } });
      k.searchable(cleaner, 'the soggy window cleaner');
      const bucket = frontOf(k, h, 0.5, (b ? b.x : 0) + 0.8);
      k.prop('basket.wicker', { x: bucket.x, z: bucket.z, rot: R });
      const laugh = frontOf(k, h, 2.4, (b ? b.x : 0) - 1.1);
      k.person({ ...laugh, heading: laugh.heading + 0.9, clip: clip('talk.laugh', 'point'), hold: [{ key: 'hold.bag', tint: 'blue' }] });
    },
  );
}

export function pancakeSummit(k: Kit, x: number, z: number): void {
  k.vignette(
    {
      id: 'pancake-summit',
      title: 'The pancake summit',
      story: 'A small girl faces a pancake stack taller than her head; her parents cannot stop laughing and the neighbouring table has come over to watch.',
    },
    () => {
      k.prop('cafe.table.round', { x, z });
      k.prop('tabletop.pancakes', { x, z, y: 0.75 });
      const seats: ReadonlyArray<readonly [number, 'child' | 'adult']> = [
        [Math.PI, 'child'],
        [Math.PI / 2, 'adult'],
        [-Math.PI / 2, 'adult'],
      ];
      for (const [a, age] of seats) {
        const at = { x: x + Math.sin(a) * 0.64, z: z + Math.cos(a) * 0.64, rot: a + Math.PI, tint: 'butter' as const };
        k.prop('cafe.chair.bistro', at, { walkThrough: true });
        k.seated('cafe.chair.bistro', at, { place: false, fill: 1, age, clips: [age === 'child' ? clip('sit.eat', 'sit') : clip('sit.talk', 'sit')] });
      }
      k.person({ x: x + 0.3, z: z + 1.2, face: [x, z], clip: clip('talk.laugh', 'cheer') });
      k.person({ x: x - 0.6, z: z + 1.35, face: [x, z], clip: clip('photo.camera', 'point') });
      k.person({ x: x + 1.3, z: z + 0.7, face: [x, z], age: 'child', clip: clip('cheer.jump', 'cheer') });
      waiter(k, x - 1.25, z - 0.2, [x, z], 'tray');
    },
  );
}

export function rooftopToast(k: Kit, h: PlacedHouse): void {
  const t = h.result.terrace;
  if (!t) return;
  k.vignette(
    {
      id: 'rooftop-toast',
      title: 'A toast on the roof',
      story: 'On the corner café roof a birthday party raises its glasses while the guest of honour, on his feet, delivers a very long speech.',
    },
    () => {
      const corners = [
        [-t.w / 2, -t.d / 2],
        [t.w / 2, -t.d / 2],
        [t.w / 2, t.d / 2],
        [-t.w / 2, t.d / 2],
      ].map(([x, z]) => {
        const p = k.rel(h, x ?? 0, z ?? 0);
        return [p.x, p.z] as const;
      });
      k.surface('roof', corners, t.y);
      for (const u of [-1.5, 1.6]) {
        const p = k.rel(h, u, 0.9);
        table(k, p.x, p.z, { y: t.y, chairs: 4, turn: Math.PI / 4, fill: 0.95, top: 'tabletop.wine', clips: [clip('sit.talk', 'sit'), clip('drink.cup', 'sit'), 'sit'] });
      }
      const speech = k.rel(h, 0.1, 2.3, 0.2);
      const id = k.person({ ...speech, y: t.y, clip: clip('cheer', 'wave'), blob: 0, look: { hat: opt('hat.party'), hatTint: 'butter' } });
      k.searchable(id, 'the birthday speech-maker');
      const pour = k.rel(h, 2.9, -0.6, -1.2);
      k.person({ ...pour, y: t.y, clip: clip('serve.pour', 'talk'), blob: 0, hold: opts('upper.apron'), look: { shirt: 'ivory', pattern: 0, pants: 'ink' } });
    },
  );
}

export function florist(k: Kit, shop: PlacedHouse): void {
  k.vignette(
    {
      id: 'florist-sneeze',
      title: 'Bless you!',
      story: 'At the florist a customer sniffing a bouquet lets out an enormous sneeze; petals fly, the florist ducks and the next customer shields her hat.',
    },
    () => {
      const cart = frontOf(k, shop, 1.3, -1.5);
      k.prop('cart.flower', { x: cart.x, z: cart.z, rot: Math.PI / 2 });
      const tulips = frontOf(k, shop, 0.45, 1.4);
      k.prop('plant.tulips', { x: tulips.x, z: tulips.z });
      for (const along of [-2.6, 2.6]) {
        const p = frontOf(k, shop, 0.5, along);
        k.prop('plant.flowers.a', { x: p.x, z: p.z, tint: along < 0 ? 'coral' : 'butter' });
      }
      const fl = frontOf(k, shop, 1.4, 0.2);
      k.person({ ...fl, heading: 0.4, clip: clip('vend.handover', 'talk'), hold: opts('upper.apron'), look: { hat: opt('hat.flowercrown'), shirt: 'sage', pattern: 3, shirt2: 'ivory' } });
      const sn = frontOf(k, shop, 2.5, 0.6);
      k.person({ ...sn, heading: sn.heading + Math.PI - 0.3, clip: clip('comedy.sneeze', 'talk'), look: { hat: 'hat.bowler', hatTint: 'blueDeep' } });
      const nx = frontOf(k, shop, 2.6, 1.6);
      k.person({ ...nx, heading: nx.heading + Math.PI + 0.6, clip: clip('comedy.startle', 'lookout'), look: { hat: 'hat.sun', hatTint: 'coral', lower: opt('lower.skirt') } });
    },
  );
}

export function sweeperPigeons(k: Kit, x: number, z: number): void {
  k.vignette(
    {
      id: 'sweeper-pigeons',
      title: 'Crumbs, again',
      story: 'An old man on a bench scatters crumbs for a flock of pigeons faster than the street sweeper beside him can brush them away.',
    },
    () => {
      k.prop('bench.park', { x, z, rot: 0 }, { walkThrough: true });
      k.seated('bench.park', { x, z, rot: 0 }, { place: false, fill: 1, age: 'elder', clips: [clip('sit.eat', 'sit')] });
      k.prop('animal.pigeon.flock', { x: x + 0.1, z: z + 1.3, rot: 0.3 });
      k.prop('animal.pigeon.peck', { x: x - 0.9, z: z + 1.0, rot: -0.6 });
      const sw = k.person({ x: x + 1.9, z: z + 1.0, face: [x + 0.2, z + 1.3], clip: clip('clean.sweep', 'stand.stick'), hold: ['hold.stick'], look: { hat: 'hat.cap', hatTint: 'butter', shirt: 'butter', pattern: 0 } });
      k.searchable(sw, 'the exasperated sweeper');
      k.person({ x: x - 1.5, z: z + 2.1, face: [x, z + 1.3], age: 'child', clip: clip('kid.crouch', 'point.down', 'point') });
    },
  );
}
