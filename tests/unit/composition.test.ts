import { describe, expect, it } from 'vitest';
import { VIEW_ELEVATION, basePpm, clampView, footprint, projectPoint, screenHeight, southLimit } from '../../src/game/composition';
import { WORLD } from '../../src/world/layout';

const view = (x: number, z: number, w: number, h: number, azimuth = -0.38) => ({ x, z, azimuth, elevation: VIEW_ELEVATION, ppm: basePpm(w, h) });

describe('screen composition', () => {
  it('uses a readable fixed scale that depends only on the viewport, not on the town size', () => {
    expect(basePpm(1440, 900)).toBe(34);
    expect(basePpm(2560, 1440)).toBe(34);
    expect(basePpm(390, 844)).toBeGreaterThanOrEqual(26);
    expect(basePpm(390, 844)).toBeLessThan(34);
    expect(screenHeight(34, 1.7)).toBeGreaterThan(40);
  });

  it('projects the view centre to the middle of the canvas and height straight up', () => {
    const v = view(10, -20, 1440, 900);
    const c = projectPoint(v, 1440, 900, 10, 0, -20);
    expect(c.x).toBeCloseTo(720, 6);
    expect(c.y).toBeCloseTo(450, 6);
    const head = projectPoint(v, 1440, 900, 10, 1.7, -20);
    expect(head.x).toBeCloseTo(720, 6);
    expect(c.y - head.y).toBeCloseTo(screenHeight(v.ppm, 1.7), 6);
  });

  it('maps every footprint corner to a canvas corner (plus overscan)', () => {
    const v = view(0, 0, 1200, 800, -0.6);
    const f = footprint(v, 1200, 800, 0);
    const px = f.corners.map(([x, z]) => projectPoint(v, 1200, 800, x, 0, z));
    expect(Math.min(...px.map((p) => p.x))).toBeCloseTo(0, 4);
    expect(Math.max(...px.map((p) => p.x))).toBeCloseTo(1200, 4);
    expect(Math.min(...px.map((p) => p.y))).toBeCloseTo(0, 4);
    expect(Math.max(...px.map((p) => p.y))).toBeCloseTo(800, 4);
  });

  it('clamps any requested view so the whole viewport stays over generated world', () => {
    const sizes: Array<[number, number]> = [[1440, 900], [390, 844], [844, 390], [2560, 1440], [3440, 1440]];
    for (const [w, h] of sizes) {
      for (const [x, z] of [[-500, -500], [500, 500], [0, 400], [-135, 60], [135, -100], [20, 0]] as const) {
        for (const az of [-0.68, -0.38, -0.08]) {
          const v = clampView(view(x, z, w, h, az), w, h);
          const f = footprint(v, w, h);
          expect(f.minX, `${w}x${h} minX`).toBeGreaterThanOrEqual(WORLD.minX);
          expect(f.maxX, `${w}x${h} maxX`).toBeLessThanOrEqual(WORLD.maxX);
          expect(f.minZ, `${w}x${h} minZ`).toBeGreaterThanOrEqual(WORLD.minZ);
          let south = Infinity;
          for (let i = 0; i <= 8; i++) south = Math.min(south, southLimit(f.minX + ((f.maxX - f.minX) * i) / 8));
          expect(f.maxZ, `${w}x${h} maxZ`).toBeLessThanOrEqual(south + 1e-6);
        }
      }
    }
  });

  it('leaves an already valid view untouched and is idempotent', () => {
    const v = view(20, -10, 1440, 900);
    const once = clampView(v, 1440, 900);
    expect(once).toEqual(v);
    const far = clampView(view(400, 300, 1440, 900), 1440, 900);
    expect(clampView(far, 1440, 900)).toEqual(far);
  });

  it('only tightens the scale when the viewport is larger than the world', () => {
    expect(clampView(view(0, 0, 1440, 900), 1440, 900).ppm).toBe(34);
    expect(clampView(view(0, 0, 12000, 8000), 12000, 8000).ppm).toBeGreaterThan(34);
  });
});
