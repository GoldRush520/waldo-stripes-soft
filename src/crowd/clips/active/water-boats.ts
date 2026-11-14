/**
 * On boats and quays: rowing, kayak, gondola, fishing, netting.
 * Long props (oar, paddle, pole, rod) are assumed authored upright (+y) from the hand; `level(arm, tilt)`
 * keeps them in that world orientation and the tilt tips their top forward (+) or back (-).
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_REST, GROUND_SIT, KNEEL_ONE, add, key, level, merge, mirror } from './helpers';

/* ---- rowing: seated on a thwart facing the stern, an oar handle in each hand ---- */
const ROW_SEAT: Pose = { root: { y: -0.43 }, footL: -10, footR: -10 };
const oars = (a: LimbPose, tilt: number): Pose => ({ armL: a, armR: a, gripL: level(a, tilt), gripR: level(a, tilt) });
const CATCH: LimbPose = { fwd: 72, out: 22, twist: -10, bend: 10 };
const FINISH: LimbPose = { fwd: 30, out: 34, twist: -14, bend: 112 };
const RECOVER: LimbPose = { fwd: 52, out: 24, twist: -10, bend: 34 };
const legsRow = (bend: number): Pose => ({
  legL: { fwd: 70 + bend * 0.25, out: 10, bend },
  legR: { fwd: 70 + bend * 0.25, out: 10, bend },
});
const row: readonly ClipDef[] = [
  {
    id: 'row.pull',
    duration: 3.2,
    base: ROW_SEAT,
    keys: [
      key(0, merge(oars(CATCH, -12), legsRow(100), { spine: { lean: 26 }, head: { nod: -14 } })),
      key(0.12, merge(oars(add(CATCH, { fwd: -8, bend: 14 }), 0), legsRow(84), { spine: { lean: 14 }, head: { nod: -8 } })),
      key(0.3, merge(oars(FINISH, 0), legsRow(52), { spine: { lean: -18 }, head: { nod: -2 } })),
      key(0.4, merge(oars(add(FINISH, { fwd: -4 }), 12), legsRow(50), { spine: { lean: -20 } })),
      key(0.55, merge(oars(RECOVER, 14), legsRow(60), { spine: { lean: 0 } })),
      key(0.85, merge(oars(add(CATCH, { fwd: -4 }), 6), legsRow(94), { spine: { lean: 22 }, head: { nod: -10, turn: 12 } })),
    ],
  },
  {
    id: 'row.easy',
    duration: 4.6,
    base: ROW_SEAT,
    keys: [
      key(0, merge(oars(add(CATCH, { fwd: -10, bend: 20 }), -6), legsRow(84), { spine: { lean: 12 } })),
      key(0.3, merge(oars(add(FINISH, { bend: -20 }), 0), legsRow(64), { spine: { lean: -8 }, head: { turn: 18 } })),
      key(0.5, merge(oars(RECOVER, 10), legsRow(68), { head: { turn: 22, nod: 4 } })),
      key(0.8, merge(oars(add(CATCH, { fwd: -12, bend: 22 }), 4), legsRow(82), { spine: { lean: 10 }, head: { turn: -10 } })),
    ],
  },
];

/* ---- kayak: sitting low in the hull, double paddle held at the chest ---- */
const KAYAK_SEAT: Pose = merge(GROUND_SIT, { legL: { fwd: 90, out: 14, bend: 16 }, legR: { fwd: 90, out: 14, bend: 16 } });
const strokeR: Pose = {
  armR: { fwd: 34, out: 28, twist: -10, bend: 40 },
  armL: { fwd: 82, out: 10, twist: -30, bend: 70 },
  spine: { twist: -24, lean: 10 },
};
const finishR: Pose = {
  armR: { fwd: 14, out: 34, twist: 0, bend: 60 },
  armL: { fwd: 70, out: 6, twist: -40, bend: 90 },
  spine: { twist: 14, lean: 4 },
};
const kayak: readonly ClipDef[] = [
  {
    id: 'kayak.paddle',
    duration: 1.8,
    base: KAYAK_SEAT,
    keys: [strokeR, finishR, mirror(strokeR), mirror(finishR)].map((p, i) =>
      key(i / 4, merge(p, { gripR: { ...level(p.armR ?? {}), roll: i < 2 ? -30 : 30 } })),
    ),
  },
  {
    id: 'kayak.drift',
    duration: 6.0,
    base: merge(KAYAK_SEAT, { armL: { fwd: 30, out: 14, twist: -30, bend: 70 }, armR: { fwd: 30, out: 14, twist: -30, bend: 70 } }),
    keys: [
      key(0, { head: { turn: 20 } }),
      key(0.4, { head: { turn: -24, nod: -6 }, spine: { twist: -6 } }),
      key(0.7, { head: { nod: 8 }, spine: { lean: -6 } }),
    ],
  },
];

