/** Birds: gulls, pigeons, ducks, swan, goose, heron, parrot, crow, hen, rooster, butterflies. */
import { type Geo, blob, box, cone, merge, sway, tintable, translate } from '../../../core/geo';
import { type Q, type V3, ell, ellR, hiOnly, limb, orient, pair } from '../kit';
import { type Bird, bird } from './bird-rig';

export const GULL: Bird = {
  body: [0.08, 0.08, 0.17],
  height: 0.16,
  pitch: 0.15,
  headR: 0.055,
  head: [0.1, 0.13],
  beak: [0.07, 0.016],
  beakCol: 'butter',
  wings: 'fold',
  tail: 0.08,
  coat: 'ivory',
  wingCol: 'slate',
  legCol: 'coral',
};

export const PIGEON: Bird = {
  body: [0.06, 0.065, 0.12],
  height: 0.1,
  headR: 0.035,
  head: [0.08, 0.08],
  beak: [0.03, 0.009],
  beakCol: 'clay',
  wings: 'fold',
  tail: 0.06,
  coat: 'slate',
  wingCol: 'stone',
  legCol: 'coral',
};

export const DUCK: Bird = {
  body: [0.1, 0.08, 0.17],
  height: 0.09,
  pitch: 0.05,
  headR: 0.055,
  head: [0.14, 0.13],
  beak: [0.07, 0.025],
  beakPitch: -0.1,
  beakCol: 'butterDeep',
  wings: 'fold',
  tail: 0.05,
  coat: 'ivoryShade',
  wingCol: 'clayDeep',
  headCol: 'sageDeep',
  legs: false,
};

export const SWAN: Bird = {
  body: [0.2, 0.15, 0.36],
  bodySize: 'mid',
  height: 0.15,
  pitch: 0.1,
  headR: 0.06,
  head: [0.5, 0.26],
  neckMid: [0.3, 0.38],
  neckR: 0.04,
  beak: [0.09, 0.025],
  beakPitch: 0.3,
  beakCol: 'coral',
  wings: 'fold',
  tail: 0.08,
  coat: 'ivory',
  legs: false,
};

export const GOOSE_ANGRY: Bird = {
  body: [0.13, 0.12, 0.24],
  height: 0.3,
  pitch: 0.35,
  headR: 0.05,
  head: [0.22, 0.32],
  neckMid: [0.12, 0.26],
  neckR: 0.035,
  beak: [0.08, 0.022],
  beakPitch: -0.3,
  beakCol: 'butterDeep',
  wings: 'up',
  wingSpan: 0.9,
  tail: 0.08,
  coat: 'ivory',
  wingCol: 'ivoryShade',
  legCol: 'butterDeep',
};

export const HERON: Bird = {
  body: [0.1, 0.12, 0.22],
  height: 0.75,
  pitch: 0.5,
  headR: 0.045,
  head: [0.42, 0.12],
  neckMid: [0.25, 0.2],
  neckR: 0.03,
  beak: [0.16, 0.018],
  beakCol: 'butterDeep',
  wings: 'fold',
  tail: 0.06,
  coat: 'stone',
  wingCol: 'slate',
  headCol: 'ivory',
  legCol: 'butterDeep',
};

export const CROW: Bird = { ...PIGEON, body: [0.07, 0.075, 0.15], height: 0.13, headR: 0.042, head: [0.09, 0.11], beak: [0.06, 0.016], beakCol: 'ink', coat: 'ink', wingCol: 'cocoa', legCol: 'ink', tail: 0.1 };

export const HEN: Bird = {
  body: [0.12, 0.13, 0.17],
  height: 0.2,
  pitch: 0.1,
  headR: 0.05,
  head: [0.16, 0.12],
  beak: [0.04, 0.016],
  beakCol: 'butter',
  wings: 'fold',
  tail: 0.1,
  coat: 'clayDeep',
  legCol: 'butterDeep',
};

export const PARROT: Bird = {
  body: [0.06, 0.1, 0.07],
  height: 0.12,
  pitch: 1.1,
  headR: 0.045,
  head: [0.13, 0.03],
  beak: [0.04, 0.018],
  beakPitch: 0.6,
  beakCol: 'ivoryDeep',
  wings: 'fold',
  tail: 0.16,
  coat: 'sage',
  wingCol: 'blue',
  headCol: 'butter',
  legCol: 'slate',
};

export function gullStanding(q: Q): Geo {
  return bird(q, GULL);
}

/** Gull gliding with wings spread; origin at the body centre. */
export function gullFlying(q: Q): Geo {
  return bird(q, { ...GULL, wings: 'spread', wingSpan: 1.1, height: 0, pitch: 0, legs: false, wingCol: 'ivoryShade' });
}

export function pigeonStand(q: Q): Geo {
  return bird(q, PIGEON);
}

export function pigeonPeck(q: Q): Geo {
  return bird(q, { ...PIGEON, pitch: -0.5, head: [-0.02, 0.12], tail: 0.07 });
}

