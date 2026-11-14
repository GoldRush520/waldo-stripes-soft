/** Cats: sit, walk, loaf, stretch, pounce and a sleeping curl. Coat tint-masked. */
import { type Geo, cone, merge, tintable } from '../../../core/geo';
import { type Q, type V3, chain, ell, ellR, hiOnly, orient } from '../kit';
import { type Pose, type Species, quadruped } from './rig';

export const CAT: Species = {
  body: [0.2, 0.085, 0.095],
  legLen: 0.15,
  legR: 0.022,
  legSeg: 4,
  headR: 0.065,
  neck: [0.05, 0.05],
  snout: [0.03, 0.035],
  ear: 'up',
  earSize: 0.9,
  tail: 'long',
  tailLen: 0.28,
  coat: 'butterDeep',
  accent: 'coralLight',
  eye: 'sageDeep',
};

export type CatPose = 'sit' | 'walk' | 'loaf' | 'stretch' | 'pounce';

export const CAT_POSES: Readonly<Record<CatPose, Pose>> = {
  sit: {
    lift: 1,
    pitch: 0.95,
    sitOnRear: true,
    feet: [
      [0.2, 0],
      [0.2, 0],
      [0.7, 0],
      [0.7, 0],
    ],
    head: [0, 0],
    headShift: [0.02, -0.04],
    tailUp: -0.9,
  },
  walk: {
    lift: 1,
    pitch: 0,
    feet: [
      [0.35, 0],
      [-0.15, 0.12],
      [-0.25, 0],
      [0.3, 0.1],
    ],
    head: [0.05, 0],
    tailUp: 1.1,
  },
  loaf: {
    lift: 1,
    pitch: 0,
    sitOnRear: true,
    hideLegs: true,
    feet: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    head: [0, 0.2],
    headShift: [-0.04, -0.03],
    tailUp: -0.35,
  },
  stretch: {
    lift: 0.8,
    pitch: -0.35,
    feet: [
      [1.1, 0],
      [1.0, 0],
      [-0.1, 0],
      [-0.1, 0],
    ],
    head: [0.35, 0],
    headShift: [-0.03, 0.02],
    tailUp: 1.3,
  },
  pounce: {
    lift: 0.6,
    pitch: -0.12,
    feet: [
      [0.75, 0],
      [0.6, 0],
      [0.45, 0],
      [0.45, 0],
    ],
    head: [0.05, 0],
    headShift: [-0.03, 0.03],
    tailUp: 0.15,
  },
};

export function cat(q: Q, pose: CatPose): Geo {
  return quadruped(q, CAT, CAT_POSES[pose]).geo;
}

/** Curled-up sleeping cat: body ring, tucked head, tail wrapped round the nose. */
export function sleepingCat(q: Q): Geo {
  const coat = CAT.coat;
  const body = ellR(q, 'mid', [0.03, 0.08, -0.02], [0.17, 0.085, 0.13], [0, 0.5, 0], coat);
  const haunch = ell(q, q.hi ? 'small' : 'nub', -0.07, 0.085, -0.07, 0.1, 0.08, 0.1, coat);
  const head = ell(q, q.hi ? 'small' : 'nub', 0.1, 0.07, 0.1, 0.065, 0.055, 0.065, coat);
  const ears = hiOnly(q, () => [0.03, -0.03].map((dx) => orient(cone(0.022, 0.05, coat, 3), [0.5, 0, -0.3], [0.13 + dx, 0.11, 0.12])));
  const tailPath: V3[] = q.hi
    ? [
        [-0.13, 0.04, -0.06],
        [-0.12, 0.03, 0.12],
        [0.02, 0.03, 0.2],
        [0.16, 0.03, 0.16],
      ]
    : [
        [-0.13, 0.04, -0.06],
        [0.04, 0.03, 0.2],
      ];
  const tail = chain(tailPath, 0.022, 0.016, coat, q.s(4, 3));
  return tintable(merge(body, haunch, head, ears, tail));
}
