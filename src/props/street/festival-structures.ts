/** Festival structures: flag poles, maypole, gate arch, stage, podiums, ticket booth, balloon arch. */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  detail,
  farOnly,
  lathe,
  merge,
  profile,
  pyramid,
  rotateX,
  rotateY,
  sphere,
  sway,
  tintable,
  torus,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import { stripedSlab } from './awning';
import { bunting } from './festival-lines';
import { clamp01 } from './kit';

/* ---------------------------------------------------------------- flags */

/** Flag on a pole: tint-masked field with an ivory stripe, swaying more toward the fly end. */
export function flagPole(height = 5, shape: 'flag' | 'pennant' = 'flag', tint: ColorName = 'coral'): Geo {
  const pole = lathe([[0.06, 0], [0.04, 0.3], [0.03, height]], 'ivoryDeep', 5);
  const base = box(0.4, 0.1, 0.4, 'stone');
  const knob = detail(translate(sphere(0.05, 'butterDeep', 5, 3), 0, height + 0.03, 0));
  const field =
    shape === 'flag'
      ? merge(tintable(translate(box(1.1, 0.72, 0.03, tint), 0.58, 0, 0)), translate(box(1.1, 0.16, 0.034, 'ivory'), 0.58, 0.28, 0))
      : merge(tintable(translate(profile([[0, 0], [1.6, 0.25], [0, 0.5]], 0.03, tint), 0.03, 0, 0)), translate(profile([[0, 0.18], [0.7, 0.25], [0, 0.32]], 0.034, 'ivory'), 0.03, 0, 0));
  const flown = sway(field, (x) => clamp01(x / 1.4));
  const top = shape === 'flag' ? height - 0.8 : height - 0.55;
  return merge(pole, base, knob, translate(flown, 0, top, 0));
}

/* ---------------------------------------------------------------- maypole */

export function maypole(): Geo {
  const pole = lathe([[0.12, 0], [0.09, 0.4], [0.07, 5.0], [0.05, 5.2]], 'ivory', 6);
  const stripe = detail(merge([0, 1, 2, 3, 4, 5, 6].map((i) => translate(rotateY(box(0.2, 0.08, 0.04, 'coral'), i * 0.6), 0, 0.8 + i * 0.6, 0))));
  const crown = translate(torus(0.32, 0.07, 'sage', 3, 10), 0, 4.9, 0);
  const blooms = detail(merge([0, 1, 2, 3, 4, 5].map((i) => translate(sphere(0.06, i % 2 ? 'coral' : 'butter', 4, 2), Math.sin(i * 1.05) * 0.32, 4.95, Math.cos(i * 1.05) * 0.32))));
  const colors: readonly ColorName[] = ['coral', 'blue', 'butter', 'sage'];
  const ribbons = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const c = colors[i % colors.length] ?? 'coral';
    const g = beam([0, 4.85, 0], [Math.sin(a) * 2.6, 0.02, Math.cos(a) * 2.6], 0.035, c);
    return sway(i % 2 === 0 ? tintable(g) : g, (_x, y) => clamp01((4.85 - y) / 4.85) * 0.3);
  });
  const pegs = detail(merge(Array.from({ length: 8 }, (_, i) => translate(box(0.05, 0.12, 0.05, 'timberDeep'), Math.sin((i / 8) * Math.PI * 2) * 2.62, 0, Math.cos((i / 8) * Math.PI * 2) * 2.62))));
  const topper = translate(cone(0.08, 0.3, 'butterDeep', 6), 0, 5.2, 0);
  return merge(pole, stripe, crown, blooms, ribbons, pegs, topper);
}

/* ---------------------------------------------------------------- gate arch */

function stripedPillar(h: number, tint: ColorName): Geo {
  const core = tintable(box(0.5, h, 0.5, tint));
  const bands = Array.from({ length: Math.floor(h / 0.8) }, (_, i) => translate(box(0.52, 0.32, 0.52, 'ivory'), 0, 0.3 + i * 0.8, 0));
  const cap = translate(pyramid(0.62, 0.3, 0.62, 'butterDeep'), 0, h, 0);
  return merge(core, bands, cap);
}

