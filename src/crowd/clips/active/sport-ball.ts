/**
 * Ball and racket sports plus the referee. Rackets/bats are assumed authored upright (+y) from the
 * fist; `level(arm, tilt)` keeps that orientation and the tilt tips the head forward (+) or back (-).
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_REST, HANDS_ON_HIPS, add, key, level, merge, mirror, squat } from './helpers';

/* ---- football ---- */
const football: readonly ClipDef[] = [
  {
    id: 'football.kick',
    duration: 2.6,
    keys: [
      key(0, { armL: ARM_REST, armR: ARM_REST, head: { nod: 8 } }),
      key(0.18, { legL: { fwd: 22, bend: 12 }, legR: { fwd: -40, bend: 92 }, footR: 30, armL: { fwd: 30, out: 50, bend: 20 }, armR: { fwd: -20, out: 30, bend: 20 }, spine: { lean: -4, twist: -10 }, head: { nod: 14 }, root: { y: -0.03 } }),
      key(0.28, { legL: { fwd: 6, bend: 14 }, legR: { fwd: 62, bend: 10 }, footR: 24, armL: { fwd: 50, out: 60, bend: 20 }, armR: { fwd: -30, out: 40, bend: 20 }, spine: { lean: -8, twist: 10 }, head: { nod: 10 } }),
      key(0.38, { legL: { fwd: 0, bend: 6 }, legR: { fwd: 84, bend: 12 }, footL: 30, footR: 20, armL: { fwd: 40, out: 50, bend: 20 }, armR: { fwd: -10, out: 40, bend: 20 }, spine: { lean: -10 }, root: { y: 0.03 }, head: { nod: -6 } }),
      key(0.52, { legR: { fwd: 14, bend: 20 }, legL: { fwd: -4, bend: 6 }, armL: { fwd: 10, out: 30, bend: 20 }, armR: { fwd: 0, out: 20, bend: 20 }, head: { nod: -8 } }),
      key(0.75, { armL: HANDS_ON_HIPS, armR: HANDS_ON_HIPS, head: { nod: -6, turn: 10 } }),
    ],
  },
  {
    id: 'football.juggle',
    duration: 1.6,
    base: { armL: { fwd: 10, out: 40, bend: 30 }, armR: { fwd: 10, out: 40, bend: 30 }, head: { nod: 22 }, spine: { lean: 6 } },
    keys: [
      key(0, { legR: { fwd: 64, bend: 76 }, footR: 10 }),
      key(0.25, { legR: { fwd: 6, bend: 10 }, root: { y: -0.01 } }),
      key(0.5, { legL: { fwd: 34, bend: 40 }, footL: -14 }),
      key(0.75, { legL: { fwd: 6, bend: 10 }, root: { y: -0.01 } }),
    ],
  },
  {
    id: 'football.header',
    duration: 2.0,
    keys: [
      key(0, merge(squat(14, 26), { armL: ARM_REST, armR: ARM_REST, head: { nod: -14 } })),
      key(0.18, merge(squat(42, 76), { armL: { fwd: -30, out: 20, bend: 20 }, armR: { fwd: -30, out: 20, bend: 20 }, spine: { lean: 16 }, head: { nod: -20 } })),
      key(0.34, { root: { y: 0.26 }, legL: { fwd: -6, bend: 60 }, legR: { fwd: 10, bend: 40 }, footL: 30, footR: 30, armL: { fwd: 70, out: 60, bend: 30 }, armR: { fwd: 70, out: 60, bend: 30 }, spine: { lean: -10 }, head: { nod: -26 } }),
      key(0.44, { root: { y: 0.3 }, legL: { fwd: -10, bend: 70 }, legR: { fwd: -4, bend: 60 }, footL: 30, footR: 30, armL: { fwd: 40, out: 70, bend: 30 }, armR: { fwd: 40, out: 70, bend: 30 }, spine: { lean: 18 }, head: { nod: 24 } }),
      key(0.6, merge(squat(36, 70), { armL: { fwd: 30, out: 40, bend: 30 }, armR: { fwd: 30, out: 40, bend: 30 }, spine: { lean: 10 } })),
      key(0.8, { armL: ARM_REST, armR: ARM_REST, head: { nod: -4, turn: 12 } }),
    ],
  },
];

/* ---- goalkeeper: low ready crouch, shuffles side to side ---- */
const GK: Pose = merge(squat(36, 64, 14), {
  armL: { fwd: 40, out: 40, twist: 20, bend: 30 },
  armR: { fwd: 40, out: 40, twist: 20, bend: 30 },
  spine: { lean: 20 },
  head: { nod: -14 },
});
const gkStep = (x: number, wide: boolean): Pose =>
  merge(GK, { root: { x }, legL: { out: wide ? 24 : 8 }, legR: { out: wide ? 24 : 8 } });
