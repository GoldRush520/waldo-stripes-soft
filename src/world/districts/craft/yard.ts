/**
 * The work yard south of Yard Street: the crane lowering a piano, the painter and his
 * paint-spattered public, the smithy with its waiting horse, and the site tea break.
 */
import { type Geo, box, detail, merge, translate } from '../../../core/geo';
import { propGeo } from '../../../props/registry';
import type { Kit } from '../../kit';
import { CRANE, HARD_HAT, JIB_Y, MAST_HALF, PI, SMOCK, clip, spattered } from './plan';

const PIANO_DROP = 2.9;

let pianoLoad: Geo | null = null;

/** Upright piano in slings on a hook cable reaching up to the jib (frame origin = jib). */
function pianoGeo(): Geo {
  if (!pianoLoad) {
    const hang = JIB_Y - PIANO_DROP;
    const top = -hang + 1.75;
    pianoLoad = merge(
      translate(propGeo('music.pianoUpright'), 0, -hang, 0),
      translate(box(0.06, hang - 1.75, 0.06, 'ink'), 0, top, 0),
      translate(box(0.36, 0.42, 0.24, 'coral'), 0, top, 0),
      detail(merge(translate(box(1.5, 0.03, 0.03, 'ink'), 0, top - 0.1, 0.35), translate(box(1.5, 0.03, 0.03, 'ink'), 0, top - 0.1, -0.35))),
    );
  }
  return pianoLoad;
}

function pianoStory(k: Kit): void {
  const x = CRANE.x + MAST_HALF + 5.6;
  const z = CRANE.z + 0.4;
  const sway = k.swing([x, JIB_Y, z], 0, 0.22, 0, 0.018, 24);
  k.dynamic(pianoGeo(), sway, { tint: 'sage' });
  k.vignette(
    { id: 'piano-drop', title: 'A little to the left', story: 'The tower crane lowers an upright piano toward Yard Street while a mover waves it down, a piano tuner waits on his toolbox and everyone else edges away.' },
    () => {
      const mover = k.person({ x: x - 0.4, z: z + 2.3, heading: PI + 0.2, clip: clip('crane.signal', 'point.sky'), look: { ...HARD_HAT, shirt: 'coral', pattern: 6, shirt2: 'ivory' } });
      k.searchable(mover, 'the piano mover');
      k.person({ x: x + 1.5, z: z + 3.0, heading: PI - 0.4, clip: 'greet.bigwave', look: HARD_HAT });
      k.prop('craft.toolbox', { x: x - 2.2, z: z + 3.4, rot: 0.3 });
      k.person({ x: x - 2.2, z: z + 3.9, heading: 0.3, clip: 'idle.watch', look: { hat: 'hat.top', hatTint: 'ink', shirt: 'ink', pattern: 0, longSleeves: true, glasses: 'face.glasses.round', pants: 'slate' } });
      k.person({ x: x + 0.6, z: z + 4.4, heading: PI, clip: 'lookout', age: 'child' });
      k.person({ x: x + 2.6, z: z + 4.0, heading: -2.6, clip: 'talk.whisper', age: 'elder' });
    },
  );
}

