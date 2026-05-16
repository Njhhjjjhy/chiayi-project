// v2 coordinate system — parallel to dimensions.js, consumed only by
// the /fireflies-v2 route. Existing dimensions.js stays the source of
// truth for /fireflies until the v2 build is complete.
//
// Origin (0, 0, 0) sits at the back-wall / entrance-wall corner.
//   X axis → positive toward front-wall.    back-wall at X = 0,           front-wall at X = ROOM.W.
//   Y axis → up.                            floor at Y = 0,                working ceiling at Y = ROOM.H.
//   Z axis → positive toward window-wall.   entrance-wall line at Z = 0,   window-wall at Z = ROOM.D.
//
// All values in metres. Anything marked ESTIMATE awaits confirmation
// from a building visit; treat as placeholder until updated.

// --- Room envelope ---
export const ROOM = { W: 8.83, D: 8.78, H: 3.52, H_TOTAL: 4.2 }

// --- Wall thickness + partition thickness ---
export const WALL_T = 0.12       // existing concrete walls
export const PARTITION_T = 0.018 // 18 mm plywood, on-site partitions

// --- Column (existing structural, immovable) ---
export const COLUMN_X = 6.43     // = ROOM.W - 2.4, measured from back-wall
export const COLUMN_Z = 0        // on the entrance-wall line
export const COLUMN_W = 0.30     // ESTIMATE — footprint along X
export const COLUMN_D = 0.30     // ESTIMATE — footprint along Z

// --- Entry gap + pathway partition position ---
// Visitor entry sits in the X = 0 → 1.5 m gap on the entrance-wall line.
// Horizontal pathway partition is 1.5 m off the window-wall.
export const ENTRY_GAP_WIDTH = 1.5
export const PATHWAY_PARTITION_Z = 7.28   // = ROOM.D - ENTRY_GAP_WIDTH

// --- Forest zone (everything inside the panel-ceiling area) ---
export const FOREST_X_START = ENTRY_GAP_WIDTH   // 1.5
export const FOREST_X_END   = ROOM.W            // 8.83
export const FOREST_Z_START = 0
export const FOREST_Z_END   = PATHWAY_PARTITION_Z // 7.28

// --- Back-wall doors (X = 0 face) ---
// D1 and D2 are existing staff doors. Positions ESTIMATE — confirm on visit.
export const D1_Z = 2.5,  D1_W = 0.9,  D1_H = 2.1   // ESTIMATE
export const D2_Z = 5.0,  D2_W = 0.9,  D2_H = 2.1   // ESTIMATE

// --- Window-wall doors and windows (Z = ROOM.D face) ---
// All ESTIMATE — exact positions and sizes confirm on building visit.
export const WW_DOOR1_X = 0.95, WW_DOOR1_W = 0.9, WW_DOOR1_H = 2.1                   // ESTIMATE
export const WW_DOOR2_X = 3.95, WW_DOOR2_W = 0.9, WW_DOOR2_H = 2.1                   // ESTIMATE
export const WW_WIN1_X  = 2.3,  WW_WIN1_W  = 1.0, WW_WIN1_H  = 1.5, WW_WIN1_SILL = 0.9 // ESTIMATE
export const WW_WIN2_X  = 5.3,  WW_WIN2_W  = 1.0, WW_WIN2_H  = 1.5, WW_WIN2_SILL = 0.9 // ESTIMATE
