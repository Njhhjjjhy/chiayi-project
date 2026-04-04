# Phase 3: lighting and the 4-phase sunset transition

## Goal

Build the temporal experience — the controllable transition from golden hour through twilight to blue hour to darkness. This drives the entire room's mood.

## Context

The physical installation transitions visitors through four lighting phases, simulating the passage of time from late afternoon to full darkness when fireflies appear. The mountain wall backlighting, ambient room light, and sky backdrop all change together.

## What to build

### 1. Timeline controller

Create `src/components/TimelineController.jsx` and `src/hooks/useTimeline.js`.

The timeline is a normalized value from 0.0 to 1.0:
- 0.0 — 0.25: golden hour.
- 0.25 — 0.50: twilight.
- 0.50 — 0.75: blue hour.
- 0.75 — 1.0: darkness (firefly phase).

The controller supports:
- Manual scrubbing: a slider in the ui that lets you drag to any point on the timeline.
- Auto-play: the timeline advances automatically at a configurable speed.
- Phase presets: buttons to jump directly to the start of each phase.

### 2. Lighting states per phase

**Golden hour (0.0 - 0.25):**
- Ambient light: warm amber (#ffb347), intensity ~0.6.
- Mountain wall backlight: orange-gold gradient.
- Sky backdrop (behind mountain wall): warm gradient from gold at the bottom to pale peach at the top.
- Horizontal sun lines (if enabled): visible, warm gold.
- Room side walls: faintly warm.

**Twilight (0.25 - 0.50):**
- Ambient light: deepening coral to rose (#ff6b6b to #c06080), intensity reducing to ~0.3.
- Mountain wall backlight: coral to purple gradient.
- Sky backdrop: gradient shifting from deep orange to magenta to purple.
- Sun lines: fading out.
- Room side walls: dimming.

**Blue hour (0.50 - 0.75):**
- Ambient light: deep indigo (#2d1b69), intensity ~0.15.
- Mountain wall backlight: indigo to deep blue, only visible on the rearmost layer edges.
- Sky backdrop: deep purple to near-black.
- Sun lines: gone.
- Room: mostly dark, mountain ridgeline edges faintly visible.

**Darkness (0.75 - 1.0):**
- Ambient light: near-zero intensity (#0a0a15), ~0.02.
- Mountain wall backlight: off or barely perceptible blue.
- Sky backdrop: black.
- Room: effectively dark. This is the canvas for fireflies (phase 4).

All transitions should interpolate smoothly using lerp or easing functions. No hard cuts between phases.

### 3. Color palette variants

Create at least 3 palette options in `src/variants/lighting.js`:

**Variant a — warm dominant:**
- Emphasizes oranges, golds, and warm pinks. The twilight leans more coral than purple.

**Variant b — cool dominant:**
- Twilight skews quickly into purples and blues. Less time in warm tones.

**Variant c — natural/documentary:**
- More muted, realistic colors based on actual Alishan sunset observations. Less saturated than a and b.

### 4. Transition speed variants

- 30-second full cycle (quick preview).
- 60-second full cycle (presentation speed).
- 2-minute full cycle (closer to exhibition pace).
- 5-minute full cycle (actual real-time feel).

Speed should be adjustable via the Leva panel or a dropdown in the ui.

### 5. Ui elements for this phase

- A timeline scrubber/slider bar at the bottom of the screen.
- Phase labels above the scrubber (golden hour, twilight, blue hour, darkness).
- A play/pause button.
- Speed selector.
- The current phase name displayed somewhere subtle.

### 6. Integration with mountain wall

The mountain wall backlight colors must be driven by the timeline controller, not set independently. The Leva overrides from phase 2 should still work but act as modifiers on top of the timeline-driven values.

## Deliverable

A controllable sunset-to-darkness transition with multiple timing and color palette variants. The room should feel atmospheric and cinematic at every point on the timeline.

## Acceptance criteria

- Scrubbing the timeline visibly changes the entire room's lighting in real time.
- All 4 phases are distinct and transitions are smooth.
- At least 3 color palette variants are switchable.
- Speed is adjustable.
- Mountain wall backlighting is driven by the timeline.
- The darkness phase creates a convincingly dark room suitable for firefly emergence.
