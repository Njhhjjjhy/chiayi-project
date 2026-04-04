# Phase 4: firefly behavior variants

## Goal

Implement six firefly proposals as switchable 3d behaviors within the room. This is the core of the installation and the most important phase to get right.

## Context

In the physical installation, 100 small leds are organized into modules of 16-18 fireflies each, controlled by Arduino. The web version simulates these as 3d particle/point light systems. Each proposal creates a fundamentally different visitor experience.

Fireflies should only be active during the darkness phase of the timeline (0.75 - 1.0). During earlier phases, they should be invisible or dormant.

## What to build

### Shared infrastructure

Create `src/components/FireflySystem.jsx` as a wrapper that:
- Accepts a variant config specifying which behavior to use.
- Uses instanced meshes with custom shaders, or Three.js points with additive blending, for performance.
- Each firefly is a small glowing point (soft, not sharp) with a warm color.
- Supports up to 200 particles without performance issues.
- Exposes Leva controls shared across all variants: density (particle count), base color temperature, glow radius, overall brightness.

### Variant 1 — the listening dark

Concept: lights only appear after stillness. Movement causes retreat.

Behavior:
- Track mouse/cursor movement (or camera movement if orbit controls are active).
- After 20-30 seconds of no input, fireflies begin fading in slowly (2-4 second fade up each).
- They appear at random positions throughout the room volume.
- Any mouse movement or camera rotation triggers a retreat: all visible fireflies fade out over 3-5 seconds.
- After stillness resumes, emergence begins again.
- Maximum 15-20% of particles visible at any time.

Leva controls: stillness threshold (seconds), fade-in speed, fade-out speed, max visible percentage.

### Variant 2 — flash language

Concept: three "species" with distinct flash patterns create visible conversation.

Behavior:
- Species a (15 particles): slow amber pulse. 4-second cycle — 1.5s fade up, 1s hold, 1.5s fade down. Color: warm amber (#ffaa3c).
- Species b (20 particles): quick double-flash. 3-second cycle — two rapid 0.15s flashes separated by a 0.25s gap, then dark for 2.45s. Color: cooler yellow (#ffc864).
- Species c (12 particles): rapid flutter then silence. 10-second cycle — 2s of rapid fluttering (6 quick flashes), then 8s of darkness. Color: greenish (#c8e664).
- Species are distributed in different spatial zones of the room.
- Occasional synchronized moments where all species a particles pulse together.

Leva controls: flash timing per species, color per species, spatial distribution.

### Variant 3 — the wave

Concept: synchronized rolling pulses sweep across the space.

Behavior:
- Normally, each firefly pulses independently with random timing.
- Every 45-90 seconds, a synchronization event occurs: a wave of light sweeps from one side of the room to the other over 3-5 seconds.
- During the wave, each firefly brightens as the wavefront reaches its position, then fades.
- After the wave passes, particles return to independent random behavior.
- The wave direction varies (left-to-right, front-to-back, center-outward).

Leva controls: wave frequency, wave speed, wave direction, independent pulse range.

### Variant 4 — the canopy grid

Concept: an overhead structure with hanging fiber strips and firefly lights.

Behavior:
- A grid of horizontal bars at ceiling height (representing bamboo battens).
- From each grid intersection, a vertical "strip" hangs downward (representing ramie fiber). These are thin box geometries or line segments.
- A warm led point light sits at the tip of each hanging strip.
- Each light pulses independently with slow randomized timing.
- The hanging strips sway gently with a sine-wave animation (simulating air currents).
- The sway creates organic motion in the light positions.

Leva controls: grid density, strip length range, sway amplitude and frequency, pulse timing.

### Variant 5 — the veil

Concept: a deep-pile fiber wall with embedded leds at varying depths.

Behavior:
- One wall (not the mountain wall — use the opposite or a side wall) is covered in a thick textured surface.
- Represent the texture with a displacement map or a dense field of small elongated geometries.
- Warm point lights are embedded at 3-5 depth levels within the fiber mass.
- Each light fades in and out independently with slow timing (4-8 second cycles).
- Deeper lights appear more diffused/softer; surface lights appear sharper.
- The effect is a wall that seems to breathe with tiny points of warmth.

Leva controls: light count, depth levels, cycle timing, diffusion factor per depth.

### Variant 6 — the reflection

Concept: visitor silhouette dissolves into firefly-like particles.

Behavior:
- A translucent screen (a semi-transparent plane) faces the viewer.
- The cursor position (or webcam silhouette if available) generates a soft glow region on the screen.
- Particles cluster near the cursor/silhouette position.
- Over time (if the cursor is still), particles begin dispersing outward from the silhouette, as if the visitor is dissolving into fireflies.
- Movement resets the clustering.
- Multiple cursors (if this could support touch) produce overlapping effects.

Leva controls: dispersion speed, particle density near silhouette, maximum spread radius.

### Variant switcher integration

Register all 6 firefly variants in the variant switcher ui. Only one should be active at a time.

## Deliverable

Six switchable firefly behaviors within the room, each with distinct visual character and adjustable parameters.

## Acceptance criteria

- All 6 variants are selectable and visually distinct.
- Fireflies only appear during the darkness phase of the timeline.
- Performance stays smooth with up to 200 particles.
- Each variant has meaningful Leva controls.
- The listening dark responds to actual mouse/camera stillness.
- Flash language shows clearly different patterns for each species.
- The wave produces a visible sweeping synchronization event.
- The canopy grid renders visible hanging structures.
- The veil shows depth-differentiated light diffusion.
- The reflection responds to cursor position.
