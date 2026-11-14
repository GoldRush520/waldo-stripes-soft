/** Tram-station luggage chaos: the precarious tower, the toppled avalanche and a spilled suitcase. */
import { type Col, type Geo, blob, box, cyl, detail, farOnly, merge, rotateX, tintable, translate } from '../../core/geo';
import { type Rng, createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { PI, at, prop, rod, tiltRest } from './kit';

const SHELLS: readonly Col[] = ['coral', 'blue', 'butter', 'sage', 'clay', 'ivory', 'coralDeep', 'blueDeep'];

interface Piece {
  readonly geo: Geo;
  readonly h: number;
}

/** A flat-lying case: body + contrasting strap + handle (near), body only (far). Base-rested, centred. */
function flatCase(w: number, h: number, d: number, col: Col): Geo {
  const strapCol: Col = col === 'ivory' ? 'coral' : 'ivory';
  return merge(
    farOnly(box(w, h, d, col)),
    detail(merge(
      box(w, h, d, col),
      at(box(0.06, h + 0.02, d + 0.02, strapCol), w * 0.25, -0.01, 0),
      at(box(0.06, h + 0.02, d + 0.02, strapCol), -w * 0.25, -0.01, 0),
      at(box(0.14, 0.04, 0.03, 'cocoa'), 0, h * 0.4, d / 2 + 0.01),
    )),
  );
}

function hatbox(r: number, h: number, col: Col): Geo {
  return merge(
    farOnly(cyl(r, r, h, col, 6)),
    detail(merge(cyl(r, r, h - 0.04, col, 10), at(cyl(r + 0.01, r + 0.01, 0.05, 'ivory', 10), 0, h - 0.05, 0))),
  );
}

function randomPiece(rng: Rng, scale: number): Piece {
  const col = rng.pick(SHELLS);
  if (rng.chance(0.18)) {
    const r = rng.range(0.17, 0.24) * scale;
    const h = rng.range(0.16, 0.22);
    return { geo: hatbox(r, h, col), h };
  }
  const w = rng.range(0.55, 0.85) * scale;
  const h = rng.range(0.17, 0.3);
  const d = rng.range(0.36, 0.5) * scale;
  return { geo: flatCase(w, h, d, col), h };
}

/** A leaning, precarious tower of `count` luggage pieces (seeded). Footprint about 0.9 x 0.6 m. */
export function luggageTower(count = 9, seed = 1): Geo {
  const rng = createRng(mixKey('tower', seed));
  const parts: Geo[] = [];
  let y = 0;
  let x = 0;
  const n = Math.max(1, Math.round(count));
  for (let i = 0; i < n; i++) {
    const piece = randomPiece(rng, 1 - (i / n) * 0.35);
    const lean = 0.02 + 0.012 * i;
    const tilted = tiltRest(piece.geo, 0.6, piece.h, rng.range(-0.04, 0.04) - lean * 0.5);
    parts.push(at(tilted, x, y, rng.range(-0.05, 0.05), rng.range(-0.35, 0.35)));
    y += piece.h * 0.98;
    x += lean + rng.range(-0.01, 0.03);
  }
  return translate(merge(parts), -x / 2, 0, 0);
}

/** A toppled avalanche of `count` pieces fanned across ~4 m (seeded). */
export function luggageAvalanche(count = 12, seed = 1): Geo {
  const rng = createRng(mixKey('avalanche', seed));
  const n = Math.max(1, Math.round(count));
  const parts: Geo[] = [];
  let prevTop = 0;
  for (let i = 0; i < n; i++) {
    const piece = randomPiece(rng, 1);
    const t = (i + 0.5) / n;
    const x = -1.75 + 3.5 * t + rng.range(-0.08, 0.08);
    const z = Math.sin(t * PI) * 0.5 - 0.25 + rng.range(-0.15, 0.15);
    const stacked = i % 4 === 2;
    const tilt = !stacked && rng.chance(0.3) ? rng.range(0.2, 0.4) * (rng.chance(0.5) ? 1 : -1) : 0;
    const g = tilt !== 0 ? tiltRest(piece.geo, 0.6, piece.h, tilt) : piece.geo;
    const baseY = stacked ? prevTop * 0.95 : 0;
    parts.push(at(g, x, baseY, z, rng.range(-PI, PI)));
    prevTop = stacked ? 0 : piece.h;
  }
  return merge(parts);
}

function mixKey(label: string, seed: number): string {
  return `craft.luggage.${label}.${seed}`;
}

function openSuitcase(): Geo {
  const shell: Col = 'blue';
  const tray = merge(box(0.72, 0.12, 0.48, shell), at(box(0.66, 0.02, 0.42, 'ivory'), 0, 0.11, 0));
  const lid = merge(at(box(0.72, 0.08, 0.48, shell), 0, 0, -0.5), at(box(0.66, 0.02, 0.42, 'ivoryShade'), 0, 0.07, -0.5));
  const folded = (x: number, z: number, y: number, c: Col): Geo => tintable(at(box(0.26, 0.05, 0.2, c), x, y, z));
  const clothesIn = merge(folded(-0.17, 0, 0.13, 'coral'), folded(0.17, 0.02, 0.13, 'coral'), at(box(0.24, 0.05, 0.18, 'butter'), 0.16, 0.18, 0.02));
  const shirt = tintable(merge(
    at(rotateX(box(0.3, 0.02, 0.22, 'coral'), 0.9), -0.1, 0.1, 0.3),
    at(box(0.34, 0.02, 0.3, 'coral'), -0.15, 0, 0.48),
  ));
  const trousers = at(box(0.2, 0.03, 0.7, 'sage'), 0.4, 0, 0.55, 0.5);
  const socks = merge(translate(blob(0.06, 0.03, 0.08, 'butter', 6, 3), 0.1, 0.03, 0.5), translate(blob(0.06, 0.03, 0.08, 'coralLight', 6, 3), -0.35, 0.03, 0.62));
  const hat = merge(at(cyl(0.16, 0.16, 0.015, 'clay', 8), 0.45, 0.13, -0.5), at(cyl(0.09, 0.09, 0.08, 'clay', 8), 0.45, 0.14, -0.5));
  const fittings = merge(at(box(0.14, 0.04, 0.03, 'cocoa'), 0, 0.05, 0.25), rod([-0.3, 0.12, -0.25], [-0.3, 0.12, -0.27], 0.03, 'butter'));
  const far = farOnly(merge(tintable(at(box(0.5, 0.04, 0.4, 'coral'), -0.05, 0, 0.5)), at(box(0.2, 0.03, 0.6, 'sage'), 0.4, 0, 0.55, 0.5)));
  return merge(tray, lid, detail(merge(clothesIn, shirt, trousers, socks, hat, fittings)), far);
}

export const LUGGAGE_PILES: readonly PropDef[] = [
  prop('luggage.tower', [0.9, 0.6], { budget: 'stall', tags: ['luggage', 'station', 'chaos'] }, () => luggageTower(9, 1)),
  prop('luggage.towerTall', [0.9, 0.6], { budget: 'stall', tags: ['luggage', 'station', 'chaos'] }, () => luggageTower(11, 2)),
  prop('luggage.avalanche', [4.0, 1.4], { budget: 'stall', tags: ['luggage', 'station', 'chaos'] }, () => luggageAvalanche(12, 1)),
  prop('luggage.openSuitcase', [0.75, 1.0], { budget: 'furniture', tint: 'coral', tags: ['luggage', 'station', 'chaos'] }, openSuitcase),
];
