/**
 * Canal bridges, part 1: stone arch, iron lattice footbridge, covered timber bridge.
 *
 * Every bridge spans along x, centred on the origin, for a 10 m canal whose banks are at x = ±5,
 * bank level y = 0 and water y = -1. `deck` is the walking-surface height profile along the span.
 */
import { type Col, type Geo, gable, merge, profile, rotateY, rotateZ, box, tintable, translate } from '../../core/geo';
import { profileRail } from './fences';
import { lampPost } from './fixtures';
import {
  type DeckPoint,
  type P2,
  boxAt,
  deckXs,
  deckY,
  hump,
  jitter,
  lod,
  plateau,
  range,
  sampleDeck,
  segBox,
  steps,
  strip,
} from './util';

export interface BridgeOpts {
  /** total length along x (bank to bank including approaches) */
  readonly span?: number;
  /** walkable width along z */
  readonly width?: number;
  readonly color?: Col;
  readonly trim?: Col;
  readonly accent?: Col;
}

export interface BridgeResult {
  readonly geo: Geo;
  /** walkable surface height along the span; t = 0 at x = -length/2, t = 1 at x = +length/2 */
  readonly deck: readonly DeckPoint[];
  readonly width: number;
  readonly length: number;
  /** t-interval of the deck that is not walkable (raised drawbridge leaves) */
  readonly gap?: readonly [number, number];
}

const WATER = -1;

function every<T>(list: readonly T[], k: number): T[] {
  return list.filter((_, i) => i % k === 0 || i === list.length - 1);
}

/* ------------------------------------------------------------------ stone arch */

function archRing(a: number, b: number, z: number, n: number, c: Col, c2: Col): Geo[] {
  return range(n).map((k) => {
    const th = ((k + 0.5) / n) * Math.PI;
    const px = a * Math.cos(th);
    const py = WATER + b * Math.sin(th);
    const ang = Math.atan2(Math.sin(th) / b, Math.cos(th) / a) - Math.PI / 2;
    const key = k === Math.floor(n / 2);
    const stone = box(key ? 0.42 : 0.3, key ? 0.62 : 0.46, 0.08, key ? 'coral' : k % 2 === 0 ? c : c2);
    return translate(rotateZ(stone, ang), px, py, z);
  });
}

export function stoneArchBridge(o: BridgeOpts = {}): BridgeResult {
  const L = o.span ?? 16;
  const W = o.width ?? 4.2;
  const c = o.color ?? 'clay';
  const trim = o.trim ?? 'ivory';
  const deck = sampleDeck(hump(1.6), 16);
  const xs = deckXs(deck, L);
  const ys = deck.map((p) => p.y);
  const a = Math.min(4.7, L * 0.32);
  const b = 1.6 - 0.55 - WATER;
  const arch: P2[] = steps(0, Math.PI, 10).map((th) => [a * Math.cos(th), WATER + b * Math.sin(th)]);
  const outline: P2[] = [[-L / 2, -1.4], ...xs.map((x, i): P2 => [x, ys[i] ?? 0]), [L / 2, -1.4], [a, -1.4], ...arch, [-a, -1.4]];
  const zs = [W / 2 - 0.15, -(W / 2 - 0.15)];
  const body = merge(
    profile(jitter(outline), W, c),
    ...zs.map((z) => strip(xs, ys, ys.map((y) => y + 0.75), 0.3, trim, z)),
    ...[-1, 1].flatMap((sx) => zs.map((z) => boxAt(0.46, 1.05, 0.46, trim, sx * (L / 2 - 0.23), 0, z))),
  );
  const coping = zs.flatMap((z) =>
    range(xs.length - 1).map((i) =>
      segBox(xs[i] ?? 0, (ys[i] ?? 0) + 0.75, xs[i + 1] ?? 0, (ys[i + 1] ?? 0) + 0.75, 0.08, 0.38, i % 2 ? 'coralLight' : 'ivoryShade', z),
    ),
  );
  const near = [
    ...[W / 2 + 0.02, -W / 2 - 0.02].flatMap((z) => archRing(a, b, z, 11, trim, 'ivoryShade')),
    ...coping,
    ...[W / 2 + 0.02, -W / 2 - 0.02].map((z) => strip(xs, ys.map((y) => y - 0.2), ys.map((y) => y - 0.05), 0.06, 'clayDeep', z)),
    ...zs.map((z) => strip(xs, ys, ys.map((y) => y + 0.1), 0.2, 'stone', z - Math.sign(z) * 0.25)),
    ...[-1, 1].flatMap((sx) => zs.map((z) => translate(lampPost(2.4), sx * (L / 2 - 0.23), 1.05, z))),
  ];
  return { geo: merge(body, lod(near, [])), deck, width: W - 0.6, length: L };
}

