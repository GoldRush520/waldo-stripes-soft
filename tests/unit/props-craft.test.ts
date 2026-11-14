import { describe, expect, it } from 'vitest';
import { type Geo, bounds, selectLod, triangleCount } from '../../src/core/geo';
import {
  PROPS,
  TIGHTROPE_HEIGHT,
  basketStack,
  danceFloor,
  giantLetters,
  ladder,
  luggageAvalanche,
  luggageTower,
  paintSplatter,
  stepLadder,
  timberStack,
  tightropeRig,
} from '../../src/props/craft/index';
import { BUDGETS, type Budget } from '../../src/props/craft/kit';

/** Explicit min-y exceptions per family (none needed: every craft prop rests on y = 0). */
const MIN_Y_EXCEPTIONS: Readonly<Record<string, readonly [number, number]>> = {};
/** Props whose solid footprint is deliberately much smaller than their bounds (overhanging parts). */
const OVERHANG_TAG = 'overhang';

const built = PROPS.map((def) => ({ def, geo: def.build() }));

function budgetOf(tags: readonly string[] | undefined): Budget {
  const tag = (tags ?? []).find((t) => t.startsWith('budget:'));
  const name = tag?.slice('budget:'.length);
  if (name && name in BUDGETS) return name as Budget;
  throw new Error(`missing budget tag in ${String(tags)}`);
}

function checkFinite(geo: Geo): string | null {
  for (let i = 0; i < geo.pos.length; i++) {
    if (!Number.isFinite(geo.pos[i] as number)) return `non-finite position at ${i}`;
  }
  for (let i = 0; i < geo.nor.length; i += 3) {
    const len = Math.hypot(geo.nor[i] as number, geo.nor[i + 1] as number, geo.nor[i + 2] as number);
    if (!(Math.abs(len - 1) < 0.02)) return `normal ${i / 3} has length ${len}`;
  }
  for (let i = 0; i < geo.idx.length; i++) {
    if ((geo.idx[i] as number) >= geo.pos.length / 3) return `index ${i} out of range`;
  }
  return null;
}

