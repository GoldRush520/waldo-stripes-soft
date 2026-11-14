/**
 * Flat roof: roof slab, parapet (a 0.95 m safety parapet when the roof is a walkable terrace),
 * stair hatch, optional roof garden and a chimney or two.
 */
import { type Geo, detail, merge, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { chimney, chimneyCol } from './chimney';
import { pergola } from './garden';
import { bx } from './kit';
import type { RoofResult, RoofSpec } from './roof';
import { roofPlanter } from './rooftop';

const PT = 0.2;
const SLAB = 0.1;

function parapet(spec: RoofSpec, ph: number): Geo {
  const { w, d, H, wall, trim } = spec;
  const walls = [
    bx(w, ph, PT, wall, 0, H, d / 2 - PT / 2),
    bx(w, ph, PT, wall, 0, H, -d / 2 + PT / 2),
    bx(PT, ph, d - 2 * PT, wall, -w / 2 + PT / 2, H, 0),
    bx(PT, ph, d - 2 * PT, wall, w / 2 - PT / 2, H, 0),
  ];
  const coping = [
    bx(w + 0.04, 0.06, PT + 0.08, trim, 0, H + ph, d / 2 - PT / 2),
    bx(w + 0.04, 0.06, PT + 0.08, trim, 0, H + ph, -d / 2 + PT / 2),
    bx(PT + 0.08, 0.06, d - 2 * PT - 0.08, trim, -w / 2 + PT / 2, H + ph, 0),
    bx(PT + 0.08, 0.06, d - 2 * PT - 0.08, trim, w / 2 - PT / 2, H + ph, 0),
  ];
  return merge(walls, detail(merge(coping)));
}

function hatch(spec: RoofSpec): Geo {
  const y = spec.H + SLAB;
  const x = -(spec.w / 2 - PT - 0.7);
  const z = -(spec.d / 2 - PT - 0.8);
  return merge(
    bx(1.3, 2.2, 1.5, spec.wall, x, y, z),
    bx(1.45, 0.1, 1.65, spec.trim, x, y + 2.2, z),
    bx(0.8, 1.9, 0.06, 'blueDeep', x, y, z + 0.76),
  );
}

function garden(spec: RoofSpec, rng: Rng): Geo[] {
  const y = spec.H + SLAB;
  const pw = Math.min(1.6, (spec.w - 2 * PT) / 3);
  const planters = [-1, 1].map((s) =>
    translate(roofPlanter(pw, 0.5, rng), s * (spec.w / 2 - PT - pw / 2 - 0.1), y, spec.d / 2 - PT - 0.35),
  );
  const pg =
    spec.w >= 6.5 && spec.d >= 6
      ? [translate(pergola(2.4, 2.0, rng), spec.w / 2 - PT - 1.35, y, -(spec.d / 2 - PT - 1.15))]
      : [];
  return [...planters, ...pg];
}

export function flatRoof(spec: RoofSpec, rng: Rng): RoofResult {
  const { w, d, H } = spec;
  const ph = spec.terrace ? 0.95 : 0.4;
  const parts: Geo[] = [bx(w - 0.04, SLAB, d - 0.04, 'clayLight', 0, H, 0), parapet(spec, ph)];
  if (spec.terrace && w >= 3.5 && d >= 4) parts.push(hatch(spec));
  if (spec.terrace && spec.terraceGarden) parts.push(...garden(spec, rng));
  let top = H + (spec.terrace ? 2.4 : ph + 0.1);
  for (let i = 0; i < spec.chimneys; i++) {
    const x = (i % 2 === 0 ? 1 : -1) * (w / 2 - 0.5);
    const t = H + 1.4 + rng.range(0, 0.4);
    top = Math.max(top, t + 0.4);
    parts.push(chimney(x, rng.range(-0.3, 0.1) * d, H - 0.3, t, chimneyCol(spec.wall), rng));
  }
  const terrace = spec.terrace ? { y: H + SLAB, w: w - 2 * PT, d: d - 2 * PT } : undefined;
  return { geo: merge(parts), topY: top, terrace };
}
