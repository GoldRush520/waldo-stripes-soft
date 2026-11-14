/**
 * GLSL for the GPU-posed crowd.
 *
 * `crowdPartTransform` is the single source of truth for posing: given a person and a rig part it
 * returns the affine transform from part-pivot space to world space (pose chain, body proportions,
 * placement and motion frame). It runs in one of two places:
 *  - JOINT TEXTURE path (default): a tiny fragment pass evaluates it once per visible person and
 *    part each frame and stores the 3x4 matrices in a float texture; every vertex of the colour,
 *    shadow and picking passes then only reads three texels.
 *  - LEGACY path (no float render targets): evaluated per vertex, as before.
 * Both paths share this code, so animation, shadows and picking always agree.
 */
import {
  MOTIONS_PER_ROW,
  MOTION_TEXELS,
  PERSONS_PER_ROW,
  PERSON_TEXELS,
  POSE_COLS,
  POSE_ROWS_PER_LINE,
  RIG,
  ROUTE_TEX_WIDTH,
} from './skeleton';

const f = (n: number): string => (Number.isInteger(n) ? `${n}.0` : `${n}`);

/** Joint texture layout: PARTS parts x 3 texels per slot, SLOTS_PER_ROW slots per texture row. */
export const JOINT_PARTS = 16;
export const JOINT_SLOTS_PER_ROW = 32;
export const JOINT_TEXELS = JOINT_PARTS * 3;
export const JOINT_TEX_WIDTH = JOINT_TEXELS * JOINT_SLOTS_PER_ROW;

/** Motion-frame evaluation, shared with the dynamic prop material. */
export const MOTION_GLSL = /* glsl */ `
uniform sampler2D uMotion;
uniform sampler2D uRoute;
uniform float uMoveTime;

mat3 crx(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 cry(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 crz(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }

vec4 motionTexel(int id, int k) {
  return texelFetch(uMotion, ivec2((id % ${MOTIONS_PER_ROW}) * ${MOTION_TEXELS} + k, id / ${MOTIONS_PER_ROW}), 0);
}
vec3 routePoint(int i) {
  return texelFetch(uRoute, ivec2(i % ${ROUTE_TEX_WIDTH}, i / ${ROUTE_TEX_WIDTH}), 0).xyz;
}

void motionFrame(int id, out mat3 R, out vec3 T) {
  vec4 m0 = motionTexel(id, 0);
  vec4 m1 = motionTexel(id, 1);
  vec4 m2 = motionTexel(id, 2);
  int kind = int(m0.x + 0.5);
  float yaw = m0.y;
  R = mat3(1.0);
  T = vec3(0.0);
  if (kind == 1) {
    float s = mod(m1.y + m1.z * uMoveTime, m1.x);
    int n = int(m0.w + 0.5);
    float fi = s / m1.x * float(n);
    int i0 = int(floor(fi));
    float fr = fi - float(i0);
    i0 = i0 % n;
    int base = int(m0.z + 0.5);
    vec3 a = routePoint(base + i0);
    vec3 b = routePoint(base + (i0 + 1) % n);
    vec3 c = routePoint(base + (i0 + 2) % n);
    vec3 tangent = mix(b - a, c - b, fr);
    R = cry(atan(tangent.x, tangent.z));
    T = mix(a, b, fr) + R * vec3(m1.w, m2.x, 0.0);
    T.y += m2.y * sin(uMoveTime * 1.7 + m1.y);
  } else if (kind == 2) {
    R = cry(yaw + m2.x + m1.w * uMoveTime);
    T = m1.xyz;
  } else if (kind == 3) {
    float a = m2.x + m1.w * uMoveTime;
    R = cry(yaw);
    T = m1.xyz + R * vec3(cos(a) * m2.y, sin(a) * m2.y, 0.0);
  } else if (kind == 4) {
    R = cry(yaw) * crz(m2.x + m1.w * uMoveTime);
    T = m1.xyz;
  } else if (kind == 5) {
    R = cry(yaw) * crx(m2.y * sin(m2.x + m1.w * uMoveTime));
    T = m1.xyz;
  } else if (kind == 6) {
    float ph = m2.x + m1.w * uMoveTime;
    R = cry(yaw) * crz(m2.z * sin(ph * 0.7 + 1.3));
    T = m1.xyz + vec3(0.0, m2.y * sin(ph), 0.0);
  } else if (kind == 7) {
    R = cry(yaw) * crz(m2.y * sin(m2.x + m1.w * uMoveTime));
    T = m1.xyz;
  } else if (kind == 8) {
    float ph = (m2.x + m1.w * uMoveTime) / 6.2831853;
    float u = fract(ph);
    float dir = mod(floor(ph), 2.0) * 2.0 - 1.0;
    R = cry(yaw);
    T = m1.xyz + R * vec3(m2.y * (2.0 * u - 1.0) * dir, m2.z * 4.0 * u * (1.0 - u), 0.0);
  }
}
`;