const goalie: ClipDef = {
  id: 'goalie.ready',
  duration: 3.2,
  keys: [
    key(0, gkStep(0, true)),
    key(0.12, gkStep(0.12, false)),
    key(0.22, gkStep(0.25, true)),
    key(0.4, merge(gkStep(0.25, true), { head: { turn: 10 } })),
    key(0.52, gkStep(0.12, false)),
    key(0.62, gkStep(0, true)),
    key(0.72, gkStep(-0.12, false)),
    key(0.82, gkStep(-0.25, true)),
    key(0.92, gkStep(-0.12, false)),
  ],
};

/* ---- tennis: racket in the right hand ---- */
const T_READY_R: LimbPose = { fwd: 40, out: 10, twist: -30, bend: 70 };
const T_READY_L: LimbPose = { fwd: 40, out: 10, twist: -40, bend: 82 };
const T_READY: Pose = merge(squat(16, 30, 12), { armR: T_READY_R, armL: T_READY_L, gripR: level(T_READY_R, 20), spine: { lean: 12 } });
const tennis: readonly ClipDef[] = [
  {
    id: 'tennis.forehand',
    duration: 2.2,
    keys: [
      key(0, T_READY),
      key(0.25, merge(T_READY, { armR: { fwd: 10, out: 62, twist: 10, bend: 30 }, gripR: { pitch: -10 }, armL: { fwd: 74, out: 0, twist: -40, bend: 30 }, spine: { twist: -40 }, head: { turn: 30 } })),
      key(0.38, merge(T_READY, { armR: { fwd: 70, out: 42, twist: 0, bend: 20 }, gripR: { pitch: 150 }, armL: { fwd: 40, out: 30, bend: 40 }, spine: { twist: 6 }, head: { turn: 10 } })),
      key(0.5, merge(T_READY, { armR: { fwd: 110, out: 10, twist: -60, bend: 100 }, gripR: { pitch: 200 }, armL: { fwd: 30, out: 30, bend: 40 }, spine: { twist: 36 }, head: { turn: -10 } })),
      key(0.72, T_READY),
    ],
  },
  {
    id: 'tennis.serve',
    duration: 3.0,
    keys: [
      key(0, merge(T_READY, { legL: { out: 4 }, legR: { out: 4 } })),
      key(0.22, merge(squat(22, 44), { armL: { fwd: 172, out: 10, bend: 4 }, armR: { fwd: -20, out: 36, bend: 20 }, gripR: level({ fwd: -20, bend: 20 }, -20), spine: { lean: -10, twist: -16 }, head: { nod: -30 } })),
      key(0.36, merge(squat(30, 58), { armL: { fwd: 150, out: 14, bend: 10 }, armR: { fwd: 150, out: 50, twist: 20, bend: 130 }, gripR: { pitch: 150 }, spine: { lean: -14, twist: -10 }, head: { nod: -34 } })),
      key(0.46, { root: { y: 0.05 }, footL: 40, footR: 40, armL: { fwd: 60, out: 20, bend: 30 }, armR: { fwd: 176, out: 10, bend: 4 }, gripR: { pitch: 190 }, spine: { lean: 4 }, head: { nod: -26 } }),
      key(0.58, merge(squat(20, 40), { armL: { fwd: 30, out: 20, bend: 40 }, armR: { fwd: 40, out: 4, twist: -40, bend: 40 }, gripR: { pitch: 120 }, spine: { lean: 26, twist: 16 }, head: { nod: 4 } })),
      key(0.8, T_READY),
    ],
  },
];

