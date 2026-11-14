/**
 * The bakery: brick bake-house chimney (district landmark), outdoor oven and flour sacks in the
 * yard, bread racks on the pavement, a queue out of the door, the last-croissant stand-off and the
 * runaway bread cart circling the C1 block with the baker in pursuit.
 */
import type { Kit } from '../../kit';
import { BAKER_HAT, clip, gait, opts } from './catalog';
import { croissant } from './geos';
import { BAKE_YARD, CART_LOOP, CHIMNEY, EDGE_ROT, edge } from './plan';
import { type PlacedHouse, frontOf } from './terraces';

const R = EDGE_ROT;

function bakerLook(): { hat: string | null; hatTint: 'ivory'; shirt: 'ivory'; pattern: 0; pants: 'ivoryShade' } {
  return { hat: BAKER_HAT, hatTint: 'ivory', shirt: 'ivory', pattern: 0, pants: 'ivoryShade' };
}

function yard(k: Kit): void {
  k.prop('chimney.bakery', CHIMNEY);
  k.prop('oven.outdoor', BAKE_YARD);
  const sacks = k.rel(BAKE_YARD, -1.9, -0.6, 0);
  k.prop('sack.pile', { x: sacks.x, z: sacks.z, rot: R + 0.3 });
  const flour = k.rel(BAKE_YARD, 1.8, -0.4, 0);
  k.prop('sack.tied', { x: flour.x, z: flour.z, rot: R - 0.4 });
  const baker = k.rel(BAKE_YARD, 0.2, 1.15, Math.PI);
  k.person({ ...baker, clip: clip('vend.arrange', 'point'), hold: opts('upper.apron'), look: bakerLook() });
  const boy = k.rel(BAKE_YARD, -1.3, 1.6, Math.PI + 0.5);
  k.person({ ...boy, age: 'child', clip: clip('carry.stack', 'carry'), hold: opts('upper.apron') });
}

function shopfront(k: Kit, bakery: PlacedHouse): void {
  for (const along of [-2.4, 2.3]) {
    const p = frontOf(k, bakery, 0.55, along);
    k.prop('bakery.rack.loaves', { x: p.x, z: p.z, rot: R });
  }
  const basket = frontOf(k, bakery, 0.5, -3.3);
  k.prop('bakery.basket.baguettes', { x: basket.x, z: basket.z });
  const pretzels = frontOf(k, bakery, 0.7, 3.4);
  k.prop('bakery.rack.pretzels', { x: pretzels.x, z: pretzels.z });
  const board = frontOf(k, bakery, 1.9, -1.4);
  k.prop('sign.chalk.aframe', { x: board.x, z: board.z, rot: R + 0.4 });
  const parked = edge(5.5, -12.4);
  k.prop('cart.bread', { x: parked.x, z: parked.z, rot: R + Math.PI / 2 });
}

/** A queue that spills out of the bakery door into the piazza. */
function queue(k: Kit, bakery: PlacedHouse): void {
  const door = frontOf(k, bakery, 0.6, 0);
  const from = edge(1.2, -6.4);
  k.queue([from.x, from.z], [door.x, door.z], 7, {
    clips: [clip('queue.shuffle', 'stand'), clip('queue.impatient', 'lookout'), clip('idle.watch', 'stand'), 'talk', clip('idle.phone', 'stand')],
  });
}

function lastCroissant(k: Kit, bakery: PlacedHouse): void {
  k.vignette(
    {
      id: 'last-croissant',
      title: 'The last croissant',
      story: 'Two customers point at the very last croissant on the tray at the same moment and glare at each other while the baker shrugs.',
    },
    () => {
      const t = frontOf(k, bakery, 1.6, -3.0);
      k.prop('cafe.table.square', { x: t.x, z: t.z, rot: R });
      k.prop('bakery.tray.croissants', { x: t.x, z: t.z, y: 0.75, rot: R });
      const baker = frontOf(k, bakery, 0.85, -3.0);
      k.person({ x: baker.x, z: baker.z, face: [t.x, t.z + 2], clip: clip('talk.shrug', 'talk'), hold: opts('upper.apron'), look: bakerLook() });
      const a = k.rel({ x: t.x, z: t.z, rot: R }, -0.85, 0.75, 0);
      const b = k.rel({ x: t.x, z: t.z, rot: R }, 0.85, 0.75, 0);
      const ia = k.person({ x: a.x, z: a.z, face: [t.x, t.z], clip: clip('point.down', 'point'), look: { hat: 'hat.boater', hatTint: 'coral' } });
      k.person({ x: b.x, z: b.z, face: [t.x, t.z], clip: clip('point.down', 'point'), age: 'elder', hold: [{ key: 'hold.bag', tint: 'sage' }] });
      const kid = k.rel({ x: t.x, z: t.z, rot: R }, 0, 1.55, Math.PI);
      k.person({ ...kid, age: 'child', clip: clip('queue.tiptoe', 'lookout') });
      k.searchable(ia, 'the croissant rival in the boater');
    },
  );
}

function runawayCart(k: Kit): void {
  k.vignette(
    {
      id: 'runaway-bread-cart',
      title: 'The runaway bread cart',
      story: 'A loaded bread cart has escaped down the lane, shedding loaves, with the flour-dusted baker sprinting after it round the block.',
    },
    () => {
      const route = k.loop(CART_LOOP);
      const speed = 1.55;
      const cart = k.onRoute(route, 6, speed);
      k.dynamic('cart.bread.runaway', cart, { rot: -Math.PI / 2 });
      const chase = gait(speed, 'comedy.chase', 'walk.run', 'walk');
      const run = k.onRoute(route, 3.4, speed);
      const baker = k.person({ x: 0, z: 0, motion: run, clip: chase.clip, speed: chase.speed, hold: opts('upper.apron'), look: bakerLook() });
      k.searchable(baker, 'the baker chasing his cart');
      /* bystanders at the north-west corner of the loop */
      k.person({ x: -17.2, z: -7.9, face: [-14.4, -6.6], clip: clip('point.across', 'point'), hold: [{ key: 'hold.bag', tint: 'coral' }] });
      k.person({ x: -18.1, z: -8.6, face: [-14.4, -6.6], clip: clip('comedy.startle', 'cheer') });
      k.person({ x: -12.6, z: -3.2, face: [-14.4, -6.6], age: 'child', clip: clip('cheer.jump', 'cheer') });
      const toss = k.toss([-12.9, 0.2, -1.6], 0.4, 0.7, 0, 0.5, 1.4);
      k.dynamic(croissant(), toss);
      k.prop('basket.wicker.bread', { x: -12.5, z: -0.9, rot: 0.6 });
    },
  );
}

export function buildBakery(k: Kit, bakery: PlacedHouse): void {
  yard(k);
  shopfront(k, bakery);
  queue(k, bakery);
  lastCroissant(k, bakery);
  runawayCart(k);
}
