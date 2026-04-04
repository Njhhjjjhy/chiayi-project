# Phase 1: foundation and variant infrastructure

## Goal

Set up the project, build a variant switcher ui, and get a basic 3d scene running with an empty room shell.

## What to build

### 1. Project scaffold

Create a Vite + React project with the following dependencies:

```
npm create vite@latest firefly-experience -- --template react
cd firefly-experience
npm install three @react-three/fiber @react-three/drei leva tailwindcss @tailwindcss/vite
```

### 2. App structure

```
src/
  App.jsx                  — main layout with canvas and ui overlay
  components/
    Scene.jsx              — the 3d scene container
    Room.jsx               — the 10x10m room shell (floor, walls, ceiling placeholder)
    VariantSwitcher.jsx    — ui panel for switching between variants
  variants/
    config.js              — variant definitions (will grow in later phases)
  hooks/
    useVariant.js          — shared state for currently selected variants
  styles/
    index.css              — tailwind base styles
```

### 3. The 3d scene

- A React Three Fiber canvas filling the viewport.
- A perspective camera positioned at roughly eye height (1.6m) near one wall, looking toward the opposite wall (where the mountain wall will go).
- OrbitControls from drei, constrained so the camera stays inside the room.
- A ground plane at y=0, 10x10 meters, dark matte material.
- Four walls as simple box geometries (thin, tall), positioned at the room edges. Use a neutral dark material. Leave the wall facing the camera (the "mountain wall") as a placeholder — it will be replaced in phase 2.
- A ceiling plane at y=3.5 (3.5 meter ceiling height is a reasonable starting assumption — can be adjusted later).
- Basic ambient light so the geometry is visible.
- A grid helper on the floor (togglable) showing 1-meter increments.

### 4. The variant switcher ui

A minimal sidebar or bottom panel overlaying the 3d canvas. It should have:

- Collapsible sections for each design category (mountain wall, lighting, fireflies, room). These will be empty at first and populated in later phases.
- A "view mode" toggle: experience view (atmospheric) vs construction view (wireframe + grid + dimensions). Construction view is just wireframe materials + the grid helper visible.
- A label showing which variants are currently active.

Use tailwind for styling. Keep it dark and minimal so it doesn't compete with the scene.

### 5. Leva integration

Add a Leva panel (can be hidden by default, toggled with a keyboard shortcut like `L`) for real-time parameter tweaking. In this phase, expose:

- Room dimensions (width, depth, height) so they can be adjusted live.
- Camera position presets (eye-level, overhead, corner).
- Grid visibility toggle.

### 6. Vercel deployment

Add a `vercel.json` if needed. Make sure `npm run build` works and the output is deployable.

## Deliverable

A running app showing an empty dark room with a grid floor, orbit controls, a variant switcher skeleton, and Leva parameter controls. Nothing inside the room yet, but the infrastructure to add everything in later phases.

## Acceptance criteria

- The room renders at correct 10x10m scale.
- OrbitControls work but are constrained to stay roughly inside the room.
- The variant switcher ui is visible and has empty placeholder sections.
- The view mode toggle switches between atmospheric (lit) and construction (wireframe + grid).
- Leva panel is accessible and room dimensions update live.
- The app builds and deploys to Vercel without errors.
