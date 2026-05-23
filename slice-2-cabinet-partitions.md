# Slice 2 — Replace partitions with cabinet-thick geometry

## How to use this file

Copy everything below the `---` line. Paste into Claude Code.

Each step ends with a HARD STOP. Paste the report back here in our chat before letting Claude Code proceed.

## Why this slice

The 21 May meeting decided partitions evolve from thin movable walls into cabinet-style structures with internal storage for wiring, lighting, sound, and operational gear. The current sim renders three thin plywood boxes — cabinets need depth, mass, and visible thickness.

Cabinet thickness is a placeholder pending the carpenter visit. The sim shows the visual direction, not the final dimensions.

---

You are about to make changes to the codebase. Follow this prompt exactly. Do not pattern-match from earlier work. Do not skip steps. Do not infer values not in this prompt.

## Reading list (read these first)

Before any work, read these canonical reference files. Look in the project root, `docs/`, and `docs/canonical/`:

- `1-room-spec.md` — partition section is the authority for this slice.
- `2-ceiling.md` — for awareness only; not touched in this slice.
- `4-folded-sky-proposal.md` and `5-within-reach-proposal.md` — for awareness.
- `7-what-changed.md` — partition change is item #5.
- `8-open-items.md` — partition spec is in tier 1 (waiting on carpenter).
- `docs/ceiling-visual-research.md` — created in slice 1. Not directly used here; read once for context only.

If any of those files are missing, STOP and ask the user before proceeding.

## Canonical rules (apply to every slice)

- NO compass directions in code, comments, filenames, or commits. Use `back-wall`, `front-wall`, `entrance-wall`, `window-wall` only.
- "Pathway" only. NEVER "corridor".
- **NO artist, designer, studio, or artwork names anywhere in code, comments, filenames, or commits. ABSOLUTE.**
- Surface-flush geometry MUST be nudged 5–10mm inward.
- Any geometry visible at full darkness (ambient = 0.01) MUST use self-emissive materials.
- Marble floor is a LOCKED design asset.

## What this slice does

Replace the three thin plywood partitions in `src/components/room/EntranceWallPartition.jsx` with cabinet-style geometry:

- Cabinet thickness: 0.5m (mid-point of the 0.4–0.6 placeholder range from doc 1).
- All three partitions converted: `entrance-wall-partition`, `pathway-partition-vertical`, `pathway-partition-horizontal`.
- Floor to working ceiling height preserved: Y=0 to Y=3.52.
- Material: plywood, matte near-black finish (current material). Self-emissive lift preserved for visibility at ambient 0.01.
- Geometry: rectangular box with visible thickness. No internal shelving, no door details — those are install-day fabrication, not sim concerns. The cabinet form is what matters.

Length and positional anchors stay locked to doc 1:

| Partition | Anchor | Length | New thickness |
|---|---|---|---|
| `entrance-wall-partition` | Along Z=0, X=1.5 to X=6.43 | 4.93m | 0.5m (extends into forest, NOT into entry gap) |
| `pathway-partition-vertical` | Along X=1.5, Z=0 to Z=7.28 | 7.28m | 0.5m (extends into forest, NOT into pathway) |
| `pathway-partition-horizontal` | Along Z=7.28, X=1.5 to X=6.43 | 4.93m | 0.5m (extends into forest, NOT into pathway) |

## Critical rule for thickness direction

The cabinet thickness MUST extend AWAY from the pathway, INTO the forest. The pathway width (1.5m) is locked. If thickness ate into the pathway, the visitor walkway would narrow.

Specifically:
- `entrance-wall-partition`: thickness extends from Z=0 toward positive Z (into forest). New Z bounds: Z=0 to Z=0.5.
- `pathway-partition-vertical`: thickness extends from X=1.5 toward positive X (into forest). New X bounds: X=1.5 to X=2.0.
- `pathway-partition-horizontal`: thickness extends from Z=7.28 toward negative Z (into forest). New Z bounds: Z=6.78 to Z=7.28.

If this changes the forest bounds in `dimensions.js`, STOP and flag. Do NOT silently modify forest bounds — the rest of the sim depends on them.

## Step 0: read-only discovery (HARD STOP)

Use Read, Glob, and Grep only. NO edits.

Report:

1. Quote the current geometry definitions for all three partitions in `src/components/room/EntranceWallPartition.jsx`. Include the lines that define position, dimensions, and rotation.
2. Identify the current thickness value used for the three partitions (likely 18mm = 0.018m).
3. Quote the material definition currently used for the partitions (colour, emissive intensity, roughness).
4. Identify any other file that imports from `EntranceWallPartition.jsx`. Use grep on import statements.
5. Identify which constants from `src/geometry/dimensions.js` are currently used by `EntranceWallPartition.jsx`. Quote the import line.
6. Confirm the current `FOREST_X_START`, `FOREST_X_END`, `FOREST_Z_START`, `FOREST_Z_END` values in `dimensions.js`.
7. Check whether the new thickness extending into the forest (per the section "Critical rule for thickness direction" above) overlaps any other geometry inside the forest. Look at: `LuffaWall.jsx`, `Ceiling.jsx`, `WallLighting.jsx`, `Pathway.jsx`, and anything else placed inside the forest bounds. Report any potential overlap.
8. Confirm whether any camera preset positions would now sit INSIDE the new cabinet thickness. Six presets exist per slice 1's discovery: `ceiling`, `back-wall`, `front-wall`, `window-wall`, `entrance-wall`, `standing`. For each, report (a) the preset position, (b) whether it falls inside any new cabinet volume, (c) if yes, recommend a small position adjustment.

