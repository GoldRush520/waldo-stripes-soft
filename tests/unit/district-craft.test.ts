import { describe, expect, it } from 'vitest';
import { districtReport } from '../helpers/townReport';

const SEEDS = ['festival-001', 'craft-seed-7', 'refresh-42'] as const;

describe.each(SEEDS)('craft district (seed %s)', (seed) => {
  const r = districtReport('craft', seed);
  it('builds without unknown props, clips or options', () => {
    expect(r.warnings).toEqual([]);
  });
  it('is densely populated with staged stories and fair target spots', () => {
    expect(r.people).toBeGreaterThanOrEqual(550);
    expect(r.people).toBeLessThanOrEqual(720);
    expect(r.movers / r.people).toBeLessThanOrEqual(0.35);
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
  it('stays inside the triangle budget', () => {
    expect(r.trianglesNear).toBeLessThanOrEqual(450_000);
    expect(r.trianglesFar).toBeLessThanOrEqual(140_000);
  });
});

it('reports the craft district build', () => {
  const r = districtReport('craft');
  expect(r.vignetteIds.length).toBeGreaterThanOrEqual(10);
  process.stdout.write(`craft: people ${r.people} movers ${r.movers} tris ${r.trianglesNear}/${r.trianglesFar} spots ${r.targetSpots} clips ${r.clipsUsed.length} inside ${r.insideBlocks} overlaps ${r.overlaps} ms ${r.buildMs.toFixed(0)}\n`);
});
