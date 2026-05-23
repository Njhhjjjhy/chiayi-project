# Proposals v2 / v3 / v4 — build three new firefly room variants

## Status

Add three new proposal variants alongside existing `fireflies-suspended-sky` and `fireflies-within-reach`. Existing two stay untouched. Skeleton stays untouched. Each new proposal is a distinct spatial logic for where the 1,760 LEDs live in the `forest`.

Pattern: single-direction-locked slice. Direction is locked by this prompt. Step 1 picks sim defaults. Open items flagged.

## Out of scope (read first)

- Canonical reference markdown docs for the three new proposals. Written separately by designer in Claude.ai chat.
- Wake-unit behaviour algorithms. Existing module wake system stays; only LED positions change.
- IR sensor architecture for new geometries.
- Audio per-variant tuning.
- Performance optimisation. The `FirefliesPage` chunk size growth is noted but not blocking.
- Modifying `fireflies-suspended-sky` or `fireflies-within-reach` variants in any way.
- Modifying skeleton elements: `pathway`, partitions, `column`, blackout curtain, foam mat floor, loofah wall, seating, audio.
- Renaming `LuffaWall.jsx` to match the loofah canon. Pre-existing, out of scope.
- Fixing the `folded-sky` → `fireflies-suspended-sky` doc/code slug mismatch. Pre-existing.
- Fixing the `meeting-refrence-*.webp` typo. Load-bearing in docs.
- Backfilling slice closure docs for slices 5–8.
- Migrating existing scattered LED / curtain / firefly module-local constants into `dimensions.js`. Pre-existing scatter stays.
- Building a generic form/surface abstraction (the "clean long-term move"). Per-variant placement logic is the call for this slice.

## Read before Step 0

- `docs/1-room-spec.md`
- `docs/2-ceiling.md`
- `docs/3-loofah-wall.md`
- `docs/4-folded-sky-proposal.md` (canonical content for `fireflies-suspended-sky` variant — note slug mismatch is known)
- `docs/5-within-reach-proposal.md`
- `docs/8-open-items.md`

Canonical docs are source of truth for skeleton dimensions, names, locked elements. This prompt does NOT restate them.

## Codebase context (verified by prior discovery — do not re-discover)

The following is established. Step 0 does light verification of edge cases only.

- Route: `/fireflies/:variantId`. Defined in the app routing.
- Existing variantIds in code: `fireflies-suspended-sky`, `fireflies-within-reach`.
- Variant state lives in `ProposalProvider`; all variants share one scene tree. Per-variant geometry differences are gated by flags on `proposalVariants`.
- The only existing per-variant geometry switch today is `hasBranches`. Reads of this flag occur in `Room.jsx`, `SculpturalCeiling.jsx`, `CeilingLEDs.jsx`.
- LED population is generated in `ceilingForms.js` — 1,760 LEDs across 110 modules across 40 forms. The pipeline assumes ceiling forms as the parent geometry. It does NOT support per-module Y overrides or non-ceiling parent geometry.
- `SculpturalCeiling` and `CeilingLEDs` do NOT currently accept "hide geometry" or "kill LED population" props. These must be added in this slice.
- Floor material in code is foam mat (`#1a1a1a`, roughness 1.0). No marble residue.
- Constants: `dimensions.js` exists but does NOT have `MODULE_*`, `LED_*`, `FIREFLY_*`, `CURTAIN_*` prefix sections. LED/curtain values are scattered as module-local consts. New constants for this slice land in `dimensions.js` with new prefix sections per slice 6/7 discipline.
- Diagnostic preset toggle: `?mode=experience` (ambient 0.01) vs verification mode (ambient 2.4). `?grid=off` works on topdown.
- Capture scripts are per-slice: `capture-sliceN-*.mjs`. This slice creates new pair(s) following the same convention.
- Reference image library: `reference/` (singular, gitignored, NOT reachable from running app). Adding new reference images served by the app needs explicit copy into a served path. Flag if Step 1 calls for this.
- Naming collision: `swarm` is already in use as `drifting-swarm` firefly behaviour. The new variant uses `fireflies-flock` slug to avoid collision.

## Design source of truth (locked)

### Proposal v2 — `fireflies-grove`

