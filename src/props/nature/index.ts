/**
 * Nature library: trees, topiary, hedges, flowers, garden pieces, animals and airborne festive things.
 * Every prop is authored in two quality passes (see kit.ts `tiered`): a near-only HI mesh and a
 * far-only LO stand-in (≤ 35 % of the HI triangles). Foliage, cloth and tails carry sway; canopies,
 * blooms, coats, kites and balloon gores are tint-masked.
 */
import type { PropDef } from '../registry';
import { ANIMAL_PROPS } from './defs-animals';
import { GARDEN_PROPS } from './defs-garden';
import { TREE_PROPS } from './defs-trees';

export const PROPS: readonly PropDef[] = [...TREE_PROPS, ...GARDEN_PROPS, ...ANIMAL_PROPS];

export { type TreeKind, type TreeOptions, TREE_HEIGHTS, tree, treeFootprint } from './trees';
export { type HedgeTop, type P2, boxBorder, flowerBorder, hedge, hedgeCorner, hedgeRun, mazeWall } from './hedges';
export { flowerBed } from './flowers';
export { HORSE_SEAT_Y } from './animals/farm';
export { BALLOON_SEATS } from './airborne';
