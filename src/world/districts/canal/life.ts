/**
 * Everyday bank life: promenade walkers on the outer band, benches with sitters, people leaning on
 * the railings to watch the boats, and a seeded scatter of small sociable groups that packs both
 * banks (about one person per 3–4 m²) while keeping the staged scenes and hero spots clear.
 */
import type { Vec3 } from '../../../crowd/stores';
import type { Hold, Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { bridgeHalf } from './banks';
import type { BridgeSite } from './bridges';
import { clip, holds, opt } from './catalog';
import { S_NORTH, at, bank, edgeAt, faceWater, landAt, sStart } from './frame';
import { LAND_TARGETS, STORY_LAND, inZone } from './spots';

const near = (sites: readonly BridgeSite[], s: number, pad: number): boolean => sites.some((b) => Math.abs(s - b.s) < bridgeHalf(b) + pad);

function extras(rng: Kit['rng']): Hold[] | undefined {
  if (rng.chance(0.3)) return [{ key: 'hold.bag', tint: rng.pick(CLOTHS) }];
  if (rng.chance(0.1)) return [{ key: 'hold.balloon', tint: rng.pick(CLOTHS) }];
  if (rng.chance(0.08)) return [{ key: 'hold.umbrella', tint: rng.pick(CLOTHS) }];
  if (rng.chance(0.08)) return ['back.pack'];
  return undefined;
}

/** Two there-and-back promenade routes per bank along the outer paving band. */
function promenades(k: Kit): void {
  const mid = (sStart(1) + S_NORTH) / 2;
  for (const side of [-1, 1] as const) {
    for (const [a, b] of [[sStart(side) + 0.5, mid + 1], [mid - 1, S_NORTH - 0.5]] as const) {
      const pts: Vec3[] = [];
      const n = Math.ceil((b - a) / 5);
      for (let i = 0; i <= n; i++) {
        const p = at(k, a + ((b - a) * i) / n, side * 10.6);
        pts.push([p.x, 0, p.z]);
      }
      k.walkers(pts, 27, { lanes: [0.25, 0.6], speed: [0.75, 1.3], childShare: 0.14, hold: extras });
      k.walkers(pts, 3, { lanes: [0.55], speed: [0.45, 0.6], childShare: 0, clip: 'stroll.stick', hold: () => ['hold.stick'] });
    }
  }
}

/** Porters carrying crates along the east promenade toward the waiting barge. */
function porters(k: Kit): void {
  const pts: Vec3[] = [56, 63, 70, 77].map((s) => {
    const p = at(k, s, 9.0);
    return [p.x, 0, p.z];
  });
  const lane = k.street(pts, 0.25);
  for (let i = 0; i < 4; i++) {
    const m = k.onRoute(lane, i * 7.5, 0.9);
    k.person({ x: 0, z: 0, motion: m, clip: 'carry', speed: 0.9 / 1.3, hold: ['carry.crate', 'upper.apron'], look: { hat: opt('hat.cap'), hatTint: 'sage', longLegs: true } });
  }
}

function benches(k: Kit, sites: readonly BridgeSite[]): void {
  let i = 0;
  for (const side of [-1, 1] as const) {
    for (let s = sStart(side) + (side < 0 ? 5.5 : 3); s < S_NORTH - 2; s += 11.5) {
      if (near(sites, s, 1.5) || STORY_LAND.some((z) => inZone(z, s, side * 8.35, 1)) || LAND_TARGETS.some((t) => Math.abs(t.s - s) < 2.2)) continue;
      const p = at(k, s, side * 8.35);
      k.seated(i % 3 === 2 ? 'bench.stone' : 'bench.park', { x: p.x, z: p.z, rot: faceWater(s, side) }, {
        fill: 0.85,
        clips: [clip('sit.talk', 'sit'), clip('sit.read', 'sit'), clip('sit.eat', 'sit'), 'sit'],
        age: i % 4 === 3 ? 'elder' : undefined,
      });
      i++;
    }
  }
}

const WATCH = (): string[] => ['lookout', 'point', 'wave', 'stand', clip('photo.camera', 'point'), clip('idle.arms', 'stand'), clip('eat.icecream', 'stand')];
const GROUP = (): string[] => ['talk', 'stand', 'talk', 'point', 'wave', 'cheer', clip('talk.laugh', 'talk'), clip('idle.phone', 'stand'), clip('talk.nod', 'talk'), clip('drink.cup', 'stand')];

function clear(k: Kit, s: number, d: number, r: number): boolean {
  if (STORY_LAND.some((z) => inZone(z, s, d, 0.4))) return false;
  if (LAND_TARGETS.some((t) => Math.hypot(t.s - s, t.d - d) < 1.5 + r)) return false;
  if (!landAt(s, d) || !landAt(s, d + Math.sign(d) * (r + 0.3)) || !landAt(s, d - Math.sign(d) * (r + 0.3))) return false;
  const p = at(k, s, d);
  return k.isFree(p.x, p.z, r * 0.5 + 0.24);
}

/** Railing watchers: single people at the water's edge facing the canal. */
function watchers(k: Kit, sites: readonly BridgeSite[], count: number): void {
  let made = 0;
  for (let t = 0; t < count * 25 && made < count; t++) {
    const side = k.rng.chance(0.5) ? 1 : -1;
    const s = k.rng.range(sStart(side) + 0.6, S_NORTH - 0.6);
    const d = side * (edgeAt(s, side) + k.rng.range(0.85, 1.15));
    if (near(sites, s, 0.2) || !clear(k, s, d, 0.1)) continue;
    const p = at(k, s, d);
    k.person({
      x: p.x,
      z: p.z,
      heading: faceWater(s, d) + k.rng.range(-0.5, 0.5),
      clip: k.rng.pick(WATCH()),
      age: k.rng.chance(0.18) ? 'child' : k.rng.chance(0.12) ? 'elder' : 'adult',
      hold: extras(k.rng),
      look: k.rng.chance(0.25) ? { hat: opt('hat.sun', 'hat.boater'), hatTint: k.rng.pick(CLOTHS) } : undefined,
    });
    made++;
  }
}

/** Small groups across the promenade between railing and walker band. */
function groups(k: Kit, sites: readonly BridgeSite[], count: number): void {
  let made = 0;
  for (let t = 0; t < count * 40 && made < count; t++) {
    const side = k.rng.chance(0.5) ? 1 : -1;
    const s = k.rng.range(sStart(side) + 0.8, S_NORTH - 0.8);
    const n = Math.min(count - made, k.rng.int(1, 5));
    const r = n === 1 ? 0.1 : 0.45 + n * 0.11;
    const d = side * k.rng.range(Math.max(6.3, edgeAt(s, side) + 1.25) + r, 9.45 - r);
    if (near(sites, s, 0.4) || !clear(k, s, d, r)) continue;
    const p = at(k, s, d);
    made += k.group(p.x, p.z, n, { clips: GROUP() }).length;
  }
}

/**
 * Place a seat prop as walk-through (its sitters occupy the footprint), block only `core`
 * (e.g. the table of a table set), then seat people on it.
 */
export function seatOn(k: Kit, key: string, place: { x: number; z: number; rot: number; tint?: 'blue' | 'coral' }, opts: Parameters<Kit['seated']>[2], core?: readonly [number, number]): number[] {
  k.prop(key, place, { walkThrough: true });
  if (core) k.block(place.x, place.z, core[0], core[1], place.rot);
  return k.seated(key, place, { ...opts, place: false });
}

/** Seated anglers on stools at railing gaps, rods out over the water. */
export function anglers(k: Kit, s: number, side: -1 | 1, n: number, sleepy = false): number[] {
  const ids: number[] = [];
  for (let i = 0; i < n; i++) {
    const ss = s + (i - (n - 1) / 2) * 1.3;
    const p = bank(k, ss, side, 0.85);
    const seat = seatOn(k, 'cafe.stool', { x: p.x, z: p.z, rot: faceWater(ss, side) }, {
      fill: 1,
      clips: [sleepy && i === 0 ? clip('sit.asleep', 'sit') : clip('fish.sit', 'fish.cast', 'sit')],
      hold: () => holds('hold.rod', 'hold.fishingrod'),
    });
    ids.push(...seat);
    const q = bank(k, ss + 0.55, side, 1.25);
    k.prop(i % 2 ? 'harbour.fishCrate' : 'crate.fish', { x: q.x, z: q.z, rot: faceWater(ss, side) });
  }
  return ids;
}

export function buildLife(k: Kit, sites: readonly BridgeSite[]): void {
  promenades(k);
  porters(k);
  benches(k, sites);
  watchers(k, sites, 95);
  groups(k, sites, 260);
}
