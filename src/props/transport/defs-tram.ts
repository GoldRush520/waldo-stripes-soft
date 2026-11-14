/** PropDefs for the tram, its trailer and tramway furniture. */
import type { PropDef } from '../registry';
import { type Seat, def, feet, hip } from './defs';
import {
  TRAILER_BENCH_Z,
  TRAILER_SEAT_Y,
  TRAM_BENCH_X,
  TRAM_BENCH_Y,
  TRAM_FLOOR,
  TRAM_SEAT_Z,
  TRAM_STAND_Z,
  summerTrailer,
  tramCar,
} from './tram';
import { STOP_BENCH, bufferStop, catenaryPole, crossingArm, crossingGate, crossingPost, signalPost, tramStop } from './tramway';

const H = Math.PI / 2;

/** 12 bench seats (hip, facing the aisle) then 4 standing spots (feet) in the aisle. */
export const TRAM_SEATS: readonly Seat[] = [
  ...TRAM_SEAT_Z.map((z) => hip(-TRAM_BENCH_X, TRAM_BENCH_Y, z, H)),
  ...TRAM_SEAT_Z.map((z) => hip(TRAM_BENCH_X, TRAM_BENCH_Y, z, -H)),
  ...TRAM_STAND_Z.map((z, i) => feet(0, TRAM_FLOOR, z, i % 2 === 0 ? 0 : Math.PI)),
];

const TRAILER_SEATS: readonly Seat[] = TRAILER_BENCH_Z.flatMap((z) => [hip(-0.5, TRAILER_SEAT_Y, z, 0), hip(0.5, TRAILER_SEAT_Y, z, 0)]);

export const TRAM_PROPS: readonly PropDef[] = [
  def({ key: 'tram.car', build: (q) => tramCar(q), footprint: [2.6, 9.6], family: 'tram', size: 'large', tint: 'coral', seats: TRAM_SEATS, tags: ['vehicle'] }),
  def({ key: 'tram.trailer', build: summerTrailer, footprint: [2.6, 8.2], family: 'tram', size: 'large', tint: 'coral', seats: TRAILER_SEATS, tags: ['vehicle'] }),
  def({ key: 'tram.catenaryPole', build: catenaryPole, footprint: [0.3, 0.3], family: 'tram', size: 'furniture', baseFootprint: true, tags: ['street'] }),
  def({
    key: 'tram.stop',
    build: tramStop,
    footprint: [3.4, 1.6],
    family: 'tram',
    size: 'small',
    tint: 'sage',
    seats: STOP_BENCH.x.map((x) => hip(x, STOP_BENCH.y, STOP_BENCH.z, 0)),
    tags: ['street', 'shelter'],
  }),
  def({ key: 'tram.bufferStop', build: bufferStop, footprint: [2.0, 1.6], family: 'tram', size: 'furniture', tags: ['track'] }),
  def({ key: 'tram.signal', build: signalPost, footprint: [0.4, 0.4], family: 'tram', size: 'small', baseFootprint: true, tags: ['track'] }),
  def({ key: 'tram.crossingGate', build: crossingGate, footprint: [0.5, 0.5], family: 'tram', size: 'small', baseFootprint: true, tags: ['track', 'road'] }),
  def({ key: 'tram.crossingPost', build: crossingPost, footprint: [0.5, 0.5], family: 'tram', size: 'furniture', tags: ['track', 'road'] }),
  def({ key: 'tram.crossingArm', build: crossingArm, footprint: [0, 0], family: 'tram', size: 'furniture', pivot: true, baseFootprint: true, tags: ['track', 'road'] }),
];
