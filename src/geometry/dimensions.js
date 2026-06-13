// v2 coordinate system — parallel to dimensions.js, consumed only by
// the /fireflies route. Existing dimensions.js stays the source of
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
export const CABINET_T = 0.5     // cabinet partitions (0.4–0.6 m placeholder, pending carpenter)

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
export const D1_Z = 2.5,  D1_W = 0.96, D1_H = 2.36  // sizes from the dim drawing; Z still estimate
export const D2_Z = 5.0,  D2_W = 0.90, D2_H = 2.36  // sizes from the dim drawing; Z still estimate

// --- Back-wall red sprinkler pipe (existing infrastructure) ---
// Bright red pipe running horizontally across the back-wall near the top,
// with a vertical drop near the entrance-wall corner. Sits just off the
// back-wall face, below the dropped-ceiling line.
export const SPRINKLER_Y = 3.05            // height of the horizontal run
export const SPRINKLER_RADIUS = 0.025
export const SPRINKLER_OFFSET = 0.06       // distance off the back-wall face into the room

// --- Window-wall openings (Z = ROOM.D face) — 1 silver door + 2 windows ---
// Real building measurements. Reading the wall from the front-wall corner
// (X = ROOM.W) toward the back-wall corner (X = 0): the silver service door
// sits under the HVAC near the front-wall end, the small vertical window next
// to it, then the big wide window runs along to the back-wall corner.
// Sizes are exact; the X centres are placed from the layout — nudge against
// the reference photos if needed.
// Layout from the front-wall corner (X = ROOM.W): 119 cm wall (small window in
// it) → 99 cm door → 90 cm wall → 570 cm big window → back-wall corner.
export const WW_DOOR_W = 0.99, WW_DOOR_H = 2.07              // silver service door (under the HVAC)
export const WW_DOOR_X = 7.145                              // centre: after the 119 cm wall
export const WW_SMALLWIN_W = 0.59, WW_SMALLWIN_H = 1.78      // small vertical window, in the 119 cm stretch
export const WW_SMALLWIN_X = 7.95, WW_SMALLWIN_SILL = 0.30
export const WW_BIGWIN_W = 5.70, WW_BIGWIN_H = 2.01          // large wide window (interior glass)
export const WW_BIGWIN_X = 2.90, WW_BIGWIN_SILL = 0.32       // centre; runs toward the back-wall corner

// --- Wainscoting (existing dark-wood panelling along the wall bases) ---
// Present on the back-wall, front-wall, and window-wall; the entrance-wall has
// none. A band standing slightly proud of each wall's room-facing surface.
export const WAINSCOT_FRONT_H = 0.75   // front-wall band height (placeholder — confirm exact cm)
export const WAINSCOT_BACK_H = 0.75    // back-wall band height (placeholder — confirm exact cm)
export const WAINSCOT_WINDOW_H = 0.30  // window-wall band height (low, under the glass)
export const WAINSCOT_T = 0.02         // how far it stands proud of the wall face
export const WAINSCOT_COLOR = '#3d2b1a'

// --- HVAC plenum (existing; window-wall upper corner near the front-wall end,
// above the silver service door). A main box plus a smaller drop. ---
export const HVAC_W = 1.8     // along the window-wall (X)
export const HVAC_D = 1.35    // into the room (Z)
export const HVAC_H = 0.7     // tall
export const HVAC_X = 7.3     // centre, above the silver door near the front-wall corner
export const HVAC_COLOR = '#15161a'  // near-black metal duct

// --- Floor ---
// Interlocking foam-mat tiles (per canonical doc 1). Matte, dark, no
// reflectivity. The seam between tiles renders at FLOOR_COLOR scaled
// by FLOOR_SEAM_DARKEN.
export const FLOOR_TILE_SIZE = 0.6              // metres per tile edge
export const FLOOR_COLOR = '#1a1a1a'             // near-black, matches wall tone (placeholder)
export const FLOOR_EMISSIVE_INTENSITY = 0.05    // self-emissive lift for visibility at ambient 0.01
export const FLOOR_SEAM_DARKEN = 0.3             // seam colour = FLOOR_COLOR × this factor

// --- Pathway lighting ---
// Always-on, no switcher (designer decision 6 June 2026): the warm
// strips along the L-shaped pathway's floor edges are part of the
// pathway in both concept images, and the wayfinding signal is three
// painted arrows at the route's decision points. The arrows are PAINT,
// not fixtures — no extra lights get installed for them; they read by
// the pathway's existing light (strips, downlights or lamps).
export const PATHWAY_LED_HEIGHT = 0.02           // centre Y above floor for the edge strips
export const PATHWAY_LED_COLOR = '#fff4e0'       // warm white
export const PATHWAY_LED_INTENSITY = 0.7         // strip emissive intensity

export const PATHWAY_STRIP_THICKNESS = 0.015     // strip cross-section (square)

// Painted floor arrows — matte white paint on the floor mats.
export const PATHWAY_ARROW_LENGTH = 0.6          // tip-to-tail length
export const PATHWAY_ARROW_WIDTH = 0.3           // across-the-arrow span
export const PATHWAY_ARROW_COLOR = '#ffffff'     // matte white paint

