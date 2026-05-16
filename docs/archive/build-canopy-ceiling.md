# Build prompt: ceiling canopy

## Read this first — sole source of truth

This prompt supersedes the previous `build-canopy-ceiling.md`. Where the two disagree, this one wins. Decisions below were locked in a chat session with the designer. They are not negotiable. Do not flag, do not propose alternatives.

The existing flat `mountain-topology` ceiling is being replaced by a plywood-fold canopy. The identifier `mountain-topology` does not change. The geometry behind it does.

## What this prompt builds

A faceted canopy that fills the room ceiling exactly. The canopy is divided into a 14 × 14 grid of fold squares (196 squares). Squares are grouped into 2 × 2 units (49 units). Each unit carries 18 LEDs distributed across its four squares' undersides, plus one IR detector position. IR detection logic and LED sequencing are out of scope for this build.

## Locked specifications

These values are decided. Do not flag, do not negotiate.

### Room context

- `ROOM.W = 8.83 m`. `front-wall` to `back-wall` length, runs along x.
- `ROOM.D = 8.78 m`. `entrance-wall` to `window-wall` length, runs along z.
- `ROOM.H = 3.52 m`. Working ceiling height, after structural beams.
- Real ceiling at 4.2 m. Plenum gap above working ceiling: 0.68 m. Houses mount structure, wiring, LED fixtures, IR detectors.

### Square grid

- 14 columns × 14 rows = 196 squares.
- Square width (x): `ROOM.W / 14 = 0.6307 m = 63.07 cm`.
- Square depth (z): `ROOM.D / 14 = 0.6271 m = 62.71 cm`.
- Squares are slightly non-square in absolute geometry (0.36 cm width-depth difference). Acceptable.
- Canopy footprint: 8.83 × 8.78 m. Fills the room exactly. No margin, no infill trim.

### Units

- 2 × 2 squares per unit.
- 7 columns × 7 rows of units = 49 units total.
- 18 LEDs per unit.
- 1 IR detector per unit.
- Total ceiling LEDs: 882.
- Total IR detector positions: 49.

### Fold profiles

Maximum drop `h = 10.16 cm = 0.1016 m`.

Direction: downward only. High corners sit at the 3.52 m working ceiling line. Deep corners sit at 3.52 − 0.1016 = 3.4184 m. Plywood panels have no rim — the panel surface is the visible surface.

Four profiles per square. Corner heights listed counterclockwise from bottom-left. `0` means working ceiling line; `-h` means maximum drop.

- `square-a` (saddle): `[0, -h, 0, -h]`. Two opposite corners at the ceiling line, two opposite corners at maximum drop. Underside reads as a saddle / X-fold.
- `square-b` (single tilt): `[0, 0, -h, -h]`. Bottom edge at ceiling line, top edge at maximum drop. Underside is a single inclined plane.
- `square-c` (corner dip): `[0, 0, 0, -h]`. Three corners at ceiling line, one corner at maximum drop. Underside is a single tilted plane sloping into one corner.
- `square-d` (recess): `[0, 0, 0, 0]` with a flat recessed face at `-h / 2 = -5.08 cm` below the corners. All four corners at ceiling line, with a small inset depression in the middle. Matches the PDF's 2-inch recess proportion within the visible fold range.

Each square may be rotated 0°, 90°, 180°, or 270°, which cycles the corner array. Distinct rotations per profile: `square-a` = 2, `square-b` = 4, `square-c` = 4, `square-d` = 1.

### Adjacency rule

For two squares sharing an internal edge, the heights at the two corner endpoints of that shared edge must be equal between the two squares. This produces continuous fold geometry across the canopy.

This rule is sufficient to drive a constraint-satisfaction layout solver and to validate any user-provided layout.

### LED placement within a unit

- Algorithm: random Poisson-disc distribution across all four squares' undersides, treated as one continuous surface per unit.
- Seeded so layouts are reproducible.
- 18 points per unit, 882 total on the ceiling.

### LED visual properties

