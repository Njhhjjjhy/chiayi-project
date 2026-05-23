import { useProposal } from '../../hooks/useProposal.js'
import {
  ROOM, WALL_T, PARTITION_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  FOREST_X_START, FOREST_X_END, FOREST_Z_START, FOREST_Z_END,
  COLUMN_X,
} from '../../geometry/dimensions.js'

// Hidden-LED-style ambient lighting along the four forest boundaries.
// Renders four thin bars per proposal's wallLight style.
//
// Spec section 2.9 prose was ambiguous about exact bar endpoints (the
// "back-wall interior face" label doesn't match its X/Z numbers in the
// new coordinate system). Interpreting the intent as: one bar along
// each of the four forest boundaries (pathway-partition-vertical,
// front-wall, entrance-wall-partition, pathway-partition-horizontal).
//
// Style is selected from the active proposal's wallLight value:
//   sundown      → warm amber, very low (Y = 0.05), low intensity
//   horizon-line → warm white, higher (Y = 0.35), brighter

const BAR_SECTION = 0.02
const BAR_OFFSET = 0.01 // metres into the forest from each boundary surface

const STYLES = {
  sundown: {
    y: 0.05,
    material: {
      color: '#ff8c00',
      emissive: '#ff8c00',
      emissiveIntensity: 0.15,
      roughness: 0.6,
      metalness: 0,
    },
  },
  'horizon-line': {
    y: 0.35,
    material: {
      color: '#fffaf0',
      emissive: '#fffaf0',
      emissiveIntensity: 0.4,
      roughness: 0.6,
      metalness: 0,
    },
  },
}

export default function WallLighting() {
  const { wallLight } = useProposal()
  const style = STYLES[wallLight]
  if (!style) return null

  // Interior faces of each forest boundary. Three of the four faces sit
  // on a cabinet partition's forest-facing side (X = 2.0, Z = 0.5, Z = 6.78);
  // the bar is offset PARTITION_T + BAR_OFFSET further into the forest,
  // preserving the original visual relationship of the bar to the surface
  // it edges.
  const X_BACK_FACE  = FOREST_X_START + CABINET_T + PARTITION_T // pathway-partition-vertical's forest-side face
  const X_FRONT_FACE = ROOM.W - WALL_T                           // front-wall's forest-side face
  const Z_ENTRY_FACE = CABINET_T + PARTITION_T                    // entrance-wall-partition's forest-side face
  const Z_WIN_FACE   = PATHWAY_PARTITION_Z - CABINET_T - PARTITION_T // pathway-partition-horizontal's forest-side face

  // Centre Z for bars that run the full forest depth along an X-aligned wall.
  const FULL_FOREST_Z_CENTER = (FOREST_Z_START + FOREST_Z_END) / 2
  const FULL_FOREST_Z_SPAN   = FOREST_Z_END - FOREST_Z_START

  // Centre X / span for bars along the entrance-wall-partition and the
  // pathway-partition-horizontal — both partitions only exist between
  // X = ENTRY_GAP_WIDTH (1.5) and X = COLUMN_X (6.43).
  const PARTITION_X_CENTER = (ENTRY_GAP_WIDTH + COLUMN_X) / 2
  const PARTITION_X_SPAN   = COLUMN_X - ENTRY_GAP_WIDTH

  return (
    <group>
      {/* Along pathway-partition-vertical (forest's back-wall-side boundary) */}
      <mesh position={[X_BACK_FACE + BAR_OFFSET, style.y, FULL_FOREST_Z_CENTER]}>
        <boxGeometry args={[BAR_SECTION, BAR_SECTION, FULL_FOREST_Z_SPAN]} />
        <meshStandardMaterial {...style.material} />
      </mesh>

      {/* Along front-wall (forest's front-wall boundary) */}
      <mesh position={[X_FRONT_FACE - BAR_OFFSET, style.y, FULL_FOREST_Z_CENTER]}>
        <boxGeometry args={[BAR_SECTION, BAR_SECTION, FULL_FOREST_Z_SPAN]} />
        <meshStandardMaterial {...style.material} />
      </mesh>

      {/* Along entrance-wall-partition (only spans where the partition exists) */}
      <mesh position={[PARTITION_X_CENTER, style.y, Z_ENTRY_FACE + BAR_OFFSET]}>
        <boxGeometry args={[PARTITION_X_SPAN, BAR_SECTION, BAR_SECTION]} />
        <meshStandardMaterial {...style.material} />
      </mesh>

      {/* Along pathway-partition-horizontal (only spans where the partition exists) */}
      <mesh position={[PARTITION_X_CENTER, style.y, Z_WIN_FACE - BAR_OFFSET]}>
        <boxGeometry args={[PARTITION_X_SPAN, BAR_SECTION, BAR_SECTION]} />
        <meshStandardMaterial {...style.material} />
      </mesh>
    </group>
  )
}
