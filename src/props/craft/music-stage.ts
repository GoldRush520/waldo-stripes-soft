/** Music square: stage gear, street performance kit and festival set pieces. */
import {
  type Geo,
  beam,
  box,
  cone,
  cyl,
  detail,
  farOnly,
  gable,
  merge,
  prism,
  rotateX,
  rotateY,
  rotateZ,
  sphere,
  sway,
  tintable,
  torus,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { PI, at, hangSway, lodPair, lyingX, prop, rod, soft, stripedBox } from './kit';

export const TIGHTROPE_HEIGHT = 2.4;

function musicStand(): Geo {
  const desk = at(rotateX(box(0.5, 0.36, 0.02, 'cocoa'), -0.35), 0, 1.0, 0);
  return merge(
    desk,
    rod([0, 0, 0], [0, 1.02, 0], 0.025, 'cocoa'),
    rod([0, 0.02, 0], [0.22, 0, 0.12], 0.02, 'cocoa'),
    rod([0, 0.02, 0], [-0.22, 0, 0.12], 0.02, 'cocoa'),
    rod([0, 0.02, 0], [0, 0, -0.25], 0.02, 'cocoa'),
    detail(at(rotateX(box(0.4, 0.28, 0.01, 'ivory'), -0.35), 0, 1.05, 0.02)),
  );
}

function standRow(): Geo {
  const one = musicStand();
  return merge([0, 1, 2, 3].map((i) => at(one, -1.2 + i * 0.8, 0, 0)));
}

function podium(): Geo {
  const oct: Array<readonly [number, number]> = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * PI * 2 + PI / 8;
    oct.push([Math.cos(a) * 0.48, Math.sin(a) * 0.48]);
  }
  const base = tintable(prism(oct, 0.22, 'coral'));
  const top = prism(oct.map(([x, z]) => [x * 0.92, z * 0.92] as const), 0.03, 'ivory');
  const rail = merge(
    rod([-0.3, 0.25, -0.32], [-0.3, 1.05, -0.32], 0.035, 'butter'),
    rod([0.3, 0.25, -0.32], [0.3, 1.05, -0.32], 0.035, 'butter'),
    rod([-0.3, 1.05, -0.32], [0.3, 1.05, -0.32], 0.035, 'butter'),
    rod([-0.3, 0.65, -0.32], [0.3, 0.65, -0.32], 0.025, 'butter'),
  );
  const desk = detail(merge(at(rotateX(box(0.4, 0.28, 0.03, 'cocoa'), -0.5), 0, 1.05, 0.38), rod([0, 0.25, 0.38], [0, 1.05, 0.38], 0.03, 'cocoa')));
  const baton = detail(rod([0.1, 1.1, 0.4], [0.3, 1.12, 0.45], 0.008, 'ivory'));
  const trim = detail(at(cyl(0.5, 0.5, 0.04, 'ivory', 16), 0, 0.12, 0));
  return merge(base, at(top, 0, 0.22, 0), rail, desk, baton, trim);
}

function microphone(): Geo {
  return merge(
    detail(cyl(0.14, 0.12, 0.03, 'cocoa', 8)),
    farOnly(box(0.2, 0.03, 0.2, 'cocoa')),
    lodPair(beam([0, 0, 0], [0, 1.45, 0], 0.025, 'cocoa'), box(0.04, 1.45, 0.04, 'cocoa')),
    rod([0, 1.45, 0], [0, 1.5, 0.14], 0.018, 'cocoa'),
    detail(translate(sphere(0.045, 'slate', 6, 4), 0, 1.52, 0.17)),
    detail(merge(rod([0, 1.0, 0], [0.04, 0.6, 0.08], 0.01, 'ink'), rod([0.04, 0.6, 0.08], [0.06, 0.0, 0.2], 0.01, 'ink'))),
  );
}

function speakerStack(): Geo {
  const cab = (w: number, h: number, y: number, r: number): Geo =>
    merge(
      tintable(at(box(w, h, 0.5, 'blueDeep'), 0, y, 0)),
      detail(at(rotateX(cyl(r, r, 0.03, 'ivory', 12), PI / 2), 0, y + h / 2, 0.25)),
      detail(at(rotateX(cyl(r * 0.35, r * 0.35, 0.05, 'ink', 8), PI / 2), 0, y + h / 2, 0.26)),
    );
  return merge(
    cab(0.7, 0.75, 0, 0.27),
    cab(0.7, 0.55, 0.75, 0.18),
    cab(0.55, 0.35, 1.3, 0.1),
    detail(at(box(0.72, 0.04, 0.52, 'ivory'), 0, 0.74, 0)),
    detail(at(box(0.72, 0.04, 0.52, 'ivory'), 0, 1.29, 0)),
  );
}

