/**
 * Shop-window display shelves and the pavement sandwich board.
 * Displays: all near-only detail plus one far-only colour block per tier.
 */
import { type Col, type Geo, detail, farOnly, merge } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { ACCENTS } from './colors';
import { ball, bx, bxc, cy } from './kit';
import type { DisplayKind } from './types';

const FAR_COL: Record<DisplayKind, Col> = {
  bread: 'butterDeep',
  books: 'coral',
  hats: 'blue',
  cakes: 'coralLight',
};

function item(kind: DisplayKind, x: number, y: number, rng: Rng): Geo[] {
  switch (kind) {
    case 'bread': {
      const long = rng.chance(0.4);
      return [ball([long ? 0.13 : 0.09, 0.055, 0.065], rng.pick(['butterDeep', 'timber'] as const), [x, y + 0.05, 0], 5, 3)];
    }
    case 'books': {
      const h = rng.range(0.18, 0.26);
      return [-0.03, 0.03].map((dx) =>
        bxc(0.05, h - Math.abs(dx), 0.16, rng.pick(ACCENTS), [x + dx, y + h / 2, 0], 0, 0, rng.range(-0.12, 0.12)),
      );
    }
    case 'hats': {
      const c = rng.pick(['blueDeep', 'coral', 'sage', 'butter'] as const);
      return [cy(0.07, 0.1, c, 4, [x, y + 0.015, 0], 0.9), cy(0.12, 0.015, c, 5, [x, y, 0])];
    }
    case 'cakes': {
      const c = rng.pick(['coralLight', 'butterLight', 'sageLight', 'ivory'] as const);
      return [cy(0.1, 0.12, c, 6, [x, y, 0]), bx(0.04, 0.04, 0.04, 'coralDeep', x, y + 0.12, 0)];
    }
  }
}

/**
 * Display shelf `w` wide with `tiers` shelves of goods. Local: centred, resting on y = 0,
 * 0.34 deep (z from -0.17 to 0.17).
 */
export function displayShelf(kind: DisplayKind, w: number, tiers: number, rng: Rng, maxItems = 10): Geo {
  const spacing = kind === 'books' ? 0.22 : 0.32;
  const n = Math.max(2, Math.min(maxItems, Math.floor((w - 0.1) / spacing)));
  const near: Geo[] = [];
  const far: Geo[] = [];
  for (let t = 0; t < tiers; t++) {
    const y = t * 0.42;
    near.push(bx(w, 0.04, 0.34, 'timber', 0, y, 0));
    if (t > 0) near.push(...[-1, 1].map((s) => bx(0.04, 0.42, 0.3, 'timberDeep', s * (w / 2 - 0.02), y - 0.42, 0)));
    for (let i = 0; i < n; i++) near.push(...item(kind, -w / 2 + ((i + 0.5) * w) / n, y + 0.04, rng));
    far.push(bx(w * 0.9, 0.2, 0.2, FAR_COL[kind], 0, y + 0.04, 0));
  }
  return merge(detail(merge(near)), farOnly(merge(far)));
}

const LEAN = 0.2;

/** Point on the outer face of board `s` (+1 front, -1 back): `along` up the board from its centre, `out` off it. */
function onBoard(s: number, along: number, out: number): readonly [number, number, number] {
  const c = Math.cos(LEAN);
  const n = Math.sin(LEAN);
  return [0, 0.46 + along * c + out * n, s * (0.1 - along * n + out * c)];
}

/** A-frame pavement sandwich board with a chalkboard face. Rests on y = 0, centred. */
export function sandwichBoard(col: Col = 'timber'): Geo {
  const boards = [-1, 1].map((s) => bxc(0.6, 0.95, 0.035, col, onBoard(s, 0, 0), -s * LEAN));
  const faces = [-1, 1].map((s) => bxc(0.48, 0.66, 0.02, 'cocoa', onBoard(s, 0.04, 0.026), -s * LEAN));
  const chalk = [-1, 1].flatMap((s) =>
    [0.22, 0.08, -0.06].map((a, i) =>
      bxc(0.32 - i * 0.06, 0.035, 0.012, i === 0 ? 'butter' : 'ivory', onBoard(s, a, 0.04), -s * LEAN),
    ),
  );
  const hinge = bx(0.58, 0.04, 0.06, 'timberDeep', 0, 0.9, 0);
  return merge(boards, detail(merge(faces, chalk, hinge)));
}