After producing this report, STOP. Wait for user confirmation before Step 1.

## Step 1: stop-and-flag block (HARD STOP)

Do NOT proceed past Step 0 until the user has answered ALL of the following in a single message.

1. **Cabinet thickness value.** Default 0.5m. Confirm or override.

2. **Camera preset adjustments.** If any preset position now sits inside a cabinet, confirm the adjustment (a small Z or X offset outward) OR confirm leaving the preset as-is.

3. **Forest bounds.** Confirm that `dimensions.js` `FOREST_*` constants stay UNCHANGED. The cabinet thickness extends into the forest zone visually, but the logical forest bounds used for LED distribution and visitor zones stay where they are. The forest is now slightly smaller in usable area, but the logical bounds are not updated.

4. **Material.** Confirm the current partition material (plywood matte near-black, current emissive lift) is preserved. No material change in this slice.

5. **Internal storage detail.** Confirm that internal storage (shelving, doors, hinges) is NOT modelled in the sim. The cabinet is a solid box with thickness. Internal detail is install-day fabrication.

After receiving answers, RESTATE them for confirmation before Step 2.

## Step 2: build

1. Update `src/components/room/EntranceWallPartition.jsx` to render each of the three partitions as a `<boxGeometry>` with:
   - The locked length per the table above.
   - The new thickness (default 0.5m).
   - The locked height (Y=0 to Y=3.52, so box height = 3.52m).
   - Position the box center at the midpoint of the (length × thickness) footprint, anchored so the thickness extends in the correct direction per the "Critical rule" section.
2. Preserve the current material exactly.
3. If camera preset adjustments were confirmed in Step 1, apply them to `src/variants/config.js` (or wherever the camera presets live — Step 0 will have confirmed the file).
4. Do NOT modify `dimensions.js`.
5. Do NOT modify any file outside the "may touch" list below.

May touch:
- `src/components/room/EntranceWallPartition.jsx`
- `src/variants/config.js` (only if camera presets need adjustment)

Run `pnpm build`. Report any errors.

## Step 3: verification

1. Take screenshots from these viewpoints:
   - `standing` (default)
   - `entrance-wall` preset (to see the entrance-wall-partition from its thickness side)
   - `back-wall` preset (to see the pathway-partition-vertical from the pathway side)
   - `ceiling` preset (top-down — should show three thick rectangles instead of three thin lines)

2. Compare visually against the slice 1 baselines in `baselines/`. The expected differences:
   - Each partition is now visibly thicker.
   - From standing view, the partition reads as a wall with mass, not a panel.
   - From top-down, the partition rectangles are clearly visible.
   - Everything else (panels, fireflies, walls, floor, curtain, loofah) is IDENTICAL to slice 1.

3. Report:
   - Pre and post screenshot pairs saved to `baselines/`.
   - Confirmation that ONLY the three partitions changed visually.
   - The final cabinet thickness used.
   - The final length of each partition (should match the table above, unchanged).
   - Any camera presets that were adjusted (path + before/after values).
   - `pnpm build` output.
   - Total line count change in `EntranceWallPartition.jsx` (modest change expected).

STOP. Wait for user confirmation before slice 3.

## Do not touch

These elements MUST remain identical to their pre-slice state:

- `src/components/room/Walls.jsx`, `Floor.jsx`, `Column.jsx`, `Ceiling.jsx`, `TheatricalCurtain.jsx`, `LuffaWall.jsx`, `Doors.jsx`, `Windows.jsx`, `WallLighting.jsx`, `Pathway.jsx`.
- ALL firefly behaviour files.
- `src/components/fireflies/surfacePositions.js`, `FireflyParticles.jsx`, `FireflySystem.jsx`.
- `src/postfx/PostEffects.jsx`.
- `src/pages/FirefliesPage.jsx`.
- `src/variants/proposals.js`, `fireflies.js`.
- `src/geometry/dimensions.js` — read-only.
- `src/geometry/panelSpec.js` and `src/utils/parkMillerRng.js` (created in slice 1).
- All URL parameter handling.
- LED material, colour, emissive intensity, bloom settings.
- `meeting-refrence-3.webp` and `docs/ceiling-visual-research.md`.

If anything outside the partitions appears to have changed visually, STOP and flag.

## Stop-and-flag rule

Any value not in this prompt is a stop-and-flag. Do NOT infer. Do NOT pick a "reasonable default". Ask the user.
