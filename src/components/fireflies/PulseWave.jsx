import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'
import { ROOM, HW, HD, INSET } from '../../geometry/dimensions.js'

// Every 15 seconds a wave radiates outward from a random point on the
// ceiling. The wave travels as a 3D sphere of light, so the brightness
// reaches the ceiling first, then sweeps down both side walls. Between
// waves a small subset of LEDs twinkles softly.

const WAVE_INTERVAL = 15
const WAVE_DURATION = 6
const WAVE_WIDTH = 1.5
const WAVE_INTENSITY = 1.0
const WAVE_RADIUS_MAX = 14
const BASELINE_FRACTION = 0.04
const ROOM_H = ROOM.H

export default function PulseWave({ masterOpacity }) {
  const mutable = useRef({ lastWaveTime: -WAVE_DURATION, originX: 0, originY: ROOM_H - INSET, originZ: 0 })

  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(404)
    const n = dist.count
    const opacities = new Float32Array(n)
    const colors = new Float32Array(n * 3)
    const basePhases = new Float32Array(n)
    const isBaseline = new Uint8Array(n)

    for (let i = 0; i < n; i++) {
      colors[i * 3]     = 0.60 + rng() * 0.20
      colors[i * 3 + 1] = 1.00
      colors[i * 3 + 2] = 0.50 + rng() * 0.20
      basePhases[i] = rng() * Math.PI * 2
    }

    const baselineCount = Math.floor(n * BASELINE_FRACTION)
    const indices = new Int32Array(n)
    for (let i = 0; i < n; i++) indices[i] = i
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    for (let i = 0; i < baselineCount; i++) isBaseline[indices[i]] = 1

    return { dist, opacities, colors, basePhases, isBaseline, rng }
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
    const m = mutable.current
    const t = Date.now() / 1000
    const positions = s.dist.positions

    if (t - m.lastWaveTime > WAVE_INTERVAL) {
      m.lastWaveTime = t
      m.originX = (s.rng() - 0.5) * (2 * HW * 0.8)
      m.originY = ROOM_H - INSET
      m.originZ = (s.rng() - 0.5) * (2 * HD * 0.8)
    }

    const elapsed = t - m.lastWaveTime
    const waveActive = elapsed < WAVE_DURATION
    const waveFront = waveActive ? (elapsed / WAVE_DURATION) * WAVE_RADIUS_MAX : -1
    const waveFade = waveActive ? Math.max(0, 1 - elapsed / WAVE_DURATION) : 0

    for (let i = 0; i < s.dist.count; i++) {
      const idle = s.isBaseline[i]
        ? (Math.sin(t * 1.2 + s.basePhases[i]) * 0.5 + 0.5) * 0.4
        : 0

      let waveBrightness = 0
      if (waveActive) {
        const dx = positions[i * 3]     - m.originX
        const dy = positions[i * 3 + 1] - m.originY
        const dz = positions[i * 3 + 2] - m.originZ
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        const distFromFront = Math.abs(dist - waveFront)
        waveBrightness = Math.max(0, 1 - distFromFront / WAVE_WIDTH) * WAVE_INTENSITY * waveFade
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
      size={0.003}
    />
  )
}
