import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'
import { ROOM, HW, HD, INSET } from '../../geometry/dimensions.js'

// Flashlight beam wakes the LED units it touches. Compared to the old
// version: wider beam (60 cm), instant wake on touch, slow 6-second
// fade so a visible trail follows the cursor, and a 40 % cascade
// chance so neighbouring clusters light up too — the room reads as
// being painted by the beam.

const BEAM_RADIUS = 0.6
const WAKE_TIME = 0.05
const FADE_TIME = 6.0
const CASCADE_CHANCE = 0.40
const CASCADE_DISTANCE = 2.4
const ROOM_H = ROOM.H

const _raycaster = new THREE.Raycaster()
const _target = new THREE.Vector3()
const _hit = new THREE.Vector3()
const _lookAtHelper = new THREE.Vector3()

const SURFACES = [
  { axis: 'y', val: ROOM_H - INSET, bounds: { xMin: -HW, xMax: HW, zMin: -HD, zMax: HD } },
  { axis: 'x', val: -HW + INSET,    bounds: { zMin: -HD, zMax: HD, yMin: 0, yMax: ROOM_H } },
  { axis: 'x', val: HW - INSET,     bounds: { zMin: -HD, zMax: HD, yMin: 0, yMax: ROOM_H } },
]

function raycastToSurfaces(origin, dir, out) {
  let bestT = Infinity
  for (const s of SURFACES) {
    const d = s.axis === 'y' ? dir.y : dir.x
    if (Math.abs(d) < 1e-6) continue
    const o = s.axis === 'y' ? origin.y : origin.x
    const t = (s.val - o) / d
    if (t < 0.1 || t >= bestT) continue
    const hx = origin.x + t * dir.x
    const hy = origin.y + t * dir.y
    const hz = origin.z + t * dir.z
    const b = s.bounds
    if (b.xMin !== undefined && (hx < b.xMin || hx > b.xMax)) continue
    if (b.yMin !== undefined && (hy < b.yMin || hy > b.yMax)) continue
    if (b.zMin !== undefined && (hz < b.zMin || hz > b.zMax)) continue
    bestT = t
    out.set(hx, hy, hz)
  }
  return bestT < Infinity
}

export default function Flashlight({ masterOpacity }) {
  const reticleRef = useRef()
  const reticleRingRef = useRef()
  const lastTimeRef = useRef(null)

  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(202)
    const n = dist.count
    const u = dist.unitCount
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)
    const wake = new Float32Array(u)
    const ledPhase = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      ledPhase[i] = rng() * Math.PI * 2
      colors[i * 3]     = 0.60 + rng() * 0.20
      colors[i * 3 + 1] = 1.00
      colors[i * 3 + 2] = 0.50 + rng() * 0.20
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
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame(({ camera, pointer }) => {
    const s = state
    const now = Date.now() / 1000
    if (lastTimeRef.current === null) lastTimeRef.current = now
    const dt = Math.min(0.08, now - lastTimeRef.current)
    lastTimeRef.current = now
    const t = now

    _raycaster.setFromCamera(pointer, camera)
    const hit = raycastToSurfaces(_raycaster.ray.origin, _raycaster.ray.direction, _hit)
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
