# Firefly room floor plan – spatial reference

## How to use this document

This is the canonical spatial reference for the firefly immersive experience at Nanghia, Laiji Village, Alishan Township. Every build prompt, 3D simulation, and proposal must use the dimensions, naming, and coordinate system defined here. Do not infer, guess, or substitute values not listed here – flag and wait.

---

## Coordinate system (for 3D simulation)

- Origin (0, 0, 0): bottom-left corner of the exhibition area floor – the corner where the `back-wall` meets the `entrance-wall` line.
- X axis: runs along the `entrance-wall` line, from `back-wall` toward `front-wall`. Positive X points toward `front-wall`.
- Y axis: vertical. Positive Y points up.
- Z axis: runs from `entrance-wall` toward `window-wall`. Positive Z points toward `window-wall`.
- All dimensions in metres.

---

## Room dimensions

- Exhibition area width (X): 8.83m – from `back-wall` to `front-wall`.
- Exhibition area depth (Z): 8.78m – from `entrance-wall` line to `window-wall`.
- Total ceiling height (Y): 4.2m.
- Working ceiling height after beams (Y): 3.52m.
- Floor: flat, at Y=0.

---

## Wall descriptions and positions

### `back-wall`

- Position: X=0, runs the full depth of the room (Z=0 to Z=8.78m).
- Real wall – structural, existing, cannot be modified.
- Contains two doors: D1 and D2 (see doors section).
- No windows.
- Matte dark finish assumed for simulation.

### `front-wall`

- Position: X=8.83m, runs the full depth of the room (Z=0 to Z=8.78m).
- Real wall – structural, existing, cannot be modified.
- No doors, no windows.
- Luffa wall mounted here inside the forest zone (see luffa wall section).
- Matte dark finish assumed for simulation.

### `entrance-wall`

- Position: Z=0, runs the full width of the room (X=0 to X=8.83m).
- CRITICAL: there is no real wall here. This is an open side of the building. The `entrance-wall` is a term of convenience describing the line along which plywood partitions are built on site to close the space. Do not model it as a solid wall. Model it as the three partition elements described in the partitions section.
- Contains the column (structural, existing).

### `window-wall`

- Position: Z=8.78m, runs the full width of the room (X=0 to X=8.83m).
- Real wall – structural, existing, cannot be modified.
- Contains windows and two doors (see doors and windows section).
- Faces outside. Covered by theatrical blackout curtain during operation.

---

## Column

- Structural, existing, cannot be moved.
- Position on `entrance-wall` line: X=6.43m from `back-wall` (= 8.83m minus 2.4m from `front-wall`), Z=0.
- Physical footprint: estimated 0.3m × 0.3m square. Flag if exact size matters – not confirmed from drawings.
- Height: full structural height, Y=0 to Y=4.2m.
- In simulation: render as a solid rectangular column, matte dark finish.
- Creates two openings along the `entrance-wall` line:
  1. Between `back-wall` (X=0) and column left face (X=6.43m) – closed by entrance-wall partition except for the 1.5m entry gap at the `back-wall` end.
  2. Between column right face (X=6.73m) and `front-wall` (X=8.83m) – 2.4m wide, fully open. This is the exit/gift area.

---

## Partitions

All three partitions are the same material: plywood, matte near-black finish. Estimated thickness: 0.018m (18mm standard plywood). All are built on site for this installation – not existing structure. All run floor to working ceiling: Y=0 to Y=3.52m.

### 1. Entrance-wall partition

- Runs along Z=0 (the `entrance-wall` line).
- From X=1.5m to X=6.43m (column left face).
- Entry gap: X=0 to X=1.5m – open, no partition. Visitor entry point into the pathway.
- Exit/gift gap: X=6.73m to X=8.83m – open, no partition. Exit into gift area.

### 2. Pathway partition – vertical

- Runs parallel to the `back-wall`, inside the room.
- Position: X=1.5m, from Z=0 to Z=7.28m.
- Separates the vertical leg of the `pathway` from the `forest`.

### 3. Pathway partition – horizontal

- Runs parallel to the `window-wall`, inside the room.
- Position: Z=7.28m (1.5m from `window-wall`), from X=1.5m to X=6.43m.
- Separates the horizontal leg of the `pathway` from the `forest`.
- Does NOT extend to the `front-wall`. Ends at X=6.43m (below column), leaving a 2.4m opening for visitors to enter the `forest`.
- Forest entry opening: X=6.43m to X=8.83m at Z=7.28m.

---

## Zones

### `pathway`

- L-shaped zone, 1.5m wide throughout.
- Vertical leg: X=0 to X=1.5m, Z=0 to Z=8.78m (full depth, along `back-wall`).
- Horizontal leg: X=0 to X=6.43m, Z=7.28m to Z=8.78m (along `window-wall`).
- Visitor entry point: the 1.5m gap at X=0 to X=1.5m, Z=0.
- Not a physical enclosure. Information panels mounted on `back-wall` (X=0 face) and `window-wall` (Z=8.78m face) inside the pathway.
- Total walking length: ~8.78m (back-wall leg) + ~6.43m (window-wall leg) = ~15.2m.
- Estimated walk time: 5–7 minutes.

### `forest`

- Everything inside the exhibition area that is not the `pathway` or `exit/gift area`.
- Bounds:
  - X=1.5m to X=8.83m (vertical partition to `front-wall`).
  - Z=0 to Z=7.28m (entrance-wall partition to horizontal pathway partition).
