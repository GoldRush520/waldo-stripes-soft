/**
 * The railway: paving, the double track, the twin tram viaducts over the canal, the station hall
 * and its platforms, catenary, buffer stops, signals, the level crossing and the canal railings.
 */
import { box, detail, merge, translate } from '../../../core/geo';
import { civicMeta } from '../../../props/civic/variants';
import { tramTrack } from '../../../props/civic/track';
import { tramViaduct } from '../../../props/civic/bridges2';
import type { Kit } from '../../kit';
import { CROSSING_X, EAST_LAND, HALL, LINE_Z, TRACKS, TRACK_X0, TRACK_X1, TRACK_Y, VIADUCT, WEST_LAND, rect, westRect } from './plan';

const V0 = VIADUCT.x - VIADUCT.length / 2;
const V1 = VIADUCT.x + VIADUCT.length / 2;

function paving(k: Kit): void {
  k.ground(WEST_LAND, 'clayLight');
  k.ground(EAST_LAND, 'clayLight');
  /* forecourt: butter border, ivory centre; promenade and yard in a quieter tone */
  k.ground(westRect(-41, -3.8, 16, 9.2, 1.2), 'butterLight', 0.03, 0.02);
  k.ground(westRect(-40, -3.2, 15, 8.6, 1.8), 'ivory', 0.05, 0.02);
  k.ground(westRect(-44, 14.6, 8, 15.4, 1.5), 'ivoryShade', 0.03, 0.02);
  k.ground(rect(CROSSING_X - 1.6, -18.5, CROSSING_X + 1.6, -3.8), 'ivoryShade', 0.03, 0.015);
  k.ground(rect(37, -4, 47, 8), 'butterLight', 0.03, 0.02);
}

function tracks(k: Kit): void {
  const west = tramTrack(V0 - TRACK_X0, { bed: 'stone' });
  const east = tramTrack(TRACK_X1 - V1, { bed: 'stone' });
  for (const z of TRACKS) {
    k.add(west, { x: (TRACK_X0 + V0) / 2, z, y: TRACK_Y }, { cast: false });
    k.add(east, { x: (V1 + TRACK_X1) / 2, z, y: TRACK_Y }, { cast: false });
    /* the tram corridor: nobody may stand here */
    k.block((TRACK_X0 + TRACK_X1) / 2, z, TRACK_X1 - TRACK_X0 + 1.5, 3.0);
  }
  /* overhead contact wires (thin: near tier only) */
  const wire = detail(box(TRACK_X1 - TRACK_X0, 0.025, 0.025, 'slate'));
  k.add(merge(TRACKS.map((z) => translate(wire, 0, 5.49, z - LINE_Z))), { x: (TRACK_X0 + TRACK_X1) / 2, z: LINE_Z }, { cast: false });
}

function viaducts(k: Kit): void {
  const v = tramViaduct({ span: VIADUCT.length, width: VIADUCT.width });
  /* the second deck sits 2 cm higher so the shared middle parapets never z-fight */
  TRACKS.forEach((z, i) => {
    k.add(v.geo, { x: VIADUCT.x, z, y: i * 0.02 });
    k.surface('bridge', rect(V0, z - 1.5, V1, z + 1.5), 0.05 + i * 0.02);
  });
}

function hall(k: Kit): void {
  k.prop('hall.station', { x: HALL.x, z: HALL.z });
  k.prop('hall.station.glass', { x: HALL.x, z: HALL.z });
  for (const p of civicMeta('hall.station').platforms) {
    k.surface('deck', rect(HALL.x + p.x0, HALL.z + p.z0, HALL.x + p.x1, HALL.z + p.z1), p.y);
  }
  /* rib columns along both long sides, canopy posts and lamps on the platforms */
  for (let i = 0; i <= 6; i++) {
    for (const s of [-1, 1]) k.block(HALL.x - 11 + (i * 22) / 6, HALL.z + s * 6.8, 0.7, 0.7);
  }
  for (const s of [-1, 1]) {
    for (const pz of [-4.6, 4.6]) {
      for (const dx of [-1.8, 1.8]) k.block(HALL.x + s * 14 + dx, HALL.z + pz, 0.4, 0.4);
      k.block(HALL.x + s * 16.4, HALL.z + pz, 0.4, 0.4);
    }
  }
}

function furniture(k: Kit): void {
  for (const x of [-41, -35, 5, 13.5, 43.5]) {
    k.prop('tram.catenaryPole', { x, z: TRACKS[0] - 2.6, rot: -Math.PI / 2 });
    k.prop('tram.catenaryPole', { x, z: TRACKS[1] + 2.6, rot: Math.PI / 2 });
  }
  for (const z of TRACKS) {
    k.prop('tram.bufferStop', { x: TRACK_X0 - 0.6, z, rot: Math.PI / 2 });
    k.prop('tram.bufferStop', { x: TRACK_X1 + 0.6, z, rot: -Math.PI / 2 });
  }
  k.prop('tram.signal', { x: -32.8, z: TRACKS[0] - 2.8, rot: Math.PI / 2 });
  k.prop('tram.signal', { x: 41.6, z: TRACKS[1] + 2.9, rot: -Math.PI / 2 });
  /* level crossing: gate arms lowered across the crossing road */
  k.prop('tram.crossingGate', { x: CROSSING_X - 2, z: TRACKS[1] + 2.35 });
  k.prop('tram.crossingGate', { x: CROSSING_X + 2, z: TRACKS[0] - 2.35, rot: Math.PI });
}

/** Iron railings along both canal banks, broken where the viaducts land. */
function bankRails(k: Kit): void {
  const dx = 18 / 49.4;
  const dz = -46 / 49.4;
  const rot = Math.atan2(-dz, dx);
  for (let t = 2; t < 49; t += 4.1) {
    const cx = 15 + dx * t;
    const cz = 24 + dz * t;
    if (cz < -19.5 || cz > 21.5 || (cz > LINE_Z - 4.6 && cz < LINE_Z + 4.6)) continue;
    for (const s of [-1, 1]) k.prop('rail.iron4', { x: cx + s * 5.5 * -dz, z: cz + s * 5.5 * dx, rot });
  }
}

export function railway(k: Kit): void {
  paving(k);
  tracks(k);
  viaducts(k);
  hall(k);
  furniture(k);
  bankRails(k);
}
