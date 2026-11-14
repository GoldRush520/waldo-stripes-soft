import { describe, expect, it } from 'vitest';
import { type Geo, LOD_FAR_ONLY, LOD_NEAR_ONLY, bounds, selectLod, triangleCount } from '../../src/core/geo';
import type { PropDef } from '../../src/props/registry';
import {
  BUDGETS,
  type SizeClass,
  PROPS,
  luggageHeap,
  paradeFloat,
  sailboat,
  seatKindsOf,
} from '../../src/props/transport/index';

interface Built {
  readonly def: PropDef;
  readonly near: Geo;
  readonly far: Geo;
  readonly full: Geo;
}

const built: readonly Built[] = PROPS.map((def) => {
  const full = def.build();
  return { def, full, near: selectLod(full, 'near'), far: selectLod(full, 'far') };
});

const tagged = (d: PropDef, t: string): boolean => (d.tags ?? []).includes(t);
const tagValue = (d: PropDef, prefix: string): string | undefined =>
  (d.tags ?? []).find((t) => t.startsWith(prefix))?.slice(prefix.length);

function sizeOf(d: PropDef): SizeClass {
  const v = tagValue(d, 'lod:');
  if (v === 'clutter' || v === 'furniture' || v === 'small' || v === 'medium' || v === 'large') return v;
  throw new Error(`${d.key} has no lod class`);
}

function get(key: string): Built {
  const b = built.find((x) => x.def.key === key);
  if (!b) throw new Error(`missing ${key}`);
  return b;
}

const EPS = 0.05;

