import { describe, expect, it } from 'vitest';
import { ACTIVE_CLIPS } from '../../src/crowd/clips/active/index';
import { BASE_CLIPS } from '../../src/crowd/clips/base';
import { EVERYDAY_CLIPS } from '../../src/crowd/clips/everyday/index';
import { districtReport } from '../helpers/townReport';

/** distinct clips registered right now (the clip libraries land independently) */
const AVAILABLE = new Set([...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS].map((c) => c.id)).size;
const SEEDS = ['festival-001', 'canal-seed-2', 'canal-seed-3'];

describe.each(SEEDS)('canal district (seed %s)', (seed) => {
  const r = districtReport('canal', seed);
  it('builds without unknown props, clips or options', () => {
    expect(r.warnings).toEqual([]);
  });
  it('is densely populated (>= 2.2x the 230 brief) with staged stories and fair target spots', () => {
    expect(r.people).toBeGreaterThanOrEqual(506);
    expect(r.people).toBeLessThanOrEqual(700);
    expect(r.vignettes).toBeGreaterThanOrEqual(10);
    expect(r.targetSpots).toBeGreaterThanOrEqual(10);
    expect(r.clipsUsed.length).toBeGreaterThanOrEqual(Math.min(12, AVAILABLE));
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
