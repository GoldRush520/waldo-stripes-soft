import { describe, expect, it } from 'vitest';
import { EVERYDAY_CLIPS, EVERYDAY_FAMILIES } from '../../src/crowd/clips/everyday';
import { POSE_ROW_FLOATS, bakeClip, type BakedClip, type ClipDef } from '../../src/crowd/pose';
import { PoseCol, RIG } from '../../src/crowd/skeleton';

const R2D = 180 / Math.PI;
type V3 = readonly [number, number, number];

const rx = (a: number, [x, y, z]: V3): V3 => [x, Math.cos(a) * y - Math.sin(a) * z, Math.sin(a) * y + Math.cos(a) * z];
const ry = (a: number, [x, y, z]: V3): V3 => [Math.cos(a) * x + Math.sin(a) * z, y, -Math.sin(a) * x + Math.cos(a) * z];
const rz = (a: number, [x, y, z]: V3): V3 => [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y, z];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const ch = (b: BakedClip, row: number, col: number, i: number): number => b.data[row * POSE_ROW_FLOATS + col * 4 + i] ?? NaN;

/** world height of the lowest sole point (heel or toe) of one leg, mirroring the vertex shader */
const soleY = (b: BakedClip, row: number, right: boolean): number => {
  const sg = right ? -1 : 1;
  const legCol = right ? PoseCol.LegR : PoseCol.LegL;
  const fwd = ch(b, row, legCol, 0);
  const out = ch(b, row, legCol, 1);
  const twist = ch(b, row, legCol, 2);
  const bend = ch(b, row, legCol, 3);
  const foot = ch(b, row, PoseCol.Feet, right ? 1 : 0);
  const pts: readonly V3[] = [
    [0, -RIG.ANKLE_H, -0.04],
    [0, -RIG.ANKLE_H, 0.13],
  ];
  return Math.min(
    ...pts.map((p0) => {
      let p = add(rx(foot, p0), [0, -RIG.SHIN, 0]);
      p = add(rx(bend, p), [0, -RIG.THIGH, 0]);
      p = add(rx(-fwd, rz(sg * out, ry(sg * twist, p))), [sg * RIG.HIP_X, RIG.HIP_Y, 0]);
      p = ry(ch(b, row, PoseCol.RootPos, 3), rx(ch(b, row, PoseCol.RootRot, 0), rz(-ch(b, row, PoseCol.RootRot, 1), p)));
      return p[1] + ch(b, row, PoseCol.RootPos, 1) + RIG.ROOT_Y;
    }),
  );
};

/** points along one forearm (elbow, mid forearm, hand) in the torso's local frame */
const forearmPts = (b: BakedClip, row: number, right: boolean): readonly V3[] => {
  const sg = right ? -1 : 1;
  const col = right ? PoseCol.ArmR : PoseCol.ArmL;
  const [fwd, out, twist, bend] = [0, 1, 2, 3].map((i) => ch(b, row, col, i)) as [number, number, number, number];
  return [0, 0.15, RIG.HAND_Y].map((d) => {
    const p = add(rx(-bend, [0, -d, 0]), [0, -RIG.UPPER_ARM, 0]);
    return add(rx(-fwd, rz(sg * out, ry(sg * twist, p))), [sg * RIG.SHOULDER_X, RIG.SHOULDER_Y, 0]);
  });
};

/** inside a slightly shrunken torso ellipsoid (spine-local frame) */
const inTorso = ([x, y, z]: V3): boolean => (x / 0.13) ** 2 + ((y - 0.24) / 0.22) ** 2 + (z / 0.085) ** 2 < 1;

const familyOf = (id: string): string => id.split('.')[0] ?? '';
const SEATED = new Set(['sit', 'lie']);
const AIRBORNE = /jump|hop|skip|tantrum|startle/;
const isStanding = (c: ClipDef): boolean => !SEATED.has(familyOf(c.id)) && !AIRBORNE.test(c.id);
const baked = EVERYDAY_CLIPS.map((c) => ({ def: c, b: bakeClip(c) }));
const rowsOf = (b: BakedClip): readonly number[] => Array.from({ length: b.rows }, (_, i) => i);

