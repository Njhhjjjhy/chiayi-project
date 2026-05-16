# Build prompt: v2 simulation — full spatial rebuild + proposal variant system

## What this builds

This is a ground-up spatial rebuild of the 3D simulation plus a new proposal variant system. The existing room geometry was built on a different coordinate system and a different physical understanding of the space. Both are now wrong. This prompt replaces them with a verified, locked spatial spec and introduces a UI toggle that lets the user switch between the two real design proposals — `fireflies-folded-sky` and `fireflies-within-reach` — directly in the browser.

**Do not preserve any existing geometry values. Every position, dimension, and camera preset in the codebase will change.**

---

## Build pattern (mandatory — do not deviate)

- **Step 0**: read-only discovery pass. Read every file listed. Report findings. Stop. Do not write any code until step 0 is complete and reported.
- **Three chunks**: chunk 1, chunk 2, chunk 3. At the end of each chunk write a summary block (`Built / Flagged / Deferred`) before proceeding.
- **One finding per message**. Never stack multiple corrections in one message.
- **Stop-and-flag**: any value not explicitly given below → stop, report, wait. Never infer or default-fill a spatial value.
- **Diagnose before fixing**: read-only pass before any geometry change, even small ones.
- **Never silently delete** a component or constant. List it and confirm first.

---

## Step 0 — read-only discovery (do this first, report before writing any code)

Read every file below in full. Then report:

Start by reading these three reference documents — they are the authoritative source for all spatial decisions in this build:

- `docs/firefly-room-floor-plan.md` — canonical metric spatial reference. Every dimension, zone, and partition position comes from here.
- `docs/fireflies-folded-sky-v4.md` — the `fireflies-folded-sky` proposal this build simulates.
- `docs/fireflies-within-reach-v4.md` — the `fireflies-within-reach` proposal this build simulates.

Then read the codebase files and report:

1. Every exported constant and its current value from `src/geometry/dimensions.js`.
2. Every component currently mounted inside `src/components/Room.jsx` (list the import name and what it renders).
3. The current geometry inside `src/components/Ceiling.jsx` — specifically what `MountainTopologyCeiling` renders and where it is positioned in Y.
4. The current variant ID used for ceiling in `src/variants/defaults.js`.
5. The current route structure in `src/App.jsx`.
6. The full shape of the context value provided by `src/hooks/VariantProvider.jsx` (list every key).
7. The current positions (x, y, z) and targets of all six camera presets in `src/variants/config.js`.
8. Whether `src/components/room/Pathway.jsx` renders one segment or two, and which walls they run along.
9. Whether `src/components/room/EntranceWallPartition.jsx` renders one mesh or multiple.
10. Whether `src/hooks/ProposalProvider.jsx` exists yet.
11. Whether `src/variants/proposals.js` exists yet.
12. Whether `src/components/room/Branches.jsx` exists yet.
13. Whether `src/components/room/LuffaWall.jsx` exists yet.
14. Whether `src/components/room/WallLighting.jsx` exists yet.

Do not proceed past step 0 until all 14 points are reported.

---

## Coordinate system change — read this carefully

### Old system (current codebase)

The room is centred at world origin (0, 0, 0). Half-widths `HW = ROOM.W / 2 = 4.415` and `HD = ROOM.D / 2 = 4.39` are used everywhere. Wall positions are at `±HW` on X and `±HD` on Z.

From `dimensions.js` comments, the current wall mapping is:
- `z = -HD` → `front-wall`
- `z = +HD` → `back-wall`
- `x = -HW` → `entrance-wall`
- `x = +HW` → `window-wall`

The existing `Pathway.jsx` renders an L-shaped partition along the `front-wall` and `window-wall` sides. The existing `EntranceWallPartition.jsx` renders a single mesh along `x = -HW`.

### New system (this build)

The origin moves to the **`back-wall` / `entrance-wall` corner** — the bottom-left corner of the exhibition area floor in plan view.

- **X axis**: positive toward `front-wall`. `back-wall` is at X = 0. `front-wall` is at X = 8.83.
- **Y axis**: positive up. Floor at Y = 0. Working ceiling at Y = 3.52.
- **Z axis**: positive toward `window-wall`. `entrance-wall` line is at Z = 0. `window-wall` is at Z = 8.78.

