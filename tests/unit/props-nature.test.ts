import { describe, expect, it } from 'vitest';
import { type Geo, bounds, selectLod, triangleCount } from '../../src/core/geo';
import { PROPS, flowerBed, flowerBorder, hedgeRun, tree } from '../../src/props/nature/index';
import type { PropDef } from '../../src/props/registry';

/** [full (near tier), far tier] triangle budgets by key prefix (first match wins). */
const BUDGETS: ReadonlyArray<readonly [string, number, number]> = [
  ['tree.', 240, 90],
  ['animal.', 220, 90],
  ['topiary.', 300, 80],
  ['hedge.', 300, 80],
  ['arbour.', 1200, 350],
  ['air.balloon', 1200, 350],
  ['air.', 300, 80],
  ['garden.', 300, 80],
  ['plant.sunflowers', 300, 80],
  ['rock.cluster', 300, 80],
  ['veg.', 300, 80],
  ['plant.', 150, 40],
  ['rock.', 150, 40],
];

/** Families allowed to float above / dip below y = 0, with their min-y range. */
const FLOATING: ReadonlyArray<readonly [string, number, number]> = [
  ['air.', -8, 12],
  ['animal.gull.flying', -2, 2],
  ['animal.butterflies', -1, 2],
  ['animal.fish.jumping', -0.6, 0.6],
  ['animal.octopus', -1.5, 0.05],
  ['animal.frog.lilypad', -0.1, 0.05],
  ['plant.lilypads', -0.1, 0.05],
  ['plant.reeds', -0.6, 0.05],
];

function budget(key: string): readonly [number, number] {
  const hit = BUDGETS.find(([p]) => key.startsWith(p));
  return hit ? [hit[1], hit[2]] : [150, 40];
}

function minYRange(key: string): readonly [number, number] {
  const hit = FLOATING.find(([p]) => key.startsWith(p));
  return hit ? [hit[1], hit[2]] : [-0.05, 0.05];
}

const built = new Map<string, Geo>(PROPS.map((d: PropDef) => [d.key, d.build()]));

function geoOf(key: string): Geo {
  const g = built.get(key);
  if (!g) throw new Error(`missing ${key}`);
  return g;
}

describe('nature props', () => {
  it('registers at least 120 unique keys', () => {
    const keys = PROPS.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.length).toBeGreaterThanOrEqual(120);
  });

  it.each(PROPS.map((d) => [d.key]))('%s has finite positions and unit normals', (key) => {
    const g = geoOf(key);
    expect(g.idx.length).toBeGreaterThan(0);
    for (const v of g.pos) expect(Number.isFinite(v)).toBe(true);
    for (let i = 0; i < g.nor.length; i += 3) {
      const len = Math.hypot(g.nor[i] ?? 0, g.nor[i + 1] ?? 0, g.nor[i + 2] ?? 0);
      expect(Math.abs(len - 1)).toBeLessThan(1e-3);
    }
    for (const i of g.idx) expect(i).toBeLessThan(g.pos.length / 3);
  });

  it.each(PROPS.map((d) => [d.key]))('%s rests on its allowed base height', (key) => {
    const [lo, hi] = minYRange(key);
    const y = bounds(geoOf(key)).min[1];
    expect(y).toBeGreaterThanOrEqual(lo);
    expect(y).toBeLessThanOrEqual(hi);
  });

  it.each(PROPS.map((d) => [d.key]))('%s fits its full / far triangle budgets', (key) => {
    const g = geoOf(key);
    const [full, far] = budget(key);
    const nearTris = triangleCount(selectLod(g, 'near'));
    const farTris = triangleCount(selectLod(g, 'far'));
    expect(nearTris).toBeLessThanOrEqual(full);
    expect(farTris).toBeLessThanOrEqual(far);
    expect(farTris).toBeLessThanOrEqual(Math.ceil(nearTris * 0.35));
    expect(farTris).toBeGreaterThan(0);
  });

  it.each(PROPS.map((d) => [d]))('$key footprint sits inside its base bounds', (def: PropDef) => {
    const b = bounds(geoOf(def.key));
    const [w, d] = def.footprint;
    expect(w).toBeGreaterThanOrEqual(0);
    expect(d).toBeGreaterThanOrEqual(0);
    expect(w).toBeLessThanOrEqual(b.max[0] - b.min[0] + 0.1);
    expect(d).toBeLessThanOrEqual(b.max[2] - b.min[2] + 0.1);
    const walk = (def.tags ?? []).includes('walk-through') || (def.tags ?? []).includes('airborne');
    if (!walk) expect(Math.min(w, d)).toBeGreaterThan(0.02);
    if ((def.tags ?? []).includes('pole')) return;
    expect(Math.abs((b.max[0] + b.min[0]) / 2)).toBeLessThan(Math.max(0.6, (b.max[0] - b.min[0]) * 0.35));
    expect(Math.abs((b.max[2] + b.min[2]) / 2)).toBeLessThan(Math.max(0.6, (b.max[2] - b.min[2]) * 0.35));
  });

  it('builds seeded trees deterministically and varies them by seed', () => {
    const a = tree({ kind: 'round', h: 6, seed: 7 });
    const b = tree({ kind: 'round', h: 6, seed: 7 });
    const c = tree({ kind: 'round', h: 6, seed: 8 });
    expect(Array.from(a.pos)).toEqual(Array.from(b.pos));
    expect(Array.from(a.pos)).not.toEqual(Array.from(c.pos));
  });

  it('builds seeded beds and borders deterministically', () => {
    expect(Array.from(flowerBed(2, 1.2, 3).pos)).toEqual(Array.from(flowerBed(2, 1.2, 3).pos));
    expect(Array.from(flowerBed(2, 1.2, 3).pos)).not.toEqual(Array.from(flowerBed(2, 1.2, 4).pos));
    expect(Array.from(flowerBorder(3, 0.6, 9).pos)).toEqual(Array.from(flowerBorder(3, 0.6, 9).pos));
  });

  it('runs a hedge along a polyline at the requested height and width', () => {
    const g = hedgeRun(
      [
        [0, 0],
        [6, 0],
        [6, 4],
      ],
      1.2,
      0.6,
    );
    const b = bounds(g);
    expect(b.min[1]).toBeCloseTo(0, 3);
    expect(b.max[1]).toBeCloseTo(1.2, 2);
    expect(b.min[0]).toBeCloseTo(-0.3, 1);
    expect(b.max[0]).toBeCloseTo(6.3, 1);
    expect(b.max[2]).toBeCloseTo(4.3, 1);
    expect(triangleCount(selectLod(g, 'far'))).toBeLessThanOrEqual(Math.ceil(triangleCount(selectLod(g, 'near')) * 0.35));
  });

  it('gives seat anchors to the rideable horse and the balloon basket', () => {
    for (const key of ['animal.horse', 'air.balloon']) {
      const def = PROPS.find((d) => d.key === key);
      expect(def?.seats?.length ?? 0).toBeGreaterThan(0);
      const b = bounds(geoOf(key));
      for (const s of def?.seats ?? []) {
        expect(s.y).toBeGreaterThan(b.min[1]);
        expect(s.y).toBeLessThan(b.max[1]);
      }
    }
  });
});
