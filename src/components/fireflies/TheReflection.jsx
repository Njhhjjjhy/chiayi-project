import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'

const COUNT = 300
const ROOM = { w: 10, h: 3.5, d: 10 }

export default function TheReflection({ masterOpacity }) {
  const { dispersionSpeed, clusterDensity, maxSpread } = useControls('fireflies', {
    theReflection: folder({
      dispersionSpeed: { value: 0.3, min: 0.05, max: 1, step: 0.05, label: 'Dispersion speed' },
      clusterDensity: { value: 0.8, min: 0.2, max: 2, step: 0.1, label: 'Cluster density' },
      maxSpread: { value: 3, min: 1, max: 6, step: 0.5, label: 'Max spread (m)' },
    }, { collapsed: true }),
  })

  const { camera } = useThree()
  const mouseRef = useRef({ x: 0, y: 0, still: 0, lastMoveTime: 0 })

  useEffect(() => {
    function onMove(e) {
      // Convert to normalized device coordinates
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
      mouseRef.current.lastMoveTime = Date.now() / 1000
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const state = useRef(null)

  if (!state.current) {
    const positions = new Float32Array(COUNT * 3)
    const opacities = new Float32Array(COUNT)
    const colors = new Float32Array(COUNT * 3)
    const homePositions = new Float32Array(COUNT * 3)
    const dispersed = new Float32Array(COUNT) // 0 = clustered, 1 = fully dispersed

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = ROOM.h / 2
      positions[i * 3 + 2] = 0
      homePositions[i * 3] = (Math.random() - 0.5) * ROOM.w * 0.7
      homePositions[i * 3 + 1] = ROOM.h * 0.5 + Math.random() * ROOM.h * 1.2
      homePositions[i * 3 + 2] = (Math.random() - 0.5) * ROOM.d * 0.7
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.75 + Math.random() * 0.1
      colors[i * 3 + 2] = 0.3 + Math.random() * 0.1
      dispersed[i] = 0
    }

    state.current = { positions, opacities, colors, homePositions, dispersed }
  }

  useFrame(() => {
    const s = state.current
    const m = mouseRef.current
    const t = Date.now() / 1000
    const timeSinceMove = t - m.lastMoveTime
    const isStill = timeSinceMove > 1.5

    // Target position from mouse (project onto a plane in front of camera)
    const targetX = m.x * ROOM.w * 0.4
    const targetY = ROOM.h * 0.5 + m.y * ROOM.h * 0.3
    const targetZ = -1

    for (let i = 0; i < COUNT; i++) {
      // Dispersion factor
      if (isStill) {
        s.dispersed[i] = Math.min(1, s.dispersed[i] + dispersionSpeed * 0.016)
      } else {
        s.dispersed[i] = Math.max(0, s.dispersed[i] - dispersionSpeed * 3 * 0.016)
      }

      const d = s.dispersed[i]

      // Cluster position: near the cursor
      const clusterX = targetX + (Math.sin(i * 0.7) * clusterDensity * 0.3)
      const clusterY = targetY + (Math.cos(i * 1.1) * clusterDensity * 0.2)
      const clusterZ = targetZ + (Math.sin(i * 2.3) * clusterDensity * 0.3)

      // Dispersed position: spread outward from cursor
      const angle = (i / COUNT) * Math.PI * 2 + Math.sin(t * 0.2 + i) * 0.3
      const radius = maxSpread * d * (0.5 + Math.random() * 0.01)
      const dispX = targetX + Math.cos(angle) * radius
      const dispY = targetY + Math.sin(angle * 0.7) * radius * 0.5
      const dispZ = targetZ + Math.sin(angle) * radius * 0.5

      // Interpolate between clustered and dispersed
      s.positions[i * 3] = clusterX * (1 - d) + dispX * d
      s.positions[i * 3 + 1] = clusterY * (1 - d) + dispY * d
      s.positions[i * 3 + 2] = clusterZ * (1 - d) + dispZ * d

      // Opacity: brighter when clustered, dimmer as dispersed
      const flicker = Math.sin(t * 2 + i * 3) * 0.15 + 0.85
      s.opacities[i] = (0.3 + (1 - d) * 0.5) * flicker * masterOpacity
    }
  })

  return (
    <>
      {/* Translucent screen */}
      <mesh position={[0, ROOM.h / 2, -1]}>
        <planeGeometry args={[ROOM.w * 0.6, ROOM.h * 0.7]} />
        <meshStandardMaterial
          color="#0a0a0a"
          transparent
          opacity={0.15 * masterOpacity}
        />
      </mesh>
      <FireflyParticles
        count={COUNT}
        positions={state.current.positions}
        opacities={state.current.opacities}
        colors={state.current.colors}
        size={0.18}
      />
    </>
  )
}
