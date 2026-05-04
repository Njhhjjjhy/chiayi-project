import { useVariant } from '../../hooks/useVariant.js'
import { wallMaterial } from './roomMaterials.js'
import ArchEdges from './ArchEdges.jsx'
import {
  ROOM, HW, WALL_T,
  INSIDE,
  D1_W, D1_H, D1_START_X, D1_END_X, D1_X,
  D2_W, D2_H, D2_END_X, D2_X,
  STEEL_DOOR_W, STEEL_DOOR_H, STEEL_DOOR_Z,
  SMALL_WIN_W, SMALL_WIN_SILL, SMALL_WIN_H, SMALL_WIN_Z,
  MAIN_WIN_W, MAIN_WIN_SILL, MAIN_WIN_TOP, MAIN_WIN_Z,
} from '../../geometry/dimensions.js'

// All four wall meshes, sectioned around door + window openings. Meshes
// are offset OUT by WALL_T/2, so each wall's room-facing surface sits
// on the nominal boundary (±HW on x, ±HD on z).

export default function Walls({ width = ROOM.W, height = ROOM.H }) {
  const { isConstruction } = useVariant()
  const wall = wallMaterial(isConstruction)

  // entrance-wall (x = -HW): conceptual only. Formed by the column +
  // EntranceWallPartition; no concrete wall mesh is rendered here.

  // back-wall (z = +HD): sections flanking D1 and D2
  // D2 spans [-HW, D2_END_X]; D1 spans [D1_START_X, D1_END_X]
  const backA_len = D1_START_X - D2_END_X
  const backA_x = (D2_END_X + D1_START_X) / 2
  const backB_len = HW - D1_END_X
  const backB_x = (D1_END_X + HW) / 2

  // window-wall (x = +HW): sectioned around the small window, silver
  // service door, and main glass partition. Walking from front-wall
  // (z = -HD) to back-wall (z = +HD):
  //   segment 1 — 119 cm plain wall, contains the small window cut-out
  //   segment 2 —  99 cm silver service door (full-height opening)
  //   segment 3 —  90 cm plain wall (no opening)
  //   segment 4 — 570 cm main glass partition, ends flush with back-wall
  const windowX = INSIDE.window + WALL_T / 2

  // segment 1 z-bounds + small window cut-out within it
  const seg1Start = INSIDE.front
  const seg1End = STEEL_DOOR_Z - STEEL_DOOR_W / 2
  const seg1Len = seg1End - seg1Start
  const seg1MidZ = (seg1Start + seg1End) / 2

  const smallWinStart = SMALL_WIN_Z - SMALL_WIN_W / 2
  const smallWinEnd = SMALL_WIN_Z + SMALL_WIN_W / 2
  const smallWinTop = SMALL_WIN_SILL + SMALL_WIN_H

  const seg1LeftSliverLen = smallWinStart - seg1Start
  const seg1LeftSliverZ = (seg1Start + smallWinStart) / 2
  const seg1RightChunkLen = seg1End - smallWinEnd
  const seg1RightChunkZ = (smallWinEnd + seg1End) / 2

  // segment 3 — plain wall between silver door and main glass partition
  const seg3Start = STEEL_DOOR_Z + STEEL_DOOR_W / 2
  const seg3End = MAIN_WIN_Z - MAIN_WIN_W / 2
  const seg3Len = seg3End - seg3Start
  const seg3Z = (seg3Start + seg3End) / 2

  return (
    <group>
      {/* === window-wall (x = +HW) — sectioned around openings === */}
      {/* seg 1 — plain wall around small window */}
      {/* below the small window, full segment-1 width */}
      <mesh position={[windowX, SMALL_WIN_SILL / 2, seg1MidZ]} receiveShadow>
        <boxGeometry args={[WALL_T, SMALL_WIN_SILL, seg1Len]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>
      {/* above the small window, full segment-1 width */}
      <mesh position={[windowX, (smallWinTop + height) / 2, seg1MidZ]} receiveShadow>
        <boxGeometry args={[WALL_T, height - smallWinTop, seg1Len]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>
      {/* sliver of wall between front-wall corner and small window */}
      {seg1LeftSliverLen > 0 && (
        <mesh position={[windowX, (SMALL_WIN_SILL + smallWinTop) / 2, seg1LeftSliverZ]} receiveShadow>
          <boxGeometry args={[WALL_T, SMALL_WIN_H, seg1LeftSliverLen]} />
          <meshStandardMaterial {...wall} />
          <ArchEdges />
        </mesh>
      )}
      {/* wall between small window and silver door */}
      <mesh position={[windowX, (SMALL_WIN_SILL + smallWinTop) / 2, seg1RightChunkZ]} receiveShadow>
        <boxGeometry args={[WALL_T, SMALL_WIN_H, seg1RightChunkLen]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>

      {/* seg 2 — wall above silver service door (door fills the rest) */}
      <mesh position={[windowX, (STEEL_DOOR_H + height) / 2, STEEL_DOOR_Z]} receiveShadow>
        <boxGeometry args={[WALL_T, height - STEEL_DOOR_H, STEEL_DOOR_W]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>

      {/* seg 3 — plain wall, full height */}
      <mesh position={[windowX, height / 2, seg3Z]} receiveShadow>
        <boxGeometry args={[WALL_T, height, seg3Len]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>

      {/* seg 4 — wall below + above the main glass partition */}
      <mesh position={[windowX, MAIN_WIN_SILL / 2, MAIN_WIN_Z]} receiveShadow>
        <boxGeometry args={[WALL_T, MAIN_WIN_SILL, MAIN_WIN_W]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>
      <mesh position={[windowX, (MAIN_WIN_TOP + height) / 2, MAIN_WIN_Z]} receiveShadow>
        <boxGeometry args={[WALL_T, height - MAIN_WIN_TOP, MAIN_WIN_W]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>

      {/* === front-wall (z = -HD) — continuous, extended by WALL_T only on
          the window-wall side to seal that corner. Does NOT extend past
          the entrance-wall line — the entrance-wall is conceptual (no
          real building wall) so the front-wall ends at x = -HW. === */}
      <mesh position={[WALL_T / 2, height / 2, INSIDE.front - WALL_T / 2]} receiveShadow>
        <boxGeometry args={[width + WALL_T, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>

      {/* === back-wall (z = +HD) sections === */}
      <mesh position={[backA_x, height / 2, INSIDE.back + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[backA_len, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>
      <mesh position={[backB_x, height / 2, INSIDE.back + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[backB_len, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>
      {/* walls above D1 + D2 (from door top to ceiling) */}
      <mesh position={[D1_X, (D1_H + height) / 2, INSIDE.back + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[D1_W, height - D1_H, WALL_T]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>
      <mesh position={[D2_X, (D2_H + height) / 2, INSIDE.back + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[D2_W, height - D2_H, WALL_T]} />
        <meshStandardMaterial {...wall} />
        <ArchEdges />
      </mesh>
    </group>
  )
}
