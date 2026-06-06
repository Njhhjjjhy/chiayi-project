import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  SEATING_SPOT_Y, SEATING_SPOT_CONE_ANGLE,
  SEATING_SPOT_PENUMBRA, SEATING_SPOT_DECAY, SEATING_SPOT_DISTANCE,
  SEATING_SPOT_INTENSITY, SEATING_SPOT_COLOR,
  SEATING_SPOT_RAMP_START, SEATING_SPOT_RAMP_END,
  SEAT_BEAM_TOP_RADIUS, SEAT_BEAM_POOL_RADIUS_CLUSTER,
  SPOTLIGHT_CONE_OPACITY, SPOTLIGHT_POOL_OPACITY,
  SPOTLIGHT_CONE_SEGMENTS, SPOTLIGHT_POOL_Y_OFFSET,
} from '../../geometry/dimensions.js'
import { buildSeating } from '../../geometry/seatingPlacement.js'
import { useTimeline } from '../../hooks/useTimeline.js'
import { sampleSky } from './sunsetArc.js'

// SeatingSpotlights — per-seat downbeams (concept image 15).
//
// Every seat sits under its own visible beam: a soft volumetric cone
// dropping from a small dark fixture can, landing in a soft-edged
// floor pool. Beam and pool brightness track the timeline ramp.
//
// Rendering uses the standard volumetric-spotlight technique: the cone
// fragment fades by (a) distance from the fixture end and (b) the
// view-space normal's facing angle raised to a power, so silhouette
// edges dissolve instead of cutting a hard line. No per-beam light is
// involved — with 30 beams in the room, real lights would sink the
// renderer. Actual light contribution comes from one wider spotLight
// per cluster/pocket (5 for the stool variants, 3 for benches).
//
// All cones render as ONE InstancedMesh (likewise pools and fixture
// cans), so the whole beam layer costs three draw calls. Instances are
// translation-only — the cone/pool radii are baked into the geometry —
// which keeps the shader's normal math exact.
//
// Intensity is full from t = 0 to SEATING_SPOT_RAMP_START, ramps
// linearly down to zero from RAMP_START to RAMP_END, then off. The
// blue→darkness boundary in useTimeline.js sits at t = 0.75, which is
// RAMP_END — once fireflies are visible the beams are gone so they
// don't contaminate the darkness phase.

function rampIntensity(time) {
  if (time <= SEATING_SPOT_RAMP_START) return SEATING_SPOT_INTENSITY
  if (time >= SEATING_SPOT_RAMP_END) return 0
  const t = (time - SEATING_SPOT_RAMP_START) / (SEATING_SPOT_RAMP_END - SEATING_SPOT_RAMP_START)
  return SEATING_SPOT_INTENSITY * (1 - t)
}

// Edge-softness exponent: higher = the cone fades earlier toward its
// silhouette, reading as haze rather than a glass shape.
const ANGLE_POWER = 2.5
// Brightness remaining at the floor end of the beam (the pool disc
// carries the landing).
const AXIAL_FLOOR = 0.15
// Pool edge softness exponent.
const POOL_EDGE_POWER = 1.6

const CONE_VERTEX = /* glsl */ `
  varying vec3 vNormalView;
  varying float vAlong;
  void main() {
    vAlong = uv.y; // CylinderGeometry: v = 1 at the fixture end, 0 at the floor end
    vec3 transformed = position;
    vec3 objectNormal = normal;
    #ifdef USE_INSTANCING
      transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
      objectNormal = mat3(instanceMatrix) * objectNormal;
    #endif
    vNormalView = normalize(normalMatrix * objectNormal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`

const CONE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormalView;
  varying float vAlong;
  void main() {
    float edge = pow(abs(normalize(vNormalView).z), ${ANGLE_POWER.toFixed(2)});
    float axial = mix(${AXIAL_FLOOR.toFixed(2)}, 1.0, vAlong);
    gl_FragColor = vec4(uColor, uOpacity * edge * axial);
  }
`

const POOL_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 transformed = position;
    #ifdef USE_INSTANCING
      transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`

const POOL_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float fall = pow(clamp(1.0 - r, 0.0, 1.0), ${POOL_EDGE_POWER.toFixed(2)});
    gl_FragColor = vec4(uColor, uOpacity * fall);
  }
