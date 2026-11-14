/** PropDefs: topiary, hedges, arbours, flowers, ground plants, kitchen garden and garden pieces. */
import type { PropDef } from '../registry';
import { roseArch, trellis, vinePergola } from './arbours';
import { def } from './def';
import { clumpDaisy, clumpRound, clumpSpires, flowerBed, hydrangea, lavender, roseBush, sunflowers, tulipRow } from './flowers';
import { birdBath, boxHive, compost, driftwood, gnome, pebbles, rock, rockCluster, skep, urn } from './garden';
import { agave, cactusColumn, cactusPaddle, fern, grassTufts, lilyPads, reeds } from './ground-plants';
import { boxBorder, flowerBorder, hedge, hedgeCorner, mazeWall } from './hedges';
import { beanWigwam, cabbageRow, prizeMarrow, pumpkinPatch, seedlingBench, tomatoCanes, vegBed } from './veg';
import { archTopiary, ballStack, coneTopiary, cubeTopiary, spiral } from './topiary';
import {
  elephantTopiary,
  escapedTopiary,
  knightTopiary,
  peacock,
  rabbitTopiary,
  snailTopiary,
  swanTopiary,
  teapotTopiary,
} from './topiary-figures';

const TOPIARY = ['topiary', 'garden', 'botanical'];

const topiary: readonly PropDef[] = [
  def('topiary.ballstack', ballStack, [0.7, 0.7], { tint: 'sage', tags: TOPIARY }),
  def('topiary.spiral', spiral, [0.7, 0.7], { tint: 'sage', tags: TOPIARY }),
  def('topiary.cone', coneTopiary, [1.2, 1.2], { tint: 'sage', tags: TOPIARY }),
  def('topiary.cube', cubeTopiary, [1.0, 1.0], { tint: 'sage', tags: TOPIARY }),
  def('topiary.arch', archTopiary, [0, 0], { tint: 'sage', tags: [...TOPIARY, 'walk-through'] }),
  def('topiary.peacock', peacock, [0.9, 0.6], { tint: 'sage', tags: TOPIARY }),
  def('topiary.rabbit', rabbitTopiary, [1.0, 1.1], { tint: 'sage', tags: TOPIARY }),
  def('topiary.elephant', elephantTopiary, [1.0, 1.3], { tint: 'sage', tags: TOPIARY }),
  def('topiary.swan', swanTopiary, [1.0, 1.5], { tint: 'sage', tags: TOPIARY }),
  def('topiary.teapot', teapotTopiary, [1.4, 1.4], { tint: 'sage', tags: TOPIARY }),
  def('topiary.knight', knightTopiary, [1.2, 1.2], { tint: 'sage', tags: TOPIARY }),
  def('topiary.snail', snailTopiary, [0.8, 1.6], { tint: 'sage', tags: TOPIARY }),
  def('topiary.escaped', escapedTopiary, [0.6, 1.0], { tint: 'sage', tags: [...TOPIARY, 'story', 'comedy'] }),
];

const HEDGE = ['hedge', 'garden'];

const hedges: readonly PropDef[] = [
  { key: 'hedge.clipped.2', build: () => hedge(2), footprint: [2, 0.6], defaultTint: 'sage', tags: ['nature', ...HEDGE] },
  { key: 'hedge.clipped.4', build: () => hedge(4), footprint: [4, 0.6], defaultTint: 'sage', tags: ['nature', ...HEDGE] },
  { key: 'hedge.corner', build: () => hedgeCorner(2, 2), footprint: [2.6, 2.6], defaultTint: 'sage', tags: ['nature', ...HEDGE] },
  { key: 'hedge.maze.2', build: () => mazeWall(2), footprint: [2, 0.7], defaultTint: 'sageDeep', tags: ['nature', ...HEDGE, 'maze'] },
  { key: 'hedge.maze.4', build: () => mazeWall(4), footprint: [4, 0.7], defaultTint: 'sageDeep', tags: ['nature', ...HEDGE, 'maze'] },
  { key: 'hedge.box.2', build: () => boxBorder(2), footprint: [2, 0.3], defaultTint: 'sage', tags: ['nature', ...HEDGE, 'border'] },
  { key: 'hedge.box.4', build: () => boxBorder(4), footprint: [4, 0.3], defaultTint: 'sage', tags: ['nature', ...HEDGE, 'border'] },
  { key: 'hedge.flowers.3', build: () => flowerBorder(3, 0.6, 7), footprint: [3, 0.6], defaultTint: 'coral', tags: ['nature', 'flowers', 'border'] },
];

