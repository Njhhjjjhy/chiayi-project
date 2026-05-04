import { useVariant } from '../../hooks/useVariant.js'
import { wallMaterial } from './roomMaterials.js'
import ArchEdges from './ArchEdges.jsx'
import { ROOM, HW, HD, ENT_END, COL_W, PLYWOOD_T } from '../../geometry/dimensions.js'

// The entrance-wall-partition. Same plywood as the pathway-partition.
// Three faces line up to form one continuous plane facing into the
// room, with no visible step:
//   - the south edge of the visitor entrance opening (z = ENT_END)
//   - the column's room-facing face
//   - this partition's room-facing face
// All meet at z = ENT_END, x = -HW + COL_W (the column's inner face).

const HALF_T       = PLYWOOD_T / 2

const FRONT_Z      = ENT_END                       // aligned with column front face + entrance south edge
const BACK_Z       = HD                            // back-wall
const LENGTH       = BACK_Z - FRONT_Z
const CENTER_Z     = (FRONT_Z + BACK_Z) / 2

// Inner (room-facing) face flush with the column's inner face, so
// the partition and column read as one continuous wall plane from
// inside the room. The partition's outer face sits 6 cm behind that.
const INNER_X      = -HW + COL_W                   // column's inner face
const CENTER_X     = INNER_X - HALF_T

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
