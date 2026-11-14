import { describe, expect, it } from 'vitest';
import { C, HAIR_TONES, SKIN_TONES } from '../../src/core/palette';
import { BASE_CLIPS } from '../../src/crowd/clips/base';
import { bakeClip } from '../../src/crowd/pose';
import { MotionStore, PaletteStore } from '../../src/crowd/stores';

describe('crowd data stores', () => {
  it('resolves every hair and skin tone to its own colour, including tones shared with palette tokens', () => {
    const palette = new PaletteStore();
    const data = palette.texture().image.data as Float32Array;
    const rgbAt = (slot: number): number[] => [data[slot * 4] as number, data[slot * 4 + 1] as number, data[slot * 4 + 2] as number];
    HAIR_TONES.forEach((tone, i) => {
      const got = rgbAt(palette.hair(i));
      tone.forEach((v, k) => expect(got[k]).toBeCloseTo(v, 6));
    });
    SKIN_TONES.forEach((tone, i) => {
      const got = rgbAt(palette.skin(i));
      tone.forEach((v, k) => expect(got[k]).toBeCloseTo(v, 6));
    });
    const coral = rgbAt(palette.index('coral'));
    C.coral.forEach((v, k) => expect(coral[k]).toBeCloseTo(v, 6));
    expect(palette.index('coral')).toBe(palette.index(C.coral));
  });

  it('refuses motion or route additions after the textures were finalised', () => {
    const store = new MotionStore();
    const route = store.addLoop([[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]]);
    store.route(route, 0, 1);
    store.textures();
    expect(() => store.addLoop([[0, 0, 0], [1, 0, 0]])).toThrow(/finalised/);
    expect(() => store.spin([0, 0, 0], 1)).toThrow(/finalised/);
  });

  it('reports route positions that stay on the loop and advance with time', () => {
    const store = new MotionStore();
    const route = store.addLoop([[0, 0, 0], [20, 0, 0], [20, 0, 20], [0, 0, 20]]);
    const id = store.route(route, 0, 2);
    const a = new Float32Array(3);
    const c = new Float32Array(3);
    expect(store.routePosition(id, 0, a)).toBe(true);
    expect(store.routePosition(id, 1, c)).toBe(true);
    expect(Math.hypot((c[0] as number) - (a[0] as number), (c[2] as number) - (a[2] as number))).toBeGreaterThan(1.2);
    for (let t = 0; t < 60; t += 3.7) {
      store.routePosition(id, t, a);
      expect(a[0]).toBeGreaterThan(-3);
      expect(a[0]).toBeLessThan(23);
      expect(a[2]).toBeGreaterThan(-3);
      expect(a[2]).toBeLessThan(23);
    }
    store.routePosition(id, route.length / 2, a);
    store.routePosition(id, route.length / 2 + route.length / 2, c);
    expect(c[0]).toBeCloseTo(a[0] as number, 3);
    expect(store.routePosition(store.spin([0, 0, 0], 1), 0, a)).toBe(false);
  });

  it('bakes clips into loops whose last row leads back to the first', () => {
    for (const def of BASE_CLIPS) {
      const baked = bakeClip(def);
      expect(baked.rows).toBeGreaterThanOrEqual(1);
      for (const v of baked.data) expect(Number.isFinite(v)).toBe(true);
      if (baked.rows < 4) continue;
      const width = baked.data.length / baked.rows;
      let range = 0;
      let seam = 0;
      for (let cIdx = 0; cIdx < width; cIdx++) {
        let lo = Infinity;
        let hi = -Infinity;
        for (let r = 0; r < baked.rows; r++) {
          const v = baked.data[r * width + cIdx] as number;
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
        range = Math.max(range, hi - lo);
        seam = Math.max(seam, Math.abs((baked.data[(baked.rows - 1) * width + cIdx] as number) - (baked.data[cIdx] as number)));
      }
      expect(seam, def.id).toBeLessThanOrEqual(range * 0.6 + 1e-6);
    }
  });
});
