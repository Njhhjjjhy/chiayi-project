# Slice 4 — pathway wayfinding lights (three visual proposals)

## Reading list

Before doing anything else, read these files in full:

- `docs/canonical/1-room-spec.md` — room geometry, pathway zone, partition layout, hard simulation rules.
- `docs/canonical/8-open-items.md` — open items list, in case anything blocks this slice.

Do not read other canonical docs unless Step 0 discovery surfaces a need. Do not read the previous slice handoffs.

## Goal

Add wayfinding lights along the `pathway` floor edges. The lights help visitors see where the floor is in the dark, and guide them along the L-shaped pathway from the entry gap to the forest opening.

This slice does NOT pick a final look. Build three visual variants. Capture diagnostic screenshots of each. The designer (Riaan) picks the one that feels right after seeing them side by side. The other two get deleted in a follow-up slice.

## Three variants to build

All three serve the same wayfinding purpose. They differ in physical form.

### Variant A — floor edge LED strip

A thin continuous glowing line hugging the pathway floor edges. Like a tape light. Clean, modern, low profile.

### Variant B — rope lighting

A soft glowing rope along the pathway floor edges. Warmer and more diffuse than the strip. Reads as ambient mood rather than a clinical line.

### Variant C — overhead pool lights

Small downward spots from above the pathway, casting circular pools of light on the floor at regular intervals. Not a continuous edge — discrete pools that mark the path.

All three are wayfinding. All three light the pathway floor. They differ in source (floor edge vs floor edge vs overhead) and form (continuous strip vs continuous rope vs discrete pools).

## Pathway floor edges (placement reference for variants A and B)

From `1-room-spec.md`, the pathway is L-shaped. There are four floor-edge runs along the pathway:

1. Along `back-wall` at X=0, from Z=0 to Z=8.78.
2. Along `window-wall` at Z=8.78, from X=0 to X=6.43.
3. Along `pathway-partition-vertical` at X=1.5, from Z=0 to Z=7.28 — pathway side (the X<1.5 face).
4. Along `pathway-partition-horizontal` at Z=7.28, from X=1.5 to X=6.43 — pathway side (the Z>7.28 face).

All four runs get the lighting for variants A and B.

For variant C, the overhead pools should be evenly distributed along the same L-shaped pathway, spaced so a visitor can always see at least one pool ahead. Spacing TBD by Claude Code — propose a default in Step 1.

## Faint leak into forest perimeter

From `1-room-spec.md` line 167: "LED strip lighting along `pathway` floor edges, faintly leaking into forest perimeter."

For variants A and B, the emissive material can spill slightly past the partition edge into the forest side. Subtle, not a wash. The light comes from the strip/rope being slightly emissive into the room, not from a separate ambient band.

For variant C, no leak — overhead spots are downward-focused and don't spill into the forest.

## Constants — single source of truth

All new constants go in `src/geometry/dimensions.js` from the first edit. Do NOT declare them locally first. The slice 2 `CABINET_T` duplication mistake must not repeat.

Propose the constant list in Step 1 before building. Likely candidates (Claude Code may add or remove):

- `PATHWAY_LED_HEIGHT` — height above floor for variants A and B (e.g. 0.02m, near floor).
- `PATHWAY_LED_THICKNESS` — visual thickness of strip/rope.
- `PATHWAY_LED_COLOR` — colour value, e.g. warm white `#fff4e0` or similar.
- `PATHWAY_LED_INTENSITY` — emissive intensity.
- `PATHWAY_POOL_COUNT` — number of overhead pools for variant C.
- `PATHWAY_POOL_RADIUS` — pool size on floor for variant C.
- `PATHWAY_POOL_INTENSITY` — pool brightness for variant C.

Propose final names and default values in Step 1. Lock with Riaan before Step 2 build.

## File structure

- New file: `src/components/lighting/PathwayEdgeLights.jsx`. This file holds all three variants behind a variant switch.
- New constants: `src/geometry/dimensions.js` (Pathway lighting section).
- Mount the component in `Room.jsx` or wherever lighting components are mounted (Step 0 to confirm).

The variant switch can be a prop, a URL param, or a config flag. Step 1 proposes the mechanism. Default to the same pattern used for the existing variant system (proposals/wall treatments) if one already exists.

## Do-not-touch list

These must not be modified during this slice. If a change to one is needed, stop and flag.