function buskerCase(): Geo {
  const shell = at(box(0.95, 0.08, 0.36, 'timberDeep'), 0, 0, 0);
  const lining = tintable(at(box(0.9, 0.03, 0.31, 'coral'), 0, 0.07, 0));
  const lidClosed = merge(at(box(0.95, 0.06, 0.36, 'timberDeep'), 0, 0, 0.18), tintable(detail(at(box(0.9, 0.03, 0.31, 'coral'), 0, -0.03, 0.18))));
  const lid = translate(rotateX(lidClosed, -1.9), 0, 0.08, -0.18);
  const coin = cyl(0.014, 0.014, 0.004, 'butter', 6);
  const coins = detail(merge(at(coin, -0.2, 0.1, 0.02), at(coin, -0.1, 0.1, -0.05), at(coin, 0.15, 0.1, 0.06)));
  const sign = detail(at(box(0.18, 0.005, 0.1, 'ivory'), 0.05, 0.1, -0.02));
  return merge(shell, lining, lid, coins, sign);
}

function sheetMusic(): Geo {
  const rng = createRng('craft.sheetMusic');
  const sheet = merge(box(0.21, 0.004, 0.3, 'ivory'), at(box(0.15, 0.003, 0.16, 'clay'), 0, 0.004, -0.02));
  const sheets: Geo[] = [];
  for (let i = 0; i < 6; i++) {
    sheets.push(at(sheet, rng.range(-0.7, 0.7), 0, rng.range(-0.45, 0.45), rng.range(0, PI)));
  }
  return merge(detail(merge(sheets)), farOnly(box(0.9, 0.004, 0.5, 'ivory')));
}

function bannerPoles(): Geo {
  const pole = lodPair(cyl(0.035, 0.035, 2.6, 'timber', 6), box(0.06, 2.6, 0.06, 'timber'));
  const finial = detail(merge(translate(sphere(0.06, 'butter', 6, 4), -1.05, 2.65, 0), translate(sphere(0.06, 'butter', 6, 4), 1.05, 2.65, 0)));
  const bar = rod([-1.05, 2.45, 0], [1.05, 2.45, 0], 0.03, 'timber');
  const cloth = merge(
    tintable(at(box(1.9, 0.9, 0.02, 'blue'), 0, 1.5, 0)),
    at(box(1.9, 0.1, 0.06, 'ivory'), 0, 2.32, 0),
    at(box(1.9, 0.1, 0.06, 'ivory'), 0, 1.5, 0),
    detail(merge([0, 1, 2, 3, 4].map((i) => at(box(0.18, 0.3, 0.05, 'ivory'), -0.6 + i * 0.3, 1.78, 0)))),
  );
  return merge(at(pole, -1.05, 0, 0), at(pole, 1.05, 0, 0), finial, bar, sway(cloth, hangSway(2.42, 0.95)));
}

function puppetBooth(): Geo {
  const lower = lodPair(stripedBox(1.3, 1.2, 0.7, 7), stripedBox(1.3, 1.2, 0.7, 3));
  const post = tintable(box(0.16, 0.9, 0.7, 'coral'));
  const header = merge(at(box(1.3, 0.28, 0.7, 'ivory'), 0, 1.82, 0), tintable(at(rotateY(gable(0.7, 0.3, 1.36, 'coral'), PI / 2), 0, 2.1, 0)));
  const back = detail(at(box(1.0, 0.62, 0.04, 'blueDeep'), 0, 1.2, -0.3));
  const ledge = detail(at(box(1.02, 0.05, 0.16, 'ivory'), 0, 1.2, 0.36));
  const curtains = detail(merge(at(box(0.22, 0.6, 0.03, 'butter'), -0.38, 1.22, 0.3), at(box(0.22, 0.6, 0.03, 'butter'), 0.38, 1.22, 0.3)));
  const puppets = detail(
    merge(
      translate(sphere(0.07, 'coralLight', 6, 4), -0.12, 1.42, 0.2),
      at(cone(0.08, 0.16, 'sage', 6), -0.12, 1.25, 0.2),
      translate(sphere(0.07, 'butterLight', 6, 4), 0.14, 1.4, 0.2),
      at(cone(0.08, 0.16, 'blue', 6), 0.14, 1.23, 0.2),
    ),
  );
  const scallop = rotateX(cone(0.08, 0.1, 'butter', 5), PI);
  const scallops = detail(merge([0, 1, 2, 3, 4, 5].map((i) => translate(scallop, -0.5 + i * 0.2, 1.82, 0.33))));
  return merge(lower, at(post, -0.57, 1.2, 0), at(post, 0.57, 1.2, 0), header, back, ledge, curtains, puppets, scallops);
}

