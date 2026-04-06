import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useVariant } from '../../hooks/useVariant.jsx'

const WALL_WIDTH = 10
const WALL_HEIGHT = 3.52
const WALL_Z = -5
const PARTICLE_COUNT = 100

// Projection-reactive wall: a plain white/light matte fabric surface.
// In experience mode, green firefly particles are projected onto it.
// Particles scatter away from the mouse cursor (simulating IR flashlight).
// In light mode, it's just a clean white surface.
// In construction mode, a wireframe projector cone is shown.

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function ProjectionReactiveWall() {
  const { isConstruction, isLight, isExperience } = useVariant()
  const meshRef = useRef()
  const posRef = useRef(null)
  const phasesRef = useRef(null)

  // Initialize particle positions
  useMemo(() => {
    const rand = seededRandom(123)
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const phases = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (rand() - 0.5) * WALL_WIDTH * 0.9
      pos[i * 3 + 1] = (rand() - 0.5) * WALL_HEIGHT * 0.85
      pos[i * 3 + 2] = 0.02
      phases[i] = rand() * Math.PI * 2
    }
    posRef.current = pos
    phasesRef.current = phases
  }, [])

  // Animate particles: drift + scatter from cursor
  useFrame(({ clock, pointer }) => {
    if (!meshRef.current || !isExperience) return
    const t = clock.getElapsedTime()
    const p = posRef.current
    const phases = phasesRef.current

    const cursorX = pointer.x * WALL_WIDTH * 0.45
    const cursorY = pointer.y * WALL_HEIGHT * 0.4

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = p[i * 3]
      let y = p[i * 3 + 1]
      const phase = phases[i]

      // Distance from cursor
      const dx = x - cursorX
      const dy = y - cursorY
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Scatter from cursor
      if (dist < 2.5 && dist > 0.01) {
        const force = (2.5 - dist) * 0.004
        x += (dx / dist) * force
        y += (dy / dist) * force
      }

      // Gentle drift
      x += Math.sin(t * 0.3 + phase * 3) * 0.003
      y += Math.cos(t * 0.25 + phase * 2) * 0.002

      // Bounds
      const hw = WALL_WIDTH * 0.48
      const hh = WALL_HEIGHT * 0.46
      x = Math.max(-hw, Math.min(hw, x))
      y = Math.max(-hh, Math.min(hh, y))

      p[i * 3] = x
      p[i * 3 + 1] = y

      // Pulse
      const pulse = Math.sin(t * (0.4 + phase * 0.1) + phase) * 0.5 + 0.5
      const size = 0.015 + pulse * 0.02

      dummy.position.set(x, y, 0.02)
      dummy.scale.setScalar(size)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      // Green projected light color
      color.setHSL(0.33 + Math.sin(phase) * 0.03, 0.7, 0.35 + pulse * 0.2)
      meshRef.current.setColorAt(i, color)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  // Surface color: white in light mode, light grey in experience (to see projections)
  const surfaceColor = isConstruction ? '#ccc' : isLight ? '#eeece8' : '#222220'

  return (
    <group position={[0, WALL_HEIGHT / 2, WALL_Z]}>
      {/* Matte projection surface */}
      <mesh>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial
          color={surfaceColor}
          roughness={1}
          metalness={0}
          wireframe={isConstruction}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Projected firefly particles (experience mode only) */}
      {isExperience && (
        <instancedMesh
          ref={meshRef}
          args={[
            new THREE.SphereGeometry(1, 6, 6),
            new THREE.MeshBasicMaterial({
              color: '#66ff66',
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
            PARTICLE_COUNT,
          ]}
          frustumCulled={false}
        />
      )}

      {/* Projector indicator in construction mode */}
      {isConstruction && (
        <group position={[0, 0, 3]}>
          {/* Projector body */}
          <mesh>
            <boxGeometry args={[0.4, 0.2, 0.3]} />
            <meshBasicMaterial color="#4488ff" wireframe />
          </mesh>
          {/* Projection cone (wireframe) */}
          <mesh position={[0, 0, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[2.5, 3, 4, 1, true]} />
            <meshBasicMaterial color="#4488ff" wireframe transparent opacity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  )
}
