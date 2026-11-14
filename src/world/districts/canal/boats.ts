/**
 * Boats and water birds. The low bridges (rope, covered, closed drawbridge) leave no headroom, so
 * every moving boat loops inside its own "pool" between two bridges: up the east lane, a U-turn,
 * back down the west lane, always inside the 10 m channel at the waterline (y = WATER_Y).
 */
import type { Vec3 } from '../../../crowd/stores';
import type { Kit, PersonSpec } from '../../kit';
import { WATER_Y } from '../../layout';
import { CLOTHS } from '../shared';
import type { BridgeSite } from './bridges';
import type { Opening } from './banks';
import { alongHeading, at } from './frame';
import { clip, opt } from './catalog';
import type { Zone } from './spots';

/** A stretch of open water between two bridges (arc lengths). */
export interface Pool {
  readonly a: number;
  readonly b: number;
}

export function pools(sites: readonly BridgeSite[], south: number, north: number): Pool[] {
  const edges = [south, ...sites.map((b) => b.s), north];
  return edges.slice(0, -1).map((a, i) => ({ a, b: edges[i + 1] ?? a }));
}

/** Closed loop inside a pool, `lane` metres either side of the centreline, `margin` clear of bridges. */
export function poolLoop(k: Kit, p: Pool, margin: number, lane = 1.9): Vec3[] {
  const a = p.a + margin;
  const b = p.b - margin;
  const mid = (a + b) / 2;
  const pt = (s: number, d: number): Vec3 => {
    const q = at(k, s, d);
    return [q.x, WATER_Y, q.z];
  };
  return [pt(a, lane), pt(mid, lane + 0.2), pt(b, lane), pt(b + 1.2, 0), pt(b, -lane), pt(mid, -lane - 0.2), pt(a, -lane), pt(a - 1.2, 0)];
}

/** A person riding a motion frame (boat), coordinates in the boat's own space. */
export function rider(k: Kit, motion: number, spec: Omit<PersonSpec, 'motion'>): number {
  return k.person({ ...spec, motion, blob: 0 });
}

const HIP = 0.47;

function rowboat(k: Kit, motion: number, crew: number): number[] {
  const ids = [rider(k, motion, { x: 0, y: 0.16 - HIP, z: 0.05, heading: Math.PI, clip: clip('row.pull', 'sit'), look: { hat: opt('hat.boater', 'hat.cap'), hatTint: 'butter' } })];
  if (crew > 1) ids.push(rider(k, motion, { x: 0, y: 0.16 - HIP, z: -1.0, heading: 0, clip: clip('sit.talk', 'sit'), hold: k.rng.chance(0.4) ? [{ key: 'hold.umbrella', tint: k.rng.pick(CLOTHS) }] : [] }));
  if (crew > 2) ids.push(rider(k, motion, { x: 0, y: 0.16 - HIP, z: 0.85, heading: Math.PI, clip: clip('sit.crossed', 'sit'), age: 'child' }));
  return ids;
}

/** Gondola with a standing gondolier at the stern and up to two seated passengers. */
export function gondolaCrew(k: Kit, motion: number, gondolierClip: string, passengers: number): number[] {
  const ids = [
    rider(k, motion, {
      x: 0.15,
      y: 0.3,
      z: -2.65,
      heading: 0,
      clip: gondolierClip,
      look: { pattern: 1, shirt: 'blueDeep', shirt2: 'ivory', hat: opt('hat.boater'), hatTint: 'coral', pants: 'ink', longLegs: true },
    }),
  ];
  for (let i = 0; i < passengers; i++) {
    ids.push(rider(k, motion, { x: i ? 0.22 : -0.22, y: 0.18 - HIP, z: -0.35, heading: 0, clip: clip(i ? 'sit.talk' : 'sit', 'sit') }));
  }
  return ids;
}

function paddlers(k: Kit, m: number, key: 'boat.canoe' | 'boat.swan' | 'boat.pedalo', tint: 'sage' | 'butter' | 'coral'): void {
  k.dynamic(key, m, { tint });
  const seats = key === 'boat.canoe' ? [[0, 0.12, 1.55], [0, 0.12, -1.7]] : key === 'boat.swan' ? [[-0.3, 0.25, -0.1], [0.3, 0.25, -0.1]] : [[-0.28, 0.53, -0.3], [0.28, 0.53, -0.3]];
  seats.forEach(([x, y, z], i) => {
    rider(k, m, { x: x ?? 0, y: (y ?? 0) - HIP, z: z ?? 0, heading: 0, clip: key === 'boat.canoe' ? clip('kayak.paddle', 'sit') : clip(i ? 'sit.talk' : 'sit', 'sit'), age: i && key !== 'boat.canoe' ? 'child' : 'adult' });
  });
}