export function festivalGate(span = 5, tint: ColorName = 'coral'): Geo {
  const h = 4.2;
  const pillars = [-1, 1].map((s) => translate(stripedPillar(h, tint), s * (span / 2), 0, 0));
  const arcPts: Array<readonly [number, number]> = [];
  const inner = span / 2 - 0.25;
  const outer = span / 2 + 0.05;
  for (let i = 0; i <= 8; i++) arcPts.push([-Math.cos((i / 8) * Math.PI) * outer, Math.sin((i / 8) * Math.PI) * 1.1 + 0.25]);
  for (let i = 8; i >= 0; i--) arcPts.push([-Math.cos((i / 8) * Math.PI) * inner, Math.sin((i / 8) * Math.PI) * 0.85]);
  const arch = translate(profile(arcPts, 0.3, 'ivory'), 0, h - 0.6, 0);
  const sign = translate(box(span * 0.55, 0.6, 0.08, 'butter'), 0, h + 0.35, 0.2);
  const letters = detail(merge(Array.from({ length: 6 }, (_, i) => translate(box(0.22, 0.3, 0.02, i % 2 ? 'coralDeep' : 'blueDeep'), (i - 2.5) * span * 0.08, h + 0.5, 0.25))));
  const flags = [-1, 1].map((s) => translate(smallFlag(), s * (span / 2), h + 0.3, 0));
  const line = bunting([-span / 2, h - 0.2, 0.3], [span / 2, h - 0.2, 0.3], { sag: 0.5 }).geo;
  return merge(pillars, arch, sign, letters, flags, line);
}

function smallFlag(): Geo {
  const pole = beam([0, 0, 0], [0, 1.2, 0], 0.04, 'ivoryDeep');
  const flag = sway(tintable(translate(profile([[0, 0], [0.7, 0.18], [0, 0.36]], 0.025, 'coral'), 0.02, 0.8, 0)), (x) => clamp01(x / 0.7));
  return merge(pole, flag);
}

/* ---------------------------------------------------------------- stage */

export interface StageOptions {
  readonly width?: number;
  readonly depth?: number;
  readonly height?: number;
  readonly tint?: ColorName;
}

export interface StageResult {
  readonly geo: Geo;
  readonly footprint: readonly [number, number];
  /** standing height of the deck surface */
  readonly deckY: number;
  /** deck rectangle in prop space (performers stand inside it) */
  readonly deck: { readonly x0: number; readonly z0: number; readonly x1: number; readonly z1: number };
  /** foot of the steps, for walking up */
  readonly stepsFoot: { readonly x: number; readonly z: number; readonly heading: number };
}

/** Small festival stage: striped skirt, side steps, speakers and a striped backdrop. Front faces +z. */
export function stage(opts: StageOptions = {}): StageResult {
  const w = opts.width ?? 4;
  const d = opts.depth ?? 3;
  const h = opts.height ?? 0.8;
  const tint = opts.tint ?? 'coral';
  const deck = translate(box(w, 0.08, d, 'timber'), 0, h - 0.08, 0);
  const skirt = translate(box(w - 0.06, h - 0.08, d - 0.06, 'ivory'), 0, 0, 0);
  const n = Math.max(3, Math.round(w / 0.5));
  const bands = Array.from({ length: n }, (_, i) => (i % 2 === 0 ? [tintable(translate(box(w / n, h - 0.1, 0.02, tint), -w / 2 + (i + 0.5) * (w / n), 0, d / 2 - 0.02))] : [])).flat();
  const steps = [0, 1, 2].map((i) => translate(box(0.9, ((i + 1) * h) / 4, 0.32, 'timberDeep'), w / 2 + 0.45, 0, d / 2 - 0.3 - (2 - i) * 0.32));
  const speakers = [-1, 1].map((s) => translate(box(0.5, 0.8, 0.45, 'ink'), s * (w / 2 - 0.35), h, d / 2 - 0.35));
  const cones = detail(merge([-1, 1].flatMap((s) => [0.25, 0.58].map((y) => translate(sphere(0.12, 'slate', 6, 3), s * (w / 2 - 0.35), h + y, d / 2 - 0.12)))));
  const posts = [-1, 1].map((s) => beam([s * (w / 2 - 0.1), h, -d / 2 + 0.1], [s * (w / 2 - 0.1), h + 2.6, -d / 2 + 0.1], 0.1, 'timberDeep'));
  const backdrop = translate(rotateX(stripedSlab(w - 0.3, 2.2, tint, 0.5), Math.PI / 2), 0, h + 1.3, -d / 2 + 0.12);
  const lights = detail(merge(beam([-w / 2, h + 2.6, -d / 2 + 0.1], [w / 2, h + 2.6, -d / 2 + 0.1], 0.06, 'ink'), [-1, 0, 1].map((i) => translate(box(0.16, 0.2, 0.2, 'slate'), i * w * 0.3, h + 2.38, -d / 2 + 0.25))));
  return {
    geo: merge(deck, skirt, bands, steps, speakers, cones, posts, backdrop, lights),
    footprint: [w + 0.9, d],
    deckY: h,
    deck: { x0: -w / 2 + 0.1, z0: -d / 2 + 0.3, x1: w / 2 - 0.1, z1: d / 2 - 0.1 },
    stepsFoot: { x: w / 2 + 0.45, z: d / 2 + 0.3, heading: Math.PI },
  };
}

