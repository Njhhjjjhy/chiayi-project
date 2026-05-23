import {
  ROOM, WALL_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z, CABINET_T,
  LOOFAH_CORNER_BASE_SIZE,
} from './dimensions.js'

// Forest corner centre positions for variant 3's corner column. Back
// corners account for the pathway-partition cabinets eating
// X = 1.5 → 2.0 and (on the back row) Z = 0 → 0.5 / Z = 6.78 → 7.28.
// Front corners sit flush against `front-wall` only; no partition
// cabinet at the X > 6.43 strip along Z = 0 or Z = 7.28.

const SURFACE_NUDGE = 0.008

export function getLoofahCornerCenter(cornerName) {
  const half = LOOFAH_CORNER_BASE_SIZE / 2
  const backX  = ENTRY_GAP_WIDTH + CABINET_T + SURFACE_NUDGE + half
  const frontX = ROOM.W - WALL_T - SURFACE_NUDGE - half
  const leftZBack   = CABINET_T + SURFACE_NUDGE + half
  const rightZBack  = PATHWAY_PARTITION_Z - CABINET_T - SURFACE_NUDGE - half
  const leftZFront  = SURFACE_NUDGE + half
  const rightZFront = PATHWAY_PARTITION_Z - SURFACE_NUDGE - half

  switch (cornerName) {
    case 'back-left':   return [backX,  leftZBack]
    case 'back-right':  return [backX,  rightZBack]
    case 'front-left':  return [frontX, leftZFront]
    case 'front-right': return [frontX, rightZFront]
    default:            return [backX,  leftZBack]
  }
}