### What this means for existing code

Every constant in `dimensions.js` that encodes a position must change. Every wall mesh position must change. Every camera preset must change. Every component that imports `HW`, `HD`, `INSIDE`, `ENT_END`, `COL_CENTER_X`, `COL_CENTER_Z`, or any derived position constant is affected.

The `HW` and `HD` half-width pattern is **retired**. Do not introduce new uses of `HW` or `HD`. Replace with explicit named constants derived from `ROOM.W` and `ROOM.D`.

The L-shaped pathway partition that was along `front-wall` and `window-wall` in the old layout now runs along `back-wall` and `window-wall` in the new layout. The entrance-wall partition that was a single mesh at `x = -HW` is now three separate meshes — see partition spec below.

---

## Locked spatial spec (authoritative — every number in this section is final)

All units are metres.

### Room envelope

```js
export const ROOM = { W: 8.83, D: 8.78, H: 3.52, H_TOTAL: 4.2 }
```

| Wall | Axis | Position |
|---|---|---|
| `back-wall` | X = 0 | Full depth Z = 0 to 8.78 |
| `front-wall` | X = 8.83 | Full depth Z = 0 to 8.78 |
| `entrance-wall` line | Z = 0 | No real wall — partitions only (see below) |
| `window-wall` | Z = 8.78 | Full width X = 0 to 8.83 |

### Column

Existing structural element. Cannot be moved.

```js
export const COLUMN_X = 6.43        // = ROOM.W - 2.4, from back-wall
export const COLUMN_Z = 0           // on the entrance-wall line
export const COLUMN_W = 0.30        // footprint X  — ESTIMATE
export const COLUMN_D = 0.30        // footprint Z  — ESTIMATE
```

Centre in 3D: X = `COLUMN_X + COLUMN_W / 2`, Y = `ROOM.H / 2`, Z = `COLUMN_D / 2`.

### Partitions

Three separate meshes. All plywood, 18 mm thick (`PARTITION_T = 0.018`), Y = 0 to `ROOM.H`. Standard structural material (emissive).

```js
export const PARTITION_T = 0.018
export const ENTRY_GAP_WIDTH = 1.5
export const PATHWAY_PARTITION_Z = 7.28   // = ROOM.D - ENTRY_GAP_WIDTH
```

| Mesh name | Runs along | From | To | Gaps |
|---|---|---|---|---|
| `entrance-wall-partition` | Z = 0 | X = 1.5 | X = 6.43 | X = 0–1.5 open (entry). X = 6.73–8.83 open (exit/gift). |
| `pathway-partition-vertical` | X = 1.5 | Z = 0 | Z = 7.28 | None |
| `pathway-partition-horizontal` | Z = 7.28 | X = 1.5 | X = 6.43 | X = 6.43–8.83 open (forest entry) |

### Zones (logical — no geometry)

| Zone | X bounds | Z bounds |
|---|---|---|
| `pathway` (L-shaped, 1.5 m wide) | X = 0 to 1.5 (vertical leg) / X = 0 to 6.43 (horizontal leg) | Z = 0 to 8.78 / Z = 7.28 to 8.78 |
| `forest` | X = 1.5 to 8.83 | Z = 0 to 7.28 |
| Exit/gift area | X = 6.43 to 8.83 | Z = 0 (open) |

```js
export const FOREST_X_START = ENTRY_GAP_WIDTH    // 1.5
export const FOREST_X_END   = ROOM.W             // 8.83
export const FOREST_Z_START = 0
export const FOREST_Z_END   = PATHWAY_PARTITION_Z // 7.28
```

### Doors and windows (all ESTIMATE — mark every mesh)

| Element | Wall | Centre | Width | Height | Notes |
|---|---|---|---|---|---|
| D1 | `back-wall` X = 0 | Z = 2.5 | 0.9 | 2.1 | ESTIMATE |
| D2 | `back-wall` X = 0 | Z = 5.0 | 0.9 | 2.1 | ESTIMATE |
| `window-wall` door 1 | Z = 8.78 | X = 0.95 | 0.9 | 2.1 | ESTIMATE |
| `window-wall` door 2 | Z = 8.78 | X = 3.95 | 0.9 | 2.1 | ESTIMATE |
| `window-wall` window 1 | Z = 8.78 | X = 2.3 | 1.0 | 1.5 (sill 0.9) | ESTIMATE |
| `window-wall` window 2 | Z = 8.78 | X = 5.3 | 1.0 | 1.5 (sill 0.9) | ESTIMATE |

