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
export const D1_Z = 2.5,  D1_W = 0.9,  D1_H = 2.1   // ESTIMATE
export const D2_Z = 5.0,  D2_W = 0.9,  D2_H = 2.1   // ESTIMATE

// --- Window-wall doors and windows (Z = ROOM.D face) ---
// All ESTIMATE — exact positions and sizes confirm on building visit.
export const WW_DOOR1_X = 0.95, WW_DOOR1_W = 0.9, WW_DOOR1_H = 2.1                   // ESTIMATE
export const WW_DOOR2_X = 3.95, WW_DOOR2_W = 0.9, WW_DOOR2_H = 2.1                   // ESTIMATE
export const WW_WIN1_X  = 2.3,  WW_WIN1_W  = 1.0, WW_WIN1_H  = 1.5, WW_WIN1_SILL = 0.9 // ESTIMATE
export const WW_WIN2_X  = 5.3,  WW_WIN2_W  = 1.0, WW_WIN2_H  = 1.5, WW_WIN2_SILL = 0.9 // ESTIMATE

// --- Floor ---
// Interlocking foam-mat tiles (per canonical doc 1). Matte, dark, no
// reflectivity. The seam between tiles renders at FLOOR_COLOR scaled
// by FLOOR_SEAM_DARKEN.
export const FLOOR_TILE_SIZE = 0.6              // metres per tile edge
export const FLOOR_COLOR = '#1a1a1a'             // near-black, matches wall tone (placeholder)
export const FLOOR_EMISSIVE_INTENSITY = 0.05    // self-emissive lift for visibility at ambient 0.01
export const FLOOR_SEAM_DARKEN = 0.3             // seam colour = FLOOR_COLOR × this factor

// --- Pathway lighting ---
// Wayfinding lights along the L-shaped `pathway` floor edges. Three
// visual prototypes (strip, rope, pools) share the colour and the
// height-above-floor; per-prototype thickness and intensity sit beside
// them. All three are driven by the `?wayfind=` URL param. Default off.
export const PATHWAY_LED_HEIGHT = 0.02           // centre Y above floor for strip and rope
export const PATHWAY_LED_COLOR = '#fff4e0'       // warm white
export const PATHWAY_LED_INTENSITY = 0.7         // baseline emissive intensity (strip)

export const PATHWAY_STRIP_THICKNESS = 0.015     // strip cross-section (square)

// Variant B: painted floor arrows lit by overhead spots. Three arrows
// mark the three decision points along the L-shaped pathway.
// Arrows are matte paint (NOT emissive) so they only read when a spot
// reaches them — that is the wayfinding signal.
export const PATHWAY_ARROW_LENGTH = 0.6          // tip-to-tail length
export const PATHWAY_ARROW_WIDTH = 0.3           // across-the-arrow span
export const PATHWAY_ARROW_COLOR = '#e8e0d0'     // matte off-white paint
export const PATHWAY_ARROW_SPOT_HEIGHT = 3.4     // overhead fixture Y (just below working ceiling)
// Proposed starting values — both flagged for the tuning pass after
// designer review of the recapture.
//   intensity 10 with decay 1 and distance 5 reaches the floor at a
//     quiet illuminance — visible but not theatrical.
//   angle 0.15 rad (~8.6° half-angle) gives a cone radius at floor
//     of ~3.4 × tan(0.15) ≈ 0.51 m, only slightly wider than the
//     arrow's 0.3 m half-length.
export const PATHWAY_ARROW_SPOT_INTENSITY = 10
export const PATHWAY_ARROW_SPOT_ANGLE = 0.15

export const PATHWAY_POOL_COUNT = 6              // total pools along the L (3 per leg)
export const PATHWAY_POOL_RADIUS = 0.4           // pool disc radius on the floor
export const PATHWAY_POOL_INTENSITY = 2.0        // brighter than strip/rope so pools read as discrete
export const PATHWAY_POOL_HEIGHT = 3.4           // overhead fixture Y (just below working ceiling at 3.52)

// --- Firefly LED colour (canonical lock from docs/canonical/2-ceiling.md) ---
export const FIREFLY_COLOR = '#00FF00'

// --- Loofah wall ---
// Three visual prototypes behind `?loofah=`. All three mount flush
// against `front-wall` inside the `forest` zone with an 8 mm surface-
// flush nudge. Loofah pieces are non-emissive — canonical doc 3 says
// "Light source MUST NEVER be visible to visitor"; the hidden warm
// backlight plane (or internal cylinder for the corner column) does
// all the visible work.
export const LOOFAH_WALL_HEIGHT = 2.4
export const LOOFAH_WALL_WIDTH = 4.5
export const LOOFAH_WALL_Y_BASE = 0              // wall grounds to floor
export const LOOFAH_WALL_Z_START = 1.39          // centred along forest Z = 0..7.28
export const LOOFAH_WALL_Z_END = 5.89

export const LOOFAH_BACKLIGHT_COLOR = '#ffc890'  // soft warm amber
export const LOOFAH_BACKLIGHT_INTENSITY = 1.0    // dominant warm element vs cool, dark forest

