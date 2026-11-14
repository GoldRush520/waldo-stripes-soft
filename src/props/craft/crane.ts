/** Construction landmarks: the tower crane (district landmark) and a pulley hoist gantry. */
import { type Geo, beam, box, cyl, detail, farOnly, merge, pyramid, tintable, torus, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { at, lodPair, lyingZ, prop, rod, stripedBox } from './kit';

type V3 = readonly [number, number, number];

export const CRANE_MAST_HEIGHT = 22;
const MAST_W = 1.6;
const BASE_H = 0.6;
const JIB_LEN = 18;
const COUNTER_LEN = 6;
const LATTICE_COL = 'butter';

/** Square lattice mast from y0 up `h` metres: corner posts plus per-section rings and zig-zag diagonals. */
function latticeMast(y0: number, h: number, w: number, sec: number): Geo {
  const parts: Geo[] = [];
  const s = w / 2;
  const corners: ReadonlyArray<readonly [number, number]> = [[-s, -s], [s, -s], [s, s], [-s, s]];
  corners.forEach(([x, z]) => parts.push(beam([x, y0, z], [x, y0 + h, z], 0.12, LATTICE_COL)));
  const n = Math.round(h / sec);
  const step = h / n;
  for (let i = 0; i < n; i++) {
    const ya = y0 + i * step;
    const yb = ya + step;
    for (let c = 0; c < 4; c++) {
      const a = corners[c] ?? [0, 0];
      const b = corners[(c + 1) % 4] ?? [0, 0];
      parts.push(beam([a[0], ya, a[1]], [b[0], ya, b[1]], 0.06, LATTICE_COL));
      const flip = (i + c) % 2 === 0;
      parts.push(beam([a[0], flip ? ya : yb, a[1]], [b[0], flip ? yb : ya, b[1]], 0.05, LATTICE_COL));
    }
  }
  return merge(parts);
}

/** Triangular lattice jib running along +x (or -x for dir = -1) from the mast top. */
function latticeJib(y0: number, len: number, dir: 1 | -1, sec: number): Geo {
  const w = 0.6;
  const hgt = 1.3;
  const x0 = dir * (MAST_W / 2);
  const x1 = dir * (MAST_W / 2 + len);
  const parts: Geo[] = [
    beam([x0, y0, -w], [x1, y0, -w], 0.1, LATTICE_COL),
    beam([x0, y0, w], [x1, y0, w], 0.1, LATTICE_COL),
    beam([x0, y0 + hgt, 0], [x1, y0 + hgt * 0.4, 0], 0.08, LATTICE_COL),
  ];
  const n = Math.round(len / sec);
  for (let i = 0; i < n; i++) {
    const xa = x0 + dir * i * (len / n);
    const xb = x0 + dir * (i + 1) * (len / n);
    const topA = y0 + hgt * (1 - 0.6 * (i / n));
    parts.push(beam([xa, y0, -w], [xa, y0, w], 0.05, LATTICE_COL));
    parts.push(beam([xa, y0, -w], [xb, topA, 0], 0.05, LATTICE_COL));
    parts.push(beam([xa, y0, w], [xb, topA, 0], 0.05, LATTICE_COL));
  }
  return merge(parts);
}

function craneTop(top: number): Geo {
  const turntable = at(cyl(1.0, 1.0, 0.5, 'slate', 10), 0, top, 0);
  const cab = merge(
    tintable(at(box(1.4, 1.5, 1.5, 'coral'), 0.4, top + 0.5, 1.4)),
    at(box(1.46, 0.12, 1.56, 'ivory'), 0.4, top + 2.0, 1.4),
    detail(at(box(1.2, 0.7, 0.04, 'blueLight'), 0.4, top + 1.1, 2.17)),
  );
  const apex = at(pyramid(1.4, 5.0, 1.4, LATTICE_COL), 0, top + 0.5, 0);
  const counter = merge(
    at(box(COUNTER_LEN, 0.25, 1.6, 'slate'), -(MAST_W / 2 + COUNTER_LEN / 2), top + 0.5, 0),
    at(stripedBox(1.2, 1.8, 1.4, 3), -(MAST_W / 2 + COUNTER_LEN - 1.2), top + 0.75, 0),
    at(box(1.4, 1.0, 1.2, 'stone'), -(MAST_W / 2 + 2.8), top + 0.75, 0),
  );
  const ties = (end: V3): Geo => rod([0, top + 5.4, 0], end, 0.05, 'cocoa');
  const tieBars = merge(
    ties([MAST_W / 2 + JIB_LEN * 0.7, top + 1.3, 0]),
    ties([-(MAST_W / 2 + COUNTER_LEN), top + 0.75, 0]),
  );
  const tieFar = farOnly(merge(
    beam([0, top + 5.4, 0], [MAST_W / 2 + JIB_LEN * 0.7, top + 1.3, 0], 0.08, 'cocoa'),
    beam([0, top + 5.4, 0], [-(MAST_W / 2 + COUNTER_LEN), top + 0.75, 0], 0.08, 'cocoa'),
  ));
  return merge(turntable, cab, apex, counter, tieBars, tieFar);
}

/** Trolley, hook cable, hook block and a slung brick pallet hanging under the jib. */
function hookLoad(top: number, x: number): Geo {
  const hookY = 6.2;
  const palletY = 4.0;
  const trolley = at(box(0.9, 0.35, 1.3, 'slate'), x, top + 0.15, 0);
  const cable = merge(rod([x - 0.08, top + 0.15, 0], [x - 0.08, hookY + 0.5, 0], 0.03, 'ink'), rod([x + 0.08, top + 0.15, 0], [x + 0.08, hookY + 0.5, 0], 0.03, 'ink'));
  const cableFar = farOnly(at(box(0.08, top + 0.15 - hookY, 0.08, 'ink'), x, hookY, 0));
  const block = merge(tintable(at(box(0.4, 0.5, 0.25, 'coral'), x, hookY, 0)), detail(translate(torus(0.12, 0.03, 'slate', 4, 8), x, hookY - 0.12, 0)));
  const slings = merge(
    rod([x, hookY - 0.15, 0], [x - 0.5, palletY + 0.75, -0.45], 0.02, 'ink'),
    rod([x, hookY - 0.15, 0], [x + 0.5, palletY + 0.75, -0.45], 0.02, 'ink'),
    rod([x, hookY - 0.15, 0], [x - 0.5, palletY + 0.75, 0.45], 0.02, 'ink'),
    rod([x, hookY - 0.15, 0], [x + 0.5, palletY + 0.75, 0.45], 0.02, 'ink'),
  );
  const pallet = merge(at(box(1.1, 0.12, 1.0, 'timber'), x, palletY, 0), at(box(1.0, 0.62, 0.9, 'clayDeep'), x, palletY + 0.12, 0));
  const courses = detail(merge([0, 1, 2, 3].map((i) => at(box(1.04, 0.03, 0.94, 'clayLight'), x, palletY + 0.2 + i * 0.14, 0))));
  return merge(trolley, cable, cableFar, block, slings, pallet, courses);
}

function towerCrane(): Geo {
  const top = BASE_H + CRANE_MAST_HEIGHT;
  const footing = merge(box(4, BASE_H, 4, 'stone'), at(box(2.2, 0.3, 2.2, 'slate'), 0, BASE_H, 0));
  const mast = lodPair(latticeMast(BASE_H + 0.3, CRANE_MAST_HEIGHT - 0.3, MAST_W, 1.6), at(box(MAST_W, CRANE_MAST_HEIGHT - 0.3, MAST_W, LATTICE_COL), 0, BASE_H + 0.3, 0));
  const jib = lodPair(
    latticeJib(top + 0.5, JIB_LEN, 1, 1.5),
    at(box(JIB_LEN, 1.0, 1.2, LATTICE_COL), MAST_W / 2 + JIB_LEN / 2, top + 0.5, 0),
  );
  const ladderRungs = detail(merge([0, 1, 2, 3, 4, 5].map((i) => at(box(0.04, 0.04, 0.5, 'ivory'), -MAST_W / 2 - 0.05, 2 + i * 3.4, 0))));
  return merge(footing, mast, jib, craneTop(top), hookLoad(top + 0.5, MAST_W / 2 + 12), ladderRungs);
}

function hoistGantry(): Geo {
  const h = 3.2;
  const span = 3.4;
  const frame = (x: number): Geo =>
    lodPair(
      merge(rod([x, 0, -0.9], [x, h, 0], 0.12, 'timber'), rod([x, 0, 0.9], [x, h, 0], 0.12, 'timber'), rod([x, 1.0, -0.62], [x, 1.0, 0.62], 0.08, 'timber')),
      at(box(0.12, h, 1.2, 'timber'), x, 0, 0),
    );
  const top = at(box(span + 0.4, 0.18, 0.18, 'timberDeep'), 0, h, 0);
  const pulley = merge(at(lyingZ(0.18, 0.08, 'slate', 10), 0.4, h - 0.2, 0), rod([0.4, h, 0], [0.4, h - 0.2, 0], 0.04, 'ink'));
  const rope = merge(rod([0.25, h - 0.2, 0], [0.25, 1.1, 0], 0.025, 'ivory'), rod([0.55, h - 0.2, 0], [0.9, 0.9, 0.5], 0.025, 'ivory'));
  const crate = merge(at(box(0.7, 0.6, 0.6, 'timber'), 0.25, 0.5, 0), detail(merge(at(box(0.74, 0.06, 0.64, 'timberDeep'), 0.25, 0.6, 0), at(box(0.74, 0.06, 0.64, 'timberDeep'), 0.25, 0.94, 0))));
  const coil = detail(translate(torus(0.18, 0.04, 'ivory', 4, 10), 1.0, 0.04, 0.55));
  const feet = detail(merge(at(box(0.3, 0.08, 2.0, 'timberDeep'), -span / 2, 0, 0), at(box(0.3, 0.08, 2.0, 'timberDeep'), span / 2, 0, 0)));
  const flags = detail(tintable(merge(at(box(0.3, 0.2, 0.02, 'coral'), -span / 2 - 0.15, h + 0.3, 0), rod([-span / 2, h, 0], [-span / 2, h + 0.55, 0], 0.03, 'cocoa'))));
  return merge(frame(-span / 2), frame(span / 2), top, detail(pulley), rope, crate, coil, feet, flags);
}

export const CRANE_PROPS: readonly PropDef[] = [
  prop('craft.towerCrane', [4, 4], {
    budget: 'landmark',
    tint: 'coral',
    tags: ['construction', 'landmark', 'overhang'],
  }, towerCrane),
  prop('craft.hoistGantry', [3.8, 1.9], { budget: 'stall', tint: 'coral', tags: ['construction'] }, hoistGantry),
];
