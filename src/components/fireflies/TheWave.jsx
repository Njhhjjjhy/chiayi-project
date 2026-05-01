import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'

export default function TheWave({ masterOpacity }) {
  const { waveInterval, waveSpeed, waveWidth, waveIntensity, baselineCount } = useControls('fireflies', {
    theWave: folder({
      waveInterval: { value: 30, min: 10, max: 60, step: 1, label: 'Wave interval (s)' },
      waveSpeed: { value: 5, min: 1, max: 10, step: 0.5, label: 'Wave sweep (s)' },
      waveWidth: { value: 1.2, min: 0.3, max: 4, step: 0.1, label: 'Wave width (m)' },
      waveIntensity: { value: 0.6, min: 0.1, max: 1, step: 0.05, label: 'Wave brightness' },
      baselineCount: { value: 60, min: 0, max: 200, step: 10, label: 'Idle twinkles' },
    }, { collapsed: true }),
  })

  const mutable = useRef({ lastWaveTime: 0, waveDirection: 0 })

  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(404)
    const n = dist.count
    const opacities = new Float32Array(n)
    const colors = new Float32Array(n * 3)
    const basePhases = new Float32Array(n)
    // Only a small random subset of LEDs twinkles between waves — the
    // full set always breathing reads as "busy ceiling", not "quiet room
    // waiting for the wave".
    const isBaseline = new Uint8Array(n)

    for (let i = 0; i < n; i++) {
      colors[i * 3]     = 0.60 + rng() * 0.20
      colors[i * 3 + 1] = 1.00
      colors[i * 3 + 2] = 0.50 + rng() * 0.20
      basePhases[i] = rng() * Math.PI * 2
    }

    return { dist, opacities, colors, basePhases, isBaseline, lastBaselineCount: -1 }
  }, [])

  // Per-frame mutation of typed-array opacities — @react-three/fiber pattern.
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
    const m = mutable.current
    const t = Date.now() / 1000
    const positions = s.dist.positions

    // Re-select baseline twinkle LEDs if the count slider changed
    if (s.lastBaselineCount !== baselineCount) {
      s.isBaseline.fill(0)
      const rng = makeRng(404 + baselineCount)
      const indices = new Int32Array(s.dist.count)
      for (let i = 0; i < s.dist.count; i++) indices[i] = i
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
      }
      const chosen = Math.min(baselineCount, s.dist.count)
      for (let i = 0; i < chosen; i++) s.isBaseline[indices[i]] = 1
      s.lastBaselineCount = baselineCount
    }

    if (t - m.lastWaveTime > waveInterval) {
      m.lastWaveTime = t
      m.waveDirection = Math.floor(Math.random() * 3)
    }

    const timeSinceWave = t - m.lastWaveTime
    const waveActive = timeSinceWave < waveSpeed
    const waveFront = waveActive ? -5 + (timeSinceWave / waveSpeed) * 10 : -999

    for (let i = 0; i < s.dist.count; i++) {
      // Quiet idle: only the small baseline subset twinkles, softly.
      const idle = s.isBaseline[i]
        ? (Math.sin(t * 1.2 + s.basePhases[i]) * 0.5 + 0.5) * 0.4
        : 0

      let waveBrightness = 0
      if (waveActive) {
        let particlePos
        if (m.waveDirection === 0) particlePos = positions[i * 3]
        else if (m.waveDirection === 1) particlePos = positions[i * 3 + 2]
        else {
          const dx = positions[i * 3]
          const dz = positions[i * 3 + 2]
          particlePos = Math.sqrt(dx * dx + dz * dz)
        }
        const dist = Math.abs(particlePos - waveFront)
        waveBrightness = Math.max(0, 1 - dist / waveWidth) * waveIntensity
      }

      s.opacities[i] = Math.max(idle, waveBrightness) * masterOpacity
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
