# Proposals viewer — build spec

## Overview

A private review tool for Riaan to flip through six big-wall treatment proposals for the firefly room. Mounted at `/proposals/:variantId`, additive to the existing scene (which is not modified, moved, or replaced). Rough-pass fidelity: readable and comparable, not production-grade. Polish scope defined after rough-pass review.

## Scope

**In scope**
- New route at `/proposals/:variantId`. Bare `/proposals` redirects to a default.
- Six variants on the back wall (z = +HD), selected via chip bar + hotkeys 1–7.
- Hover info panel per variant.
- A/B toggle: pick any two variants, hotkey to flip between them at the same camera and time.
- Timeline scrubber with play/pause; no auto-loop.
- Global haze override slider; per-variant haze cadence underneath.
- Global firefly density slider, default 1,584.
- Depth-based haze pass via existing postprocessing stack.
- Per-variant narrative lighting, rough-pass quality.
- The existing `<Room>` shell, side-wall fireflies (via `distributeUnits`), ceiling fireflies, wainscoting, doors, HVAC — all reused unchanged.

**Out of scope**
- Any modification to `src/pages/ThreeDPreview.jsx`, `src/components/Scene.jsx`, or any existing firefly variant under `src/components/fireflies/`.
- Branch geometry on side walls (deferred to polish).
- Piano-corner chamber (not modelled anywhere in current code; not added).
- Any public-facing route, nav link, or promotional content.
- Auto-looping sunset cycle (deferred to polish).
- Production-quality shaders, lighting timing, or material fidelity.
- Bilingual copy on the proposals page (private tool, English only; flagged as deferred).

## The six variants

Each variant owns a distinct emotional register. If two registers collapse in sim, the set has failed and must be reworked.

### 1. Null
**Emotional register:** quiet baseline. The room as-built, nothing added. A calibration anchor against which the other five are judged.

Bare panel grid above the wainscot, matte off-white face, no further treatment. Fireflies: none in front of or on the back wall. Ceiling and side-wall fireflies carry unchanged. Narrative lighting: none — ambient lighting-cycle only. Haze: baseline low.

### 2. Living moss
**Emotional register:** intimate bodily tissue. Hushed, close, alive.

Panel faces covered with preserved moss in varied densities — some panels full, some sparse, some bare. Depth variation in the moss build-up. Fireflies embedded *in* the densest moss areas, at moss-surface depth. Narrative lighting: slow cool moonlight wash across the wall, dim. Haze: near-none — moss is a close-range read, haze would blur it.

### 3. Layered mountain silhouette
**Emotional register:** receding distance. Vastness. A window onto landscape.

Panels cut into ridge-profile silhouettes, stacked in three depth layers (front flush, middle recessed ≈80 mm, back recessed ≈160 mm). All three ridges are depth crops from one DEM sample: the Alishan western escarpment at sunset (viewpoint looking west over descending foothills toward the Chiayi plain). Near crop = front layer, mid = middle, far = back. Narrow horizon slot at the top of the front silhouette conceals an emissive strip. Fireflies concentrated in the "sky" gap above the front silhouette. Narrative lighting: horizon slot cycles amber → deep red → black on a multi-minute envelope. Haze: gentle drift — helps the depth parallax read.

**Variant-specific orientation note:** portrait panels may be considered for the front silhouette layer if the ridge profile wants more vertical face; flag in code with an override constant.

### 4. Reflective fracture
**Emotional register:** shattered sky. Multiplicity. A constellation made of the wall itself.

Panel faces are faceted mirror-acrylic or polished stainless surrogate, triangulated at varying angles — most faceted, some flat-mirror, a few gaps reading as dark void. No extra fireflies in front of the wall; the existing ceiling + side-wall fireflies reflect and fracture across the facets, generating multiple glints per LED. Narrative lighting: faint warm underglow pulsing slowly at the wainscot top edge. Haze: minimal — reflections need clean air to fracture cleanly.

### 5. Fiber veil
**Emotional register:** stilled star field. Cold precision against living warmth.

Panels perforated with a dense grid of small holes; each hole carries a side-glow fibre tail with LED termination behind the panel. Light points flush with the panel face, cool-to-warm white. Fireflies in green sit *in front of* the veil at shallow depth (≈10–20 cm off the face). Two light sources read distinctly: fibre is still and cold; fireflies move and are warm-green. Narrative lighting: fibre points breathe on a slow cycle, out of phase with fireflies. Haze: gentle.

