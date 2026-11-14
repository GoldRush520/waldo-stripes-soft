import { describe, expect, it } from 'vitest';
import { districtReport } from '../helpers/townReport';

const SEEDS = ['festival-001', 'beach-seed-2', 'tide-77'] as const;

describe.each(SEEDS)('beach district (seed %s)', (seed) => {
  const r = districtReport('beach', seed);
  it('builds without unknown props, clips or options', () => {
    expect(r.warnings).toEqual([]);
  });
  it('is densely populated with staged stories and fair target spots', () => {
    expect(r.people).toBeGreaterThanOrEqual(726);
    expect(r.people).toBeLessThanOrEqual(1150);
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