- **Spatial logic:** LEDs live on floor-rooted vertical stems scattered across `forest`. Visitor walks between fireflies, not under them.
- **Adds:** dark matte vertical stems with weighted bases sitting on foam mat. LEDs cluster in upper portion of each stem.
- **Subtracts:** LEDs from sculptural ceiling forms. Ceiling geometry stays; LED population on ceiling is zero.
- **Visitor relationship:** stems at varied heights (waist to near-ceiling). Touch-close. Flashlights aim horizontally and upward at stems.
- **Module mapping (locked):** 1 module = 1 stem. Module's 16 LEDs cluster within the upper portion of the stem.

### Proposal v3 — `fireflies-flock`

- **Spatial logic:** LEDs live as a 3D point cloud of hanging modules suspended on individual fine threads from the working ceiling line, forming an emergent flock shape in the middle volume of `forest`.
- **Adds:** 110 modules hung individually at varied Y positions on fine threads from the working ceiling (Y=3.52).
- **Subtracts:** sculptural ceiling forms entirely. Plenum stays. No forms below it.
- **Visitor relationship:** visitor walks under and through the lower edges of the flock. Flashlights aim up into the cloud volume.
- **Module mapping (locked):** module Y positions vary widely across the working ceiling height range. Each module's 16 LEDs cluster within a tight radius of its anchor.

### Proposal v4 — `fireflies-lanterns`

- **Spatial logic:** LEDs live inside floor-standing translucent fibre pillars. Pillars glow from within like creatures in the dark.
- **Adds:** standing pillars with internal LED clusters. Construction echo of loofah wall (bamboo armature + translucent fibre skin). Hidden-light logic — no direct LED visibility from outside.
- **Subtracts:** LEDs from sculptural ceiling forms (zero or reduced — Step 1 decision). Ceiling geometry stays.
- **Visitor relationship:** visitor walks between pillars in clusters across `forest`. Touch + sight. Pillars are tall companions.
- **Module mapping (locked):** modules distributed unevenly across pillars (some pillars dense, some sparse, some dark). Pillar count is a Step 1 decision.

### Variant-specific overrides table

| Element | grove (v2) | flock (v3) | lanterns (v4) |
|---|---|---|---|
| Ceiling forms geometry | render | hidden | render |
| Ceiling forms LED population | zero | n/a | zero or reduced |
| Stems (new) | 110 stems | none | none |
| Hanging modules (new) | none | 110 individual hangers | none |
| Pillars (new) | none | none | 12–20 (Step 1) |
| Floor | foam mat (unchanged) | foam mat (unchanged) | foam mat (unchanged) |
| Loofah wall | unchanged | unchanged | unchanged |

## Architecture (locked)

Per-variant LED placement logic. Each new variant gets:

- **New geometry component:** `GroveStems.jsx`, `FlockHangers.jsx`, `LanternPillars.jsx`. Placed alongside existing variant components.
- **New LED placement component:** `GroveLEDs.jsx`, `FlockLEDs.jsx`, `LanternLEDs.jsx`. Parallel to `CeilingLEDs.jsx`. Each generates 1,760 LEDs across 110 modules using the same module-radius cluster pattern but on the new parent geometry.
- **New flag on `proposalVariants`:** `ledSurface: 'ceiling' | 'grove' | 'flock' | 'lanterns'`. Existing variants get `ledSurface: 'ceiling'`. Replaces nothing — adds to existing `hasBranches` flag, doesn't replace it.
- **`SculpturalCeiling` accepts new prop `hidden: boolean`.** When true, component does not render geometry. Used by flock variant.
- **`CeilingLEDs` accepts new prop `disabled: boolean`.** When true, component does not generate LED population on ceiling forms. Used by grove and lanterns variants.
- **`Room.jsx` reads `ledSurface`** and conditionally mounts the new geometry + LED components per variant.

Existing `hasBranches` switch stays untouched. Existing two variants render exactly as before.

## Step 0 — final verification (read-only)

Codebase context above is established. Step 0 verifies only the items below before proceeding to Step 1. If any item conflicts with the context above, stop and flag.

