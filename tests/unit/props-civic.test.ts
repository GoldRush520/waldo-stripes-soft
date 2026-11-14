import { describe, expect, it } from 'vitest';
import { type Geo, bounds, selectLod, triangleCount } from '../../src/core/geo';
import {
  PROPS,
  bandstand,
  civicMeta,
  marketHall,
  scaffold,
  stairs,
  stationHall,
  type CivicVariantKey,
} from '../../src/props/civic/index';

const BUDGETS: Record<string, readonly [number, number]> = {
  'size:landmark': [4000, 1200],
  'size:house': [3000, 700],
  'size:stall': [1200, 350],
  'size:furniture': [300, 80],
  'size:clutter': [150, 40],
};

/** Allowed [lowest, highest] value of the minimum y per key prefix (first match wins). */
const MIN_Y: ReadonlyArray<readonly [string, number, number]> = [
  ['hall.station.glass', 5, 6],
  ['greenhouse.glass', 0.5, 0.7],
  ['bridge.', -2.5, -0.3],
  ['quay.', -2.5, -1.5],
  ['pier.', -2.5, -1.5],
  ['breakwater.', -2.5, -1.2],
  ['boardwalk.', -0.5, -0.1],
  ['boathouse', -1.7, -1.0],
  ['tower.lighthouse', -1.0, 0],
  ['tower.lookout', -0.2, 0],
  ['', -0.05, 0.01],
];

const geos = new Map<string, Geo>(PROPS.map((p) => [p.key, p.build()]));

function geoOf(key: string): Geo {
  const g = geos.get(key);
  if (!g) throw new Error(`missing ${key}`);
  return g;
}

function sizeClass(tags: readonly string[] | undefined): string {
  return (tags ?? []).find((t) => t.startsWith('size:')) ?? 'none';
}

function hasVertexNear(g: Geo, pred: (x: number, y: number, z: number) => boolean): boolean {
  for (let i = 0; i < g.pos.length; i += 3) {
    if (pred(g.pos[i] as number, g.pos[i + 1] as number, g.pos[i + 2] as number)) return true;
  }
  return false;
}

describe('civic prop library', () => {
  it('registers at least 45 unique keys, each with a size class', () => {
    const keys = PROPS.map((p) => p.key);
    expect(keys.length).toBeGreaterThanOrEqual(45);
    expect(new Set(keys).size).toBe(keys.length);
    for (const p of PROPS) expect(BUDGETS[sizeClass(p.tags)], p.key).toBeDefined();
  });

  it('marks the glazing props as glass', () => {
    expect(PROPS.find((p) => p.key === 'hall.station.glass')?.material).toBe('glass');
    expect(PROPS.find((p) => p.key === 'greenhouse.glass')?.material).toBe('glass');
  });

  it.each(PROPS.map((p) => [p.key]))('%s builds finite geometry with unit normals', (key) => {
    const g = geoOf(key);
    expect(triangleCount(g)).toBeGreaterThan(0);
    expect(g.pos.every((v) => Number.isFinite(v)), `${key} positions finite`).toBe(true);
    let badNormals = 0;
    for (let i = 0; i < g.nor.length; i += 3) {
      const len = Math.hypot(g.nor[i] as number, g.nor[i + 1] as number, g.nor[i + 2] as number);
      if (Math.abs(len - 1) > 1e-3) badNormals++;
    }
    expect(badNormals, `${key} non-unit normals`).toBe(0);
    expect(g.idx.every((i) => i < g.pos.length / 3), `${key} indices in range`).toBe(true);
  });

  it.each(PROPS.map((p) => [p.key]))('%s rests at an allowed height', (key) => {
    const rule = MIN_Y.find(([prefix]) => key.startsWith(prefix));
    expect(rule).toBeDefined();
    const [, lo, hi] = rule ?? ['', 0, 0];
    const minY = bounds(geoOf(key)).min[1];
    expect(minY, key).toBeGreaterThanOrEqual(lo);
    expect(minY, key).toBeLessThanOrEqual(hi);
  });

  it.each(PROPS.map((p) => [p.key, sizeClass(p.tags)]))('%s fits the %s triangle budgets', (key, cls) => {
    const [full, far] = BUDGETS[cls] ?? [0, 0];
    const g = geoOf(key);
    const nearTris = triangleCount(selectLod(g, 'near'));
    const farTris = triangleCount(selectLod(g, 'far'));
    expect(triangleCount(g), `${key} total`).toBeLessThanOrEqual(full);
    expect(farTris, `${key} far`).toBeLessThanOrEqual(far);
    expect(farTris, `${key} far ratio`).toBeLessThanOrEqual(0.35 * nearTris);
  });
});

