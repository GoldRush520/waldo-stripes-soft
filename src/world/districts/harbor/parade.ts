/**
 * THE BOAT PARADE: one closed loop round the middle of the basin carrying the tug that leads it, the
 * four festival floats, sailboats, the water taxi, pedal boats, a rowing gig and a kayak, all moving
 * at the same speed so the spacing never closes. Riders ride each boat's motion frame. The judges'
 * barge is moored inside the loop. Vignettes on the water live in stories-water.ts and use the
 * unit motions returned here.
 */
import type { Vec3 } from '../../../crowd/stores';
import { propDef } from '../../../props/registry';
import { ROWBOAT_OARLOCKS } from '../../../props/transport/index';
import { ride } from './boats';
import { type Ctx, claim } from './ctx';
import { PARADE, WATER, act, holdOne, holds, opt } from './plan';

export interface ParadeUnits {
  /** motion id by unit name */
  readonly m: ReadonlyMap<string, number>;
}

const UNITS: ReadonlyArray<{ name: string; key: string }> = [
  { name: 'tug', key: 'boat.tug' },
  { name: 'fishFloat', key: 'boat.float.fish' },
  { name: 'gig', key: 'boat.canoe' },
  { name: 'sail1', key: 'boat.sail' },
  { name: 'swanFloat', key: 'boat.float.swan' },
  { name: 'taxi', key: 'boat.taxi' },
  { name: 'kayak', key: 'boat.kayak' },
  { name: 'cakeFloat', key: 'boat.float.lighthouseCake' },
  { name: 'sail2', key: 'boat.sail' },
  { name: 'pedal', key: 'boat.swan' },
  { name: 'flowerFloat', key: 'boat.float.flowerArch' },
  { name: 'sail3', key: 'boat.sail' },
  { name: 'dinghy', key: 'boat.dinghy' },
  { name: 'row', key: 'boat.row' },
];

function ellipse(n: number): Vec3[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [PARADE.cx + Math.cos(a) * PARADE.rx, WATER, PARADE.cz + Math.sin(a) * PARADE.rz] as Vec3;
  });
}

/** Lay the parade on its loop and return the motion of every unit. */
export function parade(c: Ctx): ParadeUnits {
  const k = c.k;
  const route = k.loop(ellipse(28));
  const total = UNITS.reduce((s, u) => s + (propDef(u.key).footprint[1] ?? 4), 0);
  const gap = (route.length - total) / UNITS.length;
  const m = new Map<string, number>();
  let s = 0;
  for (const u of UNITS) {
    const len = propDef(u.key).footprint[1] ?? 4;
    const motion = k.onRoute(route, s + len / 2, PARADE.speed);
    k.dynamic(u.key, motion, { tint: u.key === 'boat.sail' ? k.rng.pick(['coral', 'blue', 'butter', 'sage'] as const) : undefined });
    m.set(u.name, motion);
    s += len + gap;
  }
  claim(c, { x0: PARADE.cx - PARADE.rx - 2, z0: PARADE.cz - PARADE.rz - 1.6, x1: PARADE.cx + PARADE.rx + 2, z1: PARADE.cz - PARADE.rz + 1.6 });
  claim(c, { x0: PARADE.cx - PARADE.rx - 2, z0: PARADE.cz + PARADE.rz - 1.6, x1: PARADE.cx + PARADE.rx + 2, z1: PARADE.cz + PARADE.rz + 1.6 });
  crews(c, m);
  return { m };
}

/** The harbour brass band on the fish float: every player gets the instrument their clip plays. */
function band(c: Ctx, motion: number): void {
  const players: ReadonlyArray<readonly [string, readonly string[]]> = [
    [act('trumpet.fanfare', 'cheer'), ['hold.trumpet']],
    [act('drum.snare', 'cheer'), ['carry.snare', 'hold.drumstick', 'holdL.drumstick']],
    [act('accordion.polka', 'wave'), ['carry.accordion']],
    [act('tuba.hug', 'cheer'), ['carry.tuba']],
    [act('trombone.slide', 'cheer'), ['hold.trombone']],
    [act('cymbal.crash', 'cheer'), ['hold.cymbal', 'holdL.cymbal']],
  ];
  (propDef('boat.float.fish').seats ?? []).forEach((seat, i) => {
    const [clip, instrument] = players[i % players.length] ?? ['wave', []];
    c.k.person({ x: seat.x, z: seat.z, y: seat.y, heading: seat.heading, motion, clip, blob: 0, look: { hat: 'hat.sailor', hatTint: 'ivory' }, hold: holds({ key: 'upper.bandjacket', tint: 'coral' }, ...instrument) });
  });
}

function motionOf(m: ReadonlyMap<string, number>, name: string): number {
  return m.get(name) ?? -1;
}

/** Riders of the units that are not staged as vignettes. */
function crews(c: Ctx, m: ReadonlyMap<string, number>): void {
  const k = c.k;
  const deck = ['wave', act('greet.bigwave', 'wave'), act('cheer.jump', 'cheer'), act('cheer.clap', 'cheer')];
  const tug = motionOf(m, 'tug');
  ride(c, 'boat.tug', tug, (i) => ({ clip: i ? act('greet.hattip', 'wave') : 'wave', hold: i ? [] : holds('hold.flag'), look: { hat: opt('hat.officer', 'hat.sailor'), hatTint: 'blueDeep' } }));
  band(c, motionOf(m, 'fishFloat'));
  ride(c, 'boat.float.swan', motionOf(m, 'swanFloat'), (i, rng) => ({ clip: rng.pick(deck), hold: holdOne('hold.handfan', 'hold.bouquet'), look: { lower: opt('lower.ballgown', 'lower.dress.long'), hat: i === 0 ? opt('hat.tiara', 'hat.crown') : opt('hat.pillbox', 'hat.sun'), hatTint: 'butter' } }));
  k.seated('boat.taxi', { x: 0, z: 0 }, { motion: motionOf(m, 'taxi'), place: false, fill: 0.85, clips: ['sit', act('sit.talk', 'sit'), act('sit.eat', 'sit')] });
  for (const name of ['sail1', 'sail2', 'sail3']) {
    k.seated('boat.sail', { x: 0, z: 0 }, { motion: motionOf(m, name), place: false, fill: 0.6, clips: ['sit', act('sit.talk', 'sit')], hold: () => holds('upper.lifejacket') });
  }
  k.seated('boat.swan', { x: 0, z: 0 }, { motion: motionOf(m, 'pedal'), place: false, fill: 1, clips: [act('sit.talk', 'sit'), 'sit'] });
  k.seated('boat.dinghy', { x: 0, z: 0 }, { motion: motionOf(m, 'dinghy'), place: false, fill: 1, clips: ['sit', act('sit.talk', 'sit')], hold: () => holds('neck.camera') });
  const row = motionOf(m, 'row');
  for (const [ox, oy, oz] of ROWBOAT_OARLOCKS) k.dynamic('boat.oar', row, { x: ox, y: oy, z: oz, rot: ox < 0 ? Math.PI + 0.3 : -0.3 });
  k.person({ x: 0, z: 0.05, y: 0.16 - 0.47, heading: Math.PI, motion: row, clip: act('row.pull', 'sit'), blob: 0, look: { hat: opt('hat.bucket', 'hat.sun'), hatTint: 'butter' } });
  k.person({ x: 0, z: -1, y: 0.16 - 0.47, heading: 0, motion: row, clip: 'sit', blob: 0, hold: ['hold.umbrella'], look: { lower: 'lower.dress', hat: opt('hat.straw.wide', 'hat.sun') } });
}
