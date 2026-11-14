/** Small motor vehicles and boards: vespa-style scooter, three-wheeled van, milk float, kick scooter, skateboard. */
import { type Col, type Geo, beam, blob, cyl, merge, rotateX, sphere, tintable, translate } from '../../core/geo';
import { type Q, boxAt, caster, cylX, nearOnly, post, sg, soft, wheel } from './kit';

export function vespa(q: Q): Geo {
  const wr = 0.2;
  const tint = (g: Geo): Geo => tintable(g);
  return merge(
    translate(wheel(q, wr, 0.1, { disc: 'ivoryShade' }), 0, 0, -0.55),
    translate(wheel(q, wr, 0.1, { disc: 'ivoryShade' }), 0, 0, 0.62),
    tint(translate(blob(0.3, 0.24, 0.45, 'sage', sg(q, 10, 6), sg(q, 7, 4)), 0, 0.5, -0.42)),
    boxAt(0.36, 0.06, 0.62, 'ivoryDeep', 0, 0.2, 0.08),
    tint(translate(blob(0.26, 0.36, 0.09, 'sage', sg(q, 10, 6), sg(q, 7, 4)), 0, 0.55, 0.42)),
    tint(translate(blob(0.12, 0.08, 0.24, 'sage', sg(q, 8, 5), sg(q, 5, 3)), 0, 0.44, 0.62)),
    translate(soft(q, 0.28, 0.1, 0.6, 0.04, 'timberDeep'), 0, 0.7, -0.35),
    beam([0, 0.55, 0.47], [0, 0.98, 0.43], 0.06, 'sage'),
    cylX(0.02, 0.56, 'slate', sg(q, 6, 4), -0.28, 0.98, 0.42),
    translate(sphere(0.07, 'ivory', sg(q, 8, 5), sg(q, 6, 4)), 0, 0.98, 0.5),
    nearOnly(q, () => [
      boxAt(0.36, 0.05, 0.4, 'ivory', 0, 0.48, -0.47),
      ...[-1, 1].map((sx) => cylX(0.025, 0.09, 'cocoa', 6, sx > 0 ? 0.2 : -0.29, 0.98, 0.42)),
      translate(sphere(0.04, 'coral', 6, 4), 0, 0.55, -0.88),
      beam([0, 0.3, 0.6], [0, 0.55, 0.47], 0.04, 'slate'),
      boxAt(0.3, 0.04, 0.12, 'slate', 0, 0.7, -0.75),
    ]),
  );
}

export function kickScooter(q: Q): Geo {
  const wr = 0.08;
  return merge(
    translate(caster(q, wr, 0.04), 0, 0, -0.32),
    translate(caster(q, wr, 0.04), 0, 0, 0.32),
    tintable(translate(soft(q, 0.14, 0.04, 0.6, 0.015, 'blue'), 0, 0.07, -0.02)),
    tintable(beam([0, 0.1, 0.3], [0, 0.95, 0.36], 0.035, 'blue')),
    cylX(0.016, 0.4, 'slate', sg(q, 6, 4), -0.2, 0.95, 0.36),
    nearOnly(q, () => [
      ...[-1, 1].map((sx) => cylX(0.022, 0.08, 'cocoa', 6, sx > 0 ? 0.12 : -0.2, 0.95, 0.36)),
      beam([0, 0.11, 0.3], [0, wr, 0.32], 0.02, 'slate'),
      beam([0, 0.1, -0.3], [0, wr + 0.02, -0.34], 0.03, 'slate'),
    ]),
  );
}

export function skateboard(q: Q): Geo {
  const wheels = [-0.28, 0.28].flatMap((z) => [-0.08, 0.08].map((x) => translate(caster(q, 0.03, 0.03, 'butter'), x, 0, z)));
  return merge(
    tintable(translate(soft(q, 0.22, 0.025, 0.8, 0.01, 'coral'), 0, 0.075, 0)),
    q.far ? [] : wheels,
    q.far
      ? [boxAt(0.2, 0.05, 0.08, 'slate', 0, 0.02, -0.28), boxAt(0.2, 0.05, 0.08, 'slate', 0, 0.02, 0.28)]
      : [-0.28, 0.28].map((z) => boxAt(0.16, 0.03, 0.05, 'slate', 0, 0.045, z)),
    nearOnly(q, () => [boxAt(0.14, 0.004, 0.5, 'ivory', 0, 0.1, 0)]),
  );
}

