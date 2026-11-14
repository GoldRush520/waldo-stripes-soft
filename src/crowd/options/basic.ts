/**
 * Foundational character options: the hair, hats, glasses, garments and held props needed by the
 * hero target and its decoys. Further libraries live in sibling files and follow these examples.
 *
 * Authoring spaces (see skeleton.ts): Head pieces are relative to the neck pivot (head centre at
 * y = 0.14, radius 0.13); Hand pieces are relative to the hand centre with +y toward the elbow
 * when the arm hangs; Torso pieces span y 0..0.46 above the waist; Pelvis pieces hang below y = 0.
 */
import { C } from '../../core/palette';
import {
  blob,
  box,
  cone,
  cyl,
  detail,
  dome,
  merge,
  rbox,
  rotateX,
  rotateZ,
  scale,
  sphere,
  tintable,
  torus,
  translate,
} from '../../core/geo';
import { Cat, Part, RIG, Slot } from '../skeleton';
import { type RigOption, piece } from '../rig';

const HY = RIG.HEAD_CENTER_Y;
const HR = RIG.HEAD_R;

const cap = (r = HR + 0.009, tilt = -0.42): ReturnType<typeof dome> =>
  translate(rotateX(dome(r, C.cocoa, 10, 4), tilt), 0, HY + 0.012, -0.004);

function hair(key: string, extra: ReturnType<typeof dome>[] = [], tilt = -0.42): RigOption {
  return { key, cat: Cat.Hair, pieces: [piece(merge(cap(HR + 0.009, tilt), extra), Part.Head, Slot.Hair)] };
}

const HAIR: RigOption[] = [
  hair('hair.short'),
  hair('hair.long', [translate(blob(0.128, 0.17, 0.07, C.cocoa, 8, 5), 0, HY - 0.07, -0.085)]),
  hair('hair.bob', [translate(blob(0.142, 0.11, 0.1, C.cocoa, 8, 5), 0, HY - 0.02, -0.05)], -0.3),
  hair('hair.bun', [translate(sphere(0.058, C.cocoa, 7, 5), 0, HY + 0.125, -0.075)]),
  hair('hair.ponytail', [translate(rotateX(blob(0.04, 0.12, 0.045, C.cocoa, 6, 4), 0.5), 0, HY - 0.02, -0.165)]),
  hair('hair.curly', [
    translate(sphere(0.075, C.cocoa, 6, 4), -0.08, HY + 0.08, -0.03),
    translate(sphere(0.075, C.cocoa, 6, 4), 0.08, HY + 0.08, -0.03),
    translate(sphere(0.08, C.cocoa, 6, 4), 0, HY + 0.11, -0.05),
    translate(sphere(0.07, C.cocoa, 6, 4), 0, HY + 0.02, -0.1),
  ]),
];

const band = (rb: number, rt: number, y: number, h: number, tint: boolean): ReturnType<typeof cyl> => {
  const g = translate(cyl(rb, rt, h, C.ivory, 10, false), 0, y, 0);
  return tint ? tintable(g) : g;
};

/** Striped bobble hat: tinted and ivory bands alternate, with a tinted pom. */
function bobbleHat(): RigOption {
  const y0 = HY + 0.035;
  const g = merge(
    band(0.146, 0.146, y0, 0.034, false),
    band(0.14, 0.138, y0 + 0.034, 0.034, true),
    band(0.138, 0.128, y0 + 0.068, 0.032, false),
    band(0.128, 0.108, y0 + 0.1, 0.03, true),
    band(0.108, 0.07, y0 + 0.13, 0.026, false),
    tintable(translate(cone(0.07, 0.03, C.ivory, 10), 0, y0 + 0.156, 0)),
    tintable(translate(sphere(0.043, C.ivory, 7, 5), 0, y0 + 0.205, 0)),
  );
  return { key: 'hat.bobble', cat: Cat.Hat, pieces: [piece(g, Part.Head, Slot.Vertex)] };
}

function simpleHat(key: string, g: ReturnType<typeof dome>): RigOption {
  return { key, cat: Cat.Hat, pieces: [piece(g, Part.Head, Slot.Vertex)] };
}

