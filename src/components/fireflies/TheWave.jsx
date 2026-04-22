import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'

export default function TheWave({ masterOpacity }) {
  const { waveInterval, waveSpeed, waveWidth } = useControls('fireflies', {
    theWave: folder({
      waveInterval: { value: 15, min: 5, max: 30, step: 1, label: 'Wave interval (s)' },
      waveSpeed: { value: 3, min: 1, max: 8, step: 0.5, label: 'Wave speed (s)' },
      waveWidth: { value: 2, min: 0.5, max: 5, step: 0.5, label: 'Wave width (m)' },
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

    for (let i = 0; i < n; i++) {
      colors[i * 3]     = 0.30 + rng() * 0.20
      colors[i * 3 + 1] = 0.95 + rng() * 0.05
      colors[i * 3 + 2] = 0.25 + rng() * 0.20
      basePhases[i] = rng() * Math.PI * 2
    }

    return { dist, opacities, colors, basePhases }
  }, [])

  // Per-frame mutation of typed-array opacities — @react-three/fiber pattern.
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
    const m = mutable.current
    const t = Date.now() / 1000
    const positions = s.dist.positions

    if (t - m.lastWaveTime > waveInterval) {
      m.lastWaveTime = t
      m.waveDirection = Math.floor(Math.random() * 3)
    }

    const timeSinceWave = t - m.lastWaveTime
    const waveActive = timeSinceWave < waveSpeed
    const waveFront = waveActive ? -5 + (timeSinceWave / waveSpeed) * 10 : -999

    for (let i = 0; i < s.dist.count; i++) {
      const indPulse = (Math.sin(t * 1.2 + s.basePhases[i]) * 0.5 + 0.5) * 0.3

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
        waveBrightness = Math.max(0, 1 - dist / waveWidth)
      }

      s.opacities[i] = Math.max(indPulse, waveBrightness) * masterOpacity
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
