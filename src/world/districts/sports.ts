/**
 * Sports & Playground — a long strip (~130 × 19 m usable) between the funfair (north) and the beach
 * promenade (south). West -> east it is a sequence of separate venues divided by tree lines,
 * fences and spectator clusters (see sports/plan.ts): skate & wheels corner, fenced playground,
 * football pitch with bleachers, the green (tug-of-war + yoga), clay tennis court, basketball
 * half-court; a two-lane running track runs along the south edge for joggers and cyclists.
 */
import type { Kit } from '../kit';
import { clip } from './sports/catalog';
import { buildCourts } from './sports/courts';
import { buildExtras } from './sports/extras';
import { buildFlows, buildSpots } from './sports/flows';
import { buildGreen } from './sports/green';
import { buildPitch } from './sports/pitch';
import { rect, treeLine } from './sports/plan';
import { buildPlayground } from './sports/playground';
import { buildSkate } from './sports/skate';

/** District polygon in local coordinates (world polygon minus the anchor 80,32). */
const OUTLINE: ReadonlyArray<readonly [number, number]> = [
  [-58, -12],
  [55, -12],
  [55, 12],
  [-50, 12],
  [-64, 6],
  [-76, 6],
  [-83, -12],
];

function scenery(k: Kit): void {
  k.ground(OUTLINE, 'sageLight');
  treeLine(k, -54.4, [-8.4, -4.6, 3.0], ['tree.round.m', 'tree.birch']);
  treeLine(k, -27.6, [-8.6, -4.8, 4.4], ['tree.blossom', 'tree.round.s']);
  treeLine(k, -1.0, [-8.8, -4.6, 4.4], ['tree.round.m', 'tree.lollipop']);
  treeLine(k, 15.4, [-8.6, -4.4, 4.0], ['tree.birch', 'tree.blossom.butter']);
  for (const x of [-36, -6, 24, 44]) k.prop('lamp.classic', { x, z: 7.05 });
  for (const x of [-60, -24, 8, 40]) k.prop('bin.litter', { x, z: 6.95 });
}

/** Spectators and passers-by topping up every open patch after the staged scenes. */
function crowds(k: Kit): void {
  const watch = ['cheer', 'talk', 'stand', 'lookout', 'point', clip('cheer.clap', 'cheer'), clip('idle.watch', 'lookout'), clip('eat.icecream', 'talk')];
  const chat = ['talk', 'stand', 'wave', clip('talk.laugh', 'talk'), clip('idle.phone', 'stand'), clip('drink.cup', 'talk')];
  const zones: ReadonlyArray<readonly [Array<[number, number]>, number, readonly string[]]> = [
    [rect(-77, -9.2, -56.5, 3), 80, chat],
    [rect(-52, -9.2, -30, 6.2), 90, chat],
    [rect(-26, 5.5, -2.4, 7.3), 50, watch],
    [rect(-26.4, -7.6, -2.2, -6.9), 10, watch],
    [rect(0.4, -9.2, 14.8, 6.8), 90, watch],
    [rect(16.4, -9.4, 42.6, -7.4), 30, watch],
    [rect(16.4, 5.5, 42.6, 7.3), 50, watch],
    [rect(43.6, -8.2, 52.4, 6.8), 55, chat],
  ];
  for (const [poly, n, clips] of zones) k.fill(poly, n, { clips, groupSize: [2, 5], childShare: 0.25 });
}

export function buildSports(k: Kit): void {
  scenery(k);
  buildSkate(k);
  buildPlayground(k);
  buildPitch(k);
  buildGreen(k);
  buildCourts(k);
  buildExtras(k);
  buildFlows(k);
  crowds(k);
  buildSpots(k);
}
