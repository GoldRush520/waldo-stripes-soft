/**
 * Microstories, part 2: reunions, a crated statue with a living twin, an escaped parrot, a cello
 * busker, the level-crossing crowd, a mountain of hat boxes, the lost umbrella, tram-spotters and
 * a sleeper on the platform.
 */
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { seatOn } from './seat';
import { CROSSING_X, SOUTH_PLATFORM, TRACKS, canalX } from './plan';

function underTheClock(k: Kit): void {
  k.vignette({ id: 'under-the-clock', title: 'Meet me under the clock', story: 'Under the forecourt clock a couple reunite with a giant hug while a friend waves a balloon and a child tugs at a sleeve.' }, () => {
    const x = -13.4;
    const z = 4.6;
    k.prop('station.clock', { x, z });
    k.person({ x: x + 0.55, z: z + 0.5, heading: -0.9, clip: 'greet.hug', look: { lower: 'lower.dress', shirt: 'coralLight', pattern: 3 } });
    k.person({ x: x + 0.95, z: z + 0.1, heading: 2.3, clip: 'greet.hug', look: { hat: 'hat.sailor', hatTint: 'ivory', shirt: 'blue', pattern: 0 } });
    k.person({ x: x - 1.0, z: z + 1.0, heading: 0.6, clip: 'wave', hold: [{ key: 'hold.balloon', tint: 'butter' }] });
    k.person({ x: x + 1.9, z: z + 1.2, heading: -1.6, clip: 'kid.tug', age: 'child' });
    k.prop('luggage.suitcase.m', { x: x + 1.6, z: z - 0.5, tint: 'sage' });
  });
}

function statueTwin(k: Kit): void {
  k.vignette({ id: 'statue-twin', title: 'Which one is the statue?', story: 'Two porters argue over a crated statue while its living double poses beside it and a tourist photographs the wrong one.' }, () => {
    const x = -2.4;
    const z = 6.8;
    k.prop('luggage.cratedStatue', { x, z, rot: -0.2 });
    k.person({ x: x + 1.1, z: z + 0.1, heading: -0.2, clip: 'statue.hero', look: { shirt: 'ivoryShade', pants: 'ivoryShade', pattern: 0, hat: null, longLegs: true } });
    k.person({ x: x - 1.2, z: z + 0.6, heading: 1.2, clip: 'talk.animated', look: { hat: 'hat.officer', hatTint: 'coralDeep' } });
    k.person({ x: x - 0.4, z: z - 1.1, heading: 0.1, clip: 'talk.shrug', look: { hat: 'hat.officer', hatTint: 'coralDeep' } });
    k.person({ x: x + 0.8, z: z - 2.2, heading: 0.2, clip: 'photo.camera', hold: ['neck.camera'], look: { hat: 'hat.bucket', hatTint: 'butter' } });
  });
}

function parrot(k: Kit): void {
  k.vignette({ id: 'parrot', title: 'The parrot has left the cage', story: 'An empty birdcage, a parrot sitting on the departures post, and its owner and two porters creeping toward it with a blanket.' }, () => {
    const x = -22;
    const z = 14.8;
    k.prop('luggage.birdCage', { x, z });
    k.prop('animal.parrot.perch', { x: x + 2.2, z: z - 0.6 });
    k.person({ x: x - 0.6, z: z + 0.6, face: [x + 2.2, z - 0.6], clip: 'point.sky', age: 'elder', look: { hat: 'hat.pillbox', hatTint: 'sage' } });
    k.person({ x: x + 1.0, z: z + 1.2, face: [x + 2.2, z - 0.6], clip: 'sign.tiptoe', look: { hat: 'hat.officer', hatTint: 'coralDeep' } });
    k.person({ x: x + 3.4, z: z + 0.6, face: [x + 2.2, z - 0.6], clip: 'sign.tiptoe', look: { hat: 'hat.officer', hatTint: 'coralDeep' } });
    k.person({ x: x - 1.4, z: z - 0.8, heading: 0.4, clip: 'talk.laugh', age: 'child' });
  });
}

function cellist(k: Kit): void {
  k.vignette({ id: 'cellist', title: 'Overture for a late tram', story: 'A cellist plays to the queue from his upturned case; a toddler conducts and a pigeon collects the coins.' }, () => {
    const x = -32.6;
    const z = -1.4;
    seatOn(k, 'music.celloChair', { x, z }, { clips: ['cello.bow'], fill: 1, hold: ['upper.bowtie'] });
    k.prop('music.buskerCase', { x: x + 0.9, z: z + 1.0 });
    k.prop('animal.pigeon.peck', { x: x + 1.2, z: z + 1.5, rot: 2 });
    k.person({ x: x + 0.4, z: z + 2.3, heading: Math.PI, clip: 'conductor.gentle', age: 'child' });
    k.person({ x: x - 1.2, z: z + 2.1, heading: 2.6, clip: 'cheer.clap' });
    k.person({ x: x + 1.7, z: z + 2.4, heading: -2.5, clip: 'talk.nod', age: 'elder' });
  });
}

