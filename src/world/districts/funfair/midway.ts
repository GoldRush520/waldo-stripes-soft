/**
 * Static fairground: ground tones, the big top with its snaking entrance queue, attraction facades,
 * the games row (booths open toward +z with vendors and players), treat carts, arches, bunting,
 * lamps, trees and benches.
 */
import type { Kit } from '../../kit';
import { CLOTHS, treeGeo } from '../shared';
import { AVENUE, BIGTOP, BIGTOP_DOOR, BOOTHS, BOOTH_Z, CARTS, FUNHOUSE, GROUND, PLAZA, ring } from './plan';

const FAIR_CLIPS = ['stand', 'talk', 'point', 'talk.laugh', 'cheer.clap', 'idle.watch', 'lookout'] as const;

export function ground(k: Kit): void {
  k.ground(GROUND, 'sageLight');
  k.ground([[AVENUE.x0, AVENUE.z0], [AVENUE.x1, AVENUE.z0], [AVENUE.x1, AVENUE.z1], [AVENUE.x0, AVENUE.z1]], 'butterLight', 0.03, 0.02);
  k.ground([[-33, -7.2], [-13, -7.2], [-13, AVENUE.z0], [-33, AVENUE.z0]], 'clayLight', 0.03, 0.02);
  k.ground(ring(PLAZA.x, PLAZA.z, PLAZA.r + 1.2, 24), 'clayLight', 0.05, 0.02);
  k.ground(ring(PLAZA.x, PLAZA.z, PLAZA.r * 0.55, 18), 'butterLight', 0.07, 0.02);
  k.ground([[-12, -16], [36, -16], [36, -7], [-12, -7]], 'butterLight', 0.03, 0.02);
}

/** One snaking lane of the big-top queue (people face along `dir`). */
function lane(k: Kit, z: number, x0: number, x1: number, dir: 1 | -1): void {
  const n = Math.floor(Math.abs(x1 - x0) / 0.74);
  for (let i = 0; i < n; i++) {
    k.person({
      x: x0 + (x1 - x0) * (i / Math.max(1, n - 1)) + k.rng.range(-0.06, 0.06),
      z: z + k.rng.range(-0.1, 0.1),
      heading: (dir * Math.PI) / 2 + k.rng.range(-0.35, 0.35),
      clip: k.rng.pick(['stand', 'talk', 'idle.shift', 'idle.tap', 'talk.laugh', 'lookout', 'idle.phone']),
      age: k.rng.chance(0.22) ? 'child' : k.rng.chance(0.1) ? 'elder' : 'adult',
      hold: k.rng.chance(0.15) ? [{ key: 'hold.balloon', tint: k.rng.pick(CLOTHS) }] : undefined,
    });
  }
}

export const BIGTOP_RAILS: readonly number[] = [-5.2, -3.9, -2.6];

export function bigTop(k: Kit): void {
  k.prop('tent.bigtop', BIGTOP);
  for (const z of BIGTOP_RAILS) k.prop('fair.queuerail.8', { x: BIGTOP.x, z });
  k.person({ x: BIGTOP_DOOR.x, z: BIGTOP_DOOR.z + 0.6, heading: Math.PI, clip: 'vend.coins' });
  lane(k, -6.05, BIGTOP_DOOR.x + 0.75, -18.9, -1);
  lane(k, -4.55, -26.6, -19.4, 1);
  lane(k, -3.25, -19.4, -24.6, -1);
  lane(k, -1.95, -24.6, -19.4, 1);
  k.prop('booth.ticket', { x: -16.2, z: -3.6 });
  k.person({ x: -16.2, z: -2.2, heading: Math.PI, clip: 'vend.coins', hold: [{ key: 'hold.bag', tint: 'coral' }] });
  k.person({ x: -15.5, z: -1.6, heading: Math.PI + 0.4, clip: 'idle.watch', age: 'child' });
}

/** Facades whose body sits behind their origin: walk-through prop + a block of the real body. */
function facade(k: Kit, key: string, at: { x: number; z: number }, w: number, d: number): void {
  k.prop(key, at, { walkThrough: true });
  k.block(at.x, at.z - d / 2, w, d);
}

export function attractions(k: Kit): void {
  facade(k, 'fair.funhouse', FUNHOUSE, 8.2, 4.7);
  k.block(FUNHOUSE.x, FUNHOUSE.z + 1.2, 2.0, 2.4);
  k.queue([FUNHOUSE.x - 5.4, FUNHOUSE.z + 3.4], [FUNHOUSE.x - 1.3, FUNHOUSE.z + 2.7], 6, { clips: ['stand', 'talk.laugh', 'point', 'cheer'] });
  for (const [x, z] of [[19.5, -13.2], [34.6, -25.3], [-35, -24.6]] as const) k.prop('tent.round', { x, z }, {});
}

