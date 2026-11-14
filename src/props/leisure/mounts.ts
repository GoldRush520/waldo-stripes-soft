/**
 * Carousel mounts, each authored facing +z with its pole axis at x = z = 0 and base at the
 * platform top (y = 0). Each returns geometry plus the rider anchor in mount space.
 */
import { type Col, type Geo, beam, blob, box, cone, detail, merge, rotateX, sphere, translate } from '../../core/geo';
import { type Seat, boxAt, lodPair, revolve } from './kit';

export interface Mount {
  readonly geo: Geo;
  readonly seat: Seat;
}

export function horse(bodyCol: Col, saddle: Col): Mount {
  const near = merge(
    translate(blob(0.2, 0.24, 0.56, bodyCol, 8, 5), 0, 0.95, 0),
    beam([0, 1.0, 0.36], [0, 1.42, 0.6], 0.16, bodyCol),
    translate(blob(0.1, 0.12, 0.22, bodyCol, 6, 4), 0, 1.47, 0.74),
    beam([0.09, 0.85, 0.32], [0.09, 0.55, 0.72], 0.06, bodyCol),
    beam([-0.09, 0.85, 0.32], [-0.09, 0.62, 0.66], 0.06, bodyCol),
    beam([0.09, 0.82, -0.36], [0.09, 0.45, -0.6], 0.06, bodyCol),
    beam([-0.09, 0.82, -0.36], [-0.09, 0.45, -0.5], 0.06, bodyCol),
    beam([0, 1.0, -0.52], [0, 0.7, -0.78], 0.07, 'cocoa'),
    beam([0, 1.22, 0.42], [0, 1.6, 0.64], 0.05, 'cocoa'),
  );
  const far = merge(boxAt(0.36, 0.42, 1.0, bodyCol, 0, 0.74, 0), beam([0, 1.0, 0.4], [0, 1.5, 0.75], 0.2, bodyCol));
  const saddleGeo = boxAt(0.42, 0.08, 0.36, saddle, 0, 1.17, -0.02);
  return { geo: merge(lodPair(near, far), saddleGeo), seat: { x: 0, y: 1.25, z: -0.02, heading: 0 } };
}

export function swan(): Mount {
  const near = merge(
    translate(blob(0.42, 0.3, 0.62, 'ivory', 8, 5), 0, 0.55, 0),
    beam([0, 0.7, 0.42], [0, 1.15, 0.62], 0.13, 'ivory'),
    beam([0, 1.15, 0.62], [0, 1.45, 0.48], 0.11, 'ivory'),
    translate(sphere(0.12, 'ivory', 6, 4), 0, 1.5, 0.52),
    translate(rotateX(cone(0.05, 0.16, 'butterDeep', 5), Math.PI / 2), 0, 1.48, 0.6),
    translate(blob(0.3, 0.25, 0.18, 'ivoryShade', 6, 4), 0, 0.85, -0.55),
  );
  const far = merge(boxAt(0.8, 0.6, 1.2, 'ivory', 0, 0.25, 0), beam([0, 0.7, 0.4], [0, 1.5, 0.55], 0.2, 'ivory'));
  const seat = boxAt(0.6, 0.12, 0.45, 'blue', 0, 0.82, -0.12);
  return { geo: merge(lodPair(near, far), seat), seat: { x: 0, y: 0.94, z: -0.12, heading: 0 } };
}

export function rooster(): Mount {
  const near = merge(
    translate(blob(0.24, 0.3, 0.45, 'coral', 8, 5), 0, 0.95, 0),
    beam([0, 1.05, 0.3], [0, 1.45, 0.45], 0.16, 'coral'),
    translate(sphere(0.13, 'coral', 6, 4), 0, 1.52, 0.48),
    translate(blob(0.03, 0.09, 0.1, 'coralDeep', 4, 3), 0, 1.68, 0.48),
    translate(rotateX(cone(0.04, 0.12, 'butter', 5), Math.PI / 2), 0, 1.5, 0.6),
    translate(blob(0.06, 0.4, 0.22, 'sage', 6, 4), 0, 1.25, -0.42),
    translate(blob(0.06, 0.3, 0.18, 'blue', 6, 4), 0.08, 1.15, -0.48),
    beam([0.08, 0.7, 0], [0.08, 0.4, 0.05], 0.05, 'butterDeep'),
    beam([-0.08, 0.7, 0], [-0.08, 0.4, 0.05], 0.05, 'butterDeep'),
  );
  const far = merge(boxAt(0.44, 0.6, 0.9, 'coral', 0, 0.65, 0), boxAt(0.12, 0.7, 0.3, 'sage', 0, 1.0, -0.42));
  const saddle = boxAt(0.4, 0.08, 0.34, 'butter', 0, 1.2, -0.05);
  return { geo: merge(lodPair(near, far), saddle), seat: { x: 0, y: 1.28, z: -0.05, heading: 0 } };
}

export function teacup(): Mount {
  const cup = revolve(
    [
      [0.01, 0],
      [0.45, 0.02],
      [0.62, 0.3],
      [0.66, 0.62],
      [0.6, 0.62],
      [0.56, 0.32],
      [0.4, 0.1],
      [0.01, 0.1],
    ],
    'blueLight',
    12,
  );
  const band = revolve(
    [
      [0.645, 0.46],
      [0.668, 0.46],
      [0.668, 0.56],
      [0.645, 0.56],
    ],
    'coral',
    12,
  );
  const handle = detail(
    merge(beam([0.66, 0.5, 0], [0.86, 0.48, 0], 0.06, 'blueLight'), beam([0.86, 0.48, 0], [0.62, 0.2, 0], 0.06, 'blueLight')),
  );
  const bench = boxAt(0.8, 0.32, 0.3, 'ivory', 0, 0.1, -0.32);
  const wheel = detail(translate(steeringWheel(), 0, 0.72, 0));
  return { geo: merge(cup, detail(band), handle, bench, wheel), seat: { x: 0, y: 0.42, z: -0.32, heading: 0 } };
}

function steeringWheel(): Geo {
  return box(0.36, 0.04, 0.36, 'butterDeep');
}
