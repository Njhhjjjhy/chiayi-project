import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'

const ROOM = { w: 10, d: 10 }

function DarkWoodPlanks({ isConstruction }) {
  const plankWidth = 0.15
  const plankLength = 1.2
  const cols = Math.ceil(ROOM.w / plankWidth)
  const rows = Math.ceil(ROOM.d / plankLength)

  // Generate plank colors with slight variation
  const plankColors = useMemo(() => {
    const colors = []
    for (let i = 0; i < cols * rows; i++) {
      const base = 0.08 + Math.random() * 0.04
      colors.push(new THREE.Color(base, base * 0.85, base * 0.7))
    }
    return colors
  }, [cols, rows])

  if (isConstruction) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#444" wireframe />
      </mesh>
    )
  }

  return (
    <group>
      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#0a0806" />
      </mesh>
      {/* Plank seams — horizontal lines */}
      {Array.from({ length: rows + 1 }, (_, i) => {
        const z = -ROOM.d / 2 + i * plankLength
        return (
          <mesh key={`h-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, z]}>
            <planeGeometry args={[ROOM.w, 0.005]} />
            <meshBasicMaterial color="#060504" />
          </mesh>
        )
      })}
      {/* Plank seams — vertical lines (staggered) */}
      {Array.from({ length: rows }, (_, row) => {
        const stagger = (row % 2) * plankWidth * 3
        return Array.from({ length: Math.ceil(cols / 6) + 1 }, (_, i) => {
          const x = -ROOM.w / 2 + i * plankWidth * 6 + stagger
          if (x > ROOM.w / 2) return null
          const z = -ROOM.d / 2 + row * plankLength + plankLength / 2
          return (
            <mesh key={`v-${row}-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.001, z]}>
              <planeGeometry args={[0.004, plankLength]} />
              <meshBasicMaterial color="#060504" />
            </mesh>
          )
        })
      })}
    </group>
  )
}

function ForestFloor({ isConstruction }) {
  // Sparse grass tufts on dark earth
  const tufts = useMemo(() => {
    const result = []
    for (let i = 0; i < 40; i++) {
      result.push({
        x: (Math.random() - 0.5) * ROOM.w * 0.9,
        z: (Math.random() - 0.5) * ROOM.d * 0.9,
        scale: 0.3 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI,
      })
    }
    return result
  }, [])

  return (
    <group>
      {/* Earth base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial
          color={isConstruction ? '#444' : '#0c0a08'}
          wireframe={isConstruction}
        />
      </mesh>
      {/* Grass tufts */}
      {!isConstruction && tufts.map((tuft, i) => (
        <group key={i} position={[tuft.x, 0, tuft.z]} rotation={[0, tuft.rotation, 0]}>
          {[0, Math.PI / 3, -Math.PI / 3].map((angle, j) => (
            <mesh
              key={j}
              position={[0, tuft.scale * 0.04, 0]}
              rotation={[0, angle, 0.15]}
            >
              <planeGeometry args={[0.02, tuft.scale * 0.08]} />
              <meshStandardMaterial
                color="#1a2a10"
                side={THREE.DoubleSide}
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function SimpleDarkMatte({ isConstruction }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[ROOM.w, ROOM.d]} />
      <meshStandardMaterial
        color={isConstruction ? '#444' : '#0a0a0a'}
        wireframe={isConstruction}
      />
    </mesh>
  )
}

const FLOOR_COMPONENTS = {
  darkWood: DarkWoodPlanks,
  forestFloor: ForestFloor,
  simpleMatte: SimpleDarkMatte,
}

export default function Floor() {
  const { selections, viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'
  const variantId = selections.floor || 'simpleMatte'
  const Component = FLOOR_COMPONENTS[variantId] || SimpleDarkMatte

  return <Component isConstruction={isConstruction} />
}
