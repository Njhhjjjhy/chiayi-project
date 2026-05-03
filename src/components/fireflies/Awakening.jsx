import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'
import { ROOM, HW, HD, INSET } from '../../geometry/dimensions.js'

// One firefly lights up first, then a wave of awakening expands
// outward in widening rings until every LED is on. Total fill time
// ~15 seconds. Once fully lit, every LED settles into a long, slow
// breath so the room reads as alive but quiet.

const BUILDUP_SECONDS = 15
const ROOM_H = ROOM.H

export default function Awakening({ masterOpacity }) {
  const mountTime = useRef(null)

  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(101)
    const n = dist.count
    const offsets = new Float32Array(n)
    const periods = new Float32Array(n)
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)
    const appearTime = new Float32Array(n)

    const positions = dist.positions
    const originX = (rng() - 0.5) * (2 * HW * 0.4)
    const originY = ROOM_H - INSET
    const originZ = (rng() - 0.5) * (2 * HD * 0.4)

    let maxDist = 0
    const distFromOrigin = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const dx = positions[i * 3]     - originX
      const dy = positions[i * 3 + 1] - originY
      const dz = positions[i * 3 + 2] - originZ
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
      distFromOrigin[i] = d
      if (d > maxDist) maxDist = d
    }

    for (let i = 0; i < n; i++) {
      appearTime[i] = (distFromOrigin[i] / maxDist) * BUILDUP_SECONDS
      periods[i] = 4.0 + rng() * 4.0
      offsets[i] = rng() * periods[i]
      colors[i * 3]     = 0.60 + rng() * 0.20
      colors[i * 3 + 1] = 1.00
      colors[i * 3 + 2] = 0.50 + rng() * 0.20
    }

    return { dist, offsets, periods, colors, opacities, appearTime }
  }, [])

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
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <FireflyParticles
      count={state.dist.count}
      positions={state.dist.positions}
      opacities={state.opacities}
      colors={state.colors}
      size={0.003}
    />
  )
}
