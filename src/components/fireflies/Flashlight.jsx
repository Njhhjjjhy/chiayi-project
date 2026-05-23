import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import FireflyParticles from './FireflyParticles.jsx'
import {
  getLedSurface, makeRng,
  ROOM,
  FOREST_CENTER_X, FOREST_CENTER_Z, FOREST_SPAN_X, FOREST_SPAN_Z,
  PANEL_Y_MID,
} from './surfacePositions.js'
import {
  WALL_T, PARTITION_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z, COLUMN_X,
  FOREST_X_START, FOREST_X_END, FOREST_Z_START, FOREST_Z_END,
  FIREFLY_COLOR,
} from '../../geometry/dimensions.js'

// Flashlight beam wakes whichever panel its centre lands on, plus a
// 40 % chance to cascade to a neighbouring panel. Beam radius 60 cm,
// instant wake on touch, slow 6 s fade leaves a visible trail.
//
// In v2 the unit graph is one-panel-per-unit (no IR-detector wiring
// concept), so neighbour edges are computed from panel-centre distance.
// 2.4 m matches the v1 cascade radius.
//
// Beam target is the nearest forward hit among six bounded surfaces:
//   1. Panel plane    — Y = PANEL_Y_MID, clamped to forest XZ.
//   2. Floor          — Y = 0, whole room.
//   3. Pathway-partition-vertical    — X = FOREST_X_START + PARTITION_T.
//   4. Front-wall                    — X = ROOM.W - WALL_T.
//   5. Entrance-wall-partition       — Z = PARTITION_T,                X ∈ [ENTRY_GAP_WIDTH, COLUMN_X].
//   6. Pathway-partition-horizontal  — Z = PATHWAY_PARTITION_Z - PARTITION_T, same X range.
//
// Each surface is a rectangle in world space; a ray-plane intersection
// is only accepted when the hit lies inside its rectangle. Picking the
// smallest valid t means the beam catches whatever the cursor lands on
// first — ceiling for top-down shots, partition / wall / floor for eye-
// level shots, etc. If no surface qualifies (cursor pointed outside the
// room) the old forward-project + clamp-to-forest fallback kicks in.

const _FIREFLY_RGB = new THREE.Color(FIREFLY_COLOR)
const BEAM_RADIUS = 0.6
const WAKE_TIME = 0.05
const FADE_TIME = 6.0
const CASCADE_CHANCE = 0.40
const CASCADE_DISTANCE = 2.4

const FOREST_X_MIN = FOREST_CENTER_X - FOREST_SPAN_X / 2
const FOREST_X_MAX = FOREST_CENTER_X + FOREST_SPAN_X / 2
const FOREST_Z_MIN = FOREST_CENTER_Z - FOREST_SPAN_Z / 2
const FOREST_Z_MAX = FOREST_CENTER_Z + FOREST_SPAN_Z / 2
const HORIZONTAL_FALLBACK_DIST = 5
const MAX_HIT_DISTANCE = 30

// Forest-facing surfaces of the four vertical boundaries.
const X_PATHWAY_PARTITION = FOREST_X_START + PARTITION_T
const X_FRONT_WALL        = ROOM.W - WALL_T
const Z_ENT_PARTITION     = PARTITION_T
const Z_HORIZ_PARTITION   = PATHWAY_PARTITION_Z - PARTITION_T

const _raycaster = new THREE.Raycaster()
const _target = new THREE.Vector3()
const _hit = new THREE.Vector3()
const _lookAtHelper = new THREE.Vector3()

function clampToForest(x, z) {
  return [
    Math.max(FOREST_X_MIN, Math.min(FOREST_X_MAX, x)),
    Math.max(FOREST_Z_MIN, Math.min(FOREST_Z_MAX, z)),
  ]
}