// Locked at 0. Loofah pieces are lit by backlight transmission, never
// self-emissive. See canonical doc 3 line 17 — light source must never
// be visible to visitor. Do not raise without designer approval.
export const LOOFAH_FIBRE_EMISSIVE_INTENSITY = 0

export const LOOFAH_BAMBOO_GRID_SPACING = 0.4    // stick spacing in variants 1 and 3
export const LOOFAH_BAMBOO_RADIUS = 0.008        // 16 mm diameter stick
export const LOOFAH_BAMBOO_COLOR = '#3a2a18'     // dark warm brown

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
// PLACEHOLDER — final count, dimensions, and bench-vs-stool mix are
// install-day decisions with the carpenter. All 30 visitors must be
// seated (per the locked 5–30 capacity spec). The 6 boxes in 3 zones
// below establish scale, spacing, and spotlight pool behaviour for
// designer + carpenter reference. They are NOT a capacity commitment.
//
// Plywood storage box stools with cushioned tops, arranged in `forest`
// and marked by overhead spotlights. Count, placement, exact
// dimensions, and the stool/bench mix are simulation defaults — to be
// confirmed with carpenter on install day.

// Box geometry
export const SEATING_BOX_W = 0.55          // X width, within locked 50–60 cm range
export const SEATING_BOX_D = 0.55          // Z depth, square footprint
export const SEATING_BOX_H = 0.42          // Y height to top of plywood (before cushion)
export const SEATING_BOX_GAP = 0.2         // gap between adjacent box edges within a zone
export const SEATING_BOX_COLOR = '#1f1d1c'
export const SEATING_BOX_ROUGHNESS = 0.85

// Cushion
export const SEATING_CUSHION_T = 0.03      // Y thickness above box top
export const SEATING_CUSHION_COLOR = '#3a2e24'
export const SEATING_CUSHION_ROUGHNESS = 0.95

// Zone placements (centre X, centre Z in world coordinates).
// Used by SeatingSpotlights as overhead task-light targets — these
// remain fixed regardless of which seating variant is active.
export const SEATING_ZONES = [
  { x: 4.2, z: 1.4 },   // zone 1, forest-entry side
  { x: 5.5, z: 4.0 },   // zone 2, central
  { x: 7.0, z: 5.6 },   // zone 3, loofah-wall side
]

// --- Seating variants (slice 18) ---
//
// Three seating variants behind `?seating=`. Each must accommodate the
// full 30-visitor capacity. Arrangement language is "campfire" —
// scattered clusters, low to the floor, informal pockets rather than
// theatre rows. All variants share the existing forest exclusion zones
// (entrance-wall-partition, pathway-partition-vertical, column,
// pathway, loofah corner columns).

// Variant 'stools' — 5 campfire clusters of 6 plywood box-stools each.
// Stools form a loose ring around each cluster centre. 30 stools total.
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

// Variant 'benches' — 3 cluster pockets of 2 benches each, opened at
// varied angles. Backless plywood, 5 visitors per bench × 6 benches = 30.
export const SEATING_BENCH_LENGTH = 1.8
export const SEATING_BENCH_DEPTH = 0.35
export const SEATING_BENCH_HEIGHT = 0.42
export const SEATING_BENCH_COLOR = '#1f1d1c'
export const SEATING_BENCH_ROUGHNESS = 0.85
// Each pocket: centre + an open-V angle. The two benches face slightly
// inward across the pocket; openAngle rotates the whole pocket so the
// open V points in a different direction in each spot.
export const SEATING_BENCH_POCKETS = [
  { x: 3.6, z: 2.2, openAngle:  0.5 },
  { x: 5.6, z: 4.2, openAngle: -0.8 },
  { x: 6.6, z: 6.0, openAngle:  1.1 },
]
export const SEATING_BENCH_PAIR_GAP = 1.6
export const SEATING_BENCH_FACE_TILT = 0.35

// Variant 'pillows' — large soft floor bolsters per design-reference-14.
// 4 clusters of 4 parallel bolsters; visitors lie between adjacent
// bolsters (3 channels per cluster × 4 = 12 lying), with the remaining
// 18 visitors sitting on bolster tops or in cluster gaps. 30 capacity.
export const SEATING_PILLOW_DIAMETER = 0.45
export const SEATING_PILLOW_LENGTH = 2.0
export const SEATING_PILLOW_GAP = 0.65
export const SEATING_PILLOWS_PER_CLUSTER = 4
export const SEATING_PILLOW_COLOR = '#3a2e24'
export const SEATING_PILLOW_ROUGHNESS = 0.95
export const SEATING_PILLOW_CLUSTERS = [
  { x: 3.6, z: 2.0, rotY:  0.2 },
  { x: 5.2, z: 4.4, rotY:  0.9 },
  { x: 7.0, z: 2.4, rotY: -0.5 },
  { x: 6.4, z: 5.8, rotY:  1.3 },
]

// Spotlight geometry
export const SEATING_SPOT_Y = 3.4          // mounting Y. TBD when slice 7 ceiling lands; matches PATHWAY_POOL_HEIGHT for visual consistency.
export const SEATING_SPOT_CONE_ANGLE = Math.PI / 6   // 30° half-angle, 60° total cone
export const SEATING_SPOT_PENUMBRA = 0.4
export const SEATING_SPOT_DECAY = 1
export const SEATING_SPOT_DISTANCE = 6