/** Person / pose data access and the part transform. Requires MOTION_GLSL above it. */
export const CROWD_POSE_GLSL = /* glsl */ `
uniform sampler2D uPerson;
uniform sampler2D uPose;
uniform float uPoseTime;

vec4 personTexel(int p, int k) {
  return texelFetch(uPerson, ivec2((p % ${PERSONS_PER_ROW}) * ${PERSON_TEXELS} + k, p / ${PERSONS_PER_ROW}), 0);
}
vec4 poseTexel(int row, int col) {
  return texelFetch(uPose, ivec2((row % ${POSE_ROWS_PER_LINE}) * ${POSE_COLS} + col, row / ${POSE_ROWS_PER_LINE}), 0);
}

int gRow0;
int gRow1;
float gRowF;
vec4 poseJoint(int col) {
  return mix(poseTexel(gRow0, col), poseTexel(gRow1, col), gRowF);
}

/* World transform of one rig part of one person: world = A * partLocal + T. */
void crowdPartTransform(int person, int part, out mat3 A, out vec3 T) {
  vec4 t0 = personTexel(person, 0);
  vec4 t1 = personTexel(person, 1);
  vec4 t2 = personTexel(person, 2);
  float build = t2.z;
  A = mat3(1.0);
  T = vec3(0.0);
  if (part != 15) {
    float rows = t1.z;
    float rate = t1.w;
    float clock = rate < 0.0 ? uMoveTime : uPoseTime;
    float cyc = fract(clock * abs(rate) + t2.x) * rows;
    float k0 = floor(cyc);
    gRowF = cyc - k0;
    gRow0 = int(t1.y + 0.5) + int(k0);
    gRow1 = int(t1.y + 0.5) + int(mod(k0 + 1.0, rows));

    if (part == 2) A = mat3(t2.w);
    else if (part < 13) A = mat3(build, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, build);

    bool right = (part == 5 || part == 6 || part == 9 || part == 10 || part == 12 || part == 14);
    float sg = right ? -1.0 : 1.0;

    if (part >= 7 && part <= 12) {
      vec4 leg = poseJoint(right ? 7 : 6);
      if (part >= 11) {
        vec4 feet = poseJoint(9);
        mat3 Rf = crx(right ? feet.y : feet.x);
        A = Rf * A;
        T = Rf * T + vec3(0.0, -${f(RIG.SHIN)}, 0.0);
      }
      if (part == 8 || part == 10 || part >= 11) {
        mat3 Rk = crx(leg.w);
        A = Rk * A;
        T = Rk * T + vec3(0.0, -${f(RIG.THIGH)}, 0.0);
      }
      mat3 Rh = crx(-leg.x) * crz(sg * leg.y) * cry(sg * leg.z);
      A = Rh * A;
      T = Rh * T + vec3(sg * ${f(RIG.HIP_X)} * build, ${f(RIG.HIP_Y)}, 0.0);
    } else if (part >= 1) {
      if (part == 2) {
        vec4 hd = poseJoint(3);
        mat3 Rhd = cry(hd.y) * crx(hd.x) * crz(-hd.z);
        A = Rhd * A;
        T = Rhd * T + vec3(0.0, ${f(RIG.NECK_Y)}, 0.0);
      } else if (part >= 3) {
        vec4 arm = poseJoint(right ? 5 : 4);
        if (part >= 13) {
          vec4 grip = poseJoint(8);
          vec2 g = right ? grip.zw : grip.xy;
          mat3 Rg = crx(g.x) * crz(sg * g.y);
          A = Rg * A;
          T = Rg * T + vec3(0.0, -${f(RIG.HAND_Y)}, 0.0);
        }
        if (part == 4 || part == 6 || part >= 13) {
          mat3 Re = crx(-arm.w);
          A = Re * A;
          T = Re * T + vec3(0.0, -${f(RIG.UPPER_ARM)}, 0.0);
        }
        mat3 Rs = crx(-arm.x) * crz(sg * arm.y) * cry(sg * arm.z);
        A = Rs * A;
        T = Rs * T + vec3(sg * ${f(RIG.SHOULDER_X)} * build, ${f(RIG.SHOULDER_Y)}, 0.0);
      }
      vec4 sp = poseJoint(2);
      mat3 Rsp = cry(sp.z) * crx(sp.x) * crz(-sp.y);
      A = Rsp * A;
      T = Rsp * T + vec3(0.0, ${f(RIG.SPINE_Y)}, 0.0);
    }
    vec4 rp = poseJoint(0);
    vec4 rr = poseJoint(1);
    mat3 Rr = cry(rp.w) * crx(rr.x) * crz(-rr.y);
    A = Rr * A;
    T = Rr * T + rp.xyz + vec3(0.0, ${f(RIG.ROOT_Y)}, 0.0);
  }
  /* person placement, then the motion frame it rides (if any) */
  mat3 Rp = cry(t0.w);
  A = Rp * (A * t2.y);
  T = Rp * (T * t2.y) + t0.xyz;
  if (t1.x >= 0.0) {
    mat3 FR;
    vec3 FT;
    motionFrame(int(t1.x + 0.5), FR, FT);
    A = FR * A;
    T = FR * T + FT;
  }
}
`;

