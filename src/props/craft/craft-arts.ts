/** Craft yard: stone, textile, glass and basket crafts, sculpture and the giant sign letters. */
import {
  type Col,
  type Geo,
  blob,
  box,
  cyl,
  detail,
  disc,
  dome,
  farOnly,
  lathe,
  merge,
  rotateX,
  rotateZ,
  sphere,
  sway,
  tintable,
  torus,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { PI, at, hangSway, legs, lodPair, lyingX, lyingZ, prop, rod, stretch, stripedBox } from './kit';

/** Stylised upper body (torso + head + shoulders) in stone, base at y = 0. */
function bust(col: Col): Geo {
  return merge(
    translate(blob(0.2, 0.28, 0.13, col, 8, 5), 0, 0.26, 0),
    translate(sphere(0.11, col, 8, 5), 0, 0.66, 0),
    translate(blob(0.3, 0.07, 0.12, col, 8, 4), 0, 0.46, 0),
  );
}

function marbleBlock(): Geo {
  const block = merge(box(0.9, 0.95, 0.7, 'ivory'), at(box(0.6, 0.12, 0.5, 'ivoryShade'), 0.08, 0.95, -0.05));
  const figure = at(bust('ivory'), -0.05, 0.95, 0.05);
  const figureFar = farOnly(at(box(0.4, 0.7, 0.26, 'ivory'), -0.05, 0.95, 0.05));
  const rng = createRng('craft.marbleBlock');
  const chips: Geo[] = [];
  for (let i = 0; i < 4; i++) chips.push(at(box(0.06, 0.03, 0.05, 'ivoryShade'), rng.range(-0.7, 0.7), 0, rng.range(0.4, 0.7), rng.range(0, PI)));
  const tools = merge(rod([0.3, 0.01, 0.55], [0.6, 0.02, 0.45], 0.04, 'timber'), at(box(0.12, 0.1, 0.1, 'timberDeep'), 0.62, 0, 0.45), rod([0.0, 0.01, 0.6], [0.2, 0.01, 0.62], 0.02, 'slate'));
  return merge(block, detail(figure), figureFar, detail(merge(chips)), detail(tools));
}

function finishedStatue(): Geo {
  const plinth = merge(box(0.7, 0.2, 0.7, 'stone'), at(box(0.56, 0.6, 0.56, 'ivory'), 0, 0.2, 0), at(box(0.66, 0.08, 0.66, 'stone'), 0, 0.8, 0));
  const figure = merge(
    at(box(0.3, 0.8, 0.2, 'ivory'), 0, 0.88, 0),
    at(bust('ivory'), 0, 1.6, 0),
    rod([0.26, 2.0, 0], [0.4, 2.55, 0.05], 0.09, 'ivory'),
    rod([-0.26, 2.0, 0], [-0.3, 1.65, 0.1], 0.09, 'ivory'),
    translate(sphere(0.07, 'butter', 6, 4), 0.42, 2.6, 0.05),
  );
  const figureFar = farOnly(merge(at(box(0.36, 1.3, 0.22, 'ivory'), 0, 0.88, 0), at(box(0.2, 0.2, 0.2, 'ivory'), 0, 2.18, 0)));
  const plaque = detail(at(box(0.3, 0.12, 0.02, 'butter'), 0, 0.45, 0.29));
  return merge(plinth, detail(figure), figureFar, plaque);
}

function loom(): Geo {
  const post = box(0.08, 1.5, 0.08, 'timber');
  const frame = merge(
    at(post, -0.62, 0, -0.3), at(post, 0.62, 0, -0.3), at(post, -0.62, 0, 0.3), at(post, 0.62, 0, 0.3),
    at(box(1.36, 0.1, 0.1, 'timberDeep'), 0, 1.45, -0.3),
    at(box(1.36, 0.1, 0.1, 'timberDeep'), 0, 0.7, 0.3),
  );
  const clothAt = (g: Geo): Geo => at(rotateX(g, -0.1), 0, 0.75, 0.15);
  const cloth = lodPair(clothAt(stripedBox(1.1, 0.6, 0.02, 6, 'y')), clothAt(stripedBox(1.1, 0.6, 0.02, 2, 'y')));
  const warp: Geo[] = [];
  for (let i = 0; i < 8; i++) warp.push(rod([-0.49 + i * 0.14, 1.4, -0.28], [-0.49 + i * 0.14, 1.35, 0.1], 0.008, 'ivory'));
  const heddle = detail(at(box(1.2, 0.3, 0.04, 'timberDeep'), 0, 1.0, -0.05));
  const bench = merge(at(box(1.0, 0.06, 0.32, 'timber'), 0, 0.42, 0.75), detail(at(legs(0.9, 0.26, 0.42, 0.05, 'timberDeep'), 0, 0, 0.75)));
  const shuttle = detail(at(box(0.25, 0.04, 0.05, 'butter'), 0.3, 0.8, 0.33));
  return merge(detail(frame), farOnly(merge(at(box(1.32, 1.5, 0.08, 'timber'), 0, 0, -0.3), at(box(0.08, 1.5, 0.6, 'timber'), -0.62, 0, 0), at(box(0.08, 1.5, 0.6, 'timber'), 0.62, 0, 0))), cloth, merge(warp), heddle, bench, shuttle);
}

function spinningWheel(): Geo {
  const base = merge(at(rotateZ(box(0.9, 0.08, 0.26, 'timber'), 0.12), 0, 0.3, 0), legs(0.7, 0.24, 0.34, 0.04, 'timberDeep'));
  const wheelC: readonly [number, number, number] = [0.2, 0.85, 0];
  const wheel = merge(
    translate(rotateZ(torus(0.36, 0.025, 'timberDeep', 3, 14), PI / 2), wheelC[0], wheelC[1], wheelC[2]),
    [0, 1, 2, 3].map((i) => {
      const a = (i / 4) * PI;
      return rod([wheelC[0], wheelC[1] - Math.sin(a) * 0.34, -Math.cos(a) * 0.34], [wheelC[0], wheelC[1] + Math.sin(a) * 0.34, Math.cos(a) * 0.34], 0.02, 'timber');
    }),
  );
  const wheelFar = farOnly(at(lyingX(0.36, 0.04, 'timberDeep', 8), wheelC[0], wheelC[1], 0));
  const uprights = merge(rod([0.15, 0.4, 0], [0.15, 0.9, 0], 0.05, 'timber'), rod([0.25, 0.4, 0], [0.25, 0.9, 0], 0.05, 'timber'));
  const distaff = detail(merge(rod([-0.3, 0.35, 0], [-0.32, 1.05, 0], 0.03, 'timber'), translate(blob(0.07, 0.12, 0.07, 'ivory', 6, 4), -0.32, 1.05, 0)));
  const treadle = detail(at(box(0.3, 0.03, 0.18, 'timberDeep'), 0.1, 0.03, 0.2));
  return merge(base, detail(wheel), wheelFar, uprights, distaff, treadle);
}

function dyeVat(liquid: Col, tinted: boolean, withPaddle: boolean): Geo {
  const tint = (g: Geo): Geo => (tinted ? tintable(g) : g);
  const near = merge(lathe([[0.32, 0], [0.36, 0.3], [0.32, 0.62]], 'timber', 10), tint(at(disc(0.31, liquid, 10), 0, 0.57, 0)));
  const far = merge(cyl(0.34, 0.33, 0.6, 'timber', 5), tint(at(disc(0.3, liquid, 5), 0, 0.62, 0)));
  const hoops = detail(merge(at(cyl(0.345, 0.345, 0.03, 'slate', 10, false), 0, 0.1, 0), at(cyl(0.345, 0.345, 0.03, 'slate', 10, false), 0, 0.48, 0)));
  const paddle = withPaddle ? [detail(rod([0.1, 0.5, 0], [0.25, 1.05, -0.1], 0.03, 'timberDeep'))] : [];
  return merge(lodPair(near, far), hoops, paddle);
}

function dyeVatTrio(): Geo {
  return merge(at(dyeVat('coral', true, true), -0.8, 0, 0), at(dyeVat('blue', false, false), 0, 0, -0.15), at(dyeVat('sage', false, false), 0.8, 0, 0.05));
}

function dryingLines(): Geo {
  const lineY = 2.0;
  const post = lodPair(cyl(0.05, 0.05, 2.2, 'timber', 6), box(0.08, 2.2, 0.08, 'timber'));
  const line = lodPair(lyingX(0.012, 4.0, 'ivory', 4), at(box(4.0, 0.03, 0.03, 'ivory'), 0, -0.015, 0));
  const cols: readonly Col[] = ['coral', 'blue', 'butter', 'sage', 'coral'];
  const cloths = cols.map((c, i) => {
    const len = 0.9 + (i % 3) * 0.2;
    const x = -1.5 + i * 0.75;
    const g = merge(at(box(0.6, len, 0.02, c), x, lineY - len, 0), at(box(0.6, 0.06, 0.04, 'ivory'), x, lineY - len, 0));
    return i % 4 === 0 ? tintable(g) : g;
  });
  const farCloth = (x: number, c: Col): Geo => at(box(1.3, 1.0, 0.02, c), x, lineY - 1.0, 0);
  const clothFar = merge(tintable(farCloth(-1.1, 'coral')), farCloth(0.4, 'blue'));
  const pegs = detail(merge(cols.map((_, i) => at(box(0.03, 0.08, 0.04, 'timberDeep'), -1.5 + i * 0.75, lineY - 0.04, 0))));
  const hang = hangSway(lineY, 1.3);
  return merge(at(post, -2.0, 0, 0), at(post, 2.0, 0, 0), translate(line, 0, lineY, 0), sway(lodPair(merge(cloths), clothFar), hang), pegs);
}

function glassFurnace(): Geo {
  const base = box(1.6, 0.5, 1.4, 'clayDeep');
  const kilnDome = merge(at(stretch(dome(1, 'clay', 10, 4), 0.75, 0.9, 0.65), 0, 0.5, 0), at(box(0.3, 2.2, 0.3, 'clayDeep'), 0.3, 1.0, -0.4));
  const mouth = merge(at(lyingZ(0.22, 0.1, 'butter', 10), 0, 0.85, 0.62), at(lyingZ(0.14, 0.12, 'coral', 8), 0, 0.85, 0.64));
  const marver = merge(at(box(0.9, 0.06, 0.5, 'stone'), 1.4, 0.82, 0.4), at(legs(0.8, 0.4, 0.82, 0.05, 'slate'), 1.4, 0, 0.4));
  const pipes = detail(merge([0, 1, 2].map((i) => rod([-1.0, 0.0, -0.3 + i * 0.15], [-1.0, 1.5, -0.25 + i * 0.15], 0.02, 'slate'))));
  const rack = detail(at(box(0.08, 1.2, 0.6, 'timberDeep'), -1.1, 0, -0.1));
  const glass = detail(merge(
    translate(blob(0.08, 0.1, 0.08, 'blueLight', 6, 4), 1.2, 0.98, 0.35),
    translate(blob(0.07, 0.12, 0.07, 'sageLight', 6, 4), 1.4, 0.98, 0.45),
    translate(blob(0.06, 0.06, 0.06, 'butterLight', 6, 4), 1.6, 0.94, 0.35),
  ));
  return translate(merge(base, kilnDome, detail(mouth), farOnly(at(box(0.36, 0.3, 0.08, 'coral'), 0, 0.7, 0.62)), marver, pipes, rack, glass), -0.15, 0, 0);
}

/** Seeded stacks of woven baskets (nested piles and single baskets with handles). */
export function basketStack(seed: number): Geo {
  const rng = createRng(seed);
  const shapes = [
    lathe([[0.18, 0], [0.26, 0.22], [0.27, 0.26]], 'butterDeep', 8),
    lathe([[0.14, 0], [0.2, 0.3], [0.21, 0.34]], 'timber', 8),
    lathe([[0.22, 0], [0.3, 0.14], [0.31, 0.16]], 'butter', 8),
  ];
  const near: Geo[] = [];
  const far: Geo[] = [];
  const spots: ReadonlyArray<readonly [number, number]> = [[-0.45, 0], [0.05, -0.1], [0.5, 0.05]];
  spots.forEach(([x, z], i) => {
    const kind = rng.int(0, 2);
    const shape = shapes[kind] ?? shapes[0];
    if (!shape) return;
    const count = rng.int(1, 2);
    for (let k = 0; k < count; k++) near.push(at(shape, x, k * 0.08, z, rng.range(0, PI)));
    if (i === 1) near.push(translate(rotateZ(torus(0.18, 0.015, 'timberDeep', 3, 10), PI / 2), x, 0.3 + count * 0.08, z));
    far.push(at(cyl(0.22, 0.28, 0.24 + count * 0.08, 'butterDeep', 5), x, 0, z));
  });
  return merge(detail(merge(near)), farOnly(merge(far)));
}

/** Half-width and keel depth of the boat under construction at station t in [-1, 1]. */
function hullHalfWidth(t: number): number {
  return 1.0 * Math.sqrt(Math.max(0.02, 1 - t * t));
}

function boatSlipway(): Geo {
  const L = 7.0;
  const keelY = 0.55;
  const rails = merge(at(box(9, 0.12, 0.14, 'timberDeep'), 0, 0, -0.5), at(box(9, 0.12, 0.14, 'timberDeep'), 0, 0, 0.5));
  const sleepers = detail(merge([0, 1, 2, 3, 4, 5].map((i) => at(box(0.2, 0.08, 1.6, 'timber'), -4 + i * 1.6, 0, 0))));
  const cradles = merge([-2.4, 0, 2.4].map((x) => at(box(0.3, keelY, 0.6, 'timber'), x, 0.12, 0)));
  const keel = at(box(L, 0.16, 0.14, 'timberDeep'), 0, keelY, 0);
  const stem = rod([L / 2 - 0.05, keelY, 0], [L / 2 + 0.35, keelY + 1.25, 0], 0.14, 'timberDeep');
  const stern = rod([-L / 2, keelY, 0], [-L / 2 - 0.1, keelY + 1.15, 0], 0.14, 'timberDeep');
  const ribs: Geo[] = [];
  const nRibs = 7;
  for (let i = 0; i < nRibs; i++) {
    const t = -0.85 + (1.7 * i) / (nRibs - 1);
    const x = (t * L) / 2;
    const w = hullHalfWidth(t);
    const pts: ReadonlyArray<readonly [number, number]> = [[-w, 1.25], [-0.92 * w, 0.75], [-0.5 * w, 0.25], [0.5 * w, 0.25], [0.92 * w, 0.75], [w, 1.25]];
    for (let k = 0; k < pts.length - 1; k++) {
      const a = pts[k] ?? [0, 0];
      const b = pts[k + 1] ?? [0, 0];
      ribs.push(rod([x, keelY + a[1], a[0]], [x, keelY + b[1], b[0]], 0.08, 'timber'));
    }
  }
  const strake = (frac: number, yLocal: number, side: 1 | -1, tinted: boolean): Geo => {
    const seg: Geo[] = [];
    for (let i = 0; i < 6; i++) {
      const ta = -0.85 + (1.7 * i) / 6;
      const tb = -0.85 + (1.7 * (i + 1)) / 6;
      const g = rod([(ta * L) / 2, keelY + yLocal, side * frac * hullHalfWidth(ta)], [(tb * L) / 2, keelY + yLocal, side * frac * hullHalfWidth(tb)], 0.1, tinted ? 'coral' : 'butterLight');
      seg.push(tinted ? tintable(g) : g);
    }
    return merge(seg);
  };
  const planking = merge(strake(0.55, 0.3, 1, true), strake(0.55, 0.3, -1, true), strake(0.8, 0.52, 1, false), strake(0.8, 0.52, -1, false));
  const hullFar = farOnly(merge(
    tintable(at(stretch(dome(1, 'coral', 8, 2), L / 2, 0.6, 0.85), 0, keelY + 0.0, 0)),
    at(box(0.12, 1.25, 1.9, 'timber'), 0, keelY, 0),
  ));
  return merge(rails, sleepers, cradles, keel, detail(merge(stem, stern)), farOnly(merge(at(box(0.14, 1.2, 0.14, 'timberDeep'), L / 2 + 0.2, keelY, 0), at(box(0.14, 1.15, 0.14, 'timberDeep'), -L / 2 - 0.05, keelY, 0))), merge(ribs), planking, hullFar);
}

const FONT: Readonly<Record<string, readonly string[]>> = {
  A: ['010', '101', '111', '101', '101'], C: ['011', '100', '100', '100', '011'], D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'], H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'], L: ['100', '100', '100', '100', '111'], M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['1001', '1101', '1011', '1001', '1001'], O: ['111', '101', '101', '101', '111'], P: ['110', '101', '110', '100', '100'],
  R: ['110', '101', '110', '101', '101'], S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'], W: ['10001', '10001', '10101', '11011', '10001'], Y: ['101', '101', '010', '010', '010'],
};

