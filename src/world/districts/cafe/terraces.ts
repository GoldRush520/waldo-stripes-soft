/**
 * Shop-house terraces of the café lanes: four irregular blocks (two perimeter terraces along the
 * north edge broken by the bakery yard and a passage, two back-to-back interior blocks) plus the
 * bakery, the bookshop and the corner café. Every house is bespoke but built once.
 */
import type { Col } from '../../../core/geo';
import { house } from '../../../props/arch/house';
import type { BalconyAnchor, DoorAnchor, HouseResult, RoofKind, ShopOpts, WindowStyle } from '../../../props/arch/types';
import type { Kit } from '../../kit';
import { BAKERY, C1, C2, CORNER_CAFE, ROW_D, ROW_NEA, ROW_NEB, ROW_NW, type RowFrame } from './plan';

export interface HouseSpec {
  readonly w: number;
  readonly floors: number;
  readonly roof: RoofKind;
  readonly wall: Col;
  readonly roofColor: Col;
  readonly tint: Col;
  readonly shop?: ShopOpts;
  readonly balconies?: readonly number[];
  readonly style?: WindowStyle;
  readonly halfTimber?: boolean;
  readonly terrace?: boolean;
}

export interface PlacedHouse {
  readonly x: number;
  readonly z: number;
  readonly rot: number;
  readonly w: number;
  readonly d: number;
  readonly result: HouseResult;
}

export interface Terraces {
  readonly nw: readonly PlacedHouse[];
  readonly bakery: PlacedHouse;
  readonly nea: readonly PlacedHouse[];
  readonly neb: readonly PlacedHouse[];
  readonly c1s: readonly PlacedHouse[];
  readonly c2s: readonly PlacedHouse[];
  /** every placed house (for roof terraces and balconies) */
  readonly all: readonly PlacedHouse[];
  readonly corner: PlacedHouse;
}

const H = (w: number, floors: number, roof: RoofKind, wall: Col, roofColor: Col, tint: Col, extra: Partial<HouseSpec> = {}): HouseSpec => ({
  w,
  floors,
  roof,
  wall,
  roofColor,
  tint,
  ...extra,
});

const NW: readonly HouseSpec[] = [
  H(6.4, 3, 'gable', 'ivory', 'clay', 'coral', { shop: { sign: 'teacup', awning: 'scalloped', display: 'cakes' }, balconies: [2] }),
  H(5.6, 4, 'mansard', 'blueLight', 'blue', 'butter', { balconies: [1, 2], style: 'shuttered' }),
  H(7.0, 3, 'hip', 'butterLight', 'coral', 'blue', { shop: { sign: 'wine', awning: 'straight', display: false }, balconies: [1] }),
  H(5.8, 2, 'gable', 'coralLight', 'clayDeep', 'sage', { shop: { sign: 'hat', awning: 'dome', display: 'hats' } }),
  H(6.2, 3, 'flat', 'sageLight', 'sage', 'butter', { shop: { sign: 'cheese', awning: 'straight', display: 'cakes' } }),
];

const BAKERY_SPEC = H(7, 3, 'gable', 'clayLight', 'coral', 'butter', {
  shop: { sign: 'pretzel', awning: 'straight', display: 'bread', fascia: 'butterDeep' },
  balconies: [1],
  halfTimber: true,
});

const NEA: readonly HouseSpec[] = [
  H(6.0, 3, 'shed', 'ivoryShade', 'blue', 'coral', { shop: { sign: 'icecream', awning: 'scalloped', display: 'cakes' }, balconies: [1] }),
  H(6.5, 4, 'gable', 'blueLight', 'clay', 'butter', { balconies: [1, 2], style: 'arched' }),
  H(6.0, 3, 'mansard', 'coralLight', 'blue', 'blue', { shop: { sign: 'teacup', awning: 'dome', display: 'cakes' } }),
];

const NEB: readonly HouseSpec[] = [
  H(6.6, 3, 'gable', 'butterLight', 'sage', 'sage', { shop: { sign: 'key', awning: 'straight', display: false } }),
  H(6.2, 2, 'hip', 'sageLight', 'coral', 'coral', { shop: { sign: 'music', awning: 'straight', display: 'books' } }),
  H(7.4, 3, 'mansard', 'ivory', 'sageDeep', 'sage', { shop: { sign: 'book', awning: 'dome', display: 'books', fascia: 'sageDeep' }, balconies: [1] }),
];

/* Interior blocks stand SOUTH of the east-west lanes, so they stay low (1–2 floors) and many have
   flat roof terraces with people on them; the camera looks north over them into the lanes. */
const C1N: readonly HouseSpec[] = [
  H(5.0, 2, 'flat', 'coralLight', 'clay', 'blue', { terrace: true }),
  H(5.8, 1, 'shed', 'ivory', 'clay', 'coral', { shop: { sign: 'scissors', awning: 'straight' } }),
  H(4.6, 2, 'gable', 'butterLight', 'blue', 'sage', { shop: { sign: 'boot', awning: false } }),
  H(4.6, 2, 'flat', 'blueLight', 'coralDeep', 'butter', { terrace: true }),
];

const C1S: readonly HouseSpec[] = [
  H(5.4, 2, 'gable', 'sageLight', 'coral', 'coral', { shop: { sign: 'flower', awning: 'straight', display: false } }),
  H(4.8, 2, 'flat', 'ivoryShade', 'blue', 'butter', { balconies: [1], terrace: true }),
  H(5.8, 2, 'hip', 'clayLight', 'sage', 'butter', { shop: { sign: 'teacup', awning: 'scalloped', display: 'cakes' } }),
  H(4.0, 1, 'shed', 'blueLight', 'clayDeep', 'coral'),
];

