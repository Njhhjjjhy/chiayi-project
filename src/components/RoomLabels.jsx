import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useVariant } from '../hooks/useVariant.js'
import {
  ROOM,
  ENT_W, ENT_H,
  D1_W, D1_H, D2_W, D2_H,
  SMALL_WIN_W, SMALL_WIN_H,
  STEEL_DOOR_W, STEEL_DOOR_H,
} from '../geometry/dimensions.js'

// Convert a metre float to a whole-cm integer string.
const cm = (m) => Math.round(m * 100)

// Labels positioned INWARD from walls so they float in the room, not on
// surfaces. Label text is templated from canonical dimensions — change a
// number in `dimensions.js` and the label updates with it.
const LABELS = [
  {
    name: `Visitor entrance (${cm(ENT_W)}×${cm(ENT_H)} full-height, 45cm from front-wall corner; currently shown with dark curtain)`,
    position: [-4.3, 1.76, -3.35],
    color: '#e53935',
  },
  {
    name: `Front-wall (${ROOM.W}m, feature-wall position)`,
    position: [0, 1.76, -4.5],
    color: '#6a1b9a',
  },
  {
    name: 'Window-wall (multi-pane interior glass partition opening onto the adjacent space)',
    position: [4.3, 1.76, 0.62],
    color: '#1565c0',
  },
  {
    name: `Small window in stepped notch (${cm(SMALL_WIN_W)}×${cm(SMALL_WIN_H)} — existing)`,
    position: [4.3, 1.24, -3.515],
    color: '#1565c0',
  },
  {
    name: `Silver service door on window-wall (${cm(STEEL_DOOR_W)}×${cm(STEEL_DOOR_H)}, between small window and main glass)`,
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
    name: 'Wainscoting — dark wood, ~90cm on front/back walls, ~30cm on window-wall; entrance-wall has none',
    position: [3.0, 0.4, -4.0],
    color: '#5d4037',
  },
  {
    name: 'Back-wall (piano wall, 2 swing doors — D1 + D2)',
    position: [0, 1.76, 4.5],
    color: '#1565c0',
  },
  {
    name: `D1 swing door (${cm(D1_W)}×${cm(D1_H)}; currently shown with dark curtain)`,
    position: [-0.435, 1.18, 4.3],
    color: '#ef6c00',
  },
  {
    name: `D2 swing door (${cm(D2_W)}×${cm(D2_H)}, flush with entrance-wall corner; currently shown with dark curtain)`,
    position: [-3.965, 1.18, 4.3],
    color: '#ef6c00',
  },
  {
    name: 'Entrance-wall (long span past the entrance opens to the adjacent bistro — modelled as continuous wall)',
    position: [-4.3, 1.76, 2.5],
    color: '#e53935',
  },
  {
    name: 'Ceiling (mountain topology — sculptural covering over existing infrastructure)',
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
  const { isConstruction } = useVariant()

  if (!isConstruction) return null

  return (
    <group>
      {LABELS.map((label) => (
        <Label key={label.name} {...label} />
      ))}
    </group>
  )
}
