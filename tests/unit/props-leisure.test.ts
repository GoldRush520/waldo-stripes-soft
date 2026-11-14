import { describe, expect, it } from 'vitest';
import { type Geo, bounds, selectLod, triangleCount } from '../../src/core/geo';
import type { PropDef } from '../../src/props/registry';
import {
  BUDGET,
  COASTER_TRACK,
  FERRIS_PIVOTS,
  FERRIS_RADIUS,
  PROPS,
  SWING_PIVOTS,
  buoyLine,
  promenadeRailing,
  queueRail,
} from '../../src/props/leisure/index';

type SizeKey = keyof typeof BUDGET;

const tagValue = (def: PropDef, prefix: string): string | undefined =>
  def.tags?.find((t) => t.startsWith(`${prefix}:`))?.slice(prefix.length + 1);

const sizeOf = (def: PropDef): SizeKey => {
  const s = tagValue(def, 'size');
  if (s === undefined || !(s in BUDGET)) throw new Error(`${def.key} has no valid size tag`);
  return s as SizeKey;
};

/** Allowed [min, max] for the lowest vertex, per origin family. */
const MIN_Y: Readonly<Record<string, readonly [number, number]>> = {
  ground: [-0.03, 0.06],
  decal: [-0.01, 0.03],
  sunk: [-1.0, 0.06],
  waterline: [-1.5, 0.5],
  pivot: [-20, 1.0],
};

const built = new Map<string, Geo>();
const geoOf = (def: PropDef): Geo => {
  const hit = built.get(def.key);
  if (hit) return hit;
  const g = def.build();
  built.set(def.key, g);
  return g;
};

function assertFiniteAndUnit(key: string, g: Geo): void {
  for (let i = 0; i < g.pos.length; i++) {
    if (!Number.isFinite(g.pos[i])) throw new Error(`${key}: non-finite position at ${i}`);
  }
  for (let i = 0; i < g.nor.length; i += 3) {
    const len = Math.hypot(g.nor[i] ?? 0, g.nor[i + 1] ?? 0, g.nor[i + 2] ?? 0);
    if (Math.abs(len - 1) > 1e-3) throw new Error(`${key}: normal ${i / 3} has length ${len}`);
  }
  for (let i = 0; i < g.idx.length; i++) {
    if ((g.idx[i] ?? 0) >= g.pos.length / 3) throw new Error(`${key}: index out of range`);
  }
}