// Spotlight light
export const SEATING_SPOT_INTENSITY = 60
export const SEATING_SPOT_COLOR = '#ffd8a0'

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
export const SPOTLIGHT_CONE_OPACITY = 0.18
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

// --- Ceiling form vocabularies (slice 9) ---
//
// Three-variant comparison ('flat' | 'oblong' | 'mixed') for the
// sculptural ceiling. Only the form vocabulary changes between variants
// — placement, module distribution, LED count, material, and cluster
// algorithm are shared. See ceilingPrimitives.js for the per-primitive
// scale and sampling logic.

// Flat-square sub-primitive size ranges (longest horizontal edge, m)
export const CEILING_FLAT_SMALL_MIN = 0.4
export const CEILING_FLAT_SMALL_MAX = 0.7
export const CEILING_FLAT_MEDIUM_MIN = 0.7
export const CEILING_FLAT_MEDIUM_MAX = 1.1
export const CEILING_FLAT_LARGE_MIN = 1.1
export const CEILING_FLAT_LARGE_MAX = 1.6
export const CEILING_FLAT_RECTANGLE_MIN = 1.2
export const CEILING_FLAT_RECTANGLE_MAX = 1.8

// Slab thickness (Y dimension) — fixed per size class.
export const CEILING_FLAT_THICKNESS = 0.04
export const CEILING_FLAT_THICKNESS_LARGE = 0.05

// Flat primitive list + weighted-lottery weights (parallel arrays,
// matches the existing oblong pattern).
export const CEILING_FLAT_PRIMITIVES = [
  'small-square',
  'medium-square',
  'large-square',
  'wide-rectangle',
  'tall-rectangle',
]
export const CEILING_FLAT_PRIMITIVE_WEIGHTS = [0.6, 0.2, 0.1, 0.05, 0.05]

// Variant identifiers used by URL param `?ceiling=`.
export const CEILING_VARIANTS = ['flat', 'oblong', 'mixed']
export const CEILING_VARIANT_DEFAULT = 'oblong'

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

// --- Flock hangers (proposal v3: fireflies-flock) ---
//
// 110 modules individually suspended on fine threads from the working
// ceiling, forming an emergent flock shape in the middle volume.
export const FLOCK_RNG_SEED = 419
export const FLOCK_MODULE_COUNT = 110
export const FLOCK_Y_MIN = 1.5
export const FLOCK_Y_MAX = 3.4
export const FLOCK_Y_BIAS_CENTER = 2.6
export const FLOCK_Y_SIGMA = 0.4
export const FLOCK_THREAD_RADIUS = 0.001                              // 2 mm fine thread
export const FLOCK_THREAD_COLOR = '#222222'
export const FLOCK_THREAD_EMISSIVE_INTENSITY = 0.05
export const FLOCK_GRID_SPACING = 0.5
export const FLOCK_GRID_JITTER = 0.2
// Flock LED emissive intensity, decoupled from the ceiling LED value
// so the close-up flock-looking-up view does not bloom into fat halos
// while the flock-side distant view keeps its luminous band reading.
export const FLOCK_LED_EMISSIVE_INTENSITY = 3

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

// --- Nesting hybrid LED placement (proposal v4: fireflies-nesting, hybrid mode) ---
//
// 15% of total LEDs (264) on bolster upper surfaces, split deterministically
// across the runtime-resolved bolster count (6 to 8). Remaining 85%
// (1,496) stay on the ceiling forms. Ceiling renderer truncates its
// own cached output at the new count.
export const NESTING_HYBRID_LED_TOTAL_BOLSTERS = 264
export const NESTING_HYBRID_LED_TOTAL_CEILING = 1496
export const NESTING_HYBRID_LED_MIN_SPACING = 0.06
export const NESTING_HYBRID_LED_COLOR = '#00ff00'
export const NESTING_HYBRID_LED_EMISSIVE_INTENSITY = 5

// --- Nesting forms (proposal v4: fireflies-nesting) ---
//
// Large soft bolster cushions on the floor. Visitors lie between them
// and gaze straight up at the firefly panels. LEDs stay on the
// ceiling panels.
export const NESTING_RNG_SEED = 523
export const NESTING_CLUSTER_CENTERS = [
  { x: 4.0, z: 2.5 },
  { x: 6.5, z: 4.5 },
]
export const NESTING_PER_CLUSTER_MIN = 3
export const NESTING_PER_CLUSTER_MAX = 4
export const NESTING_GAP = 0.6                                        // gap between bolsters for a person
export const NESTING_LENGTH_MIN = 1.5
export const NESTING_LENGTH_MAX = 2.5
export const NESTING_RADIUS_MIN = 0.2
export const NESTING_RADIUS_MAX = 0.35
export const NESTING_COLOR = '#3a2e24'
export const NESTING_EMISSIVE_INTENSITY = 0.12
export const NESTING_ROUGHNESS = 0.95
