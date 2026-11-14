import { describe, expect, it } from 'vitest';
import { districtReport } from '../helpers/townReport';

const SEEDS = ['festival-001', 'funfair-b', 'refresh-7f3a', 'seed-42'];

describe.each(SEEDS)('funfair district (seed %s)', (seed) => {
  const r = districtReport('funfair', seed);
  it('builds without unknown props, clips or options', () => {
    expect(r.warnings).toEqual([]);
  });
  it('is densely populated with riders, staged stories and fair target spots', () => {
    expect(r.people).toBeGreaterThanOrEqual(800);
    expect(r.people).toBeLessThanOrEqual(1300);
    expect(r.movers).toBeGreaterThan(80);
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
  it('stays within the static triangle budget', () => {
    expect(r.trianglesNear).toBeLessThanOrEqual(450_000);
    expect(r.trianglesFar).toBeLessThanOrEqual(140_000);
  });
});

describe('funfair report', () => {
  it('prints the headline numbers', () => {
    const r = districtReport('funfair');
    const line = `people=${r.people} movers=${r.movers} vignettes=${r.vignettes} spots=${r.targetSpots} clips=${r.clipsUsed.length} tri=${r.trianglesNear}/${r.trianglesFar} inside=${r.insideBlocks} overlaps=${r.overlaps} ms=${Math.round(r.buildMs)}`;
    expect(line).toContain('people=');
    process.stdout.write(`${line}\n`);
  });
});