describe('transport prop library', () => {
  it('registers at least 75 unique keys, all tagged with family and budget class', () => {
    const keys = PROPS.map((p) => p.key);
    expect(keys.length).toBeGreaterThanOrEqual(75);
    expect(new Set(keys).size).toBe(keys.length);
    for (const p of PROPS) {
      expect(tagged(p, 'transport')).toBe(true);
      expect(['boat', 'harbour', 'wheeled', 'tram'].some((f) => tagged(p, f))).toBe(true);
      expect(() => sizeOf(p)).not.toThrow();
    }
  });

  it('builds every prop with finite positions and unit-length normals', () => {
    const problems: string[] = [];
    for (const { def, full } of built) {
      if (triangleCount(full) === 0) problems.push(`${def.key}: empty`);
      if (!full.pos.every((v) => Number.isFinite(v))) problems.push(`${def.key}: non-finite position`);
      for (let i = 0; i < full.nor.length; i += 3) {
        const len = Math.hypot(full.nor[i] ?? 0, full.nor[i + 1] ?? 0, full.nor[i + 2] ?? 0);
        if (Math.abs(len - 1) > 1e-3) {
          problems.push(`${def.key}: normal length ${len.toFixed(4)} at vertex ${i / 3}`);
          break;
        }
      }
      const nv = full.pos.length / 3;
      if (!full.idx.every((v) => v < nv)) problems.push(`${def.key}: index out of range`);
    }
    expect(problems).toEqual([]);
  });

  it('rests on the ground, or dips below the waterline only for floating props', () => {
    for (const { def, near } of built) {
      if (tagged(def, 'pivot')) continue;
      const minY = bounds(near).min[1];
      if (tagged(def, 'waterline')) {
        expect(minY, def.key).toBeGreaterThanOrEqual(-0.5);
        expect(minY, def.key).toBeLessThanOrEqual(EPS);
      } else {
        expect(Math.abs(minY), def.key).toBeLessThanOrEqual(EPS);
      }
    }
  });

  it('keeps every prop inside its full and far triangle budgets, far tier <= 35 % of full', () => {
    for (const { def, near, far } of built) {
      const [fullMax, farMax] = BUDGETS[sizeOf(def)];
      const n = triangleCount(near);
      const f = triangleCount(far);
      expect(n, `${def.key} full`).toBeLessThanOrEqual(fullMax);
      expect(f, `${def.key} far`).toBeLessThanOrEqual(farMax);
      expect(f / n, `${def.key} far ratio`).toBeLessThanOrEqual(0.35);
      expect(f, `${def.key} far non-empty`).toBeGreaterThan(0);
    }
  });

  it('applies the brief budgets to the big set pieces and the small boats / vehicles', () => {
    const big = ['boat.trawler', 'tram.car', 'boat.float.fish', 'boat.float.swan', 'boat.float.lighthouseCake', 'boat.float.flowerArch'];
    for (const key of big) {
      const { near, far } = get(key);
      expect(triangleCount(near), key).toBeLessThanOrEqual(3000);
      expect(triangleCount(far), key).toBeLessThanOrEqual(900);
    }
    const small = ['boat.row', 'boat.dinghy', 'boat.kayak', 'boat.canoe', 'boat.swan', 'vehicle.bicycle', 'vehicle.scooter', 'vehicle.deliveryVan', 'vehicle.pedicab', 'vehicle.milkFloat'];
    for (const key of small) {
      const { near, far } = get(key);
      expect(triangleCount(near), key).toBeLessThanOrEqual(900);
      expect(triangleCount(far), key).toBeLessThanOrEqual(300);
    }
  });

  it('builds every prop as two LOD tiers (near-only detail plus a far-only stand-in)', () => {
    for (const { def, full } of built) {
      expect(full.lod.includes(LOD_NEAR_ONLY), def.key).toBe(true);
      expect(full.lod.includes(LOD_FAR_ONLY), def.key).toBe(true);
    }
  });

  it('places seats inside the prop bounds with a declared kind per seat', () => {
    for (const { def, near } of built) {
      const seats = def.seats ?? [];
      const kinds = seatKindsOf(def);
      expect(kinds.length, def.key).toBe(seats.length);
      const b = bounds(near);
      const pusherIndex = tagged(def, 'push') ? seats.length - 1 : -1;
      for (const [i, s] of seats.entries()) {
        if (i === pusherIndex) continue;
        expect(s.x, `${def.key} seat x`).toBeGreaterThanOrEqual(b.min[0] - EPS);
        expect(s.x, `${def.key} seat x`).toBeLessThanOrEqual(b.max[0] + EPS);
        expect(s.y, `${def.key} seat y`).toBeGreaterThanOrEqual(b.min[1] - EPS);
        expect(s.y, `${def.key} seat y`).toBeLessThanOrEqual(b.max[1] + EPS);
        expect(s.z, `${def.key} seat z`).toBeGreaterThanOrEqual(b.min[2] - EPS);
        expect(s.z, `${def.key} seat z`).toBeLessThanOrEqual(b.max[2] + EPS);
        expect(Number.isFinite(s.heading)).toBe(true);
      }
    }
  });

  it('gives boats and ridden / pushed vehicles seats, with the requested capacities', () => {
    for (const { def } of built) {
      const needs = tagged(def, 'wheeled') || (tagged(def, 'boat') && !['boat.oar', 'boat.paddle', 'boat.toySail', 'boat.rowUpturned'].includes(def.key));
      if (needs) expect((def.seats ?? []).length, def.key).toBeGreaterThan(0);
    }
    const count = (key: string, kind: 'hip' | 'feet'): number => seatKindsOf(get(key).def).filter((k) => k === kind).length;
    expect(count('tram.car', 'hip')).toBe(12);
    expect(count('tram.car', 'feet')).toBe(4);
    expect(count('tram.trailer', 'hip')).toBe(12);
    expect(count('boat.taxi', 'hip')).toBe(8);
    expect(count('vehicle.pedicab', 'hip')).toBe(3);
    for (const f of ['fish', 'swan', 'lighthouseCake', 'flowerArch']) expect(count(`boat.float.${f}`, 'feet')).toBe(6);
  });

  it('fits a 0.36 m wide seated adult on bench-style hip seats (seat spacing)', () => {
    for (const key of ['tram.car', 'tram.trailer', 'boat.taxi', 'boat.sail', 'tram.stop']) {
      const seats = (get(key).def.seats ?? []).filter((_, i) => seatKindsOf(get(key).def)[i] === 'hip');
      for (let i = 0; i < seats.length; i++) {
        for (let j = i + 1; j < seats.length; j++) {
          const a = seats[i];
          const b = seats[j];
          if (!a || !b) continue;
          expect(Math.hypot(a.x - b.x, a.z - b.z), key).toBeGreaterThanOrEqual(0.4);
        }
      }
    }
  });

  it('declares footprints that roughly match the geometry bounds', () => {
    for (const { def, near } of built) {
      if (tagged(def, 'pivot')) continue;
      const b = bounds(near);
      const ext = [b.max[0] - b.min[0], b.max[2] - b.min[2]] as const;
      def.footprint.forEach((fp, k) => {
        const e = ext[k] ?? 0;
        if (tagged(def, 'footprint:base')) {
          expect(fp, `${def.key} base footprint`).toBeLessThanOrEqual(e + EPS);
          expect(fp, `${def.key} base footprint`).toBeGreaterThan(0);
        } else {
          expect(Math.abs(fp - e), `${def.key} footprint axis ${k}: ${fp} vs ${e.toFixed(2)}`).toBeLessThanOrEqual(Math.max(0.35 * e, 0.2));
        }
      });
    }
  });

  it('documents a push handle inside the bounds for every pushed prop', () => {
    const pushed = built.filter(({ def }) => tagged(def, 'push'));
    expect(pushed.length).toBeGreaterThanOrEqual(12);
    for (const { def, near } of pushed) {
      const raw = tagValue(def, 'handle:');
      expect(raw, def.key).toBeDefined();
      const h = (raw ?? '').split(',').map(Number);
      expect(h.length).toBe(3);
      const b = bounds(near);
      h.forEach((v, k) => {
        expect(v, `${def.key} handle`).toBeGreaterThanOrEqual((b.min[k] ?? 0) - EPS);
        expect(v, `${def.key} handle`).toBeLessThanOrEqual((b.max[k] ?? 0) + EPS);
      });
      const kinds = seatKindsOf(def);
      const pusher = (def.seats ?? [])[kinds.length - 1];
      expect(kinds[kinds.length - 1], def.key).toBe('feet');
      expect(pusher, def.key).toBeDefined();
      if (pusher) {
        expect(Math.abs(pusher.x - (h[0] ?? 0)), `${def.key} pusher x`).toBeLessThanOrEqual(0.05);
        expect((h[2] ?? 0) - pusher.z, `${def.key} pusher behind handle`).toBeGreaterThan(0.2);
        expect((h[2] ?? 0) - pusher.z, `${def.key} pusher behind handle`).toBeLessThan(0.6);
        expect(pusher.y).toBe(0);
      }
    }
  });

  it('tint-masks the props that declare a default tint', () => {
    for (const { def, full } of built) {
      if (!def.defaultTint) continue;
      let masked = 0;
      for (let i = 0; i < full.fx.length; i += 2) if ((full.fx[i] ?? 0) > 0.5) masked++;
      expect(masked, def.key).toBeGreaterThan(0);
    }
  });

  it('keeps boat bows toward +z and hulls within the requested lengths', () => {
    const row = bounds(get('boat.row').near);
    expect(row.max[2] - row.min[2]).toBeCloseTo(3.4, 1);
    expect(row.max[0] - row.min[0]).toBeCloseTo(1.2, 1);
    const trawler = bounds(get('boat.trawler').near);
    expect(trawler.max[2] - trawler.min[2]).toBeGreaterThan(8.5);
    const tram = bounds(get('tram.car').near);
    expect(tram.max[2] - tram.min[2]).toBeGreaterThan(9.4);
    expect(tram.max[2] - tram.min[2]).toBeLessThan(10.2);
  });
});

