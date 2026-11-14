/**
 * Beach promenade — the seaside edge of the festival town.
 *
 * Three height bands (district-local metres, anchor world 78,58, rotation 0):
 * - the promenade on land (y = 0) north of the sea wall: striped railing, stairs down, kiosks,
 *   shelters, benches, the pier entrance arch and a steady stream of strollers;
 * - the sand (y = -0.7): beach huts backing onto the sea wall, then family camps edge to edge,
 *   volleyball, the lifeguard tower, sand sculptures, donkey rides and the microstories;
 * - the sea (water y = -1) about 25 m out: waders, swimmers, rafts, pedal boats, kayaks, buoy
 *   lines, gulls — and the pleasure pier with its domed pavilion reaching out near world x = 95.
 */
import type { Kit } from '../kit';
import { CLIP } from './beach/clips';
import { EAST_X, PIER, SAND_Y, alongShore, northEdgeZ, promBand, sandPolygon, sandZ, shoreZ } from './beach/frame';
import { HOLD, hold, opt } from './beach/holds';
import { buildPier } from './beach/pier';
import { buildPromenade } from './beach/promenade';
import { buildSand, fillSand } from './beach/sand';
import { buildSea } from './beach/sea';
import { registerSpots, reserveSpots } from './beach/spots';
import { buildMoreStories } from './beach/storiesMore';
import { buildSandStories } from './beach/storiesSand';
import { zone } from './beach/zones';

function paving(k: Kit): void {
  const shore = alongShore(-66, EAST_X + 2.5, 4, -0.02).map(([x, , z]) => [x, z] as const);
  const back = [...shore].reverse().map(([x]) => [x, Math.max(northEdgeZ(x) + 0.4, shoreZ(x) - 9)] as const);
  k.ground([...shore, ...back], 'clayLight');
  const lane = alongShore(-52, EAST_X + 2.5, 4, -1.4).map(([x, , z]) => [x, z] as const);
  const lane2 = [...lane].reverse().map(([x, z]) => [x, z - 1.8] as const);
  k.ground([...lane, ...lane2], 'butterLight', 0.03, 0.02);
  k.surface('sand', sandPolygon(), SAND_Y);
}

function eastGuard(k: Kit): void {
  const zn = zone('lifeguard-east');
  const x = (zn.x0 + zn.x1) / 2;
  const z = sandZ(x, 0.78);
  k.prop('beach.lifeguardtower', { x, z, y: SAND_Y, rot: -0.2 });
  k.person({ x, z: z + 0.1, y: SAND_Y + 2.62 - 0.47, heading: -0.2, clip: CLIP.sit, blob: 0, hold: hold(HOLD.binoculars, HOLD.whistle), look: { hat: opt('hat.visor'), hatTint: 'coral', shirt: 'coral', pattern: 0 } });
  k.prop('beach.lifeguardflag', { x: x + 1.8, z: z + 1.2, y: SAND_Y });
  k.prop('beach.shower', { x: x - 2.2, z: z - 2.6, y: SAND_Y });
  k.person({ x: x - 2.2, z: z - 2.45, y: SAND_Y, heading: 0.2, clip: CLIP.idleStretch, look: { longLegs: false, longSleeves: false } });
  k.queue([x - 2.2, z - 0.4], [x - 2.2, z - 2.0], 2, { y: SAND_Y, clips: [CLIP.stand, CLIP.impatient] });
  k.prop('beach.changingscreen', { x: x + 2.4, z: z - 2.4, y: SAND_Y, rot: 0.3 });
}

/** sociable groups on the landward side of the promenade walk and on the pier head */
function fillPromenade(k: Kit): void {
  const clips = [CLIP.talk, CLIP.stand, CLIP.eatIce, CLIP.laugh, CLIP.idlePhone, CLIP.photo, CLIP.drink, CLIP.lookout];
  const strip = alongShore(-30, EAST_X, 4, -3.4).map(([x, , z]) => [x, z] as const);
  const north = [...strip].reverse().map(([x]) => [x, promBand(x)[0]] as const);
  k.fill([...strip, ...north], 60, { clips, groupSize: [1, 3] });
  const h = PIER.head;
  k.fill([[h.x0 + 0.6, h.z0 + 0.6], [h.x1 - 0.6, h.z0 + 0.6], [h.x1 - 0.6, h.z1 - 0.6], [h.x0 + 0.6, h.z1 - 0.6]], 14, { clips, groupSize: [1, 3], y: PIER.deckY });
}

export function buildBeach(k: Kit): void {
  reserveSpots(k);
  paving(k);
  buildPier(k);
  buildPromenade(k);
  buildSandStories(k);
  buildMoreStories(k);
  eastGuard(k);
  buildSand(k);
  buildSea(k);
  fillSand(k, 420);
  fillPromenade(k);
  registerSpots(k);
}