/** Rounded three-wheeled delivery van: cab with one front wheel, tint-masked cargo box behind. */
export function deliveryVan(q: Q): Geo {
  const band = (w: number, d: number, y: number, z: number): Geo => boxAt(w, 0.12, d, 'ivory', 0, y, z);
  return merge(
    translate(wheel(q, 0.22, 0.12, { disc: 'ivoryShade' }), 0, 0, 0.95),
    [-0.58, 0.58].map((x) => translate(wheel(q, 0.25, 0.14, { disc: 'ivoryShade' }), x, 0, -0.85)),
    boxAt(1.2, 0.12, 2.6, 'slate', 0, 0.28, -0.15),
    tintable(translate(soft(q, 1.25, 1.3, 1.0, 0.32, 'butter'), 0, 0.35, 0.68)),
    band(1.27, 1.02, 0.75, 0.68),
    tintable(translate(soft(q, 1.36, 1.15, 1.65, 0.12, 'butter'), 0, 0.4, -0.72)),
    band(1.38, 1.67, 0.95, -0.72),
    boxAt(1.0, 0.45, 0.04, 'blueLight', 0, 1.05, 1.17),
    nearOnly(q, () => [
      ...[-1, 1].map((sx) => boxAt(0.04, 0.4, 0.5, 'blueLight', sx * 0.63, 1.05, 0.72)),
      ...[-0.42, 0.42].map((x) => translate(rotateX(cyl(0.08, 0.08, 0.04, 'butterLight', 8), Math.PI / 2), x, 0.62, 1.18)),
      boxAt(0.04, 0.6, 0.02, 'cocoa', 0, 0.35, 1.19),
      boxAt(0.6, 0.06, 0.03, 'slate', 0, 0.36, 1.19),
      boxAt(0.3, 0.06, 0.02, 'ivoryDeep', 0.62, 0.9, 0.42),
      boxAt(0.02, 0.9, 0.04, 'butterDeep', 0, 0.5, -1.56),
      ...[0, 1, 2].map((i) => boxAt(0.12, 0.12, 0.02, i === 1 ? 'coral' : 'blue', -0.25 + i * 0.25, 1.15, -1.56)),
    ]),
  );
}

const CRATE_COLS: readonly Col[] = ['blue', 'coral', 'blue', 'sage'];

function milkCrates(q: Q, z0: number, y: number): Geo {
  if (q.far) return boxAt(1.15, 0.5, 0.95, 'blue', 0, y, z0);
  const crates = [-0.29, 0.29].flatMap((x) =>
    [-0.25, 0.25].flatMap((dz, j) => [0, 1].map((k) => boxAt(0.55, 0.24, 0.46, CRATE_COLS[(j + k) % CRATE_COLS.length] ?? 'blue', x, y + k * 0.25, z0 + dz))),
  );
  const bottles = [-0.3, 0.3].flatMap((x) => [-0.12, 0.12].map((dz) => translate(cyl(0.035, 0.03, 0.14, 'white', 5), x, y + 0.5, z0 + 0.25 + dz)));
  return merge(crates, bottles);
}

/** Electric milk float: open-sided cab in front, crates under a long roof. */
export function milkFloat(q: Q): Geo {
  const deckY = 0.42;
  const roofY = 2.05;
  return merge(
    [-0.66, 0.66].flatMap((x) => [-1.0, 1.0].map((z) => translate(wheel(q, 0.25, 0.12, { disc: 'ivoryShade' }), x, 0, z))),
    boxAt(1.3, 0.2, 3.0, 'slate', 0, 0.22, 0),
    boxAt(1.36, 0.06, 3.0, 'ivory', 0, deckY, 0),
    tintable(translate(soft(q, 1.36, 0.95, 0.5, 0.12, 'sage'), 0, deckY, 1.25)),
    boxAt(1.38, 0.12, 0.52, 'ivory', 0, deckY + 0.6, 1.25),
    boxAt(1.1, 0.55, 0.04, 'blueLight', 0, deckY + 0.95, 1.46),
    [-0.64, 0.64].flatMap((x) => [1.45, -1.45].map((z) => post(q, 0.035, deckY, roofY, 'ivoryDeep', x, z))),
    tintable(boxAt(1.5, 0.1, 3.2, 'sage', 0, roofY, 0)),
    boxAt(1.52, 0.1, 3.22, 'ivory', 0, roofY - 0.08, 0),
    milkCrates(q, -0.5, deckY + 0.06),
    boxAt(0.5, 0.42, 0.4, 'timberDeep', 0.25, deckY + 0.06, 0.7),
    nearOnly(q, () => [
      boxAt(0.45, 0.06, 0.38, 'coralDeep', 0.25, deckY + 0.48, 0.7),
      boxAt(0.4, 0.4, 0.05, 'coralDeep', 0.25, deckY + 0.5, 0.52),
      beam([0.25, deckY + 0.5, 1.0], [0.25, deckY + 0.95, 1.1], 0.04, 'slate'),
      cylX(0.015, 0.36, 'slate', 6, 0.07, deckY + 0.95, 1.1),
      ...[-0.45, 0.45].map((x) => translate(rotateX(cyl(0.07, 0.07, 0.04, 'butterLight', 6), Math.PI / 2), x, deckY + 0.3, 1.5)),
    ]),
  );
}