describe('everyday clip library', () => {
  it('has at least 80 clips with unique dotted ids', () => {
    expect(EVERYDAY_CLIPS.length).toBeGreaterThanOrEqual(80);
    const ids = EVERYDAY_CLIPS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z]+\.[a-z0-9]+$/));
  });

  it('bakes every clip to finite values', () => {
    baked.forEach(({ def, b }) => {
      expect(b.rows, def.id).toBeGreaterThan(1);
      expect(b.data.every((v) => Number.isFinite(v)), def.id).toBe(true);
    });
  });

  it('authors keys ascending within [0, 1)', () => {
    EVERYDAY_CLIPS.forEach((c) => {
      c.keys.forEach((k, i) => {
        expect(k.t, c.id).toBeGreaterThanOrEqual(0);
        expect(k.t, c.id).toBeLessThan(1);
        if (i > 0) expect(k.t, c.id).toBeGreaterThan(c.keys[i - 1]?.t ?? -1);
      });
    });
  });

  it('keeps elbow and knee bends within 0..150 degrees', () => {
    const cols = [PoseCol.ArmL, PoseCol.ArmR, PoseCol.LegL, PoseCol.LegR];
    baked.forEach(({ def, b }) => {
      rowsOf(b).forEach((r) =>
        cols.forEach((col) => {
          const deg = ch(b, r, col, 3) * R2D;
          expect(deg, `${def.id} row ${r} col ${col}`).toBeGreaterThanOrEqual(-0.01);
          expect(deg, `${def.id} row ${r} col ${col}`).toBeLessThanOrEqual(150.01);
        }),
      );
    });
  });

  it('gives locomotion clips a sane stride and a cyclic timing', () => {
    const moving = EVERYDAY_CLIPS.filter((c) => (c.stride ?? 0) > 0);
    expect(moving.length).toBeGreaterThanOrEqual(20);
    const bad = moving
      .filter((c) => (c.stride ?? 0) < 0.5 || (c.stride ?? 0) > 2.2 || (c.ease !== 'linear' && c.keys.length < 4))
      .map((c) => `${c.id} stride ${c.stride}`);
    expect(bad).toEqual([]);
  });

  it('keeps standing clips at standing height unless the knees bend', () => {
    const bad = baked
      .filter(({ def }) => isStanding(def))
      .flatMap(({ def, b }) =>
        rowsOf(b)
          .filter((r) => {
            const y = Math.abs(ch(b, r, PoseCol.RootPos, 1));
            const knee = Math.max(ch(b, r, PoseCol.LegL, 3), ch(b, r, PoseCol.LegR, 3)) * R2D;
            return knee < 25 && y > 0.12;
          })
          .map((r) => `${def.id} row ${r}`),
      );
    expect(bad).toEqual([]);
  });

  it('keeps a foot on the ground in standing clips', () => {
    const bad = baked
      .filter(({ def }) => isStanding(def))
      .flatMap(({ def, b }) =>
        rowsOf(b)
          .map((r) => ({ r, low: Math.min(soleY(b, r, false), soleY(b, r, true)) }))
          .filter(({ low }) => low < -0.06 || low > 0.08)
          .map(({ r, low }) => `${def.id} row ${r}: ${low.toFixed(3)}`),
      );
    expect(bad).toEqual([]);
  });

  it('never drives a forearm or hand through the torso', () => {
    const bad = baked.flatMap(({ def, b }) =>
      rowsOf(b)
        .filter((r) => [false, true].some((right) => forearmPts(b, r, right).some(inTorso)))
        .map((r) => `${def.id} row ${r}`),
    );
    expect(bad).toEqual([]);
  });

  it('lists at least 20 families that reference only existing clips', () => {
    const ids = new Set(EVERYDAY_CLIPS.map((c) => c.id));
    const fams = Object.entries(EVERYDAY_FAMILIES);
    expect(fams.length).toBeGreaterThanOrEqual(20);
    fams.forEach(([fam, list]) => {
      expect(list.length, fam).toBeGreaterThanOrEqual(2);
      list.forEach((id) => expect(ids.has(id), `${fam}: ${id}`).toBe(true));
    });
  });

  it('loops cleanly: the last baked row returns toward the first', () => {
    const channels = Array.from({ length: POSE_ROW_FLOATS }, (_, c) => c);
    const bad = baked.flatMap(({ def, b }) =>
      channels
        .map((c) => {
          const vals = rowsOf(b).map((r) => b.data[r * POSE_ROW_FLOATS + c] ?? 0);
          const range = Math.max(...vals) - Math.min(...vals);
          const gap = Math.abs((vals[vals.length - 1] ?? 0) - (vals[0] ?? 0));
          return { c, ok: gap <= range * 0.6 + 1e-4 };
        })
        .filter(({ ok }) => !ok)
        .map(({ c }) => `${def.id} channel ${c}`),
    );
    expect(bad).toEqual([]);
  });
});
