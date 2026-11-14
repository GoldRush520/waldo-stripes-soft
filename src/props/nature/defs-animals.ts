/** PropDefs: animals (≤ 220 near / ≤ 90 far, origin under the body centre, facing +z) and airborne things. */
import type { PropDef } from '../registry';
import { BALLOON_SEATS, balloon, boxKite, diamondKite, fishWindsock, lanterns } from './airborne';
import {
  angryGoose,
  butterflies,
  crow,
  duck,
  ducklingRow,
  gullFlying,
  gullStanding,
  hen,
  heron,
  parrotPerch,
  pigeonFlock,
  pigeonPeck,
  pigeonStand,
  rooster,
  swan,
} from './animals/birds';
import { type CatPose, cat, sleepingCat } from './animals/cats';
import { DACHSHUND, type DogPose, POODLE, SHEEPDOG, TERRIER, dog, scarfThief } from './animals/dogs';
import { HORSE_SEAT_Y, donkeyPanniers, goat, horse, piglet, pony, sheep } from './animals/farm';
import type { Species } from './animals/rig';
import { frogOnPad, hedgehog, mouseCheese, rabbit, sittingMonkey, squirrel, tortoise } from './animals/small';
import { crab, jumpingFish, octopus, sealOnRock } from './animals/water';
import { def } from './def';

const A = ['animal', 'rigid'];

const BREEDS: ReadonlyArray<readonly [string, Species]> = [
  ['terrier', TERRIER],
  ['dachshund', DACHSHUND],
  ['sheepdog', SHEEPDOG],
  ['poodle', POODLE],
];
const DOG_POSE_KEYS: readonly DogPose[] = ['stand', 'sit', 'run', 'pull'];

const dogs: readonly PropDef[] = BREEDS.flatMap(([name, s]) =>
  DOG_POSE_KEYS.map((pose) =>
    def(`animal.dog.${name}.${pose}`, (q) => dog(q, s, pose), [s.body[1] * 2, s.body[0] * 2], {
      tint: s.coat,
      tags: [...A, 'dog', `pose:${pose}`, ...(pose === 'pull' ? ['lead'] : [])],
    }),
  ),
);

const CAT_POSE_KEYS: readonly CatPose[] = ['sit', 'walk', 'loaf', 'stretch', 'pounce'];

const cats: readonly PropDef[] = [
  ...CAT_POSE_KEYS.map((pose) => def(`animal.cat.${pose}`, (q) => cat(q, pose), [0.15, 0.3], { tint: 'butterDeep', tags: [...A, 'cat', `pose:${pose}`] })),
  def('animal.cat.sleep', sleepingCat, [0.3, 0.3], { tint: 'butterDeep', tags: [...A, 'cat', 'pose:sleep'] }),
];

const BIRD = [...A, 'bird'];

const birds: readonly PropDef[] = [
  def('animal.gull.standing', gullStanding, [0.15, 0.3], { tint: 'ivory', tags: [...BIRD, 'seaside'] }),
  def('animal.gull.flying', gullFlying, [0, 0], { tint: 'ivory', tags: [...BIRD, 'seaside', 'airborne'], float: true }),
  def('animal.pigeon.peck', pigeonPeck, [0.1, 0.2], { tint: 'slate', tags: BIRD }),
  def('animal.pigeon.stand', pigeonStand, [0.1, 0.2], { tint: 'slate', tags: BIRD }),
  def('animal.pigeon.flock', pigeonFlock, [0.9, 0.7], { tint: 'slate', tags: [...BIRD, 'flock'] }),
  def('animal.duck', duck, [0.2, 0.35], { tint: 'ivoryShade', tags: [...BIRD, 'water'] }),
  def('animal.ducklings', ducklingRow, [0.2, 1.1], { tint: 'ivoryShade', tags: [...BIRD, 'water', 'story'] }),
  def('animal.swan', swan, [0.4, 0.75], { tint: 'ivory', tags: [...BIRD, 'water'] }),
  def('animal.goose.angry', angryGoose, [0.26, 0.5], { tint: 'ivory', tags: [...BIRD, 'story', 'comedy'] }),
  def('animal.heron', heron, [0.2, 0.4], { tint: 'stone', tags: [...BIRD, 'waterside'] }),
  def('animal.parrot.perch', parrotPerch, [0.36, 0.36], { tint: 'sage', tags: [...BIRD, 'pet'] }),
  def('animal.crow', crow, [0.14, 0.3], { tint: 'ink', tags: BIRD }),
  def('animal.hen', hen, [0.24, 0.34], { tint: 'clayDeep', tags: [...BIRD, 'farm'] }),
  def('animal.rooster', rooster, [0.26, 0.36], { tint: 'coralDeep', tags: [...BIRD, 'farm'] }),
  def('animal.butterflies', butterflies, [0, 0], { tint: 'butter', tags: [...A, 'insect', 'airborne'], float: true }),
];