/* ------------------------------------------------------------------ iron footbridge */

function truss(xs: readonly number[], ys: readonly number[], z: number, c: Col): Geo[] {
  const segs = range(xs.length - 1);
  const X = (i: number): number => xs[i] ?? 0;
  const Y = (i: number): number => ys[i] ?? 0;
  return [
    ...segs.map((i) => segBox(X(i), Y(i) + 1.1, X(i + 1), Y(i + 1) + 1.1, 0.1, 0.12, c, z)),
    ...segs.map((i) => segBox(X(i), Y(i) - 0.3, X(i + 1), Y(i + 1) - 0.3, 0.14, 0.12, c, z)),
    ...segs.map((i) => segBox(X(i), Y(i) - 0.2, X(i + 1), Y(i + 1) + 1.1, 0.05, 0.05, c, z)),
    ...segs.map((i) => segBox(X(i), Y(i) + 1.1, X(i + 1), Y(i + 1) - 0.2, 0.05, 0.05, c, z)),
    ...xs.map((x, i) => boxAt(0.07, 1.42, 0.08, c, x, Y(i) - 0.3, z)),
  ];
}

export function ironFootbridge(o: BridgeOpts = {}): BridgeResult {
  const L = o.span ?? 15;
  const W = o.width ?? 2.4;
  const c = o.color ?? 'blueDeep';
  const deck = sampleDeck(hump(1.6), 16);
  const xs = deckXs(deck, L);
  const ys = deck.map((p) => p.y);
  const zs = [W / 2 + 0.06, -W / 2 - 0.06];
  const fx = every(xs, 2);
  const fy = every(ys, 2);
  const abut = (sx: number): Geo => {
    const top = deckY(deck, 0.5 + (sx * 5.2) / L) - 0.2;
    return boxAt(1.4, top + 1.3, W + 0.6, o.trim ?? 'clay', sx * 5.4, -1.3, 0);
  };
  const always = [strip(xs, ys.map((y) => y - 0.18), ys, W, o.accent ?? 'timber'), abut(-1), abut(1)];
  const far = zs.flatMap((z) => [
    strip(fx, fy.map((y) => y + 1.0), fy.map((y) => y + 1.15), 0.12, c, z),
    strip(fx, fy.map((y) => y - 0.35), fy.map((y) => y + 0.25), 0.1, c, z),
  ]);
  const near = [
    ...zs.flatMap((z) => truss(xs, ys, z, c)),
    ...range(xs.length - 1).map((i) =>
      segBox(xs[i] ?? 0, ys[i] ?? 0, xs[i + 1] ?? 0, ys[i + 1] ?? 0, 0.02, W - 0.1, i % 2 ? 'timberDeep' : 'timber'),
    ),
    translate(lampPost(2.2, c), 0, 1.6 + 1.1, zs[0] ?? 0),
  ];
  return { geo: merge(always, lod(near, far)), deck, width: W, length: L };
}

/* ------------------------------------------------------------------ covered bridge */

