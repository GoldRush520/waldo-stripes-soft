/** Funfair treat carts and small structures: candy floss, popcorn, toffee apples, balloons, ticket booth. */
import { type Col, type Geo, beam, blob, cone, cyl, detail, farOnly, merge, rotateX, sphere, sway, tintable, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { boxAt, bulbs, canopyProfile, drumProfile, lodPair, pennant, post, prop, revolve, softBox, stripedLod, stripesX } from './kit';

function wheels(x: number, r: number, zs: readonly number[]): Geo {
  const wheel = translate(rotateX(cyl(r, r, 0.06, 'cocoa', 10), Math.PI / 2), 0, r, -0.03);
  const near = zs.map((z) => translate(wheel, x, 0, z));
  const far = zs.map((z) => boxAt(r * 1.6, r * 2, 0.06, 'cocoa', x, 0, z));
  return lodPair(merge(near), merge(far));
}

function cartBody(w: number, d: number, h: number, col: Col): Geo {
  const body = tintable(softBox(w, h, d, 0.05, col));
  const stripe = translate(stripesX(w - 0.1, 0.25, 0.03, 7, col, 'ivory'), 0, h - 0.35, d / 2 + 0.01);
  const handle = detail(merge(beam([-w / 2, h - 0.1, -0.2], [-w / 2 - 0.45, h - 0.05, -0.2], 0.04, 'timber'), beam([-w / 2, h - 0.1, 0.2], [-w / 2 - 0.45, h - 0.05, 0.2], 0.04, 'timber'), beam([-w / 2 - 0.45, h - 0.05, -0.22], [-w / 2 - 0.45, h - 0.05, 0.22], 0.04, 'timber')));
  const legs = merge([-1, 1].map((s) => boxAt(0.06, 0.3, 0.06, 'timberDeep', -w / 2 + 0.12, 0, s * (d / 2 - 0.1))));
  return merge(translate(merge(body, stripe), 0, 0.3, 0), handle, legs, wheels(w / 2 - 0.25, 0.28, [-d / 2 - 0.04, d / 2 + 0.04]));
}

function parasol(r: number, h: number, a: Col, b: Col): Geo {
  const pole = post(0, 0, h, 0.025, 'timber', 6);
  const top = translate(stripedLod(canopyProfile(r, 0.45), 10, 2, 1, a, b), 0, h - 0.35, 0);
  return merge(pole, top);
}

function cottonCandyBuild(): Geo {
  const body = cartBody(1.3, 0.75, 0.75, 'blue');
  const bowlProfile: Array<readonly [number, number]> = [[0.01, 0], [0.36, 0.0], [0.42, 0.28], [0.38, 0.28], [0.3, 0.06], [0.01, 0.06]];
  const bowl = translate(lodPair(revolve(bowlProfile, 'ivory', 12), revolve(bowlProfile.slice(0, 3), 'ivory', 6)), 0, 1.05, 0);
  const floss = merge(
    [-0.45, -0.3, 0.35, 0.5].map((x, i) =>
      merge(beam([x, 1.05, 0.25], [x, 1.45, 0.25], 0.015, 'ivory'), translate(blob(0.1, 0.13, 0.1, i % 2 === 0 ? 'coralLight' : 'blueLight', 6, 4), x, 1.5, 0.25)),
    ),
  );
  const far = boxAt(1.0, 0.25, 0.2, 'coralLight', 0, 1.35, 0.25);
  return merge(body, bowl, lodPair(floss, far), translate(parasol(0.95, 2.4, 'coral', 'ivory'), 0.4, 1.05, -0.2));
}

function popcornBuild(): Geo {
  const body = cartBody(1.2, 0.8, 0.8, 'coral');
  const caseFrame = merge(
    [-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.05, 0.7, 0.05, 'butter', sx * 0.5, 1.1, sz * 0.33))),
  );
  const lid = boxAt(1.1, 0.06, 0.75, 'butter', 0, 1.8, 0);
  const panes = merge(boxAt(0.95, 0.65, 0.02, 'blueLight', 0, 1.12, 0.34), boxAt(0.95, 0.65, 0.02, 'blueLight', 0, 1.12, -0.34));
  const heap = translate(blob(0.42, 0.18, 0.28, 'butterLight', 8, 4), 0, 1.15, 0);
  const roof = translate(stripesX(1.3, 0.08, 0.95, 7, 'coral', 'ivory'), 0, 1.86, 0);
  const crest = detail(merge(translate(sphere(0.1, 'butter', 6, 4), 0, 2.05, 0), boxAt(0.7, 0.25, 0.04, 'ivory', 0, 1.95, 0.3)));
  const bags = detail(merge([-0.4, -0.25, -0.1].map((x) => boxAt(0.1, 0.18, 0.06, 'ivory', x, 1.1, 0.42))));
  const glass = lodPair(merge(caseFrame, panes, heap), boxAt(1.0, 0.7, 0.7, 'butterLight', 0, 1.1, 0));
  const lights = bulbs(Array.from({ length: 8 }, (_, i) => [-0.6 + i * (1.2 / 7), 1.84, 0.5] as const));
  return merge(body, glass, lid, roof, crest, bags, lights);
}

