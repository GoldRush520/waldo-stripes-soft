/**
 * Default variants of the parametric civic builders, memoised so a prop's geometry and its walkable
 * metadata come from one build. `civicMeta(key)` exposes that metadata (decks, floors, columns...).
 */
import type { Geo } from '../../core/geo';
import { coveredBridge, ironFootbridge, stoneArchBridge } from './bridges';
import { drawBridge, plankRopeBridge, tramViaduct } from './bridges2';
import { houseFrame, scaffold } from './construction';
import { arcade } from './decals';
import { platform, ramp, stairs } from './ground';
import { marketHall, stationHall } from './halls';
import { bandstand, greenhouse } from './halls2';
import { boathouse, gazebo } from './kiosks';
import { boardwalk, jetty, pleasurePier } from './piers';
import { tramCurve } from './track';
import { harbourLookout } from './towers2';

function memo<T>(f: () => T): () => T {
  const box: { value?: T; done: boolean } = { done: false };
  return () => {
    if (!box.done) {
      box.value = f();
      box.done = true;
    }
    return box.value as T;
  };
}

export const V = {
  'bridge.stone': memo(() => stoneArchBridge()),
  'bridge.iron': memo(() => ironFootbridge()),
  'bridge.covered': memo(() => coveredBridge()),
  'bridge.draw': memo(() => drawBridge()),
  'bridge.draw.raised': memo(() => drawBridge({ raised: true })),
  'bridge.rope': memo(() => plankRopeBridge()),
  'bridge.viaduct': memo(() => tramViaduct()),
  'tower.lookout': memo(() => harbourLookout()),
  'hall.market': memo(() => marketHall()),
  'hall.station': memo(() => stationHall()),
  greenhouse: memo(() => greenhouse()),
  bandstand: memo(() => bandstand()),
  gazebo: memo(() => gazebo()),
  boathouse: memo(() => boathouse()),
  'stairs.wide': memo(() => stairs(4, 1.5, 8)),
  'stairs.narrow': memo(() => stairs(1.6, 1.2, 6, { color: 'clayLight' })),
  'ramp.gentle': memo(() => ramp(2.2, 0.9, 7)),
  'terrace.block': memo(() => platform([[-4, -3], [4, -3], [4, 3], [-4, 3]], 1.2)),
  'terrace.corner': memo(() => platform([[-5, -5], [5, -5], [5, 1], [0, 1], [0, 5], [-5, 5]], 1.6, 'clayLight', 'ivory')),
  'pier.jetty8': memo(() => jetty(8)),
  'pier.jetty14': memo(() => jetty(14, 2.2)),
  'boardwalk.8': memo(() => boardwalk(8)),
  'pier.pleasure': memo(() => pleasurePier(24)),
  'track.curve90': memo(() => tramCurve(8, Math.PI / 2)),
  'track.curve45': memo(() => tramCurve(10, Math.PI / 4)),
  'arcade.5': memo(() => arcade(5)),
  'scaffold.3x3': memo(() => scaffold(3, 3)),
  'scaffold.2x2': memo(() => scaffold(2, 2)),
  'frame.house': memo(() => houseFrame()),
} as const;

export type CivicVariantKey = keyof typeof V;
type Result<K extends CivicVariantKey> = ReturnType<(typeof V)[K]>;

/** Geometry of a memoised variant. */
export function variantGeo(key: CivicVariantKey): Geo {
  return V[key]().geo;
}

/** Walkable / placement metadata of a civic prop (everything its builder returned except `geo`). */
export function civicMeta<K extends CivicVariantKey>(key: K): Omit<Result<K>, 'geo'> {
  const { geo: _geo, ...rest } = V[key]() as Result<K>;
  return rest;
}