// --- Pathway looks (concept images 05 / 14, canonical doc 11) ---
// Two switchable looks behind `?pathway=`, compared side by side:
//   'dark'    near-black corridor with small warm ceiling downlights
//             washing scallops onto the partition wall (image 05)
//   'timber'  wood-panelled corridor with small glowing wall lamps
//             down the partition side (image 14)
// Both looks sit alongside the always-on pathway lighting (edge strips
// + painted arrows) — the looks never duplicate it. The window-wall
// side of the horizontal leg keeps its blackout curtain in both looks
// (the real room has the 570 cm glass partition there), so timber
// panelling goes on the back-wall and the two partition faces only.
export const PATHWAY_LOOK_VARIANTS = ['dark', 'timber']
export const PATHWAY_LOOK_DEFAULT = 'dark'

// Dark look — downlight fixtures (image 05). No real lights: the can,
// the wall scallop, and the floor pool are all emissive/additive, the
// same approach as the wayfinding pools (real lights at this count
// would weigh down the renderer).
export const PATHWAY_DOWNLIGHT_WALL_OFFSET = 0.35   // fixture distance off the partition face
export const PATHWAY_DOWNLIGHT_SPACING = 1.2        // along-the-leg spacing
export const PATHWAY_DOWNLIGHT_CAN_RADIUS = 0.045
export const PATHWAY_DOWNLIGHT_CAN_HEIGHT = 0.06
export const PATHWAY_DOWNLIGHT_COLOR = '#ffd9a0'    // warm scallop colour
// No floor pools — the downlights land their light on the wall only
// (designer decision 6 June 2026: the floor discs read as odd circles
// from above).
export const PATHWAY_SCALLOP_WIDTH = 0.9            // wall scallop plane size
export const PATHWAY_SCALLOP_HEIGHT = 1.3
export const PATHWAY_SCALLOP_OPACITY = 0.35

// Timber look — wall boards + lamps (image 14). Boards are full-height
// vertical planks with per-board colour jitter so the panelling reads
// hand-built rather than wallpapered.
export const PATHWAY_TIMBER_SEED = 947              // Park-Miller seed, distinct from existing seeds
export const PATHWAY_TIMBER_BOARD_WIDTH = 0.6       // target plank width; actual varies per board
export const PATHWAY_TIMBER_BOARD_T = 0.012         // plank thickness proud of the wall
export const PATHWAY_TIMBER_GAP = 0.004             // dark seam between planks
export const PATHWAY_TIMBER_COLOR = '#6b4a2e'       // mid warm brown
export const PATHWAY_TIMBER_COLOR_JITTER = 0.08     // per-board lightness variation
export const PATHWAY_LAMP_Y = 2.3                   // lamp mounting height
export const PATHWAY_LAMP_SPACING = 1.4
export const PATHWAY_LAMP_RADIUS = 0.07             // dome shade radius
export const PATHWAY_LAMP_COLOR = '#ffc070'
export const PATHWAY_LAMP_INTENSITY = 2.2
export const PATHWAY_LAMP_SCALLOP_HEIGHT = 1.6      // lamp glow washes up and down the boards

// --- Firefly LED colour (canonical lock from docs/canonical/2-ceiling.md) ---
export const FIREFLY_COLOR = '#00FF00'

// --- Loofah wall ---
// Four visual prototypes behind `?loofah=`: two wall looks per concept
// images 06 / 07 / 08 (canonical doc 11) plus the earlier freestanding
// explorations.
//   'grid'      ordered grid of warm glowing cells in a slim dark
//               frame (image 06; close-up fibre read per image 08)
//   'fibrous'   wild loofah piece field with criss-crossed dark
//               sticks (image 07)
//   'clusters'  freestanding glowing sculptures in the forest
//   'corners'   sculptural corner columns
// Wall looks mount flush against `front-wall` inside the `forest` zone
// with an 8 mm surface-flush nudge. Loofah pieces are non-emissive —
// canonical doc 3 says "Light source MUST NEVER be visible to
// visitor"; the hidden warm backlight plane (or internal cylinder for
// the corner column) does all the visible work.
export const LOOFAH_WALL_Y_BASE = WAINSCOT_FRONT_H        // sits ABOVE the front-wall wainscoting, leaving it exposed
export const LOOFAH_WALL_HEIGHT = 2.4 - WAINSCOT_FRONT_H  // top stays at 2.4 m
export const LOOFAH_WALL_WIDTH = 4.5
export const LOOFAH_WALL_Z_START = 1.39          // centred along forest Z = 0..7.28
export const LOOFAH_WALL_Z_END = 5.89

export const LOOFAH_BACKLIGHT_COLOR = '#ffc890'  // soft warm amber
export const LOOFAH_BACKLIGHT_INTENSITY = 1.0    // dominant warm element vs cool, dark forest

// Locked at 0. Loofah pieces are lit by backlight transmission, never
// self-emissive. See canonical doc 3 line 17 — light source must never
// be visible to visitor. Do not raise without designer approval.
export const LOOFAH_FIBRE_EMISSIVE_INTENSITY = 0

export const LOOFAH_BAMBOO_GRID_SPACING = 0.4    // stick spacing in the corner cages
export const LOOFAH_BAMBOO_RADIUS = 0.008        // 16 mm diameter stick
export const LOOFAH_BAMBOO_COLOR = '#3a2a18'     // dark warm brown

