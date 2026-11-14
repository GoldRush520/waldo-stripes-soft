/**
 * Microstories, part 1: the four required gags (falling suitcase tower, upside-down map, the
 * sprint for the departing tram, the burst suitcase) plus the ticket queue and the departures board.
 */
import { type Geo, box, merge, rotateY, translate } from '../../../core/geo';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { CAR_Z } from './trams';
import { strideOf } from './movers';
import { SOUTH_PLATFORM } from './plan';

const PORTER = { hat: 'hat.officer', hatTint: 'coralDeep', shirt: 'coral', pattern: 0 } as const;

function porterTower(k: Kit): void {
  k.vignette({ id: 'porter-tower', title: 'Timber!', story: 'A porter trips with a tower of eleven suitcases; the top cases sail through the air while travellers duck.' }, () => {
    const x = -29;
    const z = 2.2;
    k.prop('luggage.towerTall', { x: x + 0.8, z: z + 0.2, rot: 0.5 });
    k.prop('luggage.avalanche', { x: x + 3.4, z: z + 0.9, rot: -0.15 });
    k.prop('cart.sackTruck', { x: x - 0.9, z: z - 0.4, rot: 0.3 });
    const porter = k.person({ x, z, heading: 1.2, clip: 'comedy.trip', look: PORTER, hold: ['upper.waistcoat'] });
    k.searchable(porter, 'the porter with the toppling tower');
    for (const [i, key] of (['luggage.suitcase.s', 'luggage.hatBoxes', 'luggage.duffel'] as const).entries()) {
      const m = k.toss([x + 1.8 + i * 0.7, 0.4, z + 0.6], 0.4, 0.35, i * 0.33, 1.6, 2.2 + i * 0.3);
      k.dynamic(key, m, { tint: CLOTHS[i] });
    }
    k.person({ x: x + 4.2, z: z + 2.4, face: [x + 2, z + 0.8], clip: 'comedy.startle', hold: [{ key: 'hold.bag', tint: 'sage' }] });
    k.person({ x: x + 2.4, z: z + 2.8, face: [x + 2, z + 0.8], clip: 'cheer.jump', age: 'child' });
    k.person({ x: x - 1.6, z: z + 1.6, face: [x, z], clip: 'comedy.facepalm', look: { hat: 'hat.officer', hatTint: 'blueDeep', shirt: 'blueDeep', pattern: 0 }, hold: ['neck.whistle'] });
    k.person({ x: x + 5.6, z: z + 0.6, face: [x + 3, z + 0.8], clip: 'point', age: 'elder', hold: ['hold.stick'] });
  });
}

function upsideDownMap(k: Kit): void {
  k.vignette({ id: 'map-upside-down', title: 'Which way is north?', story: 'A tourist turns his map round and round while his family each point a different way and a local shrugs at the signpost.' }, () => {
    const x = -20.4;
    const z = 6.2;
    const t = k.person({ x, z, heading: 0.2, clip: 'read.maplost', hold: ['neck.camera', 'back.rucksack'], look: { hat: 'hat.straw.wide', hatTint: 'butter', glasses: 'face.sunglasses', shirt: 'sage', pattern: 4 } });
    k.searchable(t, 'the tourist with the upside-down map');
    k.person({ x: x + 1.1, z: z + 0.4, heading: 1.6, clip: 'point.across', look: { hat: 'hat.sun', hatTint: 'coral' } });
    k.person({ x: x - 1.0, z: z + 0.5, heading: -1.7, clip: 'point', age: 'child' });
    k.person({ x: x + 0.2, z: z + 1.2, heading: 3.0, clip: 'point.sky', age: 'teen' });
    k.person({ x: x - 0.4, z: z - 1.4, face: [x, z], clip: 'talk.shrug', look: { hat: 'hat.beret', hatTint: 'blue' } });
    k.prop('luggage.suitcase.l', { x: x + 0.6, z: z - 0.6, tint: 'butter' });
  });
}

function sprint(k: Kit, southTram: number): void {
  k.vignette({ id: 'sprint', title: 'Wait for me!', story: 'A gentleman in a bowler hat sprints after the departing blue tram for ever, while the stationmaster blows his whistle and the platform cheers him on.' }, () => {
    const runner = k.person({
      x: 0,
      z: -(CAR_Z + 4.75 + 1.6),
      y: 0,
      motion: southTram,
      clip: 'sprint.run',
      speed: 2.6 / strideOf('sprint.run', 2.8),
      look: { hat: 'hat.bowler', hatTint: 'cocoa', shirt: 'ivory', pattern: 0, pants: 'slate', longLegs: true },
      hold: ['upper.tie', { key: 'hold.umbrella', tint: 'blueDeep' }],
    });
    k.searchable(runner, 'the gentleman chasing the tram');
    const y = SOUTH_PLATFORM.y;
    const z = SOUTH_PLATFORM.z0 + 1.2;
    k.person({ x: 1.6, z, y, heading: -1.4, clip: 'wave', look: { hat: 'hat.officer', hatTint: 'coral', shirt: 'blueDeep', pattern: 0 }, hold: ['neck.whistle'] });
    k.person({ x: 0.4, z: z + 0.6, y, heading: -1.2, clip: 'cheer.fistpump' });
    k.person({ x: -0.6, z: z - 0.2, y, heading: -1.5, clip: 'cheer.clap', age: 'child' });
    k.person({ x: -1.6, z: z + 0.7, y, heading: -1.8, clip: 'point', hold: [{ key: 'hold.bag', tint: 'coral' }] });
  });
}

