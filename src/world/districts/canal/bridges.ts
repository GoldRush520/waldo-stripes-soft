/**
 * The five canal bridges. Each one is centred on the canal centreline, rotated so its span (prop
 * +x) runs straight across the water, registered as a walkable 'bridge' surface at its mid height,
 * and crossed by a small stream of walkers whose route follows the deck profile.
 */
import { civicMeta } from '../../../props/civic/index';
import { type DeckPoint, deckY } from '../../../props/civic/util';
import type { Vec3 } from '../../../crowd/stores';
import type { Kit, PersonSpec } from '../../kit';
import { CLOTHS } from '../shared';
import { type CanalFrame, at, frameAt, sAtZ } from './frame';

export type BridgeId = 'rope' | 'stone' | 'covered' | 'draw' | 'iron';

export interface BridgeSite {
  readonly id: BridgeId;
  readonly key: string;
  /** arc length of the bridge centre along the canal */
  readonly s: number;
  readonly frame: CanalFrame;
  /** placement in district-local metres (rot maps prop +x onto the east normal) */
  readonly at: { readonly x: number; readonly z: number; readonly rot: number };
  readonly deck: readonly DeckPoint[];
  readonly length: number;
  readonly width: number;
  /** half-length of the non-walkable middle (raised leaves), 0 when the deck is continuous */
  readonly gapHalf: number;
}

const SPECS: ReadonlyArray<{ id: BridgeId; key: 'bridge.rope' | 'bridge.stone' | 'bridge.covered' | 'bridge.draw.raised' | 'bridge.iron'; z: number }> = [
  { id: 'rope', key: 'bridge.rope', z: 29.5 },
  { id: 'stone', key: 'bridge.stone', z: 13 },
  { id: 'covered', key: 'bridge.covered', z: -6.5 },
  { id: 'draw', key: 'bridge.draw.raised', z: -31 },
  { id: 'iron', key: 'bridge.iron', z: -46 },
];

export function bridgeSites(k: Kit): BridgeSite[] {
  return SPECS.map((spec) => {
    const s = sAtZ(spec.z);
    const frame = frameAt(s);
    const meta = civicMeta(spec.key);
    const c = at(k, s, 0);
    const gap = meta.gap;
    return {
      id: spec.id,
      key: spec.key,
      s,
      frame,
      at: { x: c.x, z: c.z, rot: frame.rot },
      deck: meta.deck,
      length: meta.length,
      width: meta.width,
      gapHalf: gap ? (gap[1] - gap[0]) * meta.length * 0.5 : 0,
    };
  });
}

export function site(sites: readonly BridgeSite[], id: BridgeId): BridgeSite {
  const found = sites.find((b) => b.id === id);
  if (!found) throw new Error(`canal: missing bridge ${id}`);
  return found;
}

/** Walking-surface height at u metres along the span (u = 0 mid-canal, + = east). */
export function deckAt(b: BridgeSite, u: number): number {
  return deckY(b.deck, Math.min(1, Math.max(0, u / b.length + 0.5)));
}

/** Local point + heading at (u along span, v across the deck) of a bridge. */
export function onBridge(k: Kit, b: BridgeSite, u: number, v: number, heading = 0): { x: number; z: number; y: number; heading: number } {
  const p = k.rel(b.at, u, v, heading);
  return { ...p, y: deckAt(b, u) };
}

/** A person standing on a bridge deck. */
export function deckPerson(k: Kit, b: BridgeSite, u: number, v: number, spec: Omit<PersonSpec, 'x' | 'z' | 'y'> & { heading?: number }): number {
  const p = onBridge(k, b, u, v, spec.heading ?? 0);
  return k.person({ ...spec, x: p.x, z: p.z, y: p.y, heading: p.heading });
}

function rect(k: Kit, b: BridgeSite, u0: number, u1: number): [number, number][] {
  const hw = b.width / 2;
  return [
    [u0, -hw],
    [u1, -hw],
    [u1, hw],
    [u0, hw],
  ].map(([u, v]) => {
    const p = k.rel(b.at, u ?? 0, v ?? 0);
    return [p.x, p.z] as [number, number];
  });
}

function registerDeck(k: Kit, b: BridgeSite): void {
  const half = b.length / 2;
  if (b.gapHalf > 0) {
    const y = deckAt(b, -(half + b.gapHalf) / 2);
    k.surface('bridge', rect(k, b, -half, -b.gapHalf), y);
    k.surface('bridge', rect(k, b, b.gapHalf, half), y);
    return;
  }
  k.surface('bridge', rect(k, b, -half, half), deckAt(b, 0));
}

/** There-and-back route across the deck from bank to bank, following the deck profile. */
function crossingPath(k: Kit, b: BridgeSite): Vec3[] {
  const half = b.length / 2;
  const pts: Vec3[] = [];
  const n = 10;
  const p0 = k.rel(b.at, -half - 2.6, 0);
  pts.push([p0.x, 0, p0.z]);
  for (let i = 0; i <= n; i++) {
    const u = -half + (b.length * i) / n;
    const p = k.rel(b.at, u, 0);
    pts.push([p.x, deckAt(b, u), p.z]);
  }
  const p1 = k.rel(b.at, half + 2.6, 0);
  pts.push([p1.x, 0, p1.z]);
  return pts;
}

const CROSSERS: Readonly<Record<BridgeId, { count: number; lane: number }>> = {
  rope: { count: 0, lane: 0 },
  stone: { count: 9, lane: 0.5 },
  covered: { count: 7, lane: 0.45 },
  draw: { count: 0, lane: 0 },
  iron: { count: 0, lane: 0 },
};

export function placeBridges(k: Kit, sites: readonly BridgeSite[]): void {
  for (const b of sites) {
    k.prop(b.key, b.at);
    registerDeck(k, b);
    const cross = CROSSERS[b.id];
    if (cross.count > 0) {
      k.walkers(crossingPath(k, b), cross.count, {
        lanes: [cross.lane],
        speed: [0.8, 1.25],
        childShare: 0.15,
        hold: (rng) => (rng.chance(0.3) ? [{ key: 'hold.bag', tint: rng.pick(CLOTHS) }] : rng.chance(0.1) ? [{ key: 'hold.balloon', tint: rng.pick(CLOTHS) }] : undefined),
      });
    }
  }
}
