import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeSurfaceGrid } from './surfacePositions.js'

const ROOM = { w: 10, h: 3.52, d: 10 }

export default function CanopyGrid({ masterOpacity }) {
  const { gridCols, gridRows } = useControls('fireflies', {
    canopyGrid: folder({
      gridCols: { value: 12, min: 4, max: 20, step: 1, label: 'Grid columns' },
      gridRows: { value: 12, min: 4, max: 20, step: 1, label: 'Grid rows' },
    }, { collapsed: true }),
  })

  const positions = useMemo(() => {
    return distributeSurfaceGrid(gridCols, gridRows, ['ceiling', 'leftWall', 'rightWall'])
  }, [gridCols, gridRows])

  const count = positions.length / 3

  const state = useRef(null)

  if (!state.current || state.current.count !== count) {
    const opacities = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const pulsePhases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.8
      colors[i * 3 + 2] = 0.5
      pulsePhases[i] = Math.random() * Math.PI * 2
    }

    state.current = { opacities, colors, pulsePhases, count }
  }

  useFrame(() => {
    const s = state.current
    const t = Date.now() / 1000

    for (let i = 0; i < count; i++) {
      const pulse = Math.sin(t * (0.3 + s.pulsePhases[i] * 0.05) + s.pulsePhases[i]) * 0.5 + 0.5
      s.opacities[i] = pulse * masterOpacity
    }
  })

  return (
    <>
      <FireflyParticles
        count={count}
        positions={positions}
        opacities={state.current.opacities}
        colors={state.current.colors}
        size={0.03}
      />
      {[[-2, 0], [2, 0], [0, -2], [0, 2]].map(([x, z], i) => (
        <pointLight
          key={i}
          position={[x, ROOM.h - 0.3, z]}
          color="#ffb060"
          intensity={0.5 * masterOpacity}
          distance={4}
          decay={2}
        />
      ))}
    </>
  )
}
