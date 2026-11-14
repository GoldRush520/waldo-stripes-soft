/**
 * House rows: a continuous, flat-roofed street front at the back of every terrace (broken by stair
 * alleys and narrow passages) plus two low workshops on the ground strip. Every walkable roof
 * terrace is registered with `k.surface('roof', …)` and returned for the roof-life passes.
 */
import { house } from '../../../props/arch/house';
import type { HouseOpts, SignKind } from '../../../props/arch/types';
import type { Kit } from '../../kit';
import { CLOTHS, WALLS } from '../shared';
import { clip } from './cast';
import { LEVEL_Y, type P2, ROW_DEPTH, ROW_GAPS, SPAN_X, rowZ } from './plan';
import { runs } from './hill';

export interface Roof {
  readonly id: number;
  readonly level: 0 | 1 | 2 | 3;
  /** house centre (local) */
  readonly x: number;
  readonly z: number;
  /** walkable terrace floor height (world y) */
  readonly y: number;
  /** usable terrace size inside the parapet */
  readonly w: number;
  readonly d: number;
  /** top of the parapet coping (where a cat sits or a plank rests) */
  readonly parapetY: number;
  readonly garden: boolean;
  readonly floors: number;
  /** index in its row segment and the segment's length (for party walls / neighbours) */
  readonly row: number;
}

const FLOORS: Readonly<Record<1 | 2 | 3, readonly number[]>> = { 1: [1, 1, 2, 1, 1, 2], 2: [1, 2, 1, 1, 2], 3: [2, 3, 2, 3] };
const SIGNS: readonly SignKind[] = ['teacup', 'key', 'hat', 'boot', 'scissors', 'flower', 'book', 'wine'];

function widths(k: Kit, len: number): number[] {
  const n = Math.max(1, Math.round(len / 6.4));
  const raw = Array.from({ length: n }, () => k.rng.range(0.8, 1.2));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((r) => (r / sum) * len);
}

interface Slot {
  readonly level: 0 | 1 | 2 | 3;
  readonly x: number;
  readonly z: number;
  readonly w: number;
  readonly d: number;
  readonly floors: number;
  readonly first: boolean;
  readonly last: boolean;
  readonly row: number;
  /** a flat one-storey roof forced level with its neighbour across a story gap */
  readonly forced?: boolean;
}

/** Gaps whose two flanking houses must have level flat roofs (the cat plank and the teapot pass). */
export const PAIRED_GAPS: ReadonlyArray<{ readonly level: 1 | 2 | 3; readonly x0: number; readonly x1: number }> = [
  { level: 1, x0: -25.5, x1: -22.5 },
  { level: 2, x0: -7.5, x1: -4.5 },
];

function optsFor(k: Kit, s: Slot, i: number): HouseOpts {
  const shopFront = s.level === 0 || (s.level === 1 && i % 4 === 1);
  const flat = s.level === 0 || s.forced === true || k.rng.chance(0.9);
  return {
    w: s.w,
    d: s.d,
    floors: s.floors,
    wall: WALLS[(i * 3 + s.level) % WALLS.length],
    roof: flat ? 'flat' : k.rng.pick(['shed', 'gable'] as const),
    ridge: 'x',
    terrace: true,
    terraceGarden: flat && k.rng.chance(0.3),
    chimneys: k.rng.chance(0.45) ? 1 : 0,
    front: {
      door: true,
      shop: shopFront ? { awning: k.rng.pick(['straight', 'scalloped'] as const), sign: SIGNS[i % SIGNS.length] } : false,
      balconies: s.floors >= 2 && k.rng.chance(0.55) ? [s.floors - 1] : [],
      balconyFlowers: true,
      windowBoxes: k.rng.chance(0.7),
      shutters: k.rng.chance(0.6),
    },
    left: s.first ? { windows: 1 } : { party: true },
    right: s.last ? { windows: 1 } : { party: true },
    back: { simple: true, windows: Math.max(1, Math.floor(s.w / 3.2)) },
    tint: CLOTHS[(i + s.level) % CLOTHS.length],
    seed: 900 + s.level * 100 + i,
  };
}

