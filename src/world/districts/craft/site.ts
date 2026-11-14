/**
 * The construction site: a brick house being raised a storey (timber frame on its roof) behind a
 * three-level scaffold with crews on every deck, a half-built frame next door, the hoist, the
 * cement mixer, brick pallets, the tower crane landmark and the site hoarding.
 */
import { house } from '../../../props/arch/house';
import { hoarding, houseFrame, scaffold } from '../../../props/civic/construction';
import type { Kit } from '../../kit';
import { CRANE, HARD_HAT, PI, SITE, clip, rect } from './plan';

const SCAFFOLD_Z = SITE.z + SITE.d / 2 + 0.75;

/** Brick shell with the new top-storey frame and the crew working on it. */
function shell(k: Kit): void {
  const h = house({
    w: SITE.w,
    d: SITE.d,
    floors: 2,
    wall: 'clayLight',
    roof: 'flat',
    terrace: false,
    chimneys: 0,
    dormers: 0,
    front: { windows: 3, simple: true, door: 'panelled' },
    left: { blank: true },
    right: { blank: true },
    back: { simple: true },
    seed: 777,
  });
  k.add(h.geo, { x: SITE.x, z: SITE.z });
  k.block(SITE.x, SITE.z, SITE.w, SITE.d);
  const fr = houseFrame(SITE.w - 1, SITE.d - 1);
  k.add(fr.geo, { x: SITE.x, z: SITE.z, y: h.roofY });
  const floor = h.roofY + fr.floorY;
  k.surface('roof', rect(SITE.x, SITE.z, SITE.w - 1, SITE.d - 1), floor);
  const crew: ReadonlyArray<readonly [number, number, string, number]> = [
    [-2.2, 1.2, clip('hammer.strike', 'vend.arrange'), PI / 2],
    [0.4, 1.4, 'wave', 0],
    [1.9, -0.6, 'carry.wobble', 0.3],
  ];
  for (const [dx, dz, c, heading] of crew) k.person({ x: SITE.x + dx, z: SITE.z + dz, y: floor, heading, clip: c, look: HARD_HAT });
}

/** Three-level scaffold across the shell's front with workers standing on its decks. */
function scaffolding(k: Kit): void {
  const sc = scaffold(4, 3, { a: 'coral', b: 'ivory' });
  k.add(sc.geo, { x: SITE.x, z: SCAFFOLD_Z });
  k.block(SITE.x, SCAFFOLD_Z, sc.width, 1.0);
  const plan: ReadonlyArray<ReadonlyArray<readonly [number, string, number]>> = [
    [[-2.6, clip('hammer.strike', 'vend.arrange'), PI], [1.6, clip('paint.roller', 'serve.wipe'), PI]],
    [[-0.6, 'point.down', 0.2], [2.9, clip('brick.kneel', 'vend.arrange'), PI]],
    [[-3.0, 'wave', 0], [0.9, 'idle.stretch', 0], [2.6, 'lookout', -0.4]],
  ];
  sc.decks.forEach((d, i) => {
    k.surface('deck', [[SITE.x + d.x0, SCAFFOLD_Z + d.z0], [SITE.x + d.x1, SCAFFOLD_Z + d.z0], [SITE.x + d.x1, SCAFFOLD_Z + d.z1], [SITE.x + d.x0, SCAFFOLD_Z + d.z1]], d.y);
    for (const [x, c, heading] of plan[i] ?? []) {
      k.person({ x: SITE.x + x, z: SCAFFOLD_Z + (d.z0 + d.z1) / 2, y: d.y, heading, clip: c, look: HARD_HAT });
    }
  });
  k.prop('craft.ladderLean13', { x: SITE.x + 4.45, z: SCAFFOLD_Z + 1.2 });
}

/** Half-built timber frame on the ground, east of the shell. */
function groundFrame(k: Kit): void {
  const x = 11.6;
  const z = -24.2;
  const fr = houseFrame(6, 5, 'butterDeep');
  k.add(fr.geo, { x, z });
  k.surface('deck', rect(x, z, 6, 5), fr.floorY);
  k.person({ x: x - 1.6, z: z + 1.6, y: fr.floorY, heading: 0, clip: clip('hammer.kneel', 'point.down'), look: HARD_HAT });
  k.person({ x: x + 0.4, z: z - 0.9, y: fr.floorY, heading: PI / 2, clip: 'vend.arrange', look: { ...HARD_HAT, hatTint: 'coral' } });
  k.person({ x: x - 0.2, z: z + 3.4, heading: PI, clip: 'point', hold: ['upper.apron'], look: { hat: 'hat.hard', hatTint: 'ivory', shirt: 'blue', pattern: 4 } });
}

/** Mixer, pallets, heaps, barriers and the hoarding; crew around the mixer. */
function materials(k: Kit): void {
  k.prop('craft.cementMixer', { x: 6.6, z: -16.8, rot: -0.3 });
  k.person({ x: 6.4, z: -15.7, heading: PI, clip: 'point.down', look: HARD_HAT });
  k.person({ x: 7.9, z: -16.4, heading: -1.6, clip: 'vend.arrange', look: { ...HARD_HAT, shirt: 'coral', pattern: 0 } });
  for (const [x, z] of [[9.3, -14.9], [10.5, -14.9], [9.3, -13.8]] as const) k.prop('craft.brickPallet', { x, z, rot: 0.05 });
  k.prop('craft.sandHeap', { x: 13.9, z: -14.6 });
  k.prop('craft.hoistGantry', { x: 11.6, z: -18.6 });
  k.person({ x: 11.85, z: -17.4, heading: PI, clip: clip('hoist.heave', 'carry.wobble'), look: HARD_HAT });
  k.prop('craft.toolbox', { x: 8.2, z: -19.4, rot: 0.4 });
  k.prop('cart.wheelbarrowSoil', { x: 13.6, z: -17.0, rot: 2.6 });
  for (const x of [0.2, 2.0, 8.4, 10.2, 12.0, 13.8]) k.prop('craft.barrier', { x, z: -12.4 });
  for (const x of [3.4, 7.1]) k.prop('craft.trafficCone', { x, z: -12.0 });
  k.add(hoarding(15.0, 2.2, 'coral', 'ivory'), { x: 15.25, z: -21.2, rot: -PI / 2 });
  k.block(15.25, -21.2, 0.5, 15.0);
}

export function constructionSite(k: Kit): void {
  k.ground([[-1.5, -29], [15.5, -29], [15.5, -12.9], [-1.5, -12.9]], 'sand', 0.03, 0.02);
  k.prop('craft.towerCrane', { x: CRANE.x, z: CRANE.z });
  shell(k);
  scaffolding(k);
  groundFrame(k);
  materials(k);
}
