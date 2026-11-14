/**
 * Structures standing in the basin: three timber jetties (the middle one with a T-head landing
 * stage), the L-shaped breakwater with a walkable crest path, the banded lighthouse and the seal rock.
 * Every walkable deck is declared as a surface and every footprint in the water is claimed so boats
 * are never moored through it.
 */
import { type Ctx, claim } from './ctx';
import { BOATHOUSE, STEP_XS, BW_END_X, BW_X, BW_Z, JETTIES, JETTY_W, JETTY_Y, LIGHTHOUSE, PATH_Y, TEE, WATER } from './plan';

export function jetties(c: Ctx): void {
  const k = c.k;
  for (const j of JETTIES) {
    k.prop('pier.jetty14', { x: j.x, z: j.len / 2 }, { walkThrough: true });
    const hw = JETTY_W / 2;
    k.surface('pier', [[j.x - hw, -0.2], [j.x + hw, -0.2], [j.x + hw, j.len], [j.x - hw, j.len]], JETTY_Y);
    claim(c, { x0: j.x - hw - 0.3, z0: 0, x1: j.x + hw + 0.3, z1: j.len + 0.4 });
  }
  k.prop('pier.jetty8', { x: TEE.x, z: TEE.z, rot: Math.PI / 2 }, { walkThrough: true });
  const hl = TEE.len / 2;
  const hw = TEE.w / 2;
  k.surface('pier', [[TEE.x - hl, TEE.z - hw], [TEE.x + hl, TEE.z - hw], [TEE.x + hl, TEE.z + hw], [TEE.x - hl, TEE.z + hw]], JETTY_Y);
  claim(c, { x0: TEE.x - hl - 0.4, z0: TEE.z - hw - 0.3, x1: TEE.x + hl + 0.4, z1: TEE.z + hw + 0.4 });
  /* boathouse slipway and the three flights of quay steps stay clear of hulls */
  claim(c, { x0: BOATHOUSE.x - 3.4, z0: 0, x1: BOATHOUSE.x + 3.4, z1: 5.4 });
  for (const x of STEP_XS) claim(c, { x0: x + 1.1, z0: 0, x1: x + 3.7, z1: 1.4 });
}

/** Breakwater rocks, the crest path on top and the lighthouse at its end. */
export function breakwater(c: Ctx): void {
  const k = c.k;
  for (const z of [6.5, 17.5, 28.5, 39.5]) k.prop('breakwater.12', { x: BW_X, z, rot: Math.PI / 2 }, { walkThrough: true });
  for (const x of [-47, -41]) k.prop('breakwater.12', { x, z: BW_Z }, { walkThrough: true });
  k.platform([[BW_X - 0.85, 0.1], [BW_X + 0.85, 0.1], [BW_X + 0.85, BW_Z + 0.85], [BW_X - 0.85, BW_Z + 0.85]], -0.6, PATH_Y, 'stone');
  k.platform([[BW_X + 0.85, BW_Z - 0.85], [BW_END_X, BW_Z - 0.85], [BW_END_X, BW_Z + 0.85], [BW_X + 0.85, BW_Z + 0.85]], -0.6, PATH_Y, 'stone');
  k.prop('tower.lighthouse', { x: LIGHTHOUSE.x, z: LIGHTHOUSE.z, y: WATER });
  for (const z of [12, 24, 36]) k.prop('lamp.classic', { x: BW_X + 0.62, z, y: PATH_Y });
  k.prop('harbour.lifeRingPost', { x: BW_X - 0.55, z: 31, y: PATH_Y, rot: Math.PI / 2 });
  k.prop('animal.seal.rock', { x: BW_X + 4.2, z: 30.5, y: WATER + 0.15, rot: -0.6 });
  claim(c, { x0: BW_X - 3, z0: 0, x1: BW_X + 3, z1: BW_Z + 3 });
  claim(c, { x0: BW_X, z0: BW_Z - 3, x1: LIGHTHOUSE.x + 4, z1: BW_Z + 4 });
  claim(c, { x0: BW_X + 2.8, z0: 29.2, x1: BW_X + 5.8, z1: 31.8 });
}
