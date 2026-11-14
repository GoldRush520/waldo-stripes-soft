import { describe, expect, it } from 'vitest';
import { districtReport } from '../helpers/townReport';

describe('market district', () => {
  const r = districtReport('market');
  it('builds without unknown props, clips or options', () => {
    expect(r.warnings).toEqual([]);
  });
  it('is densely populated with staged stories and fair target spots', () => {
    expect(r.people).toBeGreaterThan(380);
    expect(r.vignettes).toBeGreaterThanOrEqual(5);
    expect(r.targetSpots).toBeGreaterThanOrEqual(4);
  });
  it('keeps people out of solid footprints, apart from each other and on supported ground', () => {
    expect(r.insideBlocks).toBeLessThanOrEqual(2);
    expect(r.overlaps).toBeLessThanOrEqual(4);
    expect(r.unsupported).toBe(0);
    expect(r.strays).toBe(0);
  });
});
