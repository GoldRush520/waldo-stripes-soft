/** Palette groupings for houses and shops (palette tokens only). */
import type { Col } from '../../core/geo';
import type { ColorName } from '../../core/palette';

const DEEP: Partial<Record<ColorName, ColorName>> = {
  coral: 'coralDeep',
  coralLight: 'coral',
  ivory: 'ivoryDeep',
  ivoryShade: 'ivoryDeep',
  blue: 'blueDeep',
  blueLight: 'blue',
  butter: 'butterDeep',
  butterLight: 'butter',
  sage: 'sageDeep',
  sageLight: 'sage',
  clay: 'clayDeep',
  clayLight: 'clay',
  timber: 'timberDeep',
  stone: 'clayDeep',
  sand: 'clay',
};

/** Darker companion of a colour (for slats, panels, mouldings). */
export function deepOf(col: Col): Col {
  if (typeof col !== 'string') return 'timberDeep';
  return DEEP[col] ?? 'timberDeep';
}

/** Façade wall colours: the six bases dominate, with light variants for rhythm. */
export const WALLS: readonly ColorName[] = [
  'ivory',
  'butterLight',
  'coralLight',
  'blueLight',
  'sageLight',
  'clayLight',
  'butter',
  'clay',
  'ivoryShade',
];

export const ROOFS: readonly ColorName[] = ['clayDeep', 'coralDeep', 'clay', 'slate', 'blueDeep', 'timber'];

/** Accent colours for shutters, doors, fascia boards. */
export const ACCENTS: readonly ColorName[] = ['sage', 'blue', 'coral', 'butterDeep', 'sageDeep', 'blueDeep', 'coralDeep'];

/** Awning / petal tints (tint-masked parts take these when baked). */
export const TINTS: readonly ColorName[] = ['coral', 'blue', 'sage', 'butter', 'coralDeep', 'blueDeep'];

/** Trim colour that contrasts with a wall colour. */
export function trimFor(wall: Col): Col {
  return wall === 'ivory' || wall === 'ivoryShade' ? 'clayLight' : 'ivory';
}
