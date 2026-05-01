# Build prompt: real-world room updates

## Read this first — sole source of truth

This prompt supersedes every previous instruction, scratch file, comment, branch, commit message, or conversation about the curtain, the pathway, the firefly LED size, the proposals page, or anything related to those four. Treat this prompt as ground truth.

If during discovery you find:

- code, comments, or constants from prior attempts (e.g. `showCurtain`, `showPathway`, `showPathwayLeft`, `mirror`, `side` prop on `EntryPathway`, `0.0015` sphere radius, partition material `#1a1a1a` without emissive, `DEFAULT_SHOW_PATHWAY = true`, etc.) — those are remnants of broken work. They are cleanup targets, not specifications.
- prior prompts, README files, handoff documents, or AI-authored notes — do not extend or reconcile with them. Follow only this prompt.

Do not infer requirements from existing code. Do not preserve prior design decisions for backward compatibility. Prior work is being replaced, not extended.

---

## Context

These are not proposals. These are updates to the canonical 3D room to reflect the actual real-world design at Nanghia. The curtain, the pathway, and the corrected firefly size are permanent parts of the room — no toggles, no proposal flags, no experience modes.

---

## Wall terminology (locked — use these exact names everywhere; never compass directions)

- **Front wall** — the feature wall, where the main visual focuses.
- **Back wall** — the "piano wall". Holds doors D1 and D2.
- **Entrance wall** — holds the visitor entrance curtain.
- **Window wall** — has the windows. HVAC plenum sits in one corner of this wall.

Adjacency: the entrance wall is opposite the window wall. The front wall is opposite the back wall. The four walls form the canonical room rectangle.

The **forest** is the dark inner space, bounded by the corridor's inner partition along three walls (front, window, back) and additional partitions along the entrance-wall side that seal it from the entrance area.

---

## Pathway route (three segments, three right turns, then into the forest)

Starting from the visitor entrance on the entrance wall:

1. **Segment 1** — runs along the inside of the **front wall**, from the front-wall / entrance-wall corner to the front-wall / window-wall corner.
2. Right turn at the front-wall / window-wall corner.
3. **Segment 2** — runs along the inside of the **window wall**, from the front-wall / window-wall corner to the back-wall / window-wall corner.
4. Right turn at the back-wall / window-wall corner.
5. **Segment 3** — runs along the inside of the **back wall**, from the back-wall / window-wall corner up to the position of the **first door** (whichever of D1 or D2 Riaan confirms is closer to the window-wall corner).
6. Right turn at the first door — visitor exits the corridor through a partition opening at that door's x-position and enters the forest.

D1 and D2 are the two doors on the back wall. Which one is closer to the window-wall corner (and therefore the "first door" encountered along the path) is **not yet confirmed by Riaan**. **Stop and flag** during discovery to confirm with Riaan which of D1 or D2 is the first door before building any geometry that depends on this. Do not assume.

D1 and D2 are existing building doors.

**Important:** the "first door" is used as a *positional reference* for the partition opening. The corridor partition has an opening aligned with the first door's x-position. Visitors walk through this partition opening to enter the forest. They do not walk through the physical building door as part of the corridor route — the building door's operational status (open, closed, sealed) is outside the scope of this work.

The partition opening width must equal the corridor width (so visitors can walk through it).

The other door (whichever of D1 or D2 is *not* the first door) is outside the corridor route. The corridor partition does not extend past the first door toward the other door.

---

## Step 0 — discovery (read only, hard stop after report)

**Goal:** confirm the current state of the codebase before any edits.

**Tools allowed in this step:** Read, Glob, Grep.
**Tools forbidden in this step:** Edit, Write, MultiEdit, NotebookEdit, any Bash command that modifies the filesystem or git state.

Read each of the following files completely. Quote relevant lines in your report. If a file does not exist, state that — do not infer its contents.