/** Fragment shader of the joint-matrix pass: one texel = one row of one part's 3x4 matrix. */
export const JOINT_PASS_FRAGMENT = /* glsl */ `
precision highp float;
precision highp int;
${MOTION_GLSL}
${CROWD_POSE_GLSL}
uniform sampler2D uSlotMap;
out vec4 jointOut;
void main() {
  ivec2 px = ivec2(gl_FragCoord.xy);
  int slot = px.y * ${JOINT_SLOTS_PER_ROW} + px.x / ${JOINT_TEXELS};
  int local = px.x % ${JOINT_TEXELS};
  int part = local / 3;
  int k = local % 3;
  int person = int(texelFetch(uSlotMap, ivec2(slot % ${JOINT_SLOTS_PER_ROW}, slot / ${JOINT_SLOTS_PER_ROW}), 0).x + 0.5);
  mat3 A;
  vec3 T;
  crowdPartTransform(person, part, A, T);
  jointOut = vec4(A[0][k], A[1][k], A[2][k], T[k]);
}
`;

export const JOINT_PASS_VERTEX = /* glsl */ `
in vec3 position;
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/** Vertex declarations + the posing entry point used by colour, depth and picking materials. */
export const CROWD_VERTEX_PARS = /* glsl */ `
${CROWD_POSE_GLSL}
uniform sampler2D uPalette;
#ifdef CROWD_JOINT_TEX
uniform sampler2D uJoints;
#endif