function statuePlinth(): Geo {
  return merge(
    box(0.8, 0.15, 0.8, 'stone'),
    at(soft(0.62, 0.7, 0.62, 0.05, 'ivory'), 0, 0.15, 0),
    at(box(0.76, 0.08, 0.76, 'stone'), 0, 0.85, 0),
    detail(at(box(0.36, 0.14, 0.02, 'butter'), 0, 0.4, 0.32)),
    detail(merge(at(cyl(0.12, 0.08, 0.06, 'ink', 8), 0.25, 0, 0.6), at(cyl(0.16, 0.16, 0.01, 'ink', 8), 0.25, 0, 0.6))),
  );
}

function jugglerBox(): Geo {
  const chest = merge(tintable(box(0.62, 0.36, 0.4, 'blue')), at(box(0.64, 0.05, 0.42, 'ivory'), 0, 0.15, 0));
  const lid = translate(rotateX(tintable(box(0.62, 0.04, 0.4, 'blue')), -1.75), 0, 0.36, -0.2);
  const club = (x: number, z: number, a: number): Geo =>
    at(rotateZ(merge(cyl(0.015, 0.04, 0.32, 'ivory', 5), at(cyl(0.04, 0.02, 0.1, 'coral', 5), 0, 0.32, 0)), a), x, 0.3, z);
  const ring = (x: number, a: number, c: 'butter' | 'sage'): Geo =>
    translate(rotateX(torus(0.11, 0.014, c, 3, 8), a), x, 0.42, 0.04);
  return merge(
    chest,
    lid,
    detail(merge(club(-0.18, 0.05, 0.3), club(-0.1, -0.05, 0.2), club(-0.02, 0.08, 0.4))),
    detail(merge(ring(0.15, 1.2, 'butter'), ring(0.2, 1.4, 'sage'))),
    detail(merge(at(box(0.06, 0.06, 0.06, 'butter'), -0.2, 0.36, 0.22), at(box(0.06, 0.06, 0.06, 'butter'), 0.2, 0.36, 0.22))),
  );
}

function unicycle(): Geo {
  const tire = at(lyingX(0.25, 0.05, 'ink', 12), 0, 0.27, 0);
  const tireFar = farOnly(at(lyingX(0.25, 0.05, 'ink', 6), 0, 0.27, 0));
  const standBlock = box(0.3, 0.06, 0.4, 'timber');
  const fork = merge(rod([-0.04, 0.27, 0], [-0.03, 0.62, 0], 0.025, 'coral'), rod([0.04, 0.27, 0], [0.03, 0.62, 0], 0.025, 'coral'));
  const post = rod([0, 0.62, 0], [0, 0.95, -0.02], 0.03, 'slate');
  const saddle = detail(at(box(0.12, 0.05, 0.26, 'coral'), 0, 0.95, -0.02));
  return merge(standBlock, detail(tire), tireFar, fork, post, saddle);
}

function stilts(): Geo {
  const one = (x: number): Geo => {
    const segs: Geo[] = [];
    for (let i = 0; i < 4; i++) {
      const piece = box(0.05, 0.5, 0.05, i % 2 === 0 ? 'coral' : 'ivory');
      segs.push(i % 2 === 0 ? tintable(at(piece, 0, i * 0.5, 0)) : at(piece, 0, i * 0.5, 0));
    }
    const near = merge(segs, at(box(0.14, 0.03, 0.1, 'timber'), 0, 0.5, 0.06), at(box(0.07, 0.04, 0.07, 'cocoa'), 0, 0, 0));
    const far = tintable(box(0.05, 2.0, 0.05, 'coral'));
    return translate(rotateX(lodPair(near, far), -0.2), x, 0.025, 0.2);
  };
  return merge(one(-0.15), one(0.15));
}

