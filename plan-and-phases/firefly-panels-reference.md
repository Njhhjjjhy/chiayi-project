# Firefly panels R3F review tool: reference

## What this document is

A design brief for the R3F review tool for the Firefly Immersive Experience. This document specifies design intent and the open areas that must be resolved with Riaan before implementation. It is not a build spec. The build spec (`firefly-panels-spec.md`) is produced by Claude Code after interviewing Riaan on the open areas listed at the end of this document.

This supersedes `claude-code-prompt-firefly-proposals-r3f.md`, which mistakenly proposed five whole-room themes and locked in carpentry materials. Ignore and delete any output from that earlier prompt.

## Context

The installation lives at Nanghia, a social enterprise in Laiji Village, Alishan Township, Taiwan, run by Corbett Wall. Indoor, approximately 10 × 10 m. Simulates a mountain sunset fading to darkness, at which point fireflies emerge. Experiential benchmark: teamLab. Cultural connection: the Tsou indigenous community and the Alishan ecosystem. Firefly species of interest: Luciola cerata and Luciola filiformis.

## What the R3F tool does

A single-room review tool. The reviewer walks through the installation in first person, toggles an IR flashlight that wakes fireflies, scrubs the lighting cycle, and switches the big wall between five panel-based treatment variants. Everything else (ceiling, side walls, floor, piano corner, firefly system, flashlight, lighting cycle, corridor) stays constant across all five variants.

## Construction method

Panels. The entire installation uses modular panel construction for every built surface: wall treatments above the wainscoting, the ceiling topology, the corridor walls. This is non-negotiable. Reasons: modular, cost-effective, executable by a small team, consistent with the Filipista joinery reference.

## The room

- 10 × 10 m floor, single zone
- 4.2 m ceiling height between beams, 3.52 m at beam soffit
- Beams run North to South, roughly 1.2 m on centre
- Floor: polished grey marble, 60 × 60 cm tiles with hairline grout, highly specular. The marble reflection of the firefly canopy is the single highest-leverage free effect. Never cover. Never replace.
- Walls: off-white plaster above a 1.0 m dark timber wainscoting. All panel treatments mount above the wainscoting. Wainscoting remains visible in every variant.
- Suspended mechanical duct unit centre-ceiling, roughly 1.8 × 0.8 × 0.4 m, underside at 2.8 m. Red pipes across the ceiling at right angles to the beams. Decommissioned fan on one pipe. These integrate into the ceiling topology as specific features (ridge shelf, ravine lines) rather than being hidden.
- Piano-corner chamber: 2.5 × 2.5 m cut out of the NE corner. Contains a fiber optic disc installation, handled separately. Out of scope for this tool. Render only the curtain-slit threshold with a dim warm light leak at floor level. No interior modelling.
- Entrance: South wall, midpoint. Opening 2.4 m wide × 3.5 m tall (the opening is effectively the full wall height in that zone).
- Big wall: North wall, opposite the entrance. Full length. The panel-treatment zone on this wall is roughly 10 m wide by 2.5 m tall (wainscoting top to ceiling soffit). This is the wall that switches across the five variants.

## Shared substrate (identical across all five variants)

### Ceiling topology (single design)

Panel-built, reading as inverted mountain topography with peaks pointing down into the room. Lowest peaks roughly 2.6 m above floor, highest valleys roughly 3.4 m, average 2.9 m. Panels are triangular or trapezoidal facets joined to approximate a 3D topographic surface. The duct unit and red pipes integrate as specific features. Underside face matte `#1a1a1a` with subtle variation; topside invisible to the viewer. Fireflies cling in sheltered pockets (valleys and overhangs) with higher density near peaks.

### Side walls (East and West)

Panel grid on both walls, each panel carrying bundled branch geometry as firefly habitat. Species of reference: camphor, acacia, longan. Branch density is deliberately high. Branches cross panel joints so the wall reads continuous at mid range while the panel construction remains visible at close range. Fireflies embed at three vertical strata: ankle (0.3 m), shrub (1.2 to 1.8 m), canopy (2.3 to 2.8 m).

### Marble floor

Polished grey, reflects everything above it. Doubles the canopy automatically. Do not cover. Do not replace.

### Piano corner

Render only the curtain-slit threshold with a dim warm `#d4a54a` light leak at floor level. No interior modelling.

### Entrance corridor

Panel-built, matte black interior, L-baffled so no sightline from outside. 2.4 m wide, 4 m long. Blackout curtain at interior threshold. One warm amber floor LED at 600 mm inside. Darkness adaptation before the reviewer enters the main room.

### Firefly system

Up to 1,500 green LED points. Narrow-band green, 520 to 530 nm, starting hex `#00ff6a`. Breathing animation matched to Alishan species flash patterns. IR-flashlight interaction: beam wakes a cluster over 300 to 600 ms, fades idle over 2 to 4 seconds after release, 15% cascade chance to neighbouring clusters. Per-variant configuration file specifies position, cluster assignment, intensity scale, hue offset for each instance.