function crossingCrowd(k: Kit): void {
  k.vignette({ id: 'level-crossing', title: 'Gates down', story: 'A crowd bunches at the lowered crossing gates: a cyclist balancing, a dog straining at its lead, a boy waving at every tram.' }, () => {
    const zS = TRACKS[1] + 3.2;
    const clips = ['queue.impatient', 'idle.watch', 'wave', 'stand', 'idle.tap', 'talk', 'queue.tiptoe', 'lookout'];
    clips.forEach((clip, i) => {
      const x = CROSSING_X - 1.6 + (i % 4) * 1.05 + k.rng.range(-0.1, 0.1);
      const z = zS + Math.floor(i / 4) * 0.9 + k.rng.range(-0.05, 0.1);
      k.person({ x, z, heading: Math.PI + k.rng.range(-0.3, 0.3), clip, age: i === 2 ? 'child' : undefined });
    });
    k.prop('vehicle.bicycleBasket', { x: CROSSING_X + 2.9, z: zS + 0.4, rot: Math.PI }, { walkThrough: true });
    k.person({ x: CROSSING_X + 3.5, z: zS + 0.4, heading: Math.PI, clip: 'idle.watch', look: { hat: 'hat.cycling', hatTint: 'coral' } });
    k.prop('animal.dog.dachshund.pull', { x: CROSSING_X - 2.2, z: zS - 0.3, rot: Math.PI });
    k.person({ x: CROSSING_X - 2.4, z: zS + 0.9, heading: Math.PI, clip: 'idle.hips', age: 'elder' });
    const zN = TRACKS[0] - 3.3;
    for (let i = 0; i < 5; i++) {
      k.person({ x: CROSSING_X - 1.2 + i * 1.0, z: zN - (i % 2) * 0.8, heading: k.rng.range(-0.3, 0.3), clip: k.rng.pick(['idle.watch', 'stand', 'talk', 'wave']) });
    }
  });
}

function hatBoxes(k: Kit): void {
  k.vignette({ id: 'hat-boxes', title: 'Just a few things', story: 'A grand lady travels with nineteen hat boxes, a golf bag and a steamer trunk; her porter has given up and sat down.' }, () => {
    const x = -8;
    const z = 14.9;
    k.prop('luggage.steamerTrunk', { x, z, tint: 'coral' });
    for (let i = 0; i < 4; i++) k.prop('luggage.hatBoxes', { x: x + 1.0 + (i % 2) * 0.7, z: z - 0.2 + Math.floor(i / 2) * 0.7, tint: CLOTHS[i] });
    k.prop('luggage.golfBag', { x: x - 0.9, z: z - 0.3 });
    k.person({ x: x - 0.4, z: z + 1.0, heading: 0.3, clip: 'idle.hips', look: { hat: 'hat.top.tall', hatTint: 'coral', lower: 'lower.dress.long', shirt: 'coralDeep', pattern: 0 }, hold: ['hold.umbrella'] });
    k.person({ x: x + 2.6, z: z + 0.9, y: 0, heading: -0.4, clip: 'sit.ground', look: { hat: 'hat.officer', hatTint: 'coralDeep' } });
    k.prop('cart.luggage', { x: x + 3.2, z: z - 0.2, tint: 'blue' });
  });
}

function lostUmbrella(k: Kit): void {
  k.vignette({ id: 'lost-umbrella', title: 'Lost property', story: 'The lost-property clerk holds up one blue umbrella and four travellers, each with an identical blue umbrella, all claim it.' }, () => {
    const x = -30;
    const z = 19;
    k.prop('station.lostProperty', { x, z: z - 0.2 });
    k.person({ x, z: z + 0.6, heading: 0, clip: 'vend.handover', hold: [{ key: 'hold.umbrella', tint: 'blue' }], look: { hat: 'hat.officer', hatTint: 'blue' } });
    for (let i = 0; i < 4; i++) {
      k.person({ x: x - 1.5 + i * 1.0, z: z + 1.8 + (i % 2) * 0.3, heading: Math.PI, clip: k.rng.pick(['point', 'talk.animated', 'comedy.fist']), hold: [{ key: 'hold.umbrella', tint: 'blue' }] });
    }
  });
}

function spotters(k: Kit): void {
  k.vignette({ id: 'tram-spotters', title: 'Number 7, at last', story: 'Three tram-spotters with binoculars and notebooks on the east bank cheer each tram crossing the viaduct.' }, () => {
    const z = TRACKS[1] + 4.4;
    const x = canalX(z) + 7.2;
    k.person({ x, z, heading: Math.PI + 0.6, clip: 'lookout', hold: ['neck.binoculars'], look: { hat: 'hat.deerstalker', hatTint: 'clay' } });
    k.person({ x: x + 0.9, z: z + 0.5, heading: Math.PI + 0.5, clip: 'photo.camera', hold: ['neck.camera'], look: { hat: 'hat.earflap', hatTint: 'sage' } });
    k.person({ x: x - 0.8, z: z + 0.7, heading: Math.PI + 0.7, clip: 'cheer.fistpump', hold: ['upper.scarf.long'], look: { glasses: 'face.glasses.square' } });
    k.prop('luggage.picnicHamper', { x: x + 0.2, z: z + 1.4 });
  });
}

function platformSleeper(k: Kit): void {
  k.vignette({ id: 'platform-sleeper', title: 'Missed it again', story: 'A traveller snores on the platform bench with a pigeon on his hat while his tram comes and goes.' }, () => {
    const x = -24;
    const z = SOUTH_PLATFORM.z1 - 0.45;
    const y = SOUTH_PLATFORM.y;
    seatOn(k, 'station.bench', { x, z, y, rot: Math.PI }, { clips: ['sit.asleep', 'sit.read', 'sit'], fill: 1 });
    k.prop('animal.pigeon.stand', { x: x + 0.9, z: z - 0.9, y });
    k.person({ x: x - 1.6, z: z - 0.9, y, heading: Math.PI, clip: 'talk.whisper' });
  });
}

export function storiesB(k: Kit): void {
  underTheClock(k);
  statueTwin(k);
  parrot(k);
  cellist(k);
  crossingCrowd(k);
  hatBoxes(k);
  lostUmbrella(k);
  spotters(k);
  platformSleeper(k);
}
