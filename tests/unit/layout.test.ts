import { describe, expect, it } from 'vitest';
import {
  CANAL_CENTER,
  CANAL_EAST,
  CANAL_WEST,
  CANAL_WIDTH,
  DISTRICTS,
  QUAY_Z,
  districtAt,
  isLand,
  isWater,
  pointInPolygon,
} from '../../src/world/layout';

describe('town layout', () => {
  it('puts the west bank west of the centreline and the east bank east of it', () => {
    CANAL_CENTER.forEach((c, i) => {
      expect(CANAL_WEST[i]![0]).toBeLessThan(c[0]);
      expect(CANAL_EAST[i]![0]).toBeGreaterThan(c[0]);
    });
  });

  it('keeps the canal centreline as water along its whole inland run', () => {
    for (let i = 1; i < CANAL_CENTER.length - 2; i++) {
      const a = CANAL_CENTER[i]!;
      const b = CANAL_CENTER[i + 1]!;
      for (let t = 0; t <= 1; t += 0.25) {
        const x = a[0] + (b[0] - a[0]) * t;
        const z = a[1] + (b[1] - a[1]) * t;
        if (z > QUAY_Z - 1 || z < -99) continue;
        expect(isLand(x, z), `centre ${x},${z}`).toBe(false);
        expect(isWater(x, z), `centre ${x},${z}`).toBe(true);
      }
    }
  });

  it('has dry land just outside both banks', () => {
    for (let i = 2; i < CANAL_CENTER.length - 2; i++) {
      const c = CANAL_CENTER[i]!;
      const reach = CANAL_WIDTH / 2 + 2.5;
      expect(isLand(c[0] - reach, c[1]), `west of ${c}`).toBe(true);
      expect(isLand(c[0] + reach, c[1]), `east of ${c}`).toBe(true);
    }
  });

  it('treats the harbour basin and open sea as water, and town squares as land', () => {
    expect(isWater(-80, 60)).toBe(true);
    expect(isWater(60, 90)).toBe(true);
    expect(isLand(-70, 8)).toBe(true);
    expect(isLand(34, -18)).toBe(true);
    expect(isLand(96, -9)).toBe(true);
  });

  it('defines twelve districts whose anchors resolve to themselves', () => {
    expect(DISTRICTS).toHaveLength(12);
    for (const d of DISTRICTS) {
      expect(pointInPolygon(d.anchor[0], d.anchor[1], d.polygon), d.id).toBe(true);
      expect(districtAt(d.anchor[0], d.anchor[1]).id).toBe(d.id);
    }
  });
});
