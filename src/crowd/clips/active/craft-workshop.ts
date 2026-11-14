/**
 * Workshop and studio crafts: hammering, sawing, painting, sculpting, pottery, smithing, drilling,
 * sign painting, photography, net mending.
 *
 * Swung tools use absolute grip pitch, with the tool authored upright (+y) from the fist:
 * pitch 90 = tool sticks out of the fist at right angles to the forearm (thumb side, a hammer held
 * ready), pitch 180 = tool continues the forearm (a struck hammer, a saw blade). `level(arm, tilt)`
 * keeps a prop in its authored world orientation, tipped forward by `tilt`.
 */
import type { ClipDef, LimbPose, Pose } from '../../pose';
import { ARM_REST, HANDS_ON_HIPS, KNEEL_ONE, SEAT, add, key, level, merge, squat } from './helpers';

/* ---- hammering a nail at a bench ---- */
const H_UP: LimbPose = { fwd: 104, out: 16, twist: -10, bend: 112 };
const H_HIT: LimbPose = { fwd: 46, out: 14, twist: -14, bend: 52 };
const NAIL_HOLD: LimbPose = { fwd: 42, out: 8, twist: -30, bend: 52 };
const hammerKeys = (extra: Pose): ClipDef['keys'] => [
  key(0, merge({ armR: H_UP, gripR: { pitch: 80 }, armL: NAIL_HOLD }, extra)),
  key(0.12, merge({ armR: H_HIT, gripR: { pitch: 168 }, armL: NAIL_HOLD, head: { nod: 4 } }, extra)),
  key(0.24, merge({ armR: add(H_UP, { fwd: -20, bend: -20 }), gripR: { pitch: 96 }, armL: NAIL_HOLD }, extra)),
  key(0.34, merge({ armR: H_HIT, gripR: { pitch: 168 }, armL: NAIL_HOLD }, extra)),
  key(0.5, merge({ armR: add(H_UP, { fwd: 12, bend: 12 }), gripR: { pitch: 70 }, armL: add(NAIL_HOLD, { fwd: -20, out: 20 }) }, extra)),
  key(0.6, merge({ armR: add(H_HIT, { fwd: -4 }), gripR: { pitch: 172 }, armL: add(NAIL_HOLD, { fwd: -20, out: 20 }), head: { nod: 6 } }, extra)),
  key(0.8, merge({ armR: add(H_HIT, { bend: 20 }), gripR: { pitch: 140 }, armL: NAIL_HOLD, head: { nod: -2, turn: 10 } }, extra)),
];
const hammer: readonly ClipDef[] = [
  { id: 'hammer.strike', duration: 2.6, base: { spine: { lean: 18 }, head: { nod: 14 }, legL: { fwd: 10, bend: 6 } }, keys: hammerKeys({}) },
  { id: 'hammer.kneel', duration: 2.8, base: merge(KNEEL_ONE, { spine: { lean: 30 }, head: { nod: 16 } }), keys: hammerKeys({ armL: add(NAIL_HOLD, { fwd: -10 }) }) },
];

/* ---- sawing a plank on a trestle ---- */
const SAW_IN: LimbPose = { fwd: 30, out: 14, twist: -16, bend: 92 };
const SAW_OUT: LimbPose = { fwd: 58, out: 12, twist: -16, bend: 28 };
const saw: ClipDef = {
  id: 'saw.cut',
  duration: 1.4,
  base: merge(squat(14, 28), { armL: { fwd: 46, out: 16, twist: -10, bend: 30 }, legL: { fwd: 24 }, spine: { lean: 30 }, head: { nod: 16 } }),
  keys: [
    key(0, { armR: SAW_IN, gripR: { pitch: 168 }, spine: { twist: -4 } }),
    key(0.45, { armR: SAW_OUT, gripR: { pitch: 172 }, spine: { twist: 2 }, root: { z: 0.03 } }),
    key(0.55, { armR: add(SAW_OUT, { bend: 4 }), gripR: { pitch: 172 }, root: { z: 0.03 } }),
    key(0.95, { armR: add(SAW_IN, { bend: -4 }), gripR: { pitch: 168 } }),
  ],
};