function coveredHouse(len: number, W: number, y0: number, roof: Col, wood: Col): Geo {
  const eave = 2.5;
  const posts = steps(-len / 2, len / 2, Math.max(2, Math.round(len / 1.4)));
  const zs = [W / 2 - 0.08, -(W / 2 - 0.08)];
  const roofGeo = tintable(rotateY(gable(W + 0.7, 1.5, len + 0.8, roof), Math.PI / 2));
  const always = [
    translate(roofGeo, 0, y0 + eave, 0),
    ...zs.flatMap((z) => [
      boxAt(len, 0.12, 0.2, wood, 0, y0 + eave - 0.12, z),
      boxAt(len, 0.7, 0.06, wood, 0, y0 + 0.2, z),
      boxAt(0.2, eave, 0.2, wood, -len / 2, y0, z),
      boxAt(0.2, eave, 0.2, wood, len / 2, y0, z),
    ]),
  ];
  const near = [
    ...zs.flatMap((z) => posts.slice(1, -1).map((x) => boxAt(0.14, eave - 0.1, 0.14, wood, x, y0, z))),
    ...zs.flatMap((z) => posts.slice(0, -1).map((x) => segBox(x + 0.05, y0 + eave - 0.6, x + 0.6, y0 + eave - 0.1, 0.08, 0.08, 'timberDeep', z))),
    ...zs.flatMap((z) => posts.map((x) => boxAt(0.05, 0.75, 0.08, 'timberDeep', x + 0.7, y0 + 0.18, z))),
    ...[-1, 1].map((s) => translate(rotateY(gable(W + 0.9, 1.6, 0.06, 'ivory'), Math.PI / 2), s * (len / 2 + 0.44), y0 + eave - 0.03, 0)),
    ...zs.map((z) => boxAt(len, 0.08, 0.1, 'butter', 0, y0 + 0.9, z)),
    boxAt(len + 0.9, 0.12, 0.12, 'ivory', 0, y0 + eave + 1.5, 0),
  ];
  return merge(always, lod(near, []));
}

function hangers(xs: readonly number[], lo: readonly number[], deckBottom: number, z: number): Geo[] {
  return xs
    .map((x, i) => ({ x, y: (lo[i] ?? 0) + 0.3 }))
    .filter((p) => deckBottom - p.y > 0.08)
    .map((p) => boxAt(0.1, deckBottom - p.y, 0.1, 'timberDeep', p.x, p.y, z));
}

export function coveredBridge(o: BridgeOpts = {}): BridgeResult {
  const L = o.span ?? 16;
  const W = o.width ?? 3.2;
  const wood = o.color ?? 'timber';
  const top = 0.45;
  const deck = sampleDeck(plateau(top, 0.12), 16);
  const xs = deckXs(deck, L);
  const ys = deck.map((p) => p.y);
  const archXs = steps(-5.2, 5.2, 10);
  const archLo = archXs.map((x) => WATER + (1 - (x / 5.2) ** 2) * 0.9);
  const zs = [W / 2 - 0.1, -(W / 2 - 0.1)];
  const always = [
    strip(xs, ys.map((y) => y - 0.3), ys, W, 'timberDeep'),
    ...zs.map((z) => strip(archXs, archLo, archLo.map((y) => y + 0.35), 0.22, wood, z)),
    coveredHouse(L * 0.7, W, top, o.trim ?? 'coral', wood),
  ];
  const near = [
    ...zs.flatMap((z) => hangers(archXs, archLo, top - 0.3, z)),
    ...range(xs.length - 1).map((i) => segBox(xs[i] ?? 0, ys[i] ?? 0, xs[i + 1] ?? 0, ys[i + 1] ?? 0, 0.02, W - 0.3, i % 2 ? 'timber' : 'clayLight')),
    ...zs.flatMap((z) => [
      profileRail(xs.slice(0, 3), ys.slice(0, 3), z, 0.95, wood),
      profileRail(xs.slice(14), ys.slice(14), z, 0.95, wood),
    ]),
  ];
  return { geo: merge(always, lod(near, [])), deck, width: W - 0.3, length: L };
}
