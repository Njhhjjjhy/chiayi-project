// THE canonical source for every room dimension used by the 3D preview.
// Change a number here and every mesh, label, door skip, firefly
// distribution, and overlay updates automatically. Nothing else in the
// codebase should hardcode room dimensions.

// --- Room envelope ---
// Front-wall and back-wall run along x → ROOM.W = 8.83 m.
// Entrance-wall and window-wall run along z → ROOM.D = 8.78 m.
// Working ceiling height (after beams) → ROOM.H = 3.52 m.
export const ROOM = { W: 8.83, D: 8.78, H: 3.52 }
export const HW = ROOM.W / 2    // 4.415
export const HD = ROOM.D / 2    // 4.39

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

// --- Visitor entrance (entrance-wall, x = -HW) ---
// Opening is flush with the front-wall corner. South edge stays where
// the column's front face sits.
export const ENT_W = 2.40                 // canonical entrance width
const ENT_START = -HD                     // flush with front-wall corner
export const ENT_END = ENT_START + ENT_W  // south edge, derived
export const ENT_H = ROOM.H               // full working ceiling height, no transom
export const ENT_Z = (ENT_START + ENT_END) / 2

// --- Column (south side of visitor entrance) ---
// 40 × 40 cm plywood column, full ROOM.H tall. Outer face flush with
// the entrance-wall line at x = -HW; front face at the south edge of
// the entrance opening (z = ENT_END). Together with the
// entrance-wall-partition it forms the conceptual entrance-wall.
export const COL_W = 0.40
export const COL_CENTER_X = -HW + COL_W / 2     // -4.215
export const COL_CENTER_Z = ENT_END + COL_W / 2 // -1.79
export const COL_BACK_Z = ENT_END + COL_W       // -1.59

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

// --- Window-wall (x = +HW) ---
// Walking from front-wall corner toward back-wall corner along z, the
// window-wall is divided into four segments:
//   segment 1 — 119 cm plain wall, contains the small window cut-out
//   segment 2 —  99 cm silver service door
//   segment 3 —  90 cm plain wall
//   segment 4 — 570 cm main glass partition, ends flush with back-wall corner
//   total = 878 cm = ROOM.D ✓

// Main glass partition — 570 wide × 201 tall (sill 32, top 233 from floor).
// Ends flush with back-wall corner.
export const MAIN_WIN_W = 5.70
export const MAIN_WIN_SILL = 0.32
export const MAIN_WIN_TOP = 2.33
export const MAIN_WIN_H = MAIN_WIN_TOP - MAIN_WIN_SILL               // 2.01
const MAIN_WIN_START_Z = HD - MAIN_WIN_W                              // -1.31
export const MAIN_WIN_Z = MAIN_WIN_START_Z + MAIN_WIN_W / 2           // +1.54

// Small window — cut-out within segment 1, flush-left (5 cm from front-wall
// corner). 59 × 178 cm, sill 35 cm so window top (213 cm) stays below HVAC.
export const SMALL_WIN_W = 0.59
export const SMALL_WIN_SILL = 0.35
const SMALL_WIN_TOP = 2.13
export const SMALL_WIN_H = SMALL_WIN_TOP - SMALL_WIN_SILL             // 1.78
export const SMALL_WIN_Z = -HD + 0.05 + SMALL_WIN_W / 2               // -4.045

// Silver service door — 207 × 99 cm. Segment 2 begins immediately after
// segment 1 (no phantom solid between small window and door).
export const STEEL_DOOR_W = 0.99
export const STEEL_DOOR_H = 2.07
export const STEEL_DOOR_Z = -HD + 1.19 + STEEL_DOOR_W / 2             // -2.705

// --- HVAC plenum (L-shape on window-wall, over silver door) ---
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

// --- Plywood (used by every plywood-on-stud partition) ---
// Both the pathway-partition and the entrance-wall-partition are
// built from the same plywood sheet stock.
export const PLYWOOD_T = 0.06

// --- Pathway dimensions ---
// L-shaped pathway-partition (Pathway.jsx) wrapping the front-wall
// and window-wall sides. The window-wall side is pulled inward to
// clear the HVAC plenum (plenum extends to x = 2.615), so the
// pathway along that wall is wider than PATHWAY_WIDTH.
export const PATHWAY_WIDTH = 1.35
export const PATHWAY_HEIGHT = ROOM.H            // pathway-partition reaches the ceiling
export const PATHWAY_SEG2_FACE_X = 2.5          // window-wall pathway-partition face, plenum-cleared

// --- Camera preset constants ---
// camera x for window preset. revisit now that the old partition arm
// is gone — camera can sit farther back for a wider elevation view.
export const WINDOW_PRESET_CAMERA_X = 2.80

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
