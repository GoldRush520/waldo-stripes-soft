/**
 * Puzzle fairness: partial look-alikes of the hero (each shares at most three of the five hero
 * features) and 10+ open, unroofed standing spots spread over the ground strip, the terrace lanes,
 * the belvedere and open roof terraces.
 */
import type { Kit } from '../../kit';
import { holds } from './cast';
import type { Roof } from './houses';
import { openSpot } from './roofLife';
import { BELVEDERE, FRONT_Z, LEVEL_Y, SPAN_X, laneZ } from './plan';

export function lookalikes(k: Kit): void {
  const l1 = laneZ(1);
  const l2 = laneZ(2);
  /* stripes + round glasses, wrong hat and trousers */
  k.person({ x: -30.5, z: l1 + 1.4, y: LEVEL_Y[1], heading: 0.4, clip: 'talk', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.beret', hatTint: 'blue', glasses: 'face.glasses.round', pants: 'clayDeep', longLegs: true } });
  /* coral bobble + blue trousers + stick, plain shirt */
  k.person({ x: 26.5, z: 18.3, heading: -0.5, clip: 'stand.stick', age: 'elder', hold: holds('hold.stick'), look: { pattern: 0, shirt: 'sage', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'blue', longLegs: true } });
  /* stripes + blue trousers, cap, no glasses */
  k.person({ x: 9.5, z: l2 + 1.0, y: LEVEL_Y[2], heading: 0.2, clip: 'lookout', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.cap', hatTint: 'blue', glasses: null, pants: 'blue', longLegs: true } });
  /* blue-striped jumper with a blue bobble and round glasses */
  k.person({ x: -33.5, z: 13.2, heading: 0.8, clip: 'wave', look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'blue', glasses: 'face.glasses.round', pants: 'cocoa', longLegs: true } });
  /* child: coral bobble + round glasses */
  k.person({ x: 1.5, z: laneZ(3) + 0.9, y: LEVEL_Y[3], heading: -0.3, age: 'child', clip: 'cheer', look: { pattern: 3, shirt: 'butter', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'sage' } });
}

interface Cand {
  readonly x: number;
  readonly z: number;
  readonly y: number;
  readonly h: number;
}

function laneCandidates(): Cand[] {
  const out: Cand[] = [];
  ([1, 2, 3] as const).forEach((level) => {
    const [x0, x1] = SPAN_X[level] ?? [0, 0];
    for (let i = 0; i < 6; i++) {
      const x = x0 + 4 + ((x1 - x0 - 8) * (i + 0.5)) / 6;
      out.push({ x, z: laneZ(level) + (i % 2 ? 0.9 : -0.6), y: LEVEL_Y[level], h: 0.3 * (i - 2) });
    }
  });
  for (let i = 0; i < 7; i++) out.push({ x: -22 + i * 9.4, z: 13 + (i % 3) * 2.2, y: 0, h: 0.4 - i * 0.1 });
  out.push({ x: BELVEDERE.x1 - 1.2, z: FRONT_Z[1] + 0.6, y: LEVEL_Y[1], h: 0.2 });
  return out;
}

/** Call BEFORE the free-ground fills: lane spots are reserved with a small clear footprint. */
export function targetSpots(k: Kit, roofs: readonly Roof[], open: ReadonlySet<number>): number {
  const lanes = laneCandidates().filter((c) => k.isFree(c.x, c.z, 0.34));
  /* reserve the clear ground round each spot so later fills keep their distance */
  for (const c of lanes) k.block(c.x, c.z, 0.9, 0.9);
  const tops = roofs.filter((r) => open.has(r.id)).map((r) => ({ ...openSpot(r), h: 0.2 }));
  const chosen = [...lanes, ...tops];
  for (const c of chosen) k.targetSpot(c.x, c.z, c.y, c.h);
  return chosen.length;
}