/* ---------------------------------------------------------------- podiums, booth, balloon arch */

export function winnersPodium(): Geo {
  const blocks: ReadonlyArray<readonly [number, number, ColorName]> = [
    [0, 0.6, 'butter'],
    [-0.75, 0.42, 'ivoryShade'],
    [0.75, 0.3, 'clay'],
  ];
  const steps = blocks.map(([x, h, c]) => translate(box(0.72, h, 0.7, c), x, 0, 0));
  const numbers = detail(merge(blocks.map(([x, h], i) => merge(Array.from({ length: i + 1 }, (_, k) => translate(box(0.06, 0.2, 0.02, 'ink'), x + (k - i / 2) * 0.1, h * 0.35, 0.36))))));
  return merge(steps, numbers);
}

export function lectern(): Geo {
  const step = box(1.0, 0.2, 0.8, 'timberDeep');
  const desk = translate(box(0.6, 1.0, 0.4, 'timber'), 0, 0.2, -0.1);
  const top = translate(box(0.66, 0.05, 0.48, 'timberDeep'), 0, 1.2, -0.08);
  const crest = tintable(translate(box(0.36, 0.36, 0.03, 'coral'), 0, 0.6, 0.11));
  const mic = detail(merge(beam([0, 1.25, 0], [0, 1.45, 0.08], 0.015, 'ink'), translate(sphere(0.03, 'ink', 4, 2), 0, 1.46, 0.09)));
  return merge(step, desk, top, crest, mic);
}

export function ticketBooth(tint: ColorName = 'coral'): Geo {
  const body = box(1.4, 2.1, 1.2, 'ivory');
  const window = translate(box(0.9, 0.6, 0.04, 'ink'), 0, 1.1, 0.6);
  const shelf = translate(box(1.0, 0.05, 0.3, 'timber'), 0, 1.0, 0.72);
  const roof = translate(tintable(pyramid(1.8, 0.7, 1.6, tint)), 0, 2.1, 0);
  const valance = translate(box(1.6, 0.18, 1.4, 'ivory'), 0, 1.95, 0);
  const stripes = [-0.45, 0, 0.45].map((x) => tintable(translate(box(0.2, 1.4, 0.03, tint), x, 0.05, 0.6)));
  const sign = detail(merge(translate(box(0.8, 0.22, 0.03, 'butter'), 0, 1.75, 0.61), [0, 1, 2, 3].map((i) => translate(box(0.1, 0.12, 0.01, 'cocoa'), -0.24 + i * 0.16, 1.8, 0.63))));
  const flag = translate(smallFlag(), 0, 2.75, 0);
  return merge(body, window, shelf, roof, valance, stripes, sign, flag);
}

export function balloonArch(span = 4, tint: ColorName = 'coral'): Geo {
  const r = span / 2;
  const n = 30;
  const colors: readonly ColorName[] = [tint, 'ivory', 'butter'];
  const near = Array.from({ length: n }, (_, i) => {
    const a = (i / (n - 1)) * Math.PI;
    const c = colors[i % 3] ?? 'ivory';
    const g = translate(blob(0.22, 0.26, 0.22, c, 5, 3), -Math.cos(a) * r, 0.3 + Math.sin(a) * r * 1.05, (i % 2) * 0.18 - 0.09);
    return c === tint ? tintable(g) : g;
  });
  const far = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 10) * Math.PI;
    const g = translate(blob(0.32, 0.34, 0.3, i % 2 ? 'ivory' : tint, 4, 3), -Math.cos(a) * r, 0.36 + Math.sin(a) * r * 1.05, 0);
    return i % 2 ? g : tintable(g);
  });
  const weights = [-1, 1].map((s) => translate(box(0.36, 0.22, 0.36, 'slate'), s * r, 0, 0));
  return merge(detail(merge(near)), farOnly(merge(far)), weights);
}