/* ---- painting a wall: long roller pole, or a brush with the pot in the left hand ---- */
const ROLL_HI_R: LimbPose = { fwd: 150, out: 10, twist: -20, bend: 30 };
const ROLL_HI_L: LimbPose = { fwd: 112, out: 6, twist: -30, bend: 50 };
const ROLL_LO_R: LimbPose = { fwd: 70, out: 12, twist: -20, bend: 40 };
const ROLL_LO_L: LimbPose = { fwd: 40, out: 8, twist: -30, bend: 64 };
const roller = (r: LimbPose, l: LimbPose, extra: Pose = {}): Pose =>
  merge({ armR: r, armL: l, gripR: level(r, 14), gripL: level(l, 14) }, extra);
const BRUSH: LimbPose = { fwd: 80, out: 20, twist: -10, bend: 30 };
const POT: LimbPose = { fwd: 30, out: 12, twist: -20, bend: 70 };
const paint: readonly ClipDef[] = [
  {
    id: 'paint.roller',
    duration: 3.2,
    keys: [
      key(0, roller(ROLL_LO_R, ROLL_LO_L, { spine: { lean: 6 } })),
      key(0.4, roller(ROLL_HI_R, ROLL_HI_L, { spine: { lean: -6 }, head: { nod: -20 }, footL: 10, footR: 10, root: { y: 0.01 } })),
      key(0.5, roller(add(ROLL_HI_R, { fwd: 4 }), ROLL_HI_L, { spine: { lean: -7 }, head: { nod: -22 } })),
      key(0.9, roller(add(ROLL_LO_R, { fwd: -6 }), ROLL_LO_L, { spine: { lean: 8 }, head: { nod: 6 } })),
    ],
  },
  {
    id: 'paint.brush',
    duration: 2.0,
    base: { armL: POT, gripL: level(POT), spine: { lean: 6 } },
    keys: [
      key(0, { armR: add(BRUSH, { fwd: 20 }), gripR: level(add(BRUSH, { fwd: 20 }), 90) }),
      key(0.4, { armR: add(BRUSH, { fwd: -18 }), gripR: level(add(BRUSH, { fwd: -18 }), 90), head: { nod: 6 } }),
      key(0.5, { armR: add(BRUSH, { fwd: -16, out: 6 }), gripR: level(add(BRUSH, { fwd: -16 }), 90) }),
      key(0.9, { armR: add(BRUSH, { fwd: 22, out: 6 }), gripR: level(add(BRUSH, { fwd: 22 }), 90), head: { nod: -6 } }),
    ],
  },
];

/* ---- easel: small dabs, palette held flat in the left hand, step back to look ---- */
const DAB: LimbPose = { fwd: 70, out: 14, twist: -10, bend: 70 };
const PALETTE: LimbPose = { fwd: 30, out: 24, twist: 10, bend: 80 };
const dab = (d: LimbPose, extra: Pose = {}): Pose => merge({ armR: add(DAB, d), gripR: level(add(DAB, d), 90) }, extra);
const easel: ClipDef = {
  id: 'easel.paint',
  duration: 6.4,
  base: { armL: PALETTE, gripL: level(PALETTE) },
  keys: [
    key(0, dab({}, { head: { nod: 2 } })),
    key(0.08, dab({ fwd: 6, bend: -8 })),
    key(0.16, dab({ fwd: -2, out: 4 })),
    key(0.24, dab({ fwd: 8, bend: -10 }, { head: { tilt: 4 } })),
    key(0.32, dab({ fwd: -10, bend: 10 }, { armL: { fwd: 10, out: -10 }, spine: { twist: 6 }, head: { nod: 14, turn: 10 } })),
    key(0.42, dab({ fwd: 4 })),
    key(0.56, merge({ armR: { fwd: 30, out: 14, twist: -20, bend: 70 }, gripR: level({ fwd: 30, bend: 70 }) }, { root: { z: -0.08 }, spine: { lean: -6 }, head: { tilt: 12, nod: -2 } })),
    key(0.72, merge({ armR: { fwd: 26, out: 14, twist: -20, bend: 100 }, gripR: level({ fwd: 26, bend: 100 }) }, { root: { z: -0.08 }, spine: { lean: -4 }, head: { tilt: -8 } })),
    key(0.86, dab({ bend: 6 })),
  ],
};