/* x = person index, y = slot in the joint texture */
attribute vec2 aPerson;
attribute vec4 aMeta;
attribute vec4 aTint;

varying vec3 vCrowdLocal;
flat varying vec3 vColA;
flat varying vec3 vColB;
flat varying vec4 vPat;
flat varying float vPerson;

vec3 paletteColor(float idx) {
  return texelFetch(uPalette, ivec2(int(idx + 0.5), 0), 0).rgb;
}

void crowdVertex(out vec3 outPos, out vec3 outNormal) {
  int person = int(aPerson.x + 0.5);
  int part = int(aMeta.x + 0.5);
  int slot = int(aMeta.y + 0.5);
  int cat = int(aMeta.z + 0.5);
  vPerson = aPerson.x;

  vec4 t3 = personTexel(person, 3);
  vec4 t4 = personTexel(person, 4);
  vec4 t5 = personTexel(person, 5);

  /* ---- colour ---- */
  float fl = t3.x;
  bool longSleeve = mod(fl, 2.0) >= 1.0;
  bool longLeg = mod(floor(fl / 2.0), 2.0) >= 1.0;
  vec3 colA = aTint.rgb;
  vec3 colB = vec3(0.0);
  float kind = 0.0;
  if (slot == 0) {
    if (aTint.a > 0.004 && cat > 0) {
      float tintIdx = personTexel(person, 6 + (cat - 1) / 4)[(cat - 1) % 4];
      colA = mix(colA, paletteColor(tintIdx), aTint.a);
    }
  } else if (slot == 1) {
    colA = paletteColor(t4.w);
  } else if (slot == 2 || (slot == 6 && longSleeve)) {
    colA = paletteColor(t4.x);
    colB = paletteColor(t4.y);
    kind = 1.0;
  } else if (slot == 6) {
    colA = paletteColor(t4.w);
  } else if (slot == 3 || (slot == 7 && longLeg)) {
    colA = paletteColor(t4.z);
  } else if (slot == 7) {
    colA = paletteColor(t4.w);
  } else if (slot == 4) {
    colA = paletteColor(t5.y);
  } else if (slot == 5) {
    colA = paletteColor(t5.x);
  } else if (slot == 8) {
    colA = paletteColor(t4.y);
  } else {
    colA = paletteColor(t4.w);
    colB = paletteColor(t5.z);
    kind = 2.0;
  }
  vColA = colA;
  vColB = colB;
  vPat = vec4(t3.y, t3.z, kind, t3.w);
  vCrowdLocal = position;

  /* ---- pose ---- */
#ifdef CROWD_JOINT_TEX
  int js = int(aPerson.y + 0.5);
  ivec2 at = ivec2((js % ${JOINT_SLOTS_PER_ROW}) * ${JOINT_TEXELS} + part * 3, js / ${JOINT_SLOTS_PER_ROW});
  vec4 r0 = texelFetch(uJoints, at, 0);
  vec4 r1 = texelFetch(uJoints, at + ivec2(1, 0), 0);
  vec4 r2 = texelFetch(uJoints, at + ivec2(2, 0), 0);
  vec4 lp = vec4(position, 1.0);
  outPos = vec3(dot(r0, lp), dot(r1, lp), dot(r2, lp));
  outNormal = normalize(vec3(dot(r0.xyz, normal), dot(r1.xyz, normal), dot(r2.xyz, normal)));
#else
  mat3 A;
  vec3 T;
  crowdPartTransform(person, part, A, T);
  outPos = A * position + T;
  outNormal = normalize(A * normal);
#endif
}
`;

export const CROWD_FRAGMENT_PARS = /* glsl */ `
varying vec3 vCrowdLocal;
flat varying vec3 vColA;
flat varying vec3 vColB;
flat varying vec4 vPat;
flat varying float vPerson;

