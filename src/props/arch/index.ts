/**
 * Houses & shops architecture kit: parametric builders (house, rowHouses and their parts) plus
 * registered default variants. See house.ts for the house-space conventions.
 */
import type { PropDef } from '../registry';
import { HOUSE_PROPS } from './defsHouses';
import { PART_PROPS } from './defsParts';

export const PROPS: readonly PropDef[] = [...HOUSE_PROPS, ...PART_PROPS];

export { house, houseExact } from './house';
export { HOUSE_PRESETS } from './defsHouses';
export { HOUSE_BUDGET } from './houseLean';
export { rowHouses } from './rowHouses';
export type { RowHouseInfo, RowHousesOpts, RowHousesResult, RowTerrace } from './rowHouses';
export { windowUnit, shutterPair } from './windows';
export type { WindowOpts } from './windows';
export { doorUnit } from './doors';
export type { DoorOpts } from './doors';
export { awning } from './awnings';
export type { AwningOpts } from './awnings';
export { balconyUnit } from './balcony';
export type { BalconyOpts } from './balcony';
export { windowBox, flowerRow } from './flowers';
export type { WindowBoxOpts } from './flowers';
export { bracketSign, fascia } from './signs';
export type { FasciaOpts } from './signs';
export { emblem } from './emblems';
export { displayShelf, sandwichBoard } from './displays';
export { shopfront, SHOP_RECESS } from './shopfront';
export type { ShopfrontResult, ShopfrontSpec } from './shopfront';
export { externalStair, portico, arcadeBay } from './elements';
export type { StairOpts, StairResult } from './elements';
export { gardenWall, pergola } from './garden';
export type { GardenWallOpts } from './garden';
export { waterTank, roofPlanter, skylight, pigeonLoft, weathervane, flagPole, lanternPosts } from './rooftop';
export { chimney } from './chimney';
export { SIGN_KINDS } from './types';
export type {
  Anchor,
  AwningKind,
  BalconyAnchor,
  DisplayKind,
  DoorAnchor,
  DoorKind,
  FacadeOpts,
  FacadeSide,
  HouseOpts,
  HouseResult,
  RoofKind,
  ShopOpts,
  SignKind,
  TerraceInfo,
  WindowStyle,
} from './types';