The detailed old window-wall constants (`MAIN_WIN_W`, `SMALL_WIN_W`, `STEEL_DOOR_W`, `PLENUM_*`, etc.) are retired. Do not carry them forward.

### Theatrical curtain

Dark blue fabric plane at Z = 8.78, facing inward. Width = `ROOM.W`, height = `ROOM.H`. Centre at X = `ROOM.W / 2`, Y = `ROOM.H / 2`. Always rendered, no toggle. Material: `color="#0a1a2e"`, `emissive="#0a1a2e"`, `emissiveIntensity={0.06}`, `roughness={0.9}`.

---

## Emissive materials rule (hard — no exceptions)

ACES tone mapping (`THREE.ACESFilmicToneMapping`) crushes non-emissive surfaces to pure black at ambient 0.01. Every mesh visible in experience mode must use `MeshStandardMaterial` with both `emissive` and `emissiveIntensity` set.

Applies to: walls, floor, partitions, column, ceiling panels, branches, luffa wall placeholder, theatrical curtain.

**Standard structural surface material (use this for all walls, floor, partitions, column):**
```js
<meshStandardMaterial
  color="#1a1a1a"
  emissive="#1a1a1a"
  emissiveIntensity={0.08}
  roughness={0.95}
  metalness={0}
/>
```

**Firefly LED spheres:** radius `0.025` (physically accurate 0.0015 is sub-pixel — use 0.025 for legibility). `color="#00FF00"`, `emissive="#00FF00"`, `emissiveIntensity={2.0}`.

If any mesh is rendered without an emissive value, stop and flag before continuing.

---

## Naming rules (hard)

- No compass directions anywhere — not in variable names, JSX props, comments, filenames, or commits.
- Canonical wall names: `back-wall`, `front-wall`, `entrance-wall`, `window-wall`.
- `HW` and `HD` are retired. Do not use them in any new code.
- "Pathway" always — never "corridor", "tunnel", or "walking strip".
- No artist, designer, studio, or artwork names anywhere.
- Kebab-case for filenames. camelCase for JS variables and React component names.

---

## Chunk 1 — dimensions, room shell, and partitions

### 1.1 — rewrite `src/geometry/dimensions.js`

Replace the entire file. Keep named exports (no default export) so existing import statements continue to resolve. Export these names at minimum — add others only if needed by components you are rewriting in this chunk:

```js
export const ROOM = { W: 8.83, D: 8.78, H: 3.52, H_TOTAL: 4.2 }
export const WALL_T = 0.12
export const PARTITION_T = 0.018

export const COLUMN_X = 6.43
export const COLUMN_Z = 0
export const COLUMN_W = 0.30   // ESTIMATE
export const COLUMN_D = 0.30   // ESTIMATE

export const ENTRY_GAP_WIDTH = 1.5
export const PATHWAY_PARTITION_Z = 7.28

export const FOREST_X_START = ENTRY_GAP_WIDTH
export const FOREST_X_END   = ROOM.W
export const FOREST_Z_START = 0
export const FOREST_Z_END   = PATHWAY_PARTITION_Z

export const D1_Z = 2.5,  D1_W = 0.9,  D1_H = 2.1   // ESTIMATE
export const D2_Z = 5.0,  D2_W = 0.9,  D2_H = 2.1   // ESTIMATE

export const WW_DOOR1_X = 0.95, WW_DOOR1_W = 0.9, WW_DOOR1_H = 2.1  // ESTIMATE
export const WW_DOOR2_X = 3.95, WW_DOOR2_W = 0.9, WW_DOOR2_H = 2.1  // ESTIMATE
export const WW_WIN1_X  = 2.3,  WW_WIN1_W  = 1.0, WW_WIN1_H  = 1.5, WW_WIN1_SILL = 0.9  // ESTIMATE
export const WW_WIN2_X  = 5.3,  WW_WIN2_W  = 1.0, WW_WIN2_H  = 1.5, WW_WIN2_SILL = 0.9  // ESTIMATE
```

