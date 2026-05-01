import { useVariant } from '../../hooks/useVariant.js'
import { blackoutMaterial } from './roomMaterials.js'
import ArchEdges from './ArchEdges.jsx'
import {
  INSIDE,
  MAIN_WIN_W, MAIN_WIN_SILL, MAIN_WIN_H, MAIN_WIN_Z,
  SMALL_WIN_W, SMALL_WIN_SILL, SMALL_WIN_H, SMALL_WIN_Z,
} from '../../geometry/dimensions.js'

// Window-wall glazing: the main multi-pane glass partition + the small
// stepped-notch window. Both rendered dark to read as blackout during the
// immersive experience; venue reality is interior glass onto the bistro.
//
// While the window-wall elevation preset is active, the windows switch
// to a light translucent glass material so they read clearly against
// the dark wall. Returns to blackout when reviewing other walls /
// walking the space.

const VISIBLE_GLASS = {
  color: '#a8c4dd',
  roughness: 0.3,
  metalness: 0.4,
  transparent: true,
  opacity: 0.7,
}

export default function Windows() {
  const { isConstruction, walkMode, activeSceneKey } = useVariant()
  const showVisible = !walkMode && activeSceneKey === 'window' && !isConstruction
  const glass = showVisible ? VISIBLE_GLASS : blackoutMaterial(isConstruction)

  return (
    <group>
      {/* Main glass partition */}
      <mesh position={[INSIDE.window - 0.02, MAIN_WIN_SILL + MAIN_WIN_H / 2, MAIN_WIN_Z]}>
        <boxGeometry args={[0.05, MAIN_WIN_H, MAIN_WIN_W]} />
        <meshStandardMaterial {...glass} />
        <ArchEdges />
      </mesh>
      {/* Small window in stepped notch */}
      <mesh position={[INSIDE.window - 0.02, SMALL_WIN_SILL + SMALL_WIN_H / 2, SMALL_WIN_Z]}>
        <boxGeometry args={[0.05, SMALL_WIN_H, SMALL_WIN_W]} />
        <meshStandardMaterial {...glass} />
        <ArchEdges />
      </mesh>
    </group>
  )
}
