/**
 * Moored and anchored boats bobbing in the basin, each with its own crew: rows of rowboats, dinghies,
 * canoes and furled sailboats stern-to the quay, a trawler and a tug alongside the cranes, rafts and
 * pedal boats further out, and a scatter of anchored yachts beyond the parade lane.
 */
import type { Rng } from '../../../core/rng';
import type { Hold, PersonSpec } from '../../kit';
import { propDef } from '../../../props/registry';
import { ROWBOAT_OARLOCKS } from '../../../props/transport/index';
import { type Ctx, claim, hullRect, waterFree } from './ctx';
import { CRANES, HIP, PARADE, WATER, act, holds, opt } from './plan';

const TINTS = ['coral', 'blue', 'butter', 'sage', 'ivory', 'coralDeep', 'blueDeep'] as const;

export interface MoorOpts {
  readonly fill?: number;
  readonly clips?: readonly string[];
  readonly hold?: () => readonly Hold[] | undefined;
  readonly tint?: (typeof TINTS)[number];
  readonly oars?: boolean;
}

/** What one rider on a seat does and wears (look overrides avoid doubled hats or skirts). */
export interface Rider {
  readonly clip: string;
  readonly hold?: readonly Hold[];
  readonly look?: PersonSpec['look'];
}

/** Put riders on every seat of a boat riding motion `m`; hip seats sit, feet seats stand. */
export function ride(c: Ctx, key: string, m: number, who: (i: number, rng: Rng) => Rider | null): void {
  const def = propDef(key);
  const feet = def.tags?.includes('seat:feet') ?? false;
  (def.seats ?? []).forEach((seat, i) => {
    const r = who(i, c.k.rng);
    if (!r) return;
    c.k.person({ x: seat.x, z: seat.z, y: seat.y - (feet ? 0 : HIP), heading: seat.heading, motion: m, clip: r.clip, hold: r.hold, look: r.look, blob: 0 });
  });
}

/** Seated boat clips (hip seats). */
export function seatedClips(): string[] {
  return ['sit', act('fish.sit', 'sit'), act('sit.talk', 'sit'), act('sit.eat', 'sit'), act('sit.asleep', 'sit'), act('sit.read', 'sit')];
}

/** Standing deck clips (feet seats). */
export function deckClips(): string[] {
  return ['wave', act('greet.bigwave', 'wave'), act('cheer.clap', 'cheer'), act('photo.camera', 'lookout'), act('idle.watch', 'stand'), 'point'];
}

/**
 * A boat bobbing at (x, z) with heading `rot`. Returns its motion id, or -1 when the water there is
 * already taken. Crew sit / stand on the prop's seat anchors.
 */
export function moor(c: Ctx, key: string, x: number, z: number, rot: number, o: MoorOpts = {}): number {
  const k = c.k;
  const def = propDef(key);
  const [w, l] = def.footprint;
  const rect = hullRect(x, z, w, l, rot, 0.25);
  if (!waterFree(c, rect)) return -1;
  claim(c, rect);
  const m = k.bob([x, WATER, z], rot, k.rng.range(0.7, 1.25), k.rng.range(0, 6.28), 0.035 + l * 0.004, 0.025, Math.max(l, 3) * 0.75);
  k.dynamic(key, m, { tint: o.tint ?? k.rng.pick(TINTS) });
  if (o.oars) {
    for (const [ox, oy, oz] of ROWBOAT_OARLOCKS) k.dynamic('boat.oar', m, { x: ox, y: oy, z: oz, rot: ox < 0 ? Math.PI + 0.35 : -0.35 });
  }
  const feet = def.tags?.includes('seat:feet') ?? false;
  if ((o.fill ?? 0.7) > 0) {
    k.seated(key, { x: 0, z: 0 }, { motion: m, place: false, fill: o.fill ?? 0.7, clips: o.clips ?? (feet ? deckClips() : seatedClips()), hold: o.hold });
  }
  return m;
}

const SMALL = ['boat.row', 'boat.dinghy', 'boat.row', 'boat.canoe', 'boat.kayak', 'boat.row', 'boat.dinghy'] as const;
const MID = ['boat.sailFurled', 'boat.row', 'boat.dinghy', 'boat.sailFurled', 'boat.canoe', 'boat.row'] as const;
const OUTER = ['harbour.barrelRaft', 'boat.pedalo', 'boat.swan', 'boat.kayak', 'boat.pedalo', 'harbour.barrelRaft', 'boat.dinghy'] as const;

