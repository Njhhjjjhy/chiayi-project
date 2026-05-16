import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { getLedSurface, makeRng } from './surfacePositions-v2.js'

// Every LED in the room pulses in unison at ~70 BPM. Two pulses per
// cycle (lub-dub) so the rhythm reads as a heartbeat rather than a
// steady sine.

const HEART_BPM = 70
const HEART_HZ = HEART_BPM / 60

function heartbeatEnvelope(phase) {
  const p = phase % 1
  if (p < 0.10) return p / 0.10
  if (p < 0.20) return 1 - ((p - 0.10) / 0.10) * 0.7
  if (p < 0.25) return 0.30 + ((p - 0.20) / 0.05) * 0.45
  if (p < 0.40) return 0.75 - ((p - 0.25) / 0.15) * 0.65
  return 0.10
}

export default function Heartbeat({ masterOpacity = 1 }) {
  const state = useMemo(() => {
    const dist = getLedSurface()
    const rng = makeRng(505)
    const n = dist.count
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)
    const intensityVar = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      colors[i * 3]     = 0.60 + rng() * 0.20
      colors[i * 3 + 1] = 1.00
      colors[i * 3 + 2] = 0.50 + rng() * 0.20
      intensityVar[i] = 0.85 + rng() * 0.15
    }

    return { dist, colors, opacities, intensityVar }
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
    const t = Date.now() / 1000
    const phase = t * HEART_HZ
    const beat = heartbeatEnvelope(phase)

    for (let i = 0; i < s.dist.count; i++) {
      s.opacities[i] = beat * s.intensityVar[i] * masterOpacity
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
