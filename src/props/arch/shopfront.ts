/**
 * Ground-floor shopfront in façade-local space: u along the wall (centred), y up, wall plane
 * z = 0 with the street toward +z. The house body behind a shopfront is set back by SHOP_RECESS
 * so the window is a real recess (dark interior panel, display shelf, glazing bars) framed by
 * piers, a stall-riser and a fascia signboard. Awning and hanging sign are optional.
 */
import { type Col, type Geo, detail, merge, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { awning } from './awnings';
import { displayShelf } from './displays';
import { doorUnit } from './doors';
import { bx } from './kit';
import { bracketSign, fascia } from './signs';
import type { DisplayKind, ShopOpts, SignKind } from './types';

export const SHOP_RECESS = 0.4;
const OPEN_TOP = 2.42;
const RISER = 0.55;
const PIER = 0.3;
const DISPLAYS: readonly DisplayKind[] = ['bread', 'books', 'hats', 'cakes'];

export interface ShopfrontSpec {
  readonly W: number;
  readonly G: number;
  readonly wall: Col;
  readonly trim: Col;
  readonly accent: Col;
  readonly opts: ShopOpts;
  /** door on the +u side (else -u) */
  readonly doorRight: boolean;
}

export interface ShopfrontResult {
  readonly geo: Geo;
  readonly doorU: number;
}

function windowBay(x0: number, x1: number, spec: ShopfrontSpec, rng: Rng): Geo[] {
  const ww = x1 - x0;
  const cx = (x0 + x1) / 2;
  const back = -SHOP_RECESS;
  const mullions = Math.max(1, Math.round(ww / 0.9));
  const bars = Array.from({ length: mullions - 1 }, (_, i) =>
    bx(0.05, OPEN_TOP - RISER, 0.05, spec.trim, x0 + ((i + 1) * ww) / mullions, RISER, -0.08),
  );
  const display = spec.opts.display ?? rng.pick(DISPLAYS);
  const shelf = display
    ? [translate(displayShelf(display, ww - 0.2, 1, rng, 6), cx, RISER, back / 2 - 0.02)]
    : [];
  return [
    bx(ww, RISER, SHOP_RECESS, spec.accent, cx, 0, back / 2),
    bx(ww, OPEN_TOP - RISER, 0.04, 'blueDeep', cx, RISER, back + 0.03),
    ...shelf,
    detail(
      merge(
        bars,
        bx(ww, 0.05, 0.05, spec.trim, cx, 1.95, -0.08),
        bx(ww + 0.02, 0.06, 0.12, spec.trim, cx, RISER, -0.06),
        bx(ww, 0.04, 0.04, spec.trim, cx, OPEN_TOP - 0.06, -0.06),
      ),
    ),
  ];
}

/** Shopfront across a ground floor `W` wide and `G` tall. */
export function shopfront(spec: ShopfrontSpec, rng: Rng): ShopfrontResult {
  const { W, G, wall, trim, opts } = spec;
  const half = W / 2;
  const doorW = 1.0;
  const side = spec.doorRight ? 1 : -1;
  const doorU = side * (half - PIER - doorW / 2 - 0.05);
  const midPier = doorU - side * (doorW / 2 + 0.15);
  const win0 = spec.doorRight ? -half + PIER : midPier + 0.1;
  const win1 = spec.doorRight ? midPier - 0.1 : half - PIER;
  const back = -SHOP_RECESS;
  const piers = [-1, 1].map((s) => bx(PIER, OPEN_TOP, SHOP_RECESS, wall, s * (half - PIER / 2), 0, back / 2));
  const lintel = bx(W, G - OPEN_TOP, SHOP_RECESS, wall, 0, OPEN_TOP, back / 2);
  const mid = bx(0.2, OPEN_TOP, SHOP_RECESS, wall, midPier, 0, back / 2);
  const doorBack = bx(doorW + 0.1, OPEN_TOP, 0.04, 'blueDeep', doorU, 0, back + 0.03);
  const door = translate(
    doorUnit({ kind: opts.door ?? 'glazed', w: doorW - 0.1, col: spec.accent, trim, step: false }),
    doorU,
    0,
    back + 0.09,
  );
  const sign = fascia({ w: W - 0.1, h: Math.max(0.25, Math.min(0.45, G - OPEN_TOP - 0.06)), col: opts.fascia ?? spec.accent, letters: opts.letters ?? 'ivory' }, rng);
  const parts: Geo[] = [
    ...piers,
    lintel,
    mid,
    doorBack,
    door,
    ...windowBay(win0, win1, spec, rng),
    translate(sign, 0, OPEN_TOP + 0.02, 0),
  ];
  const aw = opts.awning === undefined ? 'straight' : opts.awning;
  if (aw === 'dome') {
    parts.push(translate(awning({ w: win1 - win0, kind: 'dome', drop: 0.5, valance: 0.3, depth: 0.95 }), (win0 + win1) / 2, OPEN_TOP, 0.02));
  } else if (aw) {
    parts.push(translate(awning({ w: W - 0.3, kind: aw, drop: 0.35, valance: 0.2 }), 0, OPEN_TOP, 0.02));
  }
  const signKind: SignKind | false = opts.sign ?? false;
  if (signKind) parts.push(translate(bracketSign(signKind, 'wall'), -side * (half - PIER / 2), G + 0.55, 0));
  return { geo: merge(parts), doorU };
}