- `src/components/room/Floor.jsx` — slice 3 just landed, do not touch.
- `src/components/room/WallLighting.jsx` — slice 2 just landed, do not touch.
- `src/components/room/EntranceWallPartition.jsx` — slice 2.
- `CABINET_T` and Floor section constants in `dimensions.js` — slice 2 and slice 3.
- All firefly behaviour files in `src/components/fireflies/`.
- All proposal config files unless the variant switch requires it (flag if so).
- `panelSpec.js`, `parkMillerRng.js`, `Walls.jsx`, `Column.jsx`, `Ceiling.jsx`, `TheatricalCurtain.jsx`, `LuffaWall.jsx`, `Doors.jsx`, `Windows.jsx`, `Pathway.jsx`.

## Step 0 — read-only discovery

Do not edit anything. Report:

1. Where lighting components are mounted in the scene graph. Specifically: where is `WallLighting.jsx` mounted, and is there a parent group for lighting components?
2. Whether a variant switch mechanism already exists in the codebase (URL param, prop drilling, config flag, proposals system). Name the file and pattern.
3. Whether the pathway geometry has visible bounds in the current sim. Specifically: are the pathway floor edges currently distinguished from the forest floor in any way?
4. Any blockers — do any existing components occupy the floor-edge volume where variants A or B would live? Do any existing overhead spots conflict with variant C?
5. Any do-not-touch violations the slice as written would force.
6. Step 0 before-baselines captured: `<timestamp>-slice4-before-<preset>.png` for the four standard presets (standing, entrance-wall, back-wall, topdown), saved to `baselines/`.

Stop after Step 0. Do not proceed to Step 1.

## Step 1 — decisions

After Riaan reviews the Step 0 report, propose:

1. Final constant names and default values.
2. Variant switch mechanism (which one, with one-line rationale).
3. Variant C pool count and spacing default.
4. Strip/rope thickness defaults for A and B.
5. Colour and intensity defaults — warm white range for variants A and B unless discovery surfaces a reason to deviate.
6. Anything else discovered in Step 0 that needs a decision before Step 2.

One question per line. Wait for answers. Do not proceed to Step 2 until all are answered.

## Step 2 — build

Apply the decisions. Single component file with three variants. Constants in `dimensions.js`. Mount the component. Build + lint check after the edit.

Report what landed:

- Files changed, with line counts before/after.
- Constants added to `dimensions.js`, with section header and values.
- Variant switch mechanism in place.
- Build clean: yes/no.
- Lint clean: yes/no.

## Step 3 — verification

Capture diagnostic screenshots of each variant in a known-good viewing condition. Use `scripts/diagnostic-floor.mjs` if it works for the pathway angle; if not, propose a new diagnostic camera position before capturing.

For each of the three variants (A, B, C):

1. Switch the variant flag to that variant.
2. Capture the four standard presets: `<timestamp>-slice4-after-variant-<A|B|C>-<preset>.png`.
3. Capture one pathway-favouring diagnostic: `<timestamp>-slice4-after-variant-<A|B|C>-diagnostic-pathway.png`. Camera angle should show a clear view along the pathway, with at least one corner of the L visible.

Result is 5 screenshots × 3 variants = 15 screenshots in `baselines/`.

In the verification report:

- List all 15 screenshots with paths.
- For each variant, one short paragraph: what reads, what doesn't, any artefacts.
- Confirm do-not-touch list intact.
- Confirm before-baselines unchanged where they should be unchanged.

Do not pick a winner. The designer picks after seeing the screenshots.

## Hard rules (apply throughout)

- Sentence case in all code comments, commit messages, and any new docs. First word capital, proper nouns capital, everything else lowercase.
- Kebab-case in backticks for architectural identifiers in comments: `pathway`, `back-wall`, `window-wall`, etc.
- No artist, designer, studio, or artwork names anywhere — code, comments, filenames, variable names, none of it.
- No em-dashes.
- No emojis.
- All measurements in metres. Y=0 is floor level.
- Surface-flush rule: any geometry against a wall surface must be nudged 5–10mm inward.
- Self-emissive materials required for anything visible at full darkness.
- One finding per Step 0 / Step 1 / Step 3 line item. Do not stack.
- If a fact is unknown, flag and wait. Do NOT guess. Do NOT pattern-match.

## Flag-and-wait protocol

If at any step:

- The reading list reveals a contradiction.
- Step 0 surfaces a blocker not anticipated above.
- A constant value depends on physical-world knowledge only Riaan has.
- The do-not-touch list as written conflicts with the slice goal.

Stop. State the problem in one sentence. Wait for Riaan's decision. Do not proceed.
