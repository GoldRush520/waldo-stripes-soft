/** Funfair facades and fittings: funhouse, mirror maze, queue rail, festoon arch, giant teddy. */
import { type Col, type Geo, beam, blob, cyl, detail, disc, merge, profile, rotateX, rotateY, sphere, tintable, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type V3, boxAt, bulbs, lodPair, pennant, prop, rope, softBox, stripesX } from './kit';

function facadeBody(w: number, h: number, d: number, col: Col): Geo {
  return merge(translate(softBox(w, h, d, 0.08, col), 0, 0, -d / 2), boxAt(w + 0.2, 0.25, d + 0.2, 'clay', 0, h, -d / 2));
}

function wobblyStairs(): Geo {
  const steps = Array.from({ length: 5 }, (_, i) =>
    translate(rotateY(rotateX(softBox(1.8, 0.16, 0.42, 0.04, i % 2 === 0 ? 'butter' : 'sage'), (i % 2 === 0 ? 1 : -1) * 0.06), (i - 2) * 0.08), 0, 0.17 * i, 2.1 - i * 0.4),
  );
  const rails = [-1, 1].map((s) => rope([s * 1.0, 1.0, 2.3], [s * 1.0, 1.85, 0.3], 0.04, 'coral'));
  const posts = detail(merge([-1, 1].flatMap((s) => [2.3, 0.3].map((z) => boxAt(0.06, z > 1 ? 1.0 : 1.85, 0.06, 'timberDeep', s * 1.0, 0, z)))));
  return merge(steps, rails, posts);
}

function funhouseBuild(): Geo {
  const w = 8;
  const h = 6;
  const body = facadeBody(w, h, 4.5, 'butterLight');
  const band = translate(stripesX(w, 0.6, 0.06, 13, 'coral', 'ivory'), 0, h - 0.7, 0.03);
  const gable = translate(profile([[-3, 0], [3, 0], [2.2, 1.4], [0.8, 2.1], [-0.8, 2.1], [-2.2, 1.4]], 0.3, 'coral'), 0, h, -0.2);
  const eyes = merge([-1.6, 1.6].map((x) => merge(translate(rotateX(disc(0.7, 'ivory', 14), Math.PI / 2), x, 3.9, 0.03), translate(rotateX(disc(0.3, 'blueDeep', 10), Math.PI / 2), x + 0.1, 3.8, 0.05))));
  const mouth = merge(boxAt(3.2, 1.9, 0.08, 'cocoa', 0, 1.0, 0.02), translate(stripesX(3.6, 0.25, 0.08, 9, 'ivory', 'coralDeep', false), 0, 2.9, 0.06));
  const nose = translate(sphere(0.45, 'coral', 8, 5), 0, 3.2, 0.25);
  const lights = bulbs(Array.from({ length: 18 }, (_, i) => [-3.8 + i * (7.6 / 17), h - 0.1, 0.12] as const));
  const pennants = detail(merge(Array.from({ length: 10 }, (_, i) => translate(pennant(i % 2 === 0 ? 'blue' : 'butter', 0.4, 0.45), -3.6 + i * 0.8, h + 0.25, 0.2))));
  return merge(body, band, gable, eyes, mouth, nose, wobblyStairs(), lights, pennants);
}

function mirrorMazeBuild(): Geo {
  const w = 7;
  const h = 4.5;
  const body = facadeBody(w, h, 5, 'blueLight');
  const arch = translate(
    profile([[-1.6, 0], [-1.6, 2.2], [-1.1, 2.9], [0, 3.2], [1.1, 2.9], [1.6, 2.2], [1.6, 0], [1.2, 0], [1.2, 2.1], [0.8, 2.6], [0, 2.8], [-0.8, 2.6], [-1.2, 2.1], [-1.2, 0]], 0.3, 'butter'),
    0,
    0,
    0.15,
  );
  const opening = boxAt(2.4, 2.2, 0.06, 'blueDeep', 0, 0, 0.02);
  const mirrors = detail(merge([-0.7, 0, 0.7].map((x, i) => rotateY(boxAt(0.6, 1.9, 0.05, 'white', x, 0.05, -0.6 - i * 0.2), 0.3 * (i - 1)))));
  const panels = merge([-1, 1].flatMap((s) => [2.5, 3.2].map((x) => boxAt(0.5, 2.2, 0.06, 'white', s * x, 0.8, 0.03))));
  const crest = translate(stripesX(w, 0.5, 0.08, 11, 'blue', 'ivory'), 0, h - 0.6, 0.04);
  const sign = merge(boxAt(3.4, 0.7, 0.1, 'ivory', 0, h + 0.25, 0.0), detail(merge(Array.from({ length: 6 }, (_, i) => boxAt(0.35, 0.4, 0.06, 'blueDeep', -1.25 + i * 0.5, h + 0.4, 0.06)))));
  const lights = bulbs([
    ...Array.from({ length: 12 }, (_, i) => {
      const a = Math.PI * (i / 11);
      return [-Math.cos(a) * 1.7, 2.2 + Math.sin(a) * 1.05, 0.32] as const;
    }),
    ...Array.from({ length: 14 }, (_, i) => [-3.25 + i * 0.5, h - 0.1, 0.12] as const),
  ]);
  return merge(body, arch, opening, mirrors, panels, crest, sign, lights);
}

