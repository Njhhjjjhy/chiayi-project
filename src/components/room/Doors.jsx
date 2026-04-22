import { useVariant } from '../../hooks/useVariant.js'
import { curtainMaterial, steelDoorMaterial } from './roomMaterials.js'
import {
  INSIDE,
  ENT_W, ENT_H, ENT_Z,
  D1_W, D1_H, D1_X,
  D2_W, D2_H, D2_X,
  STEEL_DOOR_W, STEEL_DOOR_H, STEEL_DOOR_Z,
} from '../../geometry/dimensions.js'

// Every door-like opening in the room:
//   - visitor entrance curtain (entrance-wall, full height)
//   - D1 + D2 swing-door curtains (back-wall, door-top height)
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

      {/* D1 curtain (floor to door-top) */}
      <mesh position={[D1_X, D1_H / 2, INSIDE.back - 0.04]}>
        <boxGeometry args={[D1_W - 0.04, D1_H - 0.04, 0.02]} />
        <meshStandardMaterial {...curtain} transparent opacity={0.9} />
      </mesh>
      {/* D2 curtain */}
      <mesh position={[D2_X, D2_H / 2, INSIDE.back - 0.04]}>
        <boxGeometry args={[D2_W - 0.04, D2_H - 0.04, 0.02]} />
        <meshStandardMaterial {...curtain} transparent opacity={0.9} />
      </mesh>

      {/* Silver/stainless service door (window-wall, near front-wall corner) */}
      <mesh position={[INSIDE.window - 0.04, STEEL_DOOR_H / 2, STEEL_DOOR_Z]} castShadow receiveShadow>
        <boxGeometry args={[0.06, STEEL_DOOR_H, STEEL_DOOR_W]} />
        <meshStandardMaterial {...steelDoor} />
      </mesh>
    </group>
  )
}