function row(c: Ctx, keys: readonly string[], zFront: number, x0: number, x1: number, gap: number, fill: number): void {
  let x = x0;
  let i = c.k.rng.int(0, keys.length - 1);
  while (x < x1) {
    const key = keys[i % keys.length] ?? 'boat.row';
    const [w, l] = propDef(key).footprint;
    const cx = x + w / 2;
    const placed = moor(c, key, cx, zFront + l / 2 + c.k.rng.range(0, 0.4), c.k.rng.range(-0.06, 0.06), { fill, oars: key === 'boat.row' });
    x += placed >= 0 ? w + gap + c.k.rng.range(0, 0.5) : 0.7;
    i++;
  }
}

/** Working boats alongside the quay under the cranes. */
function workboats(c: Ctx): number {
  const [c1, c2] = CRANES;
  const trawler = moor(c, 'boat.trawler', c1.x, 3.0, Math.PI / 2, { fill: 0, tint: 'blue' });
  const jobs = [act('vend.arrange', 'point'), act('point.sky', 'point'), act('idle.hips', 'stand'), 'wave'];
  if (trawler >= 0) ride(c, 'boat.trawler', trawler, (i) => ({ clip: jobs[i % jobs.length] ?? 'stand', hold: holds('upper.hivis', i === 1 ? 'hold.boathook' : 'hold.fish'), look: { hat: 'hat.sailor', hatTint: 'ivory' } }));
  return moor(c, 'boat.tug', c2.x, 3.0, -Math.PI / 2, { fill: 0, tint: 'coral' });
}

/** Everything moored inside the jetties plus rafts and pleasure boats; returns the tug's motion. */
export function mooredBoats(c: Ctx): number {
  const tug = workboats(c);
  row(c, SMALL, 0.7, -42.5, 49, 0.55, 0.65);
  row(c, MID, 6.4, -41, 47, 0.8, 0.6);
  row(c, OUTER, 12.2, -44, 46, 1.6, 0.85);
  return tug;
}

/** Inside the district polygon with a 2.5 m margin (east edge runs diagonally past the canal mouth). */
function inBasin(x: number, z: number): boolean {
  return x > -54 && z < 59 && x < 53 + z * 0.78;
}

/**
 * Anchored boats on a jittered grid over all remaining open water: small craft parallel to the
 * parade inside its loop, yachts and dinghies elsewhere, so no stretch of water is left blank.
 */
export function anchoredBoats(c: Ctx): void {
  const k = c.k;
  const outer = ['boat.sail', 'boat.sailFurled', 'boat.dinghy', 'boat.row', 'boat.sail', 'boat.kayak', 'boat.canoe', 'harbour.barrelRaft'] as const;
  const infield = ['boat.pedalo', 'boat.swan', 'harbour.barrelRaft', 'boat.kayak', 'boat.dinghy', 'boat.row'] as const;
  let i = 0;
  for (let z = 4; z < 58; z += 6.2) {
    for (let x = -50 + (Math.round(z) % 2) * 3; x < 66; x += 6.8) {
      const px = x + k.rng.range(-1.6, 1.6);
      const pz = z + k.rng.range(-1.4, 1.4);
      if (!inBasin(px, pz) || inParadeLane(px, pz, 4.4)) continue;
      const inside = insideLoop(px, pz);
      const key = inside ? infield[i % infield.length] : outer[i % outer.length];
      const rot = inside ? (i % 2 ? Math.PI / 2 : -Math.PI / 2) : k.rng.range(-0.6, 0.6);
      moor(c, key ?? 'boat.row', px, pz, rot, { fill: inside ? 0.85 : 0.6, oars: key === 'boat.row' });
      i++;
    }
  }
}

