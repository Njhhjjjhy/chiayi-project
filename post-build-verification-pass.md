# Post-build verification and apply-pass

A verification lens applied across the whole finished simulation. Seven principles, each with a concrete check and a defined action when the check fails. Some failures get trivial fixes applied in place. Some failures get flagged for designer review without touching code.

## How Claude Code runs this

Step 0 — read-only sweep. For each principle below, run the check against the current codebase and capture findings. No code changes in step 0.

Step 1 — report back. List every finding under three headings: `pass`, `apply` (trivial fix proposed), `flag` (designer review needed). Wait for designer go-ahead on the `apply` list. Do not touch the `flag` list.

Step 2 — apply approved fixes. After designer reviews the `apply` list and approves, apply those fixes. Re-capture screenshots at the standard 4 presets + any slice-specific diagnostic presets to verify the fixes landed without regression.

Step 3 — close. Final report listing what changed, what stayed flagged for future work, and updated baselines.

## Reading list

- `docs/canonical/1-room-spec.md` through `docs/canonical/8-open-items.md` — all eight canonical docs.
- `src/geometry/dimensions.js` — all constants.
- `src/components/` — all room geometry, lighting, and pathway components.
- This document.

Do NOT re-read meeting notes or external research. The principles below are already distilled.

## The seven principles

### Principle 1 — the unit field

Many near-identical small units accumulate into an emotional whole. Variation should come from density, proximity, and gradient — never from piece-level differentiation.

**Where this applies:** loofah variant 2 (cluster wall), loofah variant 3 (corner sculpture), firefly population, ceiling LED distribution.

**Check:**
- Loofah variant 2: are the loofah pieces near-identical in shape and size, with variation produced by clustering and gap pattern? Or has piece-level variation crept in (different shapes, different scales, different colors per piece)?
- Loofah variant 3: same question for the corner sculpture's stacked pieces.
- Firefly population: are individual fireflies identical except for position and flash phase? No size variation, no color variation between fireflies?
- Ceiling LEDs: is the LED distribution producing density patterns rather than per-LED uniqueness?

**Action on fail:**
- Piece-level shape/color variation in loofah → `flag`. Designer decides whether to collapse to identical.
- Firefly per-instance size or color variation → `apply`. Collapse to single canonical sphere radius and color.
- Ceiling LED per-instance variation beyond seeded position → `apply`. Collapse to identical.

### Principle 2 — internal source, perforated envelope

A single internal light source projecting through small openings beats many independent fixtures. The light source must never be visible to the visitor (already locked in canonical doc 3 line 17). Lit objects, not glowing objects.

**Where this applies:** loofah wall, loofah corner sculpture, any future lighting that uses geometry as a glow surface.

**Check:**
- Loofah wall: is the warm light coming from a single (or small number of) backlight source(s) hidden behind the loofah-and-bamboo layer? Or are the loofah pieces themselves emissive?
- Loofah corner sculpture: is there exactly one internal source inside the bamboo armature, with loofah pieces lit by transmission/proximity? Or are individual pieces self-emitting?
- `LOOFAH_FIBRE_EMISSIVE_INTENSITY` constant: must read `0`.
- Backlight geometry: is the backlight source mesh hidden from all four canonical preset viewpoints (standing, entrance-wall, back-wall, front-wall)?

**Action on fail:**
- `LOOFAH_FIBRE_EMISSIVE_INTENSITY` not `0` → `apply`. Set to `0`.
- Backlight visible from any visitor-position camera → `apply`. Add occluder or reposition source behind armature.
- Multiple distributed light sources where one would do → `flag`. Designer reviews whether consolidation is feasible.

### Principle 3 — the three-distance test

Every element a visitor passes must reward attention at three scales: room-entry scale (~4m), pathway scale (~2m), hand-and-face scale (~0.5m). The 0.5m scale is where most installations fail.

**Where this applies:** loofah wall (visitor passes within 1.5m on the pathway), pathway floor edge (visitor walks on it), seating boxes (visitor sits on / touches), curtain (visitor pulls / passes through), entry threshold.

**Check:**
- For each surface the visitor can stand within 1m of: does it have material texture or detail visible at 0.5m, not just at 2m?
- Loofah wall: at 1.5m distance with current `LOOFAH_BACKLIGHT_INTENSITY = 3.0`, does the loofah-piece detail still read, or does the wall flatten to a glow at close range?
- Seating boxes (slice 6): does the surface have any 0.5m-scale detail, or is it flat painted plywood?
- Pathway floor edges (slice 4 variants): at 0.5m the strip and arrows are at the visitor's foot. Does either still hold visual interest, or is it just a line?
- Ceiling (slice 7): does the ceiling reward looking up from underneath, or is it only legible from a distance?

**Action on fail:**
- All findings here → `flag`. Adding 0.5m-scale detail is a design decision, not a parameter tweak. Designer reviews.

**Note:** add a diagnostic preset `close-range` to the standard capture set if not already present. Camera at 1.5m from the loofah wall, facing it. Used to verify principle 3 for slice 5.

### Principle 4 — choreographed emergence with held silence

The arc is sunset → dark → emergence → dispersal. The dark gap before emergence is the work, not dead time. Compressing the gap kills the arc.

**Where this applies:** firefly behaviour timeline, `BLUE_HOUR_TIME` and surrounding values, the duration of the "dark before fireflies" phase.

**Check:**
- What is the duration of the dark phase between sundown ending and first firefly appearance?
- Is the firefly emergence ramp slow (gradual increase in population/intensity over time) or instant (population pops into existence)?
- Is there a held still moment in the timeline where nothing is animating?