// Grid look (concept image 06) — cell counts over the 4.5 × 2.4 m wall
// give roughly 0.56 × 0.6 m cells, matching the image's proportions.
// Per-cell brightness varies inside the min/max band so the grid reads
// hand-lit rather than uniform.
export const LOOFAH_GRID_COLS = 8
export const LOOFAH_GRID_ROWS = 4
export const LOOFAH_GRID_FRAME_T = 0.035         // frame bar cross-section
export const LOOFAH_GRID_FRAME_COLOR = '#241a10' // near-black warm wood
export const LOOFAH_GRID_CELL_BRIGHT_MIN = 0.75
export const LOOFAH_GRID_CELL_BRIGHT_MAX = 1.15

// Fibrous look (concept image 07) — criss-crossed dark sticks laid
// over the loofah piece field at random angles.
export const LOOFAH_STICK_COUNT = 26
export const LOOFAH_STICK_LENGTH_MIN = 1.0
export const LOOFAH_STICK_LENGTH_MAX = 2.6

// Base strip (concept image 12) — bright warm strip along the floor at
// the foot of the wall, on both wall looks.
export const LOOFAH_BASE_STRIP_HEIGHT = 0.04
export const LOOFAH_BASE_STRIP_DEPTH = 0.03
export const LOOFAH_BASE_STRIP_COLOR = '#fff0d8'
export const LOOFAH_BASE_STRIP_INTENSITY = 2.2

// --- Floor mist (concept image 12) ---
// Low fog layer drifting at floor level, experience mode only. Two
// stacked noise-driven sheets; opacity stays subtle so the mist reads
// as atmosphere, not smoke.
export const MIST_LAYER_HEIGHTS = [0.08, 0.2]    // sheet heights above floor
export const MIST_COLOR = '#cfc8ba'              // warm grey
export const MIST_OPACITY = 0.07                 // per sheet, before noise modulation
export const MIST_DRIFT_SPEED = 0.012            // noise scroll speed (slow drift)
export const MIST_NOISE_SCALE = 0.55             // patch size of the noise billows

export const LOOFAH_CLUSTER_SEED = 137           // distinct from panel seed 42 and branch seed 99
export const LOOFAH_CLUSTER_COUNT_WALL = 16      // (legacy, unused)

// Freestanding loofah sculptures (variant 2). Individual glowing
// sculptures scattered through the forest zone, each a small bamboo
// cage with loofah wrapped around it and a warm internal glow.
export const LOOFAH_SCULPTURE_COUNT = 7
export const LOOFAH_SCULPTURE_HEIGHT_MIN = 1.0
export const LOOFAH_SCULPTURE_HEIGHT_MAX = 2.5
export const LOOFAH_SCULPTURE_BASE_MIN = 0.12
export const LOOFAH_SCULPTURE_BASE_MAX = 0.25
export const LOOFAH_SCULPTURE_PIECES_MIN = 8
export const LOOFAH_SCULPTURE_PIECES_MAX = 14
export const LOOFAH_SCULPTURE_MIN_SPACING = 1.2
export const LOOFAH_SCULPTURE_GLOW_INTENSITY = 2.0
export const LOOFAH_SCULPTURE_GLOW_RADIUS = 0.03
export const LOOFAH_CLUSTER_COUNT_CORNER = 20    // variant 3 corner column

export const LOOFAH_CORNER_HEIGHT = 3.52         // floor to working ceiling
export const LOOFAH_CORNER_BASE_SIZE = 0.4
export const LOOFAH_CORNER_TOP_SIZE = 0.25
export const LOOFAH_CORNER_BACKLIGHT_INTENSITY = 2.5
export const LOOFAH_CORNER_INTERNAL_LIGHT_RADIUS = 0.04

// Loofah piece geometry (slice 14). Pieces are rounded boxes with per-
// piece scale drawn from these ranges. X axis is depth toward viewer
// (perpendicular to front-wall). Y is vertical. Z is along the wall.
// Pieces are deterministically seeded by piece index (LOOFAH_CLUSTER_SEED
// + 10 for size, + 20 for color, + 30 for the noise normal map).
export const LOOFAH_SIZE_X_RANGE = [0.05, 0.10]   // depth from wall
export const LOOFAH_SIZE_Y_RANGE = [0.15, 0.30]   // vertical height
export const LOOFAH_SIZE_Z_RANGE = [0.10, 0.20]   // width along wall
export const LOOFAH_NORMAL_SCALE = 0.6            // strength of fibrous normal map
export const LOOFAH_COLOR_JITTER_RANGE = 0.05     // R/G ±5% (B held tighter to keep warm tone)

// --- Cabinet face treatment (slice 15) ---
//
// Applied to all three cabinet-style partitions on all four faces each
// (forest, pathway, two short ends). Footprint and overall dimensions
// are NOT changed by this — purely a face treatment layered on the
// body boxes already defined in EntranceWallPartition.jsx.
//
// Column count per face is computed at build time from face length:
//   cols = round(face_length / CABINET_DRAWER_TARGET_WIDTH), min 1.
//
// On a 4.93 m face this lands 6 cols; on the 7.28 m pathway-partition-
// vertical face it lands 9 cols; on the 0.5 m end faces it lands 1.
export const CABINET_ROWS = 3
export const CABINET_DRAWER_TARGET_WIDTH = 0.8
export const CABINET_BEVEL_DEPTH = 0.005     // drawer face proud of body (m)
export const CABINET_BEVEL_WIDTH = 0.015     // inset border around each drawer (m)
export const CABINET_CUP_WIDTH = 0.10        // cup-pull horizontal extent (m)
export const CABINET_CUP_HEIGHT = 0.02       // cup-pull vertical extent (m)
export const CABINET_CUP_DEPTH = 0.01        // cup-pull recess depth (m, visual)
export const CABINET_BODY_COLOR = '#1f1d1c'  // dark stained wood, matches seating

