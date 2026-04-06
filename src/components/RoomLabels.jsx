import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useVariant } from '../hooks/useVariant.jsx'

// Labels positioned INWARD from walls so they float in the room, not on surfaces
const LABELS = [
  {
    name: 'Entrance',
    position: [-4.5, 1.76, -1.0],
    color: '#e53935',
  },
  {
    name: 'Back wall',
    position: [0, 1.76, -4.3],
    color: '#1565c0',
  },
  {
    name: 'Back windows (blacked out)',
    position: [4.5, 1.76, -1.0],
    color: '#1565c0',
  },
  {
    name: 'Vent (to cover)',
    position: [1.5, 2.6, -4.3],
    color: '#2e7d32',
  },
  {
    name: 'Front wall',
    position: [0, 1.76, 4.5],
    color: '#6a1b9a',
  },
  {
    name: 'Mountain wall',
    position: [0, 2.0, -3.8],
    color: '#e65100',
  },
  {
    name: 'Ceiling',
    position: [0, 3.2, 0],
    color: '#455a64',
  },
]

function Label({ name, position, color }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      {/* Invisible hover target sphere */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Visible dot */}
      <mesh>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthTest={false} />
      </mesh>

      {/* Label on hover */}
      {hovered && (
        <Html
          center
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            color: '#222',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            borderLeft: `3px solid ${color}`,
            transform: 'translateY(-24px)',
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  )
}

export default function RoomLabels() {
  const { isConstruction, isLight } = useVariant()

  // Only show in construction mode
  if (!isConstruction) return null

  return (
    <group>
      {LABELS.map((label) => (
        <Label key={label.name} {...label} />
      ))}
    </group>
  )
}
