import { useVariant } from '../../hooks/useVariant.js'
import { wallMaterial } from './roomMaterials.js'
import ArchEdges from './ArchEdges.jsx'
import { ROOM, HW, HD, ENT_END, PLYWOOD_T } from '../../geometry/dimensions.js'

// The entrance-wall-partition. Same plywood as the pathway-partition.
// Sits on the entrance-wall line (x = -HW) with its room-facing
// inner face exactly on that line; its body extends OUTWARD (away
// from the room) by the plywood thickness. This puts the partition's
// inner face on the same plane as the column's inner face — together
// they form one continuous wall surface from inside the room.

const HALF_T       = PLYWOOD_T / 2

const FRONT_Z      = ENT_END                       // aligned with column front face + entrance south edge
const BACK_Z       = HD                            // back-wall
const LENGTH       = BACK_Z - FRONT_Z
const CENTER_Z     = (FRONT_Z + BACK_Z) / 2

// Room-facing inner face on the entrance-wall line; body extends
// outward into the corridor (matches the column).
const INNER_X      = -HW
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
