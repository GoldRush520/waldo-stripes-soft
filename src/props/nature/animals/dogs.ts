/** Dogs: terrier, dachshund, shaggy sheepdog, poodle — stand / sit / run / pull poses — and the scarf thief. */
import { type Geo, bakeTint, box, merge, paint, sphere, tintable, translate } from '../../../core/geo';
import { type Q, type V3, ell, hiOnly, limb, orient, swayFrom } from '../kit';
import { type Pose, type Species, STAND, quadruped } from './rig';

export const TERRIER: Species = {
  body: [0.24, 0.12, 0.13],
  legLen: 0.17,
  legR: 0.035,
  headR: 0.09,
  neck: [0.06, 0.06],
  snout: [0.09, 0.05],
  ear: 'up',
  earSize: 0.8,
  tail: 'up',
  tailLen: 0.12,
  coat: 'ivory',
  accent: 'clayDeep',
};

export const DACHSHUND: Species = {
  body: [0.33, 0.09, 0.1],
  legLen: 0.07,
  legR: 0.032,
  headR: 0.075,
  neck: [0.06, 0.08],
  snout: [0.12, 0.04],
  ear: 'drop',
  tail: 'long',
  tailLen: 0.2,
  coat: 'timber',
  accent: 'timberDeep',
};

export const SHEEPDOG: Species = {
  body: [0.36, 0.2, 0.22],
  legLen: 0.22,
  legR: 0.07,
  headR: 0.15,
  neck: [0.06, 0.05],
  snout: [0.08, 0.07],
  ear: 'drop',
  earSize: 0.8,
  tail: 'stub',
  coat: 'ivoryShade',
  accent: 'slate',
  noEyes: true,
};

export const POODLE: Species = {
  body: [0.2, 0.11, 0.13],
  bodySize: 'small',
  headSize: 'tiny',
  legLen: 0.26,
  legR: 0.025,
  legSeg: 3,
  headR: 0.08,
  neck: [0.15, 0.06],
  snout: [0.1, 0.035],
  ear: 'pom',
  tail: 'pom',
  tailLen: 0.12,
  coat: 'ivory',
  accent: 'coralDeep',
  noEyes: true,
};

export type DogPose = 'stand' | 'sit' | 'run' | 'pull';

export const DOG_POSES: Readonly<Record<DogPose, Pose>> = {
  stand: STAND,
  sit: {
    lift: 1,
    pitch: 0.6,
    sitOnRear: true,
    feet: [
      [0.1, 0],
      [0.1, 0],
      [0.55, 0],
      [0.55, 0],
    ],
    head: [0.05, 0],
    headShift: [0.04, -0.03],
    tailUp: -0.4,
  },
  run: {
    lift: 1.05,
    pitch: 0.05,
    feet: [
      [0.9, 0],
      [1.05, 0.25],
      [-0.85, 0.05],
      [-1.0, 0.3],
    ],
    head: [-0.05, 0],
    headShift: [-0.02, 0.04],
    tailUp: 0.25,
  },
  pull: {
    lift: 0.9,
    pitch: -0.12,
    feet: [
      [0.6, 0],
      [0.45, 0],
      [-0.6, 0],
      [-0.5, 0],
    ],
    head: [0.25, 0.12],
    headShift: [0.02, 0.05],
    tailUp: 0.9,
  },
};

/** Breed decorations (poodle pompoms, sheepdog fringe) and the taut lead stub for `pull`. */
function extras(q: Q, s: Species, pose: DogPose, head: V3, centre: V3): Geo[] {
  const out: Geo[] = [];
  if (s === POODLE) {
    out.push(tintable(ell(q, 'nub', head[0], head[1] + s.headR * 0.9, head[2] - 0.01, s.headR * 0.8, s.headR * 0.6, s.headR * 0.8, s.coat)));
    out.push(...hiOnly(q, () => [1, -1].flatMap((x) => [1, -1].map((z) => tintable(translate(sphere(0.045, s.coat, 3, 2), x * 0.06, 0.05, z * 0.13 * (pose === 'run' ? 1.6 : 1)))))));
  }
  if (s === SHEEPDOG) {
    out.push(...hiOnly(q, () => tintable(ell(q, 'nub', head[0], head[1] + s.headR * 0.5, head[2] + s.headR * 0.55, s.headR * 0.85, s.headR * 0.35, s.headR * 0.45, s.coat))));
  }
  if (pose === 'pull') {
    const collar: V3 = [head[0], head[1] - s.headR * 0.6, head[2] - s.headR * 0.5];
    out.push(...hiOnly(q, () => tintable(limb(collar, [collar[0] - 0.05, collar[1] + 0.45, centre[2] - 0.25], 0.01, 0.01, 'coral', 3))));
  }
  return out;
}

/** A posed dog of a breed. */
export function dog(q: Q, s: Species, pose: DogPose): Geo {
  const r = quadruped(q, s, DOG_POSES[pose]);
  return merge(r.geo, extras(q, s, pose, r.head, r.centre));
}

/** Terrier galloping off with a long striped scarf (tint-masked, ivory stripes) trailing ~2 m. */
export function scarfThief(q: Q): Geo {
  const r = quadruped(q, { ...TERRIER, headSize: 'tiny', legSeg: 3 }, DOG_POSES.run);
  const m = r.mouth;
  const n = q.s(5, 1);
  const L = 2.1;
  const pts: V3[] = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return [Math.sin(t * 5.5) * 0.18 * t, m[1] + 0.12 * Math.sin(t * 3.1) - t * (m[1] - 0.06), m[2] - 0.05 - t * L];
  });
  const segs = pts.slice(0, -1).map((a, i) => {
    const piece = strip(a, pts[i + 1] ?? a, 0.16, 0.025);
    return q.hi && i % 2 === 1 ? paint(piece, 'ivory') : tintable(piece);
  });
  return merge(bakeTint(r.geo, 'butterLight'), swayFrom(merge(segs), m, L, 1));
}

/** Thin flat cloth strip from a to b (width w, thickness t). */
function strip(a: V3, b: V3, w: number, t: number): Geo {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const len = Math.max(1e-3, Math.hypot(dx, dy, dz));
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const g = translate(box(w, t, len + 0.02, 'coral'), 0, -t / 2, 0);
  return orient(g, [-Math.asin(dy / len), Math.atan2(dx, dz), 0], mid);
}
