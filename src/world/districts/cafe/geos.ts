/**
 * Small bespoke story props for the café district (built once, cached): a chessboard with pieces,
 * an open ring box, a flying cup and saucer, a tumbling croissant and a bread loaf.
 */
import { type Geo, box, cyl, detail, disc, farOnly, merge, rotateX, rotateZ, sphere, torus, translate } from '../../../core/geo';

const cache = new Map<string, Geo>();

function once(key: string, make: () => Geo): Geo {
  const hit = cache.get(key);
  if (hit) return hit;
  const g = make();
  cache.set(key, g);
  return g;
}

/** Chessboard (0.4 m) with a handful of pieces, resting on y = 0 (place it on a table top). */
export function chessboard(): Geo {
  return once('chess', () => {
    const base = box(0.42, 0.03, 0.42, 'timberDeep');
    const squares = [] as Geo[];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if ((i + j) % 2 === 0) squares.push(translate(box(0.09, 0.006, 0.09, 'ivory'), -0.15 + i * 0.1, 0.03, -0.15 + j * 0.1));
      }
    }
    const piece = (x: number, z: number, light: boolean, tall: boolean): Geo =>
      merge(translate(cyl(0.018, 0.012, tall ? 0.07 : 0.045, light ? 'ivory' : 'ink', 6), x, 0.036, z), translate(sphere(0.016, light ? 'ivory' : 'ink', 6, 4), x, tall ? 0.11 : 0.085, z));
    const pieces = [
      piece(-0.15, -0.15, true, true),
      piece(-0.05, -0.12, true, false),
      piece(0.08, -0.06, true, false),
      piece(0.12, 0.14, false, true),
      piece(-0.02, 0.1, false, false),
      piece(0.15, 0.04, false, false),
    ];
    return merge(base, farOnly(translate(box(0.38, 0.008, 0.38, 'ivoryShade'), 0, 0.03, 0)), detail(merge(squares, pieces)));
  });
}

/** Open ring box with a gold ring standing in it. */
export function ringBox(): Geo {
  return once('ring', () => {
    const boxBase = box(0.09, 0.05, 0.09, 'coralDeep');
    const lid = translate(rotateX(box(0.09, 0.012, 0.09, 'coralDeep'), -1.2), 0, 0.075, -0.06);
    const ring = translate(rotateX(torus(0.022, 0.006, 'butter', 4, 10), Math.PI / 2), 0, 0.075, 0);
    const gem = translate(sphere(0.011, 'blueLight', 6, 4), 0, 0.1, 0);
    return merge(boxBase, lid, detail(merge(ring, gem)));
  });
}

/** Cup on a saucer, tilted mid-flight (for `k.toss`). */
export function flyingCup(): Geo {
  return once('cup', () => rotateZ(merge(disc(0.07, 'ivory', 8), translate(cyl(0.04, 0.035, 0.06, 'ivory', 8), 0, 0.005, 0)), 0.9));
}

/** A croissant tumbling through the air. */
export function croissant(): Geo {
  return once('croissant', () => rotateZ(merge(sphere(0.05, 'butterDeep', 6, 4), translate(sphere(0.035, 'butterDeep', 6, 4), 0.06, -0.01, 0), translate(sphere(0.035, 'butterDeep', 6, 4), -0.06, -0.01, 0)), 0.5));
}