describe('craft prop library', () => {
  it('registers at least 110 unique dotted keys', () => {
    const keys = PROPS.map((p) => p.key);
    expect(keys.length).toBeGreaterThanOrEqual(110);
    expect(new Set(keys).size).toBe(keys.length);
    keys.forEach((k) => expect(k).toMatch(/^[a-z]+(\.[a-zA-Z0-9]+)+$/));
  });

  it('builds every prop with finite positions and unit normals', () => {
    const bad = built.map(({ def, geo }) => [def.key, checkFinite(geo)] as const).filter(([, e]) => e !== null);
    expect(bad).toEqual([]);
  });

  it('rests every prop on the ground and centres it', () => {
    const bad: string[] = [];
    for (const { def, geo } of built) {
      const b = bounds(geo);
      const [lo, hi] = MIN_Y_EXCEPTIONS[def.key] ?? [-0.05, 0.05];
      if (b.min[1] < lo || b.min[1] > hi) bad.push(`${def.key} minY=${b.min[1].toFixed(3)}`);
      const cx = (b.min[0] + b.max[0]) / 2;
      const cz = (b.min[2] + b.max[2]) / 2;
      const span = Math.max(b.max[0] - b.min[0], b.max[2] - b.min[2]);
      if (Math.abs(cx) > 0.3 * span + 0.15 || Math.abs(cz) > 0.3 * span + 0.15) {
        bad.push(`${def.key} off-centre (${cx.toFixed(2)}, ${cz.toFixed(2)})`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('keeps full and far tiers inside the contract budgets', () => {
    const bad: string[] = [];
    for (const { def, geo } of built) {
      const budget = BUDGETS[budgetOf(def.tags)];
      const full = triangleCount(selectLod(geo, 'near'));
      const far = triangleCount(selectLod(geo, 'far'));
      if (full > budget.full) bad.push(`${def.key} full ${full} > ${budget.full}`);
      if (far > budget.far) bad.push(`${def.key} far ${far} > ${budget.far}`);
      if (far > 0.35 * full) bad.push(`${def.key} far ${far} > 35% of ${full}`);
      if (far === 0) bad.push(`${def.key} has an empty far tier`);
    }
    expect(bad).toEqual([]);
  });

  it('keeps the tower crane inside the landmark budget', () => {
    const crane = built.find((b) => b.def.key === 'craft.towerCrane');
    expect(crane).toBeDefined();
    if (!crane) return;
    expect(triangleCount(selectLod(crane.geo, 'near'))).toBeLessThanOrEqual(4000);
    expect(triangleCount(selectLod(crane.geo, 'far'))).toBeLessThanOrEqual(1200);
    expect(bounds(crane.geo).max[1]).toBeGreaterThan(21);
  });

  it('places seats inside the prop bounds with a seat tag', () => {
    const bad: string[] = [];
    for (const { def, geo } of built) {
      if (!def.seats) continue;
      const b = bounds(geo);
      const tagged = (def.tags ?? []).some((t) => t === 'seat:hip' || t === 'seat:feet');
      if (!tagged) bad.push(`${def.key} seat tag missing`);
      def.seats.forEach((s, i) => {
        const inside =
          s.x >= b.min[0] - 0.05 && s.x <= b.max[0] + 0.05 &&
          s.y >= b.min[1] && s.y <= b.max[1] + 0.05 &&
          s.z >= b.min[2] - 0.05 && s.z <= b.max[2] + 0.05;
        if (!inside || !Number.isFinite(s.heading)) bad.push(`${def.key} seat ${i}`);
      });
    }
    expect(bad).toEqual([]);
  });

  it('declares footprints that roughly match the bounds', () => {
    const bad: string[] = [];
    for (const { def, geo } of built) {
      const b = bounds(geo);
      const w = b.max[0] - b.min[0];
      const d = b.max[2] - b.min[2];
      const [fw, fd] = def.footprint;
      if (fw === 0 && fd === 0) continue;
      if (fw > w * 1.1 + 0.1 || fd > d * 1.1 + 0.1) bad.push(`${def.key} footprint larger than bounds`);
      const overhang = (def.tags ?? []).includes(OVERHANG_TAG);
      if (!overhang && (fw < w * 0.5 - 0.15 || fd < d * 0.5 - 0.15)) {
        bad.push(`${def.key} footprint ${fw}x${fd} vs bounds ${w.toFixed(2)}x${d.toFixed(2)}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('uses tint masks only with a default tint available', () => {
    const bad: string[] = [];
    for (const { def, geo } of built) {
      let tinted = false;
      for (let i = 0; i < geo.fx.length; i += 2) if ((geo.fx[i] as number) > 0) tinted = true;
      if (tinted && def.defaultTint === undefined) bad.push(def.key);
    }
    expect(bad).toEqual([]);
  });
});

describe('craft parametric builders', () => {
  const same = (a: Geo, b: Geo): boolean =>
    a.pos.length === b.pos.length && a.pos.every((v, i) => v === b.pos[i]) && a.col.every((v, i) => v === b.col[i]);

  it('are deterministic for a given seed', () => {
    expect(same(timberStack(7, 'logs'), timberStack(7, 'logs'))).toBe(true);
    expect(same(luggageTower(9, 3), luggageTower(9, 3))).toBe(true);
    expect(same(luggageAvalanche(12, 5), luggageAvalanche(12, 5))).toBe(true);
    expect(same(basketStack(4), basketStack(4))).toBe(true);
    expect(same(paintSplatter(2, 11), paintSplatter(2, 11))).toBe(true);
    expect(same(luggageTower(9, 3), luggageTower(9, 4))).toBe(false);
  });

  it('scale ladders with their rung count', () => {
    const h5 = bounds(ladder(5)).max[1];
    const h9 = bounds(ladder(9)).max[1];
    expect(h9).toBeGreaterThan(h5 + 0.9);
    expect(Math.abs(bounds(stepLadder(4)).min[1])).toBeLessThan(0.02);
  });

  it('builds a 9-piece leaning luggage tower and a 4 m avalanche', () => {
    const tower = bounds(luggageTower(9, 1));
    expect(tower.max[1]).toBeGreaterThan(1.8);
    const av = bounds(luggageAvalanche(12, 1));
    expect(av.max[0] - av.min[0]).toBeGreaterThan(3.4);
    expect(av.max[0] - av.min[0]).toBeLessThan(4.8);
  });

  it('reports the tightrope height and spans the rope', () => {
    const rig = tightropeRig(8);
    expect(rig.ropeHeight).toBe(TIGHTROPE_HEIGHT);
    const b = bounds(rig.geo);
    expect(b.max[0] - b.min[0]).toBeGreaterThan(8);
    expect(b.max[1]).toBeGreaterThan(rig.ropeHeight);
  });

  it('builds dance floors and giant letters on the ground', () => {
    expect(bounds(danceFloor(6, 0.6)).min[1]).toBeCloseTo(0, 3);
    expect(bounds(danceFloor(6, 0.6)).max[1]).toBeLessThan(0.05);
    expect(bounds(giantLetters('FAIR')).min[1]).toBeGreaterThan(-0.05);
  });
});
