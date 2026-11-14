import { describe, expect, it } from 'vitest';
import { type Geo, bounds, selectLod, triangleCount } from '../../src/core/geo';
import { BUDGETS, type Budget } from '../../src/props/street/kit';
import { PROPS, bunting, laundryLine, stall, stringLights } from '../../src/props/street/index';

function budgetOf(tags: readonly string[] | undefined): Budget {
  const tag = (tags ?? []).find((t) => t.startsWith('budget:'));
  const name = tag?.slice('budget:'.length);
  if (name === undefined || !(name in BUDGETS)) throw new Error(`missing budget tag: ${String(tags)}`);
  return name as Budget;
}

function finiteAndUnit(g: Geo): { finite: boolean; unit: boolean } {
  let finite = true;
  let unit = true;
  for (let i = 0; i < g.pos.length; i += 3) {
    const p = [g.pos[i], g.pos[i + 1], g.pos[i + 2]] as number[];
    const n = [g.nor[i], g.nor[i + 1], g.nor[i + 2]] as number[];
    if (!p.every(Number.isFinite) || !n.every(Number.isFinite)) finite = false;
    const len = Math.hypot(n[0] ?? 0, n[1] ?? 0, n[2] ?? 0);
    if (Math.abs(len - 1) > 1e-3) unit = false;
  }
  return { finite, unit };
}

const built = PROPS.map((def) => ({ def, geo: def.build() }));

describe('street prop library', () => {
  it('registers at least 110 unique keys including the stall variants', () => {
    const keys = PROPS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.length).toBeGreaterThanOrEqual(110);
    expect(keys.filter((k) => k.startsWith('stall.')).length).toBeGreaterThanOrEqual(16);
    expect(keys).toContain('fountain.round.water');
  });

  it.each(built.map((b) => [b.def.key, b] as const))('%s builds clean geometry within budget', (_key, { def, geo }) => {
    expect(triangleCount(geo)).toBeGreaterThan(0);
    const { finite, unit } = finiteAndUnit(geo);
    expect(finite).toBe(true);
    expect(unit).toBe(true);
    const b = bounds(geo);
    expect(b.min[1]).toBeGreaterThanOrEqual(-0.05);
    expect(b.min[1]).toBeLessThanOrEqual(0.05);
    const budget = BUDGETS[budgetOf(def.tags)];
    const near = triangleCount(selectLod(geo, 'near'));
    const far = triangleCount(selectLod(geo, 'far'));
    expect(near).toBeLessThanOrEqual(budget.full);
    expect(far).toBeLessThanOrEqual(budget.far);
    if (def.tags?.includes('goods')) expect(far).toBeLessThanOrEqual(near * 0.35);
  });

  it.each(built.map((b) => [b.def.key, b] as const))('%s footprint and seats match its bounds', (_key, { def, geo }) => {
    const b = bounds(geo);
    const bw = b.max[0] - b.min[0];
    const bd = b.max[2] - b.min[2];
    const [fw, fd] = def.footprint;
    if (fw > 0 || fd > 0) {
      expect(fw).toBeLessThanOrEqual(bw + 0.15);
      expect(fd).toBeLessThanOrEqual(bd + 0.15);
      // props with canopies / arms overhanging a small base declare it with an 'overhang' tag
      const minShare = def.tags?.includes('overhang') ? 0.08 : 0.3;
      expect(fw).toBeGreaterThanOrEqual(bw * minShare);
      expect(fd).toBeGreaterThanOrEqual(bd * minShare);
    }
    for (const s of def.seats ?? []) {
      expect(s.x).toBeGreaterThanOrEqual(b.min[0] - 0.05);
      expect(s.x).toBeLessThanOrEqual(b.max[0] + 0.05);
      expect(s.y).toBeGreaterThanOrEqual(b.min[1] - 0.05);
      expect(s.y).toBeLessThanOrEqual(b.max[1] + 0.05);
      expect(s.z).toBeGreaterThanOrEqual(b.min[2] - 0.05);
      expect(s.z).toBeLessThanOrEqual(b.max[2] + 0.05);
    }
  });
});

describe('parametric builders', () => {
  it('stall clamps width and returns usable spots', () => {
    for (const width of [1.2, 1.8, 3, 4, 6]) {
      const s = stall({ width, awning: 'scallop', goods: ['fish', 'oranges'] });
      expect(s.footprint[0]).toBeGreaterThanOrEqual(1.8);
      expect(s.footprint[0]).toBeLessThanOrEqual(4.1);
      expect(s.customerSpots.length).toBeGreaterThanOrEqual(2);
      expect(s.customerSpots.every((c) => c.z > s.footprint[1] / 2)).toBe(true);
      expect(Math.abs(s.vendorSpot.z)).toBeLessThan(s.footprint[1] / 2);
      expect(triangleCount(selectLod(s.geo, 'near'))).toBeLessThanOrEqual(1200);
      expect(triangleCount(selectLod(s.geo, 'far'))).toBeLessThanOrEqual(350);
    }
  });

  const a = [-3, 2.6, 1] as const;
  const b = [4, 3.1, -2] as const;
  const near = (p: readonly number[], q: readonly number[]): boolean =>
    Math.hypot((p[0] ?? 0) - (q[0] ?? 0), (p[1] ?? 0) - (q[1] ?? 0), (p[2] ?? 0) - (q[2] ?? 0)) < 1e-6;

  it.each([
    ['bunting', bunting(a, b)],
    ['laundryLine', laundryLine(a, b)],
    ['stringLights', stringLights(a, b)],
  ] as const)('%s ends on its anchor points and sags below the chord', (_name, line) => {
    const first = line.curve[0];
    const last = line.curve[line.curve.length - 1];
    expect(first && near(first, a)).toBe(true);
    expect(last && near(last, b)).toBe(true);
    const mid = line.curve[Math.floor(line.curve.length / 2)];
    expect(mid).toBeDefined();
    if (mid) expect(mid[1]).toBeLessThan((a[1] + b[1]) / 2 - 0.05);
    const g = bounds(line.geo);
    for (const p of [a, b]) {
      for (let k = 0; k < 3; k++) {
        expect(p[k]).toBeGreaterThanOrEqual((g.min[k] ?? 0) - 0.05);
        expect(p[k]).toBeLessThanOrEqual((g.max[k] ?? 0) + 0.05);
      }
    }
    expect(g.min[1]).toBeLessThan(Math.min(a[1], b[1]));
  });
});
