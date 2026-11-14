/**
 * Street library: market stalls and goods, market clutter, café & bakery, street furniture,
 * fountains, festival dressing and the bookshop domino set.
 */
import type { PropDef } from '../registry';
import { BAKERY_PROPS } from './bakery';
import { BOOKSHOP_PROPS } from './bookshop';
import { CAFE_FURNITURE_PROPS } from './cafe-furniture';
import { CART_PROPS } from './cafe-carts';
import { COMEDY_PROPS } from './clutter-comedy';
import { CONTAINER_PROPS } from './clutter-containers';
import { MARKET_CLUTTER_PROPS } from './clutter-market';
import { FESTIVAL_PROPS } from './festival-props';
import { FOUNTAIN_PROPS } from './fountains';
import { FURNITURE_PROPS } from './furniture';
import { SIGN_PLANTER_PROPS } from './signs-planters';
import { STALL_PROPS } from './stall-props';
import { TABLETOP_PROPS } from './tabletop';

export const PROPS: readonly PropDef[] = [
  ...STALL_PROPS,
  ...CONTAINER_PROPS,
  ...MARKET_CLUTTER_PROPS,
  ...COMEDY_PROPS,
  ...CAFE_FURNITURE_PROPS,
  ...TABLETOP_PROPS,
  ...BAKERY_PROPS,
  ...CART_PROPS,
  ...FURNITURE_PROPS,
  ...SIGN_PLANTER_PROPS,
  ...FOUNTAIN_PROPS,
  ...FESTIVAL_PROPS,
  ...BOOKSHOP_PROPS,
];

export { type AwningStyle, gores, stripedSlab, valance } from './awning';
export { bookshelfLean, SHELF_D, SHELF_H, SHELF_W } from './bookshop';
export { wheel, sideWheel } from './cafe-carts';
export { bistroChair, parasol, roundTable, TABLE_TOP_Y } from './cafe-furniture';
export { barrel, crate, sackOpen, sackTied, wickerBasket } from './clutter-containers';
export {
  type BannerOptions,
  type BuntingOptions,
  type LaundryOptions,
  type LineOptions,
  type LineResult,
  banner,
  bunting,
  lanternString,
  laundryLine,
  stringLights,
} from './festival-lines';
export {
  type StageOptions,
  type StageResult,
  balloonArch,
  festivalGate,
  flagPole,
  lectern,
  maypole,
  stage,
  ticketBooth,
  winnersPodium,
} from './festival-structures';
export { hangingBasket } from './furniture';
export { type GoodsHeapOptions, type GoodsKind, GOODS_KINDS, goodsHeap } from './goods';
export { BUDGETS, type Budget, type GroundSpot, type Seat, type V3 } from './kit';
export { type StallOptions, type StallResult, STALL_COUNTER_Y, STALL_DEPTH, stall, stallFootprint } from './stall';
