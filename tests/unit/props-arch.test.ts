import { describe, expect, it } from 'vitest';
import { type Geo, bounds, selectLod, triangleCount } from '../../src/core/geo';
import type { PropDef } from '../../src/props/registry';
import { PROPS, externalStair, house, rowHouses } from '../../src/props/arch/index';
import type { HouseOpts, HouseResult } from '../../src/props/arch/index';

const BUDGETS: Record<string, readonly [number, number]> = {
  clutter: [150, 40],
  furniture: [300, 80],
  stall: [1200, 350],
  house: [3000, 700],
  landmark: [4000, 1200],
};

function budgetOf(def: PropDef): readonly [number, number] {
  const tag = (def.tags ?? []).find((t) => t.startsWith('budget:'))?.slice(7) ?? 'missing';
  const row = /^row(\d+)$/.exec(tag);
  if (row) return [3000 * Number(row[1]), 700 * Number(row[1])];
  const b = BUDGETS[tag];
  if (!b) throw new Error(`${def.key} has no budget tag`);
  return b;
}

function tiers(g: Geo): { full: number; far: number } {
  return { full: triangleCount(selectLod(g, 'near')), far: triangleCount(selectLod(g, 'far')) };
}

function checkMesh(key: string, g: Geo): void {
  expect(g.idx.length, key).toBeGreaterThan(0);
  for (let i = 0; i < g.pos.length; i++) expect(Number.isFinite(g.pos[i]), `${key} pos`).toBe(true);
  for (let i = 0; i < g.nor.length; i += 3) {
    const len = Math.hypot(g.nor[i] ?? 0, g.nor[i + 1] ?? 0, g.nor[i + 2] ?? 0);
    if (Math.abs(len - 1) > 1e-3) throw new Error(`${key}: normal length ${len} at vertex ${i / 3}`);
  }
  for (let i = 0; i < g.fx.length; i++) {
    const v = g.fx[i] ?? -1;
    expect(v >= 0 && v <= 1, `${key} fx`).toBe(true);
  }
}

const SHOP3: HouseOpts = {
  floors: 3,
  w: 6,
  front: { shop: { sign: 'pretzel', display: 'hats' }, windowBoxes: true, shutters: true, balconies: [1, 2], balconyFlowers: true },
};

describe('arch props registry', () => {
  it('registers at least 45 unique keys', () => {
    const keys = PROPS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.length).toBeGreaterThanOrEqual(45);
  });

  for (const def of PROPS) {
    it(`${def.key} builds a sound mesh within budget`, () => {
      const g = def.build();
      checkMesh(def.key, g);
      const b = bounds(g);
      expect(b.min[1], `${def.key} min y`).toBeGreaterThanOrEqual(-0.05);
      expect(b.min[1], `${def.key} min y`).toBeLessThanOrEqual(0.05);
      const [maxFull, maxFar] = budgetOf(def);
      const t = tiers(g);
      expect(t.full, `${def.key} full tris`).toBeLessThanOrEqual(maxFull);
      expect(t.far, `${def.key} far tris`).toBeLessThanOrEqual(maxFar);
      expect(t.far / t.full, `${def.key} far ratio`).toBeLessThanOrEqual(0.35);
      const [fw, fd] = def.footprint;
      if (fw > 0 && fd > 0) {
        const bw = b.max[0] - b.min[0];
        const bd = b.max[2] - b.min[2];
        expect(fw, `${def.key} footprint w`).toBeLessThanOrEqual(bw + 0.15);
        expect(fd, `${def.key} footprint d`).toBeLessThanOrEqual(bd + 0.15);
        expect(fw, `${def.key} footprint w`).toBeGreaterThanOrEqual(bw * 0.2);
        expect(fd, `${def.key} footprint d`).toBeGreaterThanOrEqual(bd * 0.2);
      }
    });
  }
});

function expectMetadataInside(h: HouseResult): void {
  const [w, d] = h.footprint;
  const eps = 0.02;
  for (const door of h.doors) {
    expect(Math.abs(door.x)).toBeLessThanOrEqual(w / 2 + eps);
    expect(Math.abs(door.z)).toBeLessThanOrEqual(d / 2 + eps);
  }
  for (const b of h.balconies) {
    // balconies project beyond the wall by their own depth; the slab centre is half that out
    expect(Math.abs(b.x)).toBeLessThanOrEqual(w / 2 + b.depth / 2 + eps);
    expect(Math.abs(b.z)).toBeLessThanOrEqual(d / 2 + b.depth / 2 + eps);
    expect(b.y).toBeGreaterThan(2);
    expect(b.y).toBeLessThan(h.roofY);
  }
  if (h.terrace) {
    expect(h.terrace.w).toBeLessThanOrEqual(w);
    expect(h.terrace.d).toBeLessThanOrEqual(d);
    expect(h.terrace.y).toBeGreaterThanOrEqual(h.roofY);
  }
}

