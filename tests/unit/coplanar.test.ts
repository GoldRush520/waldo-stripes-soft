import { describe, expect, it } from 'vitest';
import { SEPARATION_STEP, separateCoplanar } from '../../src/core/coplanar';
import { type Geo, box, merge, translate } from '../../src/core/geo';

/** z of every vertex of the faces pointing along +z, rounded to a tenth of a millimetre */
function frontPlanes(g: Geo): number[] {
  const out = new Set<number>();
  for (let i = 0; i < g.pos.length / 3; i++) {
    if ((g.nor[i * 3 + 2] as number) > 0.9) out.add(Math.round((g.pos[i * 3 + 2] as number) * 1e4) / 1e4);
  }
  return [...out].sort((a, b) => a - b);
}

describe('separateCoplanar', () => {
  it('returns the same mesh when no faces fight', () => {
    const g = merge([box(2, 2, 0.2, 'ivory'), translate(box(0.5, 0.5, 0.2, 'coral'), 3, 0, 0)]);
    expect(separateCoplanar(g)).toBe(g);
  });

  it('moves the smaller of two flush faces out along its normal', () => {
    const wall = box(2, 2, 0.2, 'ivory');
    const panel = translate(box(0.5, 0.5, 0.2, 'coral'), 0, 0.5, 0);
    const g = merge([wall, panel]);
    expect(frontPlanes(g)).toEqual([0.1]);
    const out = separateCoplanar(g);
    expect(out).not.toBe(g);
    expect(frontPlanes(out)).toEqual([0.1, Math.round((0.1 + SEPARATION_STEP) * 1e4) / 1e4]);
    /* the input is untouched and nothing but positions changed */
    expect(frontPlanes(g)).toEqual([0.1]);
    expect(out.idx).toBe(g.idx);
    expect(out.col).toBe(g.col);
  });

  it('stacks nested details one step apart', () => {
    const g = merge([
      box(2, 2, 0.2, 'ivory'),
      translate(box(1, 1, 0.2, 'coral'), 0, 0.4, 0),
      translate(box(0.4, 0.4, 0.2, 'blue'), 0, 0.7, 0),
    ]);
    const planes = frontPlanes(separateCoplanar(g));
    expect(planes).toHaveLength(3);
    expect(planes[1]! - planes[0]!).toBeCloseTo(SEPARATION_STEP, 5);
    expect(planes[2]! - planes[1]!).toBeCloseTo(SEPARATION_STEP, 5);
  });

  it('leaves abutting faces in one plane alone', () => {
    const g = merge([box(1, 1, 0.2, 'ivory'), translate(box(1, 1, 0.2, 'coral'), 1, 0, 0)]);
    expect(frontPlanes(separateCoplanar(g))).toEqual([0.1]);
  });

  it('is stable: a separated mesh needs no further change', () => {
    const g = merge([box(2, 2, 0.2, 'ivory'), translate(box(0.5, 0.5, 0.2, 'coral'), 0, 0.5, 0)]);
    const once = separateCoplanar(g);
    expect(separateCoplanar(once)).toBe(once);
  });
});
