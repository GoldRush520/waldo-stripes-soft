/** Bespoke little story props of the rooftops district (built once, cached). */
import { type Geo, box, cone, cyl, detail, lathe, merge, rotateZ, sphere, translate } from '../../../core/geo';

let sheet: Geo | null = null;
let pot: Geo | null = null;

/** A bedsheet draped over a standing person (origin at the person's feet). */
export function sheetDrape(): Geo {
  if (!sheet) {
    const body = lathe(
      [
        [0.42, 0.5],
        [0.34, 0.85],
        [0.27, 1.3],
        [0.24, 1.6],
        [0.14, 1.84],
        [0.0001, 1.9],
      ],
      'ivory',
      9,
    );
    const hem = translate(cyl(0.43, 0.43, 0.12, 'coral', 9, false), 0, 0.62, 0);
    const corner = translate(rotateZ(box(0.5, 0.03, 0.34, 'ivory'), 0.5), 0.42, 0.62, 0.05);
    sheet = merge(body, hem, corner);
  }
  return sheet;
}

/** A coral teapot with an ivory lid (origin at its base). */
export function teapot(): Geo {
  if (!pot) {
    const body = lathe(
      [
        [0.06, 0],
        [0.13, 0.06],
        [0.14, 0.13],
        [0.09, 0.22],
        [0.0001, 0.23],
      ],
      'coral',
      8,
    );
    const spout = translate(rotateZ(cone(0.035, 0.18, 'coral', 5), -0.9), 0.16, 0.12, 0);
    const handle = translate(box(0.03, 0.12, 0.03, 'coralDeep'), -0.16, 0.06, 0);
    const knob = detail(translate(sphere(0.03, 'ivory', 5, 3), 0, 0.24, 0));
    pot = merge(body, spout, handle, knob);
  }
  return pot;
}
