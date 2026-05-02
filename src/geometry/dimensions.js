// THE canonical source for every room dimension used by the 3D preview.
// Change a number here and every mesh, label, door skip, firefly
// distribution, and overlay updates automatically. Nothing else in the
// codebase should hardcode room dimensions.

// --- Room envelope ---
export const ROOM = { W: 8.83, D: 10, H: 3.52 }
export const HW = ROOM.W / 2    // 4.415
export const HD = ROOM.D / 2    // 5

// Wall thickness, inside-face inset for labels/LEDs
export const WALL_T = 0.12
export const INSET = 0.05

// --- Wall inside-face coordinates ---
// All four wall meshes are offset OUT of the room by WALL_T/2, so every
// wall's room-facing surface sits at the nominal boundary (±HW on x, ±HD on z).
export const INSIDE = {
  front: -HD,
  back: HD,
  entrance: -HW,
  window: HW,
}

// --- Wainscoting (dark wood band at the bottom of every wall) ---
// Heights vary per wall; entrance-wall has none.
export const WAINSCOT_H = {
  front: 0.90,
  back: 0.90,
  window: 0.30,
  entrance: 0,
}
const DOOR_CLEAR = 0.08   // clearance each side of any door

// --- Dropped ceiling ---
export const DROPPED_CEILING_Y = 3.4

// --- Visitor entrance (entrance wall, x = -HW) ---
// Opening is flush with the front-wall corner. South edge stays where
// the partition (segment-a) aligns to it.
export const ENT_START = -HD              // -5, flush with front wall
export const ENT_END = -2.15              // south edge (matches segment-a face)
export const ENT_W = ENT_END - ENT_START  // 2.85
export const ENT_H = 3.52                 // full room height, no transom
export const ENT_Z = (ENT_START + ENT_END) / 2  // -3.575

// --- Back-wall doors (z = +HD) ---
// D1 + D2 measured from window-wall corner (+HW).
export const D1_W = 0.96, D1_H = 2.36
export const D1_END_X = HW - 4.37                   // +0.045
export const D1_START_X = D1_END_X - D1_W           // -0.915
export const D1_X = (D1_START_X + D1_END_X) / 2     // -0.435

export const D2_W = 0.90, D2_H = 2.36
export const D2_END_X = HW - 7.93                   // -3.515
export const D2_START_X = D2_END_X - D2_W           // -4.415 (flush with entrance-wall corner)
export const D2_X = (D2_START_X + D2_END_X) / 2     // -3.965

// --- Window wall (x = +HW) ---
// Per site drawing: 119 solid + 59 window + 63 solid + 99 door + 90 solid + 570 main glass = 1000 cm.

// Main glass partition — 570 wide × 201 tall (sill 32, top 233).
// Ends flush with back-wall corner.
export const MAIN_WIN_W = 5.70
export const MAIN_WIN_SILL = 0.32
export const MAIN_WIN_TOP = 2.33
export const MAIN_WIN_H = MAIN_WIN_TOP - MAIN_WIN_SILL               // 2.01
const MAIN_WIN_START_Z = HD - MAIN_WIN_W                              // -0.70
export const MAIN_WIN_Z = MAIN_WIN_START_Z + MAIN_WIN_W / 2           // +2.15

// Small window in stepped notch — 59 × 178 cm.
// Sill kept at 35 cm so window top (213 cm) stays below the HVAC plenum.
export const SMALL_WIN_W = 0.59
export const SMALL_WIN_SILL = 0.35
const SMALL_WIN_TOP = 2.13
export const SMALL_WIN_H = SMALL_WIN_TOP - SMALL_WIN_SILL             // 1.78
export const SMALL_WIN_Z = -HD + 1.19 + SMALL_WIN_W / 2               // -3.515

// Silver service door — 207 × 99 cm.
// Sits 63 cm past the small window end; 90 cm clearance before main glass.
export const STEEL_DOOR_W = 0.99
export const STEEL_DOOR_H = 2.07
export const STEEL_DOOR_Z = -HD + 1.19 + 0.59 + 0.63 + STEEL_DOOR_W / 2   // -2.095

// --- HVAC plenum (L-shape on window wall, over silver door) ---
export const PLENUM_MAIN_DEPTH_Z = 1.35      // along wall
export const PLENUM_MAIN_WIDTH_X = 1.80      // into room
export const PLENUM_MAIN_HEIGHT_Y = 0.70
export const PLENUM_MAIN_X = INSIDE.window - PLENUM_MAIN_WIDTH_X / 2
export const PLENUM_MAIN_Z = STEEL_DOOR_Z
export const PLENUM_MAIN_Y = ROOM.H - PLENUM_MAIN_HEIGHT_Y / 2 - 0.47

export const PLENUM_DROP_DEPTH_Z = 0.80
export const PLENUM_DROP_WIDTH_X = 0.60
export const PLENUM_DROP_HEIGHT_Y = 0.45
export const PLENUM_DROP_X =
  PLENUM_MAIN_X - PLENUM_MAIN_WIDTH_X / 2 + PLENUM_DROP_WIDTH_X / 2 + 0.10
export const PLENUM_DROP_Z = PLENUM_MAIN_Z
export const PLENUM_DROP_Y =
  PLENUM_MAIN_Y - PLENUM_MAIN_HEIGHT_Y / 2 - PLENUM_DROP_HEIGHT_Y / 2

// --- Corridor partitions (EntryPathway) ---
// Clear walking width of the visitor corridor that wraps the front,
// window, and back walls. Segment 2 along the window wall is pulled
// inward to clear the HVAC plenum (plenum extends to x = 2.615), so
// the corridor along that wall is wider than CORRIDOR_WIDTH.
export const CORRIDOR_WIDTH = 1.35
export const PARTITION_HEIGHT = 3.4               // up to underside of dropped ceiling
export const SEG2_FACE_X = 2.5                    // window-wall partition, plenum-cleared

// --- Door skip ranges for wall-covering generation ---
// Per-wall main axis: x for front/back, z for entrance/window.
export const DOOR_SKIPS = {
  front: [],
  back: [
    [D2_START_X - DOOR_CLEAR, D2_END_X + DOOR_CLEAR],   // D2
    [D1_START_X - DOOR_CLEAR, D1_END_X + DOOR_CLEAR],   // D1
  ],
  entrance: [
    [ENT_START - DOOR_CLEAR, ENT_END + DOOR_CLEAR],     // visitor entrance
  ],
  window: [
    [STEEL_DOOR_Z - STEEL_DOOR_W / 2 - DOOR_CLEAR,
     STEEL_DOOR_Z + STEEL_DOOR_W / 2 + DOOR_CLEAR],     // silver service door
  ],
}

// Door-top heights per wall (order matches DOOR_SKIPS). Area above the
// door up to ROOM.H is covered by an "overhead" curtain segment.
export const DOOR_TOPS = {
  front: [],
  back:     [D2_H, D1_H],
  entrance: [ENT_H],            // visitor entrance is full-height, no overhead
  window:   [STEEL_DOOR_H],
}
