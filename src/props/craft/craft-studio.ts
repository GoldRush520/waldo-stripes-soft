/** Craft yard: painters, potters, smiths and carpenters at work. */
import {
  type Col,
  type Geo,
  blob,
  box,
  cyl,
  detail,
  dome,
  farOnly,
  lathe,
  merge,
  prism,
  profile,
  pyramid,
  rotateX,
  rotateZ,
  tintable,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { PI, at, legs, lodPair, lyingZ, prop, rod } from './kit';

function easel(): Geo {
  const lean = -0.18;
  const canvas = merge(
    box(0.62, 0.8, 0.03, 'ivory'),
    detail(merge(
      tintable(at(box(0.3, 0.22, 0.02, 'coral'), -0.1, 0.45, 0.02)),
      at(box(0.4, 0.14, 0.02, 'sage'), 0.06, 0.12, 0.02),
      at(box(0.14, 0.3, 0.02, 'butter'), 0.18, 0.4, 0.02),
      tintable(at(box(0.2, 0.08, 0.02, 'coral'), -0.15, 0.28, 0.02)),
    )),
  );
  return merge(
    translate(rotateX(canvas, lean), 0, 0.82, 0.08),
    rod([-0.3, 0, 0.18], [0, 1.8, -0.1], 0.04, 'timber'),
    rod([0.3, 0, 0.18], [0, 1.8, -0.1], 0.04, 'timber'),
    rod([0, 0, -0.5], [0, 1.7, -0.08], 0.04, 'timber'),
    rod([-0.36, 0.8, 0.16], [0.36, 0.8, 0.16], 0.05, 'timber'),
    farOnly(merge(at(box(0.5, 0.8, 0.04, 'timber'), 0, 0, 0.16), at(box(0.04, 1.0, 0.04, 'timber'), 0, 0.8, -0.08))),
  );
}

function painterTable(): Geo {
  const top = at(box(1.1, 0.04, 0.6, 'clay'), 0, 0.72, 0);
  const palette = detail(at(cyl(0.18, 0.18, 0.012, 'butterLight', 10), -0.2, 0.76, 0.05));
  const dots = detail(merge(
    (['coral', 'blue', 'sage'] as const).map((c, i) => at(cyl(0.025, 0.025, 0.01, c, 6), -0.3 + i * 0.06, 0.772, 0.0 + (i % 2) * 0.08)),
  ));
  const jar = (x: number, c: Col): Geo =>
    merge(at(cyl(0.05, 0.05, 0.12, 'blueLight', 8), x, 0.76, -0.12), rod([x, 0.8, -0.12], [x + 0.03, 0.98, -0.14], 0.012, c));
  const jars = detail(merge(jar(0.2, 'timber'), jar(0.33, 'coralDeep')));
  const rag = detail(tintable(at(box(0.2, 0.02, 0.16, 'coral'), 0.35, 0.76, 0.14, 0.4)));
  return merge(top, legs(1.0, 0.5, 0.72, 0.05, 'timberDeep'), palette, dots, jars, rag, farOnly(at(box(0.9, 0.7, 0.04, 'timberDeep'), 0, 0, 0)));
}

/** Paint can: stone tin with a tint-masked label band and optional tint-masked paint surface. */
function canBody(open: boolean): Geo {
  const near = merge(
    cyl(0.1, 0.1, 0.2, 'stone', 10),
    tintable(at(cyl(0.104, 0.104, 0.1, 'coral', 10), 0, 0.05, 0)),
    open ? tintable(at(cyl(0.09, 0.09, 0.012, 'coral', 10), 0, 0.195, 0)) : at(cyl(0.095, 0.095, 0.015, 'ivoryDeep', 10), 0, 0.2, 0),
    rod([-0.1, 0.18, 0], [0, 0.3, 0], 0.008, 'slate'),
    rod([0, 0.3, 0], [0.1, 0.18, 0], 0.008, 'slate'),
  );
  const far = merge(cyl(0.1, 0.1, 0.2, 'stone', 6), tintable(at(cyl(0.104, 0.104, 0.1, 'coral', 5, false), 0, 0.05, 0)));
  return lodPair(near, far);
}

/** Organic splat outline (seeded), as [x, z] points around the origin. */
function splatOutline(seed: number, r: number, n: number): Array<readonly [number, number]> {
  const rng = createRng(seed);
  const pts: Array<readonly [number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * PI * 2;
    const k = r * (i % 2 === 0 ? rng.range(0.75, 1.15) : rng.range(0.45, 0.75));
    pts.push([Math.cos(a) * k, Math.sin(a) * k]);
  }
  return pts;
}

/** Paint splatter decal (0.02 m raised, tint-masked): `shape` 0..2 picks size / spikiness. */
export function paintSplatter(shape = 0, seed = 1): Geo {
  const r = [0.35, 0.5, 0.7][Math.max(0, Math.min(2, shape))] ?? 0.5;
  const n = [10, 14, 12][Math.max(0, Math.min(2, shape))] ?? 12;
  const main = prism(splatOutline(seed * 31 + shape, r, n), 0.02, 'coral');
  const rng = createRng(seed * 7 + shape);
  const drops: Geo[] = [];
  for (let i = 0; i < 3; i++) {
    const a = rng.range(0, PI * 2);
    const d = r * rng.range(1.25, 1.6);
    drops.push(at(cyl(0.03 + 0.02 * rng.next(), 0.03, 0.02, 'coral', 5), Math.cos(a) * d, 0, Math.sin(a) * d));
  }
  const far = prism(splatOutline(seed * 31 + shape, r * 0.9, 6), 0.02, 'coral');
  return tintable(lodPair(merge(main, drops), far));
}

function canSpilled(): Geo {
  const can = translate(rotateZ(translate(canBody(true), 0, -0.1, 0), PI / 2), -0.25, 0.1, 0);
  return merge(can, at(paintSplatter(1, 3), 0.2, 0, 0.05));
}

function bucket(): Geo {
  const near = merge(
    tintable(cyl(0.13, 0.16, 0.3, 'coral', 10)),
    at(cyl(0.165, 0.165, 0.03, 'ivory', 10), 0, 0.27, 0),
    tintable(at(cyl(0.145, 0.145, 0.01, 'coralDeep', 10), 0, 0.29, 0)),
    rod([-0.16, 0.29, 0], [0, 0.42, 0], 0.01, 'slate'),
    rod([0, 0.42, 0], [0.16, 0.29, 0], 0.01, 'slate'),
  );
  return lodPair(near, tintable(cyl(0.13, 0.16, 0.3, 'coral', 6)));
}

function potterWheel(): Geo {
  const cabinet = merge(box(0.7, 0.5, 0.6, 'clay'), at(box(0.74, 0.04, 0.64, 'ivory'), 0, 0.5, 0));
  const tray = detail(at(cyl(0.3, 0.3, 0.08, 'clayDeep', 12), 0, 0.54, 0));
  const head = detail(at(cyl(0.16, 0.16, 0.04, 'slate', 10), 0, 0.6, 0));
  const pot = detail(at(lathe([[0.08, 0], [0.12, 0.06], [0.13, 0.12], [0.08, 0.2], [0.07, 0.24]], 'clayDeep', 10), 0, 0.64, 0));
  const stool = merge(at(cyl(0.17, 0.17, 0.05, 'timber', 8), 0, 0.45, 0.55), detail(at(cyl(0.04, 0.04, 0.45, 'timberDeep', 6), 0, 0, 0.55)));
  const kick = detail(at(cyl(0.22, 0.22, 0.04, 'timberDeep', 10), 0, 0.02, 0.3));
  const far = farOnly(at(cyl(0.14, 0.1, 0.26, 'clayDeep', 5), 0, 0.54, 0));
  return merge(cabinet, tray, head, pot, stool, kick, far);
}

function kiln(): Geo {
  const body = merge(box(1.4, 1.1, 1.2, 'clay'), at(dome(0.7, 'clay', 8, 3), 0, 1.1, 0));
  const door = merge(
    at(profile([[-0.3, 0], [0.3, 0], [0.3, 0.5], [0.15, 0.68], [-0.15, 0.68], [-0.3, 0.5]], 0.06, 'cocoa'), 0, 0.12, 0.6),
    detail(at(box(0.3, 0.2, 0.04, 'coral'), 0, 0.3, 0.64)),
  );
  const chimney = merge(at(box(0.4, 2.4, 0.4, 'clayDeep'), 0.35, 1.1, -0.3), at(box(0.48, 0.12, 0.48, 'ivory'), 0.35, 3.5, -0.3));
  const courses: Geo[] = [];
  for (let i = 0; i < 5; i++) courses.push(at(box(1.44, 0.03, 1.24, 'clayLight'), 0, 0.15 + i * 0.2, 0));
  const pots = detail(merge(at(lathe([[0.1, 0], [0.14, 0.12], [0.08, 0.24]], 'clayDeep', 8), -0.5, 0, 0.75), at(lathe([[0.08, 0], [0.12, 0.1], [0.06, 0.2]], 'clayLight', 8), -0.25, 0, 0.8)));
  const wood = detail(merge([0, 1, 2].map((i) => at(lyingZ(0.06, 0.5, 'timber', 6), 0.45 + i * 0.13, 0.06, 0.8))));
  return merge(body, door, chimney, detail(merge(courses)), pots, wood);
}

function potteryShelves(): Geo {
  const frame = merge(
    at(box(0.06, 1.8, 0.4, 'timberDeep'), -0.8, 0, 0),
    at(box(0.06, 1.8, 0.4, 'timberDeep'), 0.8, 0, 0),
    [0.3, 0.8, 1.3, 1.76].map((y) => at(box(1.6, 0.04, 0.4, 'timber'), 0, y, 0)),
  );
  const rng = createRng('craft.potteryShelves');
  const shapes = [
    lathe([[0.07, 0], [0.11, 0.08], [0.1, 0.16], [0.05, 0.22]], 'clayDeep', 8),
    lathe([[0.1, 0], [0.12, 0.06], [0.06, 0.12]], 'clay', 8),
    lathe([[0.05, 0], [0.08, 0.14], [0.04, 0.26], [0.05, 0.3]], 'clayLight', 8),
  ];
  const pots: Geo[] = [];
  const mounds: Geo[] = [];
  [0.34, 0.84, 1.34].forEach((y) => {
    for (let i = 0; i < 4; i++) pots.push(at(rng.pick(shapes), -0.6 + i * 0.4 + rng.range(-0.05, 0.05), y, rng.range(-0.05, 0.05)));
    mounds.push(at(box(1.3, 0.2, 0.25, 'clayDeep'), 0, y, 0));
  });
  return merge(frame, detail(merge(pots)), farOnly(merge(mounds)));
}

function anvilStump(): Geo {
  const anvilShape = profile([[-0.25, 0], [0.18, 0], [0.18, 0.12], [0.3, 0.14], [0.18, 0.2], [-0.25, 0.2], [-0.3, 0.16]], 0.14, 'slate');
  const near = merge(cyl(0.22, 0.24, 0.55, 'timber', 10), at(anvilShape, 0, 0.55, 0));
  const tools = merge(rod([-0.1, 0.76, 0.05], [0.15, 0.78, 0.15], 0.025, 'timber'), at(box(0.06, 0.05, 0.12, 'slate'), -0.12, 0.75, 0.04));
  const far = merge(cyl(0.22, 0.24, 0.55, 'timber', 5), at(box(0.5, 0.2, 0.14, 'slate'), 0, 0.55, 0));
  const quench = merge(at(cyl(0.12, 0.13, 0.3, 'timberDeep', 8), 0.05, 0, 0.36), at(cyl(0.11, 0.11, 0.01, 'blueLight', 8), 0.05, 0.28, 0.36));
  return lodPair(merge(near, tools, quench), far);
}

function forge(): Geo {
  const hearth = merge(box(1.4, 0.85, 1.0, 'clayDeep'), at(box(1.46, 0.06, 1.06, 'stone'), 0, 0.85, 0));
  const coals = detail(merge(
    [[-0.2, 0.1], [0, -0.05], [0.18, 0.08], [-0.05, 0.18], [0.1, -0.15]].map(([x, z], i) =>
      translate(blob(0.1, 0.05, 0.08, i % 2 === 0 ? 'coral' : 'butter', 6, 4), x ?? 0, 0.92, z ?? 0)),
  ));
  const glow = farOnly(at(box(0.6, 0.06, 0.5, 'coral'), 0, 0.9, 0));
  const hood = merge(at(pyramid(1.2, 0.6, 1.0, 'clay'), 0, 1.6, 0), at(box(0.36, 1.4, 0.36, 'clay'), 0, 2.1, 0));
  const posts = merge(at(box(0.08, 0.75, 0.08, 'timberDeep'), -0.55, 0.91, -0.4), at(box(0.08, 0.75, 0.08, 'timberDeep'), 0.55, 0.91, -0.4));
  const bellowsShape = profile([[0, 0], [0.7, 0.08], [0.7, 0.16], [0, 0.26]], 0.4, 'clay');
  const bellows = detail(merge(
    at(bellowsShape, 0.75, 0.6, 0),
    rod([1.45, 0.75, 0], [1.75, 1.0, 0], 0.04, 'timber'),
    at(box(0.05, 0.6, 0.05, 'timberDeep'), 1.0, 0, 0),
  ));
  const bellowsFar = farOnly(at(box(0.7, 0.2, 0.4, 'clay'), 1.1, 0.6, 0));
  const tongs = detail(merge(rod([-0.6, 0.92, 0.45], [-0.1, 0.95, 0.2], 0.02, 'slate'), rod([-0.6, 0.92, 0.48], [-0.1, 0.95, 0.24], 0.02, 'slate')));
  return translate(merge(hearth, coals, glow, hood, posts, bellows, bellowsFar, tongs), -0.25, 0, 0);
}

function workbench(): Geo {
  const top = at(box(2.0, 0.08, 0.75, 'timber'), 0, 0.82, 0);
  const shelf = at(box(1.8, 0.04, 0.6, 'timberDeep'), 0, 0.2, 0);
  const vice = detail(merge(at(box(0.2, 0.14, 0.12, 'slate'), -0.8, 0.82, 0.42), rod([-0.8, 0.86, 0.48], [-0.8, 0.86, 0.62], 0.02, 'slate'), rod([-0.9, 0.86, 0.62], [-0.7, 0.86, 0.62], 0.015, 'slate')));
  const hammer = merge(rod([0.2, 0.92, 0.1], [0.5, 0.92, 0.2], 0.03, 'timber'), at(box(0.04, 0.05, 0.12, 'slate'), 0.2, 0.9, 0.1));
  const saw = merge(at(rotateX(box(0.5, 0.15, 0.01, 'stone'), PI / 2), 0.55, 0.9, -0.15), at(box(0.14, 0.03, 0.1, 'coral'), 0.85, 0.9, -0.15));
  const chisels = merge([0, 1, 2].map((i) => rod([-0.2 + i * 0.07, 0.91, -0.1], [-0.2 + i * 0.07, 0.91, 0.12], 0.02, i === 1 ? 'butter' : 'timberDeep')));
  const shavings = merge([0, 1, 2, 3].map((i) => translate(blob(0.05, 0.03, 0.04, 'butterLight', 5, 3), -0.4 + i * 0.12, 0.93, 0.2)));
  const back = merge(at(box(2.0, 0.6, 0.04, 'timber'), 0, 0.9, -0.36), detail(merge([0, 1, 2, 3, 4].map((i) => rod([-0.8 + i * 0.4, 1.3, -0.33], [-0.8 + i * 0.4, 1.1, -0.33], 0.02, 'slate')))));
  return merge(top, shelf, legs(1.9, 0.68, 0.82, 0.08, 'timberDeep'), farOnly(merge(at(box(0.08, 0.82, 0.68, 'timberDeep'), -0.9, 0, 0), at(box(0.08, 0.82, 0.68, 'timberDeep'), 0.9, 0, 0))), vice, detail(merge(hammer, saw, chisels, shavings)), back);
}

function sawhorse(): Geo {
  return merge(
    at(box(0.08, 0.08, 0.9, 'timber'), 0, 0.62, 0),
    rod([-0.22, 0, -0.38], [0, 0.64, -0.38], 0.05, 'timberDeep'),
    rod([0.22, 0, -0.38], [0, 0.64, -0.38], 0.05, 'timberDeep'),
    rod([-0.22, 0, 0.38], [0, 0.64, 0.38], 0.05, 'timberDeep'),
    rod([0.22, 0, 0.38], [0, 0.64, 0.38], 0.05, 'timberDeep'),
    rod([-0.16, 0.2, -0.38], [0.16, 0.2, -0.38], 0.03, 'timberDeep'),
    rod([-0.16, 0.2, 0.38], [0.16, 0.2, 0.38], 0.03, 'timberDeep'),
    farOnly(box(0.36, 0.62, 0.8, 'timberDeep')),
  );
}

function sawhorsePair(): Geo {
  const plank = merge(at(box(2.4, 0.04, 0.3, 'butterLight'), 0, 0.7, 0), detail(at(box(0.02, 0.005, 0.3, 'cocoa'), 0.3, 0.74, 0)));
  const sawdust = detail(translate(blob(0.2, 0.03, 0.14, 'sand', 6, 3), 0.3, 0, 0.2));
  return merge(at(sawhorse(), -0.8, 0, 0, 0), at(sawhorse(), 0.8, 0, 0, 0), plank, sawdust);
}

export const CRAFT_STUDIO: readonly PropDef[] = [
  prop('craft.easel', [0.75, 0.75], { budget: 'clutter', tint: 'coral', tags: ['craft-yard', 'painter'] }, easel),
  prop('craft.painterTable', [1.1, 0.6], { budget: 'furniture', tint: 'coral', tags: ['craft-yard', 'painter'] }, painterTable),
  prop('craft.paintCan', [0.22, 0.22], { budget: 'clutter', tint: 'coral', tags: ['craft-yard', 'clutter'] }, () => canBody(false)),
  prop('craft.paintCanOpen', [0.22, 0.22], { budget: 'clutter', tint: 'blue', tags: ['craft-yard', 'clutter'] }, () => canBody(true)),
  prop('craft.paintBucket', [0.34, 0.34], { budget: 'clutter', tint: 'sage', tags: ['craft-yard', 'clutter'] }, bucket),
  prop('craft.paintCanSpilled', [0.4, 0.25], { budget: 'furniture', tint: 'butter', tags: ['craft-yard', 'clutter', 'overhang'] }, canSpilled),
  prop('craft.paintSplat1', [0, 0], { budget: 'clutter', tint: 'coral', tags: ['craft-yard', 'decal'] }, () => paintSplatter(0, 1)),
  prop('craft.paintSplat2', [0, 0], { budget: 'clutter', tint: 'blue', tags: ['craft-yard', 'decal'] }, () => paintSplatter(1, 2)),
  prop('craft.paintSplat3', [0, 0], { budget: 'clutter', tint: 'butter', tags: ['craft-yard', 'decal'] }, () => paintSplatter(2, 3)),
  prop('craft.potterWheel', [0.75, 1.0], {
    budget: 'furniture',
    tags: ['craft-yard', 'potter'],
    seats: [{ x: 0, y: 0.5, z: 0.55, heading: PI }],
  }, potterWheel),
  prop('craft.kiln', [1.6, 1.3], { budget: 'stall', tags: ['craft-yard', 'potter'] }, kiln),
  prop('craft.potteryShelves', [1.65, 0.4], { budget: 'stall', tags: ['craft-yard', 'potter'] }, potteryShelves),
  prop('craft.anvil', [0.6, 0.5], { budget: 'furniture', tags: ['craft-yard', 'smith'] }, anvilStump),
  prop('craft.forge', [2.0, 1.0], { budget: 'stall', tags: ['craft-yard', 'smith'] }, forge),
  prop('craft.workbench', [2.0, 0.75], { budget: 'stall', tags: ['craft-yard', 'carpenter'] }, workbench),
  prop('craft.sawhorses', [2.4, 0.95], { budget: 'furniture', tags: ['craft-yard', 'carpenter'] }, sawhorsePair),
];
