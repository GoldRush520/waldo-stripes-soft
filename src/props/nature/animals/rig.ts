/**
 * Quadruped rig: one parametric body (species proportions) posed by a small pose record.
 * Body centre sits over the origin, the animal faces +z. Coat parts are tint-masked.
 */
import { type Col, type Geo, cone, merge, sphere, tintable, translate } from '../../../core/geo';
import { type Q, type Size, type V3, chain, ell, ellR, hiOnly, limb, orient } from '../kit';

export type Ear = 'up' | 'drop' | 'long' | 'pom' | 'none';
export type Tail = 'up' | 'stub' | 'long' | 'curl' | 'pom' | 'bushy' | 'none';

export interface Species {
  /** body half-length along z, half-width x, half-height y */
  readonly body: V3;
  readonly bodySize?: Size;
  readonly legLen: number;
  readonly legR: number;
  readonly headR: number;
  /** head offset from the body front-top (y up, z forward) */
  readonly neck: readonly [number, number];
  readonly snout: readonly [number, number];
  readonly ear: Ear;
  readonly earSize?: number;
  readonly tail: Tail;
  readonly tailLen?: number;
  readonly coat: Col;
  /** untinted accent (ears, nose, hooves, muzzle) */
  readonly accent: Col;
  readonly eye?: Col;
  readonly headSize?: Size;
  readonly legSeg?: number;
  readonly noEyes?: boolean;
  /** untinted leg colour (sheep) */
  readonly legCol?: Col;
  /** untinted face colour (sheep) */
  readonly faceCol?: Col;
}

/** Foot target per leg as [dz, y] in units of legLen, relative to the hip; order FL, FR, BL, BR. */
export type Feet = readonly [readonly [number, number], readonly [number, number], readonly [number, number], readonly [number, number]];

export interface Pose {
  /** body centre height as a fraction of standing height */
  readonly lift: number;
  /** body pitch, positive = nose up */
  readonly pitch: number;
  readonly feet: Feet;
  /** head pitch (nose up +) and yaw */
  readonly head: readonly [number, number];
  /** extra head offset (y, z) */
  readonly headShift?: readonly [number, number];
  /** tail raise angle (rad, 0 = straight back) */
  readonly tailUp: number;
  readonly hideLegs?: boolean;
  /** drop the body until its rear rests on the ground (sitting) */
  readonly sitOnRear?: boolean;
}

