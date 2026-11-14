/** Registered festival dressing: lines strung between poles, flags, maypole, gate, stage, podiums, booth, arch. */
import { type Geo, beam, box, detail, merge, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type LineResult, banner, bunting, lanternString, laundryLine, stringLights } from './festival-lines';
import { balloonArch, festivalGate, flagPole, lectern, maypole, stage, ticketBooth, winnersPodium } from './festival-structures';
import { type V3, prop } from './kit';

function pole(x: number, h: number, color: 'ivoryDeep' | 'timberDeep' = 'ivoryDeep'): Geo {
  return merge(translate(box(0.3, 0.08, 0.3, 'stone'), x, 0, 0), beam([x, 0.08, 0], [x, h, 0], 0.09, color), detail(translate(box(0.14, 0.06, 0.14, 'butterDeep'), x, h, 0)));
}

/** A line strung between two poles `span` apart, anchored just below the pole tops. */
function onPoles(span: number, h: number, make: (a: V3, b: V3) => LineResult, color: 'ivoryDeep' | 'timberDeep' = 'ivoryDeep'): Geo {
  const a: V3 = [-span / 2, h - 0.08, 0];
  const b: V3 = [span / 2, h - 0.08, 0];
  return merge(pole(-span / 2, h, color), pole(span / 2, h, color), make(a, b).geo);
}

const STAGE_OPTS = { width: 4, depth: 3, height: 0.8 } as const;

const LINE = ['festival', 'walkthrough', 'line'];

export const FESTIVAL_PROPS: readonly PropDef[] = [
  prop('bunting.poles.6m', [0, 0], 'stall', () => onPoles(6, 3.2, (a, b) => bunting(a, b)), { tags: [...LINE, 'poles:x=±3'] }),
  prop('bunting.poles.10m', [0, 0], 'stall', () => onPoles(10, 3.6, (a, b) => bunting(a, b)), { tags: [...LINE, 'poles:x=±5'] }),
  prop('lights.string.poles', [0, 0], 'stall', () => onPoles(8, 3.4, (a, b) => stringLights(a, b)), { tags: [...LINE, 'light', 'poles:x=±4'] }),
  prop('lanterns.string.poles', [0, 0], 'stall', () => onPoles(8, 3.4, (a, b) => lanternString(a, b)), { tags: [...LINE, 'poles:x=±4'] }),
  prop('banner.street', [0, 0], 'stall', () => onPoles(9, 4.6, (a, b) => banner(a, b, { width: 4 })), { tint: 'coral', tags: [...LINE, 'poles:x=±4.5'] }),
  prop('laundry.line.posts', [0, 0], 'stall', () => onPoles(5, 2.1, (a, b) => laundryLine(a, b, { seed: 'laundry.posts' }), 'timberDeep'), {
    tint: 'blue',
    tags: ['harbour', 'street', 'walkthrough', 'line', 'poles:x=±2.5'],
  }),
  prop('flag.pole', [0.4, 0.4], 'furniture', () => flagPole(5, 'flag'), { tint: 'coral', tags: ['festival', 'flag', 'overhang'] }),
  prop('flag.pole.pennant', [0.4, 0.4], 'furniture', () => flagPole(4.5, 'pennant', 'blue'), { tint: 'blue', tags: ['festival', 'flag', 'overhang'] }),
  prop(
    'flag.poles.triple',
    [2.4, 0.4],
    'stall',
    () => merge(translate(flagPole(4.5, 'flag', 'coral'), -1.0, 0, 0), flagPole(5.2, 'flag', 'blue'), translate(flagPole(4.5, 'flag', 'sage'), 1.0, 0, 0)),
    { tint: 'coral', tags: ['festival', 'flag', 'plaza'] },
  ),
  prop('maypole', [0.6, 0.6], 'stall', maypole, { tint: 'coral', tags: ['festival', 'plaza', 'activity:dance', 'overhang'] }),
  prop('gate.festival', [5.6, 0.6], 'house', () => festivalGate(5), { tint: 'coral', tags: ['festival', 'gate', 'landmark-small'] }),
  prop('stage.small', [STAGE_OPTS.width + 0.9, STAGE_OPTS.depth], 'house', () => stage(STAGE_OPTS).geo, {
    tint: 'coral',
    tags: ['festival', 'stage', `deck:${STAGE_OPTS.height}`],
  }),
  prop('podium.winners', [2.2, 0.7], 'furniture', winnersPodium, {
    seats: [
      { x: 0, y: 0.6, z: 0, heading: 0 },
      { x: -0.75, y: 0.42, z: 0, heading: 0 },
      { x: 0.75, y: 0.3, z: 0, heading: 0 },
    ],
    tags: ['festival', 'seat:feet'],
  }),
  prop('podium.lectern', [1.0, 0.8], 'furniture', lectern, { tint: 'coral', seats: [{ x: 0, y: 0.2, z: 0.2, heading: Math.PI }], tags: ['festival', 'civic', 'seat:feet'] }),
  prop('booth.ticket', [1.4, 1.2], 'stall', () => ticketBooth(), { tint: 'coral', tags: ['festival', 'kiosk'] }),
  prop('arch.balloon', [0, 0], 'stall', () => balloonArch(4), { tint: 'coral', tags: ['festival', 'walkthrough'] }),
];
