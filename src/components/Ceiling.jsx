import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'

const ROOM = { w: 10, d: 10, h: 3.5 }

function FlatPanelCeiling({ isConstruction }) {
  const panelSize = 1.2
  const cols = Math.floor(ROOM.w / panelSize)
  const rows = Math.floor(ROOM.d / panelSize)

  return (
    <group position={[0, ROOM.h, 0]}>
      {/* Base ceiling plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial
          color={isConstruction ? '#444' : '#141414'}
          wireframe={isConstruction}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Panel grid seams */}
      {!isConstruction && Array.from({ length: cols + 1 }, (_, i) => {
        const x = -ROOM.w / 2 + i * panelSize
        return (
          <mesh key={`col-${i}`} position={[x, -0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.01, ROOM.d]} />
            <meshBasicMaterial color="#1e1e1e" />
          </mesh>
        )
      })}
      {!isConstruction && Array.from({ length: rows + 1 }, (_, i) => {
        const z = -ROOM.d / 2 + i * panelSize
        return (
          <mesh key={`row-${i}`} position={[0, -0.001, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ROOM.w, 0.01]} />
            <meshBasicMaterial color="#1e1e1e" />
          </mesh>
        )
      })}
    </group>
  )
}

function OrganicCanopy({ isConstruction }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(ROOM.w, ROOM.d, 32, 32)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      // Undulating surface — lower in center, higher at edges
      const dist = Math.sqrt(x * x + y * y) / 7
      const wave = Math.sin(x * 0.8) * 0.15 + Math.cos(y * 0.6) * 0.12
      pos.setZ(i, -wave - dist * 0.2)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} position={[0, ROOM.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        color={isConstruction ? '#444' : '#0e0e0e'}
        wireframe={isConstruction}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function OpenExposed({ isConstruction }) {
  if (isConstruction) {
    // Show a dashed outline at ceiling height in construction mode
    return (
      <mesh position={[0, ROOM.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#444" wireframe side={THREE.DoubleSide} />
      </mesh>
    )
  }
  // No visible ceiling — room fades to black above
  return null
}

const CEILING_COMPONENTS = {
  flatPanel: FlatPanelCeiling,
  organicCanopy: OrganicCanopy,
  openExposed: OpenExposed,
}

export default function Ceiling() {
  const { selections, viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'
  const variantId = selections.ceiling || 'flatPanel'
  const Component = CEILING_COMPONENTS[variantId] || FlatPanelCeiling

  return <Component isConstruction={isConstruction} />
}
