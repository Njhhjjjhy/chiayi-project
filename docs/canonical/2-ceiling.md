# Ceiling – canonical reference

## Status

Canonical. Replaces the flat-panel direction (archived). The sculptural direction set in the 21 May 2026 meeting between Riaan and Corbett is the new locked direction. Sub-values are TBD pending the carpenter visit and the paper mache prototyping weekend – flagged explicitly below.

## Visual reference

The codebase contains a visual reference image at root level: **`meeting-refrence-3.webp`**.

This image was endorsed by Corbett in the 21 May meeting as a useful visual anchor for the ceiling direction. Claude Code MUST read this image directly when building any ceiling geometry to understand the visual language.

The visual language captured in the reference and reinforced in the meeting:

- **Repetition with variation.** Many forms of related but non-identical shape, scale, and orientation.
- **Suspended elements.** Forms hang from above; they read as floating, not built up from below.
- **Organic / grown.** Forms feel emerged from the space, not placed into it.
- **Density variation.** Some areas clustered, some sparse, some empty.
- **Sculptural geometry.** Non-square forms preferred. Blob-like, bowl-like, irregular outlines.
- **Architecture from the space itself.** The ceiling IS the spatial experience, not a backdrop to it.

When in doubt about a sculptural decision, the principle to apply: does this feel grown or placed? Grown is correct.

## Organising principle

Fireflies = floating. The ceiling MUST feel suspended, scattered, weightless, alive. It MUST NOT read as a rigid repeated grid.

- Repeated forms with variation, NOT uniform shapes.
- Forms that feel grown, NOT placed.
- The room MUST work as a spatial sculpture even before the firefly lighting is added.

## Form direction

- Dropped ceiling at varied heights, angles, and densities.
- Non-square flat forms preferred over square forms.
- Blob-like, bowl-like, or otherwise organic suspended forms in scope.

### Material options (under consideration – NOT locked)

| Option | Notes |
|---|---|
| Custom plywood pieces, locally cut, non-square forms | Carpenter-fabricatable |
| Paper mache built over chicken wire armatures | Tested in prototyping weekend |
| Hybrid: plywood structural + paper mache sculptural | Most likely outcome |
| Fallback: lightweight standard ceiling panels (60cm or 120cm) | ONLY if sculptural proves unworkable |

The paper mache prototyping weekend (scheduled) produces material samples. Final material decision waits on those samples.

## Heights

| Value | Y (metres) |
|---|---|
| Working ceiling line | 3.52 |
| Real ceiling | 4.2 |
| Plenum gap | 0.68 |
| Suspended element heights | VARIED, TBD – NOT a single plane |
| Minimum clearance over walkable forest area | TBD. Working assumption: Y ≥ 2.0. Verify install-day |

## Suspension and support

- Cable- or grid-supported hanging system above the working ceiling line.
- Specific support method (rail, grid, individual cable points): TBD with carpenter.
- Carpenter has KTV experience with integrated lighting – leverage for hidden wiring inside ceiling structure.
- Wire management critical. Room MUST look intentional with lights on, NOT only in the dark.

## Firefly hardware (concrete, Corbett-sourced)

| Property | Value |
|---|---|
| Total modules | 110 |
| Per-module size | ~cigarette-pack |
| Per-module wires | 8 dual-strand |
| Per-module LEDs | 16 |
| **Total LEDs** | **110 × 16 = 1,760** |

Replaces the prior 882 figure (which was derived from a 14×14 grid that no longer exists). Sim spec MUST be re-derived against 1,760.

## Module connectivity

- Daisy-chain between modules. Christmas-light-style.
- Control: Arduino, Raspberry Pi, or cheap PC.
- Programming: simple grid-like x/o matrix logic.
- Per-module: randomised behaviour algorithms.
- Cross-module: programmed movement patterns possible (flows across ceiling, transitions between zones).

## LED distribution principle

Distribution MUST be uneven. Real fireflies cluster unevenly and leave dark gaps.

- NOT every ceiling element receives the same LED density.
- Some elements: many LEDs.
- Some elements: few LEDs.
- Some elements: dark (no LEDs).
- Distribution algorithm: TBD. Driven by sculptural ceiling form once that form is locked.

## LED colour

- Hex: `#00FF00` (pure green).
- LOCKED.

## LED rendering (simulation)

- Sphere radius: 0.025 (visual legibility).
- Material: self-emissive.
- Bloom: `luminanceThreshold = 1.0`, `toneMapped = false` on emissive material.
- One firefly population, two surface families: ceiling elements and walls. Rendering parameters MUST match between them.

## Material aesthetic (simulation)

- Matte near-black surfaces for all ceiling elements.
- Low albedo.
- Geometry felt, NOT seen – in the dark phase, ONLY the green LEDs should read.
- Self-emissive base material REQUIRED. Tone mapping crushes non-emissive at full darkness.

## Build sequence (likely order – NOT locked)

1. Finalise room shape and partition/cabinet system.
2. Determine support method (grid or cables).
3. Choose ceiling element material and shape (paper mache weekend feeds in).
4. Install and test firefly modules section by section.
5. Manage wiring, hide technical components cleanly.
6. Layer in lighting, sound, atmospheric additions.

Build happens in phases. NOT solved entirely in advance.

## What is locked

- Sculptural direction (NOT flat panels).
- 110 modules × 16 LEDs = 1,760 total LEDs.
- LED colour: `#00FF00`.
- Uneven distribution principle.
- Matte near-black surface.
- Self-emissive material in simulation.
- Visual reference image: `meeting-refrence-3.webp` at codebase root.

## Stop-and-flag – do NOT infer defaults

The following are unresolved. Do NOT pick "reasonable defaults" in any build prompt. Stop and flag if a build prompt requires one of these:

1. Specific ceiling element forms (shape, size, count).
2. Height variation range across elements.
3. Distribution of the 110 modules across elements.
4. LED distribution algorithm per element.
5. Support system (rail, grid, cable).
6. Material choice (plywood, paper mache, hybrid).
7. Minimum clearance over walkable areas.
8. Whether ceiling elements extend over `pathway` zone or only `forest` zone.

All wait on carpenter visit + paper mache weekend.

## Research instruction for build prompts

When a build prompt needs Claude Code to produce sculptural placeholder geometry for the ceiling, the prompt MUST include the following research instruction:

> Research current contemporary practice in suspended sculptural ceiling installations. Look at organic-form repetition, varied-scale element systems, and ceiling-as-spatial-sculpture references. Do NOT name any individual designers, studios, or artworks in code, comments, filenames, or commits. Capture the visual principles only: repetition with variation, organic suspended forms, density variation across the canopy. Cross-reference against the visual reference image at `meeting-refrence-3.webp`.

This research happens once per build prompt that needs it. The results inform the geometry, never the naming.