const HATS: RigOption[] = [
  bobbleHat(),
  simpleHat(
    'hat.sun',
    merge(
      tintable(translate(rotateX(cyl(0.27, 0.25, 0.014, C.butter, 12), -0.1), 0, HY + 0.055, 0)),
      tintable(translate(dome(0.128, C.butter, 10, 4), 0, HY + 0.06, 0)),
      translate(cyl(0.131, 0.131, 0.03, C.ivory, 10, false), 0, HY + 0.062, 0),
    ),
  ),
  simpleHat(
    'hat.cap',
    merge(
      tintable(translate(dome(0.139, C.blue, 10, 4), 0, HY + 0.03, 0)),
      tintable(translate(rotateX(rbox(0.19, 0.016, 0.13, 0.007, C.blue), 0.12), 0, HY + 0.045, 0.14)),
    ),
  ),
  simpleHat(
    'hat.beret',
    merge(
      tintable(translate(rotateZ(blob(0.155, 0.046, 0.15, C.coral, 10, 5), 0.16), 0.02, HY + 0.125, -0.01)),
      detail(translate(cyl(0.006, 0.006, 0.03, C.cocoa, 4), 0.02, HY + 0.165, -0.01)),
    ),
  ),
  simpleHat(
    'hat.toque',
    merge(
      translate(cyl(0.118, 0.122, 0.11, C.white, 10, false), 0, HY + 0.07, 0),
      translate(blob(0.15, 0.075, 0.15, C.white, 10, 5), 0, HY + 0.215, 0),
    ),
  ),
  simpleHat(
    'hat.top',
    merge(
      translate(cyl(0.108, 0.114, 0.2, C.cocoa, 10), 0, HY + 0.085, 0),
      translate(cyl(0.178, 0.178, 0.014, C.cocoa, 12), 0, HY + 0.078, 0),
      tintable(translate(cyl(0.117, 0.117, 0.035, C.coral, 10, false), 0, HY + 0.094, 0)),
    ),
  ),
  simpleHat(
    'hat.boater',
    merge(
      translate(cyl(0.118, 0.118, 0.07, C.butterLight, 10), 0, HY + 0.085, 0),
      translate(cyl(0.2, 0.2, 0.014, C.butterLight, 12), 0, HY + 0.08, 0),
      tintable(translate(cyl(0.121, 0.121, 0.028, C.coral, 10, false), 0, HY + 0.096, 0)),
    ),
  ),
  simpleHat(
    'hat.hard',
    merge(
      tintable(translate(dome(0.145, C.butter, 10, 4), 0, HY + 0.035, 0)),
      tintable(translate(cyl(0.165, 0.165, 0.014, C.butter, 10), 0, HY + 0.035, 0.012)),
    ),
  ),
  simpleHat(
    'hat.sailor',
    merge(
      translate(cyl(0.125, 0.14, 0.05, C.white, 10), 0, HY + 0.075, 0),
      tintable(translate(cyl(0.128, 0.128, 0.022, C.blue, 10, false), 0, HY + 0.075, 0)),
    ),
  ),
  simpleHat('hat.beanie', tintable(translate(scale(dome(0.142, C.sage, 10, 4), 1, 1.15, 1), 0, HY + 0.03, 0))),
  simpleHat(
    'hat.party',
    merge(
      tintable(translate(cone(0.085, 0.2, C.butter, 8), 0, HY + 0.09, 0)),
      translate(sphere(0.022, C.ivory, 5, 4), 0, HY + 0.3, 0),
    ),
  ),
];

function roundGlasses(): RigOption {
  const z = HR * 0.94;
  const ring = (sx: number): ReturnType<typeof torus> =>
    translate(rotateX(torus(0.041, 0.011, C.ink, 5, 12), Math.PI / 2), sx * 0.052, HY + 0.012, z);
  const g = merge(
    ring(-1),
    ring(1),
    translate(box(0.03, 0.012, 0.012, C.ink), 0, HY + 0.012, z),
    translate(box(0.01, 0.012, 0.13, C.ink), -0.098, HY + 0.012, z - 0.07),
    translate(box(0.01, 0.012, 0.13, C.ink), 0.098, HY + 0.012, z - 0.07),
  );
  return { key: 'face.glasses.round', cat: Cat.Face, pieces: [piece(g, Part.Head, Slot.Vertex)] };
}

function sunglasses(): RigOption {
  const z = HR * 0.95;
  const g = merge(
    translate(rbox(0.075, 0.046, 0.012, 0.005, C.ink), -0.05, HY - 0.01, z),
    translate(rbox(0.075, 0.046, 0.012, 0.005, C.ink), 0.05, HY - 0.01, z),
    translate(box(0.03, 0.008, 0.008, C.ink), 0, HY + 0.02, z),
  );
  return { key: 'face.sunglasses', cat: Cat.Face, pieces: [piece(g, Part.Head, Slot.Vertex)], nearOnly: true };
}

