/** Signposts with arrows, street clock, planters and tubs, flower beds (tint-masked blooms). */
import {
  type Geo,
  beam,
  blob,
  box,
  cyl,
  detail,
  disc,
  farOnly,
  lathe,
  merge,
  profile,
  pyramid,
  rotateX,
  rotateY,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { prop, topCyl } from './kit';

/* ---------------------------------------------------------------- signposts */

const ARROW_COLORS: readonly ColorName[] = ['ivory', 'butter', 'blue', 'coral', 'sage'];

function arrow(len: number, color: ColorName, dir: 1 | -1): Geo {
  const plank = translate(box(len, 0.16, 0.04, color), (dir * len) / 2 + dir * 0.05, -0.08, 0);
  const tip = translate(profile([[0, -0.08], [dir * 0.12, 0], [0, 0.08]], 0.04, color), dir * (len + 0.05), 0, 0);
  const letters = [0, 1, 2].map((i) => translate(box(len * 0.2, 0.05, 0.006, 'ink'), dir * (0.12 + i * len * 0.27), -0.025, 0.022));
  return merge(plank, detail(merge(tip, letters)));
}

function signpost(n: number): Geo {
  const rng = createRng(`signpost.${n}`);
  const post = beam([0, 0, 0], [0, 1.9 + n * 0.22, 0], 0.08, 'timberDeep');
  const arrows = Array.from({ length: n }, (_, i) => {
    const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
    const g = arrow(0.55 + rng.next() * 0.2, ARROW_COLORS[i % ARROW_COLORS.length] ?? 'ivory', dir);
    return translate(rotateY(g, (rng.next() - 0.5) * 1.2), 0, 1.85 + i * 0.22, 0);
  });
  const cap = detail(translate(pyramid(0.12, 0.08, 0.12, 'timberDeep'), 0, 1.9 + n * 0.22, 0));
  return merge(post, arrows, cap);
}

/* ---------------------------------------------------------------- street clock */

function streetClock(): Geo {
  const post = lathe([[0.16, 0], [0.12, 0.35], [0.06, 0.5], [0.06, 2.6]], 'blueDeep', 6);
  const head = translate(rotateX(cyl(0.3, 0.3, 0.2, 'blueDeep', 10), Math.PI / 2), 0, 2.95, -0.1);
  const faces = [-1, 1].map((s) => translate(rotateX(disc(0.25, 'ivory', 10), (s * Math.PI) / 2), 0, 2.95, s * 0.105));
  const hands = [-1, 1].flatMap((s) => [
    translate(box(0.02, 0.18, 0.01, 'ink'), 0, 2.95, s * 0.115),
    translate(box(0.12, 0.02, 0.01, 'ink'), 0.05, 2.94, s * 0.115),
  ]);
  const finial = translate(sphere(0.05, 'butterDeep', 5, 3), 0, 3.3, 0);
  return merge(post, head, detail(merge(faces, hands, finial)));
}

/* ---------------------------------------------------------------- planters and beds */

/** Bloom spots scattered over an area (seeded), tint-masked except a few fixed accent colours. */
function blooms(w: number, d: number, y: number, n: number, seed: string): Geo {
  const rng = createRng(seed);
  const accents: readonly ColorName[] = ['butter', 'ivory', 'blueLight'];
  return merge(
    Array.from({ length: n }, (_, i) => {
      const g = translate(sphere(0.045, accents[i % 3] ?? 'butter', 4, 2), (rng.next() - 0.5) * w, y + rng.next() * 0.06, (rng.next() - 0.5) * d);
      return i % 3 === 0 ? g : tintable(g);
    }),
  );
}

function planterBox(len: number): Geo {
  const body = box(len, 0.4, 0.4, 'timber');
  const rimBand = detail(translate(box(len + 0.02, 0.04, 0.42, 'timberDeep'), 0, 0.36, 0));
  const greens = translate(blob(len * 0.48, 0.12, 0.2, 'sage', 6, 2), 0, 0.42, 0);
  const flowers = detail(blooms(len * 0.85, 0.3, 0.48, Math.round(len * 9), `planter.${len}`));
  const far = farOnly(tintable(translate(pyramid(len * 0.85, 0.16, 0.3, 'coral'), 0, 0.44, 0)));
  return merge(body, rimBand, detail(greens), flowers, far);
}

function planterTub(): Geo {
  const tub = topCyl(0.25, 0.3, 0.45, 'clay', 8);
  const hoops = detail(merge([0.08, 0.36].map((y) => translate(cyl(0.29 - y * 0.1, 0.29 - y * 0.1, 0.03, 'timberDeep', 8, false), 0, y, 0))));
  const greens = detail(translate(blob(0.28, 0.14, 0.28, 'sage', 6, 3), 0, 0.5, 0));
  const flowers = detail(blooms(0.4, 0.4, 0.58, 9, 'tub'));
  const far = farOnly(tintable(translate(pyramid(0.46, 0.2, 0.46, 'coral'), 0, 0.45, 0)));
  return merge(tub, hoops, greens, flowers, far);
}

function planterUrn(): Geo {
  const urn = lathe([[0.15, 0], [0.12, 0.12], [0.08, 0.2], [0.2, 0.42], [0.27, 0.6], [0.29, 0.66]], 'stone', 7);
  const greens = detail(translate(blob(0.26, 0.14, 0.26, 'sageDeep', 6, 3), 0, 0.68, 0));
  const flowers = detail(blooms(0.38, 0.38, 0.76, 8, 'urn'));
  const trails = detail(merge([0, 1, 2].map((i) => translate(blob(0.04, 0.14, 0.04, 'sage', 4, 2), Math.sin(i * 2.1) * 0.27, 0.58, Math.cos(i * 2.1) * 0.27))));
  const far = farOnly(tintable(translate(pyramid(0.44, 0.2, 0.44, 'coral'), 0, 0.64, 0)));
  return merge(urn, greens, flowers, trails, far);
}

function roundBed(r: number): Geo {
  const kerb = lathe([[r, 0], [r, 0.16], [r - 0.1, 0.16], [r - 0.1, 0.1]], 'stone', 10);
  const soil = translate(disc(r - 0.08, 'clayDeep', 10), 0, 0.12, 0);
  const shrubs = detail(merge([0, 1, 2, 3, 4].map((i) => translate(blob(0.22, 0.16, 0.22, i % 2 ? 'sage' : 'sageDeep', 5, 2), Math.sin(i * 1.26) * r * 0.5, 0.18, Math.cos(i * 1.26) * r * 0.5))));
  const flowers = detail(blooms(r * 1.3, r * 1.3, 0.24, Math.round(r * 14), `bed.${r}`));
  const far = farOnly(tintable(translate(disc(r - 0.12, 'coral', 8), 0, 0.2, 0)));
  return merge(kerb, soil, shrubs, flowers, far);
}

function longBed(len: number): Geo {
  const kerb = merge([-1, 1].map((s) => translate(box(len, 0.16, 0.08, 'stone'), 0, 0, s * 0.36)), [-1, 1].map((s) => translate(box(0.08, 0.16, 0.64, 'stone'), s * (len / 2 - 0.04), 0, 0)));
  const soil = translate(box(len - 0.16, 0.1, 0.64, 'clayDeep'), 0, 0.02, 0);
  const shrubs = detail(merge(Array.from({ length: Math.round(len / 0.6) }, (_, i) => translate(blob(0.24, 0.14, 0.2, i % 2 ? 'sage' : 'sageDeep', 5, 2), -len / 2 + 0.35 + i * 0.6, 0.16, 0))));
  const flowers = detail(blooms(len - 0.3, 0.5, 0.2, Math.round(len * 7), `long.${len}`));
  const far = farOnly(tintable(translate(box(len - 0.2, 0.08, 0.5, 'coral'), 0, 0.12, 0)));
  return merge(kerb, soil, shrubs, flowers, far);
}

export const SIGN_PLANTER_PROPS: readonly PropDef[] = [
  prop('signpost.arrows', [0.2, 0.2], 'furniture', () => signpost(3), { tags: ['street', 'sign', 'overhang'] }),
  prop('signpost.tall', [0.2, 0.2], 'furniture', () => signpost(5), { tags: ['street', 'sign', 'overhang', 'comedy'] }),
  prop('clock.street', [0.34, 0.34], 'furniture', streetClock, { tags: ['street', 'civic', 'landmark-small'] }),
  prop('planter.box', [1.2, 0.4], 'furniture', () => planterBox(1.2), { tint: 'coral', tags: ['street', 'flowers'] }),
  prop('planter.box.short', [0.7, 0.4], 'small', () => planterBox(0.7), { tint: 'coral', tags: ['street', 'flowers'] }),
  prop('planter.tub', [0.6, 0.6], 'furniture', planterTub, { tint: 'coral', tags: ['street', 'cafe', 'flowers'] }),
  prop('planter.urn', [0.58, 0.58], 'furniture', planterUrn, { tint: 'coral', tags: ['street', 'flowers'] }),
  prop('flowerbed.round', [2.4, 2.4], 'furniture', () => roundBed(1.2), { tint: 'coral', tags: ['street', 'park', 'flowers'] }),
  prop('flowerbed.long', [3.0, 0.8], 'furniture', () => longBed(3.0), { tint: 'butter', tags: ['street', 'park', 'flowers'] }),
];
