import {
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z, CABINET_T,
  COLUMN_X, COLUMN_W, COLUMN_D,
} from './dimensions.js'

// Shared XZ-plane exclusion test for any forest-floor placement
// pipeline (ceiling forms, flock modules, grove stems, lantern
// pillars). Returns true if the point falls inside the
// entrance-wall-partition footprint, the pathway-partition footprint,
// or the existing concrete column footprint. Y-independent.
//
// All four regions are pulled from canonical room dimensions so any
// future change to the room layout flows through automatically.
export function inForestExclusion(x, z) {
  if (x >= ENTRY_GAP_WIDTH && x <= COLUMN_X && z >= 0 && z <= CABINET_T) return true
  if (x >= ENTRY_GAP_WIDTH && x <= ENTRY_GAP_WIDTH + CABINET_T && z >= 0 && z <= PATHWAY_PARTITION_Z) return true
  if (x >= ENTRY_GAP_WIDTH && x <= COLUMN_X && z >= PATHWAY_PARTITION_Z - CABINET_T && z <= PATHWAY_PARTITION_Z) return true
  if (x >= COLUMN_X - COLUMN_W / 2 && x <= COLUMN_X + COLUMN_W / 2 &&
      z >= 0 && z <= COLUMN_D) return true
  return false
}
