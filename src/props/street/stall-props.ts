/** Registered default market stall variants. */
import type { ColorName } from '../../core/palette';
import type { PropDef } from '../registry';
import type { AwningStyle } from './awning';
import type { GoodsKind } from './goods';
import { prop } from './kit';
import { stall, stallFootprint } from './stall';

interface Variant {
  readonly key: string;
  readonly width: number;
  readonly awning: AwningStyle;
  readonly tint: ColorName;
  readonly goods: readonly GoodsKind[];
}

const VARIANTS: readonly Variant[] = [
  { key: 'fish', width: 2.6, awning: 'scallop', tint: 'blue', goods: ['fish', 'fish', 'crabs', 'oysters', 'fish', 'crabs'] },
  { key: 'shellfish', width: 2.4, awning: 'flat', tint: 'blue', goods: ['crabs', 'oysters', 'crabs', 'oysters', 'fish', 'oysters'] },
  { key: 'fruit', width: 2.6, awning: 'flat', tint: 'coral', goods: ['oranges', 'apples', 'lemons', 'apples', 'melons', 'oranges'] },
  { key: 'citrus', width: 2.0, awning: 'umbrella', tint: 'butter', goods: ['lemons', 'oranges', 'oranges', 'lemons'] },
  { key: 'melon', width: 2.4, awning: 'pitched', tint: 'sage', goods: ['melons', 'oranges', 'melons', 'melons', 'lemons', 'melons'] },
  { key: 'veg', width: 2.8, awning: 'pitched', tint: 'sage', goods: ['carrots', 'cabbages', 'tomatoes', 'leeks', 'cabbages', 'carrots'] },
  { key: 'greens', width: 2.0, awning: 'scallop', tint: 'sage', goods: ['leeks', 'cabbages', 'cabbages', 'leeks'] },
  { key: 'bread', width: 2.4, awning: 'scallop', tint: 'butter', goods: ['bread', 'pastries', 'bread', 'bread', 'bread', 'pastries'] },
  { key: 'pastry', width: 1.8, awning: 'umbrella', tint: 'coral', goods: ['pastries', 'pastries', 'bread', 'pastries'] },
  { key: 'cheese', width: 2.2, awning: 'flat', tint: 'butter', goods: ['cheese', 'cheese', 'jars', 'cheese', 'eggs', 'cheese'] },
  { key: 'deli', width: 2.6, awning: 'pitched', tint: 'coral', goods: ['cheese', 'jars', 'cheese', 'sausages', 'sausages', 'eggs'] },
  { key: 'honey', width: 2.0, awning: 'flat', tint: 'butter', goods: ['jars', 'jars', 'jars', 'eggs'] },
  { key: 'eggs', width: 1.8, awning: 'umbrella', tint: 'sage', goods: ['eggs', 'eggs', 'jars', 'eggs'] },
  { key: 'flowers', width: 2.6, awning: 'scallop', tint: 'coral', goods: ['flowers'] },
  { key: 'spice', width: 2.4, awning: 'pitched', tint: 'clay', goods: ['spices'] },
  { key: 'pottery', width: 2.8, awning: 'flat', tint: 'blue', goods: ['pottery'] },
  { key: 'hats', width: 2.2, awning: 'scallop', tint: 'butter', goods: ['hats'] },
  { key: 'books', width: 2.4, awning: 'pitched', tint: 'blue', goods: ['books'] },
  { key: 'toys', width: 2.2, awning: 'scallop', tint: 'coral', goods: ['toys', 'toys', 'toys', 'balloons', 'toys', 'balloons'] },
  { key: 'balloons', width: 1.8, awning: 'umbrella', tint: 'coral', goods: ['toys', 'toys', 'balloons', 'balloons'] },
  { key: 'cloth', width: 3.2, awning: 'flat', tint: 'sage', goods: ['cloth'] },
  { key: 'market.wide', width: 4.0, awning: 'pitched', tint: 'coral', goods: ['oranges', 'cabbages', 'apples', 'melons', 'carrots', 'lemons'] },
  { key: 'empty', width: 2.4, awning: 'flat', tint: 'coral', goods: [] },
];

export const STALL_PROPS: readonly PropDef[] = VARIANTS.map((v) => {
  const opts = { width: v.width, awning: v.awning, tint: v.tint, goods: v.goods, seed: `stall.${v.key}` };
  return prop(`stall.${v.key}`, stallFootprint(v.width), 'stall', () => stall(opts).geo, {
    tint: v.tint,
    tags: ['market', 'stall', v.goods.length > 0 ? 'goods' : 'bare', `awning:${v.awning}`],
  });
});
