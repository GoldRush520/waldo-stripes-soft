/**
 * Small bespoke story pieces the prop libraries do not provide: the hauled-up old boot, a stolen fish,
 * a floating straw hat and a swinging cargo load. Each is built once (module cache) and placed as a
 * dynamic prop, so the origin sits at the pivot of the motion it rides.
 */
import { type Geo, beam, blob, box, cone, cyl, detail, farOnly, merge, rotateX, rotateZ, sphere, translate } from '../../../core/geo';

const cache = new Map<string, Geo>();
function once(key: string, build: () => Geo): Geo {
  const hit = cache.get(key);
  if (hit) return hit;
  const g = build();
  cache.set(key, g);
  return g;
}

/** A dripping old boot hanging `drop` metres below the pivot on a fishing line (the line runs up +y). */
export function bootOnLine(drop = 1.25): Geo {
  return once(`boot:${drop}`, () => {
    const y = -drop;
    const leg = translate(box(0.13, 0.26, 0.12, 'cocoa'), 0, y - 0.26, 0);
    const foot = translate(box(0.13, 0.1, 0.3, 'cocoa'), 0, y - 0.36, 0.07);
    const sole = translate(box(0.14, 0.03, 0.31, 'timberDeep'), 0, y - 0.385, 0.07);
    const weed = translate(rotateZ(box(0.03, 0.22, 0.015, 'sageDeep'), 0.25), 0.04, y - 0.3, 0.06);
    const drips = [0.02, -0.03].map((dx, i) => translate(sphere(0.022, 'blueLight', 5, 3), dx, y - 0.46 - i * 0.09, 0.15));
    const far = merge(translate(box(0.13, 0.36, 0.12, 'cocoa'), 0, y - 0.38, 0), translate(box(0.13, 0.12, 0.3, 'cocoa'), 0, y - 0.39, 0.07));
    return merge(
      beam([0, 0, 0], [0, y, 0], 0.012, 'ivoryShade'),
      detail(merge(leg, foot, sole, weed, ...drips, translate(box(0.1, 0.02, 0.06, 'timberDeep'), 0, y - 0.15, 0.06))),
      farOnly(far),
    );
  });
}

/** A silvery fish held crosswise under a flying gull (origin at the beak). */
export function stolenFish(): Geo {
  return once('fish', () =>
    merge(
      detail(
        merge(
          translate(blob(0.05, 0.06, 0.17, 'blueLight', 7, 5), 0, -0.07, 0),
          translate(blob(0.035, 0.03, 0.13, 'ivory', 6, 4), 0, -0.1, 0.01),
          translate(rotateX(cone(0.06, 0.09, 'blue', 5), Math.PI / 2), 0, -0.07, -0.2),
          translate(sphere(0.012, 'ink', 5, 3), 0.04, -0.06, 0.12),
        ),
      ),
      farOnly(translate(box(0.08, 0.1, 0.36, 'blueLight'), 0, -0.12, -0.03)),
    ),
  );
}

/** A straw boater floating upside-up on the water (origin at the waterline). */
export function floatingHat(): Geo {
  return once('hat', () =>
    merge(
      detail(merge(cyl(0.2, 0.2, 0.025, 'butter', 12), translate(cyl(0.12, 0.115, 0.09, 'butter', 10), 0, 0.02, 0), translate(cyl(0.122, 0.122, 0.03, 'coral', 10), 0, 0.03, 0))),
      farOnly(cyl(0.2, 0.12, 0.1, 'butter', 5)),
    ),
  );
}

/** A cargo net of crates and a barrel hanging `drop` metres below a crane hook. */
export function cargoLoad(drop = 2.2): Geo {
  return once(`cargo:${drop}`, () => {
    const y = -drop;
    const crates = [-0.28, 0.28].map((x, i) => translate(box(0.52, 0.42, 0.5, i ? 'timber' : 'clay'), x, y - 0.5, 0));
    const top = translate(box(0.46, 0.36, 0.44, 'butterDeep'), 0.05, y - 0.08, 0.02);
    const barrel = translate(cyl(0.2, 0.2, 0.46, 'timberDeep', 8), 0, y - 0.56, 0.42);
    const net = translate(blob(0.62, 0.45, 0.48, 'sageDeep', 6, 4), 0, y - 0.3, 0.06);
    const far = merge(translate(box(1.05, 0.62, 0.5, 'timber'), 0, y - 0.72, 0), translate(box(0.46, 0.36, 0.44, 'butterDeep'), 0.05, y - 0.08 - 0.02, 0.02));
    return merge(
      beam([0, 0, 0], [0, y + 0.1, 0], 0.035, 'cocoa'),
      detail(merge(...[-0.25, 0.25].map((x) => beam([0, y + 0.1, 0], [x, y - 0.12, 0], 0.025, 'cocoa')), ...crates, top, barrel, net, translate(cyl(0.06, 0.06, 0.12, 'slate', 6), 0, y + 0.05, 0))),
      farOnly(far),
    );
  });
}

/** A fishing rod leaning out from a stand: butt at the origin, tip at (0, 2.2, 1.9). */
export function proppedRod(): Geo {
  return once('rod', () => merge(beam([0, 0, 0], [0, 2.2, 1.9], 0.03, 'timberDeep'), detail(translate(cyl(0.035, 0.035, 0.06, 'slate', 6), 0, 0.35, 0.3))));
}
