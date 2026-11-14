/**
 * Hero target spots: open standing places on the promenade, the sand and the pier deck, reserved
 * before the crowd is placed (a small solid square keeps fills and camps off them) and registered
 * once the district is built.
 */
import type { Kit } from '../../kit';
import { PIER, SAND_Y, sandZ, shoreZ } from './frame';

interface Spot {
  readonly x: number;
  readonly z: number;
  readonly y: number;
  readonly heading: number;
}

const promenade = (x: number, heading: number): Spot => ({ x, z: shoreZ(x) - 1.45, y: 0, heading });
const sand = (x: number, t: number, heading: number): Spot => ({ x, z: sandZ(x, t), y: SAND_Y, heading });

export function spots(): readonly Spot[] {
  return [
    promenade(-22.5, 0.4),
    promenade(3.6, -0.3),
    promenade(30.2, 0.6),
    promenade(48.6, -0.5),
    { x: PIER.x + 0.1, z: 9, y: PIER.deckY, heading: 0.5 },
    { x: PIER.x - 0.1, z: 21.5, y: PIER.deckY, heading: -0.4 },
    { x: PIER.head.x1 - 2.4, z: 29.4, y: PIER.deckY, heading: 0.9 },
    sand(-60.5, 0.4, 0.3),
    sand(-23.4, 0.4, -0.3),
    sand(1.2, 0.42, 0.2),
    sand(35.2, 0.7, -0.6),
    sand(-44, 0.86, 0.5),
    sand(53, 0.45, -0.2),
  ];
}

/** Keep the spots clear of procedural camps and fills. */
export function reserveSpots(k: Kit): void {
  for (const s of spots()) k.block(s.x, s.z, 1.3, 1.3);
}

export function registerSpots(k: Kit): void {
  for (const s of spots()) k.targetSpot(s.x, s.z, s.y, s.heading);
}
