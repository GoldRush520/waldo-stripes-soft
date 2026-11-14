import { describe, expect, it } from 'vitest';
import { districtReport } from '../helpers/townReport';

const SEEDS = ['festival-001', 'rooftops-a', 'rooftops-b'];

describe.each(SEEDS)('rooftops district (seed %s)', (seed) => {
  const r = districtReport('rooftops', seed);
  it('builds without unknown props, clips or options', () => {
    expect(r.warnings).toEqual([]);
  });
  it('is densely populated with staged stories and fair target spots', () => {
    expect(r.people).toBeGreaterThanOrEqual(550);
    expect(r.vignettes).toBeGreaterThanOrEqual(10);
    expect(r.targetSpots).toBeGreaterThanOrEqual(10);
    expect(r.clipsUsed.length).toBeGreaterThanOrEqual(12);
  });
  it('keeps walkers a minority', () => {
    expect(r.movers / r.people).toBeLessThanOrEqual(0.35);
  });
  it('keeps people out of solid footprints, apart from each other and on supported ground', () => {
    expect(r.insideBlocks).toBeLessThanOrEqual(3);
    expect(r.overlaps).toBeLessThanOrEqual(6);
    expect(r.unsupported).toBe(0);
    expect(r.strays).toBe(0);
  });
  it('stays within the static triangle budget', () => {
    console.info(`rooftops@${seed}: people ${r.people} movers ${r.movers} vignettes ${r.vignettes} spots ${r.targetSpots} clips ${r.clipsUsed.length} near ${r.trianglesNear} far ${r.trianglesFar} build ${Math.round(r.buildMs)}ms`);
    expect(r.trianglesNear).toBeLessThanOrEqual(450_000);
    expect(r.trianglesFar).toBeLessThanOrEqual(140_000);
  });
});
