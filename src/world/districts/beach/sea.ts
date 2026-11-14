/**
 * The bathing sea: a band about 25 m deep beyond the waterline, occupied edge to edge — waders
 * splashing in the shallows, swimmers treading, floating and doing laps, inflatables, two diving
 * rafts, pedal boats on a loop east of the pier, kayaks to the west, buoy lines and wheeling gulls.
 */
import type { Geo } from '../../../core/geo';
import { buoyLine } from '../../../props/leisure';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { CLIP } from './clips';
import { gaitSpeed } from './gait';
import { PIER, SEA_SOUTH, SEA_Y, SWIM_Y, WADE_Y, waterZ } from './frame';
import { HOLD, hold, opt } from './holds';

/** distance beyond the waterline -> local z */
const seaZ = (x: number, d: number): number => Math.min(SEA_SOUTH, waterZ(x) + d);

const RAFTS: ReadonlyArray<readonly [number, number]> = [[-31, 13], [33, 14]];
const PEDALO_BOX = { x0: 25.5, x1: 50, d0: 9, d1: 21 } as const;
/** centre (local x, metres beyond the waterline) of the pedalo turning in circles */
export const PEDALO_SPIN: readonly [number, number] = [-7, 15];
const KAYAK_BOX = { x0: -76, x1: -60, d0: 11, d1: 23 } as const;

function nearPier(x: number, z: number): boolean {
  const h = PIER.head;
  if (x > PIER.x - PIER.width / 2 - 1.5 && x < PIER.x + PIER.width / 2 + 1.5 && z < h.z0 + 0.5) return true;
  return x > h.x0 - 2.5 && x < h.x1 + 2.5 && z > h.z0 - 2;
}

function reserved(x: number, d: number, z: number): boolean {
  if (nearPier(x, z)) return true;
  if (Math.abs(PEDALO_SPIN[0] - x) < 4.2 && Math.abs(PEDALO_SPIN[1] - d) < 4.2) return true;
  if (RAFTS.some(([rx, rd]) => Math.abs(rx - x) < 3.4 && Math.abs(rd - d) < 3.4)) return true;
  if (x > PEDALO_BOX.x0 - 1 && x < PEDALO_BOX.x1 + 1 && d > PEDALO_BOX.d0 - 1.5 && d < PEDALO_BOX.d1 + 1.5) return true;
  return x > KAYAK_BOX.x0 - 1 && x < KAYAK_BOX.x1 + 1 && d > KAYAK_BOX.d0 - 1.5 && d < KAYAK_BOX.d1 + 1.5;
}

function swimLook(k: Kit): Parameters<Kit['person']>[0]['look'] {
  return {
    hat: k.rng.chance(0.4) ? opt('hat.swimcap') : null,
    hatTint: k.rng.pick(CLOTHS),
    glasses: k.rng.chance(0.15) ? opt('face.goggles') : null,
    longSleeves: false,
    longLegs: false,
  };
}

/** waders in the shallows (feet just under the surface) */
function wade(k: Kit, x: number, z: number): void {
  const n = k.rng.int(1, 3);
  for (let i = 0; i < n; i++) {
    const age = k.rng.chance(0.45) ? 'child' : 'adult';
    k.person({
      x: x + i * 0.75 + k.rng.range(-0.2, 0.2),
      z: z + k.rng.range(-0.4, 0.4),
      y: WADE_Y,
      heading: k.rng.range(-0.8, 0.8) + (k.rng.chance(0.3) ? Math.PI : 0),
      clip: k.rng.pick([CLIP.splash, CLIP.kick, CLIP.splash, CLIP.wave, CLIP.talk, CLIP.pointAcross]),
      age,
      blob: 0,
      look: { longLegs: false, longSleeves: false },
      hold: age === 'child' && k.rng.chance(0.3) ? hold(HOLD.swimring) : [],
    });
  }
}

