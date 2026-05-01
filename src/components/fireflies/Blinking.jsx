import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'

// Phase 1 — appearing. When this variant mounts, no fireflies are lit.
// Over ~2 minutes every LED switches on one at a time in shuffled order,
// so the room fills with fireflies gradually and magically. Once lit,
// each LED breathes with a long, languid pulse (0.6–1.4 s) every 6–14 s —
// matching Luciola filiformis's slow glow rather than L. cerata's quick
// flash. Short snappy pulses read as strobing LEDs; the long half-sine
// envelope reads as a living glow.
const BUILDUP_SECONDS = 120

export default function Blinking({ masterOpacity }) {
  const mountTime = useRef(null)

  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(101)
    const n = dist.count
    const offsets = new Float32Array(n)        // start time within own period
    const periods = new Float32Array(n)        // seconds between this LED's flashes
    const flashDurations = new Float32Array(n) // each LED gets its own flash length
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      periods[i] = 6.0 + rng() * 8.0            // 6–14 s per LED
      offsets[i] = rng() * periods[i]
      flashDurations[i] = 0.6 + rng() * 0.8     // 0.6–1.4 s languid breath
      // Narrow green with per-LED variance. Instance colour modulates the
      // base #00ff6a material — keep near-white with a greenish bias.
      colors[i * 3]     = 0.60 + rng() * 0.20   // R
      colors[i * 3 + 1] = 1.00                  // G
      colors[i * 3 + 2] = 0.50 + rng() * 0.20   // B
    }

    // Shuffle LED indices so each LED appears individually — not whole
    // units at once. With 1,584 LEDs over 120 s, that's ~13 LEDs/sec.
    const appearTime = new Float32Array(n)
    const order = new Uint16Array(n)
    for (let i = 0; i < n; i++) order[i] = i
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    for (let i = 0; i < n; i++) {
      appearTime[order[i]] = (i / n) * BUILDUP_SECONDS
    }

    return { dist, offsets, periods, flashDurations, colors, opacities, appearTime }
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
      const fadeIn = Math.min(1, (elapsed - appearT) / 2)
      // Discrete flash: bright for this LED's flashDuration, dark for the
      // rest of its period. Half-sine envelope gives a soft rise and fall.
      const fd = s.flashDurations[i]
      const tPhase = (t + s.offsets[i]) % s.periods[i]
      const pulse = tPhase < fd
        ? Math.sin((tPhase / fd) * Math.PI)
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
      // Real-world LED is 3 mm diameter (~1.5 mm physical radius).
      // Scaled up to 0.015 for visibility at sim camera distances.
      // This is a display value, not a physical measurement.
      size={0.015}
    />
  )
}
