import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  ROOM, WALL_T,
  ENTRY_GAP_WIDTH, COLUMN_X, PATHWAY_PARTITION_Z, CABINET_T,
  LOOFAH_WALL_HEIGHT, LOOFAH_WALL_Z_START, LOOFAH_WALL_Z_END,
  WALL_DOT_DENSITY, WALL_DOT_MIN_GAP, WALL_DOT_RADIUS,
  WALL_DOT_NUDGE, WALL_DOT_DRAWER_FACE_PROUD,
  WALL_DOT_BAND_Y_MIN, WALL_DOT_BAND_Y_MAX,
  WALL_DOT_COLOR, WALL_DOT_INTENSITY,
  WALL_DOT_BREATHE_PERIOD, WALL_DOT_BREATHE_AMPLITUDE,
  WALL_DOT_BASE_SEED,
} from '../../geometry/dimensions.js'
import { makeRng } from '../../utils/parkMillerRng.js'

// Ambient wall glow dots — slice 17.
//
// Tiny warm-cream emissive spheres on the top half of interior wall and
// partition faces. NOT a firefly behaviour layer; behaviour is purely a
// slow per-instance breathe driven entirely by a time uniform fed by
// useFrame.
//
// Pattern matches CeilingLEDs.jsx — one shared InstancedMesh built
// eagerly at module load, single render call. Per-instance phase offset
// is supplied via an InstancedBufferAttribute and sampled in the shader
// (injected via onBeforeCompile on a MeshStandardMaterial so we keep the
// PBR pipeline + toneMapped:false behaviour seen on the ceiling LEDs).

const BAND_HEIGHT = WALL_DOT_BAND_Y_MAX - WALL_DOT_BAND_Y_MIN

// Eight eligible surfaces. Each is described in face-local (u, v) where
// v is world Y (vertical band) and u is the face's horizontal axis.
// `toWorld(u, v)` projects local coords back to world and applies the
// surface nudge along the outward normal (8 mm on real walls; 13 mm on
// partition body so dots sit proud of the slice-15 drawer face fronts).
const SURFACES = [
  // front-wall — eligible band excludes the loofah-treated rectangle
  {
    id: 'front-wall',
    seedOffset: 0,
    uMin: 0, uMax: ROOM.D,
    excludes: [{
      uMin: LOOFAH_WALL_Z_START, uMax: LOOFAH_WALL_Z_END,
      vMin: WALL_DOT_BAND_Y_MIN, vMax: LOOFAH_WALL_HEIGHT,
    }],
    toWorld: (u, v) => [ROOM.W - WALL_T - WALL_DOT_NUDGE, v, u],
  },
  // back-wall — full interior face
  {
    id: 'back-wall',
    seedOffset: 1,
    uMin: 0, uMax: ROOM.D,
    excludes: [],
    toWorld: (u, v) => [WALL_T + WALL_DOT_NUDGE, v, u],
  },
  // entrance-wall-partition forest face (Z = CABINET_T, outward +Z)
  {
    id: 'entrance-partition-forest',
    seedOffset: 2,
    uMin: ENTRY_GAP_WIDTH, uMax: COLUMN_X,
    excludes: [],
    toWorld: (u, v) => [u, v, CABINET_T + WALL_DOT_DRAWER_FACE_PROUD],
  },
  // entrance-wall-partition pathway face (Z = 0, outward −Z)
  {
    id: 'entrance-partition-pathway',
    seedOffset: 3,
    uMin: ENTRY_GAP_WIDTH, uMax: COLUMN_X,
    excludes: [],
    toWorld: (u, v) => [u, v, -WALL_DOT_DRAWER_FACE_PROUD],
  },
  // pathway-partition-vertical forest face (X = 1.5 + CABINET_T, outward +X)
  {
    id: 'pathway-vertical-forest',
    seedOffset: 4,
    uMin: 0, uMax: PATHWAY_PARTITION_Z,
    excludes: [],
    toWorld: (u, v) => [ENTRY_GAP_WIDTH + CABINET_T + WALL_DOT_DRAWER_FACE_PROUD, v, u],
  },
  // pathway-partition-vertical pathway face (X = 1.5, outward −X)
  {
    id: 'pathway-vertical-pathway',
    seedOffset: 5,
    uMin: 0, uMax: PATHWAY_PARTITION_Z,
    excludes: [],
    toWorld: (u, v) => [ENTRY_GAP_WIDTH - WALL_DOT_DRAWER_FACE_PROUD, v, u],
  },
  // pathway-partition-horizontal forest face (Z = 7.28 − CABINET_T, outward −Z)
  {
    id: 'pathway-horizontal-forest',
    seedOffset: 6,
    uMin: ENTRY_GAP_WIDTH, uMax: COLUMN_X,
    excludes: [],
    toWorld: (u, v) => [u, v, PATHWAY_PARTITION_Z - CABINET_T - WALL_DOT_DRAWER_FACE_PROUD],
  },
  // pathway-partition-horizontal pathway face (Z = 7.28, outward +Z)
  {
    id: 'pathway-horizontal-pathway',
    seedOffset: 7,
    uMin: ENTRY_GAP_WIDTH, uMax: COLUMN_X,
    excludes: [],
    toWorld: (u, v) => [u, v, PATHWAY_PARTITION_Z + WALL_DOT_DRAWER_FACE_PROUD],
  },
]