export const STAND: Pose = {
  lift: 1,
  pitch: 0,
  feet: [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  head: [0.1, 0],
  tailUp: 0.6,
};

/** Rotate a body-local point (nose-up pitch about x) and add the centre. */
function rot(p: V3, pitch: number, c: V3): V3 {
  const cs = Math.cos(pitch);
  const sn = Math.sin(pitch);
  return [c[0] + p[0], c[1] + p[1] * cs + p[2] * sn, c[2] - p[1] * sn + p[2] * cs];
}

export interface Rigged {
  readonly geo: Geo;
  readonly centre: V3;
  readonly head: V3;
  readonly mouth: V3;
  readonly rear: V3;
}

function headParts(q: Q, s: Species, head: V3, pose: Pose): { parts: Geo[]; mouth: V3 } {
  const [hp, hy] = pose.head;
  const fwd: V3 = [Math.sin(hy) * Math.cos(hp), Math.sin(hp), Math.cos(hy) * Math.cos(hp)];
  const [sl, sr] = s.snout;
  const sc: V3 = [head[0] + fwd[0] * (s.headR * 0.7 + sl * 0.4), head[1] + fwd[1] * s.headR - s.headR * 0.25, head[2] + fwd[2] * (s.headR * 0.7 + sl * 0.4)];
  const skinCol = s.faceCol ?? s.coat;
  const snout = sl > 0 ? [ellR(q, q.hi ? 'tiny' : 'nub', sc, [sr, sr * 0.85, sl * 0.6], [-hp, hy, 0], skinCol)] : [];
  const tip: V3 = [sc[0] + fwd[0] * sl * 0.55, sc[1] + fwd[1] * sl * 0.55, sc[2] + fwd[2] * sl * 0.55];
  const side: V3 = [Math.cos(hy), 0, -Math.sin(hy)];
  const eyeAt = (k: number): V3 => [
    head[0] + fwd[0] * s.headR * 0.75 + side[0] * k * s.headR * 0.45,
    head[1] + s.headR * 0.3,
    head[2] + fwd[2] * s.headR * 0.75 + side[2] * k * s.headR * 0.45,
  ];
  const eyeR = Math.max(0.012, s.headR * 0.13);
  const eyes = s.noEyes ? [] : [1, -1].map((k) => translate(sphere(eyeR, s.eye ?? 'ink', 3, 2), ...eyeAt(k)));
  const nose = sl > 0 ? [translate(sphere(Math.max(0.012, sr * 0.35), 'ink', 3, 2), ...tip)] : [];
  const face = hiOnly(q, () => [...eyes, ...nose]);
  const ears = earParts(q, s, head, side);
  const skull = ell(q, s.headSize ?? 'small', head[0], head[1], head[2], s.headR, s.headR * 0.92, s.headR, skinCol);
  const skin = merge(skull, snout);
  return { parts: [s.faceCol ? skin : tintable(skin), ...face, ...ears], mouth: tip };
}

function earParts(q: Q, s: Species, head: V3, side: V3): Geo[] {
  const e = (s.earSize ?? 1) * s.headR;
  const at = (k: number, up: number, out: number): V3 => [head[0] + side[0] * k * out, head[1] + up, head[2] + side[2] * k * out - s.headR * 0.1];
  const ks = [1, -1] as const;
  switch (s.ear) {
    case 'up':
      return q.hi
        ? ks.map((k) => tintable(orient(cone(e * 0.42, e * 1.1, s.faceCol ?? s.coat, 3), [0, 0, -k * 0.25], at(k, s.headR * 0.55, s.headR * 0.5)), s.faceCol ? 0 : 1))
        : [];
    case 'drop':
      return !q.hi ? [] : ks.map((k) => ellR(q, 'nub', at(k, s.headR * 0.05, s.headR * 0.95), [e * 0.18, e * 0.6, e * 0.38], [0, 0, k * 0.25], s.accent));
    case 'long':
      return ks.map((k) => tintable(ellR(q, 'nub', at(k, s.headR * 0.9, s.headR * 0.42), [e * 0.2, e * 0.95, e * 0.12], [-0.25, 0, -k * 0.3], s.faceCol ?? s.coat), s.faceCol ? 0 : 1));
    case 'pom':
      return !q.hi ? [] : ks.map((k) => tintable(ell(q, 'nub', ...at(k, -s.headR * 0.1, s.headR * 0.95), e * 0.4, e * 0.6, e * 0.4, s.coat)));
    default:
      return [];
  }
}

function tailParts(q: Q, s: Species, rear: V3, up: number): Geo[] {
  const L = s.tailLen ?? s.body[0] * 0.6;
  const d: V3 = [0, Math.sin(up), -Math.cos(up)];
  const end: V3 = [rear[0], rear[1] + d[1] * L, rear[2] + d[2] * L];
  const r = Math.max(0.012, s.legR * 0.6);
  switch (s.tail) {
    case 'none':
      return [];
    case 'stub':
      return hiOnly(q, () => tintable(ell(q, 'nub', end[0], end[1], end[2], r * 1.5, r * 1.5, r * 2, s.coat)));
    case 'pom':
      return [tintable(limb(rear, end, r * 0.6, r * 0.5, s.coat, q.s(4, 3))), tintable(ell(q, 'nub', end[0], end[1], end[2], r * 2.6, r * 2.6, r * 2.6, s.coat))];
    case 'bushy':
      return [tintable(ellR(q, q.hi ? 'tiny' : 'nub', [rear[0], (rear[1] + end[1]) / 2, (rear[2] + end[2]) / 2], [L * 0.22, L * 0.22, L * 0.55], [up, 0, 0], s.coat))];
    case 'curl':
    case 'long': {
      const mid: V3 = [rear[0] + (s.tail === 'curl' ? L * 0.3 : 0), (rear[1] + end[1]) / 2 + L * 0.15, (rear[2] + end[2]) / 2];
      const pts = q.hi ? [rear, mid, end] : [rear, end];
      return chain(pts, r, r * 0.6, s.coat, q.s(4, 3)).map((g) => tintable(g));
    }
    default:
      return [tintable(limb(rear, end, r, r * 0.6, s.coat, q.s(4, 3)))];
  }
}

/** Build a posed quadruped (not grounded; callers pass it through `ground`). */
export function quadruped(q: Q, s: Species, pose: Pose): Rigged {
  const [bz, bx, by] = s.body;
  const cy = pose.sitOnRear
    ? Math.hypot(by * Math.cos(pose.pitch), bz * Math.sin(pose.pitch)) * 0.92
    : (s.legLen + by * 0.55) * pose.lift;
  const c: V3 = [0, cy, 0];
  const bodyGeo = orient(ell(q, s.bodySize ?? 'body', 0, 0, 0, bx, by, bz, s.coat), [-pose.pitch, 0, 0], c);
  const neckBase = rot([0, by * 0.45, bz * 0.75], pose.pitch, c);
  const hs = pose.headShift ?? [0, 0];
  const head: V3 = [neckBase[0], neckBase[1] + s.neck[0] + hs[0], neckBase[2] + s.neck[1] + hs[1]];
  const neck = Math.hypot(head[1] - neckBase[1], head[2] - neckBase[2]) > s.headR * 0.8 ? [limb(neckBase, head, s.headR * 0.55, s.headR * 0.5, s.coat, q.s(5, 3))] : [];
  const { parts: headGeo, mouth } = headParts(q, s, head, pose);
  const rear = rot([0, by * 0.3, -bz * 0.92], pose.pitch, c);
  const hips: V3[] = [
    rot([bx * 0.55, -by * 0.3, bz * 0.62], pose.pitch, c),
    rot([-bx * 0.55, -by * 0.3, bz * 0.62], pose.pitch, c),
    rot([bx * 0.55, -by * 0.3, -bz * 0.62], pose.pitch, c),
    rot([-bx * 0.55, -by * 0.3, -bz * 0.62], pose.pitch, c),
  ];
  const legs = pose.hideLegs ? [] : legParts(q, s, pose, hips);
  const coat = tintable(merge(bodyGeo, neck, s.legCol ? [] : legs));
  const geo = merge(coat, s.legCol ? legs : [], headGeo, tailParts(q, s, rear, pose.tailUp));
  return { geo, centre: c, head, mouth, rear };
}

/** Four legs (HI) or two paired legs (LO) from hips to pose foot targets. */
function legParts(q: Q, s: Species, pose: Pose, hips: readonly V3[]): Geo[] {
  const col = s.legCol ?? s.coat;
  const foot = (i: number, h: V3): V3 => {
    const f = pose.feet[i] ?? [0, 0];
    return [h[0], f[1] * s.legLen, h[2] + f[0] * s.legLen];
  };
  if (q.hi) {
    return hips.map((h, i) => limb(h, foot(i, h), s.legR, s.legR * 0.8, col, s.legSeg ?? 4));
  }
  return [0, 2].map((i) => {
    const a = hips[i] ?? [0, 0, 0];
    const fa = foot(i, a);
    const fb = foot(i + 1, hips[i + 1] ?? a);
    return limb([0, a[1], a[2]], [0, (fa[1] + fb[1]) / 2, (fa[2] + fb[2]) / 2], s.legR * 1.6, s.legR * 1.3, col, 3);
  });
}
