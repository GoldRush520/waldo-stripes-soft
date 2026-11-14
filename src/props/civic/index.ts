/**
 * Civic landmarks & infrastructure: bridges, towers, halls, kiosks, ground works, waterfront decks,
 * tram track, railings, paving decals and construction props. Parametric builders return walkable
 * metadata alongside the geometry; `civicMeta(key)` gives the metadata of registered variants.
 */
export { PROPS } from './defs';
export { civicMeta, variantGeo, type CivicVariantKey } from './variants';
export type { DeckPoint, Floor, P2, P3, Rect } from './util';
export { stoneArchBridge, ironFootbridge, coveredBridge, type BridgeOpts, type BridgeResult } from './bridges';
export { drawBridge, plankRopeBridge, tramViaduct, type DrawBridgeOpts } from './bridges2';
export { clockTower, lighthouse, bellTower, archPlate, type ClockTowerOpts, type LighthouseOpts, type BellTowerOpts } from './towers';
export {
  waterTower,
  harbourLookout,
  steeple,
  obelisk,
  statueColumn,
  type WaterTowerOpts,
  type LookoutResult,
  type SteepleOpts,
} from './towers2';
export { marketHall, stationHall, type MarketHallOpts, type MarketHallResult, type StationResult } from './halls';
export { greenhouse, bandstand, type GreenhouseResult, type BandstandOpts, type BandstandResult } from './halls2';
export {
  ticketKiosk,
  newsKiosk,
  gazebo,
  gazeboSeats,
  pierPavilion,
  boathouse,
  bakeryChimney,
  type GazeboResult,
  type BoathouseResult,
} from './kiosks';
export {
  stairs,
  ramp,
  retainingWall,
  platform,
  quayWall,
  type StairsOpts,
  type StairsResult,
  type RampResult,
  type PlatformResult,
  type QuayOpts,
} from './ground';
export { jetty, boardwalk, pleasurePier, breakwater, type DeckResult, type PierOpts } from './piers';
export { tramTrack, tramCurve, type TrackOpts, type CurveResult } from './track';
export { ironRailing, balustrade, railFence, picketFence, gate, profileRail, type RailOpts, type GateOpts } from './fences';
export { crosswalk, plazaRings, compassRose, manhole, arcade, festivalArch, type ArcadeOpts, type ArcadeResult } from './decals';
export { scaffold, houseFrame, hoarding, type ScaffoldOpts, type ScaffoldResult, type FrameResult } from './construction';
export { lampPost, clockFace, bell, bollard, mooringRing } from './fixtures';