After rewriting, scan every file in `src/` that imports from `dimensions.js`. List every imported name that no longer exists. Fix each import. Do not leave dangling imports.

Retired exports — remove from every import list: `HW`, `HD`, `INSIDE`, `ENT_W`, `ENT_START`, `ENT_END`, `ENT_Z`, `ENT_H`, `COL_CENTER_X`, `COL_CENTER_Z`, `COL_BACK_Z`, `COL_W` (old), `WAINSCOT_H`, `DROPPED_CEILING_Y`, `PATHWAY_WIDTH`, `PATHWAY_HEIGHT`, `PATHWAY_SEG2_FACE_X`, `WINDOW_PRESET_CAMERA_X`, `MAIN_WIN_W`, `MAIN_WIN_SILL`, `MAIN_WIN_TOP`, `MAIN_WIN_H`, `MAIN_WIN_Z`, `SMALL_WIN_W`, `SMALL_WIN_SILL`, `SMALL_WIN_H`, `SMALL_WIN_Z`, `STEEL_DOOR_W`, `STEEL_DOOR_H`, `STEEL_DOOR_Z`, `PLENUM_MAIN_DEPTH_Z`, `PLENUM_MAIN_WIDTH_X`, `PLENUM_MAIN_HEIGHT_Y`, `PLENUM_MAIN_X`, `PLENUM_MAIN_Z`, `PLENUM_MAIN_Y`, `PLENUM_DROP_DEPTH_Z`, `PLENUM_DROP_WIDTH_X`, `PLENUM_DROP_HEIGHT_Y`, `PLENUM_DROP_X`, `PLENUM_DROP_Z`, `PLENUM_DROP_Y`, `D1_W` (old), `D1_H` (old), `D1_END_X`, `D1_START_X`, `D1_X`, `D2_W` (old), `D2_H` (old), `D2_END_X`, `D2_X`, `DOOR_SKIPS`, `DOOR_TOPS`, `DOOR_CLEAR`.

### 1.2 — rewrite `src/components/room/Walls.jsx`

Three wall meshes (no `entrance-wall` mesh). Each faces inward. Standard structural material (emissive). No door or window cut-outs — walls are continuous planes. No `ArchEdges`, no `Wainscot`, no `wallMaterial` import.

```
back-wall:   plane at X = 0,       faces +X, size: depth = ROOM.D, height = ROOM.H
             centre: [WALL_T / 2,   ROOM.H / 2, ROOM.D / 2]

front-wall:  plane at X = ROOM.W,  faces -X, size: depth = ROOM.D, height = ROOM.H
             centre: [ROOM.W - WALL_T / 2, ROOM.H / 2, ROOM.D / 2]

window-wall: plane at Z = ROOM.D,  faces -Z, size: width = ROOM.W, height = ROOM.H
             centre: [ROOM.W / 2, ROOM.H / 2, ROOM.D - WALL_T / 2]
```

### 1.3 — rewrite `src/components/Floor.jsx`

Plane at Y = 0. Centre at `[ROOM.W / 2, 0, ROOM.D / 2]`. Size: `ROOM.W × ROOM.D`. Standard structural material with `emissiveIntensity={0.04}`.

### 1.4 — rewrite `src/components/room/Column.jsx`

Box centred at `[COLUMN_X + COLUMN_W / 2, ROOM.H / 2, COLUMN_D / 2]`. Args: `[COLUMN_W, ROOM.H, COLUMN_D]`. Standard structural material. Remove all imports of `COL_CENTER_X`, `COL_CENTER_Z`, `COL_W` (old). Add `// ESTIMATE: column footprint 0.3 × 0.3 — confirm from building visit`.

### 1.5 — rewrite `src/components/room/EntranceWallPartition.jsx`

Currently one mesh. Replace with three separate named meshes. Standard structural material. Each: thickness = `PARTITION_T`, height = `ROOM.H`.