// --- Seating zones ---
//
// PLACEHOLDER — final count, dimensions, and seat mix are install-day
// decisions with the carpenter. All 30 visitors must be seated (per
// the locked 5–30 capacity spec). The zone anchors below are kept for
// the placement exclusion logic (ceiling forms, lanterns, grove, and
// the loofah wall all avoid them). Seat geometry itself lives in the
// three seating variants (concept images 03 / 12 / 15) further down.

// Cube stools (concept image 03) — solid timber blocks, no cushion.
// Dark per the dark-room target frames (images 04 / 09 / 15); see
// canonical doc 11 stop-and-flag before changing the colour.
export const SEATING_CUBE_SIZE = 0.45      // X/Z footprint, square
export const SEATING_CUBE_H = 0.42         // seat height
export const SEATING_CUBE_COLOR = '#241f1a'
export const SEATING_CUBE_ROUGHNESS = 0.85

// Bench pad (shared by both bench designs, concept image 15) — the
// dark seat pad sitting on top of the frame / box body.
export const SEATING_BENCH_PAD_T = 0.06
export const SEATING_BENCH_PAD_COLOR = '#26211c'
export const SEATING_BENCH_PAD_ROUGHNESS = 0.95

// Zone placements (centre X, centre Z in world coordinates).
// Exclusion anchors only — ceiling forms, lanterns, grove stems, and
// loofah sculptures keep clear of these regardless of which seating
// variant is active. Seat lighting follows the actual seats, not these.
export const SEATING_ZONES = [
  { x: 4.2, z: 1.4 },   // zone 1, forest-entry side
  { x: 5.5, z: 4.0 },   // zone 2, central
  { x: 7.0, z: 5.6 },   // zone 3, loofah-wall side
]

// --- Seating variants (concept images 03 / 12 / 15) ---
//
// Three seating variants behind `?seating=`: 'cubes' (solid timber
// blocks, image 03), 'frame-stools' (open timber frames, image 12),
// 'benches' (low boxes, image 15). Each must accommodate the full
// 30-visitor capacity. Arrangement language is "campfire" — scattered
// clusters, low to the floor, informal pockets rather than theatre
// rows. All variants share the existing forest exclusion zones
// (entrance-wall-partition, pathway-partition-vertical, column,
// pathway, loofah corner columns).

// Cluster placement shared by 'cubes' and 'frame-stools' — 5 campfire
// clusters of 6 seats each, in a loose ring around each cluster centre.
// 30 seats total.
export const SEATING_STOOL_CLUSTERS = [
  { x: 3.2, z: 1.8 },
  { x: 5.6, z: 1.6 },
  { x: 4.0, z: 4.0 },
  { x: 6.8, z: 4.4 },
  { x: 5.6, z: 6.0 },
]
export const SEATING_STOOLS_PER_CLUSTER = 6
export const SEATING_STOOL_CLUSTER_RADIUS = 0.85
export const SEATING_STOOL_JITTER = 0.12
export const SEATING_STOOLS_RNG_SEED = 631

// Variant 'benches' — concept image 15: five benches in a symmetric
// horseshoe facing the loofah wall (the warm glowing panel is the
// focal point every seat faces). Two designs from the image:
//   slim  centre + two flanks — dark pad on a thin top frame carried
//         by slab legs at each end, open underneath
//   box   two outer corners — panelled chest on a recessed plinth,
//         dark pad on top
// `out` is the distance from the loofah wall surface into the room,
// `side` the offset along the wall from its centreline. Every bench
// turns to face the wall's centre (seatingPlacement.js does the math).
export const SEATING_BENCH_LAYOUT = [
  { kind: 'slim', out: 2.3, side: 0 },
  { kind: 'slim', out: 2.7, side: -1.7 },
  { kind: 'slim', out: 2.7, side: 1.7 },
  { kind: 'box',  out: 4.3, side: -2.5 },
  { kind: 'box',  out: 4.3, side: 2.5 },
]

// Slim bench
export const SEATING_BENCH_SLIM_LENGTH = 1.6
export const SEATING_BENCH_SLIM_DEPTH = 0.42
export const SEATING_BENCH_SLIM_HEIGHT = 0.45      // top of pad above floor
export const SEATING_BENCH_SLIM_FRAME_T = 0.04     // top frame slab under the pad
export const SEATING_BENCH_SLIM_LEG_T = 0.05       // slab leg thickness
export const SEATING_BENCH_SLIM_LEG_INSET = 0.1    // legs in from the bench ends

