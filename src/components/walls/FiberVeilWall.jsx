import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useVariant } from '../../hooks/useVariant.jsx'

const WALL_WIDTH = 10
const WALL_HEIGHT = 3.52
const WALL_Z = -5
const STRAND_COUNT = 400
const LED_COUNT = 60

// Fiber veil wall: a deep textured surface of natural fibers (paper mulberry,
// ramie, pampas grass) with micro-LEDs embedded at varying depths.
// The wall is represented as: a warm-toned base surface with hundreds of
// thin vertical strands (cylinders) protruding outward, and small glowing
// spheres nestled among the strands at different depths.

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function FiberVeilWall() {
  const { isConstruction, isLight, isExperience } = useVariant()
  const ledsRef = useRef()

  // Generate fiber strand positions
  const strands = useMemo(() => {
    const rand = seededRandom(55)
    return Array.from({ length: STRAND_COUNT }, () => ({
      x: (rand() - 0.5) * WALL_WIDTH * 0.96,
      y: (rand() - 0.5) * WALL_HEIGHT * 0.92,
      z: 0.01 + rand() * 0.12,  // depth: 1–13cm outward
      length: 0.04 + rand() * 0.1,
      thickness: 0.003 + rand() * 0.005,
      // Warm natural fiber color — tan, straw, light brown
      color: new THREE.Color().setHSL(
        0.08 + rand() * 0.06, // hue: warm browns
        0.2 + rand() * 0.3,   // saturation
        0.15 + rand() * 0.15  // lightness
      ),
    }))
  }, [])

  // Generate embedded LED positions
  const leds = useMemo(() => {
    const rand = seededRandom(88)
    return Array.from({ length: LED_COUNT }, () => ({
      x: (rand() - 0.5) * WALL_WIDTH * 0.9,
      y: (rand() - 0.5) * WALL_HEIGHT * 0.85,
      depth: 0.03 + rand() * 0.1,
      phase: rand() * Math.PI * 2,
      speed: 0.3 + rand() * 0.4,
    }))
  }, [])

  // Animate LED brightness
  useFrame(({ clock }) => {
    if (!ledsRef.current || isConstruction || isLight) return
    const t = clock.getElapsedTime()
    const mesh = ledsRef.current

    const dummy = new THREE.Object3D()
    for (let i = 0; i < LED_COUNT; i++) {
      const led = leds[i]
      const pulse = Math.sin(t * led.speed + led.phase) * 0.5 + 0.5
      // Deeper LEDs are dimmer (more fiber to glow through)
      const depthDim = 1 - (led.depth - 0.03) / 0.12 * 0.6
      const brightness = pulse * depthDim
      const size = 0.008 + brightness * 0.012

      dummy.position.set(led.x, led.y, led.depth)
      dummy.scale.setScalar(size)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  const baseSurfaceColor = isConstruction ? '#666' : isLight ? '#8a7a5a' : '#2a2018'

  return (
    <group position={[0, WALL_HEIGHT / 2, WALL_Z]}>
      {/* Base surface — warm-toned matte */}
      <mesh>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial
          color={baseSurfaceColor}
          roughness={1}
          metalness={0}
          wireframe={isConstruction}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Fiber strands — thin cylinders protruding outward */}
      {!isConstruction && strands.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, s.y, s.z / 2]}
          rotation={[
            (Math.sin(i * 0.7) * 0.3), // slight random lean
            0,
            (Math.cos(i * 0.5) * 0.2),
          ]}
        >
          <cylinderGeometry args={[s.thickness, s.thickness, s.length, 3]} />
          <meshStandardMaterial color={s.color} roughness={1} metalness={0} />
        </mesh>
      ))}

      {/* Embedded micro-LEDs — warm white points of light */}
      {isExperience && (
        <instancedMesh
          ref={ledsRef}
          args={[
            new THREE.SphereGeometry(1, 4, 4),
            new THREE.MeshBasicMaterial({
              color: '#ffcc66',
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
            LED_COUNT,
          ]}
          frustumCulled={false}
        />
      )}
    </group>
  )
}