function skirt(key: string, length: number, slot: (typeof Slot)[keyof typeof Slot]): RigOption {
  const g = translate(scale(cyl(0.2 + length * 0.2, 0.168, length, C.coral, 10), 1, 1, 0.82), 0, 0.05 - length, 0);
  return { key, cat: Cat.Lower, pieces: [piece(g, Part.Pelvis, slot)] };
}

function apron(): RigOption {
  const bib = tintable(translate(rbox(0.24, 0.27, 0.02, 0.008, C.ivory), 0, 0.09, 0.118));
  const lap = tintable(translate(rbox(0.3, 0.46, 0.022, 0.009, C.ivory), 0, -0.4, 0.118));
  return {
    key: 'upper.apron',
    cat: Cat.Upper,
    pieces: [piece(bib, Part.Torso, Slot.Vertex), piece(lap, Part.Pelvis, Slot.Vertex)],
  };
}

function backpack(): RigOption {
  const g = merge(
    tintable(translate(rbox(0.25, 0.31, 0.13, 0.05, C.sage), 0, 0.1, -0.2)),
    detail(translate(rbox(0.16, 0.1, 0.03, 0.012, C.ivoryShade), 0, 0.14, -0.27)),
  );
  return { key: 'back.pack', cat: Cat.Back, pieces: [piece(g, Part.Torso, Slot.Vertex)] };
}

function walkingStick(): RigOption {
  const g = merge(
    translate(cyl(0.011, 0.014, 0.88, C.timberDeep, 5), 0, -0.82, 0.02),
    translate(rotateX(cyl(0.015, 0.015, 0.11, C.timberDeep, 5), Math.PI / 2), 0, 0.06, -0.035),
  );
  return { key: 'hold.stick', cat: Cat.HandR, pieces: [piece(g, Part.HandR, Slot.Vertex)] };
}

function umbrella(): RigOption {
  const canopy = tintable(translate(scale(dome(0.56, C.coral, 8, 3), 1, 0.42, 1), 0, 0.72, 0));
  const g = merge(
    translate(cyl(0.01, 0.01, 1.0, C.timberDeep, 4), 0, -0.06, 0),
    canopy,
    translate(cone(0.03, 0.07, C.ivory, 5), 0, 0.95, 0),
  );
  return { key: 'hold.umbrella', cat: Cat.HandR, pieces: [piece(g, Part.HandR, Slot.Vertex)], reach: 1.2 };
}

function balloon(): RigOption {
  const g = merge(
    detail(translate(cyl(0.004, 0.004, 1.15, C.ivoryDeep, 3), 0, 0, 0)),
    tintable(translate(blob(0.17, 0.21, 0.17, C.coral, 8, 6), 0, 1.33, 0)),
    tintable(translate(cone(0.03, 0.04, C.coral, 5), 0, 1.1, 0)),
  );
  return { key: 'hold.balloon', cat: Cat.HandL, pieces: [piece(g, Part.HandL, Slot.Vertex)], reach: 1.6 };
}

function bag(): RigOption {
  const g = merge(
    tintable(translate(rbox(0.27, 0.22, 0.1, 0.03, C.butter), 0, -0.33, 0)),
    detail(translate(rotateX(torus(0.07, 0.008, C.timberDeep, 4, 8), Math.PI / 2), 0, -0.1, 0)),
  );
  return { key: 'hold.bag', cat: Cat.HandL, pieces: [piece(g, Part.HandL, Slot.Vertex)] };
}

function crate(): RigOption {
  const g = merge(
    translate(rbox(0.44, 0.26, 0.32, 0.02, C.timber), 0, 0.12, 0.3),
    detail(translate(box(0.45, 0.03, 0.33, C.timberDeep), 0, 0.2, 0.3)),
  );
  return { key: 'carry.crate', cat: Cat.Special, pieces: [piece(g, Part.Torso, Slot.Vertex)] };
}

export const BASIC_OPTIONS: readonly RigOption[] = [
  ...HAIR,
  ...HATS,
  roundGlasses(),
  sunglasses(),
  skirt('lower.skirt', 0.36, Slot.Pants),
  skirt('lower.skirt.long', 0.72, Slot.Pants),
  skirt('lower.dress', 0.42, Slot.Shirt),
  skirt('lower.dress.long', 0.78, Slot.Shirt),
  apron(),
  backpack(),
  walkingStick(),
  umbrella(),
  balloon(),
  bag(),
  crate(),
];
