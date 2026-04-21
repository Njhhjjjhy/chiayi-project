# QA issue: 3D preview — remove mountain wall, calm ceiling, fix door curtains

**Date:** 2026-04-20
**Status:** ✓ Completely fixed (pending visual verification)
**Reporter:** Riaan (qa-1.png … qa-6.png + venue reference photos)

## Issue description

Six screenshots in `qa/` showed the 3D preview in light mode. Three problems:

1. **qa-1, qa-2** — `mountainTopology` ceiling with peaks dropping ~1 m+ from the dropped ceiling height (3.2 m), so valleys came as low as ~2.0 m into a 3.52 m room. Reads as dramatic mountain range overhead, not subtle texture.
2. **qa-1, qa-2** — `LayeredMountainWall` (green layered silhouettes) was the active variant on the front-wall. The user no longer wants this option offered.
3. **qa-3, qa-5, qa-6** — Visible white halos around the back-wall door openings and the entrance opening. Curtains looked to be missing or behind the wall.

Reference images in `public/research-trip-20260418/` and the dimension drawings under `dimensions/` were used to confirm the room geometry was correct; the door positions themselves were not the bug.

## Root cause

1. **Ceiling amplitude.** `MountainTopologyCeiling` in `src/components/Ceiling.jsx` summed sin/cos terms with amplitudes of `0.4 + 0.25 + 0.2 + 0.12` plus `±0.125` random — peak displacement could exceed 1.0 m. Combined with `DROPPED_H = 3.2`, the lowest valleys hung down to ~2.0 m.
2. **Mountain wall.** Variant was still wired through `WallSystem.jsx`, `variants/wall.js`, `useVariant.jsx`, `ConstructionToolbar.jsx`, `DimensionLabels.jsx` and `BlueprintMode.jsx`. `SkyBackdrop` only existed to render a sky behind that wall.
3. **Curtains.** In `Room.jsx` the back-wall is a slab spanning `z = HD` to `z = HD + WALL_T` (= 5.00 → 5.12). The curtain meshes were positioned at `z = HD + 0.04` (= 5.04) — *inside* the wall thickness, on the outside-facing half. From inside the room the curtain was effectively occluded by the wall section it sat behind, leaving the door opening reading as a black hole edged by the wall section's faces. Same bug on the entrance-wall: curtain was at `x = -HW - 0.04` (outside the room).

## Solution

1. **Ceiling:** halved-and-then-some all amplitudes (0.4→0.12, 0.25→0.08, 0.2→0.06, 0.12→0.04, random 0.25→0.08) and raised `DROPPED_H` from 3.2 → 3.4. Net: peak displacement ~0.3 m hanging from 3.4 m — feels like textured panels, not a mountain range.
2. **Mountain wall:** deleted the component, the variant entry, and every fallback that defaulted to `layeredMountain` (now defaults to `livingMoss`). Deleted `SkyBackdrop` entirely (and removed it from `Scene.jsx`). Removed the orphaned `mountainDetail` camera preset in `variants/config.js` and the matching blueprint view in `BlueprintMode.jsx`.
3. **Curtains:** moved each curtain mesh to the room-facing side of its wall (D1 / D2 to `z = HD - 0.04`; visitor entrance to `x = -HW + 0.04`).

## Files modified

- `src/components/Ceiling.jsx` — reduced topology amplitudes; raised `DROPPED_H`
- `src/components/Room.jsx` — flipped curtain positions to room-facing side of each wall
- `src/components/walls/LayeredMountainWall.jsx` — **deleted**
- `src/components/SkyBackdrop.jsx` — **deleted**
- `src/components/Scene.jsx` — removed `SkyBackdrop` import + render
- `src/components/walls/WallSystem.jsx` — removed `layeredMountain` from map; default → `livingMoss`
- `src/variants/wall.js` — removed `layeredMountain` entry
- `src/variants/config.js` — removed `mountainDetail` camera preset
- `src/hooks/useVariant.jsx` — default `wall` selection → `livingMoss`
- `src/components/ConstructionToolbar.jsx` — fallback wall id → `livingMoss`
- `src/components/DimensionLabels.jsx` — fallback wall id → `livingMoss`
- `src/components/BlueprintMode.jsx` — removed `mountainDetail` view

## Verification results

### Code review
- [x] Changes match approved plan
- [x] No remaining `layeredMountain` / `LayeredMountain` / `MountainWall` references in `src/`
- [x] No remaining `SkyBackdrop` references in `src/`
- [x] Build passes (`npm run build` — 1.32s, no errors)

### Browser testing
- [ ] `mountainTopology` ceiling now reads as subtle textured surface, not mountain range
- [ ] Wall variant selector no longer lists "Layered mountain silhouette"
- [ ] D1 + D2 doors on back-wall show black curtain across the opening (no white halo)
- [ ] Visitor entrance shows black curtain across the opening (no white halo)
- [ ] No console errors after removing `SkyBackdrop` / `LayeredMountainWall`

**Test notes:** Dev server running at `http://localhost:5173/3d`. Visual confirmation pending user QA.

## CLAUDE.md updates

None — existing rules were sufficient.