// Box bench
export const SEATING_BENCH_BOX_LENGTH = 1.35
export const SEATING_BENCH_BOX_DEPTH = 0.6
export const SEATING_BENCH_BOX_HEIGHT = 0.5        // top of pad above floor
export const SEATING_BENCH_BOX_PLINTH_H = 0.06     // recessed base (shadow gap at the floor)
export const SEATING_BENCH_BOX_PLINTH_INSET = 0.05
export const SEATING_BENCH_BOX_PANEL_MARGIN = 0.07 // frame border around each face panel

// Bench materials — warm grey body per the image; the brightness in
// the frame comes from the downbeams, not the material.
export const SEATING_BENCH_BODY_COLOR = '#6a6155'
export const SEATING_BENCH_BODY_ROUGHNESS = 0.7
export const SEATING_BENCH_PANEL_COLOR = '#5c5448' // inset face panels, box design
export const SEATING_BENCH_PLINTH_COLOR = '#181512'

// Variant 'frame-stools' — open-frame timber stools (concept image 12).
// Same cluster placement as 'cubes'. Light wood: four corner legs, low
// side rails, and a slatted top. Open sides read lighter than the
// solid cubes.
export const SEATING_FRAME_SIZE = 0.42         // X/Z footprint, square
export const SEATING_FRAME_H = 0.45            // seat height
export const SEATING_FRAME_LEG_T = 0.045       // leg cross-section
export const SEATING_FRAME_SLAT_COUNT = 3      // top slats
export const SEATING_FRAME_SLAT_T = 0.03       // slat thickness (Y)
export const SEATING_FRAME_RAIL_Y = 0.12       // side-rail height above floor
export const SEATING_FRAME_COLOR = '#9a7d57'   // light timber
export const SEATING_FRAME_ROUGHNESS = 0.8

// Spotlight geometry
export const SEATING_SPOT_Y = 3.4          // mounting Y. TBD when slice 7 ceiling lands; matches PATHWAY_POOL_HEIGHT for visual consistency.
export const SEATING_SPOT_CONE_ANGLE = Math.PI / 6   // 30° half-angle, 60° total cone
export const SEATING_SPOT_PENUMBRA = 0.4
export const SEATING_SPOT_DECAY = 1
export const SEATING_SPOT_DISTANCE = 6

// Spotlight light. Soft neutral white per concept image 15 (was warm
// amber before the per-seat downbeam redesign).
export const SEATING_SPOT_INTENSITY = 60
export const SEATING_SPOT_COLOR = '#e8e6df'

// Per-seat downbeams (concept image 15). Every seat sits under its own
// narrow visible beam — a thin additive cone from the ceiling plus a
// floor pool. Actual light contribution still comes from one wider
// spotLight per cluster/pocket so the live light count stays low.
export const SEAT_BEAM_TOP_RADIUS = 0.05               // fixture-end cone radius
export const SEAT_BEAM_POOL_RADIUS_STOOL = 0.42        // floor pool, cubes + frame stools
export const SEAT_BEAM_POOL_RADIUS_BENCH = 0.95        // floor pool, one beam per bench
// 'Clusters' beam mode: one wider beam per cluster/pocket instead of
// one per seat. Pool covers the whole campfire circle.
export const SEAT_BEAM_POOL_RADIUS_CLUSTER = 1.15

// Spotlight timeline behaviour.
// At full intensity from t = 0 through t = SEATING_SPOT_RAMP_START.
// Linear ramp down to zero from RAMP_START to RAMP_END.
// Off at t ≥ RAMP_END. The PHASES array in useTimeline.js puts the
// blue→darkness boundary at t = 0.75, which is RAMP_END.
export const SEATING_SPOT_RAMP_START = 0.6
export const SEATING_SPOT_RAMP_END = 0.75

// Visible spotlight geometry (slice 16). The bare three.js spotLight is
// a light source with no visible body; without fog or a volumetric pass
// the "spotlight" reads as nothing on its own. These constants drive a
// thin additive cone mesh + a floor pool disc that scale their opacity
// with the spot's current intensity ratio so the visible read tracks
// the lighting ramp.
// Cone opacity tuned for the per-seat downbeam redesign (30 beams):
// any camera angle looks through several cones, so each must stay
// faint or the additive stack whites out the frame. Was 0.18 when only
// 3 zone spots carried cones.
export const SPOTLIGHT_CONE_OPACITY = 0.08
export const SPOTLIGHT_POOL_OPACITY = 0.40
export const SPOTLIGHT_CONE_SEGMENTS = 32
export const SPOTLIGHT_POOL_Y_OFFSET = 0.005

// --- Wall glow dots (slice 17) ---
// Tiny warm-cream emissive spheres scattered across the top half of
// interior wall and partition faces. Ambient layer — NOT firefly
// behaviour targets. Each dot has its own slow breathe phase so the
// wall surface shimmers rather than pulses in unison.
export const WALL_DOT_DENSITY = 1.5              // dots per m² of eligible area
export const WALL_DOT_MIN_GAP = 0.45             // m, Poisson-disc minimum gap
export const WALL_DOT_RADIUS = 0.008             // 8 mm sphere
export const WALL_DOT_NUDGE = 0.008              // proud of real wall surface
export const WALL_DOT_DRAWER_FACE_PROUD = 0.013  // proud of partition body (sits on drawer face)
export const WALL_DOT_BAND_Y_MIN = 1.76
export const WALL_DOT_BAND_Y_MAX = 3.52
export const WALL_DOT_COLOR = '#00ff6a'          // firefly green, matches FireflyParticles
export const WALL_DOT_INTENSITY = 1.2
export const WALL_DOT_BREATHE_PERIOD = 25        // seconds
export const WALL_DOT_BREATHE_AMPLITUDE = 0.30
export const WALL_DOT_BASE_SEED = 829            // Park-Miller seed, distinct from existing seeds
// Wall dots stay ambient relative to the ceiling LEDs when a firefly
// behaviour drives them — multiplied into the per-dot opacity so the
// walls always read as supporting cast rather than equal players.
export const WALL_DOT_BEHAVIOUR_DIM = 0.6

