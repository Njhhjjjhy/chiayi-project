# Slice 1 – Consolidate panel/LED spec into single source of truth

## How to use this file

Copy everything below the `---` line. Paste into Claude Code.

After Claude Code finishes the pre-step research AND the Step 0 report, paste both back here in our chat. Do NOT let Claude Code proceed past Step 0 until I confirm.

## Why this slice is first

The discovery pass found `PANEL_SPEC` duplicated between two files, with the same RNG seed in both. Every future slice that changes ceiling geometry would have to be made in two places, or the firefly LED positions drift away from the panel positions. Fixing this duplication FIRST means every later slice changes one file, not two.

This slice does NOT change anything visible. Same panels, same LEDs, same positions. Only the code organisation changes.

Slice 1 also runs the visual reference research as a pre-step. The research output is saved to the codebase and will be referenced by every later slice that touches sculptural ceiling geometry.

---

You are about to make changes to the codebase. Follow this prompt exactly. Do not pattern-match from earlier work or older conventions in the project. Do not skip steps. Do not infer values not in this prompt.

## Reading list (read these first, before any work)

Before any research, discovery, or edits, read these files. They are the canonical reference and override any other source:

- `1-room-spec.md` – room geometry, walls, partitions, floor, hard simulation rules.
- `2-ceiling.md` – ceiling direction, 1,760-LED hardware spec, visual reference image path, research instruction.
- `3-loofah-wall.md` – front-wall loofah feature.
- `4-folded-sky-proposal.md` – `fireflies-suspended-sky` proposal, `sundown` wall lighting.
- `5-within-reach-proposal.md` – `fireflies-within-reach` proposal, `horizon-line` wall lighting.
- `6-experience-directions.md` – three narrative directions (A, B, C).
- `7-what-changed.md` – 21 May 2026 meeting diff.
- `8-open-items.md` – unresolved items.

If those files are not present in the project (look in the project root, in `docs/`, and in `docs/canonical/`), STOP and ask the user where they are. Do NOT proceed without them.

The codebase root also contains a visual reference image `meeting-refrence-3.webp`. This image is referenced in pre-step research and in later slices. Confirm it exists at codebase root. Do NOT modify it.

## Canonical rules (apply to all slices, including this one)

- NO compass directions in code, comments, filenames, or commits. Use `back-wall`, `front-wall`, `entrance-wall`, `window-wall` only.
- "Pathway" only. NEVER "corridor".
- **NO artist, designer, studio, or artwork names anywhere in code, comments, filenames, or commits. This rule is ABSOLUTE.**
- Surface-flush geometry MUST be nudged 5–10mm inward to avoid being buried inside the wall body.
- Any geometry visible at full darkness (ambient = 0.01) MUST use self-emissive materials.
- Marble floor is a LOCKED design asset. NEVER covered, painted, or replaced.

These rules apply to every slice.

## Pre-step: visual reference research (HARD STOP)

Before Step 0, run the research instruction from `2-ceiling.md` (section "Research instruction for build prompts"). Specifically:

1. Open `meeting-refrence-3.webp` at the codebase root. Read its visual content directly. Describe what you see in 4–6 sentences. Capture the form vocabulary: shapes, scale variation, suspension method, density patterns, materiality cues. Do NOT name any designers, studios, or specific installations.

2. Do web research on contemporary practice in suspended sculptural ceiling installations. Look at:
   - Organic-form repetition in ceilings.
   - Varied-scale element systems suspended from above.
   - Ceiling-as-spatial-sculpture installations.
   - Material approaches: paper mache, plywood, fabric, fibre-based, hybrid.
   - Cable, rail, and grid suspension systems for irregular forms.
   
3. Synthesise the research into a single markdown file at `docs/ceiling-visual-research.md`. The file MUST contain:
   - A summary of the visual reference image content (from step 1).
   - 8–12 visual principles distilled from the research (e.g. "scale variation across forms reads as natural distribution", "negative space between forms carries the floating quality").
   - Material observations relevant to local fabrication (paper mache, plywood, hybrid).
   - Form vocabulary list: 10–15 shape descriptors useful as parameters for procedural geometry generation (e.g. "ovoid", "blade-like", "petal", "bowl", "shell", "pod", "lens", "drop").
   - Density pattern observations: how forms cluster, how empty space functions.
   
4. The research file MUST NOT contain any designer, studio, artist, brand, or artwork name. If a source you read names a specific work, EXTRACT the principle and DROP the name. The principle goes in the file; the source does not.

5. Once the research file is written, report:
   - Confirmation that `meeting-refrence-3.webp` was read.
   - The exact path of the new research file.
   - Word count of the research file.
   - Number of visual principles captured.
   - Number of form vocabulary entries.

Then STOP. Wait for user confirmation that the research is acceptable before proceeding to Step 0.

## Step 0: read-only discovery (HARD STOP)

Use Read, Glob, and Grep only. NO edits in this step.

Report:

1. Quote lines 28–32 of `src/components/room/Ceiling.jsx` (the `PANEL_SPEC` definition).
2. Quote lines 34–38 of `src/components/fireflies/surfacePositions.js` (the duplicated `PANEL_SPEC` definition).
3. Confirm whether the two definitions are byte-identical or differ in any way. Quote any differences.
4. Identify where the RNG seed value (42) is used in each file. Quote the lines.
5. Identify the Park–Miller PRNG implementation. Is it duplicated in both files, or imported from a shared utility? Quote the relevant lines or import statements.
6. List EVERY file in the codebase that imports from `Ceiling.jsx` or `surfacePositions.js`. Use grep on import statements.
7. List EVERY file in the codebase that defines or references a value named `PANEL_SPEC` or anything matching the regex `/panel.?spec/i`. Quote the matches.
8. Identify any constants in `src/geometry/dimensions.js` that relate to the ceiling panel system (forest bounds, ceiling height, plenum, etc). Quote the relevant lines.
9. Confirm whether `src/geometry/` exists as a directory. If yes, list its current contents.
10. Confirm whether `src/utils/` exists. If yes, list its current contents.
11. Confirm `meeting-refrence-3.webp` exists at the codebase root.
12. Confirm `docs/ceiling-visual-research.md` was created in the pre-step.
13. Propose the exact file path for the new single-source-of-truth module. Recommend `src/geometry/panelSpec.js`. The user will confirm in Step 1.

