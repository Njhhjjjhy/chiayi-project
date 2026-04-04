import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'

const COUNT = 80
const ROOM = { w: 10, h: 3.5, d: 10 }

function randomInRoom(i, arr) {
  arr[i * 3] = (Math.random() - 0.5) * ROOM.w * 0.8
  arr[i * 3 + 1] = 0.3 + Math.random() * (ROOM.h - 0.6)
  arr[i * 3 + 2] = (Math.random() - 0.5) * ROOM.d * 0.8
}

export default function ListeningDark({ masterOpacity }) {
  const { stillnessThreshold, fadeInSpeed, fadeOutSpeed, maxVisible } = useControls(
    'fireflies',
    {
      listeningDark: folder({
        stillnessThreshold: { value: 3, min: 1, max: 10, step: 0.5, label: 'Stillness (s)' },
        fadeInSpeed: { value: 0.4, min: 0.1, max: 2, step: 0.1, label: 'Fade in speed' },
        fadeOutSpeed: { value: 0.8, min: 0.1, max: 3, step: 0.1, label: 'Fade out speed' },
        maxVisible: { value: 0.18, min: 0.05, max: 0.5, step: 0.01, label: 'Max visible %' },
      }, { collapsed: true }),
    }
  )

  const state = useRef({
    positions: new Float32Array(COUNT * 3),
    opacities: new Float32Array(COUNT),
    colors: new Float32Array(COUNT * 3),
    targets: new Float32Array(COUNT), // target opacity per particle
    stillTime: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    isStill: false,
    initialized: false,
  })

  // Initialize positions
  if (!state.current.initialized) {
    const s = state.current
    for (let i = 0; i < COUNT; i++) {
      randomInRoom(i, s.positions)
      s.opacities[i] = 0
      s.targets[i] = 0
      // Warm amber color
      s.colors[i * 3] = 1.0
      s.colors[i * 3 + 1] = 0.7 + Math.random() * 0.15
      s.colors[i * 3 + 2] = 0.2 + Math.random() * 0.1
    }
    s.initialized = true
  }

  const handlePointerMove = useCallback((e) => {
    const s = state.current
    s.lastMouseX = e?.clientX || 0
    s.lastMouseY = e?.clientY || 0
    s.stillTime = 0
    s.isStill = false
  }, [])

  // Track mouse globally
  useMemo(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handlePointerMove)
      return () => window.removeEventListener('mousemove', handlePointerMove)
    }
  }, [handlePointerMove])

  useFrame((_, delta) => {
    const s = state.current
    s.stillTime += delta

    const still = s.stillTime > stillnessThreshold
    const maxCount = Math.floor(COUNT * maxVisible)

    // Determine target opacities
    let visibleCount = 0
    for (let i = 0; i < COUNT; i++) {
      if (still && visibleCount < maxCount) {
        s.targets[i] = 0.6 + Math.random() * 0.001 // slight flicker
        visibleCount++
      } else if (!still) {
        s.targets[i] = 0
      }
    }

    // Lerp opacities
    for (let i = 0; i < COUNT; i++) {
      const speed = s.targets[i] > s.opacities[i] ? fadeInSpeed : fadeOutSpeed
      s.opacities[i] += (s.targets[i] - s.opacities[i]) * speed * delta
      s.opacities[i] = Math.max(0, Math.min(1, s.opacities[i])) * masterOpacity

      // Gentle drift
      s.positions[i * 3] += Math.sin(Date.now() * 0.0003 + i) * 0.001
      s.positions[i * 3 + 1] += Math.cos(Date.now() * 0.0002 + i * 1.3) * 0.0005
    }
  })

  return (
    <FireflyParticles
      count={COUNT}
      positions={state.current.positions}
      opacities={state.current.opacities}
      colors={state.current.colors}
      size={0.12}
    />
  )
}
