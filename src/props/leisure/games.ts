/** Funfair side-show games: high striker, coconut shy, hook-a-duck, ring toss, tin-can alley, ball toss. */
import { type Col, type Geo, beam, blob, cone, cyl, detail, merge, rotateX, rotateZ, sphere, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { backShelves, boothShell, shelfStandIn } from './booth';
import { boxAt, bulbs, lodPair, post, prop, rope, stripesX } from './kit';

const TOY_COLS: readonly Col[] = ['coral', 'blue', 'butter', 'sage', 'clayLight', 'blueLight'];

function highStrikerBuild(): Geo {
  const base = boxAt(1.2, 0.3, 0.9, 'clay', 0, 0, 0);
  const pad = boxAt(0.4, 0.12, 0.3, 'coral', 0, 0.3, 0.2);
  const tower = boxAt(0.28, 6.0, 0.18, 'ivory', 0, 0.3, -0.25);
  const scale = translate(rotateZ(stripesX(5.6, 0.22, 0.04, 9, 'coral', 'butter'), Math.PI / 2), 0.0, 3.4, -0.14);
  const bell = merge(translate(cone(0.28, 0.25, 'butter', 10), 0, 6.3, -0.25), translate(sphere(0.12, 'butterDeep', 6, 4), 0, 6.55, -0.25));
  const puck = detail(boxAt(0.12, 0.12, 0.08, 'blue', 0, 0.9, -0.12));
  const rail = rope([0.0, 0.42, -0.12], [0.0, 6.2, -0.12], 0.03, 'slate');
  const guys = detail(merge([-1, 1].map((s) => beam([s * 0.6, 0.3, -0.1], [0, 4.5, -0.25], 0.03, 'slate'))));
  const mallet = detail(merge(beam([0.5, 0.0, 0.5], [0.45, 1.0, 0.35], 0.05, 'timber'), translate(rotateZ(cyl(0.1, 0.1, 0.35, 'timberDeep', 8), Math.PI / 2), 0.62, 1.0, 0.35)));
  const sign = merge(boxAt(1.1, 0.45, 0.08, 'butter', 0, 5.4, -0.08), detail(boxAt(0.9, 0.25, 0.1, 'coral', 0, 5.5, -0.07)));
  const lights = bulbs(Array.from({ length: 12 }, (_, i) => [-0.17, 0.8 + i * 0.45, -0.2] as const));
  const levels = detail(merge([1.5, 2.6, 3.7, 4.8].map((y) => boxAt(0.5, 0.06, 0.05, 'cocoa', 0.3, y, -0.14))));
  return merge(base, pad, tower, scale, bell, puck, rail, guys, mallet, sign, levels, lights);
}

function coconutShyBuild(): Geo {
  const w = 3.6;
  const d = 2.4;
  const shell = boothShell({ w, d, stripe: 'sage', counterH: 0.9 });
  const cups = Array.from({ length: 5 }, (_, i) => {
    const x = -1.3 + i * 0.65;
    return merge(
      post(x, -d / 2 + 0.6, 1.1, 0.03, 'timberDeep', 5),
      translate(cone(0.09, 0.12, 'butter', 6), x, 1.1, -d / 2 + 0.6),
      translate(sphere(0.1, 'timberDeep', 6, 4), x, 1.3, -d / 2 + 0.6),
    );
  });
  const ballBasket = merge(cyl(0.2, 0.25, 0.25, 'timber', 8), translate(sphere(0.18, 'ivory', 6, 3), 0, 0.2, 0));
  const net = rope([-w / 2 + 0.1, 1.8, -d / 2 + 0.15], [w / 2 - 0.1, 1.8, -d / 2 + 0.15], 0.03, 'ivoryDeep');
  const far = boxAt(w - 0.6, 1.3, 0.2, 'timberDeep', 0, 0, -d / 2 + 0.6);
  return merge(shell, lodPair(merge(cups, translate(ballBasket, 1.2, 0.95, d / 2 - 0.25), net), far));
}

function hookADuckBuild(): Geo {
  const w = 3.2;
  const d = 2.2;
  const shell = boothShell({ w, d, stripe: 'blue', counterH: 0.8 });
  const trough = merge(boxAt(w - 0.4, 0.7, 0.9, 'blueDeep', 0, 0, -0.1), boxAt(w - 0.5, 0.04, 0.8, 'blueLight', 0, 0.68, -0.1));
  const ducks = Array.from({ length: 9 }, (_, i) => {
    const x = -1.2 + (i % 5) * 0.6 + (i > 4 ? 0.3 : 0);
    const z = i > 4 ? 0.1 : -0.3;
    return merge(
      translate(blob(0.1, 0.07, 0.13, 'butter', 5, 3), x, 0.76, z),
      translate(sphere(0.06, 'butter', 5, 3), x, 0.86, z + 0.08),
      boxAt(0.04, 0.03, 0.06, 'coral', x, 0.85, z + 0.15),
    );
  });
  const poles = merge([-0.9, 0.9].map((x) => merge(beam([x, 0.95, 0.75], [x, 2.0, 0.3], 0.025, 'timber'), beam([x, 2.0, 0.3], [x, 1.3, 0.3], 0.01, 'ivory'))));
  const prizes = merge(
    Array.from({ length: 6 }, (_, i) => translate(sphere(0.13, TOY_COLS[i % TOY_COLS.length] ?? 'coral', 6, 4), -1.2 + i * 0.48, 1.6, -d / 2 + 0.25)),
  );
  const shelf = backShelves(w, d, [1.45]);
  const far = merge(boxAt(w - 1.2, 0.08, 0.6, 'butter', 0, 0.72, -0.1), shelfStandIn(w, d, [1.45], 'coral', 0.25));
  return merge(shell, trough, shelf, lodPair(merge(ducks, poles, prizes), far));
}

function ringTossBuild(): Geo {
  const w = 3.2;
  const d = 2.6;
  const shell = boothShell({ w, d, stripe: 'butter', counterH: 0.9 });
  const table = boxAt(w - 0.6, 0.6, 1.3, 'clay', 0, 0, -0.35);
  const pegs = Array.from({ length: 15 }, (_, i) => {
    const x = -1.0 + (i % 5) * 0.5;
    const z = -0.85 + Math.floor(i / 5) * 0.45;
    const col = TOY_COLS[i % TOY_COLS.length] ?? 'coral';
    return translate(cyl(0.05, 0.03, 0.3, col, 5), x, 0.6, z);
  });
  const rings = merge([-0.5, 0.2, 0.6].map((x) => translate(cyl(0.1, 0.1, 0.02, 'coral', 8), x, 0.97, 0.95)));
  const far = boxAt(w - 1.0, 0.25, 1.1, 'sage', 0, 0.6, -0.35);
  return merge(shell, table, lodPair(merge(pegs, rings), far));
}

function tinCanBuild(): Geo {
  const w = 3.4;
  const d = 2.4;
  const shell = boothShell({ w, d, stripe: 'coral', counterH: 0.9 });
  const ys = [1.0, 1.6];
  const shelves = backShelves(w, d, ys);
  const can = cyl(0.06, 0.06, 0.14, 'ivoryShade', 5);
  const cans = ys.flatMap((y) =>
    [-0.9, 0.9].flatMap((cx) =>
      [3, 2, 1].flatMap((n, row) =>
        Array.from({ length: n }, (_, k) => translate(can, cx + (k - (n - 1) / 2) * 0.13, y + 0.05 + row * 0.14, -d / 2 + 0.25)),
      ),
    ),
  );
  const balls = merge([0.9, 1.1, 1.3].map((x) => translate(sphere(0.05, 'butter', 6, 4), x, 0.99, d / 2 - 0.2)));
  const far = merge(
    ys.flatMap((y) => [-0.9, 0.9].map((cx) => translate(cone(0.25, 0.42, 'ivoryShade', 4), cx, y + 0.05, -d / 2 + 0.25))),
  );
  return merge(shell, shelves, lodPair(merge(cans, balls), far));
}

function plush(col: Col): Geo {
  return merge(
    translate(blob(0.13, 0.15, 0.11, col, 5, 3), 0, 0.15, 0),
    translate(sphere(0.1, col, 5, 3), 0, 0.36, 0.01),
    boxAt(0.2, 0.06, 0.05, col, 0, 0.43, 0),
  );
}

function ballTossBuild(): Geo {
  const w = 3.8;
  const d = 2.6;
  const shell = boothShell({ w, d, stripe: 'blue', counterH: 0.95 });
  const ys = [1.1, 1.75];
  const shelves = backShelves(w, d, ys);
  const toys = ys.flatMap((y, r) =>
    Array.from({ length: 5 }, (_, i) =>
      translate(plush(TOY_COLS[(i + r * 2) % TOY_COLS.length] ?? 'coral'), -1.4 + i * 0.7, y + 0.05, -d / 2 + 0.25),
    ),
  );
  const sideToys = [-1, 1].map((s, i) => translate(plush(TOY_COLS[i + 2] ?? 'sage'), s * (w / 2 - 0.25), 0.95, 0.1));
  const targets = merge([-0.8, 0, 0.8].map((x) => translate(rotateX(cyl(0.18, 0.18, 0.04, 'coral', 10), Math.PI / 2), x, 0.75, -0.2)));
  const far = shelfStandIn(w, d, ys, 'coral', 0.4);
  return merge(shell, shelves, lodPair(merge(toys, sideToys, targets), far));
}

export const GAME_PROPS: readonly PropDef[] = [
  prop('game.highstriker', highStrikerBuild, [1.2, 0.9], 'stall', { tags: ['funfair', 'game'] }),
  prop('game.coconutshy', coconutShyBuild, [3.6, 2.4], 'stall', { tint: 'sage', tags: ['funfair', 'game', 'stall'] }),
  prop('game.hookaduck', hookADuckBuild, [3.2, 2.2], 'stall', { tint: 'blue', tags: ['funfair', 'game', 'stall'] }),
  prop('game.ringtoss', ringTossBuild, [3.2, 2.6], 'stall', { tint: 'butter', tags: ['funfair', 'game', 'stall'] }),
  prop('game.tincan', tinCanBuild, [3.4, 2.4], 'stall', { tint: 'coral', tags: ['funfair', 'game', 'stall'] }),
  prop('game.balltoss', ballTossBuild, [3.8, 2.6], 'stall', { tint: 'blue', tags: ['funfair', 'game', 'stall'] }),
];