describe('transport parametric builders', () => {
  it('scales the sailboat and bakes an explicit sail tint', () => {
    const g = selectLod(sailboat({ length: 4, sailTint: 'butter' }), 'near');
    const b = bounds(g);
    expect(b.max[2] - b.min[2]).toBeCloseTo(4, 1);
    let masked = 0;
    for (let i = 0; i < g.fx.length; i += 2) if ((g.fx[i] ?? 0) > 0.5) masked++;
    expect(masked).toBe(0);
  });

  it('builds deterministic seeded luggage heaps', () => {
    const a = luggageHeap(6, 3);
    const b = luggageHeap(6, 3);
    const c = luggageHeap(6, 4);
    expect(Array.from(a.pos)).toEqual(Array.from(b.pos));
    expect(Array.from(a.pos)).not.toEqual(Array.from(c.pos));
    expect(Math.abs(bounds(a).min[1])).toBeLessThanOrEqual(EPS);
  });

  it('builds each parade float figure within budget', () => {
    for (const f of ['fish', 'swan', 'lighthouseCake', 'flowerArch'] as const) {
      const g = paradeFloat(f);
      expect(triangleCount(selectLod(g, 'near'))).toBeLessThanOrEqual(3000);
      expect(triangleCount(selectLod(g, 'far'))).toBeLessThanOrEqual(900);
    }
  });
});