function raycastForestSurfaces(origin, dir, out) {
  let bestT = MAX_HIT_DISTANCE
  let bestX = 0, bestY = 0, bestZ = 0
  let found = false

  // Panel plane — Y = PANEL_Y_MID, hit accepted only inside the forest XZ.
  if (Math.abs(dir.y) > 1e-3) {
    const t = (PANEL_Y_MID - origin.y) / dir.y
    if (t > 0 && t < bestT) {
      const x = origin.x + t * dir.x
      const z = origin.z + t * dir.z
      if (x >= FOREST_X_START && x <= FOREST_X_END && z >= FOREST_Z_START && z <= FOREST_Z_END) {
        bestT = t; bestX = x; bestY = PANEL_Y_MID; bestZ = z; found = true
      }
    }
    // Floor — Y = 0, whole room.
    const tF = -origin.y / dir.y
    if (tF > 0 && tF < bestT) {
      const x = origin.x + tF * dir.x
      const z = origin.z + tF * dir.z
      if (x >= 0 && x <= ROOM.W && z >= 0 && z <= ROOM.D) {
        bestT = tF; bestX = x; bestY = 0; bestZ = z; found = true
      }
    }
  }

  if (Math.abs(dir.x) > 1e-3) {
    // Pathway-partition-vertical — X = X_PATHWAY_PARTITION, runs floor→ceiling along Z ∈ [0, PATHWAY_PARTITION_Z].
    const tP = (X_PATHWAY_PARTITION - origin.x) / dir.x
    if (tP > 0 && tP < bestT) {
      const y = origin.y + tP * dir.y
      const z = origin.z + tP * dir.z
      if (y >= 0 && y <= ROOM.H && z >= 0 && z <= PATHWAY_PARTITION_Z) {
        bestT = tP; bestX = X_PATHWAY_PARTITION; bestY = y; bestZ = z; found = true
      }
    }
    // Front-wall — X = X_FRONT_WALL, whole-room Y/Z.
    const tF = (X_FRONT_WALL - origin.x) / dir.x
    if (tF > 0 && tF < bestT) {
      const y = origin.y + tF * dir.y
      const z = origin.z + tF * dir.z
      if (y >= 0 && y <= ROOM.H && z >= 0 && z <= ROOM.D) {
        bestT = tF; bestX = X_FRONT_WALL; bestY = y; bestZ = z; found = true
      }
    }
  }

  if (Math.abs(dir.z) > 1e-3) {
    // Entrance-wall-partition — Z = Z_ENT_PARTITION, X ∈ [ENTRY_GAP_WIDTH, COLUMN_X].
    const tE = (Z_ENT_PARTITION - origin.z) / dir.z
    if (tE > 0 && tE < bestT) {
      const x = origin.x + tE * dir.x
      const y = origin.y + tE * dir.y
      if (x >= ENTRY_GAP_WIDTH && x <= COLUMN_X && y >= 0 && y <= ROOM.H) {
        bestT = tE; bestX = x; bestY = y; bestZ = Z_ENT_PARTITION; found = true
      }
    }
    // Pathway-partition-horizontal — Z = Z_HORIZ_PARTITION, same X range.
    const tH = (Z_HORIZ_PARTITION - origin.z) / dir.z
    if (tH > 0 && tH < bestT) {
      const x = origin.x + tH * dir.x
      const y = origin.y + tH * dir.y
      if (x >= ENTRY_GAP_WIDTH && x <= COLUMN_X && y >= 0 && y <= ROOM.H) {
        bestT = tH; bestX = x; bestY = y; bestZ = Z_HORIZ_PARTITION; found = true
      }
    }
  }

  if (found) {
    out.set(bestX, bestY, bestZ)
    return true
  }

  // Last-ditch fallback: cursor pointed clean outside the room. Forward-
  // project, clamp to forest at panel height so the reticle stays on screen.
  const [cx, cz] = clampToForest(
    origin.x + HORIZONTAL_FALLBACK_DIST * dir.x,
    origin.z + HORIZONTAL_FALLBACK_DIST * dir.z,
  )
  out.set(cx, PANEL_Y_MID, cz)
  return true
}