/** One giant letter as merged horizontal runs of 0.2 m cells; base at y = 0, left edge at x = 0. */
function letterGeo(rows: readonly string[], col: Col, cell: number): Geo {
  const parts: Geo[] = [];
  rows.forEach((row, r) => {
    const y = (rows.length - 1 - r) * cell;
    let start = -1;
    for (let c = 0; c <= row.length; c++) {
      const on = row[c] === '1';
      if (on && start < 0) start = c;
      if (!on && start >= 0) {
        const w = (c - start) * cell;
        parts.push(at(box(w, cell, 0.12, col), start * cell + w / 2, y, 0));
        start = -1;
      }
    }
  });
  return merge(parts);
}

/** Sign-painter's giant letters (known glyphs A C D E F H I L M N O P R S T U W Y), leaning back on a wall. */
export function giantLetters(text: string, cell = 0.2): Geo {
  const glyphs = [...text.toUpperCase()].map((ch) => FONT[ch]).filter((g): g is readonly string[] => g !== undefined);
  const widths = glyphs.map((g) => (g[0]?.length ?? 3) * cell);
  const total = widths.reduce((a, b) => a + b, 0) + Math.max(0, glyphs.length - 1) * cell * 0.8;
  let x = -total / 2;
  const near: Geo[] = [];
  const far: Geo[] = [];
  glyphs.forEach((g, i) => {
    const w = widths[i] ?? 0;
    const col: Col = i % 2 === 0 ? 'coral' : 'butter';
    const glyph = letterGeo(g, col, cell);
    const placed = (geo: Geo): Geo => translate(rotateX(geo, -0.12), x, 0, 0.1);
    near.push(i % 2 === 0 ? tintable(placed(glyph)) : placed(glyph));
    const slab = translate(box(w, g.length * cell, 0.12, col), w / 2, 0, 0);
    far.push(i % 2 === 0 ? tintable(placed(slab)) : placed(slab));
    x += w + cell * 0.8;
  });
  const drips = detail(merge([0, 1, 2].map((i) => at(box(0.04, 0.12, 0.03, 'coral'), -total / 2 + 0.1 + i * 0.5, 0.0, 0.2))));
  return merge(detail(merge(near)), farOnly(merge(far)), drips);
}