const BRIDGES: readonly CivicVariantKey[] = [
  'bridge.stone',
  'bridge.iron',
  'bridge.covered',
  'bridge.draw',
  'bridge.draw.raised',
  'bridge.rope',
  'bridge.viaduct',
];

describe('walkable metadata', () => {
  it.each(BRIDGES.map((k) => [k]))('%s deck profile is ordered and inside the geometry', (key) => {
    const meta = civicMeta(key as 'bridge.stone');
    const b = bounds(geoOf(key));
    const deck = meta.deck;
    expect(deck[0]?.t).toBe(0);
    expect(deck[deck.length - 1]?.t).toBe(1);
    deck.forEach((p, i) => {
      if (i > 0) expect(p.t).toBeGreaterThan(deck[i - 1]?.t ?? -1);
      expect(p.y).toBeGreaterThanOrEqual(b.min[1]);
      expect(p.y).toBeLessThanOrEqual(b.max[1]);
    });
    expect(Math.abs(deck[0]?.y ?? 9)).toBeLessThan(0.1);
    expect(Math.abs(deck[deck.length - 1]?.y ?? 9)).toBeLessThan(0.1);
    expect(meta.length).toBeCloseTo(b.max[0] - b.min[0], 0);
    expect(meta.width).toBeLessThanOrEqual(b.max[2] - b.min[2]);
  });

  it('arched bridges clear boats at mid-span', () => {
    for (const key of ['bridge.stone', 'bridge.iron'] as const) {
      const mid = civicMeta(key).deck.find((p) => Math.abs(p.t - 0.5) < 1e-6);
      expect(mid?.y ?? 0).toBeGreaterThanOrEqual(1.5);
    }
  });

  it('flags the raised drawbridge gap only when raised', () => {
    expect(civicMeta('bridge.draw').gap).toBeUndefined();
    const gap = civicMeta('bridge.draw.raised').gap;
    expect(gap?.[0]).toBeLessThan(0.5);
    expect(gap?.[1]).toBeGreaterThan(0.5);
  });

  it('scaffold deck levels match the plank geometry in both tiers', () => {
    const s = scaffold(3, 3);
    expect(s.decks.map((d) => d.y)).toEqual([2, 4, 6]);
    for (const tier of ['near', 'far'] as const) {
      const g = selectLod(s.geo, tier);
      for (const d of s.decks) {
        const hit = hasVertexNear(g, (x, y, z) => Math.abs(y - d.y) < 1e-4 && x >= d.x0 - 0.1 && x <= d.x1 + 0.1 && z >= d.z0 - 0.1 && z <= d.z1 + 0.1);
        expect(hit, `${tier} deck at ${d.y}`).toBe(true);
      }
    }
  });

  it('stairs report a top landing that matches the top step', () => {
    const s = stairs(3, 1.5, 6);
    const near = selectLod(s.geo, 'near');
    expect(hasVertexNear(near, (_, y, z) => Math.abs(y - s.top[1]) < 1e-4 && Math.abs(z - s.top[2]) < 1e-4)).toBe(true);
    expect(s.bottom[2] - s.top[2]).toBeCloseTo(s.length, 6);
  });

  it('market hall columns sit inside the hall and outside the clear interior', () => {
    const m = marketHall();
    const b = bounds(m.geo);
    expect(m.columns.length).toBeGreaterThanOrEqual(12);
    for (const [x, z] of m.columns) {
      expect(x).toBeGreaterThanOrEqual(b.min[0]);
      expect(x).toBeLessThanOrEqual(b.max[0]);
      const inside = x > m.interior.x0 && x < m.interior.x1 && z > m.interior.z0 && z < m.interior.z1;
      expect(inside).toBe(false);
    }
  });

  it('station platforms and bandstand deck are at their reported heights', () => {
    const st = stationHall();
    expect(st.platforms).toHaveLength(2);
    for (const p of st.platforms) {
      expect(hasVertexNear(st.geo, (_, y, z) => Math.abs(y - p.y) < 1e-4 && z > p.z0 && z < p.z1)).toBe(true);
    }
    const bs = bandstand();
    expect(bs.deckY).toBeCloseTo(0.9, 6);
    expect(hasVertexNear(bs.geo, (x, y, z) => Math.abs(y - bs.deckY) < 1e-4 && Math.hypot(x, z) <= bs.radius + 0.5)).toBe(true);
  });
});
