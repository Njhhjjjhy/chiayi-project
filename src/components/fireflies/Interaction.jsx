import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'
import { ROOM, HW, HD, INSET } from '../../geometry/dimensions.js'

// Phase 2 — flashlight. The camera-through-mouse ray is cast at the four
// firefly surfaces (ceiling + back wall + two side walls) and the reticle
// lands on the nearest hit. Sweeping the reticle across a unit toggles it
// on/off. Because the reticle is always ON a surface, its SPOT_RADIUS
// actually overlaps unit centers and the toggle fires reliably.
const SPOT_RADIUS = 0.9
const ROOM_H = ROOM.H

const _raycaster = new THREE.Raycaster()
const _target = new THREE.Vector3()
const _hit = new THREE.Vector3()
const _lookAtHelper = new THREE.Vector3()

// 4 surface planes — axis + value + in-room bounds for the other two axes
const SURFACES = [
  { axis: 'y', val: ROOM_H - INSET, bounds: { xMin: -HW, xMax: HW, zMin: -HD, zMax: HD } }, // ceiling
  { axis: 'z', val: HD - INSET,     bounds: { xMin: -HW, xMax: HW, yMin: 0,   yMax: ROOM_H } }, // back wall
  { axis: 'x', val: -HW + INSET,    bounds: { zMin: -HD, zMax: HD, yMin: 0,   yMax: ROOM_H } }, // entrance wall
  { axis: 'x', val: HW - INSET,     bounds: { zMin: -HD, zMax: HD, yMin: 0,   yMax: ROOM_H } }, // window wall
]

function raycastToSurfaces(origin, dir, out) {
  let bestT = Infinity
  for (const s of SURFACES) {
    let denom
    if (s.axis === 'y') denom = dir.y
    else if (s.axis === 'z') denom = dir.z
    else denom = dir.x
    if (Math.abs(denom) < 1e-6) continue
    const t = (s.val - (s.axis === 'y' ? origin.y : s.axis === 'z' ? origin.z : origin.x)) / denom
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

export default function Interaction({ masterOpacity }) {
  const reticleRef = useRef()
  const reticleRingRef = useRef()

  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(202)
    const n = dist.count
    const phases = new Float32Array(n)
    const rates = new Float32Array(n)
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      phases[i] = rng() * Math.PI * 2
      rates[i] = 0.25 + rng() * 0.7
      colors[i * 3]     = 0.30 + rng() * 0.20
      colors[i * 3 + 1] = 0.95 + rng() * 0.05
      colors[i * 3 + 2] = 0.25 + rng() * 0.20
    }

    const unitState = new Uint8Array(dist.unitCount)
    const prevInside = new Uint8Array(dist.unitCount)
    for (let u = 0; u < dist.unitCount; u++) {
      unitState[u] = rng() < 0.2 ? 1 : 0
    }

    return { dist, phases, rates, colors, opacities, unitState, prevInside }
  }, [])

  // Per-frame mutation of typed-array buffers is the @react-three/fiber pattern.
  /* eslint-disable react-hooks/immutability */
  useFrame(({ camera, pointer }) => {
    const s = state
    const t = Date.now() / 1000

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

    for (let u = 0; u < s.dist.unitCount; u++) {
      const uc = s.dist.unitCenters[u]
      const dx = uc[0] - _target.x
      const dy = uc[1] - _target.y
      const dz = uc[2] - _target.z
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
      const inside = d < SPOT_RADIUS ? 1 : 0
      if (inside && !s.prevInside[u]) {
        s.unitState[u] = s.unitState[u] === 1 ? 0 : 1
      }
      s.prevInside[u] = inside
    }

    for (let i = 0; i < s.dist.count; i++) {
      const u = s.dist.unitIndices[i]
      if (!s.unitState[u]) { s.opacities[i] = 0; continue }
      const blink = Math.sin(t * s.rates[i] * 2 * Math.PI + s.phases[i]) * 0.4 + 0.55
      s.opacities[i] = blink * masterOpacity
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
        size={0.025}
      />

      <mesh ref={reticleRef} renderOrder={999}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial
          color="#ffbb55"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={reticleRingRef} renderOrder={998}>
        <ringGeometry args={[SPOT_RADIUS - 0.03, SPOT_RADIUS, 48]} />
        <meshBasicMaterial
          color="#ff8833"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}