const C2N: readonly HouseSpec[] = [
  H(6.2, 1, 'shed', 'butterLight', 'blue', 'blue', { shop: { sign: 'anchor', awning: 'straight' } }),
  H(5.0, 2, 'flat', 'coralLight', 'clay', 'coral', { terrace: true }),
  H(5.6, 2, 'gable', 'ivory', 'clay', 'sage', { shop: { sign: 'hat', awning: 'dome' } }),
  H(5.2, 2, 'flat', 'sageLight', 'coral', 'butter', { terrace: true }),
];

const C2S: readonly HouseSpec[] = [
  H(5.8, 2, 'gable', 'blueLight', 'coral', 'coral', { shop: { sign: 'teacup', awning: 'scalloped', display: 'cakes' } }),
  H(6.6, 2, 'flat', 'ivory', 'blue', 'butter', { shop: { sign: 'icecream', awning: 'straight', display: 'cakes' }, terrace: true }),
  H(4.8, 2, 'hip', 'clayLight', 'sage', 'sage', { balconies: [1] }),
  H(4.8, 1, 'gable', 'butterLight', 'clayDeep', 'sage', { shop: { sign: 'flower', awning: 'dome', display: false } }),
];

const CORNER_SPEC = H(8, 2, 'flat', 'coralLight', 'clay', 'blue', {
  shop: { sign: 'teacup', awning: 'scalloped', display: 'cakes', fascia: 'blueDeep' },
  terrace: true,
});

function build(spec: HouseSpec, d: number, ends: { left: boolean; right: boolean }, seed: number): HouseResult {
  const end = (isEnd: boolean) => (isEnd ? { windows: 2, simple: true } : { party: true });
  return house({
    w: spec.w,
    d,
    floors: spec.floors,
    roof: spec.roof,
    wall: spec.wall,
    roofColor: spec.roofColor,
    ridge: 'x',
    halfTimber: spec.halfTimber,
    terrace: spec.terrace,
    terraceGarden: false,
    front: {
      shop: spec.shop ?? false,
      door: spec.shop ? undefined : true,
      style: spec.style,
      balconies: spec.balconies ?? [],
      balconyFlowers: true,
      windowBoxes: true,
      shutters: spec.style !== 'shuttered',
    },
    back: { party: true },
    left: end(ends.left),
    right: end(ends.right),
    tint: spec.tint,
    seed,
  });
}

/** Place a row of houses along a frame; returns the placed houses (local centres). */
function row(k: Kit, frame: RowFrame, specs: readonly HouseSpec[], d: number, seed: number, endsOpen = true): PlacedHouse[] {
  const total = specs.reduce((s, h) => s + h.w, 0);
  let u = -total / 2;
  return specs.map((spec, i) => {
    const cu = u + spec.w / 2;
    u += spec.w;
    const ends = { left: endsOpen && i === 0, right: endsOpen && i === specs.length - 1 };
    const result = build(spec, d, ends, seed + i * 17);
    const p = k.rel(frame, cu, 0);
    k.add(result.geo, { x: p.x, z: p.z, rot: frame.rot });
    k.block(p.x, p.z, spec.w, d, frame.rot);
    return { x: p.x, z: p.z, rot: frame.rot, w: spec.w, d, result };
  });
}

/** Back-to-back interior block: a row facing -z (north) and a row facing +z (south). */
function block(k: Kit, centre: RowFrame, north: readonly HouseSpec[], south: readonly HouseSpec[], seed: number): { n: PlacedHouse[]; s: PlacedHouse[] } {
  const nf = k.rel(centre, 0, -ROW_D / 2, Math.PI);
  const sf = k.rel(centre, 0, ROW_D / 2, 0);
  const n = row(k, { x: nf.x, z: nf.z, rot: nf.heading }, north, ROW_D, seed);
  const s = row(k, { x: sf.x, z: sf.z, rot: sf.heading }, south, ROW_D, seed + 500);
  return { n, s };
}

export function buildTerraces(k: Kit): Terraces {
  const nw = row(k, ROW_NW, NW, 7.5, 9100);
  const bakery = row(k, BAKERY, [BAKERY_SPEC], 7.5, 9200)[0] as PlacedHouse;
  const nea = row(k, ROW_NEA, NEA, 7.5, 9300);
  const neb = row(k, ROW_NEB, NEB, 7.5, 9400);
  const c1 = block(k, C1, C1N, C1S, 9500);
  const c2 = block(k, C2, C2N, C2S, 9600);
  const corner = row(k, CORNER_CAFE, [CORNER_SPEC], 7, 9700)[0] as PlacedHouse;
  return { nw, bakery, nea, neb, c1s: c1.s, c2s: c2.s, corner, all: [...nw, bakery, ...nea, ...neb, ...c1.n, ...c1.s, ...c2.n, ...c2.s, corner] };
}

/** A house-space anchor (door, balcony) -> district-local position + heading. */
export function anchorAt(k: Kit, h: PlacedHouse, a: DoorAnchor | BalconyAnchor): { x: number; z: number; heading: number } {
  return k.rel(h, a.x, a.z, a.heading);
}

/** Point in front of a house's façade centre, `out` metres into the street. */
export function frontOf(k: Kit, h: PlacedHouse, out: number, along = 0): { x: number; z: number; heading: number } {
  return k.rel(h, along, h.d / 2 + out, 0);
}