/** Pleasure craft packed inside the parade loop, lying parallel to the passing floats. */
export function infield(c: Ctx): void {
  const k = c.k;
  const keys = ['boat.pedalo', 'boat.swan', 'harbour.barrelRaft', 'boat.kayak', 'boat.dinghy', 'boat.canoe', 'boat.pedalo'] as const;
  let i = k.rng.int(0, keys.length - 1);
  for (const z of [21.4, 25, 28.6]) {
    for (let x = PARADE.cx - PARADE.rx; x < PARADE.cx + PARADE.rx; x += 4.3) {
      const px = x + k.rng.range(-0.5, 0.5);
      if (!insideLoop(px, z) || inParadeLane(px, z, 3.6)) continue;
      const key = keys[i % keys.length] ?? 'boat.pedalo';
      moor(c, key, px, z + k.rng.range(-0.3, 0.3), i % 2 ? Math.PI / 2 : -Math.PI / 2, { fill: 0.9 });
      i++;
    }
  }
}

const LOOP: ReadonlyArray<readonly [number, number]> = Array.from({ length: 96 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  return [PARADE.cx + Math.cos(a) * PARADE.rx, PARADE.cz + Math.sin(a) * PARADE.rz] as const;
});

/** True within `margin` metres of the parade loop (the band its boats sweep). */
export function inParadeLane(x: number, z: number, margin = 2.8): boolean {
  return LOOP.some(([lx, lz]) => Math.hypot(lx - x, lz - z) < margin);
}

/** True strictly inside the parade loop. */
function insideLoop(x: number, z: number): boolean {
  return ((x - PARADE.cx) / PARADE.rx) ** 2 + ((z - PARADE.cz) / PARADE.rz) ** 2 < 1;
}

/** Swimmers, buoys, ducks, gulls and leaping fish in the gaps between boats. */
export function waterLife(c: Ctx): void {
  const k = c.k;
  const swim = [act('swim.tread-wave', 'wave'), act('swim.tread', 'stand'), act('swim.float', 'stand'), act('splash.play', 'cheer')];
  let made = 0;
  for (let t = 0; t < 900 && made < 46; t++) {
    const x = k.rng.range(-44, 46);
    const z = k.rng.range(1.2, 33);
    if (!waterFree(c, { x0: x - 0.5, z0: z - 0.5, x1: x + 0.5, z1: z + 0.5 })) continue;
    if (inParadeLane(x, z)) continue;
    claim(c, { x0: x - 0.45, z0: z - 0.45, x1: x + 0.45, z1: z + 0.45 });
    const cap = k.rng.chance(0.5) ? opt('hat.swimcap') : null;
    k.person({ x, z, y: WATER - 0.75, heading: k.rng.range(-1.2, 1.2), clip: k.rng.pick(swim), blob: 0, age: k.rng.chance(0.35) ? 'child' : 'adult', look: { hat: cap, hatTint: k.rng.pick(TINTS), longSleeves: false, longLegs: false } });
    made++;
  }
  for (let i = 0; i < 14; i++) {
    const x = -44 + i * 6.8 + k.rng.range(-1, 1);
    const z = i % 2 ? 34.6 : 35.4;
    claim(c, { x0: x - 0.6, z0: z - 0.6, x1: x + 0.6, z1: z + 0.6 });
    const m = k.bob([x, WATER, z], 0, 0.9, i, 0.06, 0.08, 2);
    k.dynamic(i % 3 ? 'harbour.buoy.marker' : 'harbour.buoy.can', m, { tint: i % 2 ? 'coral' : 'butter' });
  }
  for (let i = 0; i < 12; i++) {
    const m = k.spin([k.rng.range(-40, 44), k.rng.range(4.5, 8.5), k.rng.range(-4, 30)], k.rng.range(0.25, 0.5), k.rng.range(0, 6.28), 6);
    k.dynamic('animal.gull.flying', m, { x: k.rng.range(2.5, 5), rot: Math.PI });
  }
  for (let i = 0; i < 8; i++) {
    const x = k.rng.range(-40, 44);
    const z = k.rng.range(5, 16);
    if (!waterFree(c, { x0: x - 0.4, z0: z - 0.4, x1: x + 0.4, z1: z + 0.4 })) continue;
    k.dynamic(i % 2 ? 'animal.duck' : 'animal.swan', k.bob([x, WATER, z], k.rng.range(0, 6.28), 0.8, i, 0.03, 0.04, 2));
  }
  for (const [x, z] of [[-15, 17], [27, 16.5], [-36, 33]] as const) k.prop('animal.fish.jumping', { x, z, y: WATER });
}
