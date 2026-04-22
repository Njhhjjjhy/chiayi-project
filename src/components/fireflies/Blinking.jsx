import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'

// Phase 1 — appearing. When this variant mounts, no fireflies are lit. Over
// ~30 seconds the 88 units switch on one at a time in a shuffled order, so
// the room fills with fireflies organically. Once a unit is on, its 18 LEDs
// flash independently in the Luciola pattern: a ~130ms pulse every 1.5–3.5s.
// (Ho et al. 2022: L. kagiana flashes ~110ms every ~600ms; L. curtithorax
// ~100ms every ~300ms. Stretched toward the slower end so the room isn't
// constantly popping.)
const BUILDUP_SECONDS = 30
const FLASH_DURATION = 0.13    // seconds — bright half-sine pulse

export default function Blinking({ masterOpacity }) {
  const mountTime = useRef(null)

  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(101)
    const n = dist.count
    const offsets = new Float32Array(n)   // start time within own period
    const periods = new Float32Array(n)   // seconds between this LED's flashes
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      periods[i] = 1.5 + rng() * 2.0        // 1.5–3.5 s per LED
      offsets[i] = rng() * periods[i]       // spread first flashes across the period
      colors[i * 3]     = 0.30 + rng() * 0.20
      colors[i * 3 + 1] = 0.95 + rng() * 0.05
      colors[i * 3 + 2] = 0.25 + rng() * 0.20
    }

    const unitAppear = new Float32Array(dist.unitCount)
    const order = Array.from({ length: dist.unitCount }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    for (let i = 0; i < dist.unitCount; i++) {
      unitAppear[order[i]] = (i / dist.unitCount) * BUILDUP_SECONDS
    }

    return { dist, offsets, periods, colors, opacities, unitAppear }
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
    const now = Date.now() / 1000
    if (mountTime.current === null) mountTime.current = now
    const elapsed = now - mountTime.current
    const t = now

    for (let i = 0; i < s.dist.count; i++) {
      const u = s.dist.unitIndices[i]
      const appearT = s.unitAppear[u]
      if (elapsed < appearT) {
        s.opacities[i] = 0
        continue
      }
      const fadeIn = Math.min(1, (elapsed - appearT) / 2)
      // Discrete flash: bright for FLASH_DURATION (~130ms), dark for the
      // rest of the LED's period. Half-sine envelope gives a soft rise
      // and fall around the peak instead of a hard on/off.
      const tPhase = (t + s.offsets[i]) % s.periods[i]
      const pulse = tPhase < FLASH_DURATION
        ? Math.sin((tPhase / FLASH_DURATION) * Math.PI)
        : 0
      s.opacities[i] = pulse * fadeIn * masterOpacity
    }
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <FireflyParticles
      count={state.dist.count}
      positions={state.dist.positions}
      opacities={state.opacities}
      colors={state.colors}
      size={0.025}
    />
  )
}
