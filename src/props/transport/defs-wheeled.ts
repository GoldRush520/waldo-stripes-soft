/**
 * PropDefs for wheeled things people ride or push. Pushed props carry a `handle:x,y,z` tag and
 * their pusher's standing spot as a `feet` seat behind the handle; riders get `hip` seats.
 */
import type { PropDef } from '../registry';
import { type Seat, type TransportSpec, def, feet, hip } from './defs';
import type { V3 } from './kit';
import { bicycle, cargoTrike, pedicab, tandem, tricycle } from './cycles';
import { deliveryVan, kickScooter, milkFloat, skateboard, vespa } from './motors';
import { BREAD_CART_HANDLE, HAND_CART_HANDLE, WHEELBARROW_HANDLE, breadCart, flowerCart, handCart, wheelbarrow } from './carts';
import { LUGGAGE_HANDLE, SACK_TRUCK_HANDLE, SHOPPING_HANDLE, luggageTrolley, luggageTrolleyHeaped, sackTruck, shoppingTrolley } from './trolleys';
import { PRAM_HANDLE, STROLLER_HANDLE, WHEELCHAIR_HANDLE, pram, stroller, wheelchair } from './prams';

/** The pusher stands ~0.35 m behind the handle, facing +z. */
function pusher(h: V3): Seat {
  return feet(h[0], 0, h[2] - 0.35, 0);
}

type PushSpec = Omit<TransportSpec, 'family' | 'handle'> & { readonly handle: V3 };

function pushed(s: PushSpec): PropDef {
  return def({ ...s, family: 'wheeled', seats: [...(s.seats ?? []), pusher(s.handle)] });
}

function ridden(s: Omit<TransportSpec, 'family'>): PropDef {
  return def({ ...s, family: 'wheeled' });
}