describe('leisure prop library', () => {
  it('registers at least 110 unique dotted keys', () => {
    const keys = PROPS.map((p) => p.key);
    expect(keys.length).toBeGreaterThanOrEqual(110);
    expect(new Set(keys).size).toBe(keys.length);
    keys.forEach((k) => expect(k).toMatch(/^[a-z]+(\.[a-z0-9]+)+$/));
  });

  it('builds every prop with finite positions, unit normals and valid indices', () => {
    PROPS.forEach((def) => {
      const g = geoOf(def);
      expect(triangleCount(g), def.key).toBeGreaterThan(0);
      assertFiniteAndUnit(def.key, g);
    });
  });

  it('keeps the lowest vertex inside the allowed range for its origin family', () => {
    PROPS.forEach((def) => {
      const origin = tagValue(def, 'origin') ?? 'ground';
      const range = def.material === 'water' ? ([0, 0.5] as const) : MIN_Y[origin];
      expect(range, `${def.key} origin ${origin}`).toBeDefined();
      const minY = bounds(geoOf(def)).min[1];
      expect(minY, def.key).toBeGreaterThanOrEqual(range?.[0] ?? 0);
      expect(minY, def.key).toBeLessThanOrEqual(range?.[1] ?? 0);
    });
  });

  it('meets the contract triangle budgets for the full and far tiers', () => {
    PROPS.forEach((def) => {
      const [fullMax, farMax] = BUDGET[sizeOf(def)];
      const g = geoOf(def);
      const full = triangleCount(selectLod(g, 'near'));
      const far = triangleCount(selectLod(g, 'far'));
      expect(full, `${def.key} full`).toBeLessThanOrEqual(fullMax);
      expect(far, `${def.key} far`).toBeLessThanOrEqual(farMax);
      expect(far, `${def.key} far tier must keep something`).toBeGreaterThan(0);
    });
  });

  it('keeps the far tier at or below 35% of full for stalls, rides, houses and landmarks', () => {
    const big = new Set<SizeKey>(['stall', 'ride', 'house', 'landmark']);
    PROPS.filter((d) => big.has(sizeOf(d)) && tagValue(d, 'origin') !== 'decal').forEach((def) => {
      const g = geoOf(def);
      const full = triangleCount(selectLod(g, 'near'));
      const far = triangleCount(selectLod(g, 'far'));
      expect(far / full, def.key).toBeLessThanOrEqual(0.35);
    });
  });

  it('places every seat inside the prop bounds and tags its kind', () => {
    PROPS.filter((d) => (d.seats?.length ?? 0) > 0).forEach((def) => {
      const b = bounds(geoOf(def));
      const tol = 0.1;
      expect(def.tags?.some((t) => t === 'seat:hip' || t === 'seat:feet'), def.key).toBe(true);
      def.seats?.forEach((s) => {
        expect(Number.isFinite(s.heading), def.key).toBe(true);
        expect(s.x, def.key).toBeGreaterThanOrEqual(b.min[0] - tol);
        expect(s.x, def.key).toBeLessThanOrEqual(b.max[0] + tol);
        expect(s.y, def.key).toBeGreaterThanOrEqual(b.min[1] - tol);
        expect(s.y, def.key).toBeLessThanOrEqual(b.max[1] + tol);
        expect(s.z, def.key).toBeGreaterThanOrEqual(b.min[2] - tol);
        expect(s.z, def.key).toBeLessThanOrEqual(b.max[2] + tol);
      });
    });
  });

  it('gives the rides the requested seat counts', () => {
    const seats = (key: string): number => PROPS.find((p) => p.key === key)?.seats?.length ?? 0;
    expect(seats('ferris.gondola')).toBe(2);
    expect(seats('carousel.platform')).toBe(10);
    expect(seats('chairswing.top')).toBe(12);
    expect(seats('swingboat.boat')).toBe(6);
    expect(seats('coaster.car')).toBe(2);
    expect(seats('sport.bleachers')).toBe(12);
    expect(seats('seesaw.plank')).toBe(2);
  });
});

describe('ride metadata', () => {
  it('puts the 12 Ferris pivots on the 14 m rim in the wheel plane', () => {
    expect(FERRIS_RADIUS).toBe(14);
    expect(FERRIS_PIVOTS).toHaveLength(12);
    FERRIS_PIVOTS.forEach((p) => {
      expect(Math.hypot(p[0], p[1])).toBeCloseTo(14, 6);
      expect(p[2]).toBe(0);
    });
    const angles = FERRIS_PIVOTS.map((p) => Math.atan2(p[0], -p[1]));
    expect(new Set(angles.map((a) => a.toFixed(4))).size).toBe(12);
  });

  it('makes COASTER_TRACK a closed loop with even spacing', () => {
    expect(COASTER_TRACK.length).toBeGreaterThanOrEqual(16);
    const steps = COASTER_TRACK.map((p, i) => {
      const q = COASTER_TRACK[(i + 1) % COASTER_TRACK.length] ?? p;
      return Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    });
    const sorted = [...steps].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 1;
    steps.forEach((s) => {
      expect(s).toBeGreaterThan(median * 0.4);
      expect(s).toBeLessThan(median * 2.0);
    });
    const xs = COASTER_TRACK.map((p) => p[0]);
    const zs = COASTER_TRACK.map((p) => p[2]);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(14);
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(7.5);
    COASTER_TRACK.forEach((p) => expect(p[1]).toBeGreaterThan(0.4));
  });

  it('exports four swing pivots under the 2-bay frame top bar', () => {
    expect(SWING_PIVOTS).toHaveLength(4);
    SWING_PIVOTS.forEach((p) => expect(p[1]).toBeGreaterThan(2));
  });
});

describe('parametric builders', () => {
  it.each([2, 5.5, 13])('builds a %s m queue rail, promenade railing and buoy line of that length', (len) => {
    [queueRail(len), promenadeRailing(len), buoyLine(len)].forEach((g) => {
      const b = bounds(g);
      assertFiniteAndUnit('parametric', g);
      expect(b.max[0] - b.min[0]).toBeGreaterThan(len - 0.01);
      expect(b.max[0] - b.min[0]).toBeLessThan(len + 0.4);
    });
  });
});
