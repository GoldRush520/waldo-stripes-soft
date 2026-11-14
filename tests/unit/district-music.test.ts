import { describe, expect, it } from 'vitest';
import { districtReport } from '../helpers/townReport';

const SEEDS = ['festival-001', 'music-a', 'music-b', 'refresh-7731'] as const;

describe.each(SEEDS)('music district (seed %s)', (seed) => {
  const r = districtReport('music', seed);
  it('reports its build', () => {
    process.stdout.write(
      `music@${seed}: people ${r.people} movers ${r.movers} vignettes ${r.vignettes} clips ${r.clipsUsed.length} ` +
        `tris ${r.trianglesNear}/${r.trianglesFar} spots ${r.targetSpots} inside ${r.insideBlocks} overlaps ${r.overlaps} ` +
        `unsupported ${r.unsupported} strays ${r.strays} ${Math.round(r.buildMs)}ms\n`,
    );
    expect(r.people).toBeGreaterThan(0);
  });
  it('builds without unknown props, clips or options', () => {
    expect(r.warnings).toEqual([]);
  });
  it('is densely populated with staged stories, varied activity and fair target spots', () => {
    expect(r.people).toBeGreaterThanOrEqual(792);
    expect(r.people).toBeLessThanOrEqual(1000);
    expect(r.movers).toBeLessThanOrEqual(r.people * 0.35);
    expect(r.vignettes).toBeGreaterThanOrEqual(10);
    expect(r.targetSpots).toBeGreaterThanOrEqual(10);
    expect(r.clipsUsed.length).toBeGreaterThanOrEqual(12);
  });
  it('keeps people out of solid footprints, apart from each other and on supported ground', () => {
    expect(r.insideBlocks).toBeLessThanOrEqual(3);
    expect(r.overlaps).toBeLessThanOrEqual(6);
    expect(r.unsupported).toBe(0);
    expect(r.strays).toBe(0);
  });
  it('stays within the triangle budget', () => {
    expect(r.trianglesNear).toBeLessThanOrEqual(450_000);
    expect(r.trianglesFar).toBeLessThanOrEqual(140_000);
  });
});
