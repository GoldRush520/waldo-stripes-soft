/** Beach furniture and kit: umbrellas, chairs, towels, windbreak, inflatables, picnic, surfboards. */
import { type Col, type Geo, beam, blob, cone, cyl, detail, merge, rotateX, rotateY, rotateZ, scale, sphere, sway, tintable, torus, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type Seat, boxAt, canopyProfile, lodPair, post, prop, revolve, stripedLod, stripesX } from './kit';

function umbrella(): Geo {
  const pole = post(0, 0, 2.25, 0.025, 'ivoryDeep', 6);
  const canopy = translate(stripedLod(canopyProfile(1.1, 0.42, 0.04), 8, 2, 1, 'coral', 'ivory'), 0, 1.95, 0);
  const tip = detail(translate(sphere(0.04, 'ivory', 5, 3), 0, 2.4, 0));
  return merge(pole, canopy, tip);
}

function tiltedUmbrellaBuild(): Geo {
  const tilted = rotateZ(umbrella(), 0.32);
  return translate(tilted, 0.02, 0, 0);
}

function deckChairBuild(): Geo {
  const frame = merge(
    [-1, 1].flatMap((s) => [
      beam([s * 0.28, 0.02, 0.45], [s * 0.28, 0.95, -0.35], 0.035, 'timber'),
      beam([s * 0.28, 0.02, -0.4], [s * 0.28, 0.5, 0.2], 0.035, 'timber'),
    ]),
  );
  const rails = detail(merge([0.95, 0.5].map((y, i) => beam([-0.3, y, i === 0 ? -0.35 : 0.2], [0.3, y, i === 0 ? -0.35 : 0.2], 0.03, 'timber'))));
  const slingOf = (n: number): Geo =>
    merge(
      translate(rotateX(stripesX(0.5, 0.02, 0.62, n, 'coral', 'ivory'), -0.9), 0, 0.68, -0.1),
      translate(rotateX(stripesX(0.5, 0.02, 0.42, n, 'coral', 'ivory'), -0.25), 0, 0.33, 0.2),
    );
  const sling = lodPair(slingOf(5), merge(translate(rotateX(boxAt(0.5, 0.02, 0.62, 'coral', 0, 0, 0), -0.9), 0, 0.68, -0.1), translate(rotateX(boxAt(0.5, 0.02, 0.42, 'coral', 0, 0, 0), -0.25), 0, 0.33, 0.2)));
  return merge(lodPair(merge(frame, rails), merge([-1, 1].map((s) => boxAt(0.04, 0.5, 0.8, 'timber', s * 0.28, 0, 0)))), sling);
}

const DECKCHAIR_SEAT: Seat = { x: 0, y: 0.38, z: 0.12, heading: 0 };

function deckStackBuild(): Geo {
  const chair = merge(
    [-1, 1].map((s) => beam([s * 0.28, 0, 0], [s * 0.28, 0.05, 1.3], 0.04, 'timber')),
    tintable(boxAt(0.5, 0.02, 1.2, 'coral', 0, 0.04, 0.65)),
  );
  const near = merge([0, 1, 2, 3].map((i) => translate(rotateY(chair, (i - 1.5) * 0.06), 0, i * 0.07, 0)));
  const far = merge(boxAt(0.6, 0.26, 1.3, 'timber', 0, 0, 0.65), tintable(boxAt(0.5, 0.03, 1.2, 'coral', 0, 0.26, 0.65)));
  return translate(lodPair(near, far), 0, 0, -0.65);
}

function loungerBuild(): Geo {
  const base = merge(
    boxAt(0.65, 0.05, 1.9, 'ivory', 0, 0.32, 0),
    lodPair(
      merge([-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.05, 0.32, 0.05, 'ivoryDeep', sx * 0.28, 0, sz * 0.85)))),
      merge([-1, 1].map((sz) => boxAt(0.6, 0.32, 0.05, 'ivoryDeep', 0, 0, sz * 0.85))),
    ),
  );
  const back = translate(rotateX(boxAt(0.62, 0.05, 0.7, 'ivory', 0, 0, 0.35), -0.75), 0, 0.37, -0.95);
  const pad = tintable(merge(boxAt(0.6, 0.05, 1.2, 'blue', 0, 0.37, 0.3), translate(rotateX(boxAt(0.58, 0.04, 0.66, 'blue', 0, 0.05, 0.33), -0.75), 0, 0.37, -0.95)));
  const slats = detail(merge(Array.from({ length: 6 }, (_, i) => boxAt(0.66, 0.02, 0.04, 'ivoryDeep', 0, 0.42, -0.2 + i * 0.2))));
  return merge(base, back, pad, slats);
}

function towelBuild(): Geo {
  return merge(lodPair(stripesX(1.0, 0.015, 1.8, 7, 'blue', 'ivory'), stripesX(1.0, 0.015, 1.8, 3, 'blue', 'ivory')), detail(boxAt(0.95, 0.035, 0.06, 'butter', 0, 0, 0.82)));
}

