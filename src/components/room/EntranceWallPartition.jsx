import { useVariant } from '../../hooks/useVariant.js'
import { wallMaterial } from './roomMaterials.js'
import ArchEdges from './ArchEdges.jsx'
import { ROOM, HW, HD, ENT_END } from '../../geometry/dimensions.js'

// The entrance-wall-partition. Plywood-on-timber-frame, running from
// the south edge of the entrance opening to the back-wall, parallel
// to the entrance-wall. Forms the conceptual "entrance-wall" along
// the left side of the exhibition area.
//
// Standard interior partition: 60 mm thick, full ROOM.H tall. Always
// rendered.

const PARTITION_T  = 0.06                          // 60 mm plywood-on-frame
const HALF_T       = PARTITION_T / 2

const FRONT_Z      = ENT_END                       // -1.99, south edge of entrance opening
const BACK_Z       = HD                            // +4.39, back-wall
const LENGTH       = BACK_Z - FRONT_Z              // 6.38
const CENTER_Z     = (FRONT_Z + BACK_Z) / 2        // +1.20

// Outer face flush with the entrance-wall line at x = -HW, matching
// the column's outer face. The conceptual entrance-wall is formed by
// the column + this partition together, all on the same outer plane.
const OUTER_X      = -HW                           // -4.415, on the entrance-wall line
const CENTER_X     = OUTER_X + HALF_T              // -4.385

export default function EntranceWallPartition() {
  const { isConstruction } = useVariant()
  const material = wallMaterial(isConstruction)

  return (
    <mesh position={[CENTER_X, ROOM.H / 2, CENTER_Z]} castShadow receiveShadow>
      <boxGeometry args={[PARTITION_T, ROOM.H, LENGTH]} />
      <meshStandardMaterial {...material} />
      <ArchEdges />
    </mesh>
  )
}
