/**
 * The sand strip (y = SAND_Y): beach huts backing onto the sea wall, then a jittered patchwork of
 * family camps (umbrellas, towels, deck chairs, windbreaks, sandcastles, ball games) across the
 * whole strip, strollers along the wet sand, standing gulls and gap-filling groups.
 */
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { CLIP } from './clips';
import { EAST_X, SAND_Y, type P2, acrossSand, sandZ, shoreRot, shoreZ, waterZ } from './frame';
import { HOLD, hold, opt } from './holds';
import { seatProp } from './place';
import { STAIRS_X } from './promenade';
import { inZone } from './zones';

const Y = SAND_Y;
const SWIMWEAR = ['coral', 'blue', 'butter', 'sage', 'coralDeep', 'blueDeep', 'ivory'] as const;

/** a light beach look: bare legs, sun hats, sunglasses now and then */
function beachLook(k: Kit): Parameters<Kit['person']>[0]['look'] {
  const r = k.rng;
  return {
    longLegs: false,
    longSleeves: false,
    pants: r.pick(SWIMWEAR),
    hat: r.chance(0.35) ? r.pick(['hat.sun', 'hat.straw.wide', 'hat.bucket', 'hat.visor', 'hat.cap'].map(opt).filter((h): h is string => h !== null)) : null,
    hatTint: r.pick(CLOTHS),
    glasses: r.chance(0.3) ? 'face.sunglasses' : null,
  };
}

function huts(k: Kit): void {
  for (const x of [28.6, 44.5]) {
    const rot = shoreRot(x);
    const at = k.rel({ x, z: shoreZ(x), rot }, 0, 1.45);
    k.prop('beach.hutrow', { x: at.x, z: at.z, y: Y, rot });
    for (let i = 0; i < 5; i++) {
      if (!k.rng.chance(0.8)) continue;
      const p = k.rel({ x: at.x, z: at.z, rot }, (i - 2) * 2.5 + k.rng.range(-0.3, 0.3), 2.45 + k.rng.range(0, 0.5), k.rng.range(-0.5, 0.5));
      k.person({ ...p, y: Y, clip: k.rng.pick([CLIP.idleStretch, CLIP.talk, CLIP.wave, CLIP.drink, CLIP.stand]), look: beachLook(k), age: k.rng.chance(0.25) ? 'child' : 'adult' });
    }
  }
  [-70.2, -67.5, -64.8, -62.1].forEach((x, i) => {
    const rot = shoreRot(x);
    const at = k.rel({ x, z: shoreZ(x), rot }, 0, 1.45);
    k.prop('beach.hut', { x: at.x, z: at.z, y: Y, rot, tint: CLOTHS[i % CLOTHS.length] });
    const p = k.rel({ x: at.x, z: at.z, rot }, 0.3, 2.5, 0.2);
    k.person({ ...p, y: Y, clip: i % 2 ? CLIP.wave : CLIP.drink, look: beachLook(k) });
  });
}

type Cell = (k: Kit, x: number, z: number, rot: number) => void;

const towelCamp: Cell = (k, x, z, rot) => {
  k.prop('umbrella.beach', { x: x - 1.1, z: z - 0.6, y: Y, tint: k.rng.pick(CLOTHS) });
  const n = k.rng.int(1, 3);
  for (let i = 0; i < n; i++) {
    const tx = x - 0.6 + i * 1.15;
    k.prop('beach.towel', { x: tx, z: z + 0.2, y: Y, rot: rot + k.rng.range(-0.15, 0.15), tint: k.rng.pick(CLOTHS) });
    const clip = k.rng.pick([CLIP.sunbathe, CLIP.sunbathe, CLIP.lieFront, CLIP.sitGround, CLIP.sitCrossed]);
    k.person({ x: tx, z: z + 0.2, y: Y, heading: rot + Math.PI + k.rng.range(-0.2, 0.2), clip, look: beachLook(k), blob: 0 });
  }
  if (k.rng.chance(0.6)) {
    k.prop('beach.bucketspade', { x: x + 1.6, z: z + 1.3, y: Y, rot: k.rng.range(0, 6) });
    k.person({ x: x + 1.1, z: z + 1.5, y: Y, heading: k.rng.range(-0.6, 0.6), clip: k.rng.pick([CLIP.crouch, CLIP.dig, CLIP.sitGround]), age: 'child', hold: hold([HOLD.spade, HOLD.bucket]) });
  }
};