### 6. Projection-reactive
**Emotional register:** weather moving through the room. Atmosphere as drawing.

**Flagged exception to the panel paradigm.** Panel faces are matte diffuse off-white — they read as a subtle panel-grid screen, not a treatment. A simulated projector throws abstract light washes across the surface, synchronised with the lighting cycle: horizon line slowly crossing, sunset gradient, lunar blue pass, soft drift. No imagery, no patterns. Fireflies in front of the wall at medium depth (≈30–50 cm off the face). Narrative lighting: the projection itself; no separate narrative lighting. Haze: thick enough that the projection beam reads as a visible volume — without haze this variant does not work.

Included as a comparison point, not a leading candidate.

## Non-negotiables (carried from locked decisions)

1. Additive. The existing `/3d` scene stays fully functional and unmodified.
2. Marble floor covered with dark cloth (cloth type deferred). Floor reads dark in sim.
3. No cultural reference to the Tsou community in copy, labels, comments, or identifiers.
4. No designer, artist, studio, or specific-artwork names in any file produced by this build.
5. Fireflies exist on both fabric substrates and branch geometry in the real installation. Sim models flat-surface placement only in rough-pass; branches are polish.
6. Projection-reactive is the one variant that breaks the panel-construction paradigm. Flagged in the spec and in code comments for that variant.
7. Canonical room dimensions are the source of truth: 8.83 m × 10 m × 3.52 m, from `src/geometry/dimensions.js`. Reference-doc numbers (10 × 10) are void.
8. Panel module: 900 × 1200 mm, landscape default. Variant-level orientation overrides must be called out explicitly in the variant's own code.
9. The six emotional registers above are non-negotiable as distinct. Any two that collapse in sim must be reworked before the phase gate passes.

## Codebase touchpoints

### Reused unchanged (imports only)
- `src/geometry/dimensions.js` — all room dims, door skips, wainscot heights.
- `src/components/Room.jsx` and subcomponents under `src/components/room/` — the shell.
- `src/components/fireflies/FireflySystem.jsx`, `Blinking.jsx`, `Interaction.jsx`, `Motion.jsx`, `TheWave.jsx`, `surfacePositions.js`, `FireflyParticles.jsx` — ceiling + side-wall fireflies.
- `src/hooks/VariantProvider.jsx`, `useVariant.js` — existing experience variant (needed so `isExperience = true` for fireflies to render).
- `src/hooks/TimelineProvider.jsx`, `useTimeline.js` — timeline state for the scrubber.

### New files

**Page + route**
- `src/pages/ProposalsPage.jsx` — mounts Canvas, providers, UI shell, proposal-specific variant state. Deep-linkable via `:variantId` URL param.
- Route added to `src/App.jsx`: `<Route path="proposals" element={<ProposalsPage />} />` and `<Route path="proposals/:variantId" element={<ProposalsPage />} />`. No other edits to App.

**Proposals variant system**
- `src/proposals/variants.js` — canonical registry of six variants. Each entry: `{ id, label, emotionalRegister, component, hazeCadence, orientation, notes }`.
- `src/proposals/defaults.js` — default variant id, default firefly count, default haze level, blue-hour time constant.
- `src/hooks/ProposalsProvider.jsx` + `useProposals.js` — proposal state (current variant, A/B pair, firefly count, haze override).

**Back-wall treatment components**
- `src/components/proposals/BackWallFrame.jsx` — shared panel grid at z = +HD above the wainscot, respects `DOOR_SKIPS.back`. Provides the 900 × 1200 landscape grid all variants mount into.
- `src/components/proposals/variants/Null.jsx`
- `src/components/proposals/variants/Moss.jsx`
- `src/components/proposals/variants/LayeredSilhouette.jsx`
- `src/components/proposals/variants/ReflectiveFracture.jsx`
- `src/components/proposals/variants/FiberVeil.jsx`
- `src/components/proposals/variants/ProjectionReactive.jsx`
- `src/components/proposals/BigWallFireflies.jsx` — per-variant firefly layer in front of / on the back wall, driven by variant config (depth offset, density scaling, placement rule).