/** a little cluster of swimmers, sometimes with an inflatable */
function swim(k: Kit, x: number, z: number): void {
  const n = k.rng.int(1, 3);
  for (let i = 0; i < n; i++) {
    k.person({
      x: x + i * 1.1 + k.rng.range(-0.3, 0.3),
      z: z + k.rng.range(-0.6, 0.6),
      y: SWIM_Y,
      heading: k.rng.range(-1.2, 1.2),
      clip: k.rng.pick([CLIP.tread, CLIP.treadWave, CLIP.float, CLIP.tread, CLIP.float]),
      age: k.rng.chance(0.2) ? 'child' : 'adult',
      blob: 0,
      look: swimLook(k),
    });
  }
  if (k.rng.chance(0.35)) {
    const key = k.rng.pick(['beach.ring', 'beach.croc', 'beach.lilo', 'beach.ring']);
    const m = k.bob([x - 1.2, SEA_Y, z + 0.4], k.rng.range(0, 6.28), 0.8, k.rng.next(), 0.05, 0.06, 3);
    k.dynamic(key, m, { y: -0.08, tint: k.rng.pick(CLOTHS) });
  }
}

function bathers(k: Kit): void {
  for (let x = -77.5; x < 53; x += 4.6) {
    for (const d0 of [1.8, 7.5, 12.5, 17.5, 22.5]) {
      const cx = x + k.rng.range(-1, 1) + (d0 > 10 ? 2.2 : 0);
      const d = d0 + k.rng.range(-0.7, 0.7);
      const z = seaZ(cx, d);
      if (z >= SEA_SOUTH - 0.5 || reserved(cx, d, z)) continue;
      if (d0 < 3) wade(k, cx, z);
      else if (k.rng.chance(0.85)) swim(k, cx, z);
    }
  }
}

/** lap swimmers doing the crawl along the buoy lines */
function laps(k: Kit): void {
  for (const [x0, x1] of [[-74, -40], [-34, 8]] as const) {
    const d = 19.5;
    const route = k.loop([[x0, SEA_Y, seaZ(x0, d)], [(x0 + x1) / 2, SEA_Y, seaZ((x0 + x1) / 2, d)], [x1, SEA_Y, seaZ(x1, d)], [x1, SEA_Y, seaZ(x1, d + 2)], [x0, SEA_Y, seaZ(x0, d + 2)]]);
    for (let i = 0; i < 5; i++) {
      const v = k.rng.range(0.45, 0.7);
      const m = k.onRoute(route, (i / 5) * route.length + k.rng.range(0, 3), v);
      k.person({ x: 0, z: 0, y: SWIM_Y - SEA_Y, motion: m, clip: CLIP.crawl, speed: gaitSpeed(CLIP.crawl, v), blob: 0, look: swimLook(k) });
    }
  }
}

function rafts(k: Kit): void {
  for (const [x, d] of RAFTS) {
    const m = k.bob([x, SEA_Y, seaZ(x, d)], 0.2, 0.7, k.rng.next(), 0.04, 0.03, 4);
    k.dynamic('beach.diveraft', m);
    k.seated('beach.diveraft', { x: 0, z: 0 }, { motion: m, place: false, clips: [CLIP.diveReady, CLIP.wave, CLIP.jump, CLIP.bigwave], fill: 0.9 });
    for (const a of [0.6, 2.4, 4.1]) {
      k.person({ x: x + Math.sin(a) * 2.8, z: seaZ(x, d) + Math.cos(a) * 2.8, y: SWIM_Y, face: [x, seaZ(x, d)], clip: k.rng.pick([CLIP.tread, CLIP.treadWave]), blob: 0, look: swimLook(k) });
    }
  }
}

