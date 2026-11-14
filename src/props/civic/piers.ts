/**
 * Waterfront decks on piles: timber jetty, boardwalk, pleasure pier, and a rock breakwater.
 * Jetties and piers run along z: shore end at z = -length/2, sea end at z = +length/2.
 */
import { type Col, type Geo, blob, cyl, merge, place, translate } from '../../core/geo';
import { createRng } from '../../core/rng';
import { ironRailing } from './fences';
import { bollard, lampPost } from './fixtures';
import { alongZ, boxAt, lod, range, segBox, steps } from './util';

export interface DeckResult {
  readonly geo: Geo;
  /** walkable deck top height */
  readonly deckY: number;
  readonly length: number;
  readonly width: number;
}

const PILE_FOOT = -2.2;

function pile(x: number, z: number, top: number, r: number): { near: Geo; far: Geo } {
  const h = top - PILE_FOOT;
  return {
    near: translate(cyl(r, r * 0.9, h, 'timberDeep', 6), x, PILE_FOOT, z),
    far: boxAt(r * 1.8, h, r * 1.8, 'timberDeep', x, PILE_FOOT, z),
  };
}

function piles(xs: readonly number[], zs: readonly number[], top: number, r: number): { near: Geo[]; far: Geo[] } {
  const all = zs.flatMap((z) => xs.map((x) => pile(x, z, top, r)));
  return { near: all.map((p) => p.near), far: all.map((p) => p.far) };
}

export function jetty(length: number, width = 1.8, deckY = 0.3): DeckResult {
  const nP = Math.max(4, Math.round(length / 0.26));
  const pileZ = steps(-length / 2 + 0.2, length / 2 - 0.2, Math.max(1, Math.round(length / 2)));
  const p = piles([-width / 2 + 0.12, width / 2 - 0.12], pileZ, deckY - 0.06, 0.12);
  const always = [-1, 1].map((s) => boxAt(0.14, 0.2, length, 'timberDeep', s * (width / 2 - 0.2), deckY - 0.26, 0));
  const planks = range(nP).map((i) => boxAt(width, 0.06, 0.22, i % 4 === 0 ? 'timberDeep' : 'timber', 0, deckY - 0.06, -length / 2 + ((i + 0.5) * length) / nP));
  const near = [
    ...planks,
    ...p.near,
    ...[-1, 1].map((s) => translate(bollard('cocoa'), s * (width / 2 - 0.25), deckY, length / 2 - 0.3)),
    ...range(4).map((i) => boxAt(0.4, 0.04, 0.04, 'slate', 0, deckY - 0.35 - i * 0.3, length / 2 + 0.05)),
  ];
  const far = [boxAt(width, 0.06, length, 'timber', 0, deckY - 0.06, 0), ...p.far];
  return { geo: merge(always, lod(near, far)), deckY, length, width };
}

/** Low boardwalk along x on short posts (sand, marsh or shallow water). */
export function boardwalk(length: number, width = 2, deckY = 0.35): DeckResult {
  const n = Math.max(4, Math.round(length / 0.24));
  const postX = steps(-length / 2 + 0.2, length / 2 - 0.2, Math.max(1, Math.round(length / 1.8)));
  const posts = postX.flatMap((x) => [-1, 1].map((s) => boxAt(0.12, deckY + 0.3, 0.12, 'timberDeep', x, -0.3, s * (width / 2 - 0.15))));
  const always = [-1, 1].map((s) => boxAt(length, 0.16, 0.1, 'timberDeep', 0, deckY - 0.22, s * (width / 2 - 0.15)));
  const near = [
    ...range(n).map((i) => boxAt(0.2, 0.06, width, i % 5 === 0 ? 'clayLight' : 'timber', -length / 2 + ((i + 0.5) * length) / n, deckY - 0.06, 0)),
    ...posts,
    ...[-1, 1].map((s) => boxAt(length, 0.06, 0.06, 'timberDeep', 0, deckY, s * (width / 2 - 0.03))),
  ];
  return { geo: merge(always, lod(near, [boxAt(length, 0.06, width, 'timber', 0, deckY - 0.06, 0)])), deckY, length, width };
}

