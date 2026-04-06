import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeSurface } from './surfacePositions.js'

const ROOM = { w: 10, h: 3.52, d: 10 }

export default function TheVeil({ masterOpacity }) {
  const { lightCount, cycleMin, cycleMax } = useControls('fireflies', {
    theVeil: folder({
      lightCount: { value: 200, min: 50, max: 400, step: 10, label: 'Light count' },
      cycleMin: { value: 4, min: 1, max: 8, step: 0.5, label: 'Min cycle (s)' },
      cycleMax: { value: 8, min: 3, max: 15, step: 0.5, label: 'Max cycle (s)' },
    }, { collapsed: true }),
  })

  const lights = useMemo(() => {
    const result = []
    for (let i = 0; i < lightCount; i++) {
      result.push({
        cycle: cycleMin + Math.random() * (cycleMax - cycleMin),
        phase: Math.random() * Math.PI * 2,
        maxIntensity: 0.5 + Math.random() * 0.3,
      })
    }
    return result
  }, [lightCount, cycleMin, cycleMax])

  const state = useRef(null)

  if (!state.current || state.current.count !== lightCount) {
    // Bias toward side walls for the "veil" effect
    const { positions } = distributeSurface(lightCount, { ceiling: 0.2, leftWall: 0.4, rightWall: 0.4 }, 55)
    const opacities = new Float32Array(lightCount)
    const colors = new Float32Array(lightCount * 3)

    for (let i = 0; i < lightCount; i++) {
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.82
      colors[i * 3 + 2] = 0.63
    }

    state.current = { positions, opacities, colors, count: lightCount }
  }

  useFrame(() => {
    const s = state.current
    const t = Date.now() / 1000
    for (let i = 0; i < lights.length; i++) {
      const l = lights[i]
      const brightness = Math.sin(t / l.cycle * Math.PI * 2 + l.phase) * 0.5 + 0.5
      s.opacities[i] = brightness * l.maxIntensity * masterOpacity
    }
  })

  return (
    <>
      <FireflyParticles
        count={lightCount}
        positions={state.current.positions}
        opacities={state.current.opacities}
        colors={state.current.colors}
        size={0.03}
      />
      {[[-ROOM.w / 2 + 0.3, 1.5, 0], [ROOM.w / 2 - 0.3, 1.5, 0], [0, ROOM.h - 0.3, 0]].map(([x, y, z], i) => (
        <pointLight
          key={i}
          position={[x, y, z]}
          color="#ffb870"
          intensity={0.4 * masterOpacity}
          distance={3}
          decay={2}
        />
      ))}
    </>
  )
}
