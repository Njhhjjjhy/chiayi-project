# Room spec – canonical reference

## Status

Canonical. Every build prompt, simulation component, and proposal MUST use the values, names, and rules defined here. Do not infer values not listed. Do not substitute. If a value is missing, stop and flag.

## Location

Nanghia, Laiji Village, Alishan Township, Chiayi, Taiwan.

## Coordinate system (simulation)

- Origin (0, 0, 0): bottom-left corner of the exhibition area floor – corner where `back-wall` meets the `entrance-wall` line.
- X axis: along the `entrance-wall` line, from `back-wall` toward `front-wall`. Positive X → `front-wall`.
- Y axis: vertical. Positive Y → up.
- Z axis: from `entrance-wall` toward `window-wall`. Positive Z → `window-wall`.
- All dimensions in metres. Y=0 is floor level.

## Dimensions

- Width (X): 8.83
- Depth (Z): 8.78
- Total ceiling height (Y): 4.2
- Working ceiling height after beams (Y): 3.52
- Plenum gap above working ceiling: 0.68 (for wiring, mounts, fixtures)

## Wall identifiers (kebab-case, in backticks in code)

- `back-wall` – X=0, full depth (Z=0 to Z=8.78). Real wall. Contains `D1` and `D2`. No windows.
- `front-wall` – X=8.83, full depth (Z=0 to Z=8.78). Real wall. No doors, no windows. Carries the loofah wall element.
- `entrance-wall` – Z=0, full width (X=0 to X=8.83). NOT a real wall. Open side of building. Model only as the three cabinet partition elements defined below.
- `window-wall` – Z=8.78, full width (X=0 to X=8.83). Real wall. Contains windows and two doors leading outside. Covered by blackout curtain during operation.

No compass directions. No alternative names. No abbreviations.

## Column

- Structural, existing, cannot be moved.
- Position: X=6.43 (= 8.83 − 2.4 from `front-wall`), Z=0.
- Footprint: estimated 0.3 × 0.3. Flag if exact size matters.
- Height: Y=0 to Y=4.2 (full structural height).
- Render: solid rectangular column, matte dark finish.
- Creates two openings along `entrance-wall` line:
  - X=0 to X=6.43: closed by entrance-wall partition EXCEPT 1.5m entry gap at `back-wall` end (X=0 to X=1.5).
  - X=6.73 to X=8.83: fully open, 2.4m wide. Exit/gift area.

## Partitions (all cabinet-style)

All three partitions are cabinet structures. NOT thin movable walls. Plywood, matte near-black, with internal storage for wiring/lighting/sound/operational gear. Cabinet thickness: 0.4–0.6 placeholder (carpenter to confirm). All run floor to working ceiling: Y=0 to Y=3.52.

### 1. `entrance-wall-partition`

- Along Z=0.
- X=1.5 to X=6.43 (column left face).
- Entry gap: X=0 to X=1.5 (open).
- Exit gap: X=6.73 to X=8.83 (open).

### 2. `pathway-partition-vertical`

- Parallel to `back-wall`.
- X=1.5, from Z=0 to Z=7.28.
- Separates vertical leg of `pathway` from `forest`.

### 3. `pathway-partition-horizontal`

- Parallel to `window-wall`.
- Z=7.28 (1.5m from `window-wall`), from X=1.5 to X=6.43.
- Does NOT extend to `front-wall`. Ends at X=6.43.
- Forest entry opening: X=6.43 to X=8.83 at Z=7.28.

## Floor

- Interlocking foam mat tiles throughout exhibition area.
- Dark, matte, textured. Tile colour `#1a1a1a` matching wall tone.
- Tile size 0.6 × 0.6m default. Square grid layout, not interlocking-edge geometry in simulation.
- LOCKED design direction as of 23 May 2026. Replaces the previous marble floor direction completely.
- Shoes-on throughout the experience. No shoe removal zone.
- Foam is matte and absorbs light. The previous "marble doubles the ceiling LED canopy" reasoning no longer applies. Foam does not reflect.
- Simulation: procedural texture, no external assets. Roughness 1.0, metalness 0.0, no reflectivity.

## Zones (logical, not geometry)

### `pathway`

- L-shaped, 1.5m wide.
- Vertical leg: X=0 to X=1.5, Z=0 to Z=8.78.
- Horizontal leg: X=0 to X=6.43, Z=7.28 to Z=8.78.
- Visitor entry: 1.5m gap at X=0 to X=1.5, Z=0.
- Contains: information panels on `back-wall` (X=0) and `window-wall` (Z=8.78) faces; LED strip lighting along floor edges.
- Walking length: ~15.2m.
- Walking time: 5–7 minutes.

### `forest`

- Everything inside exhibition area NOT in `pathway` or `exit-gift-area`.
- Bounds: X=1.5 to X=8.83, Z=0 to Z=7.28.
- Dimensions: 7.33 × 7.28.
- Contains: sculptural ceiling, firefly LED system, IR sensor array, loofah wall, seating boxes.