After producing this report, STOP. Wait for user confirmation before moving to Step 1.

## Step 1: stop-and-flag block (HARD STOP)

Do NOT proceed past Step 0 until the user has reviewed the discovery report and answered ALL of the following in a single message. Do NOT ask one at a time.

1. **Module location.** Confirm the file path for the new single-source module. Default: `src/geometry/panelSpec.js`.

2. **Module exports.** Confirm the exact named exports. Default:
   - `PANEL_SPEC` – the spec array (panel size classes, counts, LED grid dimensions per class).
   - `PANEL_RNG_SEED` – the seed integer (currently 42).
   - `createPanelRng()` – factory returning a Park–Miller PRNG seeded with `PANEL_RNG_SEED`.
   - `generatePanelLayout()` – pure function returning the deterministic list of panels (positions, sizes, tilts) given the spec and seed.
   - `generatePanelLEDs(panelLayout)` – pure function returning the LED positions in world space for a given panel layout.

3. **Behaviour preservation.** Confirm the goal is byte-identical rendered output before and after this slice. If yes, slice ends with side-by-side screenshot comparison. If no, the user must specify acceptable deltas.

4. **Park–Miller PRNG.** Confirm whether to extract the PRNG to its own utility (`src/utils/parkMillerRng.js`) or keep it inline inside the new panel spec module. Recommendation: extract.

5. **Removal of old definitions.** Confirm that after the new module is in place, the duplicate `PANEL_SPEC` and seed value in `Ceiling.jsx` and `surfacePositions.js` should be DELETED (not commented out, not left behind as fallback).

After receiving answers, RESTATE them for confirmation before moving to Step 2.

## Step 2: build

Implement per the answers from Step 1:

1. Create the new single-source module at the confirmed path.
2. If PRNG extraction is confirmed: create `src/utils/parkMillerRng.js` and move the PRNG there.
3. Move `PANEL_SPEC` and the seed value into the new panel spec module.
4. Implement `generatePanelLayout()` and `generatePanelLEDs()` as pure functions in the new module, factoring out the logic currently duplicated between `Ceiling.jsx` and `surfacePositions.js`.
5. Update `src/components/room/Ceiling.jsx` to import from the new module(s).
6. Update `src/components/fireflies/surfacePositions.js` to import from the new module(s).
7. DELETE the duplicate code from both files.
8. Verify the import chain has no circular dependencies.

Run `pnpm build`. Report any errors. Do NOT silently fix unrelated issues – if anything outside this slice's scope shows up as an error, stop and flag.

## Step 3: verification

Take two screenshots from the simulation:
1. Top-down view of the ceiling. Use the existing `ceiling` viewpoint preset.
2. Standing view at default page load. Use the `standing` viewpoint preset, default timeline.

Compare visually against the pre-change state. The LED positions, panel positions, panel tilts, and panel sizes MUST be identical.

If anything is visually different, STOP and flag. The seeded PRNG should produce identical output if the seed and inputs are preserved.

Report:
- The new module path(s).
- The list of exports from each new module.
- The list of files that import from the new module(s).
- The deleted lines (file path + line range) from `Ceiling.jsx` and `surfacePositions.js`.
- `pnpm build` output (clean or errors).
- Screenshot comparison result (identical / different).
- Total line count change across the codebase (should be negative).

STOP. Wait for user confirmation before any future slice.

## Do not touch

These elements MUST remain identical to their pre-build state:

- `src/components/room/Walls.jsx`, `Floor.jsx`, `Column.jsx`, `EntranceWallPartition.jsx`, `TheatricalCurtain.jsx`, `LuffaWall.jsx`, `Doors.jsx`, `Windows.jsx`, `WallLighting.jsx`, `Pathway.jsx`.
- `src/components/fireflies/Awakening.jsx`, `DriftingSwarm.jsx`, `Flashlight.jsx`, `Heartbeat.jsx`, `PulseWave.jsx`, `FireflySystem.jsx`, `FireflyParticles.jsx`.
- `src/postfx/PostEffects.jsx`.
- `src/pages/FirefliesPage.jsx`.
- `src/variants/proposals.js`, `fireflies.js`, `config.js`.
- `src/geometry/dimensions.js` (read from, do NOT modify).
- All camera presets and viewpoints.
- All proposals system routing.
- All URL parameter handling.
- `BLUE_HOUR_TIME`, `DEFAULT_FIREFLY_COUNT`, `DEFAULT_HAZE_LEVEL` if present.
- The LED material, colour, emissive intensity, and bloom settings.
- `meeting-refrence-3.webp` at codebase root.

If anything in this list appears offset, recoloured, or rerendered after this build, STOP and flag. Do NOT silently patch.

## Stop-and-flag rule

Any value not in this prompt and any decision not explicitly delegated to procedural code is a stop-and-flag. Do NOT infer. Do NOT pick a "reasonable default". Ask the user. The cost of asking is small.

If the screenshot comparison shows any visual difference between before and after, STOP and flag – do NOT attempt to chase the difference by changing seeds or RNG implementations.
