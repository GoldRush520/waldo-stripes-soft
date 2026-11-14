/**
 * Water dressing: the bank-side water bands (clear of the boat lanes) get ducks, swans, toy boats,
 * lily pads and the odd marker buoy every few metres, so no stretch of canal is left blank.
 */
import type { Kit } from '../../kit';
import { WATER_Y } from '../../layout';
import { bridgeHalf } from './banks';
import type { BridgeSite } from './bridges';
import type { Pool } from './boats';
import { at } from './frame';
import { STORY_WATER, type Zone, inZone } from './spots';

type Floater = 'animal.duck' | 'animal.swan' | 'boat.toySail' | 'plant.lilypads' | 'harbour.buoy.marker' | 'animal.ducklings';

const FLOATERS: readonly Floater[] = ['animal.duck', 'animal.swan', 'plant.lilypads', 'animal.duck', 'boat.toySail', 'animal.ducklings', 'animal.swan', 'harbour.buoy.marker'];

function floater(k: Kit, item: Floater, s: number, d: number, i: number): void {
  const p = at(k, s, d);
  const rot = k.rng.range(0, Math.PI * 2);
  if (item === 'plant.lilypads' || item === 'harbour.buoy.marker') {
    k.prop(item, { x: p.x, z: p.z, y: WATER_Y, rot }, { walkThrough: true });
    return;
  }
  const m = k.bob([p.x, WATER_Y, p.z], rot, 0.45 + (i % 5) * 0.08, i * 0.37, 0.02, 0.025, 2);
  k.dynamic(item, m);
  if (item === 'animal.duck' || item === 'animal.swan') k.dynamic(item, m, { x: 0.45, z: -0.55, rot: k.rng.range(-0.6, 0.6) });
}

export function dressWater(k: Kit, sites: readonly BridgeSite[], pools: readonly Pool[], claimed: readonly Zone[]): void {
  const blocked = (s: number, d: number): boolean =>
    sites.some((b) => Math.abs(s - b.s) < bridgeHalf(b) + 0.6) || [...claimed, ...STORY_WATER].some((z) => inZone(z, s, d, 0.5));
  let i = 0;
  for (const p of pools) {
    for (let s = p.a + 1.2; s < p.b - 1.2; s += 3.4) {
      for (const side of [-1, 1] as const) {
        const ss = s + (side > 0 ? 1.7 : 0) + k.rng.range(-0.4, 0.4);
        const d = side * k.rng.range(3.55, 4.15);
        if (ss > p.b - 1 || blocked(ss, d)) continue;
        floater(k, FLOATERS[(i + k.rng.int(0, 2)) % FLOATERS.length] ?? 'animal.duck', ss, d, i);
        i++;
      }
    }
  }
}