const chairCamp: Cell = (k, x, z, rot) => {
  k.prop('umbrella.beach.tilted', { x, z: z - 0.5, y: Y, tint: k.rng.pick(CLOTHS) });
  for (const s of [-0.5, 0.5]) {
    seatProp(k, 'beach.deckchair', { x: x + s, z: z + 0.3, y: Y, rot: rot + s * 0.3, tint: k.rng.pick(CLOTHS) }, {
      clips: [CLIP.sitRead, CLIP.sitAsleep, CLIP.sitTalk, CLIP.sitEat, CLIP.sit],
      fill: 0.85,
      age: k.rng.chance(0.4) ? 'elder' : 'adult',
    });
  }
  k.person({ x: x + 1.6, z: z + 1.2, y: Y, face: [x, z], clip: k.rng.pick([CLIP.talk, CLIP.drink, CLIP.laugh]), look: beachLook(k) });
};

const windbreakCamp: Cell = (k, x, z, rot) => {
  k.prop('beach.windbreak', { x, z: z - 1.1, y: Y, rot, tint: k.rng.pick(CLOTHS) });
  k.prop('beach.picnic', { x, z: z + 0.2, y: Y, rot });
  const seats: readonly P2[] = [[-1.2, 0.1], [1.2, 0.2], [0.1, 1.3], [-0.6, -0.6]];
  seats.forEach(([dx, dz], i) => {
    if (i === 3 && !k.rng.chance(0.6)) return;
    k.person({ x: x + dx, z: z + 0.2 + dz, y: Y, face: [x, z + 0.2], clip: k.rng.pick([CLIP.sitGround, CLIP.sitCrossed, CLIP.eatSandwich, CLIP.sitGround]), age: i === 2 ? 'child' : 'adult', look: beachLook(k) });
  });
};

const castleCamp: Cell = (k, x, z) => {
  k.prop(k.rng.chance(0.5) ? 'sandcastle.small' : 'beach.moat', { x, z, y: Y, rot: k.rng.range(-0.4, 0.4) });
  for (const [dx, dz] of [[-0.9, 0.5], [0.9, 0.6], [0.1, 1.2]] as const) {
    if (!k.rng.chance(0.8)) continue;
    k.person({ x: x + dx, z: z + dz, y: Y, face: [x, z], clip: k.rng.pick([CLIP.crouch, CLIP.dig, CLIP.sitGround, CLIP.pointDown]), age: 'child', hold: hold([HOLD.spade, HOLD.bucket]) });
  }
  k.person({ x: x + 1.7, z: z - 0.4, y: Y, face: [x, z], clip: k.rng.pick([CLIP.photo, CLIP.clap, CLIP.idleHips]), look: beachLook(k) });
  k.prop('beach.towel', { x: x - 1.4, z: z - 1.4, y: Y, rot: 0.2, tint: k.rng.pick(CLOTHS) });
};

const ballGame: Cell = (k, x, z) => {
  const yaw = k.rng.range(-0.4, 0.4);
  const a = k.rel({ x, z, rot: yaw }, -2.3, 0);
  const b = k.rel({ x, z, rot: yaw }, 2.3, 0);
  const m = k.toss([x, Y + 1.1, z], yaw, 0.45, k.rng.next(), 4.4, 1.8);
  k.dynamic('ball.beach', m, { tint: k.rng.pick(CLOTHS) });
  k.person({ x: a.x, z: a.z, y: Y, face: [b.x, b.z], clip: k.rng.pick([CLIP.bump, CLIP.jump, CLIP.bump]), look: beachLook(k), age: k.rng.chance(0.4) ? 'child' : 'adult' });
  k.person({ x: b.x, z: b.z, y: Y, face: [a.x, a.z], clip: k.rng.pick([CLIP.bump, CLIP.spike, CLIP.wave]), look: beachLook(k), age: k.rng.chance(0.4) ? 'child' : 'adult' });
  if (k.rng.chance(0.6)) k.person({ x: x + 0.3, z: z + 1.6, y: Y, face: [x, z], clip: CLIP.clap, age: 'child' });
};

