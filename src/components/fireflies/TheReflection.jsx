import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeSurface } from './surfacePositions.js'

const COUNT = 300
const ROOM = { w: 10, h: 3.52, d: 10 }

export default function TheReflection({ masterOpacity }) {
  const { responseRadius, fadeSpeed } = useControls('fireflies', {
    theReflection: folder({
      responseRadius: { value: 3, min: 1, max: 6, step: 0.5, label: 'Response radius (m)' },
      fadeSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1, label: 'Fade speed' },
    }, { collapsed: true }),
  })

  const mouseRef = useRef({ x: 0, y: 0, lastMoveTime: 0 })

  useEffect(() => {
    function onMove(e) {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
      mouseRef.current.lastMoveTime = Date.now() / 1000
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const state = useRef(null)

  if (!state.current) {
    const { positions } = distributeSurface(COUNT, { ceiling: 0.5, leftWall: 0.25, rightWall: 0.25 }, 33)
    const opacities = new Float32Array(COUNT)
    const colors = new Float32Array(COUNT * 3)
    const targetBrightness = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.75 + Math.random() * 0.1
      colors[i * 3 + 2] = 0.3 + Math.random() * 0.1
    }

    state.current = { positions, opacities, colors, targetBrightness }
  }

  useFrame((_, delta) => {
    const s = state.current
    const m = mouseRef.current
    const t = Date.now() / 1000
    const isStill = (t - m.lastMoveTime) > 1.5

    // Map mouse to approximate room position
    const cursorX = m.x * ROOM.w * 0.45
    const cursorY = ROOM.h * 0.5 + m.y * ROOM.h * 0.35

    for (let i = 0; i < COUNT; i++) {
      const px = s.positions[i * 3]
      const py = s.positions[i * 3 + 1]

      // Distance from cursor (projected onto 2D since surfaces are at fixed depth)
      const dx = px - cursorX
      const dy = py - cursorY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // LEDs near cursor glow brighter when mouse is active
      // When still, all LEDs dim and disperse
      if (isStill) {
        const flicker = Math.sin(t * 0.8 + i * 2.3) * 0.15 + 0.2
        s.targetBrightness[i] = flicker
      } else {
        const proximity = Math.max(0, 1 - dist / responseRadius)
        s.targetBrightness[i] = proximity * 0.9 + 0.05
      }

      // Smooth lerp brightness
      s.opacities[i] += (s.targetBrightness[i] - s.opacities[i]) * fadeSpeed * delta * 3
      s.opacities[i] = Math.max(0, Math.min(1, s.opacities[i])) * masterOpacity
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
