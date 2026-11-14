/**
 * Leisure prop library: funfair rides and side-shows, sports ground and playground, beach and promenade.
 *
 * Moving parts are separate props with their origin at the pivot (see the metadata constants below);
 * every prop carries tags `size:*` (budget class), `origin:*` (ground | pivot | waterline | sunk | decal)
 * and, when it has seats, `seat:hip` or `seat:feet`.
 */
import type { PropDef } from '../registry';
import { ATTRACTION_PROPS } from './attractions';
import { BEACH_PROPS } from './beach';
import { BEACH2_PROPS } from './beach2';
import { BEACH3_PROPS } from './beach3';
import { CAROUSEL_PROPS } from './carousel';
import { COASTER_PROPS } from './coaster';
import { DODGEM_PROPS } from './dodgem';
import { FERRIS_PROPS } from './ferris';
import { GAME_PROPS } from './games';
import { HELTER_PROPS } from './helter';
import { PLAYGROUND_PROPS } from './playground';
import { PLAYGROUND2_PROPS } from './playground2';
import { RIDE_PROPS } from './rides';
import { SPORT_PROPS } from './sports';
import { SPORTKIT_PROPS } from './sportskit';
import { TENT_PROPS } from './tents';
import { TREAT_PROPS } from './treats';

export { FERRIS_HUB, FERRIS_PIVOTS, FERRIS_RADIUS } from './ferris';
export { COASTER_TRACK } from './coaster';
export { CAROUSEL_PLATFORM_RADIUS } from './carousel';
export { CHAIRSWING_HUB, SWINGBOAT_PIVOT } from './rides';
export { SEESAW_PIVOT, SWING_PIVOTS } from './playground';
export { POOL_WATER_Y } from './playground2';
export { queueRail } from './attractions';
export { buoyLine, promenadeRailing } from './beach3';
export { BUDGET } from './kit';

export const PROPS: readonly PropDef[] = [
  ...FERRIS_PROPS,
  ...CAROUSEL_PROPS,
  ...RIDE_PROPS,
  ...HELTER_PROPS,
  ...COASTER_PROPS,
  ...DODGEM_PROPS,
  ...TENT_PROPS,
  ...GAME_PROPS,
  ...TREAT_PROPS,
  ...ATTRACTION_PROPS,
  ...SPORT_PROPS,
  ...SPORTKIT_PROPS,
  ...PLAYGROUND_PROPS,
  ...PLAYGROUND2_PROPS,
  ...BEACH_PROPS,
  ...BEACH2_PROPS,
  ...BEACH3_PROPS,
];