/** A flat folded garment (shirt / trousers / sock) lying on the paving. */
function garment(w: number, d: number, col: (typeof CLOTHS)[number], x: number, z: number, rot: number): Geo {
  return translate(rotateY(box(w, 0.03, d, col), rot), x, 0.05, z);
}

function burstSuitcase(k: Kit): void {
  k.vignette({ id: 'burst-suitcase', title: 'Everything must go', story: 'A suitcase bursts open in the middle of the forecourt: shirts, socks and a hat everywhere, a puppy runs off with a sock.' }, () => {
    const x = 0.6;
    const z = 3.6;
    k.prop('luggage.openSuitcase', { x, z, rot: 0.3, tint: 'coral' });
    const clothes = merge(
      garment(0.5, 0.42, 'butter', 1.0, 0.9, 0.4),
      garment(0.22, 0.7, 'blue', -0.9, 0.6, -0.6),
      garment(0.45, 0.4, 'sage', 1.5, -0.4, 1.2),
      garment(0.12, 0.3, 'coral', -0.4, 1.4, 0.2),
      garment(0.12, 0.3, 'coral', 1.9, 0.5, 2.0),
      garment(0.5, 0.42, 'blueDeep', -1.4, -0.3, 0.9),
    );
    k.add(clothes, { x, z }, { cast: false });
    k.prop('animal.dog.terrier.run', { x: x + 2.8, z: z + 1.2, rot: 1.3 });
    k.person({ x: x - 0.5, z: z - 0.9, heading: 0.3, clip: 'comedy.facepalm', look: { hat: 'hat.fedora', hatTint: 'clay' } });
    k.person({ x: x - 1.6, z: z + 1.4, face: [x, z], clip: 'talk.laugh' });
    k.person({ x: x + 1.2, z: z + 1.5, face: [x + 1, z + 0.9], clip: 'kid.crouch', age: 'child' });
    k.person({ x: x + 3.6, z: z + 0.4, face: [x + 2.8, z + 1.2], clip: 'kid.tantrum', age: 'child' });
    k.person({ x: x + 0.9, z: z - 1.5, face: [x, z], clip: 'point.down', age: 'elder' });
  });
}

function ticketQueue(k: Kit): void {
  k.vignette({ id: 'ticket-queue', title: 'Exact change only', story: 'At the ticket kiosk a lady pays in single coins while the queue behind her tiptoes, sighs and checks its watches.' }, () => {
    const kx = -37.4;
    const kz = 5.6;
    k.prop('kiosk.ticket', { x: kx, z: kz, rot: Math.PI / 2 });
    k.person({ x: kx + 1.75, z: kz, heading: -Math.PI / 2, clip: 'vend.coins', age: 'elder', look: { hat: 'hat.pillbox', hatTint: 'coral', lower: 'lower.skirt.long' }, hold: [{ key: 'hold.bag', tint: 'butter' }] });
    k.queue([kx + 9.4, kz + 0.6], [kx + 1.85, kz], 10, { clips: ['queue.impatient', 'queue.shuffle', 'queue.tiptoe', 'idle.watch', 'idle.tap', 'stand'], spacing: 0.7 });
    k.prop('station.ticketMachine', { x: kx + 0.4, z: kz - 2.2 });
    k.prop('luggage.steamerTrunk', { x: kx + 4.4, z: kz - 0.9, tint: 'blue' });
  });
}

function departures(k: Kit): void {
  k.vignette({ id: 'departures', title: 'Platform changed!', story: 'A crowd stares up at the clattering departures board; one man points, another runs the wrong way, a third has fallen asleep on his suitcase.' }, () => {
    const x = -8;
    const z = -0.6;
    k.prop('station.departures', { x, z });
    const clips = ['lookout', 'point.sky', 'talk.animated', 'idle.watch', 'lookout', 'point', 'comedy.startle', 'stand'];
    clips.forEach((clip, i) => {
      const px = x - 2.2 + (i % 4) * 1.4 + k.rng.range(-0.15, 0.15);
      const pz = z + 1.4 + Math.floor(i / 4) * 1.1 + k.rng.range(-0.1, 0.1);
      k.person({ x: px, z: pz, face: [x, z], clip, hold: i % 3 === 0 ? [{ key: 'hold.bag', tint: k.rng.pick(CLOTHS) }] : [] });
    });
    k.prop('luggage.suitcase.lFlat', { x: x + 3.4, z: z + 1.6, rot: 0.4 }, { walkThrough: true });
    k.person({ x: x + 3.4, z: z + 1.6, y: -0.17, heading: -0.6, clip: 'sit.asleep', age: 'elder' });
    k.person({ x: x + 4.8, z: z + 3.2, heading: 1.9, clip: 'comedy.startle' });
  });
}

export function storiesA(k: Kit, southTram: number): void {
  porterTower(k);
  upsideDownMap(k);
  sprint(k, southTram);
  burstSuitcase(k);
  ticketQueue(k);
  departures(k);
}