export function tightropeRig(span = 8): { readonly geo: Geo; readonly ropeHeight: number } {
  const h = TIGHTROPE_HEIGHT;
  const end = (x: number, out: number): Geo =>
    merge(
      lodPair(
        merge(rod([x, 0, -0.6], [x, h + 0.1, 0], 0.08, 'timber'), rod([x, 0, 0.6], [x, h + 0.1, 0], 0.08, 'timber')),
        at(box(0.08, h, 0.6, 'timber'), x, 0, 0),
      ),
      rod([x, 0.9, -0.4], [x, 0.9, 0.4], 0.05, 'timber'),
      at(box(0.4, 0.06, 0.4, 'ivory'), x, h + 0.06, 0),
      rod([x, h + 0.1, 0], [x + out, 0.02, 0], 0.015, 'cocoa'),
      detail(at(box(0.08, 0.15, 0.08, 'cocoa'), x + out, 0, 0)),
    );
  const half = span / 2;
  const rope = lodPair(
    merge(rod([-half, h, 0], [half, h, 0], 0.025, 'ivory')),
    at(box(span, 0.05, 0.05, 'ivory'), 0, h - 0.025, 0),
  );
  const flags = detail(
    merge(
      tintable(at(box(0.02, 0.3, 0.25, 'coral'), -half, h + 0.3, 0.14)),
      tintable(at(box(0.02, 0.3, 0.25, 'coral'), half, h + 0.3, 0.14)),
      rod([-half, h, 0], [-half, h + 0.65, 0], 0.02, 'cocoa'),
      rod([half, h, 0], [half, h + 0.65, 0], 0.02, 'cocoa'),
    ),
  );
  return { geo: merge(end(-half, -0.9), end(half, 0.9), rope, flags), ropeHeight: h };
}

export function danceFloor(n = 6, tile = 0.66): Geo {
  const tiles: Geo[] = [];
  const off = ((n - 1) * tile) / 2;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const t = at(box(tile - 0.01, 0.02, tile - 0.01, (i + j) % 2 === 0 ? 'coral' : 'ivory'), i * tile - off, 0, j * tile - off);
      tiles.push((i + j) % 2 === 0 ? tintable(t) : t);
    }
  }
  const k = Math.ceil(n / 2);
  const big = tile * 2;
  const offB = ((k - 1) * big) / 2;
  const coarse: Geo[] = [];
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      const t = at(box(big, 0.02, big, (i + j) % 2 === 0 ? 'coral' : 'ivory'), i * big - offB, 0, j * big - offB);
      coarse.push((i + j) % 2 === 0 ? tintable(t) : t);
    }
  }
  return merge(detail(merge(tiles)), farOnly(merge(coarse)));
}

function ribbonPoles(): Geo {
  const one = (x: number, z: number, h: number, col: 'coral' | 'blue' | 'butter'): Geo => {
    const ribbons = merge(
      at(box(0.06, 0.9, 0.01, col), 0.05, h - 0.95, 0.03),
      at(box(0.06, 0.7, 0.01, 'ivory'), -0.05, h - 0.75, 0.03),
    );
    return at(
      merge(
        lodPair(cyl(0.03, 0.03, h, 'timber', 6), box(0.05, h, 0.05, 'timber')),
        detail(translate(sphere(0.06, 'butter', 6, 4), 0, h + 0.02, 0)),
        sway(detail(ribbons), hangSway(h, 0.9)),
        farOnly(sway(at(box(0.12, 0.8, 0.02, col), 0, h - 0.85, 0.03), hangSway(h, 0.8))),
      ),
      x,
      0,
      z,
    );
  };
  return merge(one(-0.6, 0, 2.2, 'coral'), one(0, -0.3, 2.4, 'blue'), one(0.6, 0.1, 2.1, 'butter'));
}

function confettiCannon(): Geo {
  const barrel = merge(tintable(cyl(0.16, 0.2, 0.9, 'coral', 10)), at(cyl(0.21, 0.21, 0.08, 'ivory', 10), 0, 0.42, 0), at(cyl(0.18, 0.18, 0.06, 'ivory', 10), 0, 0.86, 0));
  const barrelFar = tintable(cyl(0.18, 0.2, 0.9, 'coral', 6));
  const tilted = (g: Geo): Geo => translate(rotateX(g, 0.7), 0, 0.38, -0.25);
  const base = merge(box(0.6, 0.3, 0.7, 'blue'), at(box(0.62, 0.05, 0.72, 'ivory'), 0, 0.3, 0));
  const wheels = detail(merge(at(lyingX(0.18, 0.05, 'cocoa', 8), -0.33, 0.18, 0), at(lyingX(0.18, 0.05, 'cocoa', 8), 0.33, 0.18, 0)));
  const confetti = detail(
    merge(
      ['coral', 'butter', 'sage', 'blue', 'coralLight', 'butterLight'].map((c, i) =>
        at(box(0.05, 0.005, 0.03, c as 'coral'), Math.cos(i * 1.7) * 0.5, 0, 0.45 + Math.sin(i * 2.3) * 0.15, i),
      ),
    ),
  );
  return merge(base, lodPair(tilted(barrel), tilted(barrelFar)), wheels, confetti);
}

