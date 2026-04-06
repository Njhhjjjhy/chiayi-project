import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeSurface } from './surfacePositions.js'

const COUNT = 200

export default function SodiumMist({ masterOpacity }) {
  const state = useRef(null)

  if (!state.current) {
    // Dense coverage — all surfaces, slight bias toward ceiling
    const { positions } = distributeSurface(COUNT, { ceiling: 0.5, leftWall: 0.25, rightWall: 0.25 }, 88)
    const opacities = new Float32Array(COUNT)
    const colors = new Float32Array(COUNT * 3)
    const phases = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Sodium orange spectrum
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.15
      colors[i * 3 + 2] = 0.0
      phases[i] = Math.random() * Math.PI * 2
    }

    state.current = { positions, opacities, colors, phases }
  }

  useFrame(() => {
    const s = state.current
    const t = Date.now() * 0.001

    for (let i = 0; i < COUNT; i++) {
      // Slow synchronized pulse — many LEDs glowing together creates haze effect
      // Slightly staggered per LED for organic feel
      const wave = Math.sin(t * 0.4 + s.phases[i] * 0.3) * 0.3
      const base = 0.4 + wave
      s.opacities[i] = Math.max(0.05, base) * masterOpacity
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