`

const CAN_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#111111',
  roughness: 0.9,
  metalness: 0,
})

function makeBeamMaterial(vertexShader, fragmentShader) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(SEATING_SPOT_COLOR) },
      uOpacity: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

function fillTranslations(mesh, seats, y) {
  const dummy = new THREE.Object3D()
  for (let i = 0; i < seats.length; i++) {
    dummy.position.set(seats[i].x, y, seats[i].z)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
}

function ClusterLight({ x, z, intensity, color }) {
  const target = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(x, 0, z)
    return obj
  }, [x, z])

  return (
    <group>
      <primitive object={target} />
      <spotLight
        position={[x, SEATING_SPOT_Y, z]}
        target={target}
        color={color}
        intensity={intensity}
        angle={SEATING_SPOT_CONE_ANGLE}
        penumbra={SEATING_SPOT_PENUMBRA}
        decay={SEATING_SPOT_DECAY}
        distance={SEATING_SPOT_DISTANCE}
        castShadow={false}
      />
    </group>
  )
}

// beamMode (the panel's "Seat beams" switcher):
//   'all'       one visible beam per seat (concept image 15 literal)
//   'clusters'  one wider beam per campfire cluster / bench pocket —
//               calmer read, the default
//   'off'       no visible beams; the real cluster lights still run
export default function SeatingSpotlights({ dim = 1, variant = 'cubes', beamMode = 'clusters' }) {
  const { time } = useTimeline()
  // The spotlights are the sunset's SKY fixture: colour and level follow
  // the upper-sky journey (warm white-gold → violet → deep navy → out),
  // on top of the existing end-of-arc ramp so they are fully gone before
  // the fireflies own the darkness phase.
  const { hex: skyHex, factor: skyFactor } = sampleSky(time)
  const intensity = rampIntensity(time) * dim * skyFactor
  const ratio = Math.min(1, intensity / SEATING_SPOT_INTENSITY)

  const { lightAnchors, cones, pools, cans, coneMat, poolMat } = useMemo(() => {
    const placement = buildSeating(variant)
    const { lightAnchors } = placement
    const beamSpots = beamMode === 'clusters' ? lightAnchors
      : beamMode === 'off' ? []
      : placement.seats
    const poolRadius = beamMode === 'clusters'
      ? SEAT_BEAM_POOL_RADIUS_CLUSTER
      : placement.poolRadius
    const seats = beamSpots
    const n = seats.length

    if (n === 0) {
      return { lightAnchors, cones: null, pools: null, cans: null, coneMat: null, poolMat: null }
    }

    // Radii baked into the geometry; instances only translate, so the
    // shader's view-space normals stay exact (no non-uniform scaling).
    const coneGeo = new THREE.CylinderGeometry(
      SEAT_BEAM_TOP_RADIUS, poolRadius, SEATING_SPOT_Y, SPOTLIGHT_CONE_SEGMENTS, 1, true,
    )
    coneGeo.translate(0, SEATING_SPOT_Y / 2, 0)

    const poolGeo = new THREE.CircleGeometry(poolRadius, SPOTLIGHT_CONE_SEGMENTS)
    poolGeo.rotateX(-Math.PI / 2)

    const canGeo = new THREE.CylinderGeometry(SEAT_BEAM_TOP_RADIUS, SEAT_BEAM_TOP_RADIUS, 0.08, 12)

    const coneMat = makeBeamMaterial(CONE_VERTEX, CONE_FRAGMENT)
    const poolMat = makeBeamMaterial(POOL_VERTEX, POOL_FRAGMENT)

    const cones = new THREE.InstancedMesh(coneGeo, coneMat, n)
    fillTranslations(cones, seats, 0)
    const pools = new THREE.InstancedMesh(poolGeo, poolMat, n)
    fillTranslations(pools, seats, SPOTLIGHT_POOL_Y_OFFSET)
    const cans = new THREE.InstancedMesh(canGeo, CAN_MATERIAL, n)
    fillTranslations(cans, seats, SEATING_SPOT_Y + 0.04)

    return { lightAnchors, cones, pools, cans, coneMat, poolMat }
  }, [variant, beamMode])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    if (!coneMat) return
    coneMat.uniforms.uOpacity.value = SPOTLIGHT_CONE_OPACITY * ratio
    poolMat.uniforms.uOpacity.value = SPOTLIGHT_POOL_OPACITY * ratio
    coneMat.uniforms.uColor.value.set(skyHex)
    poolMat.uniforms.uColor.value.set(skyHex)
  })
  /* eslint-enable react-hooks/immutability */

  if (dim <= 0 || intensity <= 0) return null
  return (
    <group>
      {cones && <primitive object={cones} />}
      {pools && <primitive object={pools} />}
      {cans && <primitive object={cans} />}
      {lightAnchors.map((a, i) => (
        <ClusterLight key={`light-${i}`} x={a.x} z={a.z} intensity={intensity} color={skyHex} />
      ))}
    </group>
  )
}