// Rejection sampling with grid-based neighbour check. Targets a fixed
// count derived from area × density; min-gap enforced via the grid.
// Each candidate point is checked against the surface's exclude list
// (rectangles in local sampling-box coords).
function samplePoints(uSpan, vSpan, targetCount, excludes, rng) {
  const r = WALL_DOT_MIN_GAP
  const r2 = r * r
  const cell = r / Math.SQRT2
  const cols = Math.max(1, Math.ceil(uSpan / cell))
  const rows = Math.max(1, Math.ceil(vSpan / cell))
  const grid = new Array(cols * rows).fill(null)
  const points = []
  const maxAttempts = targetCount * 40

  function neighborTooClose(u, v) {
    const cu = Math.floor(u / cell)
    const cv = Math.floor(v / cell)
    for (let dv = -2; dv <= 2; dv++) {
      const ncv = cv + dv
      if (ncv < 0 || ncv >= rows) continue
      for (let du = -2; du <= 2; du++) {
        const ncu = cu + du
        if (ncu < 0 || ncu >= cols) continue
        const p = grid[ncv * cols + ncu]
        if (!p) continue
        const ddu = p[0] - u, ddv = p[1] - v
        if (ddu * ddu + ddv * ddv < r2) return true
      }
    }
    return false
  }

  let attempts = 0
  while (points.length < targetCount && attempts < maxAttempts) {
    attempts++
    const u = rng() * uSpan
    const v = rng() * vSpan
    let excluded = false
    for (const e of excludes) {
      if (u >= e.uOffMin && u <= e.uOffMax && v >= e.vOffMin && v <= e.vOffMax) {
        excluded = true
        break
      }
    }
    if (excluded) continue
    if (neighborTooClose(u, v)) continue
    points.push([u, v])
    const cu = Math.floor(u / cell)
    const cv = Math.floor(v / cell)
    grid[cv * cols + cu] = [u, v]
  }
  return points
}

