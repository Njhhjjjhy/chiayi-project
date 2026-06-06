import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  ROOM,
  MIST_LAYER_HEIGHTS, MIST_COLOR, MIST_OPACITY,
  MIST_DRIFT_SPEED, MIST_NOISE_SCALE,
} from '../../geometry/dimensions.js'

// Low floor mist (concept image 12) — experience mode only. Two
// horizontal noise sheets just above the floor; the noise drifts
// slowly so the mist reads as alive without drawing attention.
//
// Each sheet is a full-room plane with a fragment shader doing
// three-octave value noise. Edges fade out radially so the sheet never
// shows a hard rectangular rim. Additive blending: in the dark phases
// the mist reads as a faint light-catching haze; the sunset wall
// colours bleed into it naturally.

const MIST_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const MIST_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform float uScale;
  uniform vec2 uDrift;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float h = 0.0;
    float amp = 0.5;
    for (int o = 0; o < 3; o++) {
      h += noise(p) * amp;
      p *= 2.1;
      amp *= 0.5;
    }
    return h;
  }

  void main() {
    vec2 p = vUv / uScale + uDrift * uTime;
    float billow = fbm(p);
    // remap so roughly half the sheet is clear
    float body = smoothstep(0.35, 0.75, billow);
    // radial edge fade — no hard rectangular rim
    vec2 toEdge = min(vUv, 1.0 - vUv);
    float rim = smoothstep(0.0, 0.18, min(toEdge.x, toEdge.y));
    gl_FragColor = vec4(uColor, uOpacity * body * rim);
  }
`

function makeMistMaterial(driftAngle) {
  return new THREE.ShaderMaterial({
    vertexShader: MIST_VERTEX,
    fragmentShader: MIST_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: MIST_OPACITY },
      uColor: { value: new THREE.Color(MIST_COLOR) },
      uScale: { value: MIST_NOISE_SCALE },
      uDrift: {
        value: new THREE.Vector2(
          Math.cos(driftAngle) * MIST_DRIFT_SPEED,
          Math.sin(driftAngle) * MIST_DRIFT_SPEED,
        ),
      },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

export default function FloorMist() {
  // Two sheets drifting in different directions so the layers slide
  // against each other instead of moving as one slab.
  const materials = useMemo(
    () => [makeMistMaterial(0.4), makeMistMaterial(2.3)],
    [],
  )

  /* eslint-disable react-hooks/immutability */
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    for (const m of materials) m.uniforms.uTime.value = t
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <group>
      {MIST_LAYER_HEIGHTS.map((y, i) => (
        <mesh
          key={i}
          position={[ROOM.W / 2, y, ROOM.D / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={materials[i % materials.length]}
        >
          <planeGeometry args={[ROOM.W, ROOM.D]} />
        </mesh>
      ))}
    </group>
  )
}
