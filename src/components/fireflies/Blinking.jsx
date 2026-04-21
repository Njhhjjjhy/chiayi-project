import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits } from './surfacePositions.js'

// Phase 1 — appearing. When this variant mounts, no fireflies are lit. Over
// ~30 seconds the 102 units switch on one at a time in a shuffled order, so
// the room fills with fireflies organically from "very little to more" as
// specified in the brief. Once a unit is on, its 18 LEDs blink independently.
const BUILDUP_SECONDS = 30

export default function Blinking({ masterOpacity }) {
  const state = useRef(null)
  const mountTime = useRef(null)

  if (!state.current) {
    const dist = distributeUnits({ seed: 77 })
    const n = dist.count
    const phases = new Float32Array(n)
    const rates = new Float32Array(n)
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      phases[i] = Math.random() * Math.PI * 2
      rates[i] = 0.25 + Math.random() * 0.7
      colors[i * 3]     = 0.30 + Math.random() * 0.20
      colors[i * 3 + 1] = 0.95 + Math.random() * 0.05
      colors[i * 3 + 2] = 0.25 + Math.random() * 0.20
    }

    const unitAppear = new Float32Array(dist.unitCount)
    const order = Array.from({ length: dist.unitCount }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    for (let i = 0; i < dist.unitCount; i++) {
      unitAppear[order[i]] = (i / dist.unitCount) * BUILDUP_SECONDS
    }

    state.current = { dist, phases, rates, colors, opacities, unitAppear }
  }

  useFrame(() => {
    const s = state.current
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
      const blink = Math.sin(t * s.rates[i] * 2 * Math.PI + s.phases[i]) * 0.5 + 0.5
      s.opacities[i] = blink * fadeIn * masterOpacity
    }
  })

  return (
    <FireflyParticles
      count={state.current.dist.count}
      positions={state.current.dist.positions}
      opacities={state.current.opacities}
      colors={state.current.colors}
      size={0.025}
    />
  )
}
