import { useVariant } from '../../hooks/useVariant.js'
import { curtainMaterial, steelDoorMaterial } from './roomMaterials.js'
import {
  INSIDE, WALL_T,
  ENT_W, ENT_H, ENT_Z,
  D1_W, D1_H, D1_X, D1_START_X,
  D2_W, D2_H, D2_X, D2_END_X,
  STEEL_DOOR_W, STEEL_DOOR_H, STEEL_DOOR_Z,
} from '../../geometry/dimensions.js'

const KNOB_Y = 1.05               // standard handle height
const KNOB_INSET = 0.08           // distance from the door's hinge-side edge
const KNOB_PROJECTION = 0.04      // how far the knob projects from the door face

// Every door-like opening in the room:
//   - visitor entrance curtain (entrance-wall, full height)
//   - D1 + D2 staff doors (back-wall, both closed black doors)
//   - silver service door (window-wall, between small window and main glass)

export default function Doors() {
  const { isConstruction } = useVariant()
  const curtain = curtainMaterial(isConstruction)
  const steelDoor = steelDoorMaterial(isConstruction)

  return (
    <group>
      {/* Visitor entrance curtain — full room height, no transom above */}
      <mesh position={[INSIDE.entrance + 0.04, ENT_H / 2, ENT_Z]}>
        <boxGeometry args={[0.02, ENT_H - 0.04, ENT_W - 0.04]} />
        <meshStandardMaterial {...curtain} transparent opacity={0.9} />
      </mesh>

      {/* D1 + D2 — closed black staff doors. Each door fills its opening
          completely (full width, full height, full wall thickness) so no
          light leaks around the edges from the corridor outside. */}
      <mesh position={[D1_X, D1_H / 2, INSIDE.back + WALL_T / 2]}>
        <boxGeometry args={[D1_W, D1_H, WALL_T]} />
        <meshStandardMaterial color="#1a2438" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* D1 doorknob — on the left edge of the door (inner side, closer
          to D2), projects into the room */}
      <mesh position={[D1_START_X + KNOB_INSET, KNOB_Y, INSIDE.back - KNOB_PROJECTION]}>
        <sphereGeometry args={[0.025, 16, 12]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[D2_X, D2_H / 2, INSIDE.back + WALL_T / 2]}>
        <boxGeometry args={[D2_W, D2_H, WALL_T]} />
        <meshStandardMaterial color="#1a2438" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* D2 doorknob — on the right edge of the door (inner side, away
          from the entrance-wall corner), projects into the room */}
      <mesh position={[D2_END_X - KNOB_INSET, KNOB_Y, INSIDE.back - KNOB_PROJECTION]}>
        <sphereGeometry args={[0.025, 16, 12]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Silver/stainless service door (window-wall, near front-wall corner) */}
      <mesh position={[INSIDE.window - 0.04, STEEL_DOOR_H / 2, STEEL_DOOR_Z]} castShadow receiveShadow>
        <boxGeometry args={[0.06, STEEL_DOOR_H, STEEL_DOOR_W]} />
        <meshStandardMaterial {...steelDoor} />
      </mesh>
    </group>
  )
}
