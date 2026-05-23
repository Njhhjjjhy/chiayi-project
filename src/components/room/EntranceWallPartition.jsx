import {
  ROOM, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  COLUMN_X,
  CABINET_ROWS, CABINET_DRAWER_TARGET_WIDTH,
  CABINET_BEVEL_DEPTH, CABINET_BEVEL_WIDTH,
  CABINET_CUP_WIDTH, CABINET_CUP_HEIGHT,
  CABINET_BODY_COLOR,
} from '../../geometry/dimensions.js'

// Three cabinet-style partitions, plywood, dark stain, floor to working
// ceiling. Together they enclose the L-shaped pathway and close the
// entrance-wall line where there is no real building wall:
//
//   entrance-wall-partition       — along Z = 0,  X = 1.5  → 6.43
//   pathway-partition-vertical    — along X = 1.5, Z = 0    → 7.28
//   pathway-partition-horizontal  — along Z = 7.28, X = 1.5 → 6.43
//
// Thickness extends INTO the forest, NOT into the pathway. The 1.5 m
// pathway width is locked, so cabinets grow away from it.
//
// Slice 15: each partition body is wrapped on all four faces with a
// drawer-grid face treatment. The body box is unchanged; the drawer
// faces sit `CABINET_BEVEL_DEPTH` proud of the body surface, with an
// inset `CABINET_BEVEL_WIDTH` border around each drawer face and a
// horizontal cup-pull groove centred in the upper third of each drawer.
// Material is shared across body and drawer faces — see option 1 in the
// slice prompt — so detail vanishes in the dark phase. That's accepted.
//
// CABINET_T lives in dimensions.js as a single source of truth shared
// with WallLighting.jsx (which positions its bars relative to the
// cabinet faces).

const STRUCTURAL = {
  color: CABINET_BODY_COLOR,
  emissive: CABINET_BODY_COLOR,
  emissiveIntensity: 0.08,
  roughness: 0.95,
  metalness: 0,
}

const ENT_PART_LEN   = COLUMN_X - ENTRY_GAP_WIDTH  // 4.93 m
const HORIZ_PART_LEN = COLUMN_X - ENTRY_GAP_WIDTH  // 4.93 m

// Column count for a given face length, clamped to at least one drawer.
function colsForFace(faceLength) {
  return Math.max(1, Math.round(faceLength / CABINET_DRAWER_TARGET_WIDTH))
}

