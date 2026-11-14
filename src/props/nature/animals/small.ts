/** Small creatures: rabbit, squirrel with nut, hedgehog, tortoise, mouse with cheese, sitting monkey, frog. */
import { type Geo, blob, cone, disc, dome, merge, prism, sphere, tintable, translate } from '../../../core/geo';
import { type Q, type V3, chain, ell, ellR, hiOnly, limb, orient, pair } from '../kit';
import { type Species, STAND, quadruped } from './rig';

function eyes(q: Q, c: V3, dx: number, r: number): Geo[] {
  return hiOnly(q, () => pair((s) => translate(sphere(r, 'ink', 3, 2), c[0] + s * dx, c[1], c[2])));
}

export function rabbit(q: Q): Geo {
  const coat = 'clayLight';
  const body = ell(q, 'mid', 0, 0.13, -0.03, 0.11, 0.12, 0.15, coat);
  const haunch = pair((s) => ell(q, q.hi ? 'tiny' : 'nub', s * 0.08, 0.07, -0.08, 0.05, 0.07, 0.1, coat));
  const head = ell(q, 'small', 0, 0.24, 0.12, 0.07, 0.065, 0.075, coat);
  const ears = pair((s) => ellR(q, 'nub', [s * 0.03, 0.36, 0.08], [0.022, 0.09, 0.012], [-0.3, 0, -s * 0.15], coat));
  const tail = hiOnly(q, () => ell(q, 'nub', 0, 0.12, -0.18, 0.035, 0.035, 0.035, 'ivory'));
  return merge(tintable(merge(body, haunch, head, ears)), tail, eyes(q, [0, 0.26, 0.18], 0.04, 0.01));
}

export function squirrel(q: Q): Geo {
  const coat = 'coralDeep';
  const body = ellR(q, 'small', [0, 0.11, 0], [0.055, 0.1, 0.06], [0.35, 0, 0], coat);
  const head = ell(q, q.hi ? 'small' : 'nub', 0, 0.22, 0.05, 0.045, 0.042, 0.048, coat);
  const tailPath: V3[] = q.hi
    ? [
        [0, 0.04, -0.07],
        [0, 0.14, -0.16],
        [0, 0.27, -0.12],
        [0, 0.33, -0.04],
      ]
    : [
        [0, 0.04, -0.08],
        [0, 0.3, -0.12],
      ];
  const tail = chain(tailPath, 0.05, 0.04, coat, q.s(5, 3));
  const ears = hiOnly(q, () => pair((s) => orient(cone(0.012, 0.03, coat, 3), [0, 0, -s * 0.2], [s * 0.022, 0.255, 0.04])));
  const nut = hiOnly(q, () => [ell(q, 'nub', 0, 0.16, 0.08, 0.022, 0.026, 0.022, 'timber'), translate(dome(0.023, 'timberDeep', 5, 2), 0, 0.175, 0.08)]);
  const feet = hiOnly(q, () => pair((s) => ell(q, 'nub', s * 0.03, 0.012, 0.03, 0.018, 0.012, 0.035, coat)));
  return merge(tintable(merge(body, head, tail, ears, feet)), nut, eyes(q, [0, 0.235, 0.085], 0.022, 0.007));
}

export function hedgehog(q: Q): Geo {
  const back = translate(dome(0.13, 'timberDeep', q.s(8, 5), q.s(4, 2)), 0, 0.02, -0.02);
  const face = ellR(q, q.hi ? 'tiny' : 'nub', [0, 0.05, 0.11], [0.05, 0.045, 0.07], [0.2, 0, 0], 'clay');
  const spines = hiOnly(q, () =>
    [0.4, 1.2, 2.0, 2.8, 3.6, 4.4, 5.2].map((a) =>
      orient(cone(0.025, 0.07, 'cocoa', 3), [Math.cos(a) * 0.9 - 0.4, 0, -Math.sin(a) * 0.9], [Math.sin(a) * 0.09, 0.09, Math.cos(a) * 0.08 - 0.03]),
    ),
  );
  const nose = hiOnly(q, () => translate(sphere(0.012, 'ink', 3, 2), 0, 0.045, 0.18));
  return merge(tintable(back), spines, face, nose, eyes(q, [0, 0.075, 0.14], 0.025, 0.008));
}