1. `src/geometry/dimensions.js` — list every export. Include `ROOM.W`, `ROOM.H`, `ROOM.D`, `HW`, `HD`, and any door, window, or wall constants. State which axis (x, y, z) corresponds to each of the four walls.
2. `src/components/Scene.jsx` — full JSX tree of the canonical room. List every wall, door, partition, and architectural element with its position, rotation, and material specs (colour, emissive colour, emissive intensity if any). Map each wall in the JSX to its name (front wall, back wall, entrance wall, window wall). Identify which door is D1 and which is D2 on the back wall, and report which one is closer to the window-wall corner. Identify the HVAC plenum corner on the window wall. Report which folder existing canonical room components live in (this is where moved files will go).
3. `src/pages/ProposalsPage.jsx` — how `EntryPathway` and `TheatricalCurtain` are currently mounted, the conditionals wrapping them, the state hooks driving them.
4. `src/hooks/ProposalsProvider.jsx` — full state shape. Identify which keys relate to pathway and curtain.
5. `src/proposals/defaults.js` — every default related to pathway, curtain, and timeline.
6. `src/components/proposals/EntryPathway.jsx` — full geometry: partition positions, card positions, lights, side/mirror logic, exit gap math, and material specs (colour, emissive colour, emissive intensity) for partitions, cards, and any other surfaces.
7. `src/components/proposals/TheatricalCurtain.jsx` — position, dimensions, material colour, rotation.
8. The five firefly files: `FireflyParticles.jsx`, `Blinking.jsx`, `Interaction.jsx`, `Motion.jsx`, `TheWave.jsx`. Current sphere radius value and line number for each.
9. `src/components/proposals/ControlPanel.jsx` (or wherever toggles live) — every toggle and slider.

Then run Grep across `src/` for each of these and report all match locations:

- `showCurtain`
- `showPathway`
- `showPathwayLeft`
- `0.0015`
- `mirror` inside `src/components/proposals/`
- `DEFAULT_SHOW_CURTAIN`
- `DEFAULT_SHOW_PATHWAY`

**Output:** a single report with all of the above. Then **STOP**. Do not proceed to Step 1 until I confirm the report is correct.

**Acceptance criteria for Step 0:**
- All 9 file targets read and reported.
- All 7 grep queries run and reported.
- Zero edits made. Zero files created or moved. Zero git state changes.

---

## Step 1 — firefly visual size fix

**Goal:** revert the broken `0.0015` sphere radius (which is sub-pixel and invisible) to a working visible size across all five firefly files.

**Files:**
- `src/components/fireflies/FireflyParticles.jsx`
- `src/components/fireflies/Blinking.jsx`
- `src/components/fireflies/Interaction.jsx`
- `src/components/fireflies/Motion.jsx`
- `src/components/fireflies/TheWave.jsx`

**Target value:** **stop and flag** to ask Riaan for the target sphere radius before editing any file. Do not pick a value. The prior codebase default of `0.025` is recorded but Riaan has indicated that read as "MASSIVE bulbs" and wants something smaller. Riaan must confirm the exact target radius. Use the same value across all five files.

**Changes:** in each file, change the sphere radius value from `0.0015` to the value Riaan provides. Immediately above the radius line, insert a comment block documenting the rationale. Suggested wording (replace `<RADIUS>` with the agreed value; Riaan can revise the wording):

```
// Real-world LED is 3 mm diameter (radius 0.0015 world units).
// Scaled up to <RADIUS> for visibility at sim camera distances.
// This is a display value, not a physical measurement.
```

**Acceptance criteria for Step 1:**
- All 5 files contain the same agreed radius value at the radius line.
- All 5 files contain a comment block above the radius line documenting the rationale (the suggested wording above with the agreed radius value substituted, or whatever wording Riaan provides).
- `grep -r "0.0015" src/components/fireflies/` returns zero matches.
- Step report quotes the new lines from each file.

---

## Step 2 — curtain becomes part of the canonical room

**Goal:** move the theatrical curtain from the proposals system into the canonical room. Always rendered, no toggle.

**Files:**
- Move `src/components/proposals/TheatricalCurtain.jsx` → the canonical room components folder (identified in Step 0 discovery) using `git mv` (preserves history). **Stop and flag** if the discovery report did not clearly identify where canonical room components live.
- `src/components/Scene.jsx` — mount the curtain.
- `src/hooks/ProposalsProvider.jsx` — remove `showCurtain` from state shape and any setter.
- `src/proposals/defaults.js` — remove `DEFAULT_SHOW_CURTAIN`.
- `src/components/proposals/ControlPanel.jsx` — remove the curtain toggle.
- `src/pages/ProposalsPage.jsx` — remove the curtain mount.

**Changes:**

1. Move the file with `git mv`. Update its import path everywhere it is imported.
2. Mount the curtain inside the canonical room composition in `Scene.jsx`. Place it just inside the window wall, facing inward. Covers the full window-wall length and full room height. **Stop and flag** to ask Riaan for the exact offset distance from the wall AND the exact material colour (Riaan described it as "dark blue theatrical style", but no hex has been agreed). Do not pick a number or a colour.
3. The HVAC plenum corner on the window wall must not be obstructed. If the curtain plane geometry would clip into the plenum corner, **stop and flag**.
4. Remove every reference to `showCurtain`, `DEFAULT_SHOW_CURTAIN`, the curtain toggle, and any `{showCurtain && ...}` JSX conditionals.

