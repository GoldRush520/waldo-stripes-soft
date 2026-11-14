/**
 * The crowd's small shader family: lit colour, shadow depth, picking and contact blobs.
 * All four share the same vertex posing routine and the same uniform objects.
 */
import * as THREE from 'three';
import { CROWD_FRAGMENT_PARS, CROWD_VERTEX_PARS, MOTION_GLSL } from './shaderChunks';

export interface CrowdUniforms {
  readonly uPerson: THREE.IUniform<THREE.Texture | null>;
  readonly uPose: THREE.IUniform<THREE.Texture | null>;
  readonly uPalette: THREE.IUniform<THREE.Texture | null>;
  readonly uMotion: THREE.IUniform<THREE.Texture | null>;
  readonly uRoute: THREE.IUniform<THREE.Texture | null>;
  /** per-slot joint matrices written by the joint pass (null on the legacy per-vertex path) */
  readonly uJoints: THREE.IUniform<THREE.Texture | null>;
  /** slot -> person index lookup for the joint pass */
  readonly uSlotMap: THREE.IUniform<THREE.Texture | null>;
  /** gesture clock (seconds) */
  readonly uPoseTime: THREE.IUniform<number>;
  /** locomotion / ride clock (seconds) */
  readonly uMoveTime: THREE.IUniform<number>;
}

export function createCrowdUniforms(): CrowdUniforms {
  return {
    uPerson: { value: null },
    uPose: { value: null },
    uPalette: { value: null },
    uMotion: { value: null },
    uRoute: { value: null },
    uJoints: { value: null },
    uSlotMap: { value: null },
    uPoseTime: { value: 0 },
    uMoveTime: { value: 0 },
  };
}

export interface CrowdMaterials {
  readonly color: THREE.Material;
  readonly depth: THREE.Material;
  readonly pick: THREE.Material;
  readonly blob: THREE.Material;
}

/**
 * `jointTexture` selects the fast path where vertices read precomputed joint matrices; without it
 * (no float render targets) the same transform is evaluated per vertex.
 */
export function createCrowdMaterials(uniforms: CrowdUniforms, jointTexture: boolean): CrowdMaterials {
  const shared = uniforms as unknown as Record<string, THREE.IUniform>;
  const define = jointTexture ? '#define CROWD_JOINT_TEX\n' : '';
  const VERTEX_HEAD = `${define}${MOTION_GLSL}\n${CROWD_VERTEX_PARS}`;
  const keySuffix = jointTexture ? '-joints' : '-legacy';

  const color = new THREE.MeshLambertMaterial();
  color.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_HEAD}`)
      .replace(
        '#include <beginnormal_vertex>',
        'vec3 crowdPos; vec3 crowdNrm; crowdVertex(crowdPos, crowdNrm);\nvec3 objectNormal = crowdNrm;',
      )
      .replace('#include <begin_vertex>', 'vec3 transformed = crowdPos;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${CROWD_FRAGMENT_PARS}`)
      .replace('#include <color_fragment>', 'diffuseColor.rgb = crowdColor();');
  };
  color.customProgramCacheKey = () => `crowd-color${keySuffix}`;

  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  depth.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_HEAD}`)
      .replace(
        '#include <begin_vertex>',
        'vec3 crowdPos; vec3 crowdNrm; crowdVertex(crowdPos, crowdNrm);\nvec3 transformed = crowdPos;',
      );
  };
  depth.customProgramCacheKey = () => `crowd-depth${keySuffix}`;

  const pick = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: `${VERTEX_HEAD}
      void main() {
        vec3 p; vec3 n;
        crowdVertex(p, n);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      flat varying float vPerson;
      void main() {
        float id = vPerson + 1.0;
        gl_FragColor = vec4(mod(id, 256.0) / 255.0, mod(floor(id / 256.0), 256.0) / 255.0, floor(id / 65536.0) / 255.0, 1.0);
      }`,
  });

  const blob = new THREE.ShaderMaterial({
    uniforms: shared,
    vertexShader: `${VERTEX_HEAD}
      varying vec2 vBlob;
      void main() {
        int person = int(aPerson.x + 0.5);
        vec4 t0 = personTexel(person, 0);
        vec4 t1 = personTexel(person, 1);
        vec4 t2 = personTexel(person, 2);
        vec4 t5 = personTexel(person, 5);
        vec3 c = t0.xyz;
        if (t1.x >= 0.0) {
          mat3 R; vec3 T;
          motionFrame(int(t1.x + 0.5), R, T);
          c = R * c + T;
        }
        float r = 0.36 * t2.y * t5.w;
        vBlob = position.xz;
        gl_Position = projectionMatrix * viewMatrix * vec4(c + vec3(position.x * r, 0.035, position.z * r), 1.0);
      }`,
    fragmentShader: `
      varying vec2 vBlob;
      void main() {
        float d = length(vBlob) * 2.0;
        float a = (1.0 - smoothstep(0.15, 1.0, d)) * 0.36;
        gl_FragColor = vec4(1.0 - a * vec3(0.92, 1.0, 1.02), 1.0);
      }`,
    blending: THREE.CustomBlending,
    blendSrc: THREE.ZeroFactor,
    blendDst: THREE.SrcColorFactor,
    blendEquation: THREE.AddEquation,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  return { color, depth, pick, blob };
}
