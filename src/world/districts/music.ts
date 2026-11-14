/**
 * Music square. The octagonal bandstand with its orchestra sits at the heart of an elliptical parade
 * ring circled by the marching band; curved rows of audience face it from the south; the clock tower
 * rises north of the ring; house rows with café terraces close the north and east; the fountain,
 * maypole, tightrope and dance floor fill the south; the puppet theatre, busker and organ grinder
 * line the canal side. See music/plan.ts for the coordinates.
 */
import type { Kit } from '../kit';
import { fountainJuggler, livingStatue, organGrinder, puppetShow, tightrope } from './music/acts';
import { audience, dozingListener } from './music/audience';
import { bandstandScene } from './music/bandstand';
import { cafes, dancingWaiter } from './music/cafes';
import { densityFill } from './music/crowd';
import { danceFloor, maypole } from './music/dance';
import { clockTower, lookalikes, targetSpots, walkers } from './music/extras';
import { dressing, greenery, lamps, paving } from './music/ground';
import { houseRows } from './music/houses';
import { marchingBand, rivalBusker } from './music/parade';

export function buildMusic(k: Kit): void {
  paving(k);
  houseRows(k);
  clockTower(k);
  bandstandScene(k);
  audience(k);
  dozingListener(k);
  marchingBand(k);
  rivalBusker(k);
  puppetShow(k);
  livingStatue(k);
  tightrope(k);
  fountainJuggler(k);
  organGrinder(k);
  danceFloor(k);
  maypole(k);
  cafes(k);
  dancingWaiter(k);
  greenery(k);
  lamps(k);
  dressing(k);
  lookalikes(k);
  targetSpots(k);
  walkers(k);
  densityFill(k, 420, 90);
}