const critters: readonly PropDef[] = [
  def('animal.rabbit', rabbit, [0.2, 0.3], { tint: 'clayLight', tags: A }),
  def('animal.squirrel', squirrel, [0.1, 0.18], { tint: 'coralDeep', tags: A }),
  def('animal.hedgehog', hedgehog, [0.24, 0.3], { tint: 'timberDeep', tags: A }),
  def('animal.tortoise', tortoise, [0.38, 0.4], { tint: 'sageDeep', tags: A }),
  def('animal.mouse.cheese', mouseCheese, [0.1, 0.12], { tint: 'stone', tags: [...A, 'story'] }),
  def('animal.monkey', sittingMonkey, [0.24, 0.24], { tint: 'timberDeep', tags: A }),
  def('animal.frog.lilypad', frogOnPad, [0, 0], { tint: 'sageLight', tags: [...A, 'water', 'walk-through'], float: true }),
  def('animal.fish.jumping', jumpingFish, [0, 0], { tint: 'blue', tags: [...A, 'water', 'walk-through'], float: true }),
  def('animal.crab', crab, [0.3, 0.2], { tint: 'coral', tags: [...A, 'beach'] }),
  def('animal.octopus', octopus, [0, 0], { tint: 'coral', tags: [...A, 'water', 'harbour', 'walk-through'], float: true }),
  def('animal.seal.rock', sealOnRock, [1.4, 1.0], { tint: 'slate', tags: [...A, 'harbour'] }),
];

const farm: readonly PropDef[] = [
  def('animal.goat', goat, [0.28, 0.7], { tint: 'ivory', tags: [...A, 'farm'] }),
  def('animal.donkey.panniers', donkeyPanniers, [0.5, 0.95], { tint: 'stone', tags: [...A, 'farm', 'story'] }),
  def('animal.pony', pony, [0.4, 1.0], { tint: 'butterLight', tags: [...A, 'farm', 'ride'] }),
  def('animal.horse', horse, [0.54, 1.4], {
    tint: 'timber',
    tags: [...A, 'farm', 'ride', 'seat:hip'],
    seats: [{ x: 0, y: HORSE_SEAT_Y, z: -0.05, heading: 0 }],
  }),
  def('animal.sheep', sheep, [0.5, 0.75], { tint: 'ivory', tags: [...A, 'farm'] }),
  def('animal.piglet', piglet, [0.26, 0.44], { tint: 'coralLight', tags: [...A, 'farm'] }),
  def('animal.dog.scarf', (q) => scarfThief(q), [0.24, 0.48], { tint: 'coral', tags: [...A, 'dog', 'story', 'comedy', 'pose:run'] }),
];

const AIR = ['airborne', 'festive'];

const air: readonly PropDef[] = [
  def('air.kite.diamond', diamondKite, [0, 0], { tint: 'coral', tags: AIR, float: true }),
  def('air.kite.box', boxKite, [0, 0], { tint: 'blue', tags: AIR, float: true }),
  def('air.windsock.fish', fishWindsock, [0.1, 0.1], { tint: 'coral', tags: ['festive', 'pole'] }),
  def('air.balloon', balloon, [1.2, 1.2], { tint: 'coral', tags: [...AIR, 'ride', 'seat:feet', 'landmark'], seats: BALLOON_SEATS }),
  def('air.lanterns', lanterns, [0, 0], { tint: 'butter', tags: AIR, float: true }),
];

export const ANIMAL_PROPS: readonly PropDef[] = [...dogs, ...cats, ...birds, ...critters, ...farm, ...air];