// --- Sculptural ceiling ---
//
// PLACEHOLDER — final form vocabulary, count, distribution, and material
// vocabulary are determined by the paper mache prototyping weekend results
// and the carpenter visit. The constants below establish scale, density,
// and the uneven distribution principle for designer + carpenter
// reference. They are NOT a final ceiling commitment.
//
// Wake unit = firefly module (110 total, 16 LEDs each = 1,760 LEDs).
// Modules and forms are independent concepts: forms are visual
// containers, modules are functional wake units. One form may hold zero
// to four modules.
//
// Replaces the prior 25-panel placeholder spec (470 LEDs). Slice 7
// rebuild — see docs/canonical/2-ceiling.md.

// Form vocabulary and count
export const CEILING_FORM_COUNT = 40                         // SIM DEFAULT — install-day decision per canonical doc 2
export const CEILING_FORM_PRIMITIVES = ['ovoid', 'blade', 'lens', 'pod', 'patch']
export const CEILING_FORM_PRIMITIVE_WEIGHTS = [0.6, 0.2, 0.1, 0.05, 0.05]

// Form size range (longest dimension, metres)
export const CEILING_FORM_MIN_SIZE = 0.4
export const CEILING_FORM_MAX_SIZE = 2.0

// Form Y band (metres above floor)
export const CEILING_FORM_Y_MIN = 2.5     // 0.3 m clear of within-reach branches if active
export const CEILING_FORM_Y_MAX = 3.3     // 0.1 m below seating spot mount

// Tilt and rotation
export const CEILING_FORM_TILT_MAX = Math.PI / 6   // 30° max tilt off horizontal
// Y rotation is full 0–2π per form, applied procedurally.

// Material
export const CEILING_FORM_COLOR = '#1a1a1a'
export const CEILING_FORM_ROUGHNESS = 0.85
// Structurally emissive but visually matte at ambient 0.01. Locked at 0
// to keep forms felt-not-seen — only the green LEDs read in the dark
// phase. Do not raise without designer approval.
export const CEILING_FORM_EMISSIVE_INTENSITY = 0

// Distribution algorithm
export const CEILING_RNG_SEED = 211                          // SIM DEFAULT — re-roll candidate if clustering reads badly
export const CEILING_CLUSTER_CENTRES = 3                     // SIM DEFAULT — install-day decision per canonical doc 2
export const CEILING_CLUSTER_BIAS = 0.5                      // tuned from 0.7 — meeting notes call for scattered + weightless, not dense canopy directly overhead
export const CEILING_CLUSTER_RADIUS = 1.5                    // metres — "near" a cluster centre
export const CEILING_CLUSTER_OFFSET = 1.2                    // cluster centres sit off-axis from seating zones by this distance
export const CEILING_CLUSTER_MIN_DIST_FROM_LOOFAH = 1.8      // min distance from loofah wall plane (X = 8.5) for any cluster centre
export const CEILING_FORM_MIN_GAP = 0.7                      // min centroid-to-centroid distance
export const CEILING_SEATING_FORM_SKIP_RADIUS = 1.0          // skip form candidates within this XZ radius of a seating zone centre

// Pathway extension
export const CEILING_EXTENDS_OVER_PATHWAY = false            // SIM DEFAULT — install-day decision per canonical doc 2 line 123

// Module population (locked from canonical doc 2)
export const CEILING_MODULES_TOTAL = 110
export const CEILING_LEDS_PER_MODULE = 16
export const CEILING_LEDS_TOTAL = CEILING_MODULES_TOTAL * CEILING_LEDS_PER_MODULE   // 1,760

// Module distribution principle — procedurally balanced in ceilingForms.js
// to total exactly CEILING_MODULES_TOTAL. Aim: ~12.5% dark forms, ~50%
// one module, ~25% two, ~10% three, ~2.5% four. Algorithm tops up the
// non-dark forms after seeding to reach 110.
// SIM DEFAULT — install-day distribution depends on real form fabrication.

// LED positioning within a module
export const CEILING_MODULE_RADIUS = 0.25   // 16 LEDs cluster within this radius of module anchor
export const CEILING_LED_MIN_GAP = 0.04     // min LED-to-LED angular gap on form surface

// --- Ceiling form vocabularies ---
//
// Three-variant comparison ('discs' | 'oblong' | 'mixed') for the
// sculptural ceiling. Only the form vocabulary changes between variants
// — placement, module distribution, LED count, material, and cluster
// algorithm are shared. See ceilingPrimitives.js for the per-primitive
// scale and sampling logic.
//
// 'discs' is the locked direction per concept images 07 / 09 / 10 / 13
// (canonical doc 11): flat rounded plates of varied diameters. It
// replaced the earlier flat-square vocabulary. 'oblong' and 'mixed'
// stay for comparison.

