import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeSurface } from './surfacePositions.js'

const COUNT = 150

export default function PrismaticDust({ masterOpacity }) {
  const state = useRef(null)

  if (!state.current) {
    const { positions } = distributeSurface(COUNT, { ceiling: 0.4, leftWall: 0.3, rightWall: 0.3 }, 99)
    const opacities = new Float32Array(COUNT)
    const colors = new Float32Array(COUNT * 3)
    const phases = new Float32Array(COUNT)
    const color = new THREE.Color()

    for (let i = 0; i < COUNT; i++) {
      // Each LED gets a unique spectral hue
      const hue = (i / COUNT) * 360
      color.setHSL(hue / 360, 0.9, 0.5)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      phases[i] = Math.random() * Math.PI * 2
    }

    state.current = { positions, opacities, colors, phases }
  }

  useFrame(() => {
    const s = state.current
    const t = Date.now() * 0.001

    for (let i = 0; i < COUNT; i++) {
      // Gentle sine-fade glow — no flashing, slow breathing
      s.opacities[i] = (0.35 + Math.sin(t * 0.8 + s.phases[i]) * 0.25) * masterOpacity
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
