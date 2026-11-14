/** Hand-cranked harbour crane (7 m jib swinging toward +z) and a floating barrel raft. */
import { type Geo, beam, cyl, lathe, merge, rotateZ, torus, translate } from '../../core/geo';
import { type Q, type V3, boxAt, cylX, nearOnly, sg } from './kit';

const POST_TOP = 5.4;
const JIB_FOOT: V3 = [0, 2.3, 0.25];
const JIB_TIP: V3 = [0, 5.1, 6.6];

/** Jib tip (where the hoist rope hangs) in prop space. */
export const CRANE_JIB_TIP: V3 = JIB_TIP;

function lerp(a: V3, b: V3, t: number): V3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function jibLattice(): Geo[] {
  const off = 0.22;
  const lower = (t: number): V3 => lerp(JIB_FOOT, JIB_TIP, t);
  const upper = (t: number): V3 => {
    const p = lerp(JIB_FOOT, JIB_TIP, t);
    return [p[0], p[1] + off * (1 - t), p[2] - 0.05 * (1 - t)];
  };
  return Array.from({ length: 6 }, (_, i) => {
    const a = i / 6;
    const b = (i + 1) / 6;
    return [beam(lower(a), upper(b), 0.035, 'timberDeep'), beam(upper(a), upper(b), 0.05, 'timberDeep')];
  }).flat();
}

export function harbourCrane(q: Q): Geo {
  const hookY = 2.0;
  return merge(
    translate(cyl(0.75, 0.65, 0.6, 'stone', sg(q, 10, 5)), 0, 0, 0),
    boxAt(0.35, POST_TOP - 0.6, 0.35, 'coral', 0, 0.6, 0),
    beam(JIB_FOOT, JIB_TIP, 0.2, 'coral'),
    beam([0, POST_TOP, 0], JIB_TIP, q.far ? 0.08 : 0.05, 'ivoryDeep'),
    boxAt(0.6, 0.6, 0.5, 'slate', 0, 1.6, -0.45),
    boxAt(0.2, 0.3, 0.16, 'butter', 0, hookY, JIB_TIP[2]),
    nearOnly(q, () => [
      beam(JIB_TIP, [0, hookY + 0.3, JIB_TIP[2]], 0.03, 'butterDeep'),
      ...jibLattice(),
      boxAt(0.45, 0.08, 0.45, 'ivory', 0, POST_TOP, 0),
      cylX(0.18, 0.5, 'slate', 10, -0.25, 1.2, 0.3),
      cylX(0.2, 0.32, 'butterDeep', 10, -0.16, 1.2, 0.3),
      translate(rotateZ(torus(0.4, 0.035, 'blueDeep', 4, 12), Math.PI / 2), 0.32, 1.2, 0.3),
      ...[0, 1].map((i) => beam([0.32, 1.2, 0.3], [0.32, 1.2 + Math.sin(i * Math.PI) * 0.4, 0.3 + Math.cos(i * Math.PI) * 0.4], 0.03, 'blueDeep')),
      cylX(0.03, 0.2, 'cocoa', 6, 0.32, 1.2 + 0.0, 0.7),
      beam([0, 1.45, 0.3], [0, JIB_FOOT[1] + 0.3, 1.0], 0.025, 'butterDeep'),
      translate(rotateZ(torus(0.07, 0.02, 'slate', 3, 8), Math.PI / 2), 0, hookY - 0.05, JIB_TIP[2]),
      boxAt(0.5, 0.08, 0.5, 'slate', 0, 0.55, 0),
    ]),
  );
}

function barrel(q: Q): Geo {
  const pts: ReadonlyArray<readonly [number, number]> = q.far
    ? [
        [0.24, -0.4],
        [0.3, 0],
        [0.24, 0.4],
      ]
    : [
        [0.0001, -0.4],
        [0.24, -0.4],
        [0.28, -0.22],
        [0.3, 0],
        [0.28, 0.22],
        [0.24, 0.4],
        [0.0001, 0.4],
      ];
  return lathe(pts, 'timber', sg(q, 10, 6));
}

/** Four barrels lashed under a plank deck; y = 0 is the waterline. */
export function barrelRaft(q: Q): Geo {
  const barrelAt = (x: number, z: number): Geo => translate(rotateZ(barrel(q), Math.PI / 2), x, 0.05, z);
  const hoops = nearOnly(q, () =>
    [-0.5, 0.5].flatMap((x) =>
      [-0.6, 0.6].flatMap((z) => [-0.25, 0.25].map((dx) => cylX(0.29, 0.04, 'slate', 10, x + dx - 0.02, 0.05, z))),
    ),
  );
  const planks = q.far
    ? [boxAt(1.9, 0.06, 1.9, 'timberDeep', 0, 0.36, 0)]
    : Array.from({ length: 6 }, (_, i) => boxAt(0.3, 0.06, 1.9, i % 2 ? 'timber' : 'timberDeep', -0.8 + i * 0.32, 0.36, 0));
  return merge(
    [-0.5, 0.5].flatMap((x) => [-0.6, 0.6].map((z) => barrelAt(x, z))),
    planks,
    hoops,
    nearOnly(q, () => [-0.6, 0.6].map((z) => boxAt(1.95, 0.05, 0.08, 'butterDeep', 0, 0.42, z))),
  );
}

export const CRANE_BASE: readonly [number, number] = [1.4, 1.4];