// Disc sub-primitive diameter ranges (m)
export const CEILING_DISC_SMALL_MIN = 0.4
export const CEILING_DISC_SMALL_MAX = 0.7
export const CEILING_DISC_MEDIUM_MIN = 0.7
export const CEILING_DISC_MEDIUM_MAX = 1.1
export const CEILING_DISC_LARGE_MIN = 1.1
export const CEILING_DISC_LARGE_MAX = 1.6

// Disc thickness (Y dimension) — fixed per size class.
export const CEILING_DISC_THICKNESS = 0.04
export const CEILING_DISC_THICKNESS_LARGE = 0.05

// Disc primitive list + weighted-lottery weights (parallel arrays,
// matches the existing oblong pattern). The concept images show mostly
// medium and large plates, so the lottery leans that way.
export const CEILING_DISC_PRIMITIVES = [
  'small-disc',
  'medium-disc',
  'large-disc',
]
export const CEILING_DISC_PRIMITIVE_WEIGHTS = [0.3, 0.45, 0.25]

// Variant identifiers used by URL param `?ceiling=`.
export const CEILING_VARIANTS = ['discs', 'oblong', 'mixed']
export const CEILING_VARIANT_DEFAULT = 'discs'

// Front-wall clearance for ceiling forms (slice 9 tune). Form edges
// must not pass this X plane — keeps the front-wall / loofah-wall area
// visually clear regardless of form vocabulary.
export const CEILING_FORM_MAX_EDGE_X = 8.5

// --- Blackout curtains (slice 10) ---
//
// Three curtains: window, entrance, exit. All hang on tracks, floor to
// working ceiling, in dark navy theatrical fabric. The 5–10mm surface-
// flush rule (for geometry flush against walls) does NOT apply here —
// curtains hang ~40mm off the wall on their track, so they read as
// visibly hanging rather than buried in the wall surface.
export const CURTAIN_OFFSET = 0.04                                    // 40mm inward from wall surface

// window-curtain — full width along window-wall (Z = ROOM.D face)
export const WINDOW_CURTAIN_WIDTH = ROOM.W                            // 8.83
export const WINDOW_CURTAIN_HEIGHT = ROOM.H                           // 3.52
export const WINDOW_CURTAIN_CENTER_X = ROOM.W / 2
export const WINDOW_CURTAIN_CENTER_Y = ROOM.H / 2
export const WINDOW_CURTAIN_CENTER_Z = ROOM.D - WALL_T - CURTAIN_OFFSET   // 8.62

// entrance-curtain — covers visitor entry gap on entrance-wall (Z = 0)
export const ENTRANCE_CURTAIN_WIDTH = 1.5
export const ENTRANCE_CURTAIN_HEIGHT = ROOM.H
export const ENTRANCE_CURTAIN_CENTER_X = 0.75                         // (0 + 1.5) / 2
export const ENTRANCE_CURTAIN_CENTER_Y = ROOM.H / 2
export const ENTRANCE_CURTAIN_CENTER_Z = CURTAIN_OFFSET               // 0.04

// exit-curtain — covers exit/gift-area opening on entrance-wall (Z = 0)
export const EXIT_CURTAIN_WIDTH = 2.1                                 // 8.83 - 6.73
export const EXIT_CURTAIN_HEIGHT = ROOM.H
export const EXIT_CURTAIN_CENTER_X = 7.78                             // (6.73 + 8.83) / 2
export const EXIT_CURTAIN_CENTER_Y = ROOM.H / 2
export const EXIT_CURTAIN_CENTER_Z = CURTAIN_OFFSET                   // 0.04

// --- Flock (proposal v3: fireflies-flock — rebuilt to concept image 13) ---
//
// Image 13 vocabulary: dense vertical strings of green points draping
// the forest's boundary walls like rain, plus a glowing field of green
// points just under the working ceiling with large dark disc
// silhouettes floating in front of it. The 110-module / 1,760-LED
// invariant is split between the two surfaces: one module per wall
// string (16 LEDs down the string) and the remainder scattered as the
// ceiling field.
export const FLOCK_RNG_SEED = 419
export const FLOCK_STRING_MODULES = 60                                // wall strings, 16 LEDs each
export const FLOCK_FIELD_MODULES = 50                                 // ceiling-field clusters, 16 LEDs each
export const FLOCK_STRING_LENGTH_MIN = 1.6                            // metres of drop from the ceiling
export const FLOCK_STRING_LENGTH_MAX = 3.2
export const FLOCK_STRING_WALL_OFFSET = 0.04                          // string distance off the wall face
export const FLOCK_STRING_LED_JITTER = 0.03                           // per-LED scatter along/off the string
export const FLOCK_FIELD_Y_MIN = 3.36                                 // ceiling-field band
export const FLOCK_FIELD_Y_MAX = 3.5
export const FLOCK_FIELD_SPREAD = 0.45                                // cluster radius of one field module
export const FLOCK_THREAD_RADIUS = 0.001                              // 2 mm fine thread
export const FLOCK_THREAD_COLOR = '#222222'
export const FLOCK_THREAD_EMISSIVE_INTENSITY = 0.05
// Flock LED emissive intensity, decoupled from the ceiling LED value
// so the close-up flock-looking-up view does not bloom into fat halos
// while the flock-side distant view keeps its luminous band reading.
export const FLOCK_LED_EMISSIVE_INTENSITY = 3
// Large dark disc silhouettes floating against the glowing field.
export const FLOCK_SILHOUETTE_COUNT = 6
export const FLOCK_SILHOUETTE_DIAMETER_MIN = 1.4
export const FLOCK_SILHOUETTE_DIAMETER_MAX = 2.6
export const FLOCK_SILHOUETTE_THICKNESS = 0.05
export const FLOCK_SILHOUETTE_Y = 3.26                                // just below the field band
export const FLOCK_SILHOUETTE_MIN_GAP = 0.5                           // edge-to-edge between discs
export const FLOCK_SILHOUETTE_COLOR = '#101010'