/** Painter at his easel; every one of his admirers has been spattered with paint. */
function painterStory(k: Kit): void {
  const at = { x: 3.4, z: 1.4, rot: PI / 2 };
  k.prop('craft.easel', at);
  k.prop('craft.painterTable', { x: 4.6, z: 0.1, rot: 0.2 });
  k.prop('craft.paintCanSpilled', { x: 4.9, z: 2.6, rot: 0.8 });
  const splats: ReadonlyArray<readonly [string, number, number]> = [
    ['craft.paintSplat1', 4.4, 1.9], ['craft.paintSplat2', 5.6, 0.9], ['craft.paintSplat3', 5.3, 2.8], ['craft.paintSplat1', 6.3, 2.0], ['craft.paintSplat2', 4.0, 3.1],
  ];
  splats.forEach(([key, sx, sz], i) => k.prop(key, { x: sx, z: sz, rot: i * 1.3 }));
  k.vignette(
    { id: 'spattered-public', title: 'Expressive brushwork', story: 'A painter in a spotless white smock flicks paint at his canvas with great passion; every admirer standing behind him is polka-dotted with paint.' },
    () => {
      const painter = k.person({ x: 4.2, z: 1.4, heading: -PI / 2 + 0.25, clip: clip('easel.paint', 'serve.wipe'), look: { shirt: 'white', pattern: 0, longSleeves: true, pants: 'ivory', hat: 'hat.beret', hatTint: 'coral' } });
      k.searchable(painter, 'the spotless painter');
      const fans: ReadonlyArray<readonly [number, number, string]> = [
        [5.4, 1.6, 'cheer.clap'], [5.9, 2.4, 'point'], [5.2, 3.3, 'talk'], [6.4, 1.1, 'lookout'], [6.7, 3.0, 'cheer.clap'], [6.1, 3.9, 'photo.camera'],
      ];
      fans.forEach(([fx, fz, clip], i) => {
        k.person({ x: fx, z: fz, face: [3.4, 1.4], clip, age: i === 3 ? 'child' : 'adult', look: spattered(k) });
      });
    },
  );
}

function smithy(k: Kit): void {
  k.prop('craft.forge', { x: 11.4, z: -2.4 });
  k.prop('craft.anvil', { x: 11.3, z: -0.7 });
  k.prop('animal.horse', { x: 14.1, z: 0.4, rot: -PI / 2 });
  k.vignette(
    { id: 'four-horseshoes', title: 'Four sizes fit all', story: 'The horse came in for one new shoe; the blacksmith has hammered out four, each a different size, and the owner is counting them on his fingers.' },
    () => {
      k.person({ x: 11.3, z: -1.35, heading: 0, clip: clip('smith.strike', 'vend.arrange'), hold: ['upper.apron'], look: { shirt: 'clayDeep', pattern: 0, pants: 'cocoa', hat: 'hat.beanie', hatTint: 'slate' } });
      k.person({ x: 12.9, z: -2.1, heading: -PI / 2, clip: clip('hoist.rope', 'serve.wipe'), age: 'teen', hold: ['upper.apron'] });
      k.person({ x: 12.9, z: 1.5, heading: -2.2, clip: 'talk.shrug', look: { hat: 'hat.cap', hatTint: 'sage', shirt: 'sage', pattern: 4 } });
      k.person({ x: 10.0, z: 0.9, heading: 0.6, clip: 'talk.laugh', age: 'child' });
    },
  );
}

/** Site crew on their tea break on a bench while the foreman taps his watch. */
function teaBreak(k: Kit): void {
  k.vignette(
    { id: 'tea-break', title: 'Just five more minutes', story: 'The site crew sits in a row with mugs of tea while the foreman taps his watch and points at the half-built house; nobody moves.' },
    () => {
      const bench = { x: 12.6, z: -5.6 };
      k.prop('bench.park.long', bench, { walkThrough: true });
      k.seated('bench.park.long', bench, { clips: ['drink.cup', 'sit.talk', 'drink.cup'], fill: 1, place: false });
      k.person({ x: 12.6, z: -4.3, heading: PI, clip: 'idle.watch', look: { ...HARD_HAT, hatTint: 'ivory', shirt: 'ivory', pattern: 0 } });
      k.person({ x: 14.4, z: -4.6, heading: -2.4, clip: 'point', look: HARD_HAT });
    },
  );
}

export function workYard(k: Kit): void {
  k.ground([[-13.5, -6.2], [15.5, -6.2], [15.5, 4.5], [-13.5, 4.5]], 'ivory', 0.03, 0.02);
  pianoStory(k);
  painterStory(k);
  smithy(k);
  teaBreak(k);
  k.prop('craft.toolbox', { x: 9.0, z: -2.5 });
  k.queue([14.8, 4.2], [12.9, 2.3], 4, { clips: ['stand', 'talk', 'idle.watch', 'lookout'] });
  k.group(-2.6, -10.2, 4, { clips: ['point.sky', 'lookout', 'talk', 'point.sky'] });
  k.person({ x: -1.6, z: -3.6, heading: 0.4, clip: 'carry.wobble', age: 'teen', hold: ['carry.crate', 'upper.apron'], look: SMOCK });
}
