import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'
import { useLightingState } from '../hooks/useLightingState.jsx'
import { mountainWallVariants } from '../variants/mountainWall.js'

const WALL_WIDTH = 10
const WALL_HEIGHT = 3.52
const SEGMENTS = 120

// Simple seeded pseudo-random for deterministic noise
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Generate a mountain profile as an array of y-values across the wall width
function generateProfile(type, amplitude, frequency, layerIndex, segments) {
  const points = []
  const rand = seededRandom(layerIndex * 1337 + 42)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = (t - 0.5) * WALL_WIDTH
    let y = 0

    if (type === 'sine') {
      // Smooth rolling hills from layered sine waves
      y =
        Math.sin(t * Math.PI * frequency * 2 + layerIndex * 1.8) * amplitude * 0.6 +
        Math.sin(t * Math.PI * frequency * 4.3 + layerIndex * 0.7) * amplitude * 0.25 +
        Math.sin(t * Math.PI * frequency * 1.1 + layerIndex * 3.2) * amplitude * 0.15
    } else if (type === 'jagged') {
      // Sharp angular peaks with small treeline bumps
      const base =
        Math.sin(t * Math.PI * frequency * 2 + layerIndex * 2.1) * amplitude * 0.5 +
        Math.sin(t * Math.PI * frequency * 3.7 + layerIndex * 1.3) * amplitude * 0.3
      // Treeline texture: small triangular bumps
      const treeline = Math.abs(Math.sin(t * Math.PI * frequency * 18 + layerIndex * 5)) * amplitude * 0.12
      // Jagged peaks: occasional sharp spikes
      const spike = Math.pow(Math.abs(Math.sin(t * Math.PI * frequency * 5.3 + layerIndex * 0.9)), 3) * amplitude * 0.4
      y = base + treeline + spike
    } else if (type === 'geometric') {
      // Straight-line segments forming angular mountains
      // Use fewer control points, linearly interpolated
      const controlCount = 6
      const controlPoints = []
      for (let c = 0; c <= controlCount; c++) {
        const cy = rand() * amplitude * 0.8 + amplitude * 0.2
        controlPoints.push(cy)
      }
      // Find which segment we're in
      const segPos = t * controlCount
      const segIndex = Math.min(Math.floor(segPos), controlCount - 1)
      const segFrac = segPos - segIndex
      y = controlPoints[segIndex] * (1 - segFrac) + controlPoints[Math.min(segIndex + 1, controlCount)] * segFrac
    }

    // Offset each layer's base height slightly — farther layers are taller
    y += WALL_HEIGHT * 0.25 + layerIndex * 0.25

    points.push({ x, y: Math.max(0, y) })
  }

  return points
}

// Build a Shape from a mountain profile for extrusion
function createMountainShape(profile) {
  const shape = new THREE.Shape()

  // Start at bottom-left
  shape.moveTo(profile[0].x, 0)

  // Draw up and along the mountain ridgeline
  for (const point of profile) {
    shape.lineTo(point.x, point.y)
  }

  // Close at bottom-right
  shape.lineTo(profile[profile.length - 1].x, 0)
  shape.closePath()

  return shape
}

function MountainLayer({ profile, depth, color, thickness, isConstruction }) {
  const geometry = useMemo(() => {
    const shape = createMountainShape(profile)
    const extrudeSettings = {
      steps: 1,
      depth: thickness,
      bevelEnabled: false,
    }
    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }, [profile, thickness])

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, depth + thickness / 2]}
      rotation={[0, Math.PI, 0]}
    >
      <meshStandardMaterial
        color={color}
        wireframe={isConstruction}
        side={THREE.DoubleSide}
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

function Backlight({ depth, color, intensity, isConstruction, isLight }) {
  if (isConstruction || isLight) return null

  return (
    <group>
      {/* Emissive glow plane */}
      <mesh position={[0, WALL_HEIGHT * 0.55, depth + 0.02]}>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT * 0.7]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 1.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Point lights behind the wall — kept low so they don't poke above the silhouette */}
      {[-3, 0, 3].map((x) => (
        <pointLight
          key={x}
          position={[x, WALL_HEIGHT * 0.3, depth - 0.1]}
          color={color}
          intensity={intensity * 1.2}
          distance={2.5}
          decay={2}
        />
      ))}
    </group>
  )
}

function SunLines({ depth, color, intensity, sunLineOpacity, isConstruction, isLight }) {
  if (isConstruction || isLight || sunLineOpacity <= 0) return null

  const lineCount = 5
  const lines = []
  for (let i = 0; i < lineCount; i++) {
    const y = WALL_HEIGHT * 0.3 + (i / (lineCount - 1)) * WALL_HEIGHT * 0.5
    const opacity = (0.15 + (i / lineCount) * 0.2) * sunLineOpacity
    lines.push(
      <mesh key={i} position={[0, y, depth + 0.01]}>
        <planeGeometry args={[WALL_WIDTH * 0.95, 0.02 + i * 0.008]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.6}
          transparent
          opacity={opacity}
        />
      </mesh>
    )
  }

  return <group>{lines}</group>
}

export default function MountainWall({ overrides = {} }) {
  const { selections, isConstruction, isLight } = useVariant()
  const lighting = useLightingState()

  const variantId = selections.mountainWall || 'softRolling'
  const baseVariant = mountainWallVariants[variantId] || mountainWallVariants.softRolling
  const variant = { ...baseVariant, ...overrides }

  const {
    layers: layerCount,
    spacing,
    peakAmplitude,
    peakFrequency,
    profileType,
    layerColors,
    backlightIntensity,
    sunLines,
  } = variant

  // Backlight color driven by timeline, with variant intensity as modifier
  const backlightColor = lighting.backlightColor

  // Generate profiles for each layer
  const profiles = useMemo(() => {
    return Array.from({ length: layerCount }, (_, i) =>
      generateProfile(profileType, peakAmplitude, peakFrequency, i, SEGMENTS)
    )
  }, [layerCount, profileType, peakAmplitude, peakFrequency])

  // Back wall at z = -5. Layers extend forward into the room.
  // Layer 0 (farthest) sits at the wall, last layer (nearest) is closest to viewer.
  const wallZ = -5

  return (
    <group position={[0, 0, wallZ]}>
      {/* Sun lines at the wall surface, behind all layers */}
      {sunLines && (
        <SunLines
          depth={-0.05}
          color={backlightColor}
          intensity={backlightIntensity}
          sunLineOpacity={lighting.sunLineOpacity}
          isConstruction={isConstruction}
          isLight={isLight}
        />
      )}

      {/* Mountain layers, back to front */}
      {profiles.map((profile, i) => {
        // Layer 0 is at the wall (z=0 in local space), each subsequent layer steps forward
        const layerDepth = i * spacing
        const colorIndex = Math.min(i, layerColors.length - 1)
        const color = layerColors[colorIndex]

        return (
          <group key={i}>
            {/* Backlight between this layer and the one behind it */}
            <Backlight
              depth={layerDepth - 0.05}
              color={backlightColor}
              intensity={backlightIntensity * (0.5 + ((layerCount - 1 - i) / layerCount) * 0.5)}
              isConstruction={isConstruction}
              isLight={isLight}
            />
            {/* The mountain panel itself */}
            <MountainLayer
              profile={profile}
              depth={layerDepth}
              color={color}
              thickness={0.03}
              isConstruction={isConstruction}
            />
          </group>
        )
      })}
    </group>
  )
}
