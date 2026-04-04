import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'

const ROOM = { w: 10, h: 3.5, d: 10 }
const WALL_Z = 4.9

export default function TheVeil({ masterOpacity }) {
  const { lightCount, depthLevels, cycleMin, cycleMax } = useControls('fireflies', {
    theVeil: folder({
      lightCount: { value: 200, min: 50, max: 400, step: 10, label: 'Light count' },
      depthLevels: { value: 4, min: 2, max: 6, step: 1, label: 'Depth levels' },
      cycleMin: { value: 4, min: 1, max: 8, step: 0.5, label: 'Min cycle (s)' },
      cycleMax: { value: 8, min: 3, max: 15, step: 0.5, label: 'Max cycle (s)' },
    }, { collapsed: true }),
  })

  const lights = useMemo(() => {
    const result = []
    for (let i = 0; i < lightCount; i++) {
      const depthLevel = Math.floor(Math.random() * depthLevels)
      const depthFraction = depthLevel / (depthLevels - 1)
      result.push({
        x: (Math.random() - 0.5) * ROOM.w * 0.85,
        y: 0.3 + Math.random() * (ROOM.h - 0.6),
        z: WALL_Z - depthFraction * 0.15,
        cycle: cycleMin + Math.random() * (cycleMax - cycleMin),
        phase: Math.random() * Math.PI * 2,
        maxIntensity: 0.7 * (1 - depthFraction * 0.4),
      })
    }
    return result
  }, [lightCount, depthLevels, cycleMin, cycleMax])

  const state = useRef(null)

  if (!state.current || state.current.count !== lightCount) {
    const positions = new Float32Array(lightCount * 3)
    const opacities = new Float32Array(lightCount)
    const colors = new Float32Array(lightCount * 3)
    for (let i = 0; i < lightCount; i++) {
      const l = lights[i]
      positions[i * 3] = l.x
      positions[i * 3 + 1] = l.y
      positions[i * 3 + 2] = l.z
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
      {/* Fiber texture base */}
      <mesh position={[0, ROOM.h / 2, WALL_Z]}>
        <planeGeometry args={[ROOM.w * 0.9, ROOM.h * 0.85]} />
        <meshStandardMaterial color="#1a1510" roughness={1} transparent opacity={0.6 * masterOpacity} />
      </mesh>
      <FireflyParticles
        count={lightCount}
        positions={state.current.positions}
        opacities={state.current.opacities}
        colors={state.current.colors}
        size={0.15}
      />
      {/* A few ambient point lights */}
      {[[-2, 1.5], [2, 1.5], [0, 2.5]].map(([x, y], i) => (
        <pointLight
          key={i}
          position={[x, y, WALL_Z - 0.3]}
          color="#ffb870"
          intensity={0.4 * masterOpacity}
          distance={3}
          decay={2}
        />
      ))}
    </>
  )
}