/** Queue barrier rail of any length along x, centred: posts every ≤ 2 m with two rails. */
export function queueRail(len: number): Geo {
  const n = Math.max(1, Math.ceil(len / 2));
  const xs = Array.from({ length: n + 1 }, (_, i) => -len / 2 + (i * len) / n);
  const posts = xs.map((x) => boxAt(0.07, 1.0, 0.07, 'butter', x, 0, 0));
  const bases = detail(merge(xs.map((x) => boxAt(0.22, 0.04, 0.22, 'slate', x, 0, 0))));
  const top = boxAt(len, 0.05, 0.05, 'coral', 0, 0.95, 0);
  const low = detail(boxAt(len, 0.05, 0.05, 'ivory', 0, 0.55, 0));
  return merge(posts, bases, top, low);
}

function festoonArchBuild(): Geo {
  const span = 6;
  const h = 4.2;
  const posts = [-1, 1].map((s) => merge(boxAt(0.3, h, 0.3, 'coral', s * span / 2, 0, 0), boxAt(0.5, 0.3, 0.5, 'clay', s * span / 2, 0, 0)));
  const curve: V3[] = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI * (i / 12);
    return [-Math.cos(a) * (span / 2), h + Math.sin(a) * 1.3, 0];
  });
  const archNear = merge(curve.slice(0, -1).map((p, i) => beam(p, curve[i + 1] ?? p, 0.2, 'butter')));
  const archFar = merge(curve.filter((_, i) => i % 3 === 0).slice(0, -1).map((p, i) => beam(p, curve[(i + 1) * 3] ?? p, 0.22, 'butter')));
  const lamps = bulbs(curve.map((p) => [p[0], p[1] - 0.16, 0.12] as const), 'butterLight', 0.08);
  const festoon: V3[] = Array.from({ length: 17 }, (_, i) => {
    const t = i / 16;
    return [-span / 2 + t * span, h - 0.2 - Math.sin(Math.PI * t) * 0.7, 0];
  });
  const wire = detail(merge(festoon.slice(0, -1).map((p, i) => beam(p, festoon[i + 1] ?? p, 0.02, 'cocoa'))));
  const sign = merge(boxAt(3.2, 0.7, 0.12, 'ivory', 0, h + 0.85, 0), detail(merge(Array.from({ length: 7 }, (_, i) => boxAt(0.32, 0.42, 0.06, 'coral', -1.2 + i * 0.4, h + 0.99, 0.08)))));
  return merge(posts, lodPair(archNear, archFar), lamps, wire, bulbs(festoon.map((p) => [p[0], p[1] - 0.08, p[2]] as const), 'coralLight'), sign);
}

function teddyBuild(): Geo {
  const c: Col = 'clay';
  const body = blob(0.42, 0.48, 0.36, c, 7, 5);
  const head = translate(sphere(0.32, c, 7, 5), 0, 0.72, 0.05);
  const ears = merge([-1, 1].map((s) => translate(sphere(0.12, c, 5, 3), s * 0.24, 0.98, 0)));
  const muzzle = translate(blob(0.14, 0.1, 0.1, 'ivory', 5, 3), 0, 0.64, 0.33);
  const legs = merge([-1, 1].map((s) => translate(rotateX(cyl(0.15, 0.15, 0.45, c, 5), Math.PI / 2), s * 0.24, -0.3, 0.05)));
  const arms = merge([-1, 1].map((s) => translate(blob(0.12, 0.3, 0.12, c, 5, 3), s * 0.45, 0.05, 0.1)));
  const bow = boxAt(0.36, 0.14, 0.06, 'coral', 0, 0.35, 0.31);
  const face = detail(merge(boxAt(0.07, 0.05, 0.04, 'ink', 0, 0.68, 0.43), boxAt(0.05, 0.06, 0.03, 'ink', -0.11, 0.8, 0.32), boxAt(0.05, 0.06, 0.03, 'ink', 0.11, 0.8, 0.32)));
  const furry = tintable(merge(body, head, ears, legs, arms));
  const near = merge(furry, muzzle, bow, face);
  const far = merge(tintable(merge(blob(0.42, 0.48, 0.36, c, 6, 4), translate(sphere(0.32, c, 5, 3), 0, 0.72, 0.05))), bow);
  return translate(lodPair(near, far), 0, 0.48, 0);
}

export const ATTRACTION_PROPS: readonly PropDef[] = [
  prop('fair.funhouse', funhouseBuild, [8.2, 4.7], 'house', { tags: ['funfair', 'facade'] }),
  prop('fair.mirrormaze', mirrorMazeBuild, [7.2, 5.2], 'house', { tags: ['funfair', 'facade'] }),
  prop('fair.queuerail', () => queueRail(4), [4, 0.1], 'furniture', { tags: ['funfair', 'barrier', 'parametric'] }),
  prop('fair.queuerail.8', () => queueRail(8), [8, 0.1], 'furniture', { tags: ['funfair', 'barrier', 'parametric'] }),
  prop('fair.festoonarch', festoonArchBuild, [6.5, 0.5], 'stall', { tags: ['funfair', 'arch', 'lights'] }),
  prop('fair.teddy', teddyBuild, [0.9, 0.9], 'furniture', { tint: 'clay', tags: ['funfair', 'prize'] }),
];
