import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useVariant } from '../hooks/useVariant.jsx'

// Labels positioned INWARD from walls so they float in the room, not on surfaces.
// Updated for post-site-visit geometry (8.83 × 10 × 3.52 room).
const LABELS = [
  {
    name: 'Visitor entrance (45cm from front-wall corner; currently shown with dark curtain)',
    position: [-4.3, 1.76, -4.10],
    color: '#e53935',
  },
  {
    name: 'Front-wall (8.83m, feature-wall position — WallSystem renders the selected variant in front)',
    position: [0, 1.76, -4.5],
    color: '#6a1b9a',
  },
  {
    name: 'Window-wall (multi-pane interior glass partition opening onto the adjacent space)',
    position: [4.3, 1.76, 0.62],
    color: '#1565c0',
  },
  {
    name: 'Small window in stepped notch (59×178 — existing)',
    position: [4.3, 1.29, -3.515],
    color: '#1565c0',
  },
  {
    name: 'Silver service door on window-wall (~80×200, in the 99cm gap between small window and main glass)',
    position: [4.3, 1.0, -2.72],
    color: '#90a4ae',
  },
  {
    name: 'Wall A/C unit on window-wall (existing)',
    position: [4.0, 2.85, 3.8],
    color: '#bdbdbd',
  },
  {
    name: 'HVAC plenum in front-wall × window-wall corner (existing)',
    position: [3.6, 3.0, -3.5],
    color: '#37474f',
  },
  {
    name: 'Wainscoting — dark wood, ~90cm, runs around all 4 walls (existing; stays visible)',
    position: [3.0, 0.4, -4.0],
    color: '#5d4037',
  },
  {
    name: 'Back-wall (piano wall, 2 swing doors — D1 + D2)',
    position: [0, 1.76, 4.5],
    color: '#1565c0',
  },
  {
    name: 'D1 swing door (96×236; currently shown with dark curtain)',
    position: [-0.435, 1.18, 4.3],
    color: '#ef6c00',
  },
  {
    name: 'D2 swing door (90×236, flush with entrance-wall corner; currently shown with dark curtain)',
    position: [-3.965, 1.18, 4.3],
    color: '#ef6c00',
  },
  {
    name: 'Entrance-wall (long span past the entrance opens to the adjacent bistro — modelled as continuous wall)',
    position: [-4.3, 1.76, 2.5],
    color: '#e53935',
  },
  {
    name: 'Feature wall treatment (WallSystem — selectable variant)',
    position: [0, 2.0, -3.8],
    color: '#e65100',
  },
  {
    name: 'Ceiling (dropped panel grid at 3.4m; structural beams + HVAC + sprinklers sit above)',
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