float crowdStripe(float v) {
  float w = fwidth(v) * 2.0;
  float s = abs(fract(v) - 0.5) * 2.0;
  float e = smoothstep(0.5 - w, 0.5 + w, s);
  return mix(e, 0.5, smoothstep(0.5, 1.4, w));
}

vec3 crowdColor() {
  vec3 c = vColA;
  if (vPat.z > 0.5 && vPat.z < 1.5) {
    float id = vPat.x;
    float sc = max(vPat.y, 0.2);
    float m = 0.0;
    if (id > 0.5 && id < 1.5) {
      m = crowdStripe(vCrowdLocal.y / (0.084 * sc));
    } else if (id < 2.5 && id > 1.5) {
      m = crowdStripe(vCrowdLocal.x / (0.07 * sc) + 0.25);
    } else if (id < 3.5 && id > 2.5) {
      vec2 g = vec2(vCrowdLocal.x, vCrowdLocal.y) / (0.085 * sc);
      g.x += step(1.0, mod(g.y, 2.0)) * 0.5;
      float d = length(fract(g) - 0.5);
      float w = fwidth(g.y);
      m = (1.0 - smoothstep(0.26 - w, 0.26 + w, d)) * (1.0 - smoothstep(0.3, 0.9, w));
      m = mix(m, 0.2, smoothstep(0.3, 0.9, w));
    } else if (id < 4.5 && id > 3.5) {
      float a = crowdStripe(vCrowdLocal.y / (0.1 * sc));
      float b = crowdStripe(vCrowdLocal.x / (0.1 * sc));
      m = abs(a - b);
    } else if (id < 5.5 && id > 4.5) {
      m = smoothstep(0.235, 0.245, vCrowdLocal.y);
    } else if (id > 5.5) {
      m = crowdStripe(vCrowdLocal.y / (0.17 * sc));
    }
    c = mix(vColA, vColB, m);
  } else if (vPat.z > 1.5) {
    vec3 e = (vCrowdLocal - vec3(0.0, ${f(RIG.HEAD_CENTER_Y)}, 0.0)) / ${f(RIG.HEAD_R)};
    float px = fwidth(e.y);
    float vis = (1.0 - smoothstep(0.1, 0.24, px)) * step(0.15, e.z);
    if (vis > 0.001) {
      float ax = abs(e.x);
      float eye = 1.0 - smoothstep(0.085, 0.085 + px * 1.5, length(vec2(ax - 0.34, (e.y - 0.1) * 0.85)));
      float mouth = 0.0;
      float face = vPat.w;
      if (face < 0.5) {
        mouth = (1.0 - smoothstep(0.03, 0.03 + px * 1.5, abs(e.y + 0.4 - 0.55 * e.x * e.x))) * step(ax, 0.27);
      } else if (face < 1.5) {
        mouth = 1.0 - smoothstep(0.1, 0.1 + px * 1.5, length(vec2(e.x, (e.y + 0.42) * 0.8)));
      } else if (face < 2.5) {
        mouth = (1.0 - smoothstep(0.028, 0.028 + px * 1.5, abs(e.y + 0.38))) * step(ax, 0.2);
      } else if (face < 3.5) {
        float lip = e.y + 0.34 - 0.5 * e.x * e.x;
        mouth = step(lip, 0.0) * step(-0.17 + 1.6 * e.x * e.x, lip) * step(ax, 0.34);
      } else {
        mouth = (1.0 - smoothstep(0.03, 0.03 + px * 1.5, abs(e.y + 0.36 + 0.45 * e.x * e.x))) * step(ax, 0.24);
      }
      float blush = (1.0 - smoothstep(0.08, 0.24, length(vec2(ax - 0.56, e.y + 0.2)))) * 0.42;
      c = mix(c, vec3(0.89, 0.26, 0.22), blush * vis);
      c = mix(c, vec3(0.045, 0.025, 0.022), clamp(eye + mouth, 0.0, 1.0) * vis);
    }
  }
  return c;
}
`;
