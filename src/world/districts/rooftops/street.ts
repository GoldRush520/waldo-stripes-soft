/**
 * Street life on the ground strip and along the three terrace lanes: furniture, a café corner, the
 * flower cart and kiosk, benches facing the view, doorstep chats, walkers on every lane and climbers
 * on every flight of stairs.
 */
import type { At, Hold, Kit } from '../../kit';
import type { Rng } from '../../../core/rng';
import { CLOTHS, treeGeo } from '../shared';
import { clip, holds } from './cast';
import { flightEnds } from './hill';
import { FLIGHTS, FRONT_Z, LEVEL_Y, PIAZZA, ROW_DEPTH, SPAN_X, laneZ, rowZ } from './plan';

/** Place a seat prop people may walk round (no solid block) and fill its seats. */
export function seatedFree(k: Kit, key: string, at: At, clips: readonly string[], fill = 0.85): number[] {
  k.prop(key, at, { walkThrough: true });
  return k.seated(key, at, { place: false, fill, clips });
}

/** Place a prop on a terrace (y > 0) and keep fills off its footprint. */
function put(k: Kit, key: string, at: At, w: number, d: number): void {
  k.prop(key, at);
  if ((at.y ?? 0) >= 0.5) k.block(at.x, at.z, w, d, at.rot ?? 0);
}

const bags = (rng: Rng): readonly Hold[] | undefined =>
  rng.chance(0.4) ? holds({ key: 'hold.bag', tint: rng.pick(CLOTHS) }) : rng.chance(0.1) ? holds({ key: 'hold.balloon', tint: rng.pick(CLOTHS) }) : undefined;

function groundDressing(k: Kit): void {
  const f = FRONT_Z[1];
  put(k, 'fountain.wall', { x: -20, z: f + 0.55 }, 1.6, 1.0);
  k.queue([-20, f + 4.2], [-20, f + 1.2], 3, { clips: ['stand', clip('drink.cup', 'stand'), 'talk'] });
  for (const x of [-5.5, 12, 20.5]) seatedFree(k, 'bench.park', { x, z: f + 0.75 }, [clip('sit.read', 'sit'), clip('sit.talk', 'sit'), 'sit']);
  for (const x of [-30, -17, -2, 10, 24, 36]) {
    k.prop('lamp.classic', { x, z: 19.2 });
  }
  for (const [i, x] of [-23, -8, 16, 33].entries()) {
    k.add(treeGeo('pottedOrange', i % 3), { x, z: 19.0 });
    k.block(x, 19.0, 0.7, 0.7);
  }
  k.prop('kiosk.news', { x: 36.2, z: 15.2, rot: -Math.PI / 2 });
  k.person({ x: 34.6, z: 15.2, heading: -Math.PI / 2, clip: clip('vend.hawk', 'wave'), hold: holds('hold.newspaper'), look: { hat: 'hat.cap', hatTint: 'coral' } });
  k.queue([30.8, 16.4], [34.4, 15.4], 3, { clips: ['stand', clip('read.paper', 'stand'), 'talk'] });
  k.prop('cart.flower', { x: PIAZZA.x + 3.4, z: PIAZZA.z - 0.6, rot: -0.4 });
  k.person({ x: PIAZZA.x + 3.6, z: PIAZZA.z - 1.9, heading: 0, clip: clip('vend.arrange', 'point'), hold: holds('upper.apron', 'hold.bouquet') });
  for (let i = 0; i < 3; i++) k.person({ x: PIAZZA.x + 2.6 + i * 0.7, z: PIAZZA.z + 1.3, face: [PIAZZA.x + 3.4, PIAZZA.z - 0.6], clip: i % 2 ? 'point' : clip('talk.haggle', 'talk') });
}

function cafeCorner(k: Kit): void {
  for (const [i, [x, z]] of ([[14, 14.2], [17, 15.6], [20, 14.2], [23, 15.6], [26, 14.6]] as const).entries()) {
    seatedFree(k, 'cafe.set.round2', { x, z, rot: Math.PI / 2 + (i % 2 ? 0.2 : -0.2) }, [clip('sit.eat', 'sit'), clip('sit.talk', 'sit'), 'sit'], 1);
  }
  k.prop('parasol.open', { x: 18.5, z: 18.3 }, { walkThrough: true });
  k.person({ x: 18.6, z: 17.3, heading: Math.PI, clip: clip('serve.tray', 'carry', 'talk'), hold: holds('upper.apron', 'hold.tray.pastries') });
}

