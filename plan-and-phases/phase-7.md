# Phase 7: decision consolidation

## Goal

After Riaan and Corbett have reviewed all variants and made choices, combine the selected options into one final polished design.

## Prerequisites

This phase only begins after variant decisions have been made. The following must be decided:

- Mountain wall variant (a, b, c, or a custom mix).
- Lighting/color palette variant.
- Transition speed.
- Firefly behavior variant (1-6).
- Ceiling variant.
- Floor variant.
- Any parameter tweaks from Leva sessions.

## What to build

### 1. Lock in chosen variants

- Remove the variant switcher ui.
- Hardcode the selected combination.
- Remove Leva panel from production build (keep it available in dev mode).

### 2. Polish the final composition

- Fine-tune camera position and field of view for the best first-person experience.
- Smooth out any transition artifacts.
- Adjust firefly density and timing based on feedback from Corbett.
- Ensure the golden hour to darkness transition feels cinematic and emotionally engaging.
- Test the full cycle at exhibition speed (2-5 minutes).

### 3. Add intro screen

- A simple title card: project name, location, a one-line description.
- Fades into the 3d experience.
- Optional: a brief text overlay at each phase transition identifying what the viewer is seeing.

### 4. Performance pass

- Profile the app and fix any frame rate issues.
- Ensure smooth 60fps on a recent laptop.
- Optimize particle counts if needed.

## Deliverable

A single, polished 3d experience representing the final installation design. No variant switching ui — just the experience.

## Acceptance criteria

- One seamless experience from golden hour to firefly darkness.
- No visible ui clutter.
- Smooth performance.
- Intro screen with project title.
- Looks compelling enough to show to stakeholders and potential visitors.