/* ---- gondolier: standing at the stern ---- */
const POLE_HI_R: LimbPose = { fwd: 130, out: 20, twist: -10, bend: 40 };
const POLE_HI_L: LimbPose = { fwd: 104, out: 8, twist: -30, bend: 72 };
const POLE_LO_R: LimbPose = { fwd: 30, out: 30, twist: -10, bend: 30 };
const POLE_LO_L: LimbPose = { fwd: 60, out: 10, twist: -40, bend: 80 };
const pole = (r: LimbPose, l: LimbPose, tilt: number, extra: Pose = {}): Pose =>
  merge({ armR: r, armL: l, gripR: level(r, tilt), gripL: level(l, tilt) }, extra);
const gondola: readonly ClipDef[] = [
  {
    id: 'gondola.punt',
    duration: 4.2,
    keys: [
      key(0, pole(POLE_HI_R, POLE_HI_L, -8, { legL: { fwd: 14, bend: 8 }, legR: { fwd: -12, bend: 8 } })),
      key(0.3, pole(POLE_LO_R, POLE_LO_L, -18, { spine: { lean: 26 }, root: { y: -0.05 }, legL: { fwd: 34, bend: 40 }, legR: { fwd: -16, bend: 10 }, footL: -6 })),
      key(0.45, pole(add(POLE_LO_R, { fwd: -10 }), POLE_LO_L, -22, { spine: { lean: 30 }, root: { y: -0.06 }, legL: { fwd: 36, bend: 44 }, legR: { fwd: -18, bend: 10 }, footL: -8 })),
      key(0.75, pole(add(POLE_HI_R, { fwd: -20 }), add(POLE_HI_L, { fwd: -14 }), -4, { spine: { lean: 4 }, legL: { fwd: 16, bend: 8 }, legR: { fwd: -12, bend: 8 }, head: { turn: 12 } })),
    ],
  },
  {
    id: 'gondola.oar',
    duration: 3.0,
    base: { legL: { fwd: 22, bend: 14 }, legR: { fwd: -16, bend: 6 }, footL: -10, root: { y: -0.02 } },
    keys: [
      key(0, pole({ fwd: 60, out: 30, twist: -10, bend: 70 }, { fwd: 64, out: 6, twist: -40, bend: 90 }, 70, { spine: { lean: -4, twist: -10 } })),
      key(0.4, pole({ fwd: 84, out: 20, twist: -10, bend: 20 }, { fwd: 86, out: 4, twist: -30, bend: 40 }, 80, { spine: { lean: 18, twist: 4 }, root: { z: 0.06 } })),
      key(0.5, pole({ fwd: 82, out: 22, twist: -10, bend: 24 }, { fwd: 84, out: 4, twist: -30, bend: 44 }, 74, { spine: { lean: 16 }, root: { z: 0.05 } })),
      key(0.8, pole({ fwd: 62, out: 28, twist: -10, bend: 64 }, { fwd: 66, out: 6, twist: -40, bend: 84 }, 70, { spine: { lean: 0 }, head: { turn: -14 } })),
    ],
  },
];