/* ---- volleyball ---- */
const PLATFORM: LimbPose = { fwd: 44, out: -6, twist: -20, bend: 4 };
const volley: readonly ClipDef[] = [
  {
    id: 'volley.bump',
    duration: 1.9,
    keys: [
      key(0, merge(squat(30, 56, 14), { armL: { fwd: 40, out: 20, bend: 50 }, armR: { fwd: 40, out: 20, bend: 50 }, spine: { lean: 18 } })),
      key(0.3, merge(squat(42, 78, 14), { armL: PLATFORM, armR: PLATFORM, spine: { lean: 24 }, head: { nod: -10 } })),
      key(0.44, merge(squat(14, 26, 12), { armL: add(PLATFORM, { fwd: 30 }), armR: add(PLATFORM, { fwd: 30 }), spine: { lean: 6 }, head: { nod: -22 } })),
      key(0.58, merge(squat(10, 20, 12), { armL: add(PLATFORM, { fwd: 26 }), armR: add(PLATFORM, { fwd: 26 }), head: { nod: -28 } })),
      key(0.8, merge(squat(24, 46, 14), { armL: { fwd: 40, out: 20, bend: 50 }, armR: { fwd: 40, out: 20, bend: 50 }, spine: { lean: 14 } })),
    ],
  },
  {
    id: 'volley.spike',
    duration: 2.4,
    keys: [
      key(0, merge(squat(16, 30), { armL: ARM_REST, armR: ARM_REST })),
      key(0.18, merge(squat(46, 90), { armL: { fwd: -50, out: 12, bend: 6 }, armR: { fwd: -50, out: 12, bend: 6 }, spine: { lean: 30 }, head: { nod: -12 } })),
      key(0.32, { root: { y: 0.34 }, legL: { fwd: 16, bend: 40 }, legR: { fwd: 22, bend: 46 }, footL: 30, footR: 30, armL: { fwd: 160, out: 16, bend: 10 }, armR: { fwd: 160, out: 34, twist: 10, bend: 120 }, spine: { lean: -12 }, head: { nod: -30 } }),
      key(0.42, { root: { y: 0.36 }, legL: { fwd: 26, bend: 50 }, legR: { fwd: 30, bend: 56 }, footL: 30, footR: 30, armL: { fwd: 50, out: 20, bend: 30 }, armR: { fwd: 118, out: 18, bend: 0 }, spine: { lean: 20 }, head: { nod: -6 } }),
      key(0.58, merge(squat(44, 84), { armL: { fwd: 30, out: 30, bend: 30 }, armR: { fwd: 20, out: 16, bend: 10 }, spine: { lean: 22 } })),
      key(0.8, { armL: HANDS_ON_HIPS, armR: ARM_REST, head: { nod: -4, turn: -12 } }),
    ],
  },
];

/* ---- basketball ---- */
const BALL_CHEST: LimbPose = { fwd: 60, out: 12, twist: -30, bend: 110 };
const basket: readonly ClipDef[] = [
  {
    id: 'basket.shot',
    duration: 2.8,
    keys: [
      key(0, merge(squat(16, 30), { armL: BALL_CHEST, armR: BALL_CHEST })),
      key(0.18, merge(squat(36, 66), { armL: add(BALL_CHEST, { fwd: -10 }), armR: add(BALL_CHEST, { fwd: -10 }), spine: { lean: 12 }, head: { nod: -10 } })),
      key(0.32, { root: { y: 0.1 }, footL: 40, footR: 40, armL: { fwd: 150, out: 20, twist: -10, bend: 70 }, armR: { fwd: 150, out: 14, twist: -10, bend: 70 }, head: { nod: -18 } }),
      key(0.4, { root: { y: 0.12 }, footL: 40, footR: 40, armL: { fwd: 128, out: 30, bend: 40 }, armR: { fwd: 162, out: 12, bend: 8 }, head: { nod: -20 } }),
      key(0.6, merge(squat(14, 28), { armL: { fwd: 110, out: 30, bend: 40 }, armR: { fwd: 156, out: 12, bend: 10 }, head: { nod: -16 } })),
      key(0.8, { armL: ARM_REST, armR: ARM_REST, head: { nod: -6, turn: 8 } }),
    ],
  },
  {
    id: 'basket.dribble',
    duration: 1.0,
    base: merge(squat(22, 44), { armL: { fwd: 50, out: 40, bend: 60 }, spine: { lean: 12 }, head: { nod: -8 } }),
    keys: [
      key(0, { armR: { fwd: 34, out: 28, twist: -10, bend: 56 }, root: { x: 0.01 } }),
      key(0.25, { armR: { fwd: 30, out: 28, twist: -10, bend: 22 } }),
      key(0.5, { armR: { fwd: 34, out: 28, twist: -10, bend: 56 }, root: { x: -0.01 }, head: { turn: 12 } }),
      key(0.75, { armR: { fwd: 30, out: 28, twist: -10, bend: 22 } }),
    ],
  },
];

/* ---- table tennis: crouched, quick forehand and backhand swats ---- */
const TT_READY: Pose = merge(squat(24, 44, 16), { armL: { fwd: 40, out: 30, bend: 70 }, spine: { lean: 24 }, head: { nod: -10 } });
const tableTennis: ClipDef = {
  id: 'tabletennis.swat',
  duration: 1.4,
  keys: [
    key(0, merge(TT_READY, { armR: { fwd: 50, out: 44, twist: 10, bend: 70 }, spine: { twist: -10 } })),
    key(0.15, merge(TT_READY, { armR: { fwd: 72, out: 10, twist: -40, bend: 90 }, spine: { twist: 10 } })),
    key(0.45, merge(TT_READY, { armR: { fwd: 60, out: 10, twist: -60, bend: 110 }, spine: { twist: 6 }, root: { x: 0.03 } })),
    key(0.6, merge(TT_READY, { armR: { fwd: 70, out: 40, twist: -10, bend: 60 }, spine: { twist: -6 }, root: { x: 0.03 } })),
  ],
};

