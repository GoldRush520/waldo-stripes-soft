/** Construction site: modular scaffolding, a half-built timber house frame and hoarding panels. */
import { type Col, type Geo, cyl, merge, rotateY, translate } from '../../core/geo';
import { type Floor, boxAt, lod, range, segBox, steps } from './util';

export interface ScaffoldOpts {
  readonly bayW?: number;
  readonly levelH?: number;
  readonly depth?: number;
  readonly pole?: Col;
  /** toe-board stripe colours */
  readonly a?: Col;
  readonly b?: Col;
}

export interface ScaffoldResult {
  readonly geo: Geo;
  /** one walkable deck per level (deck top y), bottom level first */
  readonly decks: readonly Floor[];
  readonly width: number;
  readonly height: number;
}

const PLANK = 0.05;

/**
 * Scaffold along x (front face +z). Poles, ledgers and braces are near-only detail; the far tier
 * gets thin slab stand-ins for the standards plus one slab per deck.
 */
export function scaffold(bays: number, levels: number, o: ScaffoldOpts = {}): ScaffoldResult {
  const bw = o.bayW ?? 2.0;
  const lh = o.levelH ?? 2.0;
  const D = o.depth ?? 1.0;
  const pole = o.pole ?? 'slate';
  const W = bays * bw;
  const H = levels * lh + 1.0;
  const xs = steps(-W / 2, W / 2, bays);
  const zs = [D / 2, -D / 2];
  const deckYs = range(levels).map((l) => (l + 1) * lh);
  const standards = xs.flatMap((x) => zs.map((z) => translate(cyl(0.03, 0.03, H, pole, 6, false), x, 0, z)));
  const ledgers = deckYs.flatMap((y) => zs.flatMap((z) => [boxAt(W, 0.05, 0.05, pole, 0, y - 0.1, z), boxAt(W, 0.05, 0.05, pole, 0, y + 1.0, z)]));
  const transoms = deckYs.flatMap((y) => xs.map((x) => boxAt(0.05, 0.05, D + 0.1, pole, x, y - 0.1, 0)));
  const braces = range(bays).flatMap((i) => {
    const x0 = xs[i] ?? 0;
    const x1 = xs[i + 1] ?? x0;
    return i % 2 ? [segBox(x0, 0.1, x1, H - 1.1, 0.04, 0.04, pole, D / 2 + 0.05)] : [segBox(x1, 0.1, x0, H - 1.1, 0.04, 0.04, pole, D / 2 + 0.05)];
  });
  const planks = deckYs.flatMap((y) => range(4).map((k) => boxAt(W, PLANK, D / 4 - 0.03, k % 2 ? 'timber' : 'clayLight', 0, y - PLANK, -D / 2 + (k + 0.5) * (D / 4))));
  const toes = deckYs.flatMap((y) => range(bays * 2).map((k) => boxAt(bw / 2, 0.15, 0.03, k % 2 ? o.b ?? 'ivory' : o.a ?? 'coral', -W / 2 + (k + 0.5) * (bw / 2), y, D / 2 - 0.04)));
  const far = [
    ...xs.flatMap((x) => zs.map((z) => boxAt(0.07, H, 0.07, pole, x, 0, z))),
    ...deckYs.map((y) => boxAt(W, PLANK, D, 'timber', 0, y - PLANK, 0)),
    ...deckYs.map((y) => boxAt(W, 0.15, 0.03, o.a ?? 'coral', 0, y, D / 2 - 0.04)),
  ];
  const decks = deckYs.map((y) => ({ x0: -W / 2 + 0.05, x1: W / 2 - 0.05, z0: -D / 2 + 0.05, z1: D / 2 - 0.05, y }));
  return { geo: lod([...standards, ...ledgers, ...transoms, ...braces, ...planks, ...toes], far), decks, width: W, height: H };
}

export interface FrameResult {
  readonly geo: Geo;
  /** walkable floor platform top */
  readonly floorY: number;
}

/** Wall studs along x from -len/2..len/2, with a gap for an opening [g0, g1] (x). */
function studWall(len: number, h: number, gap: readonly [number, number] | null, c: Col): Geo[] {
  const xs = steps(-len / 2 + 0.05, len / 2 - 0.05, Math.max(2, Math.round(len / 0.6)));
  return [
    ...xs.filter((x) => !gap || x < gap[0] || x > gap[1]).map((x) => boxAt(0.08, h, 0.12, c, x, 0, 0)),
    ...(gap ? [boxAt(gap[1] - gap[0] + 0.1, 0.16, 0.12, c, (gap[0] + gap[1]) / 2, 2.1, 0)] : []),
  ];
}