**Action on fail:**
- Dark phase under ~15 seconds in simulation time → `flag`. Designer decides whether to lengthen.
- Firefly emergence is instant rather than ramped → `flag`. May be a build choice, not a bug.
- No held still moment → `flag`. Add one only with designer approval.

### Principle 5 — visitor pragmatism

Visitor behaviour kills installations more than aesthetics do. Trip hazards, sightlines for staff, controlled group sizes, emergency lighting, anti-trip floor lighting, accessibility.

**Where this applies:** floor (slice 3), pathway lighting (slice 4), seating (slice 6), entrance threshold, emergency egress paths.

**Check (simulation-side only — the install-day items live in `8-open-items.md`):**
- Floor seam pattern: at low light levels, is the foam tile grid visible enough to communicate "ground here, step here" without being distracting? Test at `BLUE_HOUR_TIME = 0.78` and at full dark.
- Pathway lighting variant currently active by default: is the default variant the safest for visitor wayfinding, or the most aesthetically interesting? These may conflict.
- Seating boxes: is their position clearly visible from the entry, or do they become trip hazards in low light?
- Are emergency egress paths (back to entrance, through curtain) visually distinguishable from the rest of the forest, or do they disappear into the dark?

**Action on fail:**
- Floor seams invisible at `BLUE_HOUR_TIME` → `flag`. May want a subtle floor-edge lift, but that's a design decision.
- Default pathway wayfinding variant is `off` → `flag`. Designer decides whether to default to one of the three for safety.
- Seating placement creates trip hazard sightlines from entry → `flag`. May require slice 6 revisit.
- Emergency egress not visually marked in sim → `flag`. Add to `8-open-items.md` as a tracked design decision, do not solve in sim.

### Principle 6 — material gesture, locally fabricable

The plywood ceiling, the bamboo armature, the foam floor, the loofah — these are the primary material gestures. They should not be clad, painted over, or hidden behind anything that obscures their nature. Locally fabricable construction is the constraint; anything that requires imported custom fabrication violates the brief.

**Where this applies:** ceiling (slice 7), loofah wall armature (slice 5), seating boxes (slice 6), floor (slice 3).

**Check:**
- Ceiling: is the plywood material legible from below, or is it hidden behind paint, lighting, or covering panels?
- Loofah wall: is the bamboo armature visible / part of the visual language, or is it hidden?
- Seating boxes: are these visibly plywood, or have they been visually converted into something else?
- Foam floor: is the foam-mat texture readable as foam, or is it visually generic?

**Action on fail:**
- Material hidden behind decorative cladding → `flag`. Probably a design decision, not a fix.
- Material rendered as a generic surface (flat color, no texture) → `apply`. Restore the material's surface character.

### Principle 7 — design the after-life

The installation is temporary. Every material component needs a defined after-life: donated, returned, composted, reused. This is not a sim check — it's a documentation check.

**Where this applies:** `docs/canonical/8-open-items.md`.

**Check:**
- Does `8-open-items.md` have an "after-life" or "dismantling" section?
- For each major material component (plywood ceiling, foam floor tiles, loofah pieces, bamboo armature, LED strips, seating boxes, curtain), is there a documented destination?

**Action on fail:**
- No after-life section in `8-open-items.md` → `apply`. Add a section titled `After-life and dismantling` listing each component with `destination: TBD` as the placeholder. Do not fill in destinations — that is a designer + Corbett conversation.

## Slice-by-slice quick-reference

### Slice 3 (foam floor)
Principles 3, 5, 6 — material gesture (foam reads as foam?), three-distance (foam at 0.5m has texture?), pragmatism (seams visible enough for safe walking at `BLUE_HOUR_TIME`?).

### Slice 4 (pathway wayfinding)
Principles 3, 5 — three-distance (variant looks good at 0.5m too?), pragmatism (default variant is safe?).

### Slice 5 (loofah wall + corner sculpture)
Principles 1, 2, 3, 6 — unit field (pieces identical?), internal source (no fibre emissivity, backlight hidden?), three-distance (rewards close inspection?), material gesture (bamboo armature visible?).

### Slice 6 (seating boxes)
Principles 3, 5, 6 — three-distance (0.5m surface detail?), pragmatism (trip hazard, sightlines?), material gesture (plywood legible?).

### Slice 7 (ceiling)
Principles 1, 3, 6 — unit field (LED distribution as density not per-LED?), three-distance (rewards looking up from underneath?), material gesture (plywood readable from below?).

### Slice 8 (docs cleanup)
Principle 7 — after-life section in `8-open-items.md`.

## Stop-and-flag rules

- If a check requires re-reading meeting notes or external research, stop and flag — this doc should be self-contained.
- If a fix would touch geometry across more than one slice's components, stop and flag — that is a refactor, not a verification fix.
- If a fix would change a constant currently locked in canonical docs (e.g. `LOOFAH_BACKLIGHT_INTENSITY = 3.0`), stop and flag — designer chose that value.
- If the check itself is ambiguous (the principle could apply or not), stop and flag — describe both interpretations, let designer decide.

## Capture and report convention

Same as other slices. Before-baselines at standard 4 presets per slice touched. After-fixes captures at same presets. Filename pattern `<timestamp>-verify-pass-<context>-<preset>.png`. Final report lists the three buckets (pass / apply / flag) for each principle, with file paths to the captures that demonstrate each finding.

## Closing the pass

This pass closes when:
1. Step 0 sweep report is delivered.
2. Designer reviews the `apply` list and gives explicit go-ahead on each item.
3. Approved fixes are applied and re-verified with captures.
4. Final report is written listing changes made and flags carried forward.

The `flag` items do not need to be resolved to close this pass. They become input to future design conversations.
