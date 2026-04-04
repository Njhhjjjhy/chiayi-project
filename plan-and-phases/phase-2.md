# Phase 2: mountain wall variants

## Goal

Build multiple versions of the layered mountain wall so variants can be compared in real time. The mountain wall occupies one full 10-meter-wide wall of the room.

## Context

The physical installation uses cut plywood or mdf panels shaped into mountain silhouette profiles, mounted at varying depths from the wall. Led strips behind each layer's top edge create a glowing backlight effect. The color of this backlight shifts through the 4-phase sunset transition (built in phase 3).

Reference images to keep in mind: layered green mountain murals with atmospheric depth, led-backlit mountain silhouettes with purple/pink glow, and actual Alishan sunset landscapes with bamboo silhouettes.

## What to build

### 1. Mountain wall component

Create `src/components/MountainWall.jsx`. This component:

- Generates mountain silhouette profiles procedurally using code (sine waves, perlin noise, or similar).
- Each profile is an extruded shape or a custom geometry — a 2d mountain ridgeline extruded into a thin slab (representing a plywood panel).
- Layers are positioned at increasing z-depths from the camera, with spacing between them.
- Each layer has an emissive strip or area light behind its top edge to simulate led backlighting.
- The component accepts a variant config object that controls all parameters.

### 2. Variant definitions

Create at least 3 mountain wall variants in `src/variants/mountainWall.js`:

**Variant a — soft rolling peaks:**
- 3 layers.
- Smooth, gently rolling silhouettes (low-frequency sine curves).
- Colors fading from deep forest green (foreground) to pale sage (background).
- Moderate spacing between layers (0.3-0.5m).
- Backlight: warm amber.

**Variant b — sharp ridgelines:**
- 5 layers.
- Angular, jagged peaks with visible treeline texture (small triangular bumps along the ridge).
- Higher contrast: near-black foreground to medium green background.
- Tighter spacing (0.15-0.25m).
- Backlight: warm white.

**Variant c — geometric/stylized:**
- 4 layers.
- Simplified geometric shapes — straight-line segments forming angular mountain forms (inspired by the led-backlit reference image with purple glow).
- Monochromatic dark palette (charcoal to medium gray).
- Even spacing (0.3m).
- Backlight: configurable color (default: purple/pink).

### 3. Backlight system

Behind each mountain layer, add a light source that simulates the led strip effect:

- Use area lights, emissive planes, or point lights spread along the top edge.
- The light should bleed between layers and create visible glow on the gap surfaces.
- Backlight color and intensity should be controllable via Leva.
- In phase 3, these will be driven by the sunset timeline. For now, use static controllable colors.

### 4. Optional: horizontal sun lines

Add a toggleable element behind the mountain layers — thin horizontal emissive strips that suggest the banded look of a sunset sky. These should fade in and out depending on the lighting phase (will be connected in phase 3).

### 5. Leva controls for this phase

Expose in the Leva panel:

- Active mountain variant (a, b, c).
- Number of layers (override per variant).
- Layer spacing.
- Peak amplitude and frequency.
- Foreground and background layer colors.
- Backlight color and intensity.
- Sun lines on/off.

### 6. Variant switcher integration

Register the mountain wall variants in the variant switcher ui so they can be toggled from the sidebar.

## Deliverable

Three switchable mountain wall styles inside the room, each with adjustable parameters. The wall should look compelling even with basic lighting.

## Acceptance criteria

- At least 3 visually distinct mountain wall variants are switchable.
- Each variant has procedurally generated silhouette profiles (not hardcoded paths).
- Led backlighting is visible between layers.
- Leva controls adjust parameters in real time.
- The mountain wall fits the 10-meter wall width correctly.
- Variant switcher ui shows the mountain wall options.
