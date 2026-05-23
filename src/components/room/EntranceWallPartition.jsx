import {
  ROOM, PARTITION_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  COLUMN_X,
} from '../../geometry/dimensions.js'

// Three plywood partitions, 18 mm thick, floor to working ceiling.
// Together they enclose the L-shaped pathway and close the entrance-wall
// line where there is no real building wall:
//
//   entrance-wall-partition       — along Z = 0,  X = 1.5  → 6.43
//   pathway-partition-vertical    — along X = 1.5, Z = 0    → 7.28
//   pathway-partition-horizontal  — along Z = 7.28, X = 1.5 → 6.43
//
// Standard structural emissive material — same as the real walls so the
// partitions read as one continuous dark surface from inside the room.

const STRUCTURAL = {
  color: '#1a1a1a',
  emissive: '#1a1a1a',
  emissiveIntensity: 0.08,
  roughness: 0.95,
  metalness: 0,
}

// Entrance-wall-partition: from the entry gap (X = 1.5) to the column's
// left face (X = 6.43). Body extends INWARD from the entrance-wall line.
const ENT_PART_LEN = COLUMN_X - ENTRY_GAP_WIDTH

// Pathway-partition-horizontal: from the vertical partition (X = 1.5) to
// the column's left face (X = 6.43). Body sits just inside the pathway-
// partition Z line so the pathway-side face is flush with it.
const HORIZ_PART_LEN = COLUMN_X - ENTRY_GAP_WIDTH

export default function EntranceWallPartition() {
  return (
    <group>
      {/* entrance-wall-partition */}
      <mesh
        position={[
          ENTRY_GAP_WIDTH + ENT_PART_LEN / 2,
          ROOM.H / 2,
          PARTITION_T / 2,
        ]}
      >
        <boxGeometry args={[ENT_PART_LEN, ROOM.H, PARTITION_T]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>

      {/* pathway-partition-vertical */}
      <mesh
        position={[
          ENTRY_GAP_WIDTH + PARTITION_T / 2,
          ROOM.H / 2,
          PATHWAY_PARTITION_Z / 2,
        ]}
      >
        <boxGeometry args={[PARTITION_T, ROOM.H, PATHWAY_PARTITION_Z]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>

      {/* pathway-partition-horizontal */}
      <mesh
        position={[
          ENTRY_GAP_WIDTH + HORIZ_PART_LEN / 2,
          ROOM.H / 2,
          PATHWAY_PARTITION_Z - PARTITION_T / 2,
        ]}
      >
        <boxGeometry args={[HORIZ_PART_LEN, ROOM.H, PARTITION_T]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>
    </group>
  )
}
