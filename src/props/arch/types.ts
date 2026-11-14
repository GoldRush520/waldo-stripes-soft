/** Shared option / result types of the houses & shops architecture kit. */
import type { Col, Geo } from '../../core/geo';

export type RoofKind = 'gable' | 'hip' | 'flat' | 'mansard' | 'shed';
export type WindowStyle = 'square' | 'arched' | 'shuttered' | 'bay' | 'round';
export type DoorKind = 'panelled' | 'glazed' | 'double' | 'arched';
export type AwningKind = 'straight' | 'scalloped' | 'dome';
export type DisplayKind = 'bread' | 'books' | 'hats' | 'cakes';
export type FacadeSide = 'front' | 'back' | 'left' | 'right';
export type SignKind =
  | 'pretzel'
  | 'fish'
  | 'book'
  | 'teacup'
  | 'flower'
  | 'boot'
  | 'scissors'
  | 'key'
  | 'anchor'
  | 'music'
  | 'cheese'
  | 'wine'
  | 'icecream'
  | 'hat';

export const SIGN_KINDS: readonly SignKind[] = [
  'pretzel',
  'fish',
  'book',
  'teacup',
  'flower',
  'boot',
  'scissors',
  'key',
  'anchor',
  'music',
  'cheese',
  'wine',
  'icecream',
  'hat',
];

/** Anchor where a person stands (feet) in prop / house space; heading uses [sin h, 0, cos h]. */
export interface Anchor {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
}

export interface DoorAnchor {
  readonly x: number;
  readonly z: number;
  readonly heading: number;
}

/** Standing area on a balcony: (x,y,z) is the centre of the slab top, `w` its width, `depth` its projection. */
export interface BalconyAnchor extends Anchor {
  readonly w: number;
  readonly depth: number;
}

export interface TerraceInfo {
  readonly y: number;
  readonly w: number;
  readonly d: number;
}

export interface ShopOpts {
  /** awning kind, or false for none (default 'straight') */
  readonly awning?: AwningKind | false;
  /** fascia signboard colour */
  readonly fascia?: Col;
  /** lettering block colour */
  readonly letters?: Col;
  /** what is in the window (default from seed) */
  readonly display?: DisplayKind | false;
  /** hanging bracket sign beside the fascia */
  readonly sign?: SignKind | false;
  /** door kind of the shop door (default 'glazed') */
  readonly door?: DoorKind;
}

export interface FacadeOpts {
  /** shared party wall: nothing is built on it (cheapest) */
  readonly party?: boolean;
  /** no openings, but trims / plinth / quoins still wrap round it */
  readonly blank?: boolean;
  /** window columns (default from facade width) */
  readonly windows?: number;
  readonly style?: WindowStyle;
  /** front door on the ground floor (kind or true) */
  readonly door?: DoorKind | boolean;
  /** column index the door replaces (default: middle) */
  readonly doorAt?: number;
  /** glazed shopfront across the ground floor */
  readonly shop?: ShopOpts | boolean;
  /** floor indices (1 = first floor) with a balcony; 'all' = every upper floor */
  readonly balconies?: readonly number[] | 'all';
  /** one balcony spanning the whole facade instead of one per column */
  readonly wideBalcony?: boolean;
  readonly balconyFlowers?: boolean;
  readonly windowBoxes?: boolean;
  readonly shutters?: boolean;
  /** frame + sill only, no glazing bars or boxes (back yards) */
  readonly simple?: boolean;
}

export interface HouseOpts {
  readonly w?: number;
  readonly d?: number;
  /** 1–5 */
  readonly floors?: number;
  readonly floorH?: number;
  readonly wall?: Col;
  readonly trim?: Col;
  readonly roof?: RoofKind;
  readonly roofColor?: Col;
  /** axis the ridge runs along (gable / hip / shed fall direction) */
  readonly ridge?: 'x' | 'z';
  readonly front?: FacadeOpts;
  readonly back?: FacadeOpts;
  readonly left?: FacadeOpts;
  readonly right?: FacadeOpts;
  /** chimney count (default from seed: 0–2) */
  readonly chimneys?: number;
  /** dormers on the front roof slope (default from seed) */
  readonly dormers?: number;
  readonly downpipes?: boolean;
  readonly halfTimber?: boolean;
  readonly quoins?: boolean;
  readonly plinth?: boolean;
  readonly cornice?: boolean;
  /** flat roof only: walkable terrace with parapet (default true) */
  readonly terrace?: boolean;
  /** flat roof only: planters and a pergola corner on the terrace */
  readonly terraceGarden?: boolean;
  /** shutter / door accent colour */
  readonly accent?: Col;
  /** bake this colour into tint-masked parts (awning stripes, petals); omit to keep them tintable */
  readonly tint?: Col;
  readonly seed?: number;
}

export interface HouseResult {
  readonly geo: Geo;
  /** top of the walls (eaves level) */
  readonly roofY: number;
  /** highest point of the roof / chimneys */
  readonly topY: number;
  readonly terrace?: TerraceInfo;
  readonly doors: readonly DoorAnchor[];
  readonly balconies: readonly BalconyAnchor[];
  readonly footprint: readonly [number, number];
  /** budget-governor level that was applied (0 = built exactly as requested) */
  readonly lean: number;
}
