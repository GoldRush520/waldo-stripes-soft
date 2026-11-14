/**
 * Bank edges: stone quay walls with coping and mooring rings, flights of steps down to the water,
 * iron railings (opened at steps, bridge heads and angling spots), lamps, bollards, life rings,
 * promenade paving, trees, benches and festival bunting strung across the water.
 */
import type { Geo } from '../../../core/geo';
import { quayWall } from '../../../props/civic/index';
import type { Kit } from '../../kit';
import { treeGeo } from '../shared';
import type { BridgeSite } from './bridges';
import { S_NORTH, VERTEX_S, at, bank, edgeAt, faceWater, frameAt, sStart, strip } from './frame';

export type Side = -1 | 1;

/** A gap in the railing: a bank side, the arc length of its centre and its half-length. */
export interface Opening {
  readonly side: Side;
  readonly s: number;
  readonly half: number;
}

/** Where to cut a flight of steps into the quay (side + approximate arc length). */
export const STEP_WISH: readonly { side: Side; s: number }[] = [
  { side: 1, s: 24 },
  { side: -1, s: 45 },
  { side: 1, s: 67 },
  { side: -1, s: 86 },
];

const walls = new Map<string, Geo>();

function wallGeo(len: number, steps: boolean): Geo {
  const key = `${len.toFixed(2)}:${steps ? 1 : 0}`;
  let g = walls.get(key);
  if (!g) {
    g = quayWall(len, { steps, color: 'clay', coping: 'ivory' });
    walls.set(key, g);
  }
  return g;
}

/** Bridge head clearance along the bank (railings, lamps and benches keep out). */
export function bridgeHalf(b: BridgeSite): number {
  return b.width / 2 + (b.id === 'covered' || b.id === 'draw' ? 1.6 : 1.1);
}

const nearBridge = (sites: readonly BridgeSite[], s: number, pad = 0): boolean => sites.some((b) => Math.abs(s - b.s) < bridgeHalf(b) + pad);

/** Lay the quay wall pieces of both banks; returns the arc lengths of the step flights. */
function quays(k: Kit): Opening[] {
  const flights: Opening[] = [];
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < VERTEX_S.length - 1; i++) {
      const a = Math.max(sStart(side), VERTEX_S[i] ?? 0);
      const b = Math.min(S_NORTH, VERTEX_S[i + 1] ?? 0);
      if (b - a < 1) continue;
      const n = Math.max(1, Math.round((b - a) / 8));
      const len = (b - a) / n;
      for (let j = 0; j < n; j++) {
        const sc = a + (j + 0.5) * len;
        const steps = STEP_WISH.some((w) => w.side === side && Math.abs(w.s - sc) < len / 2);
        const p = bank(k, sc, side, 0.74);
        k.add(wallGeo(len, steps), { x: p.x, z: p.z, rot: faceWater(sc, side) });
        if (steps) flights.push({ side, s: sc - side * (len / 2 - 1.6), half: 1.5 });
      }
    }
  }
  return flights;
}

function paving(k: Kit): void {
  for (const side of [-1, 1] as const) {
    const s0 = sStart(side);
    k.ground(strip(k, s0, S_NORTH, (s) => side * (edgeAt(s, side) + 0.68), side * 11.2, 3), 'clayLight');
    k.ground(strip(k, s0, S_NORTH, side * 10.1, side * 11.1, 3), 'ivory', 0.03, 0.02);
  }
}

function railings(k: Kit, sites: readonly BridgeSite[], openings: readonly Opening[]): void {
  for (const side of [-1, 1] as const) {
    for (let s = sStart(side) + 2.2; s < S_NORTH - 2; s += 4.15) {
      const blocked = nearBridge(sites, s, 2) || openings.some((o) => o.side === side && Math.abs(o.s - s) < o.half + 2.05);
      if (blocked) continue;
      const p = bank(k, s, side, 0.42);
      k.prop('rail.iron4', { x: p.x, z: p.z, rot: faceWater(s, side) });
    }
  }
}

function lampsAndFixtures(k: Kit, sites: readonly BridgeSite[], openings: readonly Opening[]): void {
  let i = 0;
  for (const side of [-1, 1] as const) {
    for (let s = sStart(side) + (side < 0 ? 4 : 6); s < S_NORTH - 1; s += 13) {
      if (nearBridge(sites, s, 0.6) || openings.some((o) => o.side === side && Math.abs(o.s - s) < o.half + 0.6)) continue;
      const p = bank(k, s, side, 0.9);
      k.prop(i % 3 === 2 ? 'lamp.swan' : 'lamp.classic', { x: p.x, z: p.z, rot: faceWater(s, side) + Math.PI });
      const q = bank(k, s + 2.2, side, 0.9);
      if (i % 2 === 0) k.prop('harbour.lifeRingPost', { x: q.x, z: q.z, rot: faceWater(s, side) + Math.PI });
      i++;
    }
  }
  for (const o of openings) {
    for (const ds of [-o.half - 0.35, o.half + 0.35]) {
      const p = bank(k, o.s + ds, o.side, 0.8);
      k.prop('harbour.bollard', { x: p.x, z: p.z });
    }
  }
}

function greenery(k: Kit, sites: readonly BridgeSite[]): void {
  let i = 0;
  for (const side of [-1, 1] as const) {
    for (let s = sStart(side) + (side < 0 ? 7 : 2); s < S_NORTH - 2; s += 9.5) {
      if (nearBridge(sites, s, 1.4)) continue;
      const p = at(k, s, side * 8.9);
      const willow = (i + (side < 0 ? 1 : 0)) % 4 === 0;
      if (willow) k.prop('tree.willow', { x: p.x, z: p.z, rot: i * 1.3 });
      else k.add(treeGeo(i % 3 === 0 ? 'blossom' : 'lollipop', i % 4), { x: p.x, z: p.z, tint: i % 3 === 0 ? 'coralLight' : undefined });
      if (!willow) k.block(p.x, p.z, 0.6, 0.6);
      i++;
    }
  }
}

function bunting(k: Kit, sites: readonly BridgeSite[]): void {
  const pools = sites.slice(0, -1).map((b, idx) => (b.s + (sites[idx + 1]?.s ?? b.s)) / 2);
  pools.forEach((s, idx) => {
    const c = at(k, s, 0);
    k.prop('bunting.poles.10m', { x: c.x, z: c.z, rot: frameAt(s).rot, scale: 1.16, tint: idx % 2 ? 'blue' : 'coral' });
  });
}

/** Everything along the two bank edges. Returns the step flights (for moored boats). */
export function buildBanks(k: Kit, sites: readonly BridgeSite[], openings: readonly Opening[]): Opening[] {
  paving(k);
  const flights = quays(k);
  const all = [...openings, ...flights];
  railings(k, sites, all);
  lampsAndFixtures(k, sites, flights);
  greenery(k, sites);
  bunting(k, sites);
  return flights;
}
