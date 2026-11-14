import type { Kit } from '../kit';
import type { DistrictId } from '../layout';
import { buildMarket } from './market';
import { buildCanal } from './canal';
import { buildHarbor } from './harbor';
import { buildCraft } from './craft';
import { buildCafe } from './cafe';
import { buildRooftops } from './rooftops';
import { buildTram } from './tram';
import { buildMusic } from './music';
import { buildGardens } from './gardens';
import { buildFunfair } from './funfair';
import { buildSports } from './sports';
import { buildBeach } from './beach';

export type DistrictBuilder = (k: Kit) => void;

/** Authored districts (each module owns one district polygon). */
export const DISTRICT_BUILDERS: Readonly<Record<DistrictId, DistrictBuilder>> = {
  canal: buildCanal,
  harbor: buildHarbor,
  market: buildMarket,
  craft: buildCraft,
  cafe: buildCafe,
  rooftops: buildRooftops,
  tram: buildTram,
  music: buildMusic,
  gardens: buildGardens,
  funfair: buildFunfair,
  sports: buildSports,
  beach: buildBeach,
};
