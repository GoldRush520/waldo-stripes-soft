/**
 * Shared funfair game-booth shell: striped counter front, back wall, corner posts, a striped
 * awning roof with a scalloped valance and a sign board. Front faces +z; rests on y = 0.
 */
import { type Col, type Geo, beam, detail, merge, rotateX, translate } from '../../core/geo';
import { boxAt, lodPair, pennant, stripesX } from './kit';

export interface BoothSpec {
  readonly w: number;
  readonly d: number;
  readonly h?: number;
  readonly stripe?: Col;
  readonly counterH?: number;
}

function roof(w: number, d: number, h: number, stripe: Col): Geo {
  const n = Math.max(5, Math.round(w / 0.4) | 1);
  const drop = (d / 2 + 0.35) * Math.sin(0.12);
  const awningOf = (k: number): Geo => translate(rotateX(stripesX(w + 0.3, 0.07, d + 0.5, k, stripe, 'ivory'), 0.12), 0, h, 0.1);
  const awning = lodPair(awningOf(n), awningOf(Math.max(3, Math.round(n / 2) | 1)));
  const valance = detail(
    merge(
      Array.from({ length: n }, (_, i) =>
        translate(pennant(i % 2 === 0 ? 'ivory' : 'butter', (w + 0.3) / n, 0.22), -(w + 0.3) / 2 + ((i + 0.5) * (w + 0.3)) / n, h - drop + 0.02, d / 2 + 0.38),
      ),
    ),
  );
  const sign = merge(boxAt(w * 0.6, 0.5, 0.08, 'ivory', 0, h + 0.05, d / 2 + 0.25), detail(boxAt(w * 0.5, 0.3, 0.1, stripe, 0, h + 0.15, d / 2 + 0.27)));
  return merge(awning, valance, sign);
}

/** Booth shell. Returns geometry only; contents are added by each game. */
export function boothShell(spec: BoothSpec): Geo {
  const { w, d } = spec;
  const h = spec.h ?? 2.4;
  const stripe = spec.stripe ?? 'coral';
  const ch = spec.counterH ?? 0.95;
  const counter = boxAt(w, ch, 0.45, 'ivory', 0, 0, d / 2 - 0.22);
  const frontOf = (k: number): Geo => translate(stripesX(w - 0.1, ch - 0.15, 0.04, k, stripe, 'ivory'), 0, 0.05, d / 2 + 0.02);
  const front = lodPair(frontOf(Math.max(5, Math.round(w / 0.3) | 1)), frontOf(5));
  const top = boxAt(w + 0.06, 0.06, 0.55, 'timber', 0, ch, d / 2 - 0.22);
  const back = boxAt(w, h, 0.1, 'ivoryShade', 0, 0, 0);
  const posts = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.1, h, 0.1, 'timberDeep', sx * (w / 2 - 0.05), 0, sz * (d / 2 - 0.05))));
  const postLod = lodPair(merge(posts), merge(posts.slice(0, 1), posts.slice(-1)));
  const sides = [-1, 1].map((sx) => boxAt(0.06, h * 0.55, d - 0.2, 'ivoryShade', sx * (w / 2 - 0.05), 0, 0));
  const brace = detail(merge([-1, 1].map((sx) => beam([sx * (w / 2 - 0.05), h * 0.55, -d / 2], [sx * (w / 2 - 0.05), h, d / 2], 0.04, 'timberDeep'))));
  return merge(counter, front, top, translate(back, 0, 0, -d / 2 + 0.05), postLod, sides, brace, roof(w, d, h, stripe));
}

/** A row of shelves along the back wall from y0, each with depth 0.3. */
export function backShelves(w: number, d: number, ys: readonly number[]): Geo {
  return merge(ys.map((y) => boxAt(w - 0.2, 0.05, 0.3, 'timber', 0, y, -d / 2 + 0.25)));
}

/** Cheap far-tier stand-in for a row of small goods: one low block per shelf. */
export function shelfStandIn(w: number, d: number, ys: readonly number[], col: Col, hh = 0.2): Geo {
  return merge(ys.map((y) => boxAt(w - 0.3, hh, 0.22, col, 0, y + 0.05, -d / 2 + 0.25)));
}