function windbreakBuild(): Geo {
  const n = 5;
  const poles = Array.from({ length: n }, (_, i) => post(-2 + i, 0, 1.25, 0.025, 'timber', 5));
  const cloth = Array.from({ length: n - 1 }, (_, i) => {
    const panel = boxAt(1.0, 0.95, 0.02, i % 2 === 0 ? 'coral' : 'ivory', -1.5 + i, 0.2, 0.0);
    const swayed = sway(panel, (_x, y) => Math.max(0, (y - 0.2) / 0.95) * 0.6);
    return i % 2 === 0 ? tintable(swayed) : swayed;
  });
  const bands = detail(merge(Array.from({ length: n - 1 }, (_, i) => boxAt(0.98, 0.08, 0.025, 'butter', -1.5 + i, 0.95, 0))));
  return merge(lodPair(merge(poles), merge([-2, 2].map((x) => boxAt(0.05, 1.25, 0.05, 'timber', x, 0, 0)))), cloth, bands);
}

function bucketSpadeBuild(): Geo {
  const bucket = revolve([[0.09, 0], [0.12, 0.18], [0.11, 0.18], [0.08, 0.02], [0.01, 0.02]], 'coral', 8);
  const handle = detail(beam([-0.12, 0.18, 0], [0, 0.26, 0], 0.01, 'slate'));
  const spade = merge(beam([0.25, 0.02, 0.05], [0.45, 0.03, 0.35], 0.025, 'blue'), translate(rotateY(boxAt(0.12, 0.015, 0.16, 'blue', 0, 0, 0), -0.6), 0.2, 0, -0.03));
  return merge(tintable(lodPair(bucket, cone(0.12, 0.18, 'coral', 5))), detail(merge(handle, spade)), boxAt(0.18, 0.02, 0.1, 'blue', 0.3, 0, 0.15));
}

function ringBuild(): Geo {
  return tintable(lodPair(translate(torus(0.32, 0.13, 'coral', 6, 12), 0, 0.13, 0), translate(torus(0.32, 0.13, 'coral', 3, 6), 0, 0.13, 0)));
}

function crocBuild(): Geo {
  const body = translate(blob(0.35, 0.18, 0.85, 'sage', 7, 4), 0, 0.18, 0);
  const head = translate(blob(0.24, 0.13, 0.45, 'sage', 6, 4), 0, 0.26, 0.95);
  const eyes = merge([-1, 1].map((s) => translate(sphere(0.07, 'ivory', 5, 3), s * 0.13, 0.4, 0.75)));
  const tail = translate(rotateX(cone(0.18, 0.6, 'sage', 5), -Math.PI / 2), 0, 0.16, -0.75);
  const handles = detail(merge([-1, 1].map((s) => translate(torus(0.06, 0.015, 'butter', 3, 6), s * 0.2, 0.36, 0.55))));
  const far = merge(boxAt(0.6, 0.32, 1.8, 'sage', 0, 0, 0), boxAt(0.4, 0.3, 0.6, 'sage', 0, 0.06, 1.1));
  return tintable(merge(lodPair(merge(body, head, tail), far), detail(eyes), handles));
}

function liloBuild(): Geo {
  const tubes = Array.from({ length: 6 }, (_, i) => translate(rotateZ(cyl(0.09, 0.09, 0.7, i % 2 === 0 ? 'blue' : 'blueLight', 6), Math.PI / 2), 0.35, 0.09, -0.75 + i * 0.18));
  const pillow = translate(rotateZ(cyl(0.12, 0.12, 0.7, 'blue', 6), Math.PI / 2), 0.35, 0.12, 0.42);
  const far = merge(boxAt(0.7, 0.16, 1.1, 'blue', 0, 0, -0.3), boxAt(0.7, 0.22, 0.24, 'blue', 0, 0, 0.42));
  return tintable(lodPair(merge(tubes, pillow), far));
}

function picnicBuild(): Geo {
  const checks = Array.from({ length: 9 }, (_, i) => {
    const x = -0.66 + (i % 3) * 0.66;
    const z = -0.66 + Math.floor(i / 3) * 0.66;
    const on = i % 2 === 0;
    const g = boxAt(0.66, 0.012, 0.66, on ? 'coral' : 'ivory', x, 0, z);
    return on ? tintable(g) : g;
  });
  const far = merge(tintable(boxAt(2, 0.012, 2, 'coral', 0, 0, 0)), boxAt(0.66, 0.032, 0.66, 'ivory', 0, 0, 0));
  const basket = merge(boxAt(0.45, 0.25, 0.3, 'timber', 0.5, 0, -0.5), detail(beam([0.3, 0.25, -0.5], [0.7, 0.25, -0.5], 0.02, 'timberDeep')));
  const plates = detail(merge([[-0.4, 0.2], [0.1, 0.5], [-0.5, -0.3]].map(([x, z]) => translate(cyl(0.12, 0.1, 0.02, 'white', 6), x ?? 0, 0.012, z ?? 0))));
  const bottle = detail(merge(translate(cyl(0.04, 0.04, 0.22, 'sage', 6), -0.1, 0.012, -0.5), translate(cyl(0.015, 0.015, 0.06, 'sageDeep', 5), -0.1, 0.23, -0.5)));
  const fruit = detail(merge([0, 1, 2].map((i) => boxAt(0.07, 0.07, 0.07, i === 1 ? 'butter' : 'coralDeep', 0.2 + i * 0.09, 0.012, 0.1))));
  return merge(lodPair(merge(checks), far), basket, plates, bottle, fruit);
}