function toffeeAppleBuild(): Geo {
  const table = merge(softBox(1.4, 0.85, 0.7, 0.04, 'clay'), translate(stripesX(1.35, 0.35, 0.03, 9, 'coral', 'ivory'), 0, 0.45, 0.35));
  const tiers = [0, 1, 2].map((k) => boxAt(1.1 - k * 0.25, 0.06, 0.5 - k * 0.1, 'timber', 0, 0.85 + k * 0.22, -0.05));
  const apple = merge(translate(sphere(0.045, 'coralDeep', 6, 4), 0, 0.045, 0), beam([0, 0.08, 0], [0, 0.2, 0], 0.012, 'timber'));
  const apples = [0, 1, 2].flatMap((k) =>
    Array.from({ length: 6 - k * 2 }, (_, i) => translate(apple, -0.45 + k * 0.12 + i * 0.17, 0.91 + k * 0.22, -0.05 + (i % 2) * 0.08)),
  );
  const far = translate(cone(0.5, 0.6, 'coralDeep', 4), 0, 0.88, -0.05);
  const awning = translate(parasol(0.9, 2.2, 'butter', 'ivory'), 0.5, 0, -0.45);
  return merge(table, lodPair(merge(apples), far), detail(merge(tiers)), awning);
}

const BALLOON_COLS: readonly Col[] = ['coral', 'blue', 'butter', 'sage', 'coralLight', 'blueLight'];

function balloon(col: Col, x: number, y: number, z: number, tint: boolean, wSeg = 6, hSeg = 4): Geo {
  const b = translate(blob(0.17, 0.21, 0.17, col, wSeg, hSeg), x, y, z);
  const swayed = sway(b, (_vx, vy) => Math.min(1, vy / 2.2));
  return tint ? tintable(swayed) : swayed;
}

function bunchBuild(): Geo {
  const tops: ReadonlyArray<readonly [number, number, number]> = [
    [0, 2.2, 0],
    [0.3, 2.0, 0.1],
    [-0.3, 2.0, -0.05],
    [0.15, 1.85, -0.3],
    [-0.15, 1.85, 0.3],
    [0.32, 1.7, -0.22],
  ];
  const balloons = tops.map((p, i) => balloon(i % 2 === 0 ? 'coral' : BALLOON_COLS[i % BALLOON_COLS.length] ?? 'blue', p[0], p[1], p[2], i % 2 === 0));
  const strings = detail(merge(tops.map((p) => sway(beam([0, 0, 0], [p[0], p[1] - 0.27, p[2]], 0.008, 'ivoryDeep'), (_x, y) => Math.min(1, y / 2.2)))));
  const far = tintable(sway(translate(blob(0.5, 0.4, 0.5, 'coral', 6, 4), 0, 1.95, 0), 0.6));
  const farString = farOnly(beam([0, 0, 0], [0, 1.55, 0], 0.03, 'ivoryDeep'));
  return merge(lodPair(merge(balloons), far), strings, farString);
}

function singleBalloonBuild(): Geo {
  const b = lodPair(balloon('coral', 0, 1.15, 0, true, 8, 5), balloon('coral', 0, 1.15, 0, true, 5, 3));
  const string = sway(beam([0, 0, 0], [0, 0.89, 0], 0.008, 'ivoryDeep'), (_x, y) => Math.min(1, y / 1.15));
  return merge(b, detail(string));
}

function ticketBoothBuild(): Geo {
  const base = stripedLod(drumProfile(0.85, 1.0), 12, 2, 1, 'coral', 'ivory');
  const cabin = translate(revolve([[0.8, 0], [0.8, 1.2]], 'butter', 12), 0, 1.0, 0);
  const window = detail(merge(boxAt(0.8, 0.6, 0.06, 'blueLight', 0, 1.35, 0.79), boxAt(0.6, 0.05, 0.25, 'timber', 0, 1.25, 0.85)));
  const roof = translate(stripedLod(canopyProfile(1.1, 0.9), 12, 2, 1, 'coral', 'ivory'), 0, 2.2, 0);
  const finial = translate(sphere(0.12, 'butter', 6, 4), 0, 3.15, 0);
  const sign = merge(boxAt(1.0, 0.3, 0.06, 'ivory', 0, 2.0, 0.84), detail(boxAt(0.8, 0.16, 0.08, 'blue', 0, 2.07, 0.84)));
  const flags = detail(merge([0, 1, 2, 3].map((i) => translate(pennant(BALLOON_COLS[i] ?? 'blue', 0.2, 0.25), -0.45 + i * 0.3, 2.18, 1.05))));
  const lights = bulbs(
    Array.from({ length: 12 }, (_, i) => {
      const a = ((i + 0.5) / 12) * Math.PI * 2;
      return [Math.sin(a) * 1.12, 2.12, Math.cos(a) * 1.12] as const;
    }),
  );
  return merge(base, cabin, window, roof, finial, sign, flags, lights);
}

export const TREAT_PROPS: readonly PropDef[] = [
  prop('cart.cottoncandy', cottonCandyBuild, [1.8, 0.9], 'stall', { tint: 'blue', tags: ['funfair', 'food', 'cart'] }),
  prop('cart.popcorn', popcornBuild, [1.7, 0.9], 'stall', { tint: 'coral', tags: ['funfair', 'food', 'cart'] }),
  prop('stand.toffeeapple', toffeeAppleBuild, [1.4, 0.7], 'stall', { tags: ['funfair', 'food', 'stall'] }),
  prop('balloon.bunch', bunchBuild, [0, 0], 'furniture', { origin: 'pivot', tint: 'coral', tags: ['funfair', 'carried', 'hand-anchor'] }),
  prop('balloon.single', singleBalloonBuild, [0, 0], 'clutter', { origin: 'pivot', tint: 'coral', tags: ['funfair', 'carried', 'hand-anchor'] }),
  prop('booth.ticket', ticketBoothBuild, [2.2, 2.2], 'stall', { tags: ['funfair', 'booth'] }),
];
