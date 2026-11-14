import { describe, expect, it } from 'vitest';
import { ACTIVE_CLIPS, ACTIVE_FAMILIES, ACTIVE_GROUPS, ACTIVE_SEATED } from '../../src/crowd/clips/active/index';
import { POSE_ROW_FLOATS, bakeClip } from '../../src/crowd/pose';
import type { ClipDef } from '../../src/crowd/pose';
import { PoseCol } from '../../src/crowd/skeleton';

const D2R = Math.PI / 180;
const baked = ACTIVE_CLIPS.map((c) => ({ def: c, bake: bakeClip(c) }));
const byId = new Map<string, ClipDef>(ACTIVE_CLIPS.map((c) => [c.id, c]));

const channel = (data: Float32Array, row: number, col: number, k: number): number =>
  data[row * POSE_ROW_FLOATS + col * 4 + k] ?? Number.NaN;

describe('active clip library', () => {
  it('has at least 85 clips with unique dotted ids', () => {
    expect(ACTIVE_CLIPS.length).toBeGreaterThanOrEqual(85);
    const ids = ACTIVE_CLIPS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z]+\.[a-z0-9-]+$/));
  });

  it('bakes every clip to finite values', () => {
    baked.forEach(({ def, bake }) => {
      expect(bake.rows, def.id).toBeGreaterThan(0);
      expect(bake.data.every((v) => Number.isFinite(v)), def.id).toBe(true);
      expect(def.duration, def.id).toBeGreaterThan(0);
    });
  });

  it('has ascending keys in [0, 1)', () => {
    ACTIVE_CLIPS.forEach((c) => {
      c.keys.forEach((k, i) => {
        expect(k.t, c.id).toBeGreaterThanOrEqual(0);
        expect(k.t, c.id).toBeLessThan(1);
        if (i > 0) expect(k.t, c.id).toBeGreaterThan(c.keys[i - 1]?.t ?? -1);
      });
    });
  });

  it('keeps elbow and knee bends within 0..150 degrees', () => {
    const lo = -0.5 * D2R;
    const hi = 150.5 * D2R;
    const joints = [PoseCol.ArmL, PoseCol.ArmR, PoseCol.LegL, PoseCol.LegR];
    baked.forEach(({ def, bake }) => {
      for (let r = 0; r < bake.rows; r++) {
        joints.forEach((col) => {
          const bend = channel(bake.data, r, col, 3);
          expect(bend, `${def.id} row ${r} col ${col}`).toBeGreaterThanOrEqual(lo);
          expect(bend, `${def.id} row ${r} col ${col}`).toBeLessThanOrEqual(hi);
        });
      }
    });
  });

  it('gives locomotion clips a stride of 0.4..3 m', () => {
    const loco = ACTIVE_CLIPS.filter((c) => c.stride !== undefined);
    expect(loco.length).toBeGreaterThanOrEqual(15);
    loco.forEach((c) => {
      expect(c.stride, c.id).toBeGreaterThanOrEqual(0.4);
      expect(c.stride, c.id).toBeLessThanOrEqual(3);
    });
  });

  it('lists only existing ids in families and covers enough activities', () => {
    const families = Object.entries(ACTIVE_FAMILIES);
    expect(families.length).toBeGreaterThanOrEqual(45);
    families.forEach(([name, ids]) => {
      expect(ids.length, name).toBeGreaterThan(0);
      ids.forEach((id) => {
        expect(byId.has(id), id).toBe(true);
        expect(id.startsWith(`${name}.`), id).toBe(true);
      });
    });
    const covered = new Set(families.flatMap(([, ids]) => ids));
    expect(covered.size).toBe(ACTIVE_CLIPS.length);
  });

  it('groups activities into at least 8 themes that reference real families', () => {
    const groups = Object.entries(ACTIVE_GROUPS);
    expect(groups.length).toBeGreaterThanOrEqual(8);
    const grouped = new Set(groups.flatMap(([, fams]) => fams));
    grouped.forEach((f) => expect(ACTIVE_FAMILIES[f], f).toBeDefined());
    Object.keys(ACTIVE_FAMILIES).forEach((f) => expect(grouped.has(f), f).toBe(true));
  });

  it('loops continuously: the last baked row is close to the first relative to motion range', () => {
    const sample = baked.filter((_, i) => i % 3 === 0 && _.bake.rows > 2);
    expect(sample.length).toBeGreaterThan(20);
    sample.forEach(({ def, bake }) => {
      for (let c = 0; c < POSE_ROW_FLOATS; c++) {
        let min = Infinity;
        let max = -Infinity;
        for (let r = 0; r < bake.rows; r++) {
          const v = bake.data[r * POSE_ROW_FLOATS + c] ?? 0;
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
        const first = bake.data[c] ?? 0;
        const last = bake.data[(bake.rows - 1) * POSE_ROW_FLOATS + c] ?? 0;
        expect(Math.abs(last - first), `${def.id} channel ${c}`).toBeLessThanOrEqual((max - min) * 0.6 + 1e-4);
      }
    });
  });

  it('lowers the hips of seated clips', () => {
    expect(ACTIVE_SEATED.length).toBeGreaterThanOrEqual(15);
    ACTIVE_SEATED.forEach((id) => {
      const def = byId.get(id);
      expect(def, id).toBeDefined();
      if (!def) return;
      const bake = bakeClip(def);
      for (let r = 0; r < bake.rows; r++) {
        expect(channel(bake.data, r, PoseCol.RootPos, 1), `${id} row ${r}`).toBeLessThanOrEqual(-0.3);
      }
    });
  });

  it('keeps standing clips roughly on the ground', () => {
    const exempt = new Set([...ACTIVE_SEATED]);
    ACTIVE_CLIPS.filter((c) => !exempt.has(c.id) && !c.id.startsWith('swim.') && !c.id.startsWith('surf.')).forEach((c) => {
      const bake = bakeClip(c);
      for (let r = 0; r < bake.rows; r++) {
        const y = channel(bake.data, r, PoseCol.RootPos, 1);
        expect(y, c.id).toBeGreaterThan(-0.8);
        expect(y, c.id).toBeLessThan(0.4);
      }
    });
  });
});
