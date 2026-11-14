import { describe, expect, it } from 'vitest';
import { LIFT_LEVELS, LiftAllocator, placedBounds } from '../../src/world/depthSeparation';

const unit = { min: [-0.5, 0, -0.5], max: [0.5, 1, 0.5] } as const;

describe('placedBounds', () => {
  it('scales, rotates about y and translates', () => {
    const b = placedBounds({ min: [-1, 0, -2], max: [1, 3, 2] }, 10, 5, 20, Math.cos(Math.PI / 2), Math.sin(Math.PI / 2), 2);
    expect(b.minX).toBeCloseTo(6);
    expect(b.maxX).toBeCloseTo(14);
    expect(b.minZ).toBeCloseTo(18);
    expect(b.maxZ).toBeCloseTo(22);
    expect(b.minY).toBeCloseTo(5);
    expect(b.maxY).toBeCloseTo(11);
  });
});

describe('LiftAllocator', () => {
  it('leaves placements that touch nothing unmoved', () => {
    const lifts = new LiftAllocator();
    expect(lifts.assign(placedBounds(unit, 0, 0, 0, 1, 0, 1))).toBe(0);
    expect(lifts.assign(placedBounds(unit, 40, 0, 0, 1, 0, 1))).toBe(0);
  });

  it('gives touching placements different levels', () => {
    const lifts = new LiftAllocator();
    const table = lifts.assign(placedBounds(unit, 0, 0, 0, 1, 0, 1));
    const tray = lifts.assign(placedBounds(unit, 0, 1, 0, 1, 0, 0.3));
    const cup = lifts.assign(placedBounds(unit, 0, 1, 0, 1, 0, 0.1));
    expect(new Set([table, tray, cup]).size).toBe(3);
  });

  it('reuses low levels once neighbours are out of reach', () => {
    const lifts = new LiftAllocator();
    for (let i = 0; i < 50; i++) expect(lifts.assign(placedBounds(unit, i * 0.9, 0, 0, 1, 0, 1))).toBeLessThan(2);
  });

  it('separates a very large placement from everything inside it', () => {
    const lifts = new LiftAllocator();
    const small = lifts.assign(placedBounds(unit, 150, 0, 150, 1, 0, 1));
    const huge = lifts.assign(placedBounds({ min: [-200, 0, -200], max: [200, 1, 200] }, 0, 0, 0, 1, 0, 1));
    const later = lifts.assign(placedBounds(unit, -150, 0, -150, 1, 0, 1));
    expect(huge).not.toBe(small);
    expect(later).not.toBe(huge);
  });

  it('never returns a level outside the available range', () => {
    const lifts = new LiftAllocator();
    for (let i = 0; i < LIFT_LEVELS * 3; i++) {
      const level = lifts.assign(placedBounds(unit, 0, 0, 0, 1, 0, 1));
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThan(LIFT_LEVELS);
    }
  });
});