const loungerPair: Cell = (k, x, z, rot) => {
  k.prop('parasol.open', { x, z: z - 0.9, y: Y, tint: k.rng.pick(CLOTHS) });
  for (const s of [-0.9, 0.9]) {
    seatProp(k, 'beach.lounger', { x: x + s, z: z + 0.3, y: Y, rot, tint: k.rng.pick(CLOTHS) }, { clips: [CLIP.sitRead, CLIP.sitAsleep, CLIP.sitEat], fill: 0.9 });
  }
};

const CELLS: ReadonlyArray<readonly [Cell, number]> = [
  [towelCamp, 5],
  [chairCamp, 3],
  [windbreakCamp, 2],
  [castleCamp, 2],
  [ballGame, 1.4],
  [loungerPair, 1.2],
];

function camps(k: Kit): void {
  const rows = [0.24, 0.45, 0.66, 0.86];
  const fns = CELLS.map((c) => c[0]);
  const weights = CELLS.map((c) => c[1]);
  for (let x = -70; x < EAST_X - 1; x += 4.8) {
    rows.forEach((t0, r) => {
      const cx = x + (r % 2) * 2.4 + k.rng.range(-0.7, 0.7);
      const t = t0 + k.rng.range(-0.04, 0.04);
      if (cx > EAST_X - 2 || inZone(cx, t, 0.6, STAIRS_X)) return;
      if (waterZ(cx) - shoreZ(cx) < 8) return;
      const z = sandZ(cx, t);
      if (!k.isFree(cx, z, 1.0)) return;
      k.rng.weighted(fns, weights)(k, cx, z, shoreRot(cx));
    });
  }
}

/** strollers on the firm wet sand and between the camps; standing gulls */
function movement(k: Kit): void {
  const kit = (rng: Kit['rng']) => (rng.chance(0.2) ? hold({ key: HOLD.towel, tint: rng.pick(CLOTHS) }, HOLD.bag) : rng.chance(0.15) ? hold(HOLD.ball) : undefined);
  k.walkers(acrossSand(-68, -18, 7, 0.95), 26, { lanes: [0.35, 0.9], speed: [0.6, 1.1], hold: kit, childShare: 0.2 });
  k.walkers(acrossSand(-20, 10, 6, 0.94), 14, { lanes: [0.35, 0.9], speed: [0.6, 1.1], hold: kit, childShare: 0.2 });
  k.walkers(acrossSand(23, 53, 6, 0.93), 16, { lanes: [0.35, 0.9], speed: [0.6, 1.1], hold: kit, childShare: 0.2 });
  for (const sx of [-44, -20, 6]) {
    k.walkers([[sx, Y, shoreZ(sx) + 1.6], [sx + 1.5, Y, sandZ(sx, 0.5)], [sx + 0.5, Y, sandZ(sx, 0.9)]], 6, { lanes: [0.4, 0.9], speed: [0.6, 1.0], hold: kit });
  }
  for (let i = 0; i < 14; i++) {
    const x = k.rng.range(-68, 52);
    const t = k.rng.range(0.15, 0.98);
    if (inZone(x, t, 0.5, STAIRS_X)) continue;
    k.prop('animal.gull.standing', { x, z: sandZ(x, t), y: Y, rot: k.rng.range(0, 6.28) });
  }
}

/** small sociable groups over whatever sand is still open (never inside a story zone) */
function fills(k: Kit, target: number): void {
  const clips = [CLIP.talk, CLIP.stand, CLIP.sitGround, CLIP.drink, CLIP.laugh, CLIP.sunbathe, CLIP.idleStretch, CLIP.photo, CLIP.wave, CLIP.sitCrossed];
  let made = 0;
  for (let tries = 0; tries < target * 14 && made < target; tries++) {
    const x = k.rng.range(-71, EAST_X - 1);
    const t = k.rng.range(0.07, 0.97);
    if (inZone(x, t, 0.3, STAIRS_X, true) || waterZ(x) - shoreZ(x) < 8) continue;
    const z = sandZ(x, t);
    const n = Math.min(target - made, k.rng.int(1, 3));
    if (!k.isFree(x, z, 0.45 + n * 0.11 + 0.4)) continue;
    made += k.group(x, z, n, { clips, y: Y, age: k.rng.chance(0.2) ? 'child' : undefined }).length;
  }
}

export function buildSand(k: Kit): void {
  huts(k);
  camps(k);
  movement(k);
}

export function fillSand(k: Kit, target: number): void {
  fills(k, target);
}
