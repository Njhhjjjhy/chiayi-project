import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeCeilingModules } from './surfacePositions.js'

// "The wave" — Kuramoto-inspired pulse-coupled synchronization.
// Fireflies start random, gradually sync within modules.
// Every 45-90s a visible wave rolls across the ceiling.

const FIREFLY_COLOR = [0.9, 0.78, 0.29]
const WAVE_INTERVAL_MIN = 45
const WAVE_INTERVAL_MAX = 90
const WAVE_DURATION = 10
const WAVE_WIDTH = 3
const COUPLING_STRENGTH = 0.15
const REAL_LIGHT_COUNT = 16
const LIGHT_STRIDE = 6

export default function WaveSync({ masterOpacity = 1 }) {
  const data = useMemo(() => distributeCeilingModules(100), [])
  const opacities = useMemo(() => new Float32Array(data.count), [data.count])
  const colors = useMemo(() => {
    const c = new Float32Array(data.count * 3)
    for (let i = 0; i < data.count; i++) {
      c[i * 3] = FIREFLY_COLOR[0]
      c[i * 3 + 1] = FIREFLY_COLOR[1]
      c[i * 3 + 2] = FIREFLY_COLOR[2]
    }
    return c
  }, [data.count])

  const oscillatorPhases = useMemo(() => {
    const p = new Float32Array(data.count)
    for (let i = 0; i < data.count; i++) p[i] = data.phases[i]
    return p
  }, [data])

  const state = useRef({
    elapsed: 0,
    nextWaveAt: 20 + Math.random() * 30,
    waveActive: false,
    waveStart: 0,
    waveDirection: 0,
  })

  const lightRefs = useRef([])

  useFrame((_, dt) => {
    const s = state.current
    s.elapsed += dt

    if (!s.waveActive && s.elapsed > s.nextWaveAt) {
      s.waveActive = true
      s.waveStart = s.elapsed
      s.waveDirection = Math.random() > 0.5 ? 0 : 1
    }
    if (s.waveActive && s.elapsed - s.waveStart > WAVE_DURATION) {
      s.waveActive = false
      s.nextWaveAt = s.elapsed + WAVE_INTERVAL_MIN + Math.random() * (WAVE_INTERVAL_MAX - WAVE_INTERVAL_MIN)
    }

    for (let i = 0; i < data.count; i++) {
      oscillatorPhases[i] += data.speeds[i] * dt

      // Kuramoto local coupling within module
      const myModule = data.moduleIndices[i]
      let coupling = 0, neighborCount = 0
      for (let j = 0; j < data.count; j++) {
        if (j === i || data.moduleIndices[j] !== myModule) continue
        coupling += Math.sin(oscillatorPhases[j] - oscillatorPhases[i])
        neighborCount++
      }
      if (neighborCount > 0) {
        oscillatorPhases[i] += COUPLING_STRENGTH * (coupling / neighborCount) * dt
      }
      if (oscillatorPhases[i] > Math.PI * 2) oscillatorPhases[i] -= Math.PI * 2

      let pulse = Math.max(0, Math.sin(oscillatorPhases[i]))

      if (s.waveActive) {
        const waveProgress = (s.elapsed - s.waveStart) / WAVE_DURATION
        const wavePos = -5 + waveProgress * 10
        const axis = s.waveDirection === 0 ? 0 : 2
        const dist = Math.abs(data.positions[i * 3 + axis] - wavePos)
        if (dist < WAVE_WIDTH) {
          pulse = Math.max(pulse, (1 - dist / WAVE_WIDTH) * 0.9)
        }
      }

      opacities[i] = pulse * data.baseIntensities[i] * masterOpacity
    }

    // Drive real lights
    for (let li = 0; li < REAL_LIGHT_COUNT; li++) {
      const light = lightRefs.current[li]
      if (light) light.intensity = (opacities[li * LIGHT_STRIDE] || 0) * 0.6
    }
  })

  return (
    <group>
      <FireflyParticles
        count={data.count}
        positions={data.positions}
        opacities={opacities}
        colors={colors}
        size={0.04}
      />
      {Array.from({ length: REAL_LIGHT_COUNT }, (_, i) => {
        const fi = i * LIGHT_STRIDE
        return (
          <pointLight
            key={i}
            ref={(el) => { lightRefs.current[i] = el }}
            position={[data.positions[fi * 3], data.positions[fi * 3 + 1], data.positions[fi * 3 + 2]]}
            color="#e6c84a"
            intensity={0}
            distance={2.5}
            decay={2}
          />
        )
      })}
    </group>
  )
}