describe('house()', () => {
  it('is deterministic per seed and differs across seeds', () => {
    const a = house({ ...SHOP3, seed: 42 });
    const b = house({ ...SHOP3, seed: 42 });
    const c = house({ ...SHOP3, seed: 43 });
    expect(Array.from(a.geo.pos)).toEqual(Array.from(b.geo.pos));
    expect(Array.from(a.geo.col)).toEqual(Array.from(b.geo.col));
    const same = a.geo.pos.length === c.geo.pos.length && Array.from(a.geo.col).every((v, i) => v === c.geo.col[i]);
    expect(same).toBe(false);
  });

  it('keeps a 3-floor shop house within 3000 full / 700 far triangles', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const t = tiers(house({ ...SHOP3, seed }).geo);
      expect(t.full).toBeLessThanOrEqual(3000);
      expect(t.far).toBeLessThanOrEqual(700);
    }
  });

  it('holds the budget for over-specified requests via the governor', () => {
    const heavy: HouseOpts = {
      floors: 5,
      w: 9,
      quoins: true,
      halfTimber: true,
      front: { style: 'shuttered', windowBoxes: true, balconies: 'all', balconyFlowers: true, shop: { sign: 'fish' } },
      back: { windows: 4, windowBoxes: true },
    };
    for (let seed = 1; seed <= 4; seed++) {
      const t = tiers(house({ ...heavy, seed }).geo);
      expect(t.full).toBeLessThanOrEqual(3000);
      expect(t.far).toBeLessThanOrEqual(700);
    }
  });

  it('places doors, balconies and terraces inside the footprint', () => {
    const variants: HouseOpts[] = [
      SHOP3,
      { roof: 'flat', floors: 3, terraceGarden: true, front: { balconies: 'all', wideBalcony: true } },
      { roof: 'mansard', floors: 4, front: { balconies: [2] }, right: { door: true, windows: 3 } },
      { roof: 'hip', w: 8, d: 6, front: { door: 'double' }, back: { door: true, windows: 3 } },
    ];
    variants.forEach((v, i) => {
      const h = house({ ...v, seed: i + 5 });
      expect(h.doors.length).toBeGreaterThan(0);
      expectMetadataInside(h);
    });
    const flat = house({ roof: 'flat', floors: 2, seed: 3 });
    expect(flat.terrace).toBeDefined();
    expect(flat.terrace?.y).toBeCloseTo(flat.roofY + 0.1, 5);
  });

  it('reports a footprint that matches the walls', () => {
    const h = house({ w: 5.5, d: 6.5, roof: 'flat', seed: 9 });
    const b = bounds(h.geo);
    expect(h.footprint).toEqual([5.5, 6.5]);
    expect(b.max[0] - b.min[0]).toBeGreaterThanOrEqual(5.5);
    expect(b.max[0] - b.min[0]).toBeLessThan(6.5);
    expect(h.topY).toBeCloseTo(b.max[1], 5);
  });

  it('keeps blank and party walls cheap', () => {
    const open = tiers(house({ seed: 2, left: { windows: 3 }, right: { windows: 3 } }).geo);
    const party = tiers(house({ seed: 2, left: { party: true }, right: { party: true } }).geo);
    expect(party.full).toBeLessThan(open.full);
  });
});

describe('rowHouses()', () => {
  it('builds a continuous deterministic terrace with metadata in row space', () => {
    const a = rowHouses({ count: 5, seed: 7 });
    const b = rowHouses({ count: 5, seed: 7 });
    expect(Array.from(a.geo.pos)).toEqual(Array.from(b.geo.pos));
    expect(a.houses).toHaveLength(5);
    const total = a.houses.reduce((s, h) => s + h.w, 0);
    expect(a.footprint[0]).toBeCloseTo(total, 5);
    let edge = -total / 2;
    for (const h of a.houses) {
      expect(h.x - h.w / 2).toBeCloseTo(edge, 5);
      edge += h.w;
    }
    const [W, D] = a.footprint;
    for (const d of a.doors) {
      expect(Math.abs(d.x)).toBeLessThanOrEqual(W / 2 + 0.02);
      expect(Math.abs(d.z)).toBeLessThanOrEqual(D / 2 + 0.02);
    }
    const t = tiers(a.geo);
    expect(t.full).toBeLessThanOrEqual(5 * 3000);
    expect(t.far).toBeLessThanOrEqual(5 * 700);
    const looks = new Set(a.houses.map((h) => `${h.floors}:${h.roof}:${h.w}`));
    expect(looks.size).toBeGreaterThan(2);
    for (const t of a.terraces) {
      expect(Math.abs(t.x) + t.w / 2).toBeLessThanOrEqual(W / 2 + 0.02);
      expect(t.d).toBeLessThanOrEqual(D);
    }
  });
});

describe('externalStair()', () => {
  it('returns a landing at the requested rise inside its footprint', () => {
    const s = externalStair({ rise: 3 });
    expect(s.landing.y).toBe(3);
    expect(Math.abs(s.landing.x)).toBeLessThanOrEqual(s.footprint[0] / 2);
    const b = bounds(s.geo);
    expect(b.max[1]).toBeGreaterThan(3.5);
  });
});
