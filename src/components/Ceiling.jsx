import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'
import { useTimeline } from '../hooks/useTimeline.jsx'

const ROOM = { w: 10, d: 10, h: 3.5 }

function FlatPanelCeiling({ isConstruction, ceilingOpacity }) {
  const panelSize = 1.2
  const cols = Math.floor(ROOM.w / panelSize)
  const rows = Math.floor(ROOM.d / panelSize)

  return (
    <group position={[0, ROOM.h, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial
          color={isConstruction ? '#444' : '#141414'}
          wireframe={isConstruction}
          side={THREE.DoubleSide}
          transparent
          opacity={isConstruction ? 1 : ceilingOpacity}
        />
      </mesh>
      {!isConstruction && Array.from({ length: cols + 1 }, (_, i) => {
        const x = -ROOM.w / 2 + i * panelSize
        return (
          <mesh key={`col-${i}`} position={[x, -0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.01, ROOM.d]} />
            <meshBasicMaterial color="#1e1e1e" transparent opacity={ceilingOpacity} />
          </mesh>
        )
      })}
      {!isConstruction && Array.from({ length: rows + 1 }, (_, i) => {
        const z = -ROOM.d / 2 + i * panelSize
        return (
          <mesh key={`row-${i}`} position={[0, -0.001, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ROOM.w, 0.01]} />
            <meshBasicMaterial color="#1e1e1e" transparent opacity={ceilingOpacity} />
          </mesh>
        )
      })}
    </group>
  )
}

function OrganicCanopy({ isConstruction, ceilingOpacity }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(ROOM.w, ROOM.d, 32, 32)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
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
        transparent
        opacity={isConstruction ? 1 : ceilingOpacity}
      />
    </mesh>
  )
}

function OpenExposed({ isConstruction }) {
  if (isConstruction) {
    return (
      <mesh position={[0, ROOM.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial color="#444" wireframe side={THREE.DoubleSide} />
      </mesh>
    )
  }
  return null
}

const CEILING_COMPONENTS = {
  flatPanel: FlatPanelCeiling,
  organicCanopy: OrganicCanopy,
  openExposed: OpenExposed,
}

export default function Ceiling() {
  const { selections, viewMode } = useVariant()
  const { time } = useTimeline()
  const isConstruction = viewMode === 'construction'
  const variantId = selections.ceiling || 'flatPanel'
  const Component = CEILING_COMPONENTS[variantId] || FlatPanelCeiling

  // Ceiling becomes semi-transparent during darkness phase so fireflies are visible through it
  // Fully opaque during golden/twilight, fading to 0.3 during darkness
  const darknessAmount = Math.max(0, (time - 0.6) / 0.2) // starts fading at 60%, fully transparent-ish by 80%
  const ceilingOpacity = 1 - darknessAmount * 0.7 // goes down to 0.3

  return <Component isConstruction={isConstruction} ceilingOpacity={Math.max(0.3, ceilingOpacity)} />
}