function surfboard(col: Col): Geo {
  return tintable(scale(blob(1, 1, 1, col, 8, 5), 0.27, 1.05, 0.04));
}

function surfboardsBuild(): Geo {
  const boards = [-0.45, 0, 0.45].map((x, i) => translate(rotateZ(surfboard('coral'), (i - 1) * 0.08), x, 0.75, (i % 2) * 0.1));
  const stripes = detail(merge([-0.45, 0, 0.45].map((x, i) => translate(rotateZ(boxAt(0.05, 1.7, 0.09, 'ivory', 0, -0.85, 0), (i - 1) * 0.08), x, 0.75, (i % 2) * 0.1))));
  const far = merge([-0.45, 0, 0.45].map((x) => tintable(boxAt(0.45, 1.8, 0.08, 'coral', x, -0.3, 0))));
  return merge(lodPair(merge(boards, stripes), far), boxAt(1.5, 0.06, 0.4, 'sand', 0, -0.03, 0.05));
}

function lifeguardFlagBuild(): Geo {
  const pole = lodPair(post(0, 0, 3.2, 0.03, 'ivoryDeep', 6), boxAt(0.05, 3.2, 0.05, 'ivoryDeep', 0, 0, 0));
  const cloth = merge(
    sway(boxAt(0.7, 0.25, 0.02, 'coral', 0.37, 2.8, 0), (x) => Math.min(1, x / 0.7)),
    sway(boxAt(0.7, 0.25, 0.02, 'butter', 0.37, 2.55, 0), (x) => Math.min(1, x / 0.7)),
  );
  return merge(pole, cloth, detail(translate(sphere(0.05, 'butter', 5, 3), 0, 3.22, 0)));
}

export const BEACH_PROPS: readonly PropDef[] = [
  prop('umbrella.beach', umbrella, [0, 0], 'furniture', { tint: 'coral', tags: ['beach', 'shade'] }),
  prop('umbrella.beach.tilted', tiltedUmbrellaBuild, [0, 0], 'furniture', { tint: 'blue', tags: ['beach', 'shade'] }),
  prop('beach.deckchair', deckChairBuild, [0.65, 0.9], 'furniture', { tint: 'coral', seats: [DECKCHAIR_SEAT], tags: ['beach', 'seat'] }),
  prop('beach.deckchairstack', deckStackBuild, [0.65, 1.4], 'furniture', { tint: 'blue', tags: ['beach'] }),
  prop('beach.lounger', loungerBuild, [0.7, 2.0], 'furniture', { tint: 'blue', seats: [{ x: 0, y: 0.42, z: 0.05, heading: 0 }], tags: ['beach', 'seat', 'lie'] }),
  prop('beach.towel', towelBuild, [0, 0], 'clutter', { origin: 'decal', tint: 'blue', tags: ['beach', 'lie'] }),
  prop('beach.windbreak', windbreakBuild, [4.0, 0.1], 'furniture', { tint: 'coral', tags: ['beach'] }),
  prop('beach.bucketspade', bucketSpadeBuild, [0, 0], 'clutter', { tint: 'coral', tags: ['beach', 'clutter', 'toy'] }),
  prop('beach.ring', ringBuild, [0, 0], 'clutter', { tint: 'coral', tags: ['beach', 'inflatable'] }),
  prop('beach.croc', crocBuild, [0.7, 2.0], 'furniture', { tint: 'sage', tags: ['beach', 'inflatable'] }),
  prop('beach.lilo', liloBuild, [0.7, 1.8], 'furniture', { tint: 'blue', seats: [{ x: 0, y: 0.18, z: -0.1, heading: 0 }], tags: ['beach', 'inflatable', 'lie'] }),
  prop('beach.picnic', picnicBuild, [0, 0], 'furniture', { tint: 'coral', tags: ['beach', 'picnic'] }),
  prop('beach.surfboards', surfboardsBuild, [1.5, 0.4], 'furniture', { origin: 'sunk', tint: 'coral', tags: ['beach'] }),
  prop('beach.lifeguardflag', lifeguardFlagBuild, [0, 0], 'clutter', { tags: ['beach', 'flag'] }),
];
