import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../../hooks/useVariant.jsx'
import { useLightingState } from '../../hooks/useLightingState.jsx'

const WALL_WIDTH = 10
const WALL_HEIGHT = 3.52
const SEGMENTS = 120
const LAYERS = 5
const SPACING = 0.1  // 10cm between layers (spec says 5–15cm)
const WALL_Z = -5

// Layered mountain silhouette wall: 5 layers of 6mm plywood panels
// cut into mountain ridge profiles, spaced 10cm apart, with LED rope
// lights between each layer creating a warm-to-cool color gradient.

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateProfile(layerIndex) {
  const points = []
  const amplitude = 0.5 + layerIndex * 0.18
  const frequency = 0.5

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS
    const x = (t - 0.5) * WALL_WIDTH
    const y =
      Math.sin(t * Math.PI * frequency * 2 + layerIndex * 1.8) * amplitude * 0.6 +
      Math.sin(t * Math.PI * frequency * 4.3 + layerIndex * 0.7) * amplitude * 0.25 +
      Math.sin(t * Math.PI * frequency * 1.1 + layerIndex * 3.2) * amplitude * 0.15 +
      WALL_HEIGHT * 0.25 + layerIndex * 0.25

    points.push({ x, y: Math.max(0, y) })
  }
  return points
}

function createMountainShape(profile) {
  const shape = new THREE.Shape()
  shape.moveTo(profile[0].x, 0)
  for (const point of profile) shape.lineTo(point.x, point.y)
  shape.lineTo(profile[profile.length - 1].x, 0)
  shape.closePath()
  return shape
}

// Layer colors: deep green (foreground) → lighter green-grey (background)
const LAYER_COLORS = ['#0a1a0a', '#111e11', '#1a2a18', '#253525', '#354a30']

export default function LayeredMountainWall() {
  const { isConstruction, isLight } = useVariant()
  const lighting = useLightingState()

  const profiles = useMemo(
    () => Array.from({ length: LAYERS }, (_, i) => generateProfile(i)),
    []
  )

  const geometries = useMemo(
    () => profiles.map((p) => {
      const shape = createMountainShape(p)
      return new THREE.ExtrudeGeometry(shape, { steps: 1, depth: 0.006, bevelEnabled: false })
    }),
    [profiles]
  )

  return (
    <group position={[0, 0, WALL_Z]}>
      {geometries.map((geo, i) => {
        const layerDepth = i * SPACING
        const color = isLight
          ? LAYER_COLORS[i].replace(/0/g, '3') // lighten for light mode
          : LAYER_COLORS[i]

        return (
          <group key={i}>
            {/* LED backlight between layers */}
            {!isConstruction && !isLight && i > 0 && (
              <mesh position={[0, WALL_HEIGHT * 0.45, layerDepth - SPACING / 2]}>
                <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT * 0.6]} />
                <meshStandardMaterial
                  color={lighting.backlightColor}
                  emissive={lighting.backlightColor}
                  emissiveIntensity={lighting.ambientIntensity * (1.5 - i * 0.2)}
                  transparent
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            {/* Mountain panel */}
            <mesh geometry={geo} position={[0, 0, layerDepth]} rotation={[0, Math.PI, 0]}>
              <meshStandardMaterial
                color={color}
                wireframe={isConstruction}
                side={THREE.DoubleSide}
                roughness={0.95}
                metalness={0}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
