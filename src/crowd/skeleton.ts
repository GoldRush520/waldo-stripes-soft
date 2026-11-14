/**
 * Shared character skeleton contract. Every person in the town is one instance of the same rig,
 * posed entirely on the GPU. Body-local axes: +y up, +z forward (the way the person faces),
 * +x is the character's LEFT. Reference adult is 1.7 m tall.
 */

/** Rig parts. A vertex belongs to exactly one part and is authored in that part's pivot space. */
export const Part = {
  /** pivot: hip centre (root). */
  Pelvis: 0,
  /** pivot: base of spine. Torso geometry spans y 0 .. 0.46 */
  Torso: 1,
  /** pivot: neck. Head centre is at y = HEAD_CENTER_Y */
  Head: 2,
  /** pivot: shoulder. Arm hangs along -y for UPPER_ARM */
  UpperArmL: 3,
  /** pivot: elbow. Forearm hangs along -y for FOREARM, hand centre at -HAND_Y */
  ForeArmL: 4,
  UpperArmR: 5,
  ForeArmR: 6,
  /** pivot: hip joint. Thigh hangs along -y for THIGH */
  ThighL: 7,
  /** pivot: knee. Shin hangs along -y for SHIN */
  ShinL: 8,
  ThighR: 9,
  ShinR: 10,
  /** pivot: ankle. Sole is at y = -ANKLE_H, toes toward +z */
  FootL: 11,
  FootR: 12,
  /** pivot: hand centre, after the clip's grip rotation. Held props live here. */
  HandL: 13,
  HandR: 14,
  /** pivot: the person's ground point; ignores the pose entirely (only position + heading). */
  Ground: 15,
} as const;
export type PartId = (typeof Part)[keyof typeof Part];

/** Reference adult metrics in metres. */
export const RIG = {
  ROOT_Y: 0.9,
  HIP_X: 0.09,
  HIP_Y: -0.03,
  THIGH: 0.41,
  SHIN: 0.4,
  ANKLE_H: 0.06,
  SPINE_Y: 0.05,
  SHOULDER_X: 0.2,
  SHOULDER_Y: 0.44,
  NECK_Y: 0.5,
  HEAD_CENTER_Y: 0.14,
  HEAD_R: 0.13,
  UPPER_ARM: 0.27,
  FOREARM: 0.25,
  HAND_Y: 0.29,
  HEIGHT: 1.72,
} as const;

/** How a vertex gets its colour. */
export const Slot = {
  /** authored vertex colour; tint-masked vertices take the tint of the vertex's option category */
  Vertex: 0,
  Skin: 1,
  /** shirt colour with the person's pattern (stripes, dots, checks...) */
  Shirt: 2,
  Pants: 3,
  Shoes: 4,
  Hair: 5,
  /** shirt if the person has long sleeves, otherwise skin */
  Sleeve: 6,
  /** pants if long trousers, otherwise skin (shorts / skirts) */
  LowerLeg: 7,
  /** the shirt's second (contrast) colour, unpatterned */
  Shirt2: 8,
  /** head skin with procedural face features */
  Face: 9,
} as const;
export type SlotId = (typeof Slot)[keyof typeof Slot];

/**
 * Option categories. Category 0 is the always-drawn body. Every other option (a hat, a hairstyle, a
 * held prop) is its own small instanced geometry drawn only for the people who selected it, so no
 * hidden vertices are ever submitted. The category only selects which per-person tint a
 * tint-masked vertex takes.
 */
export const Cat = {
  Always: 0,
  Hair: 1,
  Hat: 2,
  Face: 3,
  Beard: 4,
  Lower: 5,
  Upper: 6,
  Back: 7,
  Neck: 8,
  HandL: 9,
  HandR: 10,
  Special: 11,
  Extra: 12,
} as const;
export type CatId = (typeof Cat)[keyof typeof Cat];
export const CAT_COUNT = 13;

/** Pose texture layout: one row of POSE_COLS RGBA texels per baked keyframe. */
export const POSE_COLS = 10;
export const PoseCol = {
  /** root offset x,y,z (metres, reference adult) + yaw */
  RootPos: 0,
  /** root pitch, roll */
  RootRot: 1,
  /** lean, side, twist */
  Spine: 2,
  /** nod, turn, tilt */
  Head: 3,
  /** fwd, out, twist, bend */
  ArmL: 4,
  ArmR: 5,
  LegL: 6,
  LegR: 7,
  /** gripL pitch, gripL roll, gripR pitch, gripR roll */
  Grip: 8,
  /** footL pitch, footR pitch */
  Feet: 9,
} as const;

/** Person record layout in the person texture: PERSON_TEXELS RGBA float texels per person. */
export const PERSON_TEXELS = 10;
export const PERSONS_PER_ROW = 64;
export const PERSON_TEX_WIDTH = PERSON_TEXELS * PERSONS_PER_ROW;

/** Rows of baked poses are packed POSE_ROWS_PER_LINE to a texture line. */
export const POSE_ROWS_PER_LINE = 64;
export const POSE_TEX_WIDTH = POSE_COLS * POSE_ROWS_PER_LINE;

/** Motion records: MOTION_TEXELS RGBA float texels each. */
export const MOTION_TEXELS = 3;
export const MOTIONS_PER_ROW = 128;
export const MOTION_TEX_WIDTH = MOTION_TEXELS * MOTIONS_PER_ROW;

/** Route points texture width (points are packed row-major). */
export const ROUTE_TEX_WIDTH = 1024;

export const MotionKind = {
  None: 0,
  /** follow a closed loop of evenly spaced points */
  Route: 1,
  /** rotate about a vertical axis (carousel, roundabout) */
  Spin: 2,
  /** ride a vertical wheel but stay upright (Ferris gondola) */
  Wheel: 3,
  /** rotate about the local z axis (the Ferris wheel itself, windmill sails) */
  Axle: 4,
  /** pendulum about the local x axis (swings, swing-boat) */
  Swing: 5,
  /** gentle heave and roll (moored boats, buoys) */
  Bob: 6,
  /** rock about the local z axis (see-saw) */
  Rock: 7,
  /** tossed-object arc (juggling balls, pancakes) */
  Toss: 8,
} as const;
export type MotionKindId = (typeof MotionKind)[keyof typeof MotionKind];

/** Shirt patterns. */
export const Pattern = {
  Solid: 0,
  HStripe: 1,
  VStripe: 2,
  Dots: 3,
  Check: 4,
  Block: 5,
  WideStripe: 6,
} as const;
export type PatternId = (typeof Pattern)[keyof typeof Pattern];
