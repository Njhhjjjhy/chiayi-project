# Phase 5: room environment variants

## Goal

Build out the full room so mountain wall + ceiling + floor + fireflies work together as a cohesive space. Create switchable variants for each room element.

## What to build

### 1. Ceiling variants

Create `src/components/Ceiling.jsx` with at least 3 options:

**Variant a — flat dropped ceiling with panel grid:**
- A flat plane at 3.5m height.
- Visible grid lines dividing it into 120x120cm panels (matching the physical ceiling spec).
- Neutral dark material with subtle panel seams.

**Variant b — organic canopy:**
- A curved or undulating ceiling surface.
- Suggests a natural forest canopy.
- Darker in the center, slightly lighter at edges.

**Variant c — open/exposed:**
- No visible ceiling. The room fades to black above 3.5m.
- Creates a sense of limitless vertical space (useful for canopy grid firefly variant).

### 2. Floor variants

Create `src/components/Floor.jsx` with at least 3 options:

**Variant a — dark wood planks:**
- A plane with a procedural wood plank texture (repeating rectangles with slight color variation).
- Matte finish, dark walnut tones.

**Variant b — forest floor:**
- Dark earth base with subtle grass tuft geometry scattered across the surface.
- Very sparse — just enough to suggest being in nature, not a dense lawn.

**Variant c — simple dark matte:**
- Plain dark surface. Lets the wall and fireflies do all the visual work.
- The safest option for visual clarity.

### 3. Side wall treatment

The three non-mountain walls should be:
- Dark, neutral, and non-distracting.
- Slightly absorptive-looking (matte black or very dark gray).
- One wall may serve as the veil surface (for firefly variant 5) or the reflection screen (variant 6).

### 4. Camera presets

Add switchable camera positions to the ui:

- First-person standing: eye height (1.6m), centered in the room, facing the mountain wall.
- First-person seated: lower eye height (1.1m), centered.
- Overhead plan view: looking straight down from above, showing the room layout.
- Corner perspective: positioned in a room corner looking diagonally across.
- Free orbit: unconstrained orbit controls for manual inspection.

### 5. Combination selector

The variant switcher should now allow combining:
- Mountain wall variant (from phase 2) + lighting palette (from phase 3) + firefly behavior (from phase 4) + ceiling + floor.
- A "randomize" button that picks a random combination.
- A "favorites" system where you can save a combination for later comparison.

## Deliverable

A fully enclosed 3d room where all elements work together. Every element is switchable. Combinations can be compared.

## Acceptance criteria

- At least 3 ceiling and 3 floor variants are switchable.
- Side walls are present and non-distracting.
- Camera presets switch instantly.
- The combination selector allows mixing any mountain + lighting + firefly + ceiling + floor together.
- The room feels cohesive and immersive in first-person view.
- Construction view (from phase 1) still works and shows all geometry in wireframe.