function toolbox(): Geo {
  const body = tintable(box(0.5, 0.2, 0.24, 'coral'));
  const lip = at(box(0.52, 0.04, 0.26, 'ivory'), 0, 0.18, 0);
  const handle = merge(rod([-0.15, 0.22, 0], [-0.15, 0.32, 0], 0.025, 'slate'), rod([0.15, 0.22, 0], [0.15, 0.32, 0], 0.025, 'slate'), rod([-0.15, 0.32, 0], [0.15, 0.32, 0], 0.025, 'slate'));
  const latches = detail(merge(at(box(0.04, 0.05, 0.02, 'butter'), -0.15, 0.13, 0.12), at(box(0.04, 0.05, 0.02, 'butter'), 0.15, 0.13, 0.12)));
  const tools = detail(merge(rod([0.1, 0.2, -0.05], [0.32, 0.3, -0.05], 0.025, 'timber'), at(box(0.04, 0.05, 0.1, 'slate'), 0.32, 0.28, -0.05), rod([-0.2, 0.2, 0.05], [-0.28, 0.34, 0.05], 0.03, 'butterDeep')));
  return merge(body, lip, handle, latches, tools);
}

export const CRAFT_ARTS: readonly PropDef[] = [
  prop('craft.marbleBlock', [0.9, 0.7], { budget: 'furniture', tags: ['craft-yard', 'sculptor'] }, marbleBlock),
  prop('craft.statue', [0.7, 0.7], { budget: 'furniture', tags: ['craft-yard', 'sculptor'] }, finishedStatue),
  prop('craft.loom', [1.3, 1.2], {
    budget: 'stall',
    tint: 'coral',
    tags: ['craft-yard', 'textile'],
    seats: [{ x: 0, y: 0.48, z: 0.75, heading: PI }],
  }, loom),
  prop('craft.spinningWheel', [0.9, 0.7], { budget: 'furniture', tags: ['craft-yard', 'textile'] }, spinningWheel),
  prop('craft.dyeVat', [0.72, 0.72], { budget: 'clutter', tint: 'coral', tags: ['craft-yard', 'textile'] }, () => dyeVat('coral', true, true)),
  prop('craft.dyeVats', [2.3, 0.85], { budget: 'furniture', tint: 'coral', tags: ['craft-yard', 'textile'] }, dyeVatTrio),
  prop('craft.dryingLines', [4.1, 0.2], { budget: 'furniture', tint: 'coral', tags: ['craft-yard', 'textile', 'laundry'] }, dryingLines),
  prop('craft.glassFurnace', [3.0, 1.4], { budget: 'stall', tags: ['craft-yard', 'glass'] }, glassFurnace),
  prop('craft.baskets', [1.4, 0.7], { budget: 'furniture', tags: ['craft-yard', 'basket'] }, () => basketStack(5)),
  prop('craft.boatSlipway', [9.0, 2.0], { budget: 'stall', tint: 'coral', tags: ['craft-yard', 'boat', 'harbour'] }, boatSlipway),
  prop('craft.lettersFair', [2.9, 0.3], { budget: 'stall', tint: 'coral', tags: ['craft-yard', 'sign', 'against-wall'] }, () => giantLetters('FAIR')),
  prop('craft.lettersCafe', [2.9, 0.3], { budget: 'stall', tint: 'blue', tags: ['craft-yard', 'sign', 'against-wall'] }, () => giantLetters('CAFE')),
  prop('craft.toolbox', [0.5, 0.25], { budget: 'clutter', tint: 'coral', tags: ['craft-yard', 'clutter'] }, toolbox),
];