function placeHouse(k: Kit, s: Slot, i: number): Roof | null {
  const opts = optsFor(k, s, i);
  const h = house(opts);
  const base = LEVEL_Y[s.level];
  k.add(h.geo, { x: s.x, z: s.z, y: base });
  k.block(s.x, s.z, s.w, s.d);
  for (const b of h.balconies) {
    if (!k.rng.chance(0.5)) continue;
    k.person({ x: s.x + b.x, z: s.z + b.z + 0.2, y: base + b.y, heading: b.heading, clip: k.rng.pick([clip('lookout'), clip('wave'), clip('idle.watch', 'stand'), clip('talk')]) });
  }
  if (!h.terrace) return null;
  const y = base + h.terrace.y;
  const { w, d } = h.terrace;
  k.surface('roof', [[s.x - w / 2, s.z - d / 2], [s.x + w / 2, s.z - d / 2], [s.x + w / 2, s.z + d / 2], [s.x - w / 2, s.z + d / 2]], y);
  return { id: i, level: s.level, x: s.x, z: s.z, y, w, d, parapetY: y + 0.91, garden: Boolean(opts.terraceGarden), floors: s.floors, row: s.row };
}

function terraceSlots(k: Kit, level: 1 | 2 | 3): Slot[] {
  const [x0, x1] = SPAN_X[level] ?? [0, 0];
  const gaps: readonly P2[] = ROW_GAPS[level];
  const z = rowZ(level);
  const d = ROW_DEPTH[level];
  const floors = FLOORS[level];
  const out: Slot[] = [];
  runs(x0 + 0.6, x1 - 0.6, gaps).forEach(([a, b], seg) => {
    const ws = widths(k, b - a);
    let x = a;
    ws.forEach((w, j) => {
      const forced = PAIRED_GAPS.some((g) => g.level === level && ((j === 0 && Math.abs(a - g.x1) < 0.01) || (j === ws.length - 1 && Math.abs(b - g.x0) < 0.01)));
      const fl = forced ? 1 : (floors[(out.length + seg) % floors.length] ?? 2);
      out.push({ level, x: x + w / 2, z, w: w - 0.04, d, floors: fl, first: j === 0, last: j === ws.length - 1, row: out.length, forced });
      x += w;
    });
  });
  return out;
}

/** Two low workshops at the west end of the ground strip, their roofs level with the first terrace. */
function groundSlots(): Slot[] {
  return [
    { level: 0, x: -34.6, z: 15.4, w: 6.6, d: 5.6, floors: 1, first: true, last: false, row: 0 },
    { level: 0, x: -28.2, z: 15.4, w: 6.2, d: 5.6, floors: 1, first: false, last: true, row: 1 },
  ];
}

export function buildHouses(k: Kit): Roof[] {
  const slots = [...groundSlots(), ...terraceSlots(k, 1), ...terraceSlots(k, 2), ...terraceSlots(k, 3)];
  const roofs: Roof[] = [];
  slots.forEach((s, i) => {
    const r = placeHouse(k, s, i);
    if (r) roofs.push(r);
  });
  return roofs;
}

/**
 * The roof on `level` closest to local x that is not yet taken; marks it taken. When that level has
 * no free roof left (a few seeds lose roofs to skipped houses) the nearest level is used instead,
 * and only if every roof is in use is one shared — a rare seed must never abort town generation.
 */
export function claimRoof(roofs: readonly Roof[], taken: Set<number>, level: 0 | 1 | 2 | 3, x: number): Roof {
  const cost = (r: Roof): number => Math.abs(r.level - level) * 1000 + Math.abs(r.x - x);
  let best: Roof | undefined;
  for (const r of roofs) {
    if (taken.has(r.id)) continue;
    if (!best || cost(r) < cost(best)) best = r;
  }
  if (!best) {
    for (const r of roofs) if (!best || cost(r) < cost(best)) best = r;
  }
  if (!best) throw new Error(`rooftops: no roofs were built (level ${level}, x=${x})`);
  taken.add(best.id);
  return best;
}

/** The two roofs flanking a row gap on a level (west, east); marks both taken. */
export function flankingRoofs(roofs: readonly Roof[], taken: Set<number>, gap: { readonly level: 0 | 1 | 2 | 3; readonly x0: number; readonly x1: number }): [Roof, Roof] {
  const edge = (r: Roof, side: -1 | 1): number => r.x + (side * (r.w + 0.4)) / 2;
  const pick = (side: -1 | 1, x: number): Roof => {
    let best: Roof | undefined;
    for (const r of roofs) {
      if (r.level !== gap.level || taken.has(r.id)) continue;
      if (!best || Math.abs(edge(r, side) - x) < Math.abs(edge(best, side) - x)) best = r;
    }
    if (!best) throw new Error(`rooftops: no roof flanking the gap at x=${x}`);
    taken.add(best.id);
    return best;
  };
  return [pick(1, gap.x0), pick(-1, gap.x1)];
}
