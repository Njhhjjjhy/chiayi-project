# Slice 3 – Replace floor with foam mat material

## How to use this file

Everything below the `---` is the prompt for Claude Code. Copy and paste it directly. Stop at every HARD STOP and report back.

---

## Reading list (load these first)

Read these canonical docs from `docs/canonical/` before starting:

1. `1-room-spec.md` – floor section is canonical. Foam mat, matte, dark, textured, no reflectivity. Shoes on. Never marble.
2. `7-what-changed.md` – entry 14. Floor was changed from marble to foam mat on 23 May 2026. The "marble doubles the canopy" reasoning is no longer valid.

Also load the slice 2 verification report to understand the current state of partitions and wall lighting (in this chat's context, or from previous Claude Code session memory).

## Canonical rules (restate to confirm before Step 0)

- Use canonical wall names only: `back-wall`, `front-wall`, `entrance-wall`, `window-wall`. No compass directions.
- "Pathway" only. Never "corridor".
- Floor is foam mat. Matte. Dark. Textured. NO reflectivity. NEVER marble.
- Any geometry visible at full darkness (ambient = 0.01) MUST use self-emissive materials. ACES/AgX tone mapping crushes non-emissive surfaces to pure black. The floor likely needs a small emissive lift (matching the wall material's `emissiveIntensity = 0.08` pattern) to remain visible.
- NO artist, designer, studio, or artwork names anywhere in code, comments, filenames, commits, plans, or build prompts.
- All measurements in metres.
- All shared spec values live in `src/geometry/dimensions.js`. Do not duplicate constants across files.

Confirm you understand these rules before proceeding to Step 0.

## What this slice does

Replace the current solid-colour floor with a foam mat material:

- Matte, dark, textured surface that reads as interlocking tiles.
- No reflectivity. Floor absorbs light, does not double the firefly canopy.
- Visible tile seams in the geometry or material.
- Tile colour: near-black (placeholder `#1a1a1a` matching wall tone, override via constant).
- Floor remains a single plane geometry covering the exhibition area. Tile pattern is visual treatment, not separate geometry per tile (unless instancing is cleaner).

## Step 0 – Read-only discovery (HARD STOP)

Do NOT edit any files in this step. Read and report.

Capture screenshots BEFORE any changes. Save to `baselines/` with filename pattern `…-slice3-before-<preset>.png` for at least these four presets: `standing`, `entrance-wall`, `back-wall`, `topdown`. This gives a verifiable before-baseline (slice 2 lacked this).

Then report:

1. **Current floor implementation.** Paste the full contents of `src/components/room/Floor.jsx` (or equivalent file). Include line numbers.
2. **Current floor material.** Exact colour, emissive value, roughness, metalness, any texture maps, any UV mapping. Note whether floor is `meshStandardMaterial`, `meshPhysicalMaterial`, or other.
3. **Floor geometry.** Dimensions, segment count, position, rotation. Is it `planeGeometry`, `boxGeometry`, something else?
4. **Importers of `Floor.jsx`.** Which files import the default export.
5. **Constants used.** Which constants from `dimensions.js` (or elsewhere) does Floor.jsx consume.
6. **Texture / map presence.** Is the codebase currently loading any texture files for the floor? If so, what paths and what loader (TextureLoader, useTexture from drei, etc.).
7. **Reflectivity / environment map.** Is the floor currently reading any environment map, MeshReflectorMaterial, or other reflection mechanism? Report ALL reflection-related setup affecting the floor.
8. **Light interaction sanity check.** With the current material, is the floor visible at ambient 0.01? If yes, by what mechanism (emissive lift, environment light, ambient occlusion contribution).
9. **Stop-and-flag items.** Anything you discover that does not fit the slice plan – flag it now, do not guess.

HARD STOP. Do not proceed to Step 1 until I respond.

## Step 1 – Stop-and-flag questions (HARD STOP)

Answer the following before any code changes:

1. **Texture approach.** Two options:
   - (a) Procedural – generate the tile seam pattern via shader / repeating UV noise. No external image assets needed. Fully driven by code.
   - (b) Image-based – use a texture map (foam mat photo or generated PNG) on the floor material. Requires an asset added to `public/textures/` or similar.

   Recommend (a) for now: keeps the slice self-contained, no asset pipeline, easy to tune via constants. If (a) cannot achieve the visible tile-seam read, fall back to (b) and add the texture file to `public/textures/foam-mat.jpg` (single source, no per-tile assets).

2. **Tile dimensions.** Foam mat tiles in the reference image read as roughly 60×60cm. Default: 0.6 × 0.6 m tile pattern across the floor. Confirm or override.

3. **Tile colour.** Default `#1a1a1a` to match wall tone. Confirm or override.

4. **Emissive lift.** Default `emissiveIntensity = 0.05` (slightly lower than the wall's 0.08 – floor should sit visually below the walls). Confirm or override.

5. **Reflectivity removal.** Confirm: if the current floor uses `MeshReflectorMaterial`, env map, or any other reflection mechanism, all of that MUST be removed. Floor is matte. Roughness = 1.0. Metalness = 0.0.

6. **Constants placement.** New constants (`FLOOR_TILE_SIZE`, `FLOOR_COLOR`, `FLOOR_EMISSIVE_INTENSITY`) go into `src/geometry/dimensions.js` per the single-source-of-truth pattern. Confirm.

7. **Surface-flush rule for the floor.** Floor sits at Y=0 exactly. Geometry placed on top of the floor (cabinets, column, ceiling structures) sits at Y=0 to Y=H. No 5–10mm nudge needed for the floor itself – the rule applies to geometry placed flush AGAINST a surface, not the surface plane. Confirm understanding.

HARD STOP. Do not proceed to Step 2 until I respond.

## Step 2 – Build

Once Step 1 is approved:

1. Add the new constants to `src/geometry/dimensions.js`: `FLOOR_TILE_SIZE`, `FLOOR_COLOR`, `FLOOR_EMISSIVE_INTENSITY`. Group them in a `Floor` section with a comment.

2. Edit `src/components/room/Floor.jsx`:
   - Remove any `MeshReflectorMaterial`, environment map binding, or reflection-related code completely.
   - Switch to `meshStandardMaterial` with: `color = FLOOR_COLOR`, `emissive = FLOOR_COLOR`, `emissiveIntensity = FLOOR_EMISSIVE_INTENSITY`, `roughness = 1.0`, `metalness = 0.0`.
   - Implement the tile pattern via Step 1 decision (procedural OR texture).
   - For procedural: use a fragment-shader approach or repeating UV noise to generate visible tile seams every `FLOOR_TILE_SIZE` metres. Seam contrast should be subtle – dark seam line, slightly darker than the tile face, NOT a high-contrast grid.
   - For texture: load the texture, set `repeat` so that tiles tile at `FLOOR_TILE_SIZE` across the floor's actual dimensions, `wrapS = wrapT = THREE.RepeatWrapping`.

3. Update any importers of Floor.jsx ONLY if the props or default export shape changed. Do not change importers if the import surface is identical.

4. Remove unused imports from Floor.jsx that were previously reflection-related.

5. Run `pnpm build` and `pnpm lint`. Both must be clean.

## Step 3 – Verification

Capture screenshots AFTER changes to the same four presets used in Step 0: `standing`, `entrance-wall`, `back-wall`, `topdown`. Save to `baselines/` with filename pattern `…-slice3-after-<preset>.png`.

Report:

1. **Files changed** (paths + line deltas).
2. **Final constants** added to `dimensions.js`.
3. **Final Floor.jsx state** – paste the full file with line numbers.
4. **Texture approach used** (procedural or image-based).
5. **Build + lint status.**
6. **Visual diff against the before-baselines.** Describe what changed visually: floor tone, tile seams visible / not visible, any change to reflections (should be: reflections completely gone), any change to firefly readability (canopy should now be visible only above, not doubled below).
7. **Surfaces verified untouched.** Walls, cabinets (slice 2), column, ceiling panels, loofah wall, curtain, doors, windows, fireflies, post-processing, UI overlay, all camera presets, all firefly behaviour files.
8. **Do-not-touch list re-verified** – explicitly list each item and confirm untouched.

HARD STOP. Do not commit. Awaiting my confirmation.

## Do not touch

- All firefly behaviour files in `src/components/fireflies/`.
- `FireflySystem.jsx`, `FireflyParticles.jsx`, `surfacePositions.js`.
- `Walls.jsx`, `Column.jsx`, `Ceiling.jsx`, `TheatricalCurtain.jsx`, `LuffaWall.jsx`, `Doors.jsx`, `Windows.jsx`, `Pathway.jsx`, `EntranceWallPartition.jsx`, `WallLighting.jsx`.
- `PostEffects.jsx`, `FirefliesPage.jsx`.
- `proposals.js`, `fireflies.js`, all camera presets in `config.js`.
- `panelSpec.js`, `parkMillerRng.js`.
- All URL parameter handling.
- LED material / colour / emissive / bloom settings.
- `meeting-refrence-3.webp`, `docs/ceiling-visual-research.md`.
- `CABINET_T` constant in `dimensions.js`.

## Stop-and-flag rule

If at any point you find a fact that can only be known from the physical building, Riaan's direct knowledge, or a canonical doc you cannot find – STOP. Flag it. Do not infer. Do not pattern-match. Ambiguity → flag → wait. Never ambiguity → guess.

## Single-finding rule

When reporting findings or flags between steps: one finding per message. Do not stack multiple flags into one response.