// --- Grove (proposal v5: fireflies-grove) ---
//
// 110 floor-rooted stems, 1:1 with firefly modules. Each stem hosts
// 16 LEDs clustered in its upper portion. Reads as fireflies rising
// from grass-like blades, vertical glow at the tip of each blade.
export const GROVE_RNG_SEED = 8810
export const GROVE_STEM_COUNT = 110
export const GROVE_STEM_HEIGHT_MIN = 0.8                              // metres
export const GROVE_STEM_HEIGHT_MAX = 2.4
export const GROVE_STEM_DIAMETER = 0.008                              // 8 mm thin rod
export const GROVE_STEM_COLOR = '#1a1a1a'
export const GROVE_STEM_ROUGHNESS = 0.7
export const GROVE_STEM_METALNESS = 0.0
export const GROVE_STEM_TILT_MAX_DEGREES = 5
export const GROVE_MIN_STEM_SPACING = 0.4                             // metres
export const GROVE_LED_PER_STEM = 16
export const GROVE_LED_CLUSTER_FRACTION = 0.3                         // upper 30% of stem height
// LED lateral spread around the stem axis. Wider than the stem itself
// so the cluster reads as a small swarm at the blade tip rather than a
// glow line embedded on the rod.
export const GROVE_LED_CLUSTER_RADIUS = 0.08
export const GROVE_LED_COLOR = '#00ff00'
export const GROVE_LED_EMISSIVE_INTENSITY = 5

// --- Lantern (proposal v6: fireflies-lanterns) ---
//
// 15 translucent fibre pillars, three height tiers, 5 pillars per
// tier. LEDs stacked vertically along each pillar centre axis,
// glowing through the translucent envelope.
export const LANTERN_RNG_SEED = 8811
export const LANTERN_PILLAR_COUNT = 15
export const LANTERN_PER_TIER = 5
export const LANTERN_TIER_HEIGHTS = [1.2, 1.8, 2.4]                   // metres
export const LANTERN_DIAMETER = 0.2
export const LANTERN_COLOR = '#f5e6c8'                                // warm cream
export const LANTERN_OPACITY = 1.0
export const LANTERN_ROUGHNESS = 0.6
export const LANTERN_METALNESS = 0.0
export const LANTERN_MIN_PILLAR_SPACING = 1.2                         // metres
export const LANTERN_LED_COLOR = '#00ff00'
export const LANTERN_LED_EMISSIVE_INTENSITY = 5
export const LANTERN_LED_TOTAL = 1760
export const LANTERN_LED_BASE_PER_PILLAR = 117                        // 10 pillars carry this count
export const LANTERN_LED_REMAINDER_PER_PILLAR = 118                   // 5 pillars carry this count
// LEDs erupt above the pillar cap as a small volumetric cluster
// rather than running vertically inside the opaque body.
export const LANTERN_LED_CLUSTER_RADIUS = 0.12                        // metres
export const LANTERN_LED_CLUSTER_HEIGHT = 0.2                         // metres

// --- Nesting pebble ceiling (proposal v4: fireflies-nesting — rebuilt to concept image 09) ---
//
// Image 09 vocabulary: the whole forest ceiling covered in dark
// rounded pebble-like forms, each studded with green points set into
// its underside. The pebbles replace the regular sculptural ceiling
// for this proposal; seating below comes from the seating switcher
// (dark cubes in the target frame). All 110 modules / 1,760 LEDs live
// on the pebble undersides.
export const NESTING_RNG_SEED = 523
export const NESTING_PEBBLE_COUNT = 22
export const NESTING_PEBBLE_DIAMETER_MIN = 0.6
export const NESTING_PEBBLE_DIAMETER_MAX = 1.5
export const NESTING_PEBBLE_HEIGHT_RATIO_MIN = 0.3                    // pebble height / diameter
export const NESTING_PEBBLE_HEIGHT_RATIO_MAX = 0.45
export const NESTING_PEBBLE_SQUASH_MIN = 0.75                         // footprint Z/X ratio (1 = round)
export const NESTING_PEBBLE_DROP_MAX = 0.35                           // hang depth below the working ceiling
export const NESTING_PEBBLE_EDGE_GAP = 0.05                           // min edge-to-edge between pebbles
export const NESTING_PEBBLE_COLOR = '#161616'
export const NESTING_LED_MIN_SPACING = 0.06
export const NESTING_LED_COLOR = '#00ff00'
export const NESTING_LED_EMISSIVE_INTENSITY = 5
