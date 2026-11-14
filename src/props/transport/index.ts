/**
 * Transport library: boats, harbour gear, wheeled things people ride or push, tram.
 *
 * Exports the registered PROPS plus parametric builders (each returns a finished two-tier Geo:
 * near detail tagged `detail()`, coarse stand-in tagged `farOnly()`), and the prop-space anchors
 * the engine needs to attach moving parts and people.
 */
import type { Col, Geo } from '../../core/geo';
import type { PropDef } from '../registry';
import { tiered } from './kit';
import { BOAT_PROPS } from './defs-boats';
import { HARBOUR_PROPS } from './defs-harbour';
import { WHEELED_PROPS } from './defs-wheeled';
import { TRAM_PROPS } from './defs-tram';
import { type SailboatOptions, sailboat as buildSailboat } from './sailboat';
import { type FloatFigure, paradeFloat as buildParadeFloat } from './floats';
import { luggageTrolleyHeaped, suitcases } from './trolleys';
import { tramCar } from './tram';
import { type BarrowLoad, wheelbarrow as buildWheelbarrow } from './carts';

export const PROPS: readonly PropDef[] = [...BOAT_PROPS, ...HARBOUR_PROPS, ...WHEELED_PROPS, ...TRAM_PROPS];

/** Sailboat of any length; `sailTint` bakes the sail stripes, otherwise they stay tint-masked. */
export function sailboat(o: SailboatOptions = {}): Geo {
  return tiered((q) => buildSailboat(q, o));
}

/** One of the four boat-parade floats (8 m barge + giant figure + pennants). */
export function paradeFloat(figure: FloatFigure): Geo {
  return tiered((q) => buildParadeFloat(q, figure));
}

/** Seeded heap of `count` suitcases resting on y = 0 (half of them tint-masked). */
export function luggageHeap(count: number, seed: number): Geo {
  return tiered((q) => suitcases(q, count, seed));
}

/** Luggage trolley heaped with a seeded suitcase pile. */
export function luggageTrolley(count: number, seed: number): Geo {
  return tiered((q) => luggageTrolleyHeaped(q, count, seed));
}

/** Tram car with its tint-masked body pre-coloured (for fleets that skip per-instance tint). */
export function tram(bodyCol: Col): Geo {
  return tiered((q) => tramCar(q, bodyCol));
}

export function wheelbarrow(load: BarrowLoad): Geo {
  return tiered((q) => buildWheelbarrow(q, load));
}

export type { SailboatOptions, FloatFigure, BarrowLoad };
export { BUDGETS, seatKindsOf } from './defs';
export type { Seat, SeatKind, SizeClass, Family } from './defs';
export { ROWBOAT_OARLOCKS } from './boats-small';
export { CRANE_JIB_TIP } from './harbour-crane';
export { CATENARY_WIRE, CROSSING_PIVOT } from './tramway';
export {
  HAND_CART_HANDLE,
  BREAD_CART_HANDLE,
  WHEELBARROW_HANDLE,
} from './carts';
export { LUGGAGE_HANDLE, SACK_TRUCK_HANDLE, SHOPPING_HANDLE } from './trolleys';
export { PRAM_HANDLE, STROLLER_HANDLE, WHEELCHAIR_HANDLE } from './prams';
