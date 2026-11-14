/**
 * Hanging bracket signs and fascia boards.
 *
 * bracketSign 'wall' mount: origin on the wall plane at arm height, arm out along +z, emblem
 * hangs below the arm in the y-z plane. 'post' mount: free-standing sign post centred on the
 * origin resting on y = 0, arm out along +z.
 */
import { type Col, type Geo, beam, detail, merge, rotateY, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { HALF_PI, ball, bx } from './kit';
import { emblem } from './emblems';
import type { SignKind } from './types';

const ARM = 0.95;
const HANG = 0.5;

function bracket(): Geo {
  const always = [bx(0.04, 0.05, ARM, 'ink', 0, -0.025, ARM / 2)];
  const near = [
    bx(0.08, 0.3, 0.03, 'ink', 0, -0.26, 0.015),
    beam([0, -0.22, 0.03], [0, -0.03, 0.55], 0.022, 'ink'),
    ball([0.035, 0.035, 0.035], 'butterDeep', [0, 0, ARM], 5, 3),
    ...[HANG - 0.2, HANG + 0.2].map((z) => bx(0.015, 0.16, 0.015, 'ink', 0, -0.16, z)),
  ];
  return merge(always, detail(merge(near)));
}

/**
 * Swivel of the emblem away from the street-perpendicular plane toward the street (+z) so the
 * default three-quarter camera reads it instead of seeing it edge-on.
 */
const SWIVEL = 0.55;

/** Bracket sign. Wall mount origin: wall plane at arm height. Post mount rests on y = 0. */
export function bracketSign(kind: SignKind, mount: 'wall' | 'post' = 'wall'): Geo {
  const hung = translate(rotateY(emblem(kind), HALF_PI - SWIVEL), 0, -0.48, HANG);
  const arm = merge(bracket(), hung);
  if (mount === 'wall') return arm;
  const top = 2.75;
  const post = [
    bx(0.12, top + 0.1, 0.12, 'sageDeep', 0, 0, 0),
    detail(merge(bx(0.3, 0.12, 0.3, 'stone', 0, 0, 0), ball([0.07, 0.07, 0.07], 'butterDeep', [0, top + 0.17, 0], 5, 3))),
  ];
  return merge(post, translate(arm, 0, top, 0.06));
}

export interface FasciaOpts {
  readonly w: number;
  readonly h?: number;
  readonly col?: Col;
  readonly letters?: Col;
  /** lettering block count (default from width) */
  readonly count?: number;
}

/**
 * Fascia signboard with coloured block "lettering" (near-only). Local: centred, bottom at y = 0,
 * back face on the wall plane z = 0.
 */
export function fascia(opts: FasciaOpts, rng: Rng): Geo {
  const { w, h = 0.45, col = 'blueDeep', letters = 'ivory' } = opts;
  const board = bx(w, h, 0.12, col, 0, 0, 0.06);
  const moulding = [bx(w + 0.08, 0.05, 0.16, 'ivory', 0, h, 0.08), bx(w + 0.04, 0.04, 0.14, 'ivory', 0, -0.04, 0.07)];
  const n = opts.count ?? Math.max(3, Math.min(7, Math.floor((w - 0.6) / 0.24)));
  const span = Math.min(w - 0.4, n * 0.24);
  const blocks = Array.from({ length: n }, (_, i) => {
    const x = -span / 2 + ((i + 0.5) * span) / n;
    const lh = h * rng.range(0.42, 0.62);
    const lw = rng.range(0.1, 0.17);
    return bx(lw, lh, 0.03, letters, x, (h - lh) / 2, 0.13);
  });
  return merge(board, detail(merge(moulding, blocks)));
}
