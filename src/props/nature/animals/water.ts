/** Water creatures: jumping fish (y = 0 water), crab, peeking octopus (y = 0 waterline), seal on a rock. */
import { type Geo, cone, merge, sphere, sway, tintable, torus, translate } from '../../../core/geo';
import { type Q, type V3, chain, ell, ellR, hiOnly, limb, lumpy, orient, pair } from '../kit';

function eyePair(q: Q, c: V3, dx: number, r: number): Geo[] {
  return hiOnly(q, () => pair((s) => translate(sphere(r, 'ink', 3, 2), c[0] + s * dx, c[1], c[2])));
}

/** Fish mid-leap over a splash ring; arc peaks ~0.7 m above the water. */
export function jumpingFish(q: Q): Geo {
  const body = ellR(q, 'small', [0, 0.62, 0], [0.07, 0.11, 0.24], [0.55, 0, 0], 'blue');
  const tail = orient(cone(0.09, 0.14, 'blue', q.s(4, 3)), [-2.2, 0, 0], [0, 0.5, -0.2]);
  const fins = hiOnly(q, () => [
    orient(cone(0.04, 0.08, 'blueLight', 3), [-0.5, 0, 0], [0, 0.72, 0.02]),
    ...eyePair(q, [0, 0.72, 0.15], 0.06, 0.012),
  ]);
  const splash = translate(torus(0.28, 0.035, 'blueLight', q.s(4, 3), q.s(10, 5)), 0, 0.02, -0.35);
  const drops = hiOnly(q, () => [0.6, 2.1, 3.9].map((a) => translate(sphere(0.03, 'blueLight', 4, 2), Math.sin(a) * 0.3, 0.12 + a * 0.02, -0.35 + Math.cos(a) * 0.3)));
  return merge(tintable(merge(body, tail)), fins, splash, drops);
}

export function crab(q: Q): Geo {
  const col = 'coral';
  const body = ell(q, 'small', 0, 0.06, 0, 0.12, 0.045, 0.09, col);
  const claws = pair((s) =>
    merge(
      limb([s * 0.1, 0.06, 0.05], [s * 0.17, 0.09, 0.14], 0.018, 0.016, col, q.s(4, 3)),
      ellR(q, q.hi ? 'tiny' : 'nub', [s * 0.18, 0.1, 0.17], [0.04, 0.03, 0.05], [0, s * 0.4, 0], col),
    ),
  );
  const legs = hiOnly(q, () =>
    [1, -1].flatMap((s) => [-0.04, 0, 0.04].map((z) => limb([s * 0.1, 0.05, z], [s * 0.2, 0, z - 0.03], 0.01, 0.007, col, 3))),
  );
  const stalks = hiOnly(q, () => pair((s) => merge(limb([s * 0.03, 0.09, 0.07], [s * 0.04, 0.14, 0.08], 0.006, 0.006, col, 3), translate(sphere(0.014, 'ink', 3, 2), s * 0.04, 0.145, 0.08))));
  return merge(tintable(merge(body, claws, legs)), stalks);
}

/** Octopus peeking over the waterline (y = 0): dome head above, tentacles curling up out of the water. */
export function octopus(q: Q): Geo {
  const col = 'coral';
  const head = ellR(q, 'mid', [0, 0.12, 0], [0.22, 0.28, 0.24], [-0.2, 0, 0], col);
  const skirt = ell(q, q.hi ? 'small' : 'nub', 0, -0.15, 0.02, 0.3, 0.12, 0.3, col);
  const arm = (a: number, k: number): Geo[] => {
    const base: V3 = [Math.sin(a) * 0.28, -0.08, Math.cos(a) * 0.28];
    const out: V3 = [Math.sin(a) * 0.48, 0.12 + k * 0.05, Math.cos(a) * 0.48];
    const curl: V3 = [Math.sin(a + 0.4) * 0.42, 0.26 + k * 0.04, Math.cos(a + 0.4) * 0.42];
    return q.hi ? chain([base, out, curl], 0.06, 0.02, col, 5) : [limb(base, out, 0.06, 0.03, col, 3)];
  };
  const arms = [0.9, 2.4, -1.4].flatMap((a, i) => arm(a, i));
  const suckers = hiOnly(q, () => [0.9, 2.4].map((a) => translate(sphere(0.02, 'coralLight', 4, 2), Math.sin(a) * 0.5, 0.06, Math.cos(a) * 0.5)));
  const eyes = hiOnly(q, () =>
    pair((s) => merge(translate(sphere(0.05, 'ivory', 4, 3), s * 0.1, 0.2, 0.19), translate(sphere(0.022, 'ink', 4, 2), s * 0.1, 0.2, 0.24))),
  );
  return merge(tintable(merge(head, skirt, sway(merge(arms), 0.3))), suckers, eyes);
}

/** Seal lounging on a rock, head up, tail flippers raised. */
export function sealOnRock(q: Q): Geo {
  const c: V3 = [0, 0.3, 0];
  const rock = lumpy(ell(q, 'mid', 0, 0.28, 0, 0.75, 0.32, 0.55, 'stone'), c, 0.1, 7);
  const body = ellR(q, 'body', [0, 0.72, 0], [0.22, 0.2, 0.5], [0.2, 0, 0], 'slate');
  const neck = limb([0, 0.75, 0.3], [0, 1.0, 0.45], 0.14, 0.11, 'slate', q.s(6, 3));
  const head = ell(q, q.hi ? 'small' : 'nub', 0, 1.06, 0.5, 0.12, 0.11, 0.13, 'slate');
  const muzzle = hiOnly(q, () => ell(q, 'nub', 0, 1.02, 0.62, 0.06, 0.045, 0.05, 'stone'));
  const flippers = pair((s) => ellR(q, 'nub', [s * 0.2, 0.62, 0.22], [0.12, 0.03, 0.07], [0, s * 0.6, s * 0.4], 'slate'));
  const tail = orient(cone(0.12, 0.2, 'slate', q.s(5, 3)), [-1.8, 0, 0], [0, 0.82, -0.45]);
  return merge(rock, tintable(merge(body, neck, head, flippers, tail)), muzzle, eyePair(q, [0, 1.1, 0.6], 0.06, 0.016));
}
