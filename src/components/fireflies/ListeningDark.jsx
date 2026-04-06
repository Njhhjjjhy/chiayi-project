import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeSurface } from './surfacePositions.js'

const COUNT = 300

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

  const state = useRef(null)

  if (!state.current) {
    const { positions } = distributeSurface(COUNT)
    const opacities = new Float32Array(COUNT)
    const colors = new Float32Array(COUNT * 3)
    const targets = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      opacities[i] = 0
      targets[i] = 0
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.15
      colors[i * 3 + 2] = 0.2 + Math.random() * 0.1
    }

    state.current = { positions, opacities, colors, targets, stillTime: 0, isStill: false }
  }

  const handlePointerMove = useCallback(() => {
    const s = state.current
    s.stillTime = 0
    s.isStill = false
  }, [])

  // Track mouse globally
  useRef(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handlePointerMove)
      return () => window.removeEventListener('mousemove', handlePointerMove)
    }
  })

  useFrame((_, delta) => {
    const s = state.current
    s.stillTime += delta

    const still = s.stillTime > stillnessThreshold
    const maxCount = Math.floor(COUNT * maxVisible)

    let visibleCount = 0
    for (let i = 0; i < COUNT; i++) {
      if (still && visibleCount < maxCount) {
        s.targets[i] = 0.6 + Math.random() * 0.001
        visibleCount++
      } else if (!still) {
        s.targets[i] = 0
      }
    }

    for (let i = 0; i < COUNT; i++) {
      const speed = s.targets[i] > s.opacities[i] ? fadeInSpeed : fadeOutSpeed
      s.opacities[i] += (s.targets[i] - s.opacities[i]) * speed * delta
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