/* ---- fishing: rod in the right hand (assumed upright from the fist) ---- */
const ROD_READY: LimbPose = { fwd: 40, out: 12, twist: -20, bend: 60 };
const REEL: LimbPose = { fwd: 40, out: 4, twist: -40, bend: 80 };
const rod = (a: LimbPose, tilt: number, extra: Pose = {}): Pose => merge({ armR: a, gripR: level(a, tilt) }, extra);
const fish: readonly ClipDef[] = [
  {
    id: 'fish.cast',
    duration: 11,
    base: { legL: { fwd: 12, bend: 6 }, legR: { fwd: -6, bend: 4 } },
    keys: [
      key(0, rod(ROD_READY, 30, { armL: REEL })),
      key(0.06, rod({ fwd: 124, out: 14, twist: -10, bend: 78 }, -50, { armL: ARM_REST, spine: { twist: -10, lean: -6 }, head: { nod: -6 } })),
      key(0.1, rod({ fwd: 78, out: 12, twist: -10, bend: 20 }, 52, { armL: ARM_REST, spine: { lean: 8, twist: 4 } })),
      key(0.15, rod({ fwd: 60, out: 12, twist: -14, bend: 30 }, 42, { armL: ARM_REST, head: { nod: -4 } })),
      key(0.24, rod({ fwd: 34, out: 12, twist: -18, bend: 62 }, 36, { armL: REEL, head: { nod: 10 } })),
      key(0.44, rod({ fwd: 34, out: 12, twist: -18, bend: 64 }, 36, { armL: REEL, head: { nod: 12, turn: 10 }, spine: { side: 2 } })),
      key(0.6, rod({ fwd: 32, out: 12, twist: -18, bend: 62 }, 38, { armL: REEL, head: { nod: 6, turn: -16 } })),
      key(0.66, rod({ fwd: 54, out: 12, twist: -18, bend: 78 }, 6, { armL: REEL, spine: { lean: -8 }, head: { nod: 14 } })),
      key(0.72, rod({ fwd: 50, out: 12, twist: -18, bend: 74 }, 10, { armL: add(REEL, { bend: 20, fwd: 8 }), spine: { lean: -6 } })),
      key(0.78, rod({ fwd: 50, out: 12, twist: -18, bend: 74 }, 6, { armL: add(REEL, { bend: -14 }), spine: { lean: -6 } })),
      key(0.84, rod({ fwd: 52, out: 12, twist: -18, bend: 76 }, 4, { armL: add(REEL, { bend: 20, fwd: 8 }), spine: { lean: -7 } })),
      key(0.9, rod({ fwd: 52, out: 12, twist: -18, bend: 76 }, 0, { armL: add(REEL, { bend: -14 }), spine: { lean: -5 }, head: { nod: 2 } })),
    ],
  },
  {
    id: 'fish.sit',
    duration: 9,
    base: merge(
      { root: { y: -0.43 }, legL: { fwd: 80, out: 8, bend: 70 }, legR: { fwd: 76, out: 8, bend: 50 }, spine: { lean: 8 } },
      { armL: { fwd: 30, out: 10, twist: -30, bend: 60 } },
    ),
    keys: [
      key(0, rod(ROD_READY, 40, { head: { nod: 8 } })),
      key(0.35, rod(ROD_READY, 40, { head: { nod: 24 }, spine: { lean: 14 } })),
      key(0.5, rod(add(ROD_READY, { fwd: 10 }), 24, { head: { nod: -2 }, spine: { lean: 2 } })),
      key(0.56, rod(ROD_READY, 40, { head: { nod: 6, turn: 16 } })),
      key(0.8, rod(add(ROD_READY, { fwd: 4 }), 34, { legL: { bend: 12 }, legR: { bend: -12 }, head: { turn: -10 } })),
    ],
  },
  {
    id: 'fish.haul',
    duration: 2.8,
    base: { root: { pitch: -12, y: -0.04 }, legL: { fwd: 14, bend: 26 }, legR: { fwd: -6, bend: 20 }, footL: -14, footR: 0 },
    keys: [
      key(0, { armL: { fwd: 76, out: 8, twist: -30, bend: 16 }, armR: { fwd: 48, out: 12, twist: -34, bend: 80 }, spine: { lean: 6 } }),
      key(0.4, { armL: { fwd: 50, out: 12, twist: -34, bend: 84 }, armR: { fwd: 30, out: 16, twist: -20, bend: 70 }, spine: { lean: -6 }, root: { pitch: -6 } }),
      key(0.5, { armL: { fwd: 48, out: 12, twist: -34, bend: 84 }, armR: { fwd: 78, out: 8, twist: -30, bend: 14 }, spine: { lean: 4 } }),
      key(0.9, { armL: { fwd: 30, out: 16, twist: -20, bend: 70 }, armR: { fwd: 50, out: 12, twist: -34, bend: 84 }, spine: { lean: -6 }, root: { pitch: -6 } }),
    ],
  },
];

/* ---- netting from the quay, kneeling; long net pole held in both hands ---- */
const net = (r: LimbPose, l: LimbPose, tilt: number, extra: Pose): Pose =>
  merge({ armR: r, armL: l, gripR: level(r, tilt), gripL: level(l, tilt) }, extra);
const netting: ClipDef = {
  id: 'net.quay',
  duration: 5.2,
  base: KNEEL_ONE,
  keys: [
    key(0, net({ fwd: 50, out: 12, twist: -20, bend: 30 }, { fwd: 70, out: 6, twist: -30, bend: 44 }, 110, { spine: { lean: 26 }, head: { nod: 18 } })),
    key(0.25, net({ fwd: 34, out: 12, twist: -20, bend: 14 }, { fwd: 56, out: 6, twist: -30, bend: 30 }, 130, { spine: { lean: 44 }, head: { nod: 20 } })),
    key(0.4, net({ fwd: 40, out: 14, twist: -20, bend: 16 }, { fwd: 60, out: 8, twist: -30, bend: 32 }, 128, { spine: { lean: 46, twist: 10 }, head: { nod: 22, turn: 10 } })),
    key(0.6, net({ fwd: 92, out: 14, twist: -20, bend: 40 }, { fwd: 100, out: 8, twist: -30, bend: 54 }, 90, { spine: { lean: 12 }, head: { nod: 8 } })),
    key(0.78, net({ fwd: 96, out: 14, twist: -20, bend: 44 }, { fwd: 102, out: 8, twist: -30, bend: 56 }, 84, { spine: { lean: 10 }, head: { nod: 26, turn: -6 } })),
  ],
};

export const WATER_BOAT_CLIPS: readonly ClipDef[] = [...row, ...kayak, ...gondola, ...fish, netting];