1. Open `proposalVariants` definition file. Quote the current variant entries with all flags (including `hasBranches`). Confirm where each gets read in the scene tree (file paths and line numbers).
2. Open `SculpturalCeiling.jsx` and `CeilingLEDs.jsx`. Quote each component's prop signature. Confirm the smallest surface for adding `hidden` and `disabled` props (default `false`, no behaviour change for existing callers).
3. Open `ceilingForms.js`. Confirm the module cluster radius constant name and value (was reported as the existing module-radius pattern). The new placement components will use the same cluster pattern but with different parent geometry.
4. Open `Room.jsx`. Identify the location where variant-conditional geometry mounts today. Confirm the new geometry components can mount alongside without restructuring.
5. Open `LuffaWall.jsx` (the loofah wall component). Quote prop signature. Confirm it stays untouched across all three new variants.
6. Open `dimensions.js`. Quote the existing section structure and any prefix conventions in active use. Confirm new sections `GROVE_*`, `FLOCK_*`, `LANTERN_*` would land cleanly.
7. Find the most recent `capture-sliceN-*.mjs` script. Quote its structure. Confirm the new slice's capture script(s) follow the same shape.
8. Confirm `npm run dev`, `npm run lint`, `npm run build` all currently pass.

**STOP at end of Step 0.** End with `Step 0 summary`: confirmed, flagged (if any), ready for Step 1. Wait for designer response before Step 1.

## Step 1 — propose values

Proceed only after designer responds to Step 0.

Propose specific implementation values for each new variant. Do NOT pick reasonable defaults silently. Every value depending on physical-world or designer judgement gets explicitly flagged with a single-select widget or stop-and-flag bullet.

### v2 grove — propose

- Stem count. Default proposal: 110 (1:1 with modules). Flag if designer wants fewer stems with multi-module clusters.
- Stem height distribution. Propose 3 tiers with ratio. Flag specific tier values (waist / overhead / near-ceiling).
- Stem material: radius, hex colour, emissive intensity (matte but non-zero per ACES tone mapping rule).
- LED Y-distribution along stem (upper third, upper half, or other). Flag.
- Placement algorithm across `forest`. Propose principle: uneven, cluster-biased, dark gaps. Flag specific parameters (cluster count, min spacing, dark-zone count).
- Base footprint constant. Minimum walkable clearance 0.4m between stems and from `pathway-partition-vertical`. Flag.
- File structure: new `GroveStems.jsx` (geometry) + `GroveLEDs.jsx` (LED placement). Constants prefix `GROVE_*`.

### v3 flock — propose

- Module Y distribution. Propose principle: bias toward flock-curve shape, denser at one end, sparser at other. Flag specific Y range and density curve.
- Thread material: visible or invisible in render. Flag.
- Anchor pattern at working ceiling: even grid, jittered grid, or full random. Flag.
- Confirm `SculpturalCeiling hidden={true}` is the correct override path for this variant. Step 0 should have confirmed.
- File structure: new `FlockHangers.jsx` (thread geometry, if visible) + `FlockLEDs.jsx` (LED placement). Constants prefix `FLOCK_*`.

### v4 lanterns — propose

- Pillar count. Range 12–20. Propose specific number. Flag.
- Per-pillar dimensions: diameter, height tiers, dome shape. Flag.
- Pillar placement: 3–4 zones in `forest` with walking gaps. Propose specific zone centres. Flag.
- Module-to-pillar mapping: how 110 modules distribute across N pillars (uneven). Flag specific counts.
- Internal LED arrangement per pillar. Flag.
- Skin material: warm internal lighting through translucent skin. Flag specific hex and intensity (echo of loofah wall — internal source never visible).
- Ceiling forms LED treatment: zero or reduced. Flag specific reduced intensity if not zero.
- File structure: new `LanternPillars.jsx` (geometry) + `LanternLEDs.jsx` (LED placement). Constants prefix `LANTERN_*`.

### Cross-cutting

- `proposalVariants` entries for the three new slugs with `ledSurface` and any per-variant flags.
- Variant picker UI (if exists): three new entries.
- Diagnostic preset additions: propose 1–2 variant-specific camera views per variant. Examples: `grove-eye-level`, `flock-looking-up`, `lanterns-cluster-walk`.
- Capture scripts: propose one capture-slice script for the whole slice, or three (one per variant). Pick per existing convention.

**STOP at end of Step 1.** End with a list of every value awaiting designer approval. Wait for designer response before Step 2.

## Step 2 — build

Proceed only after every Step 1 value is locked.

Build order:

1. Add `ledSurface` flag to `proposalVariants` for existing two variants (`ledSurface: 'ceiling'`). NO behaviour change.
2. Add `hidden` prop to `SculpturalCeiling` (default `false`).
3. Add `disabled` prop to `CeilingLEDs` (default `false`).
4. Verify existing two variants still render identically (run `dev`, check `fireflies-suspended-sky` and `fireflies-within-reach` visually).
5. Build grove: `GroveStems.jsx`, `GroveLEDs.jsx`, `GROVE_*` constants. Wire into `Room.jsx` via `ledSurface === 'grove'` branch. Variant gets `disabled: true` on `CeilingLEDs`.
6. Build flock: `FlockHangers.jsx`, `FlockLEDs.jsx`, `FLOCK_*` constants. Wire into `Room.jsx` via `ledSurface === 'flock'` branch. Variant gets `hidden: true` on `SculpturalCeiling`.
7. Build lanterns: `LanternPillars.jsx`, `LanternLEDs.jsx`, `LANTERN_*` constants. Wire into `Room.jsx` via `ledSurface === 'lanterns'` branch. Variant gets `disabled: true` on `CeilingLEDs` (or reduced intensity per Step 1).
8. Wire new variant picker entries (if picker exists).
9. Add capture-slice script(s) per Step 1 convention.

Self-emissive material on every visible structural element (stems, threads if visible, pillar skins). Non-emissive surfaces crush to black at `BLUE_HOUR_TIME` under ACES tone mapping. Use load-bearing zero constants for material concept locks per slice 5 followup pattern.

Constants discipline:

- New constants land in `dimensions.js` with section prefixes `GROVE_*`, `FLOCK_*`, `LANTERN_*`.
- Pre-existing scattered LED/curtain consts stay where they are (out of scope).

End Step 2 with build summary: files created, files modified, constants added, deviations from Step 1 (flag explicitly — do not silently change values). Run `lint`, `build`, `dev`. All must pass. Manually visit `/fireflies/fireflies-suspended-sky`, `/fireflies/fireflies-within-reach`, `/fireflies/fireflies-grove`, `/fireflies/fireflies-flock`, `/fireflies/fireflies-lanterns`. All must render without console errors.

**STOP at end of Step 2.** Wait for designer to confirm before Step 3.

## Step 3 — verify

For each of grove, flock, lanterns, capture:

- Standard 4 diagnostic presets (`standing`, `entrance-wall`, `back-wall`, `topdown`) in verification mode (ambient 2.4).
- 1–2 variant-specific diagnostic presets agreed in Step 1, in experience mode (`?mode=experience`).
- topdown uses `?grid=off`.

Also capture existing two variants in the standard 4 presets to confirm no visual regression. File names: `<timestamp>-proposals-v2v3v4-<variantId>-<preset>.png`.

Visual sanity checks per new variant:

- **grove:** stems read as walkable grove, not uniform forest of identical sticks. Distribution uneven. LEDs read as living things on stems, not Christmas-light strands.
- **flock:** hanging modules form coherent flock shape from below, not a uniform grid. From eye-level looking up, the flock feels like a presence overhead.
- **lanterns:** pillars feel like companions in the dark, not lamps. Glow through skin is soft, not bright. Walking lines between pillars feel intentional.

Existing variants: pixel-identical to last capture set, or flag any difference.

Report per variant: pass, marginal, or fail. Flag any issue requiring a tuning pass.

End Step 3 with `Slice close` listing final constant values for each new variant and any deferred items.

## Hard rules

Hold to existing canon (sentence case, kebab-case identifiers in backticks, `SCREAMING_SNAKE_CASE` constants, no em-dashes, no emojis, no artist/designer/studio/artwork names, no compass directions, no "corridor", metres everywhere, Y=0 floor, single-source-of-truth constants in `dimensions.js` for NEW constants this slice).

Specific to this slice:

- Foam mat floor is canonical. Marble is dead. Confirmed in code.
- Self-emissive materials on every visible structural element. Non-emissive crushes to black under ACES at `BLUE_HOUR_TIME`.
- Existing `fireflies-suspended-sky` and `fireflies-within-reach` variants are NOT touched (except adding `ledSurface: 'ceiling'` flag, which is a no-op for them).
- Skeleton elements per canonical docs are NOT touched.
- Per-variant placement logic (parallel components), NOT a generic form abstraction refactor.
- Slug v3 is `fireflies-flock`. Do NOT use `swarm` (collides with `drifting-swarm` firefly behaviour).
- New variant components and LED placement components live alongside `ceilingForms.js` / `CeilingLEDs.jsx` patterns — not as extensions of them.
- One finding per Claude Code message during discovery and propose phases.