export default function Flashlight({ masterOpacity = 1, ceilingVariant }) {
  const reticleRef = useRef()
  const reticleRingRef = useRef()
  const lastTimeRef = useRef(null)

  const state = useMemo(() => {
    const dist = getLedSurface(ceilingVariant)
    const rng = makeRng(202)
    const n = dist.count
    const u = dist.unitCount
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)
    const wake = new Float32Array(u)
    const ledPhase = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      ledPhase[i] = rng() * Math.PI * 2
      colors[i * 3]     = _FIREFLY_RGB.r
      colors[i * 3 + 1] = _FIREFLY_RGB.g
      colors[i * 3 + 2] = _FIREFLY_RGB.b
    }

    const neighbours = Array.from({ length: u }, () => [])
    for (let a = 0; a < u; a++) {
      const A = dist.unitCenters[a]
      for (let b = a + 1; b < u; b++) {
        const B = dist.unitCenters[b]
        const dx = A[0] - B[0], dy = A[1] - B[1], dz = A[2] - B[2]
        if (dx * dx + dy * dy + dz * dz <= CASCADE_DISTANCE * CASCADE_DISTANCE) {
          neighbours[a].push(b)
          neighbours[b].push(a)
        }
      }
    }

    return { dist, colors, opacities, wake, ledPhase, neighbours, rng }
  }, [ceilingVariant])

  /* eslint-disable react-hooks/immutability */
  useFrame(({ camera, pointer }) => {
    const s = state
    const now = Date.now() / 1000
    if (lastTimeRef.current === null) lastTimeRef.current = now
    const dt = Math.min(0.08, now - lastTimeRef.current)
    lastTimeRef.current = now
    const t = now

    _raycaster.setFromCamera(pointer, camera)
    const hit = raycastForestSurfaces(_raycaster.ray.origin, _raycaster.ray.direction, _hit)
    if (hit) _target.copy(_hit)

    if (reticleRef.current) {
      reticleRef.current.position.copy(_target)
      reticleRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.08)
    }
    if (reticleRingRef.current) {
      reticleRingRef.current.position.copy(_target)
      _lookAtHelper.copy(camera.position)
      reticleRingRef.current.lookAt(_lookAtHelper)
    }

    const beamR2 = BEAM_RADIUS * BEAM_RADIUS
    for (let u = 0; u < s.dist.unitCount; u++) {
      const uc = s.dist.unitCenters[u]
      const dx = uc[0] - _target.x
      const dy = uc[1] - _target.y
      const dz = uc[2] - _target.z
      const inside = (dx * dx + dy * dy + dz * dz) < beamR2

      const wasAwake = s.wake[u] >= 1
      if (inside) {
        s.wake[u] = Math.min(1, s.wake[u] + dt / WAKE_TIME)
      } else {
        s.wake[u] = Math.max(0, s.wake[u] - dt / FADE_TIME)
      }
      if (!wasAwake && s.wake[u] >= 1) {
        if (s.rng() < CASCADE_CHANCE) {
          const nbs = s.neighbours[u]
          if (nbs.length > 0) {
            const pick = nbs[Math.floor(s.rng() * nbs.length)]
            s.wake[pick] = Math.max(s.wake[pick], 0.85)
          }
          if (s.rng() < CASCADE_CHANCE && nbs.length > 1) {
            const pick = nbs[Math.floor(s.rng() * nbs.length)]
            s.wake[pick] = Math.max(s.wake[pick], 0.7)
          }
        }
      }
    }

    for (let i = 0; i < s.dist.count; i++) {
      const uIdx = s.dist.unitIndices[i]
      const w = s.wake[uIdx]
      if (w <= 0) { s.opacities[i] = 0; continue }
      const breath = 0.65 + Math.sin(t * 1.4 + s.ledPhase[i]) * 0.35
      s.opacities[i] = w * breath * masterOpacity
    }
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <>
      <FireflyParticles
        count={state.dist.count}
        positions={state.dist.positions}
        opacities={state.opacities}
        colors={state.colors}
        size={0.003}
      />

      <mesh ref={reticleRef} renderOrder={999}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial
          color="#d4a54a"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={reticleRingRef} renderOrder={998}>
        <ringGeometry args={[BEAM_RADIUS - 0.02, BEAM_RADIUS, 48]} />
        <meshBasicMaterial
          color="#d4a54a"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}
