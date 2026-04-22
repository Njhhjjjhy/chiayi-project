import { useVariant } from '../../hooks/useVariant.js'
import { acUnitMaterial, ductMetalMaterial, SPRINKLER_RED } from './roomMaterials.js'
import {
  ROOM, INSIDE,
  STEEL_DOOR_H, STEEL_DOOR_Z,
  PLENUM_MAIN_DEPTH_Z, PLENUM_MAIN_WIDTH_X, PLENUM_MAIN_HEIGHT_Y,
  PLENUM_MAIN_X, PLENUM_MAIN_Y, PLENUM_MAIN_Z,
  PLENUM_DROP_DEPTH_Z, PLENUM_DROP_WIDTH_X, PLENUM_DROP_HEIGHT_Y,
  PLENUM_DROP_X, PLENUM_DROP_Y, PLENUM_DROP_Z,
} from '../../geometry/dimensions.js'

// Existing venue infrastructure on the window-wall + back-wall:
//   - wall A/C heads (window-wall × 1, back-wall × 2)
//   - L-shaped HVAC plenum + stepped-drop (window-wall, above silver door)
//   - control / electrical panel above silver door
//   - red sprinkler pipe run (back-wall, horizontal + entrance-corner drop)

export default function HVAC({ width = ROOM.W, height = ROOM.H }) {
  const { isConstruction } = useVariant()
  const acUnit = acUnitMaterial(isConstruction)
  const ductMetal = ductMetalMaterial(isConstruction)

  return (
    <group>
      {/* Wall A/C unit on upper window-wall, near back-wall corner */}
      <mesh position={[INSIDE.window - 0.15, 2.85, INSIDE.back - 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.36, 0.95]} />
        <meshStandardMaterial {...acUnit} />
      </mesh>

      {/* HVAC plenum L-shape — main horizontal duct flush with structural ceiling */}
      <mesh position={[PLENUM_MAIN_X, PLENUM_MAIN_Y, PLENUM_MAIN_Z]} castShadow receiveShadow>
        <boxGeometry args={[PLENUM_MAIN_WIDTH_X, PLENUM_MAIN_HEIGHT_Y, PLENUM_MAIN_DEPTH_Z]} />
        <meshStandardMaterial {...ductMetal} />
      </mesh>
      {/* HVAC stepped-drop extension — smaller box continuing +z past the main body, hanging lower */}
      <mesh position={[PLENUM_DROP_X, PLENUM_DROP_Y, PLENUM_DROP_Z]} castShadow receiveShadow>
        <boxGeometry args={[PLENUM_DROP_WIDTH_X, PLENUM_DROP_HEIGHT_Y, PLENUM_DROP_DEPTH_Z]} />
        <meshStandardMaterial {...ductMetal} />
      </mesh>

      {/* Control / electrical panel — centred directly above the silver door */}
      <mesh position={[INSIDE.window - 0.04, STEEL_DOOR_H + 0.20, STEEL_DOOR_Z]}>
        <boxGeometry args={[0.05, 0.32, 0.28]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Back-wall split A/C units */}
      <mesh position={[-2.215, 2.85, INSIDE.back - 0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.36, 0.28]} />
        <meshStandardMaterial {...acUnit} />
      </mesh>
      <mesh position={[2.0, 2.85, INSIDE.back - 0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.36, 0.28]} />
        <meshStandardMaterial {...acUnit} />
      </mesh>

      {/* Red sprinkler pipe — horizontal run across upper back-wall */}
      <mesh position={[0, 3.05, INSIDE.back - 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, width, 12]} />
        <meshStandardMaterial {...SPRINKLER_RED} />
      </mesh>
      {/* Vertical drop near entrance-wall corner */}
      <mesh position={[INSIDE.entrance + 0.15, (3.05 + height) / 2, INSIDE.back - 0.06]}>
        <cylinderGeometry args={[0.025, 0.025, height - 3.05, 12]} />
        <meshStandardMaterial {...SPRINKLER_RED} />
      </mesh>
    </group>
  )
}
