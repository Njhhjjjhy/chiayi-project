# Phase 6: structure qa tool

## Goal

Build a separate view mode for construction planning — measurements, dimensions, and material specs. This is a practical tool for planning the physical build.

## What to build

### 1. Construction view mode

Extend the existing "construction view" toggle from phase 1 into a full qa tool:

- All materials switch to wireframe.
- Background becomes white or light gray (blueprint style).
- A 1-meter grid overlay is visible on the floor and optionally on walls.
- All atmospheric lighting is replaced with flat neutral illumination.

### 2. Dimension labels

Add floating text labels (using drei's Html or Text components) showing:

- Room dimensions: 10m x 10m x 3.5m (or whatever the current ceiling height is).
- Mountain wall: total width, height, depth from wall to foreground layer.
- Mountain wall layers: spacing between each layer, thickness of each panel.
- Ceiling panel grid: 120cm x 120cm panel size, number of panels.
- Firefly module positions (if the canopy grid variant is active): grid spacing, strip lengths.

Dimensions should update live if Leva parameters change.

### 3. Material annotations

Small labels near each surface indicating the intended physical material:

- Mountain wall panels: "mdf or plywood, 12-18mm, painted".
- Backlighting: "rgb led strip, diffusion channel".
- Ceiling panels: "120x120cm modular panels".
- Floor: "dark wood or composite".
- Hanging elements: "ramie fiber, paper mulberry".
- Firefly lights: "warm micro-led 2700k, Arduino-controlled".

### 4. Export capability

- A "screenshot" button that captures the current 3d view at high resolution.
- Optionally, a "generate spec sheet" button that outputs the current variant combination and all its parameters as a downloadable text or pdf file.

### 5. Plan view overlay

When in overhead camera mode + construction view, the display should look like an architectural floor plan:

- Room outline clearly visible.
- Mountain wall position and depth marked.
- Ceiling panel grid visible.
- Any suspended elements (canopy grid) shown as dotted outlines.
- Scale bar.

## Deliverable

A practical tool for Riaan and Corbett to plan the physical build, with real-world measurements and material annotations.

## Acceptance criteria

- Construction view is visually distinct from experience view (wireframe, light background, flat lighting).
- Dimensions are labeled accurately and update with parameter changes.
- Material annotations are present for all major surfaces.
- Screenshot export works.
- Overhead plan view looks like a basic floor plan.