```
// entrance-wall-partition — along Z = 0, from entry gap end to column face
length = COLUMN_X - ENTRY_GAP_WIDTH  // 6.43 - 1.5 = 4.93
centre: [ENTRY_GAP_WIDTH + length / 2,  ROOM.H / 2,  PARTITION_T / 2]
boxGeometry args: [length, ROOM.H, PARTITION_T]

// pathway-partition-vertical — along X = 1.5, from Z = 0 to pathway partition Z
length = PATHWAY_PARTITION_Z  // 7.28
centre: [ENTRY_GAP_WIDTH + PARTITION_T / 2,  ROOM.H / 2,  PATHWAY_PARTITION_Z / 2]
boxGeometry args: [PARTITION_T, ROOM.H, PATHWAY_PARTITION_Z]

// pathway-partition-horizontal — along Z = PATHWAY_PARTITION_Z, from vertical partition to column
length = COLUMN_X - ENTRY_GAP_WIDTH  // 4.93
centre: [ENTRY_GAP_WIDTH + length / 2,  ROOM.H / 2,  PATHWAY_PARTITION_Z - PARTITION_T / 2]
boxGeometry args: [length, ROOM.H, PARTITION_T]
```

Comment each mesh with its canonical name.

### 1.6 — rewrite `src/components/room/Pathway.jsx`

The existing `Pathway.jsx` renders two partition segments along `front-wall` and `window-wall`. These are completely replaced by the three partitions in `EntranceWallPartition.jsx` above. In the new layout the pathway runs along `back-wall` and `window-wall` — the partition geometry that forms it is in `EntranceWallPartition.jsx`.

Rewrite `Pathway.jsx` to render only the information card placeholders and pathway point lights. If detangling this from the old partition geometry is complex, stub it as `return null` and flag in the chunk 1 summary.

### 1.7 — rewrite `src/components/room/TheatricalCurtain.jsx`

Plane at Z = `ROOM.D - WALL_T / 2`, facing inward (-Z). Centre: `[ROOM.W / 2, ROOM.H / 2, ROOM.D - WALL_T / 2]`. Args: `[ROOM.W, ROOM.H]`. Material: `color="#0a1a2e"`, `emissive="#0a1a2e"`, `emissiveIntensity={0.06}`, `roughness={0.9}`. Always rendered.

### 1.8 — rewrite `src/components/room/Doors.jsx`

D1 and D2 on `back-wall` (X = 0 face only). Each: slightly lighter fill plane at the opening. Material: `color="#2a2a2a"`, `emissive="#2a2a2a"`, `emissiveIntensity={0.1}`. Mark every mesh `// ESTIMATE — confirm from building visit`. Remove all old `window-wall` door geometry from this file.

### 1.9 — rewrite `src/components/room/Windows.jsx`

Two doors and two windows on `window-wall` (Z = 8.78 face). All ESTIMATE. Material: `color="#1a2030"`, `emissive="#1a2030"`, `emissiveIntensity={0.05}`. Mark every mesh.

### 1.10 — update `src/components/Room.jsx`

Replace the coordinate comment block at the top with the new system. Remove imports of: `HVAC`, `Wainscot`, `Glass` (if present). Add `// RETIRED in v2 build` comment to the top of each retired file — do not delete the files. Keep mounted: `Floor`, `Ceiling`, `Walls`, `Windows`, `Doors`, `TheatricalCurtain`, `EntranceWallPartition`, `Column`, `Pathway`.

### 1.11 — update camera presets in `src/variants/config.js`

Remove all imports of `HW`, `HD`, `ENT_W`, `WINDOW_PRESET_CAMERA_X`. Remove `ELEVATION_PRESET_KEYS`. Replace all six presets with:

```js
import { ROOM } from '../geometry/dimensions.js'

export const cameraPresets = {
  ceiling: {
    label: 'Ceiling',
    position: [ROOM.W / 2, 10,   ROOM.D / 2],
    target:   [ROOM.W / 2,  0,   ROOM.D / 2],
  },
  back: {
    label: 'Back-wall',
    position: [ROOM.W / 2, 1.6,  0.4],
    target:   [ROOM.W / 2, 1.6,  ROOM.D],
  },
  front: {
    label: 'Front-wall',
    position: [ROOM.W / 2, 1.6,  ROOM.D - 0.4],
    target:   [ROOM.W / 2, 1.6,  0],
  },
  window: {
    label: 'Window-wall',
    position: [0.75,        1.6,  ROOM.D / 2],
    target:   [ROOM.W,      1.6,  ROOM.D / 2],
  },
  entrance: {
    label: 'Entrance-wall',
    position: [ROOM.W / 2,  1.6,  ROOM.D / 2],
    target:   [ROOM.W / 2,  1.6,  0],
  },
  standing: {
    label: 'Standing',
    position: [0.75,         1.6,  0.4],
    target:   [ROOM.W / 2,  1.6,  ROOM.D / 2],
  },
}
```

### Chunk 1 stop and report

```
Chunk 1 summary
Built: [file — what changed]
Flagged: [conflicts or unknowns]
Deferred: [items moved to chunk 2 or 3]
```

---

## Chunk 2 — ceiling panels, proposal variant system, and proposal switcher UI

### 2.1 — rewrite `src/components/Ceiling.jsx`

Replace `MountainTopologyCeiling` geometry with `FlatPanelCeiling`. Keep the variant ID `mountainTopology` in `CEILING_COMPONENTS` — the identifier stays, the geometry changes.

Panels cover the `forest` zone only: X = `FOREST_X_START` to `FOREST_X_END`, Z = `FOREST_Z_START` to `FOREST_Z_END`.

Panel spec:
- 25 panels total. 10 small (0.4 × 0.4 m), 10 medium (0.65 × 0.65 m), 5 large (0.9 × 0.9 m).
- Height Y = 2.2 to 3.2. Organic distribution using seeded PRNG (seed 42). No uniform grid.
- Tilt 0–15 degrees off horizontal. Rotate on X and/or Z per panel, not Y.
- Material: `color="#111111"`, `emissive="#111111"`, `emissiveIntensity={0.06}`, `roughness={0.95}`.
- LED pinpoints on lower face: small emissive spheres, radius 0.01, `color="#00FF00"`, `emissive="#00FF00"`, `emissiveIntensity={1.5}`. Count: 12 / 20 / 30 per size class. Seeded jittered grid per panel.
- Two suspension cables per panel: `CylinderGeometry` radius 0.003, dark `#333333`, from panel corners to Y = 3.52.

Construction mode: panel material switches to `color="#eeeeee"` with no emissive — match old construction mode behaviour.

### 2.2 — create `src/variants/proposals.js`

```js
// Canonical registry for the two real design proposals.

export const proposalVariants = {
  'fireflies-folded-sky': {
    id: 'fireflies-folded-sky',
    label: 'Fireflies folded sky',
    hasBranches: false,
    wallLight: 'sundown',
    isDefault: true,
  },
  'fireflies-within-reach': {
    id: 'fireflies-within-reach',
    label: 'Fireflies within reach',
    hasBranches: true,
    wallLight: 'horizon-line',
    isDefault: false,
  },
}

export const proposalVariantList = Object.values(proposalVariants)
export const defaultProposalId =
  proposalVariantList.find((v) => v.isDefault)?.id ?? proposalVariantList[0].id
```

### 2.3 — create `src/hooks/useProposal.js`

Mirror `src/hooks/useVariant.js` exactly:

```js
import { createContext, useContext } from 'react'

export const ProposalContext = createContext(null)

export function useProposal() {
  const ctx = useContext(ProposalContext)
  if (!ctx) throw new Error('useProposal must be used within ProposalProvider')
  return ctx
}
```

### 2.4 — create `src/hooks/ProposalProvider.jsx`

```jsx
import { useState } from 'react'
import { ProposalContext } from './useProposal.js'
import { proposalVariants, defaultProposalId } from '../variants/proposals.js'

export function ProposalProvider({ children }) {
  const [proposalId, setProposalId] = useState(defaultProposalId)
  const active = proposalVariants[proposalId] ?? proposalVariants[defaultProposalId]

  return (
    <ProposalContext.Provider
      value={{
        proposalId,
        setProposalId,
        hasBranches: active.hasBranches,
        wallLight:   active.wallLight,
      }}
    >
      {children}
    </ProposalContext.Provider>
  )
}
```

