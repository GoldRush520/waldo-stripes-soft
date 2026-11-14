/**
 * Placement helpers for seating: benches, shelters and deck chairs are placed as geometry with a
 * solid strip only behind the seat line, so seated people are not counted inside a footprint while
 * fills and queues still keep clear of the furniture.
 */
import { hasProp, propDef, propGeo } from '../../../props/registry';
import type { At, Kit } from '../../kit';

type SeatOpts = Parameters<Kit['seated']>[2];

/** Place a seat prop, block the strip behind its seats, and seat people on it. */
export function seatProp(k: Kit, key: string, at: At, opts: SeatOpts = {}): number[] {
  if (!hasProp(key)) return k.seated(key, at, opts);
  const def = propDef(key);
  k.add(propGeo(key), { ...at, tint: at.tint ?? def.defaultTint });
  const [w, d] = def.footprint;
  const seatZ = Math.min(...(def.seats ?? [{ z: 0 }]).map((s) => s.z));
  const back = -d / 2;
  const front = seatZ - 0.3;
  if (front > back + 0.05) {
    const c = k.rel({ x: at.x, z: at.z, rot: at.rot }, 0, (back + front) / 2);
    k.block(c.x, c.z, w * (at.scale ?? 1), (front - back) * (at.scale ?? 1), at.rot ?? 0);
  }
  return k.seated(key, at, { ...opts, place: false });
}

/** Place a prop as geometry only (walk-through for the crowd checks), e.g. towels and decks. */
export function decor(k: Kit, key: string, at: At): void {
  if (!hasProp(key)) {
    k.prop(key, at);
    return;
  }
  k.add(propGeo(key), { ...at, tint: at.tint ?? propDef(key).defaultTint });
}
