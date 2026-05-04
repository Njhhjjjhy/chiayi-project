import { useVariant } from '../../hooks/useVariant.js'
import { wallMaterial } from './roomMaterials.js'
import ArchEdges from './ArchEdges.jsx'
import {
  ROOM, COL_W, COL_CENTER_X, COL_CENTER_Z,
} from '../../geometry/dimensions.js'

// 40 × 40 cm concrete column. Existing structural element of the
// venue, not a new build. Outer face flush with the entrance-wall
// line; front face at the south edge of the visitor entrance
// opening. Together with the entrance-wall-partition it forms the
// conceptual entrance-wall.

export default function Column() {
  const { isConstruction } = useVariant()
  const material = wallMaterial(isConstruction)

  return (
    <mesh
      position={[COL_CENTER_X, ROOM.H / 2, COL_CENTER_Z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[COL_W, ROOM.H, COL_W]} />
      <meshStandardMaterial {...material} />
      <ArchEdges />
    </mesh>
  )
}
