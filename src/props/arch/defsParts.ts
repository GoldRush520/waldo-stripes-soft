/** Registered default variants of shop identity pieces and standalone architectural elements. */
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { awning } from './awnings';
import { balconyUnit } from './balcony';
import { displayShelf, sandwichBoard } from './displays';
import { doorUnit } from './doors';
import { arcadeBay, externalStair, portico } from './elements';
import { EMBLEM_TINT } from './emblems';
import { gardenWall, pergola } from './garden';
import { grounded } from './kit';
import { flagPole, lanternPosts, pigeonLoft, roofPlanter, skylight, waterTank, weathervane } from './rooftop';
import { bracketSign, fascia } from './signs';
import { type DisplayKind, type DoorKind, SIGN_KINDS, type WindowStyle } from './types';
import { windowUnit } from './windows';

const SIGNS: readonly PropDef[] = SIGN_KINDS.map((kind) => ({
  key: `sign.${kind}`,
  build: () => bracketSign(kind, 'post'),
  footprint: [0.3, 0.3] as const,
  defaultTint: EMBLEM_TINT[kind],
  tags: ['sign', 'shop', 'budget:furniture'],
}));

const AWNINGS: readonly PropDef[] = (
  [
    ['awning.stripe', 'straight'],
    ['awning.scallop', 'scalloped'],
    ['awning.dome', 'dome'],
  ] as const
).map(([key, kind]) => ({
  key,
  build: () => grounded(awning({ w: kind === 'dome' ? 1.6 : 3, kind })),
  footprint: [0, 0] as const,
  defaultTint: 'coral',
  tags: ['awning', 'shop', 'mount:wall', 'budget:furniture'],
}));

const DISPLAYS: readonly PropDef[] = (['bread', 'books', 'hats', 'cakes'] as const).map((kind: DisplayKind) => ({
  key: `display.${kind}`,
  build: () => displayShelf(kind, 1.2, 2, createRng(`display.${kind}`)),
  footprint: [1.2, 0.34] as const,
  tags: ['display', 'shop', 'budget:furniture'],
}));

const DOORS: readonly PropDef[] = (['panelled', 'glazed', 'double', 'arched'] as const).map((kind: DoorKind) => ({
  key: `door.${kind}`,
  build: () => grounded(doorUnit({ kind, col: kind === 'double' ? 'blue' : 'sage' })),
  footprint: [0, 0] as const,
  tags: ['door', 'mount:wall', 'budget:furniture'],
}));

const WINDOWS: readonly PropDef[] = (['square', 'arched', 'shuttered', 'round', 'bay'] as const).map((style: WindowStyle) => ({
  key: `window.${style}`,
  build: () =>
    grounded(
      windowUnit(
        { style, shutters: style === 'shuttered' ? 'open' : false, windowBox: style === 'square' || style === 'shuttered', shutterCol: 'sage' },
        createRng(`window.${style}`),
      ),
    ),
  footprint: [0, 0] as const,
  defaultTint: 'coral',
  tags: ['window', 'mount:wall', 'budget:furniture'],
}));

const ELEMENTS: readonly PropDef[] = [
  { key: 'fascia.board', build: () => grounded(fascia({ w: 3.2 }, createRng('fascia'))), footprint: [0, 0], tags: ['shop', 'mount:wall', 'budget:furniture'] },
  { key: 'sandwich.board', build: () => sandwichBoard(), footprint: [0.6, 0.45], tags: ['shop', 'clutter', 'budget:clutter'] },
  {
    key: 'balcony.unit',
    build: () => grounded(balconyUnit({ w: 1.8, flowers: true }, createRng('balcony'))),
    footprint: [0, 0],
    defaultTint: 'coral',
    tags: ['balcony', 'mount:wall', 'budget:furniture'],
  },
  { key: 'stair.external', build: () => externalStair().geo, footprint: [5.5, 1], tags: ['stair', 'budget:stall'] },
  { key: 'porch.portico', build: () => portico(), footprint: [2.6, 1.6], tags: ['porch', 'budget:stall'] },
  { key: 'arcade.bay', build: () => arcadeBay(), footprint: [3, 2.6], tags: ['arcade', 'walkthrough', 'budget:stall'] },
  { key: 'wall.garden', build: () => gardenWall({ len: 4 }), footprint: [4, 0.42], tags: ['wall', 'garden', 'budget:stall'] },
  { key: 'wall.garden.gate', build: () => gardenWall({ len: 4, gate: true }), footprint: [4, 0.42], tags: ['wall', 'garden', 'gate', 'budget:stall'] },
  { key: 'pergola.courtyard', build: () => pergola(3, 2.4, createRng('pergola')), footprint: [3, 2.4], defaultTint: 'coral', tags: ['garden', 'budget:stall'] },
  { key: 'roof.watertank', build: () => waterTank(), footprint: [1.1, 1.1], tags: ['rooftop', 'budget:stall'] },
  { key: 'roof.planter', build: () => roofPlanter(1.6, 0.6, createRng('planter')), footprint: [1.6, 0.6], defaultTint: 'coral', tags: ['rooftop', 'garden', 'budget:furniture'] },
  { key: 'roof.skylight', build: () => skylight(), footprint: [1.4, 1.8], tags: ['rooftop', 'budget:furniture'] },
  { key: 'roof.pigeonloft', build: () => pigeonLoft(createRng('loft')), footprint: [1.5, 0.85], tags: ['rooftop', 'budget:furniture'] },
  { key: 'roof.weathervane', build: () => weathervane(), footprint: [0.3, 0.3], tags: ['rooftop', 'budget:clutter'] },
  { key: 'flag.pole', build: () => flagPole(), footprint: [0.3, 0.3], defaultTint: 'coral', tags: ['flag', 'rooftop', 'budget:furniture'] },
  { key: 'lantern.posts', build: () => lanternPosts(4, createRng('lanterns')), footprint: [4.26, 0.26], defaultTint: 'butter', tags: ['festival', 'rooftop', 'budget:furniture'] },
];

export const PART_PROPS: readonly PropDef[] = [...SIGNS, ...AWNINGS, ...DISPLAYS, ...DOORS, ...WINDOWS, ...ELEMENTS];
