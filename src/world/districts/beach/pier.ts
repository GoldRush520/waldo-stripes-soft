/**
 * The pleasure pier: a long deck on piles from the promenade out over the sand and the sea, a wide
 * T-head carrying the onion-domed pavilion, anglers along the rails, strollers, a moored dinghy.
 * The deck top is flush with the promenade (y = 0), so the pier is placed with its waterline base
 * at SEA_Y and deckY = 1.
 */
import { pleasurePier } from '../../../props/civic';
import { promenadeRailing } from '../../../props/leisure';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { CLIP } from './clips';
import { HOLD, hold } from './holds';
import { PIER, SEA_Y } from './frame';
import { seatProp } from './place';

const H = PIER.head;

function deck(k: Kit): void {
  const len = PIER.z1 - PIER.z0;
  const main = pleasurePier(len, { width: PIER.width, deckY: PIER.deckY - SEA_Y, rail: 'ivory' });
  k.add(main.geo, { x: PIER.x, z: (PIER.z0 + PIER.z1) / 2, y: SEA_Y });
  const head = pleasurePier(H.z1 - H.z0, { width: H.x1 - H.x0, deckY: PIER.deckY - SEA_Y, rail: 'ivory' });
  k.add(head.geo, { x: (H.x0 + H.x1) / 2, z: (H.z0 + H.z1) / 2, y: SEA_Y });
  const w = PIER.width / 2;
  k.surface('pier', [[PIER.x - w, PIER.z0 - 0.2], [PIER.x + w, PIER.z0 - 0.2], [PIER.x + w, H.z0], [PIER.x - w, H.z0]], PIER.deckY);
  k.surface('pier', [[H.x0, H.z0], [H.x1, H.z0], [H.x1, H.z1], [H.x0, H.z1]], PIER.deckY);
  /* rails closing the head where the main deck does not continue, and across the sea end */
  const wing = H.x1 - (PIER.x + w);
  const wingRail = promenadeRailing(wing - 0.2);
  for (const s of [-1, 1]) {
    const x = PIER.x + s * (w + wing / 2);
    k.add(wingRail, { x, z: H.z0 + 0.12 });
    k.block(x, H.z0 + 0.12, wing, 0.16);
  }
  const endRail = promenadeRailing(H.x1 - H.x0 - 0.3);
  k.add(endRail, { x: (H.x0 + H.x1) / 2, z: H.z1 - 0.12 });
  k.block((H.x0 + H.x1) / 2, H.z1 - 0.12, H.x1 - H.x0, 0.16);
  for (const x of [H.x0 + 0.1, H.x1 - 0.1]) k.block(x, (H.z0 + H.z1) / 2, 0.16, H.z1 - H.z0);
  for (const x of [PIER.x - w + 0.1, PIER.x + w - 0.1]) k.block(x, (PIER.z0 + PIER.z1) / 2, 0.16, PIER.z1 - PIER.z0);
}

function furniture(k: Kit): void {
  const p = PIER.pavilion;
  k.prop('pavilion.pier', { x: p.x, z: p.z, y: PIER.deckY, tint: 'coral' });
  k.prop('beach.telescope', { x: H.x1 - 0.7, z: H.z1 - 0.7, y: PIER.deckY });
  k.prop('pier.rodholders', { x: H.x1 - 0.45, z: 31.5, y: PIER.deckY, rot: Math.PI / 2 });
  k.prop('pier.rodholders', { x: H.x0 + 0.45, z: 36.5, y: PIER.deckY, rot: -Math.PI / 2 });
  k.prop('cart.icecream', { x: H.x0 + 1.4, z: H.z0 + 1.3, y: PIER.deckY, rot: Math.PI / 2 });
  k.person({ x: H.x0 + 2.25, z: H.z0 + 1.3, y: PIER.deckY, heading: -Math.PI / 2, clip: CLIP.handover, hold: ['upper.apron'], look: { hat: 'hat.sailor', hatTint: 'ivory' } });
  for (const z of [12]) k.prop('bench.park', { x: PIER.x - PIER.width / 2 + 0.55, z, y: PIER.deckY, rot: Math.PI / 2 });
  /* a moored dinghy bobbing against the east side of the head */
  const m = k.bob([H.x1 + 1.3, SEA_Y, 33], 0, 0.9, 0.3, 0.05, 0.04, 4);
  k.dynamic('boat.dinghy', m, { tint: 'coral' });
}

function anglers(k: Kit): void {
  const east: ReadonlyArray<readonly [number, string]> = [[29.6, CLIP.fishCast], [33.4, CLIP.fishHaul], [38.6, CLIP.fishCast]];
  for (const [z, clip] of east) {
    k.person({ x: H.x1 - 0.55, z, y: PIER.deckY, heading: Math.PI / 2, clip, hold: hold(HOLD.rod), look: { hat: k.rng.pick(['hat.bucket', 'hat.cap', 'hat.fedora']), hatTint: k.rng.pick(CLOTHS) } });
  }
  for (const z of [30.4, 34.6]) {
    k.person({ x: H.x0 + 0.55, z, y: PIER.deckY, heading: -Math.PI / 2, clip: CLIP.fishCast, hold: hold(HOLD.rod), look: { hat: 'hat.bucket', hatTint: 'sage' } });
  }
  /* rail leaners along the main deck */
  for (const z of [2, 7.5, 15, 23.5]) {
    const side = z % 2 === 0 ? 1 : -1;
    k.person({ x: PIER.x + side * (PIER.width / 2 - 0.5), z, y: PIER.deckY, heading: side * Math.PI / 2, clip: k.rng.pick([CLIP.lookout, CLIP.point, CLIP.photo]) });
  }
  seatProp(k, 'bench.park', { x: PIER.x - PIER.width / 2 + 0.55, z: 4, y: PIER.deckY, rot: Math.PI / 2 }, { clips: [CLIP.sitTalk, CLIP.sitEat], fill: 1 });
  seatProp(k, 'bench.park', { x: PIER.x - PIER.width / 2 + 0.55, z: 20, y: PIER.deckY, rot: Math.PI / 2 }, { clips: [CLIP.sitRead, CLIP.sitAsleep], fill: 0.6, age: 'elder' });
}

function strollers(k: Kit): void {
  k.walkers([[PIER.x, PIER.deckY, PIER.z0 - 2.4], [PIER.x + 0.2, PIER.deckY, 12], [PIER.x, PIER.deckY, PIER.z1 - 0.4]], 16, {
    lanes: [0.5, 1.3],
    speed: [0.6, 1.05],
    hold: (rng) => (rng.chance(0.3) ? [{ key: 'hold.balloon', tint: rng.pick(CLOTHS) }] : undefined),
  });
  k.group(H.x1 - 2.2, 35.6, 3, { y: PIER.deckY, clips: [CLIP.talk, CLIP.photo, CLIP.laugh] });
}

export function buildPier(k: Kit): void {
  deck(k);
  furniture(k);
  anglers(k);
  strollers(k);
}