function movingBoats(k: Kit, ps: readonly Pool[]): void {
  const [, p1, p2, p3, p4, p5] = ps;
  if (p1) {
    const loop = k.loop(poolLoop(k, p1, 5));
    [0, 0.5].forEach((f, i) => {
      const m = k.onRoute(loop, f * loop.length, 0.85, { bob: 0.04 });
      k.dynamic('boat.row', m, { tint: i ? 'sage' : 'coral' });
      rowboat(k, m, i ? 2 : 3);
    });
    const kayak = k.onRoute(loop, 0.25 * loop.length, 0.85, { bob: 0.03 });
    k.dynamic('boat.kayak', kayak, { tint: 'butter' });
    rider(k, kayak, { x: 0, y: -0.03 - HIP, z: -0.1, heading: 0, clip: clip('kayak.paddle', 'sit'), look: { hat: opt('hat.cap'), hatTint: 'coral' } });
  }
  if (p2) {
    const loop = k.loop(poolLoop(k, p2, 5.6, 1.6));
    [0, 0.5].forEach((f, i) => {
      const m = k.onRoute(loop, f * loop.length, 0.75, { bob: 0.03 });
      k.dynamic('boat.gondola', m, { tint: i ? 'blueDeep' : 'ink' });
      gondolaCrew(k, m, clip('gondola.oar', 'gondola.punt', 'stand'), 2 - i);
    });
  }
  if (p3) {
    const loop = k.loop(poolLoop(k, { a: p3.a, b: p3.a + 13 }, 4.2, 1.7));
    [0, 0.5].forEach((f, i) => paddlers(k, k.onRoute(loop, f * loop.length, 0.7, { bob: 0.03 }), i ? 'boat.pedalo' : 'boat.swan', i ? 'coral' : 'butter'));
  }
  if (p4) {
    const loop = k.loop(poolLoop(k, p4, 4.4, 1.7));
    [0, 0.5].forEach((f, i) => paddlers(k, k.onRoute(loop, (0.3 + f) * loop.length, 0.8, { bob: 0.03 }), i ? 'boat.swan' : 'boat.canoe', i ? 'butter' : 'sage'));
  }
  if (p5) {
    const loop = k.loop(poolLoop(k, p5, 3.2, 1.2));
    const m = k.onRoute(loop, 0, 0.7, { bob: 0.03 });
    k.dynamic('boat.kayak', m, { tint: 'coral' });
    rider(k, m, { x: 0, y: -0.03 - HIP, z: -0.1, heading: 0, clip: clip('kayak.paddle', 'sit'), look: { hat: opt('hat.sun'), hatTint: 'blue' } });
  }
}

/** Boats tied up alongside the step flights (on the side away from the nearest bridge), bobbing. */
function moored(k: Kit, flights: readonly Opening[], sites: readonly BridgeSite[]): Zone[] {
  return flights.map((f, i) => {
    const nearest = sites.reduce((best, b) => (Math.abs(b.s - f.s) < Math.abs(best - f.s) ? b.s : best), Infinity);
    const s = f.s + (nearest < f.s ? 2.6 : -2.6);
    const p = at(k, s, f.side * 3.95);
    const key = i % 3 === 1 ? 'boat.dinghy' : 'boat.row';
    const m = k.bob([p.x, WATER_Y, p.z], alongHeading(s, i % 2 === 0), 0.8 + i * 0.07, i * 0.9, 0.04, 0.03);
    k.dynamic(key, m, { tint: CLOTHS[(i * 2) % CLOTHS.length] });
    if (key === 'boat.row') {
      rider(k, m, { x: 0, y: 0.16 - HIP, z: -1.0, heading: 0, clip: clip('sit.read', 'sit.eat', 'sit') });
      rider(k, m, { x: 0, y: 0.16 - HIP, z: 0.85, heading: Math.PI, clip: clip('sit.talk', 'sit') });
    } else {
      rider(k, m, { x: 0, y: 0.15 - HIP, z: -0.8, heading: 0, clip: clip('fish.sit', 'sit') });
    }
    return { s0: Math.min(f.s, s) - 2.2, s1: Math.max(f.s, s) + 2.2, d0: f.side * 2.9, d1: f.side * 5 };
  });
}

/** The water taxi waits at the southern quay while passengers settle in. */
function taxi(k: Kit, s: number): Zone {
  const p = at(k, s, -2.6);
  const m = k.bob([p.x, WATER_Y, p.z], alongHeading(s, true), 0.7, 0.4, 0.035, 0.02);
  k.dynamic('boat.taxi', m, { tint: 'butter' });
  k.seated('boat.taxi', { x: 0, z: 0 }, { motion: m, place: false, fill: 1, clips: [clip('sit.talk', 'sit'), 'sit', clip('sit.eat', 'sit')] });
  return { s0: s - 3.6, s1: s + 3.6, d0: -1.4, d1: -5 };
}

/** Moving boats, moored boats and the taxi. Returns the pools and the water they claim. */
export function buildBoats(k: Kit, sites: readonly BridgeSite[], flights: readonly Opening[], south: number, north: number): { pools: Pool[]; claimed: Zone[] } {
  const ps = pools(sites, south, north);
  movingBoats(k, ps);
  const claimed = [...moored(k, flights, sites), taxi(k, (ps[0]?.a ?? south) + 4.2)];
  return { pools: ps, claimed };
}