/** Half-built house: floor platform, stud walls, top plates and rafters (ridge along x). */
export function houseFrame(w = 6, d = 5, c: Col = 'timber'): FrameResult {
  const fy = 0.3;
  const wallH = 2.7;
  const pitch = 1.8;
  const top = fy + wallH;
  const always = [
    boxAt(w + 0.2, fy, d + 0.2, 'clayLight', 0, 0, 0),
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.16, wallH, 0.16, 'timberDeep', sx * (w / 2 - 0.08), fy, sz * (d / 2 - 0.08)))),
    ...[-1, 1].map((sz) => boxAt(w, 0.12, 0.14, 'timberDeep', 0, top, sz * (d / 2 - 0.08))),
    ...[-1, 1].map((sx) => boxAt(0.14, 0.12, d, 'timberDeep', sx * (w / 2 - 0.08), top, 0)),
    boxAt(w + 0.3, 0.16, 0.12, 'timberDeep', 0, top + pitch, 0),
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => translate(rotateY(segBox(-sz * (d / 2), top, 0, top + pitch, 0.12, 0.12, 'timberDeep'), Math.PI / 2), sx * (w / 2), 0, 0))),
  ];
  const rafters = steps(-w / 2 + 0.6, w / 2 - 0.6, Math.max(1, Math.round(w / 0.6) - 2)).flatMap((x) =>
    [-1, 1].map((sz) => translate(rotateY(segBox(-sz * (d / 2 + 0.2), top - 0.1, 0, top + pitch, 0.1, 0.06, c), Math.PI / 2), x, 0, 0)),
  );
  const walls = [
    ...studWall(w, wallH, [-0.6, 0.6], c).map((g) => translate(g, 0, fy, d / 2 - 0.08)),
    ...studWall(w, wallH, [1.0, 2.2], c).map((g) => translate(g, 0, fy, -d / 2 + 0.08)),
    ...[-1, 1].flatMap((sx) => studWall(d, wallH, null, c).map((g) => translate(rotateY(g, Math.PI / 2), sx * (w / 2 - 0.08), fy, 0))),
  ];
  const near = [
    ...walls,
    ...rafters,
    segBox(w / 2 - 1.5, fy, w / 2 - 0.3, top + 0.4, 0.06, 0.06, 'timberDeep', 1.0),
    segBox(w / 2 - 1.5, fy, w / 2 - 0.3, top + 0.4, 0.06, 0.06, 'timberDeep', 1.4),
    ...range(8).map((i) => {
      const t = (i + 0.5) / 8;
      return boxAt(0.06, 0.04, 0.44, 'timber', w / 2 - 1.5 + t * 1.2, fy + t * (top + 0.4 - fy), 1.2);
    }),
    ...range(5).map((i) => boxAt(2.4, 0.08, 0.2, 'timber', -w / 2 + 1.6, fy + i * 0.08, -0.5 + i * 0.03)),
  ];
  return { geo: merge(always, lod(near, [])), floorY: fy };
}

/** Site hoarding: plywood panels on struts with striped header and poster blocks (front +z). */
export function hoarding(length: number, h = 2.2, a: Col = 'coral', b: Col = 'ivory'): Geo {
  const n = Math.max(1, Math.round(length / 1.2));
  const pw = length / n;
  const xs = range(n).map((i) => -length / 2 + (i + 0.5) * pw);
  const posters: readonly Col[] = ['blue', 'butter', 'sage', 'coralLight'];
  const near = [
    ...xs.map((x, i) => boxAt(pw - 0.02, h - 0.3, 0.04, i % 2 ? 'clayLight' : 'sand', x, 0.05, 0)),
    ...xs.flatMap((x) => [boxAt(pw / 2, 0.25, 0.05, a, x - pw / 4, h - 0.25, 0), boxAt(pw / 2, 0.25, 0.05, b, x + pw / 4, h - 0.25, 0)]),
    ...xs.filter((_, i) => i % 2 === 0).map((x, i) => boxAt(pw * 0.6, 0.8, 0.02, posters[i % 4] ?? 'blue', x, 0.8, 0.03)),
    ...xs.map((x) => translate(rotateY(segBox(-0.6, 0, 0, h - 0.6, 0.06, 0.06, 'timberDeep'), -Math.PI / 2), x, 0, -0.05)),
  ];
  const far = [boxAt(length, h - 0.3, 0.04, 'clayLight', 0, 0.05, 0), boxAt(length, 0.25, 0.05, a, 0, h - 0.25, 0)];
  return translate(lod(near, far), 0, 0, 0.3);
}
