import { useVariant } from '../../hooks/useVariant.js'
import { blackoutMaterial } from './roomMaterials.js'
import {
  INSIDE,
  MAIN_WIN_W, MAIN_WIN_SILL, MAIN_WIN_H, MAIN_WIN_Z,
  SMALL_WIN_W, SMALL_WIN_SILL, SMALL_WIN_H, SMALL_WIN_Z,
} from '../../geometry/dimensions.js'

// Window-wall glazing: the main multi-pane glass partition + the small
// stepped-notch window. Both rendered dark to read as blackout during the
// immersive experience; venue reality is interior glass onto the bistro.

export default function Windows() {
  const { isConstruction } = useVariant()
  const blackout = blackoutMaterial(isConstruction)

  return (
    <group>
      {/* Main glass partition */}
      <mesh position={[INSIDE.window - 0.02, MAIN_WIN_SILL + MAIN_WIN_H / 2, MAIN_WIN_Z]}>
        <boxGeometry args={[0.05, MAIN_WIN_H, MAIN_WIN_W]} />
        <meshStandardMaterial {...blackout} />
      </mesh>
      {/* Small window in stepped notch */}
      <mesh position={[INSIDE.window - 0.02, SMALL_WIN_SILL + SMALL_WIN_H / 2, SMALL_WIN_Z]}>
        <boxGeometry args={[0.05, SMALL_WIN_H, SMALL_WIN_W]} />
        <meshStandardMaterial {...blackout} />
      </mesh>
    </group>
  )
}