### 2.5 — update `src/main.jsx`

Current `main.jsx` wraps `<App />` in `<BrowserRouter>` only. Add `ProposalProvider` wrapping `App` inside `BrowserRouter`:

```jsx
import { ProposalProvider } from './hooks/ProposalProvider.jsx'

// wrap order: BrowserRouter > ProposalProvider > App
// VariantProvider stays inside FirefliesPage — do not move it
```

### 2.6 — update `src/pages/FirefliesPage.jsx`

`FirefliesInner` currently reads nothing from `useProposal`. Add:
- Import `useProposal` from `../../hooks/useProposal.js`.
- Inside `FirefliesInner`, read `setProposalId` from `useProposal()`.
- Add a `useEffect` that watches `variantId` from `useParams()` and calls `setProposalId(variantId)` if `variantId` is a known proposal ID. Import `proposalVariants` from `../../variants/proposals.js` for the check.
- Fallback: if `variantId` is absent or unrecognised, call `setProposalId(defaultProposalId)`.

### 2.7 — create `src/components/proposals/ProposalSwitcher.jsx`

Two-button toggle. Check `src/components/VariantSwitcher.jsx` for the existing button style and CSS class pattern before writing — match it exactly. Position: `fixed top-4 left-4 z-20`.

```jsx
import { useProposal } from '../../hooks/useProposal.js'
import { proposalVariantList } from '../../variants/proposals.js'

export default function ProposalSwitcher() {
  const { proposalId, setProposalId } = useProposal()
  // render two buttons, one per proposalVariantList entry
  // active proposal: full opacity. inactive: opacity 0.4
  // match VariantSwitcher button style exactly
}
```

Mount inside `FirefliesInner` in `FirefliesPage.jsx`, alongside `VariantSwitcher`. Visible in all view modes.

### 2.8 — create `src/components/room/Branches.jsx`

Reads `hasBranches` from `useProposal()`. Returns `null` when `hasBranches` is false.

When true: 20 horizontal branch segments in the `forest` zone (X = `FOREST_X_START` to `FOREST_X_END`, Z = `FOREST_Z_START` to `FOREST_Z_END`), height Y = 2.0 to 2.8. Seeded PRNG seed 99.

Each branch:
- `CylinderGeometry`: top radius 0.015, bottom radius 0.025, height 0.8–1.4 m (vary), radial segments 6.
- Random Y rotation (full 360 degrees).
- Textures via `useTexture` from `@react-three/drei`: `map` from `public/textures/Bark007/Bark007_2K-JPG_Color.jpg`, `normalMap` from `public/textures/Bark007/Bark007_2K-JPG_NormalGL.jpg`.
- Add `emissive="#001100"`, `emissiveIntensity={0.05}` so branches don't crush to black at ambient 0.01.

**Stop and flag if `public/textures/Bark007/Bark007_2K-JPG_Color.jpg` does not exist.** Do not substitute another texture.

Mount inside `src/components/Room.jsx`.

### 2.9 — create `src/components/room/WallLighting.jsx`

Reads `wallLight` from `useProposal()`. Renders ambient lighting bars along the four forest walls.

`wallLight === 'sundown'` (`fireflies-folded-sky`):
- Y = 0.05. Material: `color="#ff8c00"`, `emissive="#ff8c00"`, `emissiveIntensity={0.15}`.

`wallLight === 'horizon-line'` (`fireflies-within-reach`):
- Y = 0.35. Material: `color="#fffaf0"`, `emissive="#fffaf0"`, `emissiveIntensity={0.4}`.

Four bars (identical geometry, different Y and material). Each is `BoxGeometry` height 0.02, depth 0.02:

```
Along back-wall interior face:    X = 0 to COLUMN_X,        Z = PARTITION_T,           length on X axis
Along front-wall interior face:   X = FOREST_X_START to ROOM.W, Z = 0 to FOREST_Z_END, length on X axis
Along entrance-wall partition:    X = ENTRY_GAP_WIDTH to COLUMN_X, Z = PARTITION_T,     length on X axis
Along pathway-partition-horiz:    X = ENTRY_GAP_WIDTH to COLUMN_X, Z = PATHWAY_PARTITION_Z - PARTITION_T
```

