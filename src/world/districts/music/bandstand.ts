/**
 * The octagonal bandstand and its orchestra. Every musician stands or sits at the deck height the
 * bandstand builder reports; seated players use the seat anchors of their instrument / stool props.
 */
import { box, merge, rotateX, torus, translate } from '../../../core/geo';
import { civicMeta } from '../../../props/civic';
import type { Kit } from '../../kit';
import { BAND, circle, facing, patch } from './plan';

const deckY = (): number => civicMeta('bandstand').deckY;
/** conductor's podium, deck-relative */
const POD = { x: 0, z: 2.0 } as const;

const at = (x: number, z: number): { x: number; z: number } => ({ x: BAND.x + x, z: BAND.z + z });
const toPodium = (x: number, z: number): number => facing(x, z, POD.x, POD.z);

function standing(k: Kit, x: number, z: number, clip: string, look: Parameters<Kit['person']>[0]['look'] = {}): number {
  const p = at(x, z);
  return k.person({ ...p, y: deckY(), heading: toPodium(x, z), clip, hold: ['upper.bowtie'], look: { longLegs: true, ...look } });
}

function seatedPlayer(k: Kit, key: string, x: number, z: number, rot: number, clip: string): number[] {
  return k.seated(key, { ...at(x, z), y: deckY(), rot }, { clips: [clip], fill: 1 });
}

function stage(k: Kit): void {
  k.prop('bandstand', { ...BAND });
  k.surface('deck', circle(BAND.x, BAND.z, 3.3, 8, Math.PI / 8), deckY());
  const pod = at(POD.x, POD.z);
  k.prop('music.podium', { ...pod, y: deckY() });
  patch(k, pod.x, pod.z, 0.4, 0.4, deckY() + 0.25);
  for (const [x, z] of [[-0.55, 1.05], [0.55, 1.05], [-0.6, -0.05]] as const) k.prop('music.stand', { ...at(x, z), y: deckY(), rot: Math.PI + toPodium(x, z) });
  k.prop('music.drumKit', { ...at(0, -2.15), y: deckY() });
}

function orchestra(k: Kit): void {
  const uniform = { shirt: 'ivory' as const, pattern: 0 as const, pants: 'blueDeep' as const };
  seatedPlayer(k, 'music.celloChair', -1.3, 0.6, toPodium(-1.3, 0.6), 'cello.bow');
  seatedPlayer(k, 'music.celloChair', 1.3, 0.6, toPodium(1.3, 0.6), 'cello.bow');
  seatedPlayer(k, 'music.pianoUpright', 1.75, -0.8, -Math.PI / 2, 'piano.play');
  seatedPlayer(k, 'cafe.stool', -2.3, -0.5, toPodium(-2.3, -0.5), 'harp.pluck');
  const harp = at(-2.03, -0.21);
  k.prop('music.harp', { ...harp, y: deckY(), rot: toPodium(-2.03, -0.21) });
  standing(k, -0.55, 0.55, 'violin.bow', uniform);
  standing(k, 0.55, 0.55, 'violin.sway', uniform);
  standing(k, -0.6, -0.6, 'flute.play', uniform);
  standing(k, 0.45, -0.85, 'trumpet.play', uniform);
  standing(k, -2.0, -1.45, 'trombone.slide', uniform);
  const drummer = at(0, -2.95);
  k.person({ ...drummer, y: deckY(), heading: 0, clip: 'drum.roll', look: { ...uniform, longLegs: true } });
}

export function bandstandScene(k: Kit): void {
  stage(k);
  orchestra(k);
  conductor(k);
  tubaNest(k);
}

function sheet(): ReturnType<typeof box> {
  return merge(box(0.24, 0.006, 0.32, 'ivory'), translate(box(0.16, 0.004, 0.18, 'clay'), 0, 0.006, -0.03));
}

function conductor(k: Kit): void {
  k.vignette(
    {
      id: 'runaway-score',
      title: 'Gone with the wind',
      story: 'The conductor sweeps on in full flight while a gust lifts his score off the podium; pages flap over the front rows and his page-turner lunges after them.',
    },
    () => {
      const pod = at(POD.x, POD.z);
      const c = k.person({
        ...pod,
        y: deckY() + 0.25,
        heading: Math.PI,
        clip: 'conductor.baton',
        hold: ['upper.bowtie'],
        look: { hat: 'hat.top', hatTint: 'blueDeep', shirt: 'ink', shirt2: 'ivory', pattern: 0, pants: 'ink', longLegs: true, longSleeves: true },
      });
      k.searchable(c, 'the conductor');
      const turner = at(1.0, 2.35);
      k.person({ ...turner, y: deckY(), heading: 0.5, clip: 'point.sky', look: { shirt: 'butter', pattern: 0, glasses: 'face.glasses.round' } });
      for (let i = 0; i < 4; i++) {
        const m = k.toss([BAND.x + 1.2, deckY() + 1.6, BAND.z + 4.2 + i * 0.4], -0.5 - i * 0.15, 0.55 + i * 0.1, i * 1.6, 1.4 + i * 0.5, 1.1 + i * 0.25);
        k.dynamic(rotateX(sheet(), 0.6 + i * 0.4), m);
      }
      k.prop('music.sheetScatter', { x: BAND.x + 2.8, z: BAND.z + 4.85, rot: 0.4 });
      k.person({ x: BAND.x + 3.8, z: BAND.z + 4.5, heading: Math.PI + 0.4, clip: 'cheer.jump', age: 'child' });
      k.person({ x: BAND.x + 4.6, z: BAND.z + 3.6, heading: -2.4, clip: 'point.sky' });
    },
  );
}

function tubaNest(k: Kit): void {
  k.vignette(
    {
      id: 'tuba-nest',
      title: 'Rest in the brass section',
      story: 'The tuba player cannot play a note: a pigeon has built a nest in his bell, and a bandmate points down at it while he shrugs at the conductor.',
    },
    () => {
      const t = at(-1.45, -2.05);
      k.prop('music.tuba', { ...t, y: deckY(), rot: 0.4 });
      k.add(translate(merge(torus(0.17, 0.05, 'timber', 4, 10), translate(torus(0.1, 0.04, 'timberDeep', 4, 8), 0, -0.03, 0)), 0, 1.07, 0), { ...t, y: deckY() });
      k.prop('animal.pigeon.stand', { ...t, y: deckY() + 1.08, rot: 0.8 });
      const player = k.person({
        ...at(-1.1, -1.3),
        y: deckY(),
        heading: 0.2,
        clip: 'talk.shrug',
        look: { shirt: 'ivory', pattern: 0, pants: 'blueDeep', hat: 'hat.cap', hatTint: 'blueDeep', longLegs: true },
      });
      k.searchable(player, 'the tuba player');
      k.person({ ...at(-2.1, -2.0), y: deckY(), heading: facing(-2.1, -2.0, -1.45, -2.05), clip: 'point.down', look: { shirt: 'ivory', pattern: 0, pants: 'blueDeep', longLegs: true } });
    },
  );
}