function operaSteps(): Geo {
  const steps = 5;
  const rise = 0.17;
  const tread = 0.42;
  const parts: Geo[] = [];
  const near: Geo[] = [];
  for (let i = 0; i < steps; i++) {
    const zf = 1.05 - i * tread;
    const depth = i === steps - 1 ? tread + 0.3 : tread;
    const zc = zf - depth / 2;
    const top = (i + 1) * rise;
    parts.push(at(box(4, top, depth, i % 2 === 0 ? 'ivory' : 'stone'), 0, 0, zc));
    near.push(at(box(1.4, 0.02, depth, 'coral'), 0, top, zc));
    near.push(at(box(1.4, rise, 0.02, 'coral'), 0, top - rise, zf + 0.01));
    near.push(at(lyingX(0.012, 1.5, 'butter', 5), 0, top - rise + 0.03, zf + 0.03));
  }
  const runnerFar = farOnly(at(rotateX(box(1.4, 0.04, Math.hypot(steps * tread, steps * rise) + 0.1, 'coral'), Math.atan2(rise, tread)), 0, steps * rise * 0.5 + 0.06, 1.05 - (steps * tread) / 2));
  const posts = detail(merge([-1, 1].map((s) => merge(at(cyl(0.05, 0.05, 0.9, 'butter', 8), s * 1.9, steps * rise, -0.95), translate(sphere(0.07, 'butter', 6, 4), s * 1.9, steps * rise + 0.95, -0.95)))));
  return merge(parts, detail(merge(near)), runnerFar, posts);
}

export const MUSIC_STAGE: readonly PropDef[] = [
  prop('music.stand', [0.5, 0.4], { budget: 'clutter', tags: ['music'] }, musicStand),
  prop('music.standRow', [3.0, 0.4], { budget: 'furniture', tags: ['music'] }, standRow),
  prop('music.podium', [1.0, 1.0], {
    budget: 'furniture',
    tint: 'coral',
    tags: ['music', 'stage'],
    seats: [{ x: 0, y: 0.25, z: 0, heading: PI }],
    seatKind: 'feet',
  }, podium),
  prop('music.microphone', [0.3, 0.3], { budget: 'clutter', tags: ['music', 'stage'] }, microphone),
  prop('music.speakerStack', [0.7, 0.5], { budget: 'furniture', tint: 'blueDeep', tags: ['music', 'stage'] }, speakerStack),
  prop('music.buskerCase', [0.95, 0.5], { budget: 'clutter', tint: 'coral', tags: ['music', 'busker'] }, buskerCase),
  prop('music.sheetScatter', [0, 0], { budget: 'clutter', tags: ['music', 'decal', 'clutter'] }, sheetMusic),
  prop('music.bannerPoles', [2.2, 0.15], { budget: 'furniture', tint: 'blue', tags: ['music', 'parade'] }, bannerPoles),
  prop('music.puppetBooth', [1.3, 0.7], { budget: 'stall', tint: 'coral', tags: ['performance'] }, puppetBooth),
  prop('music.statuePlinth', [0.8, 0.8], {
    budget: 'furniture',
    tags: ['performance'],
    seats: [{ x: 0, y: 0.93, z: 0, heading: 0 }],
    seatKind: 'feet',
  }, statuePlinth),
  prop('music.jugglerBox', [0.65, 0.6], { budget: 'furniture', tint: 'blue', tags: ['performance'] }, jugglerBox),
  prop('music.unicycle', [0.3, 0.4], { budget: 'clutter', tags: ['performance'] }, unicycle),
  prop('music.stilts', [0.45, 0.5], { budget: 'clutter', tint: 'coral', tags: ['performance', 'against-wall'] }, stilts),
  prop('music.tightrope', [8.6, 1.3], { budget: 'stall', tint: 'coral', tags: ['performance', 'circus'] }, () => tightropeRig(8).geo),
  prop('music.danceFloor', [0, 0], { budget: 'stall', tint: 'coral', tags: ['performance', 'decal'] }, () => danceFloor(6, 0.66)),
  prop('music.ribbonPoles', [1.4, 0.6], { budget: 'furniture', tags: ['performance', 'dance'] }, ribbonPoles),
  prop('music.confettiCannon', [0.7, 0.9], { budget: 'furniture', tint: 'coral', tags: ['festival'] }, confettiCannon),
  prop('music.operaSteps', [4.0, 2.3], { budget: 'stall', tags: ['stage', 'steps'] }, operaSteps),
];
