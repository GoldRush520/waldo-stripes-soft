/**
 * Everyday life that fills the café lanes edge to edge: people on balconies and roof terraces,
 * lane walkers (shoppers, waiters, delivery hands), and contextual small groups filling the open
 * ground that the authored scenes leave free.
 */
import type { Rng } from '../../../core/rng';
import type { Hold, Kit } from '../../kit';
import { clip, opts } from './catalog';
import { weavingWaiters } from './dining';
import { LANE1, LANE2, LANE_NE, type P2, PASSAGE, type V3, edge } from './plan';
import type { PlacedHouse } from './terraces';

const CLOTHS = ['coral', 'butter', 'blue', 'sage', 'coralDeep', 'blueDeep', 'clay'] as const;

/** Is this house front visible from the default (southern) camera? */
const facesCamera = (h: PlacedHouse): boolean => Math.cos(h.rot) > 0.5;

function shoppers(rng: Rng): readonly Hold[] | undefined {
  if (rng.chance(0.4)) return [{ key: 'hold.bag', tint: rng.pick(CLOTHS) }];
  if (rng.chance(0.08)) return [{ key: 'hold.balloon', tint: rng.pick(CLOTHS) }];
  if (rng.chance(0.08)) return [{ key: 'hold.umbrella', tint: rng.pick(CLOTHS) }];
  return undefined;
}

/** People leaning on every visible balcony. */
export function balconies(k: Kit, houses: readonly PlacedHouse[]): void {
  const looks = [clip('idle.watch', 'lookout'), 'wave', clip('talk.nod', 'talk'), clip('idle.arms', 'stand'), 'lookout', clip('drink.cup', 'stand')];
  for (const h of houses) {
    if (!facesCamera(h)) continue;
    for (const b of h.result.balconies) {
      const n = b.w > 1.6 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const along = n === 1 ? 0 : (i - 0.5) * Math.min(0.9, b.w * 0.45);
        const p = k.rel(h, b.x + along, b.z, b.heading);
        k.person({ ...p, y: b.y, clip: k.rng.pick(looks), blob: 0 });
      }
    }
  }
}

/** Roof terraces: a walkable surface, a little furniture and a sociable group on each. */
export function roofs(k: Kit, houses: readonly PlacedHouse[], skip: readonly PlacedHouse[] = []): void {
  houses.forEach((h, i) => {
    const t = h.result.terrace;
    if (!t || skip.includes(h)) return;
    const corners: P2[] = [
      [-t.w / 2, -t.d / 2],
      [t.w / 2, -t.d / 2],
      [t.w / 2, t.d / 2],
      [-t.w / 2, t.d / 2],
    ].map(([x, z]) => {
      const p = k.rel(h, x, z);
      return [p.x, p.z] as const;
    });
    k.surface('roof', corners, t.y);
    const prop = ['roof.deckChairs', 'roof.washTable', 'planter.tub', 'roof.picnicTable'][i % 4] as string;
    const pp = k.rel(h, t.w / 4, t.d / 4 - 0.4, 0);
    if (prop === 'roof.deckChairs' || prop === 'roof.picnicTable') {
      k.seated(prop, { x: pp.x, z: pp.z, y: t.y, rot: h.rot }, { clips: [clip('sit.talk', 'sit'), clip('sit.read', 'sit'), 'sit'] });
    } else {
      k.prop(prop, { x: pp.x, z: pp.z, y: t.y, rot: h.rot });
    }
    const g = k.rel(h, -t.w / 6, t.d / 5, 0);
    const n = Math.max(2, Math.min(5, Math.floor((t.w * t.d) / 7)));
    k.group(g.x, g.z, n, { y: t.y, radius: 0.55 + n * 0.08, clips: ['talk', 'wave', clip('talk.laugh', 'talk'), clip('drink.cup', 'talk'), 'cheer', 'lookout'] });
  });
}

/** Lane walkers: shoppers in both directions, a handful of delivery hands and two waiter loops. */
export function walkers(k: Kit, waiterLoops: ReadonlyArray<readonly V3[]>): void {
  const lanes: ReadonlyArray<readonly [readonly V3[], number, readonly number[]]> = [
    [LANE1, 34, [0.5, 1.4]],
    [LANE_NE, 30, [0.5, 1.4]],
    [LANE2, 64, [0.6, 1.6]],
    [PASSAGE, 16, [0.4, 1.0]],
  ];
  for (const [path, n, lanesAt] of lanes) k.walkers(path, n, { lanes: lanesAt, speed: [0.75, 1.3], hold: shoppers });
  const west: V3[] = [
    [edge(-40.4, -12).x, 0, edge(-40.4, -12).z],
    [edge(-40.4, 0).x, 0, edge(-40.4, 0).z],
    [edge(-38.8, 16).x, 0, edge(-38.8, 16).z],
  ];
  k.walkers(west, 14, { lanes: [0.4, 1.0], hold: shoppers });
  const east: V3[] = [
    [35, 0, -17],
    [38.5, 0, -6],
    [39, 0, 6],
    [37, 0, 12],
  ];
  k.walkers(east, 16, { lanes: [0.5, 1.3], hold: shoppers });
  const amblers = clip('walk.amble', 'walk');
  k.walkers([[-30, 0, 16], [-12, 0, 13.5], [6, 0, 12.6], [24, 0, 15.2]], 24, { lanes: [0.5, 1.3], clip: amblers, speed: [0.5, 0.8], hold: shoppers });
  /* delivery hands with crates on the lanes */
  const crate = k.street([...LANE2].reverse(), 2.1);
  for (let i = 0; i < 4; i++) {
    const m = k.onRoute(crate, i * 18, 0.9);
    const g = clip('carry', 'walk');
    k.person({ x: 0, z: 0, motion: m, clip: g, speed: (0.9 * 1.05) / 1.42, hold: opts('carry.crate', 'upper.apron'), look: { hat: 'hat.cap', hatTint: 'blue', longLegs: true } });
  }
  for (const loop of waiterLoops) weavingWaiters(k, loop, 4);
}

/** Contextual filler clips per kind of place. */
export const FILL_CLIPS = {
  piazza: ['talk', 'stand', clip('talk.laugh', 'talk'), clip('eat.icecream', 'talk'), 'point', 'wave', clip('photo.camera', 'point'), clip('idle.watch', 'stand')],
  lane: ['stand', 'talk', clip('read.map', 'lookout'), clip('idle.phone', 'stand'), 'lookout', clip('greet.handshake', 'talk')],
  garden: ['talk', clip('eat.sandwich', 'talk'), clip('drink.cup', 'stand'), 'stand', clip('talk.nod', 'talk'), 'wave'],
} as const;
