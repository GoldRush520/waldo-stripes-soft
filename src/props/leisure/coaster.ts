/**
 * Kiddie coaster: an oval track (~16 × 9 m) on trestles with a small station, plus a two-seat car.
 * COASTER_TRACK is the closed centreline at rail-top height in prop space (no repeated endpoint);
 * the car's origin sits on it, facing +z along the direction of travel (increasing index).
 */
import { type Geo, beam, blob, cyl, detail, merge, rotateZ, tintable, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type V3, boxAt, lodPair, prop, softBox, stripesX } from './kit';

const N = 48;
const RX = 7.4;
const RZ = 4.0;
const CX = 1.0;

function trackPoint(i: number): V3 {
  const th = (i / N) * Math.PI * 2;
  return [CX + Math.cos(th) * RX, 1.5 + 0.7 * Math.cos(th) + 0.2 * Math.sin(2 * th), Math.sin(th) * RZ];
}

/** Closed loop centreline (rail-top) of the kiddie coaster, 48 points. */
export const COASTER_TRACK: readonly V3[] = Array.from({ length: N }, (_, i) => trackPoint(i));

function at(i: number): V3 {
  return COASTER_TRACK[((i % N) + N) % N] ?? [0, 0, 0];
}

/** Unit lateral (horizontal, to the right of travel) at point i. */
function lateral(i: number): V3 {
  const a = at(i - 1);
  const b = at(i + 1);
  const tx = b[0] - a[0];
  const tz = b[2] - a[2];
  const l = Math.hypot(tx, tz) || 1;
  return [-tz / l, 0, tx / l];
}

function off(p: V3, l: V3, s: number, dy = 0): V3 {
  return [p[0] + l[0] * s, p[1] + dy, p[2] + l[2] * s];
}

function rails(): Geo {
  const parts = Array.from({ length: N }, (_, i) => {
    const la = lateral(i);
    const lb = lateral(i + 1);
    return [-1, 1].map((s) => beam(off(at(i), la, s * 0.36, -0.04), off(at(i + 1), lb, s * 0.36, -0.04), 0.07, 'ivory'));
  });
  const ties = COASTER_TRACK.map((p, i) => beam(off(p, lateral(i), -0.5, -0.12), off(p, lateral(i), 0.5, -0.12), 0.08, 'timberDeep'));
  return detail(merge(parts, ties));
}

function girder(): Geo {
  const near = Array.from({ length: N }, (_, i) => beam(off(at(i), [0, 0, 0], 0, -0.3), off(at(i + 1), [0, 0, 0], 0, -0.3), 0.32, 'coral'));
  const far = Array.from({ length: N / 2 }, (_, i) => {
    const a = off(at(i * 2), [0, 0, 0], 0, -0.25);
    const b = off(at(i * 2 + 2), [0, 0, 0], 0, -0.25);
    return beam(a, b, 0.4, 'coral');
  });
  return lodPair(merge(near), merge(far));
}

function trestles(): Geo {
  const idx = Array.from({ length: N / 2 }, (_, k) => k * 2);
  const near = idx.map((i) => {
    const p = at(i);
    const l = lateral(i);
    const top = p[1] - 0.45;
    return merge(
      beam(off(p, l, -0.6, -p[1] + 0.06), off(p, l, -0.3, -0.45), 0.1, 'ivory'),
      beam(off(p, l, 0.6, -p[1] + 0.06), off(p, l, 0.3, -0.45), 0.1, 'ivory'),
      beam(off(p, l, -0.5, -p[1] + top * 0.5), off(p, l, 0.5, -p[1] + top * 0.5), 0.07, 'ivoryDeep'),
    );
  });
  const far = idx.filter((_, k) => k % 2 === 0).map((i) => {
    const p = at(i);
    return beam([p[0], 0, p[2]], [p[0], p[1] - 0.4, p[2]], 0.22, 'ivory');
  });
  return lodPair(merge(near), merge(far));
}

function station(): Geo {
  const deck = softBox(2.2, 0.75, 3.0, 0.05, 'clay');
  const roofPosts = [-1, 1].flatMap((sz) => [boxAt(0.12, 2.4, 0.12, 'ivory', -0.95, 0.75, sz * 1.35)]);
  const roof = translate(stripesX(2.6, 0.12, 3.4, 7, 'butter', 'ivory'), 0, 3.15, 0);
  const steps = [0, 1, 2].map((i) => boxAt(0.3, 0.19 + 0.19 * i, 1.0, 'stone', -1.55 + i * 0.3, 0, 0));
  const rail = detail(boxAt(0.05, 0.9, 3.0, 'slate', -1.05, 0.75, 0));
  return translate(merge(deck, roofPosts, roof, steps, rail), CX - RX - 1.75, 0, 0);
}

function trackBuild(): Geo {
  return merge(rails(), girder(), trestles(), station());
}

function carBuild(): Geo {
  const body = tintable(softBox(0.95, 0.5, 1.5, 0.12, 'butter'));
  const nose = tintable(lodPair(translate(blob(0.42, 0.3, 0.3, 'butter', 8, 5), 0, 0.35, 0.72), boxAt(0.8, 0.5, 0.3, 'butter', 0, 0.15, 0.75)));
  const seats = [0.25, -0.4].map((z) => merge(boxAt(0.7, 0.12, 0.42, 'ivory', 0, 0.5, z), boxAt(0.7, 0.35, 0.08, 'ivory', 0, 0.5, z - 0.22)));
  const bar = detail(merge([0.5, -0.12].map((z) => beam([-0.4, 0.82, z], [0.4, 0.82, z], 0.04, 'slate'))));
  const eyes = detail(merge([-0.17, 0.17].map((x) => translate(blob(0.07, 0.08, 0.04, 'ink', 6, 4), x, 0.48, 1.0))));
  const wheels = detail(
    merge([-0.42, 0.42].flatMap((x) => [-0.5, 0.5].map((z) => translate(rotateZ(cyl(0.09, 0.09, 0.08, 'slate', 6), Math.PI / 2), x + 0.04, 0.09, z)))),
  );
  return merge(translate(merge(body, nose), 0, 0.1, 0), seats, bar, eyes, wheels);
}

export const COASTER_PROPS: readonly PropDef[] = [
  prop('coaster.track', trackBuild, [19, 9], 'landmark', { tags: ['funfair', 'ride'] }),
  prop('coaster.car', carBuild, [0, 0], 'stall', {
    tint: 'blue',
    seats: [
      { x: 0, y: 0.62, z: 0.25, heading: 0 },
      { x: 0, y: 0.62, z: -0.4, heading: 0 },
    ],
    tags: ['funfair', 'ride', 'moving', 'follow:COASTER_TRACK'],
  }),
];
