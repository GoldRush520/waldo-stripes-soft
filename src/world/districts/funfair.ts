/**
 * Funfair — the big wheel, carousel, chair-swing, helter-skelter, big top, kiddie coaster, dodgems
 * and swing boats around a festooned midway. Every ride really moves with its riders locked to the
 * same motion frame. Plan and helpers live in ./funfair/.
 */
import type { Kit } from '../kit';
import { crowdFill, lookAlikes, targetSpots, walkers } from './funfair/crowd';
import { attractions, benches, bigTop, carts, dressing, gamesRow, ground } from './funfair/midway';
import { chairSwing, coaster, dodgems, helterSkelter, swingBoats } from './funfair/rides';
import { floatingClown, highStriker, lostTeddy, stiltWalker } from './funfair/stories';
import { coasterGranny, coconutShy, cottonCandy, dodgemJam, fortuneTeller, helterGrandpa, ringmaster, swingBoatRiders } from './funfair/stories2';
import { bigWheel, carousel, wheelBalloon } from './funfair/wheel';

function rides(k: Kit): void {
  wheelBalloon(k, bigWheel(k));
  carousel(k);
  chairSwing(k);
  swingBoatRiders(k, swingBoats(k));
  const cars = coaster(k);
  if (cars[0] !== undefined) coasterGranny(k, cars[0]);
  dodgems(k);
  dodgemJam(k);
  const sliders = helterSkelter(k);
  if (sliders[0] !== undefined) helterGrandpa(k, sliders[0]);
}

function stories(k: Kit): void {
  highStriker(k);
  floatingClown(k);
  lostTeddy(k);
  stiltWalker(k);
  fortuneTeller(k);
  ringmaster(k);
  coconutShy(k);
  cottonCandy(k);
}

export function buildFunfair(k: Kit): void {
  ground(k);
  bigTop(k);
  attractions(k);
  gamesRow(k);
  carts(k);
  dressing(k);
  rides(k);
  stories(k);
  benches(k);
  lookAlikes(k);
  walkers(k);
  const spots = targetSpots(k);
  crowdFill(k, 640, spots);
  crowdFill(k, 220, spots, [1, 2]);
}