function boats(k: Kit): void {
  const b = PEDALO_BOX;
  const pedalos = k.loop([[b.x0, SEA_Y, seaZ(b.x0, b.d0)], [b.x1, SEA_Y, seaZ(b.x1, b.d0)], [b.x1, SEA_Y, seaZ(b.x1, b.d1)], [b.x0, SEA_Y, seaZ(b.x0, b.d1)]]);
  for (let i = 0; i < 5; i++) {
    const m = k.onRoute(pedalos, (i / 5) * pedalos.length, 0.55, { bob: 0.04 });
    const tint = CLOTHS[i % CLOTHS.length];
    k.dynamic('boat.pedalo', m, { tint });
    k.seated('boat.pedalo', { x: 0, z: 0 }, { motion: m, place: false, clips: [CLIP.sit, CLIP.wave, CLIP.sitTalk], fill: 0.95 });
  }
  const c = KAYAK_BOX;
  const kayaks = k.loop([[c.x0, SEA_Y, seaZ(c.x0, c.d0)], [c.x1, SEA_Y, seaZ(c.x1, c.d0 + 2)], [c.x1, SEA_Y, seaZ(c.x1, c.d1)], [c.x0, SEA_Y, seaZ(c.x0, c.d1)]]);
  for (let i = 0; i < 4; i++) {
    const m = k.onRoute(kayaks, (i / 4) * kayaks.length, 0.8);
    k.dynamic('boat.kayak', m, { tint: CLOTHS[(i + 2) % CLOTHS.length] });
    k.seated('boat.kayak', { x: 0, z: 0 }, { motion: m, place: false, clips: [CLIP.kayak], fill: 1, hold: () => hold(HOLD.lifejacket) });
  }
  /* pedalos for hire drawn up at the water's edge */
  for (const [x, rot] of [[23.5, 0.3], [25.6, -0.2], [52, 0.1]] as const) {
    const m = k.bob([x, SEA_Y, seaZ(x, 1.2)], rot, 0.6, k.rng.next(), 0.02, 0.02, 3);
    k.dynamic('boat.pedalo', m, { tint: k.rng.pick(CLOTHS) });
  }
}

const buoyCache = new Map<number, Geo>();
function buoys(k: Kit): void {
  for (const [x0, x1] of [[-77, 9], [25, 53]] as const) {
    const d = 24;
    for (let x = x0; x < x1; x += 9) {
      const xe = Math.min(x1, x + 9);
      const za = seaZ(x, d);
      const zb = seaZ(xe, d);
      if (za >= SEA_SOUTH - 0.2 && zb >= SEA_SOUTH - 0.2) continue;
      const len = Math.round(Math.hypot(xe - x, zb - za));
      let g = buoyCache.get(len);
      if (!g) {
        g = buoyLine(len);
        buoyCache.set(len, g);
      }
      k.add(g, { x: (x + xe) / 2, z: (za + zb) / 2, y: SEA_Y, rot: Math.atan2(-(zb - za), xe - x) }, { cast: false });
    }
  }
  for (const x of [-60, -20, 40]) k.prop('harbour.buoy.marker', { x, z: seaZ(x, 25.5), y: SEA_Y });
}

function gulls(k: Kit): void {
  for (let i = 0; i < 7; i++) {
    const cx = -70 + i * 19 + k.rng.range(-4, 4);
    const cz = seaZ(cx, k.rng.range(6, 18));
    const r = k.rng.range(4, 7);
    const y = k.rng.range(3.2, 5.5);
    const loop = k.loop([0, 1, 2, 3, 4, 5].map((j) => [cx + Math.cos(j * 1.047) * r, y + (j % 2) * 0.4, cz + Math.sin(j * 1.047) * r * 0.7] as const));
    const m = k.onRoute(loop, k.rng.range(0, loop.length), k.rng.range(2.2, 3.2));
    k.dynamic('animal.gull.flying', m);
  }
}

export function buildSea(k: Kit): void {
  bathers(k);
  laps(k);
  rafts(k);
  boats(k);
  buoys(k);
  gulls(k);
}