// One drawer face — five-piece frame around a recessed cup-pull groove.
// The frame sits CABINET_BEVEL_DEPTH proud of the body face; the cup-pull
// plane sits at the body face depth so it reads as a darker recess.
function DrawerFace({ uCenter, vCenter, drawerW, drawerH }) {
  const halfW = drawerW / 2
  const halfH = drawerH / 2
  const cupHalfW = CABINET_CUP_WIDTH / 2
  const cupHalfH = CABINET_CUP_HEIGHT / 2
  const vCup = drawerH / 3   // upper-third position (above drawer centre)

  const z = CABINET_BEVEL_DEPTH / 2  // frame centre Z (proud of body)

  const topSlabH = halfH - (vCup + cupHalfH)
  const topSlabCV = vCup + cupHalfH + topSlabH / 2

  const botSlabH = (vCup - cupHalfH) - (-halfH)
  const botSlabCV = -halfH + botSlabH / 2

  const fillerW = halfW - cupHalfW
  const leftFillerCU = -halfW + fillerW / 2
  const rightFillerCU = halfW - fillerW / 2

  return (
    <group position={[uCenter, vCenter, 0]}>
      {topSlabH > 0 && (
        <mesh position={[0, topSlabCV, z]}>
          <boxGeometry args={[drawerW, topSlabH, CABINET_BEVEL_DEPTH]} />
          <meshStandardMaterial {...STRUCTURAL} />
        </mesh>
      )}
      {botSlabH > 0 && (
        <mesh position={[0, botSlabCV, z]}>
          <boxGeometry args={[drawerW, botSlabH, CABINET_BEVEL_DEPTH]} />
          <meshStandardMaterial {...STRUCTURAL} />
        </mesh>
      )}
      {fillerW > 0 && (
        <>
          <mesh position={[leftFillerCU, vCup, z]}>
            <boxGeometry args={[fillerW, CABINET_CUP_HEIGHT, CABINET_BEVEL_DEPTH]} />
            <meshStandardMaterial {...STRUCTURAL} />
          </mesh>
          <mesh position={[rightFillerCU, vCup, z]}>
            <boxGeometry args={[fillerW, CABINET_CUP_HEIGHT, CABINET_BEVEL_DEPTH]} />
            <meshStandardMaterial {...STRUCTURAL} />
          </mesh>
        </>
      )}
      {/* Cup-pull recess — plane at body-face depth, framed by the gap
          left in the drawer face frame. Small epsilon avoids Z-fight
          with the body box behind it. */}
      <mesh position={[0, vCup, 0.0001]}>
        <planeGeometry args={[CABINET_CUP_WIDTH, CABINET_CUP_HEIGHT]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>
    </group>
  )
}

// One face of one partition. The group is positioned and rotated so
// local +Z points outward through the face. Local +X is the face's
// horizontal axis (in world terms, this is either world X or Z
// depending on rotation), local +Y is vertical.
function CabinetFace({ centerWorld, rotationY, width, height, rows, cols }) {
  const cellW = width / cols
  const cellH = height / rows
  const drawerW = Math.max(0, cellW - 2 * CABINET_BEVEL_WIDTH)
  const drawerH = Math.max(0, cellH - 2 * CABINET_BEVEL_WIDTH)

  const drawers = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const uCenter = -width / 2 + (c + 0.5) * cellW
      const vCenter = -height / 2 + (r + 0.5) * cellH
      drawers.push(
        <DrawerFace
          key={`${r}-${c}`}
          uCenter={uCenter}
          vCenter={vCenter}
          drawerW={drawerW}
          drawerH={drawerH}
        />,
      )
    }
  }

  return (
    <group position={centerWorld} rotation={[0, rotationY, 0]}>
      {drawers}
    </group>
  )
}

