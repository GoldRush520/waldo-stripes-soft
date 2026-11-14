/**
 * Registered civic props. Tags carry the size class used for triangle budgets
 * (`size:landmark|house|stall|furniture|clutter`) and walkability hints (`walkable`, `walkthrough`).
 */
import type { PropDef } from '../registry';
import { bakeryChimney, gazeboSeats, newsKiosk, pierPavilion, ticketKiosk } from './kiosks';
import { hoarding } from './construction';
import { compassRose, crosswalk, festivalArch, manhole, plazaRings } from './decals';
import { balustrade, gate, ironRailing, picketFence, railFence } from './fences';
import { quayWall, retainingWall } from './ground';
import { breakwater } from './piers';
import { tramTrack } from './track';
import { bellTower, clockTower, lighthouse } from './towers';
import { obelisk, statueColumn, steeple, waterTower } from './towers2';
import { V, variantGeo } from './variants';

const LANDMARK = 'size:landmark';
const HOUSE = 'size:house';
const STALL = 'size:stall';
const FURNITURE = 'size:furniture';
const CLUTTER = 'size:clutter';

const BRIDGES: readonly PropDef[] = [
  { key: 'bridge.stone', build: () => variantGeo('bridge.stone'), footprint: [16, 4.2], tags: ['bridge', 'walkable', LANDMARK] },
  { key: 'bridge.iron', build: () => variantGeo('bridge.iron'), footprint: [15, 2.6], tags: ['bridge', 'walkable', LANDMARK] },
  { key: 'bridge.covered', build: () => variantGeo('bridge.covered'), footprint: [16, 3.2], defaultTint: 'coral', tags: ['bridge', 'walkable', LANDMARK] },
  { key: 'bridge.draw', build: () => variantGeo('bridge.draw'), footprint: [16, 3.6], tags: ['bridge', 'walkable', LANDMARK] },
  { key: 'bridge.draw.raised', build: () => variantGeo('bridge.draw.raised'), footprint: [16, 3.6], tags: ['bridge', 'walkable', LANDMARK] },
  { key: 'bridge.rope', build: () => variantGeo('bridge.rope'), footprint: [12.2, 1.6], tags: ['bridge', 'walkable', LANDMARK] },
  { key: 'bridge.viaduct', build: () => variantGeo('bridge.viaduct'), footprint: [24, 4.4], tags: ['bridge', 'tram', 'walkable', LANDMARK] },
];

const TOWERS: readonly PropDef[] = [
  { key: 'tower.clock', build: () => clockTower(), footprint: [5.4, 5.4], defaultTint: 'coral', tags: ['tower', 'landmark', LANDMARK] },
  { key: 'tower.lighthouse', build: () => lighthouse(), footprint: [6.5, 6.5], tags: ['tower', 'harbour', LANDMARK] },
  { key: 'tower.bell', build: () => bellTower(), footprint: [3.8, 3.8], defaultTint: 'coral', tags: ['tower', LANDMARK] },
  { key: 'tower.water', build: () => waterTower(), footprint: [3.6, 3.6], defaultTint: 'coral', tags: ['tower', LANDMARK] },
  { key: 'tower.lookout', build: () => variantGeo('tower.lookout'), footprint: [3.6, 3.6], defaultTint: 'coral', tags: ['tower', 'harbour', 'walkable', LANDMARK] },
  { key: 'tower.steeple', build: () => steeple(), footprint: [3, 3], tags: ['tower', LANDMARK] },
  { key: 'monument.obelisk', build: () => obelisk(), footprint: [3, 3], tags: ['monument', HOUSE] },
  { key: 'monument.column', build: () => statueColumn(), footprint: [3, 3], tags: ['monument', HOUSE] },
];

const HALLS: readonly PropDef[] = [
  { key: 'hall.market', build: () => variantGeo('hall.market'), footprint: [0, 0], defaultTint: 'coral', tags: ['hall', 'market', 'walkthrough', LANDMARK] },
  { key: 'hall.station', build: () => variantGeo('hall.station'), footprint: [0, 0], defaultTint: 'coral', tags: ['hall', 'tram', 'walkthrough', LANDMARK] },
  { key: 'hall.station.glass', build: () => V['hall.station']().glass, footprint: [0, 0], material: 'glass', tags: ['hall', 'glass', LANDMARK] },
  { key: 'greenhouse.frame', build: () => variantGeo('greenhouse'), footprint: [0, 0], defaultTint: 'coral', tags: ['greenhouse', 'walkthrough', LANDMARK] },
  { key: 'greenhouse.glass', build: () => V.greenhouse().glass, footprint: [0, 0], material: 'glass', tags: ['greenhouse', 'glass', LANDMARK] },
  { key: 'bandstand', build: () => variantGeo('bandstand'), footprint: [7.2, 7.2], defaultTint: 'coral', tags: ['stage', 'walkable', 'park', LANDMARK] },
  { key: 'kiosk.ticket', build: () => ticketKiosk(), footprint: [2.4, 2.4], defaultTint: 'coral', tags: ['kiosk', STALL] },
  { key: 'kiosk.news', build: () => newsKiosk(), footprint: [2.4, 2.4], defaultTint: 'coral', tags: ['kiosk', STALL] },
  {
    key: 'gazebo',
    build: () => variantGeo('gazebo'),
    footprint: [5, 5],
    defaultTint: 'coral',
    tags: ['park', 'seat', 'seat:hip', 'walkable', HOUSE],
    seats: gazeboSeats(),
  },
  { key: 'pavilion.pier', build: () => pierPavilion(), footprint: [6.4, 6.4], defaultTint: 'coral', tags: ['pier', 'walkthrough', HOUSE] },
  { key: 'boathouse', build: () => variantGeo('boathouse'), footprint: [6.6, 8.8], defaultTint: 'coral', tags: ['harbour', 'waterfront', HOUSE] },
  { key: 'chimney.bakery', build: () => bakeryChimney(), footprint: [2.6, 2.6], tags: ['industry', HOUSE] },
];