/* ---- sculptor: chisel held to the block in the left hand, mallet taps ---- */
const CHISEL: LimbPose = { fwd: 66, out: 10, twist: -30, bend: 50 };
const M_UP: LimbPose = { fwd: 80, out: 22, twist: -20, bend: 110 };
const M_TAP: LimbPose = { fwd: 66, out: 16, twist: -30, bend: 76 };
const sculpt: ClipDef = {
  id: 'sculpt.chisel',
  duration: 3.2,
  base: { armL: CHISEL, gripL: level(CHISEL, 110), spine: { lean: 14 }, head: { nod: 12 } },
  keys: [
    key(0, { armR: M_UP, gripR: { pitch: 90 } }),
    key(0.1, { armR: M_TAP, gripR: { pitch: 140 } }),
    key(0.2, { armR: add(M_UP, { bend: -16 }), gripR: { pitch: 96 } }),
    key(0.3, { armR: M_TAP, gripR: { pitch: 140 } }),
    key(0.42, { armR: M_UP, gripR: { pitch: 86 } }),
    key(0.5, { armR: M_TAP, gripR: { pitch: 142 }, spine: { lean: 4 } }),
    key(0.66, { armR: add(M_TAP, { fwd: -30, bend: -30 }), gripR: { pitch: 100 }, spine: { lean: 10 }, head: { nod: 24, turn: 8 } }),
    key(0.84, { armR: add(M_TAP, { fwd: -30, bend: -30 }), gripR: { pitch: 100 }, spine: { lean: -4 }, head: { nod: 2, tilt: 8 } }),
  ],
};

/* ---- potter's wheel (seated, low wheel between the knees) ---- */
const CUP: LimbPose = { fwd: 40, out: 8, twist: -30, bend: 50 };
const pottery: ClipDef = {
  id: 'pottery.wheel',
  duration: 4.4,
  base: merge(SEAT, { legL: { out: 20 }, legR: { out: 20 }, spine: { lean: 28 }, head: { nod: 20 } }),
  keys: [
    key(0, { armL: CUP, armR: CUP }),
    key(0.3, { armL: add(CUP, { fwd: 8, bend: 14 }), armR: add(CUP, { fwd: 8, bend: 14 }), spine: { lean: -4 } }),
    key(0.45, { armL: add(CUP, { fwd: 10, bend: 18 }), armR: add(CUP, { fwd: 10, bend: 18 }), spine: { lean: -6 }, head: { nod: -4 } }),
    key(0.7, { armL: add(CUP, { fwd: -4, bend: -4 }), armR: add(CUP, { fwd: -4, bend: -4 }), spine: { lean: 4 } }),
    key(0.85, { armL: CUP, armR: add(CUP, { out: 10, twist: 20 }), head: { tilt: 8 } }),
  ],
};