Mount inside `src/components/Room.jsx`.

### Chunk 2 stop and report

```
Chunk 2 summary
Built: [file — what changed]
Flagged: [conflicts, missing textures, deferred items]
Deferred: [explicitly moved to chunk 3]
```

---

## Chunk 3 — luffa wall, camera verification, baseline, handoff

### 3.1 — create `src/components/room/LuffaWall.jsx`

Warm-lit placeholder panel against `front-wall` (X = 8.83).

- Dimensions: 2.0 m wide × 1.8 m tall.
- Centre: X = `ROOM.W - WALL_T / 2`, Y = 0.9, Z = 3.5.
- Material: `color="#3a2a10"`, `emissive="#5a3a10"`, `emissiveIntensity={0.3}`, `roughness={0.8}`.
- `pointLight` at X = 8.5, Y = 0.9, Z = 3.5, colour `#ffd080`, intensity 0.4, distance 2.0.
- Comment: `// Z = 3.5 ESTIMATE — position confirmed on install day`.

Mount inside `src/components/Room.jsx`.

### 3.2 — verify camera presets

After all geometry is in place, for each of the six presets confirm the camera position does not sit inside a wall, partition, or column. If it does, nudge it 0.3 m outward and note the adjustment in a comment in `config.js`.

### 3.3 — confirm `src/variants/defaults.js`

Ceiling default is `mountainTopology`. Confirm this still resolves to `FlatPanelCeiling` after the `Ceiling.jsx` rewrite. No change needed if the mapping in `CEILING_COMPONENTS` is correct.

### 3.4 — baseline screenshot

Run `node scripts/screenshot-all-presets.mjs`. If it fails or needs geometry updates, note in the handoff and skip — do not debug the screenshot script.

### 3.5 — write handoff to `.handoffs/`

Use `date "+%Y-%m-%d-%H%M%S"` for the timestamp. Cover: what was built per chunk, what was deferred, current state of both proposal variants, any open flags, full list of modified files.

### Chunk 3 stop and report

```
Chunk 3 summary
Built: [file — what changed]
Flagged: [open items]
Deferred: [future sessions]
```

---

## Explicitly deferred — do not attempt in this build

- IR flashlight interaction and IR sensor system.
- LED sequencing algorithm (three-stage arc: flicker → interactive → programmed movement).
- Animated wall lighting transitions.
- Firefly surface positions on branches — stub `hasBranches` branch in `FireflySystem.jsx` if needed but do not implement LED placement on branches. Flag and defer.
- Information panel content in the pathway.
- Shoe storage and tunnel physical elements.
- Emergency egress.
- Audio.
- `HVAC.jsx`, `Wainscot.jsx`, `Glass.jsx`, `ArchEdges.jsx` — retired. Remove their imports from `Room.jsx`. Add `// RETIRED in v2 build` comment at top of each file. Do not delete the files.

---

## Stop-and-flag triggers (stop, report, wait — no workarounds)

- Any constant in `dimensions.js` that conflicts with the locked spatial spec above.
- Any import that fails to resolve after `dimensions.js` is rewritten.
- `Bark007` textures missing from `public/textures/Bark007/`.
- Context key collision between `VariantProvider` and `ProposalProvider`.
- Any mesh rendered without an emissive value.
- `FireflySystem` surface position shape is incompatible with adding branch positions.
- Camera preset position lands inside a mesh and cannot be resolved by 0.3 m nudge.

---

## Hard rules summary

- No compass directions in any identifier, comment, filename, or commit.
- `HW` and `HD` are retired — do not use them in any new code.
- "Pathway" not "corridor", "tunnel", or "walking strip".
- No artist, designer, studio, or artwork names anywhere.
- Emissive materials on every mesh visible at ambient 0.01 — no exceptions.
- Firefly LED sphere radius: 0.025.
- All measurements in metres. Y = 0 is floor.
- Origin at `back-wall`/`entrance-wall` corner. X toward `front-wall`. Z toward `window-wall`. Y up.
- `entrance-wall` is not a solid wall — three partition meshes only, with gaps.
- Never silently delete a component. List it and confirm.
- Read-only pass before any geometry change.
- One finding per message. Never stack.