function laneDressing(k: Kit, level: 1 | 2 | 3): void {
  const [x0, x1] = SPAN_X[level] ?? [0, 0];
  const y = LEVEL_Y[level];
  const zFront = FRONT_Z[level] - 0.85;
  const houseFront = rowZ(level) + ROW_DEPTH[level] / 2;
  for (let x = x0 + 4 + level * 2; x < x1 - 3; x += 13) {
    if (FLIGHTS.some((f) => f.from === level - 1 && Math.abs(f.x - x) < 3.5)) continue;
    if (level === 1 && x > -3 && x < 9) continue;
    seatedFree(k, 'bench.park', { x, z: zFront, y }, [clip('sit.talk', 'sit'), 'sit', clip('sit.read', 'sit')], 0.9);
    put(k, 'planter.box', { x: x + 2.4, z: zFront + 0.1, y, tint: CLOTHS[Math.abs(Math.round(x)) % CLOTHS.length] }, 1.2, 0.4);
  }
  for (let x = x0 + 8; x < x1 - 4; x += 17) {
    k.person({ x, z: houseFront + 0.6, y, heading: 0, clip: clip('clean.sweep', 'stand'), hold: holds('upper.apron', 'hold.broom') });
    k.person({ x: x + 0.9, z: houseFront + 1.0, y, face: [x, houseFront + 0.6], clip: 'talk' });
  }
}

function walkers(k: Kit): void {
  const lane0 = 16.7;
  k.walkers([[-37, 0, lane0], [-18, 0, lane0 + 0.3], [2, 0, lane0]], 16, { lanes: [0.5, 1.2], hold: bags });
  k.walkers([[0, 0, lane0], [20, 0, lane0 - 0.3], [39, 0, lane0]], 16, { lanes: [0.5, 1.2], hold: bags });
  ([1, 2, 3] as const).forEach((level) => {
    const [x0, x1] = SPAN_X[level] ?? [0, 0];
    const y = LEVEL_Y[level];
    const z = laneZ(level);
    const mid = (x0 + x1) / 2;
    k.walkers([[x0 + 1.5, y, z], [mid + 1, y, z + 0.2]], 9, { lanes: [0.4, 1.0], hold: bags });
    k.walkers([[mid - 1, y, z - 0.2], [x1 - 1.5, y, z]], 9, { lanes: [0.4, 1.0], hold: bags });
  });
}

function climbers(k: Kit): void {
  for (const f of FLIGHTS) {
    const { bottom, top } = flightEnds(f);
    const y0 = LEVEL_Y[f.from];
    const y1 = y0 + 3;
    const lane = f.w > 3 ? [0.5, 1.1] : [0.42];
    const path: [number, number, number][] =
      f.rot === 0
        ? [[f.x, y0, f.from === 0 ? 17 : laneZ(f.from as 1 | 2)], [bottom[0], y0, bottom[2] + 0.2], [top[0], y1, top[2] - 0.1], [f.x, y1, laneZ((f.from + 1) as 1 | 2 | 3)]]
        : [[bottom[0] + 3, y0, bottom[2] + 2.5], [bottom[0] + 0.2, y0, bottom[2]], [top[0] - 0.1, y1, top[2]], [top[0] - 0.3, y1, laneZ(1)]];
    k.walkers(path, f.w > 3 ? 5 : 4, { lanes: lane, speed: [0.7, 1.0], childShare: 0.2, hold: (rng) => (rng.chance(0.4) ? holds({ key: 'hold.bag', tint: rng.pick(CLOTHS) }) : rng.chance(0.2) ? holds(rng.pick(['hold.basket.produce', 'hold.baguette', 'hold.shoppingbag', 'carry.crate'])) : undefined) });
  }
}

export function streetLife(k: Kit): void {
  groundDressing(k);
  cafeCorner(k);
  ([1, 2, 3] as const).forEach((level) => laneDressing(k, level));
  climbers(k);
  walkers(k);
}

/** Free-ground fills: the ground strip, the belvedere and each terrace lane. */
export function fills(k: Kit, scale: number): void {
  const f1 = FRONT_Z[1];
  k.fill([[-24.2, f1 + 1.3], [38.6, f1 + 1.3], [38.6, 19.4], [-24.2, 19.4]], Math.round(120 * scale), { groupSize: [1, 4] });
  k.fill([[-38.4, 18.5], [-24.6, 18.5], [-24.6, 19.7], [-38.4, 19.7]], Math.round(6 * scale), { groupSize: [1, 3] });
  ([1, 2, 3] as const).forEach((level) => {
    const [x0, x1] = SPAN_X[level] ?? [0, 0];
    const front = rowZ(level) + ROW_DEPTH[level] / 2;
    const n = level === 1 ? 80 : level === 2 ? 70 : 60;
    k.fill([[x0 + 1.5, front + 0.9], [x1 - 1.5, front + 0.9], [x1 - 1.5, FRONT_Z[level] - 1.4], [x0 + 1.5, FRONT_Z[level] - 1.4]], Math.round(n * scale), {
      y: LEVEL_Y[level],
      groupSize: [1, 4],
      clips: ['talk', 'stand', clip('talk.nod', 'talk'), 'point', 'wave', clip('idle.phone', 'stand'), clip('talk.laugh', 'talk')],
    });
  });
}