const GROUND: readonly PropDef[] = [
  { key: 'stairs.wide', build: () => variantGeo('stairs.wide'), footprint: [4.5, 2.6], tags: ['stairs', 'walkable', STALL] },
  { key: 'stairs.narrow', build: () => variantGeo('stairs.narrow'), footprint: [2.1, 1.9], tags: ['stairs', 'walkable', STALL] },
  { key: 'ramp.gentle', build: () => variantGeo('ramp.gentle'), footprint: [2.7, 7], tags: ['ramp', 'walkable', STALL] },
  { key: 'wall.retaining6', build: () => retainingWall(6, 1.5), footprint: [6, 0.6], tags: ['wall', 'terrace', STALL] },
  { key: 'terrace.block', build: () => variantGeo('terrace.block'), footprint: [8, 6], tags: ['terrace', 'walkable', STALL] },
  { key: 'terrace.corner', build: () => variantGeo('terrace.corner'), footprint: [10, 10], tags: ['terrace', 'walkable', HOUSE] },
  { key: 'quay.wall8', build: () => quayWall(8), footprint: [8, 1.6], tags: ['quay', 'waterfront', STALL] },
  { key: 'quay.steps8', build: () => quayWall(8, { steps: true }), footprint: [8, 1.6], tags: ['quay', 'waterfront', STALL] },
  { key: 'pier.jetty8', build: () => variantGeo('pier.jetty8'), footprint: [1.8, 8], tags: ['pier', 'walkable', 'waterfront', STALL] },
  { key: 'pier.jetty14', build: () => variantGeo('pier.jetty14'), footprint: [2.2, 14], tags: ['pier', 'walkable', 'waterfront', HOUSE] },
  { key: 'boardwalk.8', build: () => variantGeo('boardwalk.8'), footprint: [8, 2], tags: ['boardwalk', 'walkable', STALL] },
  { key: 'pier.pleasure', build: () => variantGeo('pier.pleasure'), footprint: [6, 24], tags: ['pier', 'walkable', 'waterfront', LANDMARK] },
  { key: 'breakwater.12', build: () => breakwater(12), footprint: [12, 4], tags: ['harbour', 'rocks', HOUSE] },
  { key: 'track.straight4', build: () => tramTrack(4), footprint: [0, 0], tags: ['tram', 'track', FURNITURE] },
  { key: 'track.straight8', build: () => tramTrack(8), footprint: [0, 0], tags: ['tram', 'track', STALL] },
  { key: 'track.curve90', build: () => variantGeo('track.curve90'), footprint: [0, 0], tags: ['tram', 'track', STALL] },
  { key: 'track.curve45', build: () => variantGeo('track.curve45'), footprint: [0, 0], tags: ['tram', 'track', STALL] },
];

const EDGES: readonly PropDef[] = [
  { key: 'rail.iron4', build: () => ironRailing(4), footprint: [4, 0.1], tags: ['railing', FURNITURE] },
  { key: 'balustrade.4', build: () => balustrade(4), footprint: [4, 0.3], tags: ['railing', STALL] },
  { key: 'fence.rail4', build: () => railFence(4), footprint: [4, 0.2], tags: ['fence', FURNITURE] },
  { key: 'fence.picket4', build: () => picketFence(4), footprint: [4, 0.1], tags: ['fence', FURNITURE] },
  { key: 'gate.iron', build: () => gate(2.4), footprint: [3.3, 0.5], tags: ['gate', STALL] },
  { key: 'gate.iron.open', build: () => gate(2.4, { open: 1 }), footprint: [3.3, 0.5], tags: ['gate', STALL] },
];

const PAVING_AND_SITE: readonly PropDef[] = [
  { key: 'decal.crosswalk', build: () => crosswalk(6), footprint: [0, 0], tags: ['decal', 'street', FURNITURE] },
  { key: 'decal.plaza', build: () => plazaRings(5), footprint: [0, 0], tags: ['decal', 'plaza', STALL] },
  { key: 'decal.compass', build: () => compassRose(2.5), footprint: [0, 0], tags: ['decal', 'plaza', STALL] },
  { key: 'decal.manhole', build: () => manhole(), footprint: [0, 0], tags: ['decal', 'street', CLUTTER] },
  { key: 'arcade.5', build: () => variantGeo('arcade.5'), footprint: [15, 3], defaultTint: 'coral', tags: ['arcade', 'walkthrough', HOUSE] },
  { key: 'arch.festival', build: () => festivalArch(), footprint: [0, 0], defaultTint: 'coral', tags: ['festival', 'walkthrough', HOUSE] },
  { key: 'scaffold.3x3', build: () => variantGeo('scaffold.3x3'), footprint: [6, 1], tags: ['construction', 'walkable', STALL] },
  { key: 'scaffold.2x2', build: () => variantGeo('scaffold.2x2'), footprint: [4, 1], tags: ['construction', 'walkable', STALL] },
  { key: 'frame.house', build: () => variantGeo('frame.house'), footprint: [6.2, 5.2], tags: ['construction', 'walkable', HOUSE] },
  { key: 'hoarding.6', build: () => hoarding(6), footprint: [6, 0.2], defaultTint: 'coral', tags: ['construction', STALL] },
];

export const PROPS: readonly PropDef[] = [...BRIDGES, ...TOWERS, ...HALLS, ...GROUND, ...EDGES, ...PAVING_AND_SITE];
