/**
 * The always-on body, in two authored detail levels. Vertices are in part-pivot space (skeleton.ts).
 * The detailed body (≈ 600 triangles) is sized for the fixed game view, where an adult is ~43 px
 * tall; the low body (≈ 256) is only used by development zoom-outs.
 */
import { C } from '../core/palette';
import { blob, box, capsule, cyl, lathe, rbox, scale, sphere, translate } from '../core/geo';
import { Part, RIG, Slot } from './skeleton';
import { type RigPiece, piece } from './rig';

const SKIN = C.clayLight;

const LIMBS = [
  { upper: Part.UpperArmL, fore: Part.ForeArmL, thigh: Part.ThighL, shin: Part.ShinL, foot: Part.FootL },
  { upper: Part.UpperArmR, fore: Part.ForeArmR, thigh: Part.ThighR, shin: Part.ShinR, foot: Part.FootR },
] as const;

export function bodyHigh(): RigPiece[] {
  const out: RigPiece[] = [];
  out.push(piece(translate(blob(0.172, 0.118, 0.128, SKIN, 7, 4), 0, -0.012, 0), Part.Pelvis, Slot.Pants));
  const torso = scale(
    lathe(
      [
        [0.03, -0.03],
        [0.152, 0.0],
        [0.17, 0.16],
        [0.19, 0.38],
        [0.12, 0.455],
        [0.001, 0.482],
      ],
      SKIN,
      9,
    ),
    1,
    1,
    0.66,
  );
  out.push(piece(torso, Part.Torso, Slot.Shirt));
  out.push(piece(translate(cyl(0.05, 0.046, 0.085, SKIN, 6, false), 0, 0.455, 0), Part.Torso, Slot.Skin));
  const head = translate(scale(sphere(RIG.HEAD_R, SKIN, 10, 7), 1, 1.04, 0.97), 0, RIG.HEAD_CENTER_Y, 0);
  out.push(piece(head, Part.Head, Slot.Face));
  out.push(piece(translate(sphere(0.022, SKIN, 4, 3), 0, RIG.HEAD_CENTER_Y - 0.012, 0.127), Part.Head, Slot.Skin));
  for (const l of LIMBS) {
    out.push(piece(translate(capsule(0.053, 0.335, SKIN, 6, 1), 0, -0.3, 0), l.upper, Slot.Shirt));
    out.push(piece(translate(capsule(0.044, 0.285, SKIN, 5, 1), 0, -0.265, 0), l.fore, Slot.Sleeve));
    out.push(piece(translate(blob(0.04, 0.052, 0.034, SKIN, 5, 3), 0, -RIG.HAND_Y, 0), l.fore, Slot.Skin));
    out.push(piece(translate(capsule(0.077, 0.48, SKIN, 6, 1), 0, -0.44, 0), l.thigh, Slot.Pants));
    out.push(piece(translate(capsule(0.058, 0.44, SKIN, 6, 1), 0, -0.415, 0), l.shin, Slot.LowerLeg));
    out.push(piece(translate(blob(0.052, 0.042, 0.122, SKIN, 6, 3), 0, -0.022, 0.05), l.foot, Slot.Shoes));
  }
  return out;
}

export function bodyLow(): RigPiece[] {
  const out: RigPiece[] = [];
  out.push(piece(translate(box(0.31, 0.2, 0.22, SKIN), 0, -0.11, 0), Part.Pelvis, Slot.Pants));
  const torso = scale(
    lathe(
      [
        [0.14, -0.02],
        [0.175, 0.2],
        [0.19, 0.4],
        [0.07, 0.48],
      ],
      SKIN,
      6,
    ),
    1,
    1,
    0.68,
  );
  out.push(piece(torso, Part.Torso, Slot.Shirt));
  const head = translate(scale(sphere(RIG.HEAD_R, SKIN, 7, 5), 1, 1.04, 0.97), 0, RIG.HEAD_CENTER_Y, 0);
  out.push(piece(head, Part.Head, Slot.Face));
  for (const l of LIMBS) {
    out.push(piece(translate(cyl(0.05, 0.052, 0.3, SKIN, 4), 0, -0.29, 0), l.upper, Slot.Shirt));
    out.push(piece(translate(cyl(0.042, 0.044, 0.31, SKIN, 4), 0, -0.31, 0), l.fore, Slot.Sleeve));
    out.push(piece(translate(cyl(0.068, 0.078, 0.44, SKIN, 4), 0, -0.43, 0), l.thigh, Slot.Pants));
    out.push(piece(translate(cyl(0.05, 0.06, 0.41, SKIN, 4), 0, -0.41, 0), l.shin, Slot.LowerLeg));
    out.push(piece(translate(box(0.095, 0.07, 0.22, SKIN), 0, -0.062, 0.045), l.foot, Slot.Shoes));
  }
  return out;
}