/* ---- boules: crouch, swing back, underarm release, rise and watch ---- */
const boules: ClipDef = {
  id: 'boules.throw',
  duration: 4.4,
  keys: [
    key(0, merge(squat(44, 80), { armR: { fwd: 30, out: 8, bend: 20 }, armL: { fwd: 30, out: 20, bend: 40 }, spine: { lean: 30 }, head: { nod: -20 } })),
    key(0.12, merge(squat(46, 84), { armR: { fwd: -40, out: 8, bend: 4 }, armL: { fwd: 40, out: 24, bend: 40 }, spine: { lean: 34 }, head: { nod: -22 } })),
    key(0.2, merge(squat(36, 66), { armR: { fwd: 84, out: 6, bend: 6 }, armL: { fwd: 30, out: 30, bend: 40 }, spine: { lean: 20 }, head: { nod: -14 } })),
    key(0.32, { armR: { fwd: 100, out: 8, bend: 10 }, armL: { fwd: 10, out: 30, bend: 20 }, spine: { lean: 8 }, head: { nod: -6 } }),
    key(0.6, { armR: HANDS_ON_HIPS, armL: HANDS_ON_HIPS, head: { nod: 4, turn: 6 } }),
    key(0.8, { armR: { fwd: 10, out: 10, bend: 20 }, armL: HANDS_ON_HIPS, head: { nod: 8, turn: -8 } }),
  ],
};

/* ---- referee: whistle in the left hand, points with the right; or a raised card ---- */
const WHISTLE: LimbPose = { fwd: 44, out: 4, twist: -50, bend: 138 };
const referee: readonly ClipDef[] = [
  {
    id: 'referee.whistle',
    duration: 3.4,
    keys: [
      key(0, { armL: ARM_REST, armR: ARM_REST }),
      key(0.12, { armL: WHISTLE, armR: ARM_REST, spine: { lean: 4 }, head: { nod: 4 } }),
      key(0.22, { armL: WHISTLE, armR: { fwd: 88, out: 44, bend: 2 }, spine: { lean: -2, twist: -10 }, head: { turn: -24 } }),
      key(0.5, { armL: ARM_REST, armR: { fwd: 86, out: 46, bend: 2 }, spine: { twist: -10 }, head: { turn: -26 } }),
      key(0.62, { armL: ARM_REST, armR: { fwd: 50, out: 22, bend: 2 }, head: { turn: -10, nod: 10 } }),
      key(0.8, { armL: HANDS_ON_HIPS, armR: ARM_REST, head: { turn: 10 } }),
    ],
  },
  {
    id: 'referee.card',
    duration: 3.0,
    keys: [
      key(0, { armL: ARM_REST, armR: { fwd: 30, out: 6, twist: -30, bend: 100 }, head: { nod: 4 } }),
      key(0.2, { armL: ARM_REST, armR: { fwd: 176, out: 6, bend: 0 }, gripR: level({ fwd: 176 }), spine: { lean: -4 }, head: { nod: -6, turn: 10 } }),
      key(0.6, { armL: { fwd: 30, out: 20, bend: 20 }, armR: { fwd: 176, out: 8, bend: 0 }, gripR: level({ fwd: 176 }), spine: { lean: -4 }, head: { nod: -4, turn: 14 } }),
      key(0.8, { armL: ARM_REST, armR: { fwd: 30, out: 6, twist: -30, bend: 100 } }),
    ],
  },
];

export const SPORT_BALL_CLIPS: readonly ClipDef[] = [
  ...football,
  goalie,
  ...tennis,
  ...volley,
  ...basket,
  tableTennis,
  boules,
  ...referee,
  {
    id: 'tabletennis.rally',
    duration: 0.9,
    keys: [
      key(0, merge(TT_READY, { armR: { fwd: 56, out: 30, twist: -10, bend: 80 }, root: { x: -0.02 } })),
      key(0.5, merge(mirror(TT_READY), { armR: { fwd: 66, out: 14, twist: -40, bend: 96 }, armL: { fwd: 40, out: 30, bend: 70 }, root: { x: 0.02 } })),
    ],
  },
];