function boothPeople(k: Kit, b: (typeof BOOTHS)[number]): void {
  const front = BOOTH_Z + b.d / 2;
  k.person({ x: b.x + k.rng.range(-0.4, 0.4), z: front - 0.75, heading: 0, clip: k.rng.pick(['vend.hawk', 'vend.handover', 'talk', 'vend.coins']), hold: ['upper.apron'], look: { hat: k.rng.pick(['hat.boater', 'hat.top', 'hat.cap']), hatTint: k.rng.pick(CLOTHS) } });
  const n = Math.max(3, Math.floor(b.w / 0.7));
  for (let i = 0; i < n; i++) {
    const x = b.x - b.w / 2 + 0.35 + (i * (b.w - 0.7)) / Math.max(1, n - 1);
    k.person({ x, z: front + 0.48 + k.rng.range(0, 0.1), heading: Math.PI + k.rng.range(-0.25, 0.25), clip: k.rng.pick(['point', 'stand', 'cheer', 'talk', 'point.down']), age: k.rng.chance(0.3) ? 'child' : 'adult' });
    if (k.rng.chance(0.75)) k.person({ x: x + 0.3, z: front + 1.25 + k.rng.range(0, 0.15), heading: Math.PI + k.rng.range(-0.4, 0.4), clip: k.rng.pick(FAIR_CLIPS) });
  }
}

export function gamesRow(k: Kit): void {
  for (const b of BOOTHS) {
    k.prop(b.key, { x: b.x, z: BOOTH_Z }, { walkThrough: true });
    k.block(b.x, BOOTH_Z + b.d / 2 - 0.22, b.w, 0.45);
    k.block(b.x, BOOTH_Z - 0.525, b.w, b.d - 1.05);
    if (b.key !== 'game.coconutshy') boothPeople(k, b);
  }
}

export function carts(k: Kit): void {
  CARTS.forEach((c, i) => {
    k.prop(c.key, { x: c.x, z: c.z, rot: c.rot });
    if (c.key === 'cart.cottoncandy') return;
    k.person({ x: c.x + 0.2, z: c.z - 0.95, heading: 0, clip: k.rng.pick(['vend.handover', 'vend.hawk', 'serve.order']), hold: ['upper.apron'], look: { hat: 'hat.boater', hatTint: CLOTHS[i] } });
    for (let j = 0; j < 4; j++) {
      k.person({ x: c.x - 0.75 + j * 0.5, z: c.z + 0.95 + (j % 2) * 0.35, heading: Math.PI + k.rng.range(-0.3, 0.3), clip: k.rng.pick(['point', 'eat.icecream', 'stand', 'vend.coins', 'talk']), age: j % 2 ? 'child' : 'adult' });
    }
  });
}

export function dressing(k: Kit): void {
  for (const x of [-33.5, 34]) {
    k.prop('fair.festoonarch', { x, z: AVENUE.mid, rot: Math.PI / 2 }, { walkThrough: true });
    k.block(x, AVENUE.mid - 3, 0.5, 0.5);
    k.block(x, AVENUE.mid + 3, 0.5, 0.5);
  }
  for (const x of [-26, -16, 13.5, 26]) k.prop('bunting.poles.10m', { x, z: AVENUE.z1 - 0.1 });
  for (const x of [-12.5, 9.5, 29.5]) k.prop('bunting.poles.10m', { x, z: AVENUE.z0 + 0.1 });
  k.prop('lights.string.poles', { x: PLAZA.x, z: PLAZA.z - 0.5, rot: 0.5 });
  for (const x of [-29, -19.5, 0, 11, 24, 31]) k.prop('lamp.classic', { x, z: AVENUE.z1 - 0.15 });
  for (const [x, z] of [[-36, 25.5], [-24, 26], [-14.5, 26.2], [34, 26], [37, 14], [37, 1.5], [-36.2, -12.5]] as const) {
    k.add(treeGeo('lollipop', Math.abs(Math.round(x)) % 3), { x, z, tint: 'sage' });
    k.block(x, z, 0.6, 0.6);
  }
  for (const [x, z] of [[-6, 27], [8, 27], [-36.5, 0]] as const) {
    k.prop('flag.pole.pennant', { x, z });
  }
}

/** Park benches along the plaza edge with sitters (backrest blocked, seats left free). */
export function benches(k: Kit): void {
  const spots = [
    { x: PLAZA.x - 3.8, z: PLAZA.z + 5.6, rot: Math.PI },
    { x: PLAZA.x + 3.6, z: PLAZA.z + 5.5, rot: Math.PI },
    { x: 31, z: 12.5, rot: -Math.PI / 2 },
  ];
  for (const s of spots) {
    k.prop('bench.park', s, { walkThrough: true });
    const back = k.rel(s, 0, -0.24);
    k.block(back.x, back.z, 1.6, 0.1, s.rot);
    k.seated('bench.park', s, { place: false, fill: 0.9, clips: ['sit', 'sit.eat', 'sit.talk', 'sit.read'] });
  }
}