export function tortoise(q: Q): Geo {
  const shell = translate(dome(0.2, 'sageDeep', q.s(8, 5), q.s(4, 2)), 0, 0.05, 0);
  const rim = hiOnly(q, () => translate(disc(0.21, 'clayDeep', 8), 0, 0.05, 0));
  const plates = hiOnly(q, () =>
    [0.5, 2.6, 4.7].map((a) => ell(q, 'nub', Math.sin(a) * 0.1, 0.19, Math.cos(a) * 0.1, 0.06, 0.04, 0.06, 'sage')),
  );
  const head = ell(q, q.hi ? 'tiny' : 'nub', 0, 0.09, 0.25, 0.045, 0.04, 0.06, 'clay');
  const neck = limb([0, 0.07, 0.15], [0, 0.09, 0.23], 0.03, 0.03, 'clay', q.s(4, 3));
  const legs = [1, -1].flatMap((x) => [1, -1].map((z) => ell(q, 'nub', x * 0.14, 0.035, z * 0.12, 0.04, 0.035, 0.04, 'clay')));
  return merge(tintable(merge(shell, plates)), rim, head, neck, legs, eyes(q, [0, 0.11, 0.29], 0.025, 0.007));
}

const MOUSE: Species = {
  body: [0.05, 0.03, 0.03],
  bodySize: 'small',
  headSize: 'tiny',
  legLen: 0.012,
  legR: 0.008,
  legSeg: 3,
  headR: 0.022,
  neck: [0.0, 0.015],
  snout: [0.02, 0.012],
  ear: 'pom',
  earSize: 0.9,
  tail: 'long',
  tailLen: 0.09,
  coat: 'stone',
  accent: 'coralLight',
};

export function mouseCheese(q: Q): Geo {
  const m = quadruped(q, MOUSE, { ...STAND, head: [0.2, -0.3], tailUp: -0.1 });
  const wedge = translate(prism([[0, 0], [0.16, -0.05], [0.16, 0.05]], 0.07, 'butter'), 0.02, 0, 0.1);
  const holes = hiOnly(q, () => [translate(disc(0.012, 'butterDeep', 5), 0.12, 0.071, 0.11)]);
  return merge(m.geo, wedge, holes);
}

export function sittingMonkey(q: Q): Geo {
  const fur = 'timberDeep';
  const body = ell(q, 'body', 0, 0.2, 0, 0.12, 0.17, 0.1, fur);
  const head = ell(q, 'small', 0, 0.44, 0.02, 0.09, 0.085, 0.085, fur);
  const face = hiOnly(q, () => ell(q, 'nub', 0, 0.43, 0.075, 0.065, 0.06, 0.04, 'clay'));
  const earsGeo = hiOnly(q, () => pair((s) => translate(blob(0.03, 0.035, 0.015, 'clay', 4, 2), s * 0.09, 0.45, 0.01)));
  const arms = pair((s) => {
    const pts: V3[] = [
      [s * 0.11, 0.3, 0.02],
      [s * 0.14, 0.17, 0.09],
      [s * 0.05, 0.13, 0.15],
    ];
    return merge(chain(q.hi ? pts : [pts[0] as V3, pts[2] as V3], 0.028, 0.022, fur, q.s(4, 3)));
  });
  const legs = pair((s) => ell(q, 'nub', s * 0.08, 0.06, 0.08, 0.05, 0.05, 0.11, fur));
  const tailPath: V3[] = q.hi
    ? [
        [0, 0.06, -0.09],
        [0.12, 0.02, -0.2],
        [0.24, 0.1, -0.15],
        [0.22, 0.2, -0.07],
      ]
    : [
        [0, 0.06, -0.09],
        [0.22, 0.12, -0.15],
      ];
  const tail = chain(tailPath, 0.018, 0.012, fur, q.s(4, 3));
  return merge(tintable(merge(body, head, arms, legs, tail)), face, earsGeo, eyes(q, [0, 0.46, 0.105], 0.025, 0.01));
}

/** Frog sitting on a lily pad; y = 0 is the water surface. */
export function frogOnPad(q: Q): Geo {
  const pad = translate(disc(0.32, 'sage', q.s(10, 5)), 0, 0.01, 0);
  const body = ellR(q, 'small', [0, 0.09, 0], [0.08, 0.06, 0.1], [-0.35, 0, 0], 'sageLight');
  const head = ell(q, q.hi ? 'tiny' : 'nub', 0, 0.12, 0.08, 0.065, 0.045, 0.06, 'sageLight');
  const bulges = hiOnly(q, () => pair((s) => ell(q, 'nub', s * 0.04, 0.16, 0.09, 0.022, 0.022, 0.022, 'sageLight')));
  const legs = pair((s) => ell(q, 'nub', s * 0.08, 0.04, -0.04, 0.035, 0.03, 0.08, 'sageLight'));
  return merge(pad, tintable(merge(body, head, bulges, legs)), eyes(q, [0, 0.175, 0.105], 0.04, 0.01));
}