/* ---- blacksmith: tongs in the left hand on the anvil, overhead strike with the right ---- */
const TONGS: LimbPose = { fwd: 45, out: 14, twist: -20, bend: 40 };
const S_UP: LimbPose = { fwd: 168, out: 20, twist: -10, bend: 64 };
const S_HIT: LimbPose = { fwd: 60, out: 14, twist: -16, bend: 30 };
const smith: ClipDef = {
  id: 'smith.strike',
  duration: 1.8,
  base: merge({ legL: { fwd: 16, out: 10, bend: 14 }, legR: { fwd: -10, out: 10, bend: 8 }, root: { y: -0.02 } }, { armL: TONGS, gripL: level(TONGS, 90) }),
  keys: [
    key(0, { armR: S_HIT, gripR: { pitch: 176 }, spine: { lean: 20 }, head: { nod: 18 } }),
    key(0.12, { armR: add(S_HIT, { fwd: 6, bend: 10 }), gripR: { pitch: 160 }, spine: { lean: 18 } }),
    key(0.42, { armR: S_UP, gripR: { pitch: 96 }, spine: { lean: -4, twist: -10 }, head: { nod: 8 } }),
    key(0.52, { armR: add(S_UP, { fwd: 4 }), gripR: { pitch: 90 }, spine: { lean: -6, twist: -12 } }),
    key(0.62, { armR: S_HIT, gripR: { pitch: 178 }, spine: { lean: 22, twist: 4 }, head: { nod: 20 }, root: { y: -0.03 } }),
    key(0.8, { armR: add(S_HIT, { fwd: -10, bend: 20 }), gripR: { pitch: 150 }, spine: { lean: 16 } }),
  ],
};

/* ---- brace-and-bit drill: left palm on the knob, right hand cranks a horizontal circle ---- */
const DRILL_CRANK: readonly LimbPose[] = [
  { fwd: 40, out: 30, twist: -10, bend: 60 },
  { fwd: 52, out: 14, twist: -20, bend: 40 },
  { fwd: 42, out: 4, twist: -40, bend: 72 },
  { fwd: 30, out: 20, twist: -20, bend: 84 },
];
const drill: ClipDef = {
  id: 'drill.crank',
  duration: 1.1,
  ease: 'linear',
  base: { armL: { fwd: 40, out: 6, twist: -40, bend: 118 }, spine: { lean: 22 }, head: { nod: 18 }, legL: { fwd: 12, bend: 10 } },
  keys: DRILL_CRANK.map((a, i) => key(i / DRILL_CRANK.length, { armR: a, spine: { twist: [2, 0, -2, 0][i] ?? 0 } })),
};

/* ---- sign painter on tiptoe: brush up high, pot in the left hand ---- */
const SIGN: LimbPose = { fwd: 165, out: 12, bend: 30 };
const signTip = (d: LimbPose, heel: boolean, extra: Pose = {}): Pose =>
  merge(
    { armR: add(SIGN, d), gripR: level(add(SIGN, d), 90), root: { y: heel ? 0.05 : 0 }, footL: heel ? 36 : 0, footR: heel ? 36 : 0, head: { nod: -22 } },
    extra,
  );
const sign: ClipDef = {
  id: 'sign.tiptoe',
  duration: 5.0,
  base: { armL: POT, gripL: level(POT) },
  keys: [
    key(0, signTip({}, true)),
    key(0.12, signTip({ out: 8, bend: -6 }, true)),
    key(0.24, signTip({ fwd: -6, bend: 8 }, true)),
    key(0.36, signTip({ out: 10 }, true, { spine: { side: -3 } })),
    key(0.5, signTip({ fwd: 4 }, true)),
    key(0.62, signTip({ fwd: -90, bend: 30 }, false, { head: { nod: -10, tilt: 8 }, spine: { lean: -4 } })),
    key(0.82, signTip({ fwd: -88, bend: 30 }, false, { head: { nod: -14, tilt: -6 } })),
  ],
};