- Forest dimensions: 7.33m wide (X) × 7.28m deep (Z).
- Contains: panel ceiling, firefly LED system, IR sensor array, luffa wall.
- In `fireflies-within-reach` also: branch system hanging below panels.

### Exit/gift area

- Position: X=6.43m to X=8.83m at Z=0, opening into the space beyond.
- Width: 2.4m (between column right face and `front-wall`).
- No partition – fully open.
- Used for gift sales and post-experience interaction after visitors exit the forest.

---

## Doors

### `back-wall` doors (X=0 face)

- D1: estimated Z=2.5m, width ~0.9m. Existing, not modified.
- D2: estimated Z=5.0m, width ~0.9m. Existing, not modified.
- Used for staff access and emergency egress during operation. Not part of visitor route.
- Flag: exact positions and widths not confirmed – estimates only.

### `window-wall` doors (Z=8.78m face)

- Door 1: near `back-wall` corner, estimated X=0.5m to X=1.4m (inside pathway zone). Width ~0.9m.
- Door 2: approximately mid-wall, estimated X=3.5m to X=4.4m. Width ~0.9m.
- Flag: exact positions and widths not confirmed – estimates only.

---

## Windows

### `window-wall` windows (Z=8.78m face)

- Window 1: estimated X=1.8m to X=2.8m (inside pathway zone). Width ~1.0m.
- Window 2: estimated X=4.8m to X=5.8m (inside forest zone). Width ~1.0m.
- All covered by dark blue theatrical blackout curtain during operation.
- Flag: exact positions and sizes not confirmed – estimates only.

---

## Theatrical curtain

- Dark blue theatrical fabric, floor to ceiling.
- Covers all windows on the `window-wall` (Z=8.78m face) during operation.
- Mounted as a hanging curtain on a track – not a fixed partition.
- In simulation: render as a dark blue fabric plane at Z=8.78m covering the window openings.

---

## Ceiling

- Flat plywood panels suspended across the `forest` zone only.
- Panel count: estimated 20–30 panels.
- Three size classes: 40×40cm, 65×65cm, 90×90cm. Mixed organically – not a grid.
- Height range: Y=2.2m to Y=3.2m from floor.
- Tilt: 0–15 degrees off horizontal, varied per panel.
- Suspension: two steel cables per panel from structural ceiling anchors at Y=3.52m.
- Material: matte near-black plywood.
- LED pinpoints: colour #00FF00 (pure green), distributed per panel face via seeded Poisson-disc placement.
- Visible suspension cables: thin, dark.

---

## Luffa wall

- Mounted flush against the `front-wall` (X=8.83m face), inside the `forest`.
- Vertical position (Z): TBD on install day.
- Height and width: TBD.
- Construction: timber frame, luffa panels, warm LED strip behind diffuser as backlight.
- Touch and sight element – not a photo zone.
- In simulation: render as a warm-lit rectangular panel flush against the `front-wall`.

---

## Branches (`fireflies-within-reach` only)

- Dried bamboo or locally sourced hardwood, rigged horizontally below the panel ceiling inside the `forest`.
- Estimated count: 15–25 branches.
- Height range: Y=2.0m to Y=2.8m from floor.
- Minimum clearance: Y=2.0m above all walkable areas.
- Rigging: steel cable or wire from ceiling anchors.
- LED method: adhesive LED pads or wire-wrapped clusters on branch surface, colour #00FF00.

---

## Visitor route (step by step)

One-way. No doubling back.

1. Enter through the 1.5m entry gap at X=0 to X=1.5m, Z=0 (`back-wall`/`entrance-wall` corner).
2. Walk in the positive Z direction along the `back-wall` through the vertical pathway leg, reading information panels on the `back-wall` face.
3. At Z=7.28m turn left (positive X direction) along the horizontal pathway leg, reading information panels on the `window-wall` face.
4. At X=6.43m, Z=7.28m pass through the opening into the `forest`.
5. Experience the forest: flicker → interactive → programmed movement.
6. Exit through the column/`front-wall` gap at X=6.43m to X=8.83m, Z=0 into the exit/gift area.

---

## Lighting options (summary)

All light sources hidden behind baffles or base rails – source never visible to visitor.

**Folded-sky A – sundown:** LED strips along all four forest walls. Entry warm amber, slow fade to deep blue-black across session.

**Folded-sky B – breath-paced:** LED strips along all four forest walls. Very dim warm amber, pulsing at ~4s in / ~6s out. Independent of firefly system.

**Within-reach A – horizon line:** Single LED strip along base of all four forest walls at Y=0.3–0.4m. Static warm white.

**Within-reach B – mountain ridge silhouette:** LED strips backlight cut MDF panels (matte black, Y=0 to Y=0.8m) on `back-wall` and `window-wall` faces inside forest only. Cool blue-grey, static.

---

## Simulation rules (hard)

- Canonical wall names only – no compass directions in code, comments, filenames, or commits.
- "Pathway" always – never "corridor."
- `entrance-wall` is not a solid wall – model only the three partition elements.
- Any geometry visible at full darkness (ambient 0.01) must use self-emissive materials. Non-emissive geometry is crushed black by ACES tone mapping.
- Firefly LED sphere radius: 0.025 for visual legibility (physically accurate 0.0015 is sub-pixel).
- All measurements in metres. Y=0 is floor level.
- No artist, designer, studio, or artwork names anywhere in code, comments, plans, filenames, or commits.
- Emergency egress: open item – do not model emergency signage.