export default function EntranceWallPartition() {
  // Centre Y and total partition height are shared by every face.
  const yC = ROOM.H / 2
  const yH = ROOM.H

  // Pre-compute column counts so all four faces of a partition use the
  // same rule (round(length / target), min 1).
  const longCols = colsForFace(ENT_PART_LEN)            // 6 on a 4.93 m face
  const vertLongCols = colsForFace(PATHWAY_PARTITION_Z) // 9 on a 7.28 m face
  const endCols = colsForFace(CABINET_T)                // 1 on a 0.5 m end

  return (
    <group>
      {/* entrance-wall-partition body — thickness extends from Z=0 into forest */}
      <mesh
        position={[
          ENTRY_GAP_WIDTH + ENT_PART_LEN / 2,
          yC,
          CABINET_T / 2,
        ]}
      >
        <boxGeometry args={[ENT_PART_LEN, yH, CABINET_T]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>
      {/* entrance-wall-partition: 4 cabinet faces */}
      <CabinetFace
        centerWorld={[ENTRY_GAP_WIDTH + ENT_PART_LEN / 2, yC, CABINET_T]}
        rotationY={0}
        width={ENT_PART_LEN}
        height={yH}
        rows={CABINET_ROWS}
        cols={longCols}
      />
      <CabinetFace
        centerWorld={[ENTRY_GAP_WIDTH + ENT_PART_LEN / 2, yC, 0]}
        rotationY={Math.PI}
        width={ENT_PART_LEN}
        height={yH}
        rows={CABINET_ROWS}
        cols={longCols}
      />
      <CabinetFace
        centerWorld={[ENTRY_GAP_WIDTH + ENT_PART_LEN, yC, CABINET_T / 2]}
        rotationY={Math.PI / 2}
        width={CABINET_T}
        height={yH}
        rows={CABINET_ROWS}
        cols={endCols}
      />
      <CabinetFace
        centerWorld={[ENTRY_GAP_WIDTH, yC, CABINET_T / 2]}
        rotationY={-Math.PI / 2}
        width={CABINET_T}
        height={yH}
        rows={CABINET_ROWS}
        cols={endCols}
      />

      {/* pathway-partition-vertical body — thickness extends from X=1.5 into forest */}
      <mesh
        position={[
          ENTRY_GAP_WIDTH + CABINET_T / 2,
          yC,
          PATHWAY_PARTITION_Z / 2,
        ]}
      >
        <boxGeometry args={[CABINET_T, yH, PATHWAY_PARTITION_Z]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>
      {/* pathway-partition-vertical: 4 cabinet faces */}
      <CabinetFace
        centerWorld={[ENTRY_GAP_WIDTH, yC, PATHWAY_PARTITION_Z / 2]}
        rotationY={-Math.PI / 2}
        width={PATHWAY_PARTITION_Z}
        height={yH}
        rows={CABINET_ROWS}
        cols={vertLongCols}
      />
      <CabinetFace
        centerWorld={[ENTRY_GAP_WIDTH + CABINET_T, yC, PATHWAY_PARTITION_Z / 2]}
        rotationY={Math.PI / 2}
        width={PATHWAY_PARTITION_Z}
        height={yH}
        rows={CABINET_ROWS}
        cols={vertLongCols}
      />
      <CabinetFace
        centerWorld={[ENTRY_GAP_WIDTH + CABINET_T / 2, yC, 0]}
        rotationY={Math.PI}
        width={CABINET_T}
        height={yH}
        rows={CABINET_ROWS}
        cols={endCols}
      />
      <CabinetFace
        centerWorld={[ENTRY_GAP_WIDTH + CABINET_T / 2, yC, PATHWAY_PARTITION_Z]}
        rotationY={0}
        width={CABINET_T}
        height={yH}
        rows={CABINET_ROWS}
        cols={endCols}
      />

      {/* pathway-partition-horizontal body — thickness extends from Z=7.28 into forest */}
      <mesh
        position={[
          ENTRY_GAP_WIDTH + HORIZ_PART_LEN / 2,
          yC,
          PATHWAY_PARTITION_Z - CABINET_T / 2,
        ]}
      >
        <boxGeometry args={[HORIZ_PART_LEN, yH, CABINET_T]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>
      {/* pathway-partition-horizontal: 4 cabinet faces */}
      <CabinetFace
        centerWorld={[
          ENTRY_GAP_WIDTH + HORIZ_PART_LEN / 2,
          yC,
          PATHWAY_PARTITION_Z,
        ]}
        rotationY={0}
        width={HORIZ_PART_LEN}
        height={yH}
        rows={CABINET_ROWS}
        cols={longCols}
      />
      <CabinetFace
        centerWorld={[
          ENTRY_GAP_WIDTH + HORIZ_PART_LEN / 2,
          yC,
          PATHWAY_PARTITION_Z - CABINET_T,
        ]}
        rotationY={Math.PI}
        width={HORIZ_PART_LEN}
        height={yH}
        rows={CABINET_ROWS}
        cols={longCols}
      />
      <CabinetFace
        centerWorld={[
          ENTRY_GAP_WIDTH + HORIZ_PART_LEN,
          yC,
          PATHWAY_PARTITION_Z - CABINET_T / 2,
        ]}
        rotationY={Math.PI / 2}
        width={CABINET_T}
        height={yH}
        rows={CABINET_ROWS}
        cols={endCols}
      />
      <CabinetFace
        centerWorld={[
          ENTRY_GAP_WIDTH,
          yC,
          PATHWAY_PARTITION_Z - CABINET_T / 2,
        ]}
        rotationY={-Math.PI / 2}
        width={CABINET_T}
        height={yH}
        rows={CABINET_ROWS}
        cols={endCols}
      />
    </group>
  )
}
