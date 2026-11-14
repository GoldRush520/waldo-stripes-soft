/**
 * Active clip library: performance, parade, dance, circus, water, sport, rides and craft/work.
 * Clip ids are `activity.variant`; ACTIVE_FAMILIES maps each activity to its variants so placement
 * code can pick a random variant and crowds do not look cloned. ACTIVE_GROUPS gathers activities
 * into broad themes.
 */
import type { ClipDef } from '../../pose';
import { CIRCUS_CLIPS } from './circus';
import { CRAFT_LABOUR_CLIPS } from './craft-labour';
import { CRAFT_WORKSHOP_CLIPS } from './craft-workshop';
import { MARCH_DANCE_CLIPS } from './march-dance';
import { MUSIC_B_CLIPS } from './music-percussion-keys';
import { MUSIC_A_CLIPS } from './music-strings-brass';
import { RIDE_CLIPS } from './rides';
import { SPORT_BALL_CLIPS } from './sport-ball';
import { SPORT_FITNESS_CLIPS } from './sport-fitness';
import { WATER_BOAT_CLIPS } from './water-boats';
import { WATER_SWIM_CLIPS } from './water-swim';

export const ACTIVE_CLIPS: readonly ClipDef[] = [
  ...MUSIC_A_CLIPS,
  ...MUSIC_B_CLIPS,
  ...MARCH_DANCE_CLIPS,
  ...CIRCUS_CLIPS,
  ...WATER_BOAT_CLIPS,
  ...WATER_SWIM_CLIPS,
  ...SPORT_BALL_CLIPS,
  ...SPORT_FITNESS_CLIPS,
  ...RIDE_CLIPS,
  ...CRAFT_WORKSHOP_CLIPS,
  ...CRAFT_LABOUR_CLIPS,
];

/** Activity family (the id prefix) -> clip ids, in library order. */
export const ACTIVE_FAMILIES: Readonly<Record<string, readonly string[]>> = ACTIVE_CLIPS.reduce<
  Record<string, readonly string[]>
>((acc, c) => {
  const family = c.id.slice(0, c.id.indexOf('.'));
  return { ...acc, [family]: [...(acc[family] ?? []), c.id] };
}, {});

/** Broad theme -> activity family names. */
export const ACTIVE_GROUPS: Readonly<Record<string, readonly string[]>> = {
  music: ['guitar', 'violin', 'trumpet', 'trombone', 'drum', 'accordion', 'flute', 'tuba', 'cymbal', 'harp', 'piano', 'cello', 'conductor', 'singer', 'organ'],
  march: ['march'],
  dance: ['twirl', 'waltz', 'jig', 'sway', 'conga', 'ballet', 'robot', 'groove', 'ribbon'],
  circus: ['juggle', 'statue', 'mime', 'stilts', 'tightrope', 'unicycle', 'strongman', 'hoop', 'plates', 'baton', 'clown'],
  water: ['row', 'kayak', 'gondola', 'fish', 'net', 'swim', 'dive', 'splash', 'surf'],
  sport: [
    'football', 'goalie', 'tennis', 'volley', 'basket', 'tabletennis', 'boules', 'referee',
    'jog', 'sprint', 'stretch', 'yoga', 'pushup', 'starjump', 'skiprope', 'hoop', 'tug', 'skate',
  ],
  rides: ['swing', 'seesaw', 'slide', 'ladder', 'monkeybars', 'carousel', 'ride', 'dodgem', 'kite', 'bike', 'scooter', 'wheelchair'],
  craft: [
    'hammer', 'saw', 'paint', 'easel', 'sculpt', 'pottery', 'smith', 'drill', 'sign', 'photo',
    'net', 'dough', 'pancake', 'pot', 'chop', 'hod', 'brick', 'crane', 'hoist', 'deck', 'luggage', 'porter', 'cart',
  ],
};

/** Clips whose hips rest on a seat or the ground (root lowered by at least 0.3 m). */
export const ACTIVE_SEATED: readonly string[] = [
  'harp.pluck', 'piano.play', 'piano.flourish', 'cello.bow',
  'row.pull', 'row.easy', 'kayak.paddle', 'kayak.drift', 'fish.sit',
  'swing.pump', 'swing.gentle', 'seesaw.bounce', 'slide.down', 'carousel.ride', 'carousel.wave',
  'ride.cheer', 'ride.scream', 'dodgem.steer', 'dodgem.bump', 'wheelchair.push', 'wheelchair.idle',
  'pottery.wheel', 'net.mend',
];
