import { useVariant } from '../../hooks/useVariant.js'
import { wallMaterial } from './roomMaterials.js'
import ArchEdges from './ArchEdges.jsx'
import { ROOM, HW, HD, COL_BACK_Z, PLYWOOD_T } from '../../geometry/dimensions.js'

// The entrance-wall-partition. Same plywood as the pathway-partition.
// Runs from the back face of the column to the back-wall, parallel
// to the entrance-wall. Together with the column it forms the
// conceptual entrance-wall along the left side of the exhibition area.

const HALF_T       = PLYWOOD_T / 2

const FRONT_Z      = COL_BACK_Z                    // back face of column
const BACK_Z       = HD                            // back-wall
const LENGTH       = BACK_Z - FRONT_Z
const CENTER_Z     = (FRONT_Z + BACK_Z) / 2

// Outer face flush with the entrance-wall line, matching the
// column's outer face.
const OUTER_X      = -HW
const CENTER_X     = OUTER_X + HALF_T

export default function EntranceWallPartition() {
  const { isConstruction } = useVariant()
  const material = wallMaterial(isConstruction)

  return (
    <mesh position={[CENTER_X, ROOM.H / 2, CENTER_Z]} castShadow receiveShadow>
      <boxGeometry args={[PLYWOOD_T, ROOM.H, LENGTH]} />
      <meshStandardMaterial {...material} />
      <ArchEdges />
    </mesh>
  )
}