### IR flashlight

Toggle by click or F key. Default off. In simulation, rendered as a very dim warm `#d4a54a` cone at 5% opacity so the reviewer can see where they are pointing. Real IR is invisible; this is a review affordance only.

### Lighting cycle

Two timelines per variant: atmospheric (low ambient wash, slow, always running) and narrative (variant-specific event cycle, 5 to 12 minute loop). Both loopable and scrubbable from the UI. Speed multipliers: 1x, 10x, 60x, paused.

### Haze

Post-process volumetric haze, belly-height only (0.6 to 1.4 m), per-variant cadence. Preserves marble reflection integrity.

## The five big-wall treatments

All five mount on the same panel grid on the North wall. Only the panel face treatment and the fireflies placed in front of it change between variants.

### Moss

Panels faced with preserved moss, varied species and density. Some panels fully covered, some sparse, some bare. Depth variation in moss build-up. The grammar is living tissue held in a rectangular frame. Fireflies embedded in the densest moss areas. Narrative lighting: dim cool moonlight wash on a slow cycle.

### Stepped silhouette

Panels cut into ridge-profile silhouettes, stacked in three depth layers (front flush, middle recessed roughly 80 mm, back recessed roughly 160 mm). Depth parallax reads as overlapping mountain ranges. Narrow horizon slot at eye height cuts across the top edge of the front silhouette and hides an emissive strip. Fireflies concentrated in the "sky" gap above the front silhouette. Narrative lighting: horizon slot cycles amber through deep red to black on a multi-minute loop.

### Reflective fracture

Panels faced with polished stainless or mirror acrylic, faceted into triangulated polygons at varying angles. Some flat-mirror, most faceted, a few with gaps showing dark void. Firefly reflections fracture across facets as constellations of glints. Firefly count is lower than other variants because each point generates multiple reflections. Narrative lighting: faint warm underlight at the wainscoting top edge pulsing on a slow cycle.

### Fiber veil

Panels perforated with a dense grid of small holes, each carrying a side-glow fiber optic tail with LED termination behind the panel. A field of individual light points flush with the panel face, cool-to-warm white. Intentional formal echo of the piano-corner fiber disc at wall scale. Fireflies in green sit in front of the veil at shallow depth; the two light sources read distinctly (fiber is still and cold, fireflies move and are warm green). Narrative lighting: fiber points breathe on a slow cycle.

### Projection-reactive

Panels with matte diffuse off-white face, reading as a subtle panel-grid screen. A simulated projector throws abstract light washes across the surface, synchronised with the lighting cycle. Content: horizon line slowly crossing, sunset gradient, lunar blue pass, soft drift. No imagery, no patterns. Light as drawing on a wall. Haze drifts in front so the projection beam becomes a visible volume. Fireflies in front at medium depth. Narrative lighting: the projection itself.

## What must not be invented

The following are decisions only Riaan makes, or open questions to be resolved with Alishan data or Riaan's review. Do not hard-code, guess, or silently commit:

- Panel module size
- Topographic profile for the ceiling and stepped silhouette (use a real DEM if accessible, otherwise a clearly-flagged procedural placeholder with a TODO)
- Exact firefly cluster counts and positions per variant
- Specific moss species mix, branch species counts, or material brands
- Any polyline, silhouette constant, or named-feature coordinate
- Audio file selections
- Specific ambientCG texture slugs (research candidates, do not commit without review)

## Open areas requiring interview before spec is written

1. Panel module size: 600 × 900 mm and 900 × 1200 mm are candidates. Render both in the tool, commit to one, or another size entirely?
2. Variant scope: strictly big-wall-only as described, or allow one or more variants to extend into the ceiling or side walls?
3. DEM source: attempt to source real Alishan elevation data (OpenTopography, Taiwan NLSC open data), use procedural placeholder only, or both (real data with procedural fallback)?
4. Firefly density per variant: accept the ranges implied above or commit to specific counts?
5. Narrative lighting cycle durations: as implied (6 to 12 minute range) or revise?
6. UI picker: include a panel-module toggle, a measurement mode, a walkthrough mode, a speed dropdown? Any subset is valid.
7. Split-view compare: included or deferred?
8. Routing: mount under `/proposals/` or a new path?
9. Phase structure: standard phased build (shared systems, then variants in order, then UI, then routing, then polish) or a modified sequence?
10. Stop-gates: which phases require Riaan to review screenshots before proceeding, and from which camera positions?

## Constraints inherited from CLAUDE.md

Palette, typography, sentence case, no em-dashes, no emojis, no attribution, performance targets, asset sourcing rules, do-not-touch list, commit conventions, before-writing-code checklist. These are loaded automatically every session and are not restated in the spec.