- Colour: `#00FF00`.
- Sphere radius: reuse the existing wall-firefly radius constant. Do not introduce a separate constant. Discovery in Step 0 reports the existing constant; Step 2 imports it.
- Bloom + HDR emissive in the post-processing stack does the visual heavy lifting. The sphere is the bright core.

### Layout assignment algorithm

- Constraint-satisfaction solver. Seeded; user can re-roll for a new valid layout.
- Must satisfy the adjacency rule across all 196 squares.
- Cache the layout so it does not recompute on every render.

### Material

- Simulation: matte, near-black, low albedo. Continues the dark experience aesthetic.
- Real install (informational, not a sim concern): plywood painted matte near-black. Mount structure is a timber or aluminium batten grid in the plenum.
- The sim does NOT render the mount system. It sits in the plenum, hidden from below.

## Step 0: read-only discovery (HARD STOP)

Use Read, Glob, Grep only. No edits in this step.

Report:

1. The file or files that currently render `mountain-topology`. Include the exact path and the function or component that emits the mesh.
2. The geometry approach currently used: single mesh, instanced mesh, group of meshes, or other.
3. The exact constant names exported by `dimensions.js` for `ROOM.W`, `ROOM.D`, `ROOM.H`. Quote the lines.
4. The file path of `surfacePositions.js` and the entry point `distributeUnits()`. Identify the lines that handle the ceiling surface specifically (as opposed to `entrance-wall` and `window-wall` surfaces).
5. The current ceiling LED count emitted by `distributeUnits()` for the ceiling surface only. Pre-build baseline for comparison.
6. The current LED material and colour values used by the firefly variants. Quote the relevant lines.
7. The existing wall-firefly sphere radius constant. We're reusing it for the canopy LEDs. Quote the constant declaration and its value.
8. The full file list this build will touch. Should not exceed: ceiling component file, new fold-geometry definitions file, new layout helper file, new unit data file, `surfacePositions.js`. If discovery suggests touching anything else, STOP and flag before proceeding.

After producing this report, stop. Wait for user confirmation before moving to Step 1.

## Step 1: geometry build (HARD STOP)

Implement four fold-profile geometries per the corner heights table above. Each profile is a parametric mesh function:

```
foldGeometry(profile, rotation) → BufferGeometry
```

taking square width (`ROOM.W / 14`), square depth (`ROOM.D / 14`), `h` (`0.1016 m`), and rotation in `{0, 90, 180, 270}`. Returns a `BufferGeometry` whose corner heights match the canonical table cycled by the rotation.

For `square-d`, the recessed face mesh is generated alongside the four corner-flat geometry, sitting at `-h / 2` below the corner plane.

Implement the adjacency-rule check as a small pure function:

```
isValidAdjacency(square1, square2, sharedEdgeOrientation) → boolean
```

given two adjacent squares' `(profile, rotation)` and the shared-edge orientation, return whether the assignment is valid.

Implement the constraint-satisfaction solver. Generate a valid layout for the 14 × 14 grid. Cache it so it does not recompute on every render. Solver takes a numeric seed; user can re-roll by changing the seed.

Replace the existing `mountain-topology` rendering with a grid of fold meshes positioned at the correct world coordinates beneath the working ceiling plane. The component identifier and the variant id stay the same.

Apply the matte near-black material.

Build clean. Take a top-down screenshot and a standing-view screenshot. Stop. Wait for user confirmation before moving to Step 2.

## Step 2: unit grouping and LED placement (HARD STOP)

Group the 196 squares into 49 units (each 2 × 2 squares). For each unit produce a data record:

- `unitId` formatted as `unit-c{column}-r{row}`, where column is 0..6 and row is 0..6 of the unit grid.
- The four `squareIds` it contains.
- 18 LED positions on the squares' undersides via Poisson-disc distribution treating the four squares as one continuous surface.
- 1 IR detector position. Default placeholder: unit centre (where the four squares meet). The exact position is flagged for a future fabrication decision; this build records a position so future builds can wire up IR-driven interaction without restructuring.

The 49 unit records must be exposed via a single export or context provider so future builds can consume them.

