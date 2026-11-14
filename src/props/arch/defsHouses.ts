/** Registered default house / shop / terrace variants. */
import type { PropDef } from '../registry';
import { house } from './house';
import { rowHouses } from './rowHouses';
import type { HouseOpts, ShopOpts } from './types';

/** Option presets behind every registered house variant (authors can spread and tweak them). */
export const HOUSE_PRESETS: Record<string, HouseOpts> = {};

function houseDef(key: string, opts: HouseOpts, tags: readonly string[] = []): PropDef {
  HOUSE_PRESETS[key] = opts;
  const w = opts.w ?? 6;
  const d = opts.d ?? 7;
  return {
    key,
    build: () => house(opts).geo,
    footprint: [w, d],
    defaultTint: 'coral',
    tags: ['house', 'budget:house', ...tags],
  };
}

function shopDef(key: string, shop: ShopOpts, extra: HouseOpts, tags: readonly string[]): PropDef {
  return houseDef(
    key,
    {
      floors: 3,
      w: 6,
      seed: key.length * 7919,
      ...extra,
      front: { shop, windowBoxes: true, shutters: true, balconies: [1], balconyFlowers: true, ...extra.front },
    },
    ['shop', ...tags],
  );
}

const HOUSES: readonly PropDef[] = [
  houseDef('house.small.gable', { w: 5, d: 6, floors: 2, seed: 11, front: { windowBoxes: true } }, ['small']),
  houseDef('house.small.hip', { w: 6, d: 6, floors: 2, roof: 'hip', seed: 12, front: { style: 'shuttered' } }, ['small']),
  houseDef('house.cottage.timber', { w: 6, d: 6.5, floors: 2, halfTimber: true, wall: 'ivory', seed: 13, front: { windowBoxes: true } }, ['small']),
  houseDef('house.tall.mansard', { w: 7, d: 8, floors: 4, roof: 'mansard', quoins: true, seed: 14, front: { style: 'arched', balconies: [1], wideBalcony: true } }, ['tall']),
  houseDef('house.tall.gable', { w: 6, d: 8, floors: 4, ridge: 'z', seed: 15, front: { style: 'shuttered', windowBoxes: true } }, ['tall']),
  houseDef('house.flat.terrace', { w: 7, d: 7, floors: 3, roof: 'flat', terraceGarden: true, seed: 16, front: { balconies: [2], balconyFlowers: true } }, ['terrace']),
  houseDef('house.shed.studio', { w: 6, d: 6, floors: 2, roof: 'shed', seed: 17, front: { style: 'bay' } }, ['small']),
  houseDef(
    'house.corner.quoins',
    { w: 7, d: 7, floors: 3, roof: 'hip', quoins: true, seed: 18, right: { windows: 3 }, front: { style: 'arched', door: 'arched' } },
    ['corner'],
  ),
  houseDef('house.balconies', { w: 6.5, d: 7, floors: 3, seed: 19, front: { balconies: 'all', balconyFlowers: true, shutters: true } }, ['balcony']),
  houseDef('house.round.windows', { w: 5.5, d: 6, floors: 3, roof: 'flat', terraceGarden: true, seed: 20, front: { style: 'round', balconies: [2], balconyFlowers: true } }, ['seaside']),
];

const SHOPS: readonly PropDef[] = [
  shopDef('house.shop.bakery', { sign: 'pretzel', display: 'bread', awning: 'straight', fascia: 'butterDeep' }, {}, ['bakery']),
  shopDef('house.shop.fish', { sign: 'fish', display: false, awning: 'straight', fascia: 'blueDeep' }, { roof: 'shed' }, ['fish']),
  shopDef('house.shop.books', { sign: 'book', display: 'books', awning: 'dome', fascia: 'sageDeep' }, { roof: 'mansard' }, ['books']),
  shopDef('house.shop.hats', { sign: 'hat', display: 'hats', awning: 'scalloped', fascia: 'coralDeep' }, {}, ['hats']),
  shopDef('house.shop.cafe', { sign: 'teacup', display: 'cakes', awning: 'scalloped', fascia: 'blue' }, { roof: 'flat', terraceGarden: true, front: { shutters: false, windowBoxes: false } }, ['cafe']),
  shopDef('house.shop.florist', { sign: 'flower', display: false, awning: 'straight', fascia: 'sage' }, { halfTimber: true }, ['florist']),
  shopDef('house.shop.cobbler', { sign: 'boot', display: 'hats', awning: false, fascia: 'timberDeep' }, { roof: 'hip' }, ['cobbler']),
  shopDef('house.shop.tailor', { sign: 'scissors', display: 'hats', awning: 'dome', fascia: 'blueDeep' }, { ridge: 'z', front: { shutters: false } }, ['tailor']),
  shopDef('house.shop.wine', { sign: 'wine', display: false, awning: 'straight', fascia: 'coralDeep' }, { roof: 'mansard', front: { shutters: false } }, ['wine']),
  shopDef('house.shop.icecream', { sign: 'icecream', display: 'cakes', awning: 'scalloped', fascia: 'coral' }, { roof: 'flat' }, ['icecream']),
  shopDef('house.shop.music', { sign: 'music', display: 'books', awning: 'straight', fascia: 'sageDeep' }, {}, ['music']),
  shopDef('house.shop.cheese', { sign: 'cheese', display: 'cakes', awning: 'straight', fascia: 'butterDeep' }, { roof: 'hip' }, ['cheese']),
  shopDef('house.shop.locksmith', { sign: 'key', display: false, awning: false, fascia: 'slate' }, { floors: 2 }, ['locksmith']),
  shopDef('house.shop.chandler', { sign: 'anchor', display: 'books', awning: 'straight', fascia: 'blueDeep' }, { roof: 'shed', floors: 2 }, ['chandler']),
];

function rowDef(key: string, count: number, seed: number): PropDef {
  const widths = Array.from({ length: count }, (_, i) => [5.2, 6, 4.6, 6.4, 5.4][i % 5] ?? 5.5);
  const total = widths.reduce((a, b) => a + b, 0);
  return {
    key,
    build: () => rowHouses({ widths, seed, d: 7 }).geo,
    footprint: [total, 7],
    tags: ['house', 'row', `budget:row${count}`],
  };
}

export const HOUSE_PROPS: readonly PropDef[] = [
  ...HOUSES,
  ...SHOPS,
  rowDef('house.terrace3', 3, 31),
  rowDef('house.terrace5', 5, 32),
];