### `exit-gift-area`

- X=6.43 to X=8.83 at Z=0.
- Width: 2.4. Fully open, no partition.
- Used for gift sales and post-experience interaction.

## Doors

### `back-wall` doors (X=0 face)

- `D1`: estimated Z=2.5, width ~0.9. Existing. Flag: positions unconfirmed.
- `D2`: estimated Z=5.0, width ~0.9. Existing. Flag: positions unconfirmed.
- Staff access and emergency egress only. Not part of visitor route.

### `window-wall` doors (Z=8.78 face)

- Door 1: estimated X=0.5 to X=1.4 (inside pathway). Width ~0.9.
- Door 2: estimated X=3.5 to X=4.4. Width ~0.9.
- Flag: positions unconfirmed.

## Windows

### `window-wall` windows (Z=8.78 face)

- Window 1: estimated X=1.8 to X=2.8 (inside pathway). Width ~1.0.
- Window 2: estimated X=4.8 to X=5.8 (inside forest). Width ~1.0.
- All covered by blackout curtain during operation.
- Flag: positions unconfirmed.

## Blackout curtains

All three curtains: dark blue theatrical fabric, floor to working ceiling (Y=0 to Y=3.52), mounted on tracks (NOT fixed partitions). Fire-resistant or fire-resistant treated. Commercial space requirement, non-negotiable. Default state during operation: closed (full light block).

Backup fallback: roll-down tarp if curtains insufficient.

Mounting: curtains hang on tracks approximately 40mm inward from the wall surface. The 5–10mm surface-flush rule (for geometry flush against walls) does NOT apply to hanging fabric on tracks.

### `window-curtain`

- Position: Z=8.78 face.
- Covers all windows on `window-wall`.
- Width: full wall (X=0 to X=8.83).
- Height: Y=0 to Y=3.52.

### `entrance-curtain`

- Position: Z=0 plane, at the visitor entry gap.
- X range: X=0 to X=1.5.
- Width: 1.5m.
- Height: Y=0 to Y=3.52.

### `exit-curtain`

- Position: Z=0 plane, at the exit/gift-area opening.
- X range: X=6.73 to X=8.83.
- Width: 2.1m.
- Height: Y=0 to Y=3.52.

## Capacity

- Maximum: 30 visitors per session.
- Minimum functional: 5 visitors.
- Cozy target: 20 visitors.
- One group at a time. Scheduled sessions. One-way visitor flow.

## Visitor route (one-way, no doubling back)

1. Enter through 1.5m gap at X=0 to X=1.5, Z=0.
2. Walk positive Z direction along `back-wall` through vertical pathway leg. Read 4–5 firefly facts on painted stick-on letters on `back-wall` (X=0) face.
3. At Z=7.28, turn positive X direction along horizontal pathway leg. Read information panels on `window-wall` (Z=8.78) face.
4. At X=6.43, Z=7.28, pass through opening into `forest`.
5. Experience three stages in forest: flicker → interactive → programmed movement.
6. Exit through column/`front-wall` gap at X=6.43 to X=8.83, Z=0 into `exit-gift-area`.

## Seating (forest zone)

- Plywood storage box stools.
- Width: 50–60cm.
- Cushioned tops.
- Internal storage for visitor phones and bags.
- Painted, arranged in designated seating zones.
- Each zone marked by overhead spotlight (dim, focused).
- Count and placement: TBD with carpenter.

## Lighting (room-level, not firefly system)

- Loofah wall (on `front-wall`) is the only warm element. See loofah wall doc.
- All other wall surfaces matte dark.
- Overhead spotlights at seating zones (dim, focused down).
- LED strip lighting along `pathway` floor edges, faintly leaking into forest perimeter.
- Track lighting spots overhead in pathway: UNDER CONSIDERATION, not committed.

## Atmospheric (not committed)

These are flagged ideas, not part of the canonical build:

- Mist or fog.

Do not model unless explicitly added.

## Hard simulation rules

- Use canonical wall names only. No compass directions in code, comments, filenames, or commits.
- "Pathway" only. Never "corridor".
- `entrance-wall` is NOT a solid wall. Model only the three cabinet partition elements.
- Any geometry visible at full darkness (ambient = 0.01) MUST use self-emissive materials. ACES/AgX tone mapping crushes non-emissive surfaces to pure black.
- Firefly LED sphere radius: 0.025 (visual legibility). Physically accurate value is sub-pixel and not used.
- All measurements in metres. Y=0 is floor level.
- NO artist, designer, studio, or artwork names anywhere in code, comments, filenames, commits, plans, or build prompts.
- Foam mat floor is the LOCKED design direction. Never covered, painted, or replaced. Marble is no longer the floor.
- Surface-flush geometry rule: any geometry placed flush against a wall surface MUST be nudged 5–10mm inward to avoid being buried inside the surface body.
- Emergency egress: open item. Do not model emergency signage.