Build clean. Take a screenshot showing the LED distribution from below. Verify in chat:

- 882 LEDs total on the ceiling.
- 49 IR detector positions recorded.
- Distribution looks visually even across the canopy.

Stop. Wait for user confirmation before moving to Step 3.

## Step 3: re-route ceiling LED distribution (HARD STOP)

Modify `surfacePositions.js > distributeUnits()`. The ceiling-surface portion reads from the unit-level LED layout produced in Step 2. The `entrance-wall`, `window-wall`, and any other non-ceiling surface portions are UNCHANGED.

HARD CONSTRAINT: the firefly variant files (`Blinking.jsx`, `Motion.jsx`, `Interaction.jsx`, `TheWave.jsx`, `FireflyParticles.jsx`) MUST remain untouched. They consume positions from `distributeUnits` and continue to render fireflies. If implementation requires touching any variant file, STOP and flag.

The total LED count on the ceiling becomes exactly 882. Wall LED counts unchanged.

Build clean. Verify ceiling LEDs sit on the underside of the canopy fold geometry, not on the flat plane behind it. Stop. Report final LED counts.

## Step 4: verification

Final checks:

- Build clean, lint clean.
- 196 fold meshes rendered.
- 49 unit records exposed and inspectable.
- 882 ceiling LEDs (compare to pre-build count from Step 0).
- `entrance-wall` and `window-wall` LED counts unchanged.
- Adjacency rule satisfied at all internal edges. Sample-check 10 random edges and report each pair's corner heights for the user to verify.
- Top-down screenshot.
- Standing-view screenshot at the default camera position and the default timeline value.
- Variant id and component identifier `mountain-topology` preserved.

Report all of the above in a single summary message. Stop.

## Do not touch

These elements must remain identical to their pre-build state:

- `entrance-wall`, `window-wall`, `front-wall`, `back-wall` geometry and materials.
- `partition-1`, `partition-2`, `column`.
- `D1`, `D2` doors on the `back-wall`.
- the floor.
- the sunset shader and UV orientation.
- the post-processing stack: bloom, tone mapping, vignette, fog, grain.
- camera presets and the default timeline value.
- texture references, including any `ambientCG` PBR textures.
- `BLUE_HOUR_TIME` (or its renamed equivalent), `DEFAULT_FIREFLY_COUNT`, `DEFAULT_HAZE_LEVEL`.
- the firefly variant files (`Blinking.jsx`, `Motion.jsx`, `Interaction.jsx`, `TheWave.jsx`, `FireflyParticles.jsx`).
- the firefly point-light array.
- the `entrance-wall`, `window-wall`, and any other non-ceiling portions of `surfacePositions.js`.
- the blackout curtain and the visitor `pathway`.
- the proposals viewer route and its variants.
- the existing wall-firefly LED material, colour, AND radius. The canopy LEDs reuse the radius constant; do not introduce a separate one.

If any of the above appears offset, recoloured, or rerendered after this build, STOP and flag. Do not silently patch.

## Stop-and-flag rule

Any value not in this prompt is a stop-and-flag. Do not infer. Do not pick a "reasonable default". The cost of asking is small. The cost of guessing has been demonstrated repeatedly.

## Parked for future builds

These are NOT part of this build. They are flagged so a future build doesn't have to rediscover them:

- IR detector specific position within a unit (current placeholder: unit centre). Real fabrication position is a future decision.
- IR detector visualisation in the simulation (debug marker, always-visible mesh, invisible). Currently not rendered.
- `pathway` exclusion: some canopy units sit above the visitor `pathway` zone and may need their LEDs disabled (either no geometry or geometry-with-dark-LEDs). Depends on `pathway` geometry being locked first. Not in scope for this build.
- LED sequencing algorithm.
- IR-driven interaction logic.

## Reference

Design language and fold-profile system derived from the Turf Crease acoustic ceiling tile system (PDF reference, page 4–5 for profiles and adjacency). The Turf product itself is NOT being procured — the canopy is locally fabricated plywood, painted matte near-black. PDF is design reference only.