export const WHEELED_PROPS: readonly PropDef[] = [
  ridden({ key: 'vehicle.bicycle', build: (q) => bicycle(q), footprint: [0.56, 1.75], size: 'small', tint: 'coral', seats: [hip(0, 0.9, -0.27)], tags: ['bike'] }),
  ridden({ key: 'vehicle.bicycleBasket', build: (q) => bicycle(q, { basket: true }), footprint: [0.56, 1.8], size: 'small', tint: 'sage', seats: [hip(0, 0.9, -0.27)], tags: ['bike'] }),
  ridden({ key: 'vehicle.tandem', build: tandem, footprint: [0.56, 2.4], size: 'small', tint: 'blue', seats: [hip(0, 0.9, 0.12), hip(0, 0.9, -0.62)], tags: ['bike'] }),
  ridden({ key: 'vehicle.tricycle', build: tricycle, footprint: [0.56, 0.85], size: 'small', tint: 'coral', seats: [hip(0, 0.43, -0.1)], tags: ['bike', 'child'] }),
  ridden({ key: 'vehicle.cargoTrike', build: cargoTrike, footprint: [1.1, 1.95], size: 'small', tint: 'coral', seats: [hip(0, 0.92, -0.5)], tags: ['bike', 'vendor', 'icecream'] }),
  ridden({ key: 'vehicle.scooter', build: vespa, footprint: [0.62, 1.5], size: 'small', tint: 'sage', seats: [hip(0, 0.8, -0.2), hip(0, 0.8, -0.52)], tags: ['motor'] }),
  ridden({ key: 'vehicle.kickScooter', build: kickScooter, footprint: [0.4, 0.8], size: 'furniture', tint: 'blue', seats: [feet(0, 0.11, -0.08)], tags: ['child'] }),
  ridden({ key: 'vehicle.skateboard', build: skateboard, footprint: [0.22, 0.8], size: 'furniture', tint: 'coral', seats: [feet(0, 0.1, 0, Math.PI / 2)], tags: ['board'] }),
  ridden({ key: 'vehicle.pedicab', build: pedicab, footprint: [1.4, 2.4], size: 'small', tint: 'coral', seats: [hip(0, 0.92, 0.5), hip(-0.25, 0.62, -0.2), hip(0.25, 0.62, -0.2)], tags: ['bike', 'taxi'] }),
  ridden({ key: 'vehicle.deliveryVan', build: deliveryVan, footprint: [1.45, 2.65], size: 'small', tint: 'butter', seats: [hip(0, 0.8, 0.7)], tags: ['motor', 'delivery'] }),
  ridden({ key: 'vehicle.milkFloat', build: milkFloat, footprint: [1.55, 3.25], size: 'small', tint: 'sage', seats: [hip(0.25, 0.9, 0.7)], tags: ['motor', 'delivery'] }),
  pushed({ key: 'cart.hand', build: (q) => handCart(q, false), footprint: [1.25, 2.1], size: 'medium', handle: HAND_CART_HANDLE, tags: ['market'] }),
  pushed({ key: 'cart.handLoaded', build: (q) => handCart(q, true), footprint: [1.25, 2.1], size: 'medium', tint: 'coral', handle: HAND_CART_HANDLE, tags: ['market'] }),
  pushed({ key: 'cart.flower', build: flowerCart, footprint: [1.25, 2.1], size: 'medium', tint: 'sage', handle: HAND_CART_HANDLE, tags: ['market', 'vendor'] }),
  pushed({ key: 'cart.bread', build: breadCart, footprint: [1.0, 1.75], size: 'medium', tint: 'butter', handle: BREAD_CART_HANDLE, tags: ['market', 'vendor', 'delivery'] }),
  pushed({ key: 'cart.wheelbarrow', build: (q) => wheelbarrow(q, 'empty'), footprint: [0.7, 1.75], size: 'small', handle: WHEELBARROW_HANDLE, tags: ['garden', 'work'] }),
  pushed({ key: 'cart.wheelbarrowSoil', build: (q) => wheelbarrow(q, 'soil'), footprint: [0.7, 1.75], size: 'small', handle: WHEELBARROW_HANDLE, tags: ['garden', 'work'] }),
  pushed({ key: 'cart.wheelbarrowBricks', build: (q) => wheelbarrow(q, 'bricks'), footprint: [0.7, 1.75], size: 'small', handle: WHEELBARROW_HANDLE, tags: ['work'] }),
  pushed({ key: 'cart.luggage', build: luggageTrolley, footprint: [0.65, 1.0], size: 'small', tint: 'blue', handle: LUGGAGE_HANDLE, tags: ['station'] }),
  pushed({ key: 'cart.luggageHeaped', build: (q) => luggageTrolleyHeaped(q), footprint: [0.65, 1.0], size: 'small', tint: 'coral', handle: LUGGAGE_HANDLE, tags: ['station'] }),
  pushed({ key: 'cart.sackTruck', build: sackTruck, footprint: [0.55, 0.45], size: 'small', handle: SACK_TRUCK_HANDLE, tags: ['station', 'work'] }),
  pushed({ key: 'cart.pram', build: pram, footprint: [0.6, 1.25], size: 'small', tint: 'blue', handle: PRAM_HANDLE, tags: ['family'] }),
  pushed({ key: 'cart.stroller', build: stroller, footprint: [0.5, 0.85], size: 'small', tint: 'coral', handle: STROLLER_HANDLE, seats: [hip(0, 0.41, 0.04)], tags: ['family', 'child'] }),
  pushed({ key: 'cart.wheelchair', build: wheelchair, footprint: [0.7, 0.85], size: 'small', tint: 'blue', handle: WHEELCHAIR_HANDLE, seats: [hip(0, 0.47, 0.02)], tags: ['access'] }),
  pushed({ key: 'cart.shopping', build: shoppingTrolley, footprint: [0.6, 1.0], size: 'small', tint: 'coral', handle: SHOPPING_HANDLE, tags: ['market'] }),
];