export interface PierOpts {
  readonly width?: number;
  readonly deckY?: number;
  readonly rail?: Col;
}

/** Wide seaside pleasure pier with railings and lamp posts (along z). */
export function pleasurePier(length: number, o: PierOpts = {}): DeckResult {
  const width = o.width ?? 6;
  const deckY = o.deckY ?? 1.0;
  const rail = o.rail ?? 'ivory';
  const rowZ = steps(-length / 2 + 0.5, length / 2 - 0.5, Math.max(1, Math.round(length / 3)));
  const p = piles([-width / 2 + 0.3, width / 2 - 0.3], rowZ, deckY - 0.3, 0.16);
  const boards = Math.round(width / 0.32);
  const always = [
    ...rowZ.map((z) => boxAt(width, 0.24, 0.24, 'timberDeep', 0, deckY - 0.5, z)),
    ...[-1, 1].map((s) => boxAt(0.12, 0.3, length, 'ivory', s * (width / 2 - 0.06), deckY - 0.3, 0)),
  ];
  const lamps = steps(-length / 2 + 2, length / 2 - 2, Math.max(1, Math.round(length / 10)));
  const near = [
    ...range(boards).map((i) => boxAt(width / boards - 0.03, 0.05, length, i % 3 === 0 ? 'timberDeep' : 'timber', -width / 2 + ((i + 0.5) * width) / boards, deckY - 0.05, 0)),
    ...p.near,
    ...rowZ.flatMap((z) => [-1, 1].map((s) => translate(alongZ(segBox(z - Math.sign(z || 1) * 1.4, -1.2, z, deckY - 0.5, 0.08, 0.08, 'timberDeep')), s * (width / 2 - 0.3), 0, 0))),
    ...[-1, 1].map((s) => translate(alongZ(ironRailing(length - 0.2, { color: rail, spacing: 0.5, h: 1.05 })), s * (width / 2 - 0.08), deckY, 0)),
    ...lamps.flatMap((z) => [-1, 1].map((s) => translate(lampPost(3.4, 'blueDeep'), s * (width / 2 - 0.3), deckY, z))),
  ];
  const far = [boxAt(width, 0.05, length, 'timber', 0, deckY - 0.05, 0), ...p.far];
  return { geo: merge(always, lod(near, far)), deckY, length, width };
}

/** Breakwater of rounded rocks along x, crest about 1 m above the water (y = -1). */
export function breakwater(length: number, seed = 11): Geo {
  const rng = createRng(seed);
  const n = Math.max(3, Math.round(length / 1.1));
  const rock = (x: number, z: number, y: number, s: number, i: number): Geo =>
    place(blob(s * 1.15, s * 0.75, s, i % 3 === 0 ? 'stone' : i % 3 === 1 ? 'clayDeep' : 'clay', 7, 5), x, y, z, rng.range(0, Math.PI));
  const rows = [
    { z: -1.1, y: -1.3, s: 1.0 },
    { z: 1.1, y: -1.3, s: 1.0 },
    { z: 0, y: -0.7, s: 0.85 },
  ];
  const near = rows.flatMap((r, ri) =>
    range(n).map((i) => rock(-length / 2 + ((i + 0.5) * length) / n + rng.range(-0.2, 0.2), r.z + rng.range(-0.2, 0.2), r.y, r.s * rng.range(0.8, 1.15), i + ri)),
  );
  const big = Math.max(2, Math.round(length / 3));
  const far = range(big).map((i) => place(blob(1.9, 1.0, 2.0, i % 2 ? 'clay' : 'clayDeep', 6, 4), -length / 2 + ((i + 0.5) * length) / big, -0.9, 0, i));
  return lod(near, far);
}