const arbours: readonly PropDef[] = [
  def('arbour.rose', roseArch, [0, 0], { tint: 'coral', tags: ['garden', 'walk-through', 'flowers'] }),
  def('arbour.pergola', vinePergola, [0, 0], { tint: 'sage', tags: ['garden', 'walk-through', 'shade'] }),
  def('arbour.trellis', trellis, [1.9, 0.12], { tint: 'butter', tags: ['garden', 'wall'] }),
];

const FLOWER = ['flowers', 'garden'];

const plants: readonly PropDef[] = [
  def('plant.flowers.a', clumpRound, [0.6, 0.6], { tint: 'coral', tags: FLOWER }),
  def('plant.flowers.b', clumpSpires, [0.5, 0.5], { tint: 'blue', tags: FLOWER }),
  def('plant.flowers.c', clumpDaisy, [0.8, 0.8], { tint: 'ivory', tags: FLOWER }),
  def('plant.tulips', tulipRow, [1.6, 0.3], { tint: 'coral', tags: FLOWER }),
  def('plant.sunflowers', sunflowers, [0.6, 0.4], { tint: 'butter', tags: FLOWER }),
  def('plant.lavender', lavender, [0.7, 0.7], { tint: 'blue', tags: FLOWER }),
  def('plant.rosebush', roseBush, [0.8, 0.8], { tint: 'coral', tags: FLOWER }),
  def('plant.hydrangea', hydrangea, [0.9, 0.9], { tint: 'blueLight', tags: FLOWER }),
  def('plant.fern', fern, [0.6, 0.6], { tags: ['plant', 'shade'] }),
  def('plant.agave', agave, [0.8, 0.8], { tags: ['plant', 'dry'] }),
  def('plant.cactus.column', cactusColumn, [0.34, 0.34], { tags: ['plant', 'dry'] }),
  def('plant.cactus.paddle', cactusPaddle, [0.4, 0.4], { tint: 'butter', tags: ['plant', 'dry', 'potted'] }),
  def('plant.grass', grassTufts, [0.6, 0.4], { tags: ['plant'] }),
  def('plant.reeds', reeds, [0.6, 0.5], { tags: ['plant', 'waterside'] }),
  def('plant.lilypads', lilyPads, [0, 0], { tint: 'coralLight', tags: ['plant', 'water', 'walk-through'], float: true }),
  { key: 'garden.flowerbed', build: () => flowerBed(2, 1.2, 5), footprint: [2, 1.2], defaultTint: 'coral', tags: ['nature', ...FLOWER] },
];

const VEG = ['vegetable', 'garden', 'allotment'];

const veg: readonly PropDef[] = [
  def('veg.pumpkins', pumpkinPatch, [1.2, 1.2], { tags: VEG }),
  def('veg.cabbages', cabbageRow, [2.0, 0.45], { tags: VEG }),
  def('veg.tomatoes', tomatoCanes, [1.4, 0.4], { tags: VEG }),
  def('veg.beans', beanWigwam, [1.1, 1.1], { tint: 'coral', tags: VEG }),
  def('veg.bed', vegBed, [2.0, 1.0], { tags: VEG }),
  def('veg.seedlings', seedlingBench, [1.6, 0.6], { tags: VEG }),
  def('veg.marrow', prizeMarrow, [1.3, 0.7], { tint: 'coral', tags: [...VEG, 'fair', 'story'] }),
];

const garden: readonly PropDef[] = [
  def('garden.gnome', gnome, [0.3, 0.3], { tint: 'coral', tags: ['garden', 'ornament'] }),
  def('garden.birdbath', birdBath, [0.4, 0.4], { tags: ['garden', 'ornament'] }),
  def('garden.urn', urn, [0.5, 0.5], { tint: 'sage', tags: ['garden', 'ornament'] }),
  def('garden.beehive.skep', skep, [0.8, 0.8], { tags: ['garden', 'bees'] }),
  def('garden.beehive.box', boxHive, [0.6, 0.6], { tags: ['garden', 'bees'] }),
  def('garden.compost', compost, [1.2, 1.15], { tags: ['garden', 'allotment'] }),
  def('garden.driftwood', driftwood, [1.6, 0.3], { tags: ['beach'] }),
  def('rock.s', (q) => rock(q, 0.25, 1), [0.4, 0.35], { tags: ['rock'] }),
  def('rock.m', (q) => rock(q, 0.55, 2), [0.9, 0.8], { tags: ['rock'] }),
  def('rock.l', (q) => rock(q, 1.1, 3), [1.8, 1.6], { tags: ['rock'] }),
  def('rock.cluster', rockCluster, [1.8, 1.4], { tags: ['rock'] }),
  def('rock.pebbles', pebbles, [0, 0], { tags: ['rock', 'beach', 'walk-through'] }),
];

export const GARDEN_PROPS: readonly PropDef[] = [...topiary, ...hedges, ...arbours, ...plants, ...veg, ...garden];