**Acceptance criteria for Step 2:**
- `TheatricalCurtain.jsx` exists in the canonical room components folder identified in Step 0. The file at `src/components/proposals/TheatricalCurtain.jsx` no longer exists.
- The curtain is mounted in `Scene.jsx` unconditionally — no JSX conditional wraps it.
- `grep -r "showCurtain" src/` returns zero matches.
- `grep -r "DEFAULT_SHOW_CURTAIN" src/` returns zero matches.
- The curtain toggle is gone from `ControlPanel.jsx`.
- `npm run build` exits 0.

---

## Step 3 — pathway becomes part of the canonical room

**Goal:** move the pathway from the proposals system into the canonical room as the three-wall corridor described in the "Pathway route" section above. Always rendered, no toggle, no left/right variants.

**Files:**
- Move `src/components/proposals/EntryPathway.jsx` → the canonical room components folder (identified in Step 0 discovery) using `git mv`. Keep the filename as `EntryPathway.jsx` — do not rename. **Stop and flag** if the discovery report did not clearly identify where canonical room components live.
- `src/components/Scene.jsx` — mount the corridor.
- `src/geometry/dimensions.js` — add door-position constants if not present.
- `src/hooks/ProposalsProvider.jsx` — remove `showPathway`, `showPathwayLeft`.
- `src/proposals/defaults.js` — remove pathway defaults.
- `src/components/proposals/ControlPanel.jsx` — remove pathway toggles.
- `src/pages/ProposalsPage.jsx` — remove pathway mounts.

**Changes:**

1. Move with `git mv` (no rename). Update import paths everywhere.
2. In the moved file, refactor the geometry to three inner-partition planes:
   - **Front-wall corridor partition** — runs parallel to the front wall, offset toward the room interior by the corridor width. Spans from the entrance-wall side to the window-wall corner.
   - **Window-wall corridor partition** — runs parallel to the window wall, offset toward the room interior by the corridor width. Spans from the front-wall corner to the back-wall corner.
   - **Back-wall corridor partition** — runs parallel to the back wall, offset toward the room interior by the corridor width. Spans from the window-wall corner up to the first door's x-position (the first door is whichever of D1 or D2 Riaan confirmed in Step 0).
   - Partitions meet at right angles at the front/window corner and the window/back corner.
   - The back-wall partition has an opening at the first door's x-position. **The opening's width equals the corridor width.** This is the corridor's exit into the forest.
   - **Entrance-wall side forest partitions** — additional partition planes along the entrance-wall side of the forest. Position so the entrance opens into the start of the front-wall corridor and the rest of the entrance wall is sealed off from the forest. Visitors must traverse the corridor; they cannot reach the forest directly from the entrance.
3. **Corridor width:** **stop and flag** to ask Riaan for the exact corridor width before building geometry. Do not pick a value. Once Riaan provides the value, use the same value for all three segments. The width is the gap between the wall and the partition. Partitions are zero-thickness planes.
4. **Door-position constants:**
   - If `dimensions.js` already has constants for D1 and D2 positions, use them — do not rename.
   - If not, add `DOOR_D1_POSITION` and `DOOR_D2_POSITION` as exports in `dimensions.js`. Derive the values from the door positions shown in `Scene.jsx`.
   - **Stop and flag** if `Scene.jsx` does not show D1 and D2 clearly enough to derive their positions.
5. Delete every line related to the `side` prop and the `mirror` multiplier. There is one configuration only.
6. Place placeholder fact cards on the inner partition wall (the forest-side surface of the corridor). **Stop and flag** to ask Riaan for: total card count, per-segment distribution, minimum spacing, and whether to keep the existing card geometry from the old `EntryPathway.jsx` (size, dimensions, mount style) or use a different geometry. Do not pick numbers or default to the existing geometry without confirmation.
7. Remove every reference to `showPathway`, `showPathwayLeft`, `DEFAULT_SHOW_PATHWAY`, `DEFAULT_SHOW_PATHWAY_LEFT`, the toggles, and any `{showPathway && ...}` JSX conditionals.

**Materials:**

The partitions and the fact cards must be visible at `DEFAULT_TIMELINE_T = 0.78` (full darkness). Non-emissive materials are invisible at that ambient level after ACES tone mapping, so emissive values are required. **Stop and flag** to ask Riaan for the exact material specs before applying any material. Reference the Step 0 discovery report for what materials currently exist on partitions and cards. Do not pick values. The values needed:

- Partition planes: base material (type, colour), emissive colour, emissive intensity.
- Fact cards: base material (type, colour), emissive colour, emissive intensity.

**Lighting (corridor must be visibly lit at `DEFAULT_TIMELINE_T = 0.78`):**

The corridor is the educational entry. It must be visibly lit at the default darkness timeline position. **Stop and flag** to ask Riaan for the lighting spec before placing any lights. Do not pick values. The values needed:

- Number of point lights and spacing along the corridor.
- Light colour (hex).
- Light intensity.
- Light distance.
- Light height (y).

Constraint: the lighting must not spill across the partitions into the forest. Once Riaan provides values, verify this constraint and stop-and-flag if the values would cause spillage.

**Acceptance criteria for Step 3:**
- `EntryPathway.jsx` exists in the canonical room components folder identified in Step 0. The file at `src/components/proposals/EntryPathway.jsx` no longer exists.
- The corridor is mounted in `Scene.jsx` unconditionally.
- Three corridor partitions wrap front, window, and back walls in that order, terminating at the first door (whichever of D1 or D2 Riaan confirmed).
- Back-wall partition has an opening at the first door's x-position, with width equal to the corridor width. No opening near the other door.
- Entrance-wall side forest partitions are present and seal the forest from the entrance.
- D1 and D2 positions defined as constants in `dimensions.js`.
- Fact cards distributed across three segments per the spec Riaan provides at the stop-and-flag in change 6.
- `grep -r "showPathway" src/` returns zero matches.
- `grep -r "showPathwayLeft" src/` returns zero matches.
- `grep -rn "mirror" <new EntryPathway.jsx path>` returns zero matches.
- `grep -rn "side" <new EntryPathway.jsx path>` returns no matches related to the old `side` prop (only matches related to actual geometry like `side: THREE.DoubleSide` are acceptable).
- `npm run build` exits 0.

---

## Step 4 — clean up

**Goal:** remove all old toggle infrastructure and dead references.

**Changes:**

1. `ProposalsPage.jsx` — remove the old `EntryPathway` and `TheatricalCurtain` mounts.
2. `ProposalsProvider.jsx` — remove `showCurtain`, `showPathway`, `showPathwayLeft` from state shape and their setters.
3. `defaults.js` — remove `DEFAULT_SHOW_CURTAIN`, `DEFAULT_SHOW_PATHWAY`, `DEFAULT_SHOW_PATHWAY_LEFT`.
4. `ControlPanel.jsx` — remove curtain and pathway toggles.
5. Run `grep -rE "showCurtain|showPathway|showPathwayLeft|DEFAULT_SHOW_CURTAIN|DEFAULT_SHOW_PATHWAY" src/`. If any matches remain, remove them.

**Acceptance criteria for Step 4:**
- The grep above returns zero matches.
- `npm run build` exits 0.

---

## Step 5 — verification

**Goal:** confirm the final state.

**Commands to run:**
- `npm run build`
- `npm run lint`

Both must exit 0.

**Final report:**

1. Full JSX tree of `Scene.jsx` showing the curtain and corridor mounted unconditionally inside the canonical room.
2. Final geometry of all three corridor segments: which wall each runs along, start point, end point, length, orientation, width.
3. D1 and D2 positions and which constants define them. Confirm which one is the first door (used as the corridor exit) and confirm the other is not part of the corridor route.
4. Entrance-wall side forest boundary partitions: positions and dimensions.
5. The five firefly files with their new radius values and the comment block.
6. Output of every grep command listed in Steps 1-4 (must all return zero matches as specified).
7. `npm run build` and `npm run lint` output.

---

## Stop-and-flag rules (do not silently work around — stop and ask in chat)

- Step 0 reveals that file paths or exports differ from what this prompt assumes.
- The canonical room composition is not in `Scene.jsx`. Find the actual file, report it, stop.
- Any of the four walls (front, back, entrance, window) cannot be confidently identified in `Scene.jsx`.
- Doors D1 and D2 are not clearly identifiable on the back wall, or which one is closer to the window-wall corner (the "first door") cannot be determined from the geometry.
- The HVAC plenum corner on the window wall is not represented in the geometry, or the curtain or corridor would clip into it.
- `dimensions.js` has no obvious place to add door-position constants.
- Existing geometry in the canonical room conflicts with where the corridor needs to go.
- A `git mv` would lose history because the file is not under version control.
- Any change requires touching files not named in this prompt.

Do not guess. Do not silently expand scope. Do not assume an export exists without using Grep first.