/* ---- photographer under the dark cloth, pops out with the bulb ---- */
const CAMERA: LimbPose = { fwd: 62, out: 10, twist: -30, bend: 70 };
const photo: ClipDef = {
  id: 'photo.hunch',
  duration: 6.0,
  keys: [
    key(0, { armL: CAMERA, armR: CAMERA, spine: { lean: 36 }, head: { nod: 22 }, legL: { fwd: 14, bend: 10 } }),
    key(0.3, { armL: add(CAMERA, { out: 4 }), armR: add(CAMERA, { bend: 10 }), spine: { lean: 38, side: 2 }, head: { nod: 24 }, legL: { fwd: 14, bend: 10 } }),
    key(0.45, { armL: { fwd: 130, out: 30, bend: 30 }, armR: { fwd: 40, out: 40, bend: 60 }, spine: { lean: 0 }, head: { nod: -4 } }),
    key(0.6, { armL: { fwd: 140, out: 34, bend: 20 }, armR: { fwd: 46, out: 40, bend: 64 }, spine: { lean: -2 }, head: { nod: -6, tilt: 6 } }),
    key(0.66, { armL: { fwd: 140, out: 34, bend: 20 }, armR: { fwd: 46, out: 36, bend: 76 }, spine: { lean: -2 } }),
    key(0.85, { armL: CAMERA, armR: CAMERA, spine: { lean: 34 }, head: { nod: 20 }, legL: { fwd: 14, bend: 10 } }),
  ],
};

/* ---- mending a net in the lap (seated) ---- */
const LAP: LimbPose = { fwd: 34, out: 10, twist: -30, bend: 90 };
const mend: ClipDef = {
  id: 'net.mend',
  duration: 3.2,
  base: merge(SEAT, { spine: { lean: 14 }, head: { nod: 24 } }),
  keys: [
    key(0, { armL: LAP, armR: LAP }),
    key(0.2, { armL: LAP, armR: { fwd: 50, out: 20, twist: -20, bend: 112 } }),
    key(0.32, { armL: add(LAP, { bend: 8 }), armR: { fwd: 44, out: 30, twist: -10, bend: 70 } }),
    key(0.5, { armL: LAP, armR: add(LAP, { out: 6 }) }),
    key(0.7, { armL: add(LAP, { fwd: 14, out: 10 }), armR: { fwd: 30, out: 24, twist: 0, bend: 60 }, head: { tilt: 6 } }),
    key(0.85, { armL: LAP, armR: LAP, head: { turn: 10, nod: 18 } }),
  ],
};

export const CRAFT_WORKSHOP_CLIPS: readonly ClipDef[] = [
  ...hammer,
  saw,
  ...paint,
  easel,
  sculpt,
  pottery,
  smith,
  drill,
  sign,
  photo,
  mend,
  {
    id: 'smith.inspect',
    duration: 5.0,
    keys: [
      key(0, { armR: { fwd: 10, out: 10, bend: 20 }, armL: add(TONGS, { fwd: 30, bend: 20 }), gripL: level(add(TONGS, { fwd: 30, bend: 20 }), 30), head: { nod: 6 } }),
      key(0.4, { armR: { fwd: 10, out: 10, bend: 20 }, armL: add(TONGS, { fwd: 34, bend: 24 }), gripL: level(add(TONGS, { fwd: 34, bend: 24 }), 10), head: { nod: 2, tilt: 10 } }),
      key(0.7, { armR: HANDS_ON_HIPS, armL: TONGS, gripL: level(TONGS, 60), head: { nod: 10, turn: -10 } }),
    ],
  },
  {
    id: 'saw.rest',
    duration: 5.0,
    base: { armL: HANDS_ON_HIPS, spine: { lean: -4 }, gripR: { pitch: 168 } },
    keys: [
      key(0, { armR: ARM_REST, head: { nod: 10 } }),
      key(0.4, { armR: { fwd: 40, out: 20, twist: -40, bend: 140 }, head: { nod: -6, turn: 12 } }),
      key(0.6, { armR: { fwd: 40, out: 20, twist: -40, bend: 136 }, head: { nod: -8, turn: -8 } }),
    ],
  },
];
