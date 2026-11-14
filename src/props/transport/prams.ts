/** Pram, stroller and wheelchair. Push handles toward -z; exported for the PropDefs. */
import { type Geo, beam, dome, merge, rotateX, rotateZ, scale, tintable, torus, translate } from '../../core/geo';
import { type Q, type V3, boxAt, caster, cylX, nearOnly, sg, soft, tray, wheel } from './kit';

export const PRAM_HANDLE: V3 = [0, 1.02, -0.72];

export function pram(q: Q): Geo {
  const by = 0.42;
  const axles: ReadonlyArray<readonly [number, number]> = [
    [-0.3, 0.22],
    [0.32, 0.18],
  ];
  return merge(
    axles.flatMap(([z, r]) => [-0.27, 0.27].map((x) => translate(wheel(q, r, 0.03, { spokes: 8, hub: 'ivory' }), x, 0, z))),
    axles.map(([z, r]) => cylX(0.012, 0.54, 'slate', sg(q, 5, 3), -0.27, r, z)),
    [-0.2, 0.2].map((x) => beam([x, 0.22, -0.3], [x, by + 0.02, -0.1], 0.025, 'slate')),
    [-0.2, 0.2].map((x) => beam([x, 0.18, 0.32], [x, by + 0.02, 0.1], 0.025, 'slate')),
    tintable(
      translate(
        q.far ? boxAt(0.46, 0.32, 0.82, 'blue', 0, 0, 0) : tray(0.48, 0.84, 0.42, 0.74, 0.32, 0.025, 'blue', 'ivory', 'ivory'),
        0,
        by,
        0.02,
      ),
    ),
    tintable(translate(scale(dome(1, 'blue', sg(q, 10, 6), sg(q, 4, 2)), 0.25, 0.38, 0.3), 0, by + 0.3, -0.18)),
    [-0.21, 0.21].map((x) => beam([x, by + 0.28, -0.36], [x, PRAM_HANDLE[1], PRAM_HANDLE[2]], 0.025, 'slate')),
    cylX(0.022, 0.46, 'cocoa', sg(q, 6, 4), -0.23, PRAM_HANDLE[1], PRAM_HANDLE[2]),
    nearOnly(q, () => [
      boxAt(0.42, 0.04, 0.42, 'ivory', 0, by + 0.28, 0.17),
      boxAt(0.5, 0.03, 0.03, 'ivory', 0, by + 0.32, -0.18),
    ]),
  );
}

export const STROLLER_HANDLE: V3 = [0, 1.0, -0.5];

export function stroller(q: Q): Geo {
  const seatY = 0.36;
  return merge(
    q.far ? [] : [-0.22, 0.22].flatMap((x) => [-0.32, 0.3].map((z) => translate(caster(q, 0.08, 0.04), x, 0, z))),
    [-0.22, 0.22].map((x) => beam([x, 0.08, 0.3], [x, STROLLER_HANDLE[1], STROLLER_HANDLE[2]], 0.025, 'slate')),
    [-0.22, 0.22].map((x) => beam([x, 0.08, -0.32], [x, 0.62, 0.0], 0.025, 'slate')),
    tintable(boxAt(0.36, 0.05, 0.3, 'coral', 0, seatY, 0.04)),
    tintable(translate(rotateX(boxAt(0.36, 0.42, 0.05, 'coral', 0, 0, 0), -0.35), 0, seatY, -0.12)),
    tintable(translate(scale(dome(1, 'coral', sg(q, 8, 5), sg(q, 3, 2)), 0.24, 0.22, 0.26), 0, 0.84, -0.12)),
    cylX(0.022, 0.48, 'cocoa', sg(q, 6, 4), -0.24, STROLLER_HANDLE[1], STROLLER_HANDLE[2]),
    nearOnly(q, () => [
      boxAt(0.3, 0.03, 0.12, 'slate', 0, 0.16, 0.24),
      boxAt(0.4, 0.15, 0.3, 'sageDeep', 0, 0.09, -0.12),
      beam([-0.2, 0.55, 0.16], [0.2, 0.55, 0.16], 0.025, 'ivoryDeep'),
    ]),
  );
}

export const WHEELCHAIR_HANDLE: V3 = [0, 0.95, -0.34];

export function wheelchair(q: Q): Geo {
  const seatY = 0.47;
  return merge(
    [-0.3, 0.3].map((x) => translate(wheel(q, 0.3, 0.035, { spokes: 10 }), x, 0, -0.12)),
    [-0.2, 0.2].map((x) => translate(caster(q, 0.07, 0.03), x, 0, 0.32)),
    [-0.22, 0.22].map((x) => beam([x, 0.07, 0.32], [x, seatY, 0.18], 0.025, 'slate')),
    [-0.22, 0.22].map((x) => beam([x, seatY, -0.2], [x, WHEELCHAIR_HANDLE[1], WHEELCHAIR_HANDLE[2]], 0.025, 'slate')),
    tintable(boxAt(0.46, 0.05, 0.42, 'blue', 0, seatY - 0.05, 0)),
    tintable(boxAt(0.44, 0.38, 0.04, 'blue', 0, seatY + 0.08, -0.24)),
    cylX(0.012, 0.6, 'slate', sg(q, 5, 3), -0.3, 0.3, -0.12),
    [-0.18, 0.18].map((x) => boxAt(0.13, 0.02, 0.1, 'slate', x, 0.1, 0.42)),
    nearOnly(q, () => [
      ...[-0.34, 0.34].map((x) => translate(rotateZ(torus(0.26, 0.01, 'ivoryDeep', 3, 12), Math.PI / 2), x, 0.3, -0.12)),
      ...[-0.25, 0.25].map((x) => boxAt(0.04, 0.03, 0.34, 'cocoa', x, seatY + 0.2, -0.04)),
      ...[-0.2, 0.2].map((x) => cylX(0.02, 0.07, 'cocoa', 6, x - 0.035, WHEELCHAIR_HANDLE[1], WHEELCHAIR_HANDLE[2] - 0.03)),
    ]),
  );
}

