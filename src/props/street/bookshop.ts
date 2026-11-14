/**
 * Bookshop "domino collapse" set: one bookshelf upright, leaning 10/25/45 degrees and fallen flat,
 * plus book piles, a scattered-books fan and a rolling ladder.
 *
 * Registered shelves are centred on their bounds like every prop. For chained domino layouts use
 * `bookshelfLean(deg)`, whose origin stays at the upright shelf's base centre (it tips about the
 * bottom front edge toward +z), so consecutive shelves can share one spacing.
 */
import {
  type Geo,
  beam,
  bounds,
  box,
  detail,
  farOnly,
  merge,
  rotateX,
  rotateY,
  shadeY,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { prop, restOnGround } from './kit';

export const SHELF_W = 1.2;
export const SHELF_H = 2.0;
export const SHELF_D = 0.36;

const BOOK_COLORS: readonly ColorName[] = ['coral', 'blue', 'sage', 'butter', 'clayDeep', 'blueDeep', 'coralDeep', 'ivoryShade'];

/** Three blocks of books per shelf (each block reads as a run of spines). */
function shelfBooks(y: number, seed: string): Geo {
  const rng = createRng(seed);
  const widths = [0.34, 0.4, 0.26];
  let x = -SHELF_W / 2 + 0.06;
  return merge(
    widths.map((w) => {
      const h = 0.22 + rng.next() * 0.1;
      const g = translate(box(w - 0.02, h, 0.24, rng.pick(BOOK_COLORS)), x + w / 2, y, 0.02);
      x += w + 0.02;
      return g;
    }),
  );
}

function bookshelfUpright(): Geo {
  const sides = [-1, 1].map((s) => translate(box(0.04, SHELF_H, SHELF_D, 'timber'), s * (SHELF_W / 2 - 0.02), 0, 0));
  const back = translate(box(SHELF_W - 0.08, SHELF_H, 0.02, 'timberDeep'), 0, 0, -SHELF_D / 2 + 0.01);
  const levels = [0, 0.5, 0.96, 1.42];
  const boards = levels.slice(1).map((y) => translate(box(SHELF_W - 0.08, 0.03, SHELF_D - 0.02, 'timber'), 0, y - 0.03, 0.01));
  const crown = translate(box(SHELF_W + 0.06, 0.06, SHELF_D + 0.04, 'timberDeep'), 0, SHELF_H, 0);
  const frame = detail(merge(shadeY(merge(sides, back), 0.85, 1), boards, crown));
  const books = detail(merge(levels.map((y, i) => shelfBooks(y, `shelf.${i}`))));
  const farBody = farOnly(shadeY(translate(box(SHELF_W, SHELF_H + 0.06, SHELF_D - 0.04, 'timber'), 0, 0, -0.02), 0.85, 1));
  const spines = farOnly(merge(levels.map((y, i) => translate(box(SHELF_W - 0.14, 0.26, 0.03, BOOK_COLORS[i] ?? 'coral'), 0, y + 0.02, SHELF_D / 2 - 0.035))));
  return merge(frame, books, farBody, spines);
}

/** Bookshelf tipped forward by `deg` about its bottom front edge; origin at the upright base centre. */
export function bookshelfLean(deg: number): Geo {
  const a = (Math.max(0, Math.min(90, deg)) * Math.PI) / 180;
  const pivotZ = SHELF_D / 2;
  const tipped = translate(rotateX(translate(bookshelfUpright(), 0, 0, -pivotZ), a), 0, 0, pivotZ);
  const fallen = deg >= 25 ? [spill(deg)] : [];
  return merge(restOnGround(tipped), fallen);
}

/** Books that slid out of a tipping shelf, scattered in front of it. */
function spill(deg: number): Geo {
  const rng = createRng(`spill.${deg}`);
  const n = Math.round(deg / 15);
  return detail(
    merge(
      Array.from({ length: n }, () =>
        translate(rotateY(box(0.16, 0.035, 0.22, rng.pick(BOOK_COLORS)), rng.next() * Math.PI), (rng.next() - 0.5) * 1.1, 0, SHELF_D / 2 + 0.2 + rng.next() * (deg / 90) * 1.6),
      ),
    ),
  );
}

function centred(g: Geo): Geo {
  const b = bounds(g);
  return translate(g, -(b.min[0] + b.max[0]) / 2, 0, -(b.min[2] + b.max[2]) / 2);
}

function bookPile(n: number, seed: string): Geo {
  const rng = createRng(seed);
  const books = Array.from({ length: n }, (_, i) =>
    translate(rotateY(box(0.17 + rng.next() * 0.06, 0.035, 0.24 + rng.next() * 0.04, rng.pick(BOOK_COLORS)), (rng.next() - 0.5) * 0.5), (rng.next() - 0.5) * 0.03, i * 0.036, 0),
  );
  return merge(detail(merge(books)), farOnly(box(0.22, n * 0.036, 0.28, 'clay')));
}

function scatteredBooks(): Geo {
  const rng = createRng('books.scatter');
  const books = Array.from({ length: 12 }, (_, i) => {
    const a = (rng.next() - 0.5) * 1.6;
    const r = 0.2 + (i / 12) * 1.3;
    const open = i % 4 === 0;
    const g = open
      ? merge(translate(rotateY(box(0.15, 0.02, 0.22, 'ivory'), 0.08), -0.075, 0, 0), translate(rotateY(box(0.15, 0.02, 0.22, 'ivory'), -0.08), 0.075, 0, 0))
      : box(0.16, 0.035, 0.22, rng.pick(BOOK_COLORS));
    return translate(rotateY(g, rng.next() * Math.PI), Math.sin(a) * r, 0, Math.cos(a) * r - 0.6);
  });
  return merge(detail(merge(books)), farOnly(translate(box(1.2, 0.02, 1.1, 'clay'), 0, 0, 0.05)));
}

function rollingLadder(): Geo {
  const rails = [-0.22, 0.22].map((x) => beam([x, 0.08, 0.55], [x, 2.6, -0.15], 0.05, 'timber'));
  const rungs = detail(merge(Array.from({ length: 8 }, (_, i) => {
    const t = (i + 0.5) / 8;
    return beam([-0.22, 0.08 + t * 2.52, 0.55 - t * 0.7], [0.22, 0.08 + t * 2.52, 0.55 - t * 0.7], 0.035, 'timberDeep');
  })));
  const wheels = [-0.22, 0.22].map((x) => translate(box(0.05, 0.08, 0.08, 'ink'), x, 0, 0.55));
  const rail = detail(merge(beam([-0.3, 2.6, -0.17], [0.3, 2.6, -0.17], 0.03, 'butterDeep'), [-0.22, 0.22].map((x) => translate(box(0.04, 0.06, 0.06, 'butterDeep'), x, 2.55, -0.17))));
  return merge(rails, rungs, wheels, rail);
}

const SHOP = ['bookshop', 'interior-ok'];

export const BOOKSHOP_PROPS: readonly PropDef[] = [
  prop('bookshelf.upright', [SHELF_W, SHELF_D], 'furniture', bookshelfUpright, { tags: [...SHOP, 'domino'] }),
  prop('bookshelf.lean10', [SHELF_W, 0.68], 'furniture', () => centred(bookshelfLean(10)), { tags: [...SHOP, 'domino'] }),
  prop('bookshelf.lean25', [SHELF_W, 1.15], 'furniture', () => centred(bookshelfLean(25)), { tags: [...SHOP, 'domino'] }),
  prop('bookshelf.lean45', [SHELF_W, 1.7], 'furniture', () => centred(bookshelfLean(45)), { tags: [...SHOP, 'domino'] }),
  prop('bookshelf.fallen', [SHELF_W, 2.2], 'furniture', () => centred(bookshelfLean(90)), { tags: [...SHOP, 'domino'] }),
  prop('books.pile', [0.26, 0.3], 'small', () => bookPile(7, 'pile.a'), { tags: [...SHOP, 'clutter'] }),
  prop('books.pile.tall', [0.26, 0.3], 'small', () => bookPile(11, 'pile.b'), { tags: [...SHOP, 'clutter', 'comedy'] }),
  prop('books.scattered', [0, 0], 'furniture', scatteredBooks, { tags: [...SHOP, 'clutter', 'loose'] }),
  prop('ladder.rolling', [0.5, 0.75], 'furniture', rollingLadder, { tags: [...SHOP] }),
];
