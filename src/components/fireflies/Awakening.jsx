import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import WallFireflies from './WallFireflies.jsx'
import {
  getLedSurface, getWallLedSurface, makeRng,
  ROOM,
  FOREST_CENTER_X, FOREST_CENTER_Z, FOREST_SPAN_X, FOREST_SPAN_Z,
} from './surfacePositions.js'
import { FIREFLY_COLOR, WALL_DOT_BEHAVIOUR_DIM } from '../../geometry/dimensions.js'
import * as THREE from 'three'

// One firefly lights up first, then a wave of awakening expands outward
// in widening rings until every LED is on. Total fill time ~15 s. Once
// fully lit, every LED settles into a long, slow breath.

const _FIREFLY_RGB = new THREE.Color(FIREFLY_COLOR)
const BUILDUP_SECONDS = 15

export default function Awakening({ masterOpacity = 1, ceilingVariant }) {
  const mountTime = useRef(null)

  const state = useMemo(() => {
    const dist = getLedSurface(ceilingVariant)
    const walls = getWallLedSurface()
    const rng = makeRng(101)
    const n = dist.count
    const w = walls.count
    const offsets = new Float32Array(n)
    const periods = new Float32Array(n)
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)
    const appearTime = new Float32Array(n)
    const wallOffsets = new Float32Array(w)
    const wallPeriods = new Float32Array(w)
    const wallOpacities = new Float32Array(w)
    const wallAppearTime = new Float32Array(w)

    const positions = dist.positions
    const wallPositions = walls.positions
    const originX = FOREST_CENTER_X + (rng() - 0.5) * FOREST_SPAN_X * 0.4
    const originY = ROOM.H
    const originZ = FOREST_CENTER_Z + (rng() - 0.5) * FOREST_SPAN_Z * 0.4

    let maxDist = 0
    const distFromOrigin = new Float32Array(n)
    const wallDistFromOrigin = new Float32Array(w)
    for (let i = 0; i < n; i++) {
      const dx = positions[i * 3]     - originX
      const dy = positions[i * 3 + 1] - originY
      const dz = positions[i * 3 + 2] - originZ
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
      distFromOrigin[i] = d
      if (d > maxDist) maxDist = d
    }
    for (let i = 0; i < w; i++) {
      const dx = wallPositions[i * 3]     - originX
      const dy = wallPositions[i * 3 + 1] - originY
      const dz = wallPositions[i * 3 + 2] - originZ
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
      wallDistFromOrigin[i] = d
      if (d > maxDist) maxDist = d
    }

    for (let i = 0; i < n; i++) {
      appearTime[i] = (distFromOrigin[i] / maxDist) * BUILDUP_SECONDS
      periods[i] = 4.0 + rng() * 4.0
      offsets[i] = rng() * periods[i]
      colors[i * 3]     = _FIREFLY_RGB.r
      colors[i * 3 + 1] = _FIREFLY_RGB.g
      colors[i * 3 + 2] = _FIREFLY_RGB.b
    }
    for (let i = 0; i < w; i++) {
      wallAppearTime[i] = (wallDistFromOrigin[i] / maxDist) * BUILDUP_SECONDS
      wallPeriods[i] = 4.0 + rng() * 4.0
      wallOffsets[i] = rng() * wallPeriods[i]
    }

    return { dist, walls, offsets, periods, colors, opacities, appearTime,
             wallOffsets, wallPeriods, wallOpacities, wallAppearTime }
  }, [ceilingVariant])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
    const now = Date.now() / 1000
    if (mountTime.current === null) mountTime.current = now
    const elapsed = now - mountTime.current
    const t = now

    for (let i = 0; i < s.dist.count; i++) {
      const appearT = s.appearTime[i]
      if (elapsed < appearT) {
        s.opacities[i] = 0
        continue
      }
      const fadeIn = Math.min(1, (elapsed - appearT) / 1.2)
      const tPhase = (t + s.offsets[i]) / s.periods[i]
      const breath = 0.55 + Math.sin(tPhase * Math.PI * 2) * 0.45
      s.opacities[i] = breath * fadeIn * masterOpacity
    }
    for (let i = 0; i < s.walls.count; i++) {
      const appearT = s.wallAppearTime[i]
      if (elapsed < appearT) {
        s.wallOpacities[i] = 0
        continue
      }
      const fadeIn = Math.min(1, (elapsed - appearT) / 1.2)
      const tPhase = (t + s.wallOffsets[i]) / s.wallPeriods[i]
      const breath = 0.55 + Math.sin(tPhase * Math.PI * 2) * 0.45
      s.wallOpacities[i] = breath * fadeIn * masterOpacity * WALL_DOT_BEHAVIOUR_DIM
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
      <WallFireflies opacities={state.wallOpacities} />
    </>
  )
}