**Supporting systems**
- `src/components/proposals/HazePass.jsx` — custom screen-space depth-based belly haze effect, plugged into an `<EffectComposer>` on the proposals page. Reads global haze override + per-variant cadence.
- `src/components/proposals/NarrativeLighting.jsx` — per-variant narrative lighting layer (moss moonlight wash, silhouette horizon slot, reflective underglow, fibre breath, projection beam). Driven by variant config and timeline phase.
- `src/components/proposals/ProjectionRig.jsx` — the projector sim for variant 6. Volumetric beam through haze, content washes.
- `src/proposals/dem.js` — fetches / caches the Alishan western-escarpment DEM for the silhouette variant. Three depth crops. Procedural fallback function defined separately; if the DEM fetch fails at build or runtime, surface a visible warning in the viewport (not a silent substitute).

**UI shell**
- `src/components/proposals/VariantPicker.jsx` — chip bar (bottom or left edge), hotkeys 1–7, hover info panel showing `label` + `emotionalRegister` + flagged notes.
- `src/components/proposals/ABToggle.jsx` — select-two UI + hotkey (space) to flip between the two at the same camera + time.
- `src/components/proposals/TimeScrubber.jsx` — scrubber + play/pause; reuses TimelineProvider time, adds paused state on top.
- `src/components/proposals/ControlPanel.jsx` — haze override slider, firefly count slider, phase indicator.

### Three camera presets (for screenshots and live review)
Defined in `src/proposals/cameraPresets.js`:
- **Entrance standing.** Position ≈ `[-3.5, 1.6, -3.3]`, target ≈ `[0, 1.6, 5]`. Near the visitor entrance, eye level, looking at the back wall.
- **Mid-room standing.** Position ≈ `[0, 1.6, 0]`, target ≈ `[0, 1.6, 5]`. Centre of room, facing the back wall.
- **Big-wall oblique.** Position ≈ `[-2.5, 1.6, 2.0]`, target ≈ `[1.5, 1.6, 5]`. 3 m from the back wall at ~45°, reveals depth parallax on the silhouette variant.

Exact coordinates locked in phase 1 after scaffold renders; presets selectable from the UI and used by the screenshot-capture step at each gate.

## Phase plan

Each phase ends with a gate. Gate artifacts: screenshots from the three camera presets at blue hour *and* darkness, committed to `public/proposals/screenshots/phase-N/`; plus a live local dev-server walkthrough. Riaan reviews every gate.

### Phase 1 — scaffold
Deliver:
- `/proposals/:variantId` route live; bare `/proposals` redirects to null.
- ProposalsProvider, variant registry, defaults, three camera presets.
- Canvas mounted with VariantProvider + TimelineProvider + ProposalsProvider. Existing `<Room>` + `<FireflySystem>` rendered unchanged (ceiling + side-wall fireflies working).
- Empty `<BackWallFrame>` panel grid rendered, 900 × 1200 landscape, respecting back-wall wainscot (0.90 m) and both door skips (D1 + D2 per `DOOR_SKIPS.back`).
- Null variant renders (bare panels, no further treatment).
- UI shell: chip bar, hotkeys 1–7 (six greyed pending, null live), hover info panel, scrubber + play/pause, blue-hour default on first load with last-used persistence after.
- Haze slider (global override) wired up — no haze pass behind it yet; slider value logged.
- Firefly density slider wired to existing `distributeUnits({ ledsPerUnit })` path (if feasible without touching existing fireflies) *or* to a proposals-only override layer.
- A/B toggle UI present, greyed pending other variants.
- Depth-based haze pass (`HazePass.jsx`) plugged into EffectComposer; driven by global slider; per-variant cadence stub returns 0 for now.
- DEM fetch scaffold (`src/proposals/dem.js`) in place; fetches Alishan western-escarpment data; exposes three depth crops as arrays; on failure, logs a loud warning and returns procedural-fallback profiles explicitly flagged as fallback.

**Gate 1:** Riaan reviews `/proposals/null` at blue hour. Checks: null reads as expected; ceiling + side-wall fireflies unchanged; scrubber + play/pause works; haze slider affects the haze pass visually; firefly count slider affects density; chip bar + hotkeys navigate even to greyed variants (they show a "not yet built" placeholder); blue-hour default loads on first entry, last-used persists on variant switch.

### Phase 2 — geometry variants
Deliver:
- Moss variant (`Moss.jsx`): panel faces textured with moss-surrogate material at varied densities across panels; fireflies embedded in densest regions (per-variant BigWallFireflies config); moonlight wash narrative lighting; haze cadence near-zero.
- Layered mountain silhouette (`LayeredSilhouette.jsx`): three depth layers from DEM crops; horizon-slot emissive strip; fireflies in sky gap; horizon-slot narrative lighting cycling amber → deep red → black across the phase envelope; haze cadence "gentle drift."
- Emotional registers readable and distinct in sim.