function buildDots() {
  const positions = []
  const phases = []
  for (const surface of SURFACES) {
    const uSpan = surface.uMax - surface.uMin
    const vSpan = BAND_HEIGHT
    // Translate excludes from absolute (u, v) into the local sampling
    // box (origin at surface.uMin × WALL_DOT_BAND_Y_MIN).
    const localExcludes = surface.excludes.map((e) => ({
      uOffMin: e.uMin - surface.uMin,
      uOffMax: e.uMax - surface.uMin,
      vOffMin: e.vMin - WALL_DOT_BAND_Y_MIN,
      vOffMax: e.vMax - WALL_DOT_BAND_Y_MIN,
    }))
    const totalArea = uSpan * vSpan
    let excludedArea = 0
    for (const e of localExcludes) {
      const uOv = Math.max(0, Math.min(e.uOffMax, uSpan) - Math.max(e.uOffMin, 0))
      const vOv = Math.max(0, Math.min(e.vOffMax, vSpan) - Math.max(e.vOffMin, 0))
      excludedArea += uOv * vOv
    }
    const eligibleArea = Math.max(0, totalArea - excludedArea)
    const targetCount = Math.round(eligibleArea * WALL_DOT_DENSITY)
    const posRng = makeRng(WALL_DOT_BASE_SEED + surface.seedOffset)
    const phaseRng = makeRng(WALL_DOT_BASE_SEED + surface.seedOffset + 100)

    const pts = samplePoints(uSpan, vSpan, targetCount, localExcludes, posRng)
    for (const [uLocal, vLocal] of pts) {
      const u = uLocal + surface.uMin
      const v = vLocal + WALL_DOT_BAND_Y_MIN
      positions.push(surface.toWorld(u, v))
      phases.push(phaseRng() * Math.PI * 2)
    }
  }
  return { positions, phases }
}

const DOT_GEO = new THREE.SphereGeometry(WALL_DOT_RADIUS, 8, 8)

const DOT_MATERIAL = new THREE.MeshStandardMaterial({
  color: WALL_DOT_COLOR,
  emissive: WALL_DOT_COLOR,
  emissiveIntensity: WALL_DOT_INTENSITY,
  roughness: 1.0,
  metalness: 0,
})

// Shared uniforms so the useFrame hook can drive a single uTime that
// every dot reads. Period and amplitude are constants but stay as
// uniforms for cheap retune via the hook if needed later.
const BREATHE_UNIFORMS = {
  uTime: { value: 0 },
  uPeriod: { value: WALL_DOT_BREATHE_PERIOD },
  uAmp: { value: WALL_DOT_BREATHE_AMPLITUDE },
}

DOT_MATERIAL.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = BREATHE_UNIFORMS.uTime
  shader.uniforms.uPeriod = BREATHE_UNIFORMS.uPeriod
  shader.uniforms.uAmp = BREATHE_UNIFORMS.uAmp

  shader.vertexShader =
    'attribute float aPhase;\nvarying float vPhase;\n' +
    shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvPhase = aPhase;',
    )

  shader.fragmentShader =
    'uniform float uTime;\nuniform float uPeriod;\nuniform float uAmp;\nvarying float vPhase;\n' +
    shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float wdAngle = uTime * 6.2831853 / uPeriod + vPhase;
       float wdBreathe = 1.0 - uAmp * 0.5 + uAmp * 0.5 * sin(wdAngle);
       totalEmissiveRadiance *= wdBreathe;`,
    )
}

function buildInstancedMesh() {
  const { positions, phases } = buildDots()
  const count = positions.length
  const mesh = new THREE.InstancedMesh(DOT_GEO, DOT_MATERIAL, count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < count; i++) {
    dummy.position.set(positions[i][0], positions[i][1], positions[i][2])
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  mesh.geometry.setAttribute(
    'aPhase',
    new THREE.InstancedBufferAttribute(new Float32Array(phases), 1),
  )
  return mesh
}

const INSTANCED_MESH = buildInstancedMesh()

export default function WallGlowDots({ animated = false }) {
  useFrame((state) => {
    BREATHE_UNIFORMS.uTime.value = animated ? state.clock.getElapsedTime() : 0
    BREATHE_UNIFORMS.uAmp.value = animated ? WALL_DOT_BREATHE_AMPLITUDE : 0
  })
  return <primitive object={INSTANCED_MESH} />
}