/** Five cheap pigeons in one prop (pecking and standing). */
export function pigeonFlock(q: Q): Geo {
  const spots: ReadonlyArray<readonly [number, number, number, boolean]> = [
    [0, 0, 0, true],
    [0.35, 0.2, 1.2, false],
    [-0.3, 0.25, -0.8, true],
    [0.15, -0.35, 2.6, true],
    [-0.4, -0.2, 0.5, false],
  ];
  return merge(
    spots.map(([x, z, yaw, peck]) => {
      const body = ellR(q, 'nub', [0, 0.09, 0], [0.06, 0.06, 0.11], [peck ? 0.4 : 0, 0, 0], 'slate');
      const head = ell(q, 'nub', 0, peck ? 0.05 : 0.17, peck ? 0.13 : 0.08, 0.035, 0.035, 0.038, 'slate');
      const beak = hiOnly(q, () => orient(cone(0.01, 0.03, 'clay', 3), [Math.PI / 2 + (peck ? 0.8 : 0), 0, 0], [0, peck ? 0.04 : 0.165, peck ? 0.165 : 0.115]));
      return orient(merge(tintable(merge(body, head)), beak), [0, yaw, 0], [x, 0, z]);
    }),
  );
}

export function duck(q: Q): Geo {
  return bird(q, DUCK);
}

/** Mother duck leading four ducklings in a line (single prop, swimming or waddling). */
export function ducklingRow(q: Q): Geo {
  const mum = translate(bird(q, DUCK), 0, 0, 0.45);
  const babies = q.hi
    ? [0, 1, 2, 3].map((i) => {
        const z = 0.1 - i * 0.22;
        const x = Math.sin(i * 1.7) * 0.06;
        const body = translate(blob(0.045, 0.04, 0.06, 'butter', 5, 2), x, 0.05, z);
        const head = translate(blob(0.03, 0.03, 0.03, 'butter', 4, 2), x, 0.1, z + 0.04);
        return merge(body, head);
      })
    : [translate(blob(0.05, 0.05, 0.42, 'butter', 3, 2), 0, 0.05, -0.23)];
  return merge(mum, babies);
}

export function swan(q: Q): Geo {
  return bird(q, SWAN);
}

export function angryGoose(q: Q): Geo {
  return bird(q, GOOSE_ANGRY);
}

export function heron(q: Q): Geo {
  return bird(q, HERON);
}

export function crow(q: Q): Geo {
  return bird(q, CROW);
}

export function hen(q: Q): Geo {
  const comb = hiOnly(q, () => translate(box(0.012, 0.035, 0.05, 'coral'), 0, HEN.height + HEN.head[0] + 0.04, HEN.head[1]));
  return merge(bird(q, HEN), comb);
}

export function rooster(q: Q): Geo {
  const r = { ...HEN, body: [0.13, 0.14, 0.18] as V3, height: 0.25, head: [0.22, 0.13] as const, coat: 'coralDeep' as const, wingCol: 'butterDeep' as const, tail: 0.18 };
  const hc: V3 = [0, r.height + r.head[0], r.head[1]];
  const comb = merge(ell(q, 'nub', 0, hc[1] + 0.055, hc[2], 0.012, 0.035, 0.045, 'coral'), ...hiOnly(q, () => ell(q, 'nub', 0, hc[1] - 0.06, hc[2] + 0.03, 0.01, 0.03, 0.015, 'coral')));
  const plume = ellR(q, q.hi ? 'tiny' : 'nub', [0, r.height + 0.12, -0.24], [0.04, 0.16, 0.08], [-0.6, 0, 0], 'sageDeep');
  return merge(bird(q, r), comb, plume);
}

/** Parrot perched on a timber stand with a cross bar and a seed cup. */
export function parrotPerch(q: Q): Geo {
  const pole = limb([0, 0, 0], [0, 1.2, 0], 0.025, 0.02, 'timber', q.s(5, 3));
  const base = translate(box(0.36, 0.04, 0.36, 'timberDeep'), 0, 0, 0);
  const bar = limb([-0.25, 1.2, 0], [0.25, 1.2, 0], 0.015, 0.015, 'timber', q.s(4, 3));
  const cup = hiOnly(q, () => translate(box(0.06, 0.05, 0.06, 'butter'), 0.2, 1.22, 0));
  const p = translate(bird(q, PARROT), 0, 1.21, 0);
  return merge(base, pole, bar, cup, p);
}

/** Two butterflies fluttering (sway) above a flower; origin on the ground, wings tint-masked. */
export function butterflies(q: Q): Geo {
  const one = (x: number, y: number, z: number, yaw: number): Geo => {
    const wings = pair((s) => ellR(q, 'nub', [s * 0.035, 0, 0.005], [0.035, 0.004, 0.028], [0, 0, s * 0.5], 'butter'));
    const body = hiOnly(q, () => ell(q, 'nub', 0, 0, 0, 0.006, 0.006, 0.025, 'ink'));
    return orient(merge(tintable(merge(wings)), body), [0, yaw, 0], [x, y, z]);
  };
  return sway(merge(one(0, 0.9, 0, 0.4), one(0.25, 1.15, -0.1, -1.1)), 1);
}