**Gate 2:** Riaan reviews null + moss + silhouette via A/B toggle at blue hour *and* darkness. Checks: the three emotional registers are distinct; moss and silhouette don't collapse into each other or into null; panel grid is visually consistent across all three; door skips are respected on the back wall; DEM fetch succeeded (or fallback warning is clearly visible and flagged).

### Phase 3 — shader variants
Deliver:
- Reflective fracture (`ReflectiveFracture.jsx`): faceted mirror-acrylic surrogate material; no extra fireflies; existing ceiling + side-wall fireflies fracture across facets via environment reflection (cubemap or baked); warm underglow narrative lighting at wainscot top edge; haze cadence minimal.
- Fibre veil (`FiberVeil.jsx`): perforated panels with side-glow fibre points (instanced emissive points); green fireflies at shallow front-of-wall depth; fibre-breath narrative lighting out of phase with fireflies; haze cadence gentle.
- Emotional registers readable and distinct.

**Gate 3:** Riaan reviews all five live variants (null, moss, silhouette, reflective fracture, fibre veil) via A/B toggle across blue hour + darkness. Checks: no two variants collapse in emotional register; reflective fracture actually fractures (reflections visible, not just a mirror); fibre veil reads as a still cold field distinct from the firefly layer in front of it.

### Phase 4 — projection-reactive
Deliver:
- Projection-reactive (`ProjectionReactive.jsx` + `ProjectionRig.jsx`): matte panel face; simulated projector throwing abstract horizon-line, sunset-gradient, lunar-blue, soft-drift washes; haze cadence high so beam reads as volume; fireflies at medium front depth.
- Panel-paradigm exception flagged in both the variant component header comment and the variant registry `notes` field.

**Gate 4:** Riaan reviews all six live variants via A/B toggle across blue hour + darkness. Output: shortlist of 1–3 variants for polish, captured in a follow-up file.

### Phase 5 — polish (deferred)
Scope written after rough-pass review is complete. Likely includes: production-quality shaders, real DEM refinement, branch geometry on side walls, auto-looping cycle, tuned timing, bilingual labels on the proposals UI, reduced-motion handling, and material-fidelity pass on the shortlisted variants only.

## Deferred questions and placeholders

1. **Exact cloth type covering the marble floor.** Sim uses a neutral dark matte; final fabric selected during polish.
2. **Firefly density slider range.** Phase 1 proposes 500–3000 with default 1,584. Confirm bounds during gate 1 review.
3. **Alishan DEM source.** Phase 1 attempts OpenTopography first, Taiwan NLSC open-data second. If both fail, procedural fallback with a loud on-screen warning. Final source locked after gate 1.
4. **Door handling on the back wall per variant.** Each treatment must respect `DOOR_SKIPS.back`, but whether the treatment wraps around the door frame, terminates cleanly, or uses a "door panel" insert is a per-variant call made during that variant's build. Flag in each variant's code comment.
5. **Branch geometry on side walls.** Deferred to polish per locked decision.
6. **Auto-loop timing for sunset cycle.** Deferred to polish; rough-pass is scrubber + play/pause only.
7. **Bilingual labels on proposals UI.** Deferred — private tool, English only in rough-pass.
8. **Reduced-motion support.** Deferred to polish. Scrubber + play/pause implicitly satisfies the core requirement in rough-pass since nothing auto-animates by default.
9. **Leva debug panel on the proposals page.** Not included in rough-pass; flagged for polish if tuning would benefit from it.
10. **Firefly density slider implementation.** Phase 1 must confirm whether the density slider can drive the existing `distributeUnits` pipeline without touching existing firefly components, or whether a proposals-only firefly layer is needed. Resolved during scaffold.
11. **Emotional registers proposed above.** Riaan may push back on any of the six one-liners before phase 1 starts.
12. **Panel face for null variant.** Matte off-white proposed; confirm shade at gate 1.

## Confirmation criteria

Before building starts:
1. Riaan approves this spec in chat.
2. No code is written, no files are scaffolded, and the existing scene is not touched until that approval is captured.

At each phase gate:
1. Screenshots from the three camera presets at blue hour and darkness, committed to `public/proposals/screenshots/phase-N/`.
2. Brief written summary of what was built in that phase, what is deferred, and any placeholders.
3. Live dev-server walkthrough available.
4. Riaan explicit approval in chat before the next phase starts.
