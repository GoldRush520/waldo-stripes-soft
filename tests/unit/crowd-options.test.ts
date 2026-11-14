import { describe, expect, it } from 'vitest';
import { type Geo, selectLod, triangleCount } from '../../src/core/geo';
import { BASIC_OPTIONS } from '../../src/crowd/options/basic';
import { EXTRA_OPTION_LIST } from '../../src/crowd/options/extra';
import type { RigOption } from '../../src/crowd/rig';
import { Cat, Part, RIG } from '../../src/crowd/skeleton';

const FULL_BUDGET = 140;
const FAR_BUDGET = 45;
/** Pieces that extend further than this from their part pivot must declare `reach`. */
const LONG_EXTENT = 1.05;
const HEAD_RADIUS_LIMIT = 0.6;
const HAND_PARTS: ReadonlySet<number> = new Set([Part.HandL, Part.HandR]);

const PREFIX: Readonly<Record<number, readonly string[]>> = {
  [Cat.Hair]: ['hair.'],
  [Cat.Hat]: ['hat.'],
  [Cat.Face]: ['face.'],
  [Cat.Beard]: ['beard.'],
  [Cat.Lower]: ['lower.'],
  [Cat.Upper]: ['upper.'],
  [Cat.Back]: ['back.'],
  [Cat.Neck]: ['neck.'],
  [Cat.HandR]: ['hold.'],
  [Cat.HandL]: ['holdL.'],
  [Cat.Special]: ['carry.', 'wear.'],
};

function tris(o: RigOption, tier: 'near' | 'far'): number {
  return o.pieces.reduce((sum, p) => sum + triangleCount(selectLod(p.geo, tier)), 0);
}

function maxDist(g: Geo, c: readonly [number, number, number]): number {
  let m = 0;
  for (let i = 0; i < g.pos.length; i += 3) {
    const d = Math.hypot(
      (g.pos[i] as number) - c[0],
      (g.pos[i + 1] as number) - c[1],
      (g.pos[i + 2] as number) - c[2],
    );
    m = Math.max(m, d);
  }
  return m;
}

function geometryProblem(g: Geo): string | null {
  for (let i = 0; i < g.pos.length; i++) {
    if (!Number.isFinite(g.pos[i] as number)) return `non-finite position ${i}`;
  }
  for (let i = 0; i < g.nor.length; i += 3) {
    const len = Math.hypot(g.nor[i] as number, g.nor[i + 1] as number, g.nor[i + 2] as number);
    if (!(Math.abs(len - 1) < 0.01)) return `normal ${i / 3} length ${len}`;
  }
  for (let i = 0; i < g.idx.length; i++) {
    if ((g.idx[i] as number) >= g.pos.length / 3) return `index ${i} out of range`;
  }
  return null;
}

function collect(check: (o: RigOption) => string | null): string[] {
  return EXTRA_OPTION_LIST.map((o) => check(o)).filter((m): m is string => m !== null);
}

describe('extra crowd options', () => {
  it('registers at least 150 unique dotted keys that do not collide with the basic set', () => {
    const keys = EXTRA_OPTION_LIST.map((o) => o.key);
    const basic = new Set(BASIC_OPTIONS.map((o) => o.key));
    expect(keys.length).toBeGreaterThanOrEqual(150);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.filter((k) => basic.has(k))).toEqual([]);
    expect(keys.filter((k) => !/^[a-zA-Z]+(\.[a-zA-Z0-9]+)+$/.test(k))).toEqual([]);
  });

  it('uses key prefixes that match the option category', () => {
    const bad = collect((o) => {
      const prefixes = PREFIX[o.cat] ?? [];
      return prefixes.some((p) => o.key.startsWith(p)) ? null : `${o.key} (cat ${o.cat})`;
    });
    expect(bad).toEqual([]);
  });

  it('covers every category with the requested breadth', () => {
    const count = (cat: number): number => EXTRA_OPTION_LIST.filter((o) => o.cat === cat).length;
    expect(count(Cat.Hair)).toBeGreaterThanOrEqual(14);
    expect(count(Cat.Hat)).toBeGreaterThanOrEqual(22);
    expect(count(Cat.HandR) + count(Cat.HandL)).toBeGreaterThanOrEqual(70);
    expect(count(Cat.Special)).toBeGreaterThanOrEqual(20);
  });

  it('has finite positions, unit normals and valid indices', () => {
    const bad = collect((o) => {
      for (const p of o.pieces) {
        const problem = geometryProblem(p.geo);
        if (problem) return `${o.key}: ${problem}`;
      }
      return o.pieces.length > 0 ? null : `${o.key}: no pieces`;
    });
    expect(bad).toEqual([]);
  });

  it('keeps the full tier within budget', () => {
    const bad = collect((o) => {
      const t = tris(o, 'near');
      return t > 0 && t <= FULL_BUDGET ? null : `${o.key}: ${t}`;
    });
    expect(bad).toEqual([]);
  });

  it('keeps a non-empty far tier within budget unless near-only', () => {
    const bad = collect((o) => {
      if (o.nearOnly) return null;
      const t = tris(o, 'far');
      return t > 0 && t <= FAR_BUDGET ? null : `${o.key}: ${t}`;
    });
    expect(bad).toEqual([]);
  });

  it('keeps head pieces near the head', () => {
    const bad = collect((o) => {
      for (const p of o.pieces) {
        if (p.part !== Part.Head) continue;
        const d = maxDist(p.geo, [0, RIG.HEAD_CENTER_Y, 0]);
        if (d > HEAD_RADIUS_LIMIT) return `${o.key}: ${d.toFixed(2)}`;
      }
      return null;
    });
    expect(bad).toEqual([]);
  });

  it('keeps hand pieces within reach of the hand', () => {
    const bad = collect((o) => {
      for (const p of o.pieces) {
        if (!HAND_PARTS.has(p.part)) continue;
        const d = maxDist(p.geo, [0, 0, 0]);
        if (d > (o.reach ?? 0) + 1.2) return `${o.key}: ${d.toFixed(2)} > reach ${o.reach ?? 0} + 1.2`;
      }
      return null;
    });
    expect(bad).toEqual([]);
  });

  it('declares reach for long options', () => {
    const bad = collect((o) => {
      const d = Math.max(...o.pieces.map((p) => maxDist(p.geo, [0, 0, 0])));
      return d > LONG_EXTENT && o.reach === undefined ? `${o.key}: ${d.toFixed(2)}` : null;
    });
    expect(bad).toEqual([]);
  });
});
