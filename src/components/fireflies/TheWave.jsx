import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeSurface } from './surfacePositions.js'

const COUNT = 300

export default function TheWave({ masterOpacity }) {
  const { waveInterval, waveSpeed, waveWidth } = useControls('fireflies', {
    theWave: folder({
      waveInterval: { value: 15, min: 5, max: 30, step: 1, label: 'Wave interval (s)' },
      waveSpeed: { value: 3, min: 1, max: 8, step: 0.5, label: 'Wave speed (s)' },
      waveWidth: { value: 2, min: 0.5, max: 5, step: 0.5, label: 'Wave width (m)' },
    }, { collapsed: true }),
  })

  const state = useRef(null)

  if (!state.current) {
    const { positions } = distributeSurface(COUNT, { ceiling: 0.5, leftWall: 0.25, rightWall: 0.25 }, 77)
    const opacities = new Float32Array(COUNT)
    const colors = new Float32Array(COUNT * 3)
    const basePhases = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.72 + Math.random() * 0.1
      colors[i * 3 + 2] = 0.2 + Math.random() * 0.1
      basePhases[i] = Math.random() * Math.PI * 2
    }

    state.current = {
      positions, opacities, colors, basePhases,
      lastWaveTime: 0, waveDirection: 0,
    }
  }

  useFrame(() => {
    const s = state.current
    const t = Date.now() / 1000

    if (t - s.lastWaveTime > waveInterval) {
      s.lastWaveTime = t
      s.waveDirection = Math.floor(Math.random() * 3)
    }

    const timeSinceWave = t - s.lastWaveTime
    const waveActive = timeSinceWave < waveSpeed
    const waveFront = waveActive ? -5 + (timeSinceWave / waveSpeed) * 10 : -999

    for (let i = 0; i < COUNT; i++) {
      const indPulse = (Math.sin(t * 1.2 + s.basePhases[i]) * 0.5 + 0.5) * 0.3

      let waveBrightness = 0
      if (waveActive) {
        let particlePos
        if (s.waveDirection === 0) particlePos = s.positions[i * 3]
        else if (s.waveDirection === 1) particlePos = s.positions[i * 3 + 2]
        else {
          const dx = s.positions[i * 3]
          const dz = s.positions[i * 3 + 2]
          particlePos = Math.sqrt(dx * dx + dz * dz)
        }
        const dist = Math.abs(particlePos - waveFront)
        waveBrightness = Math.max(0, 1 - dist / waveWidth)
      }

      s.opacities[i] = Math.max(indPulse, waveBrightness) * masterOpacity
    }
  })

  return (
    <FireflyParticles
      count={COUNT}
      positions={state.current.positions}
      opacities={state.current.opacities}
      colors={state.current.colors}
      size={0.03}
    />
  )
}
