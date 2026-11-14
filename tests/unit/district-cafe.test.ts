import { describe, expect, it } from 'vitest';
import { ACTIVE_CLIPS } from '../../src/crowd/clips/active/index';
import { BASE_CLIPS } from '../../src/crowd/clips/base';
import { EVERYDAY_CLIPS } from '../../src/crowd/clips/everyday/index';
import { districtReport } from '../helpers/townReport';

/* brief: ~360 people; fixed-camera density rule: >= 2.2x the brief, within budget */
const BRIEF = 360;
const REGISTERED_CLIPS = new Set([...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS].map((c) => c.id)).size;

describe.each(['festival-001', 'cafe-seed-2', 'cafe-seed-3'])('cafe district (seed %s)', (seed) => {
  const r = districtReport('cafe', seed);
  it('builds without unknown props, clips or options', () => {
    expect(r.warnings).toEqual([]);
  });
  it('is densely populated with staged stories and fair target spots', () => {
    expect(r.people).toBeGreaterThanOrEqual(Math.round(BRIEF * 2.2));
    expect(r.people).toBeLessThanOrEqual(Math.round(BRIEF * 2.9));
    expect(r.movers).toBeLessThanOrEqual(r.people * 0.35);
    expect(r.vignettes).toBeGreaterThanOrEqual(10);
    expect(r.targetSpots).toBeGreaterThanOrEqual(10);
    expect(r.clipsUsed.length).toBeGreaterThanOrEqual(Math.min(12, REGISTERED_CLIPS));
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
