# Open items – canonical reference

## Status

All unresolved items in the project, in priority order. Each item lists what it blocks, what it is waiting on, and whether it can move now.

## Tier 1 – blocking, must resolve before further build commitment

### `IR-sensor-prototype`

| Property | Value |
|---|---|
| Blocks | Interactive stage of BOTH proposals. Without IR, the room reduces to flicker + programmed-movement, no visitor agency |
| Status | NEVER prototyped. Largest unknown in the project |
| Required test | 1 LED cluster + 1 IR sensor + 1 flashlight in a dim test space |
| Validates | Local-wake radius (assumed 2–3m, untested). Sensor's ability to resolve beam position at required geometries |
| Waiting on | Riaan to set up and run the prototype |
| Move now? | **YES** |

### `carpenter-visit`

| Property | Value |
|---|---|
| Blocks | Partition spec, ceiling support method, structural load confirmation, branch rigging (within-reach) |
| Scheduled | Week of 25 May 2026 |
| Move now? | No – waiting on scheduled visit |

### `paper-mache-prototyping-weekend`

| Property | Value |
|---|---|
| Blocks | Ceiling material choice, ceiling form direction |
| Outcome | Material samples + form feasibility |
| Waiting on | Weekend to be scheduled and run |
| Move now? | Schedule it |

## Tier 2 – waits on Tier 1

### `ceiling-form-specifics`

| Property | Value |
|---|---|
| Items | Exact form, count, height variation, support method |
| Blocks | LED distribution algorithm, simulation ceiling geometry rebuild |
| Waiting on | Paper mache weekend + carpenter visit |

### `led-distribution-1760`

| Property | Value |
|---|---|
| Item | How the 1,760 LEDs distribute across ceiling forms (and branches, for within-reach) |
| Blocks | Simulation LED placement |
| Waiting on | Ceiling form locked |

### `branch-led-power-method`

| Property | Value |
|---|---|
| Options | Wired vs battery |
| Blocks | Branch preparation, ceiling cable routing requirement |
| Waiting on | Riaan decision |
| Move now? | **YES** |

### `branch-sourcing`

| Property | Value |
|---|---|
| Material | Bamboo (likely) or locally available hardwood. Lead time required |
| Waiting on | Build date confirmation |

### `branch-rigging`

| Property | Value |
|---|---|
| Options | Anchor points OR rail system |
| Waiting on | Carpenter visit (ceiling support method first) |

## Tier 3 – operational, can run in parallel

### `power-distribution`

| Property | Value |
|---|---|
| Load sources | 110 firefly modules, audio, IR sensors, flashlight charging, loofah lighting, overhead spotlights, pathway edge LEDs, optional mist/fog |
| Need | Electrician assessment against venue electrical capacity |
| Waiting on | Someone to call an electrician |
| Move now? | **YES** |

### `audio-system`

| Property | Value |
|---|---|
| Estimated | 4 speakers, amplifier, looped ambience, thunder cue |
| Spatial model | Cluster sources (aggregate, NOT per-firefly) |
| Sync | Thunder cue scheduled on audio clock for visual sync |
| Waiting on | Ceiling rigging locked + speaker placement decision |

### `emergency-egress`

| Property | Value |
|---|---|
| Items | Venue safety code check. Emergency lighting. Exit signage inside forest. Maximum occupancy vs local codes |
| Waiting on | Someone to check venue requirements |
| Move now? | **YES** |

### `staff-and-session-operations`

| Property | Value |
|---|---|
| Items | Staff count, positions, briefing protocol, session reset (2–3 min between groups, automatic vs manual) |
| Waiting on | Riaan/Corbett decision |
| Move now? | **YES** |

### `sunset-colour-curve`

| Property | Value |
|---|---|
| Items | Exact start hue, end hue, intermediate stops, duration of `sundown` mode |
| Currently | Driven by `WallLighting.jsx` with default values |
| Waiting on | Riaan/Corbett decision on specifics |
| Move now? | **YES** |

### `horizon-line-spec`

| Property | Value |
|---|---|
| Items | Exact colour, intensity, Y-height of strips along walls |
| Currently | Driven by `WallLighting.jsx` with default values |
| Waiting on | Riaan/Corbett decision |
| Move now? | **YES** |

### `mist-or-fog`

| Property | Value |
|---|---|
| Status | Under consideration |
| Decision | In or out |
| Waiting on | Riaan/Corbett decision |
| Move now? | **YES** |

### `track-lighting-pathway`

| Property | Value |
|---|---|
| Items | Spotlights for pathway facts panels. Operational lighting |
| Waiting on | Install-day decision |

### `loofah-wall-dimensions`

| Property | Value |
|---|---|
| Items | Height, width, vertical Z position, corner extensions |
| Waiting on | Install-day decisions |

### `loofah-sourcing`

| Property | Value |
|---|---|
| Status | Ongoing |
| Action | Keep receipts |
| Move now? | Already moving |

### `folded-sky-rename`

| Property | Value |
|---|---|
| Status | Name no longer matches design |
| Codebase id | Already `fireflies-suspended-sky` |
| Waiting on | Riaan to confirm replacement |
| Move now? | **YES** |

### `direction-commit`

| Property | Value |
|---|---|
| Items | Which of A (`the-room-remembers`), B (`i-called-one`), C (`forest-doesnt-need-you`) is committed |
| Blocks | Significant implementation work (each direction has different sensor logic, surface tracking, scatter behaviour) |
| Waiting on | Riaan/Corbett decision |
| Move now? | **YES** |

### `window-wall-positions`

| Property | Value |
|---|---|
| Items | Door and window exact positions on `back-wall` and `window-wall`. ESTIMATEs only |
| Waiting on | Measurement |
| Move now? | **YES** |

### `column-footprint`

| Property | Value |
|---|---|
| Items | Estimated 0.3 × 0.3. Unconfirmed |
| Waiting on | Measurement |
| Move now? | **YES** |

### `door-cutouts`

| Property | Value |
|---|---|
| Items | `D1`, `D2`, and window-wall fixtures currently rendered as overlay planes, NOT real cutouts |
| Status | Known divergence flagged in discovery report |
| Move now? | Not part of new direction. Defer |

### Seating-final-count-and-mix

- All 30 visitors must be seated (per capacity spec).
- 6 stools currently in sim is placeholder only.
- Final mix likely a combination of plywood box stools (per current spec)
  and benches with internal storage (per meeting notes line 161).
- Waiting on: carpenter conversation about what fits and what's buildable.
- Can move when carpenter visit happens (week of 25 May 2026).

### Ceiling-form-direction

- 40 sculptural forms currently in sim is placeholder only.
- Final form vocabulary (shape, count, size range, material) determined by
  paper mache prototyping weekend results.
- Waiting on: paper mache weekend to be scheduled and run.
- Can move when weekend results land.

### Ceiling-pathway-extension

- Sim default: forms only in `forest`, not `pathway`.
- Open question: does the sculptural ceiling continue over the `pathway`,
  or stop at the partition line?
- Waiting on: Riaan + Corbett decision.
- Move now? **YES**

### Ceiling-cluster-placement

- 3 cluster centres currently bias toward forest centre and seating
  zones (off-axis), with min 1.8 m clearance from loofah wall plane.
- Real install distribution depends on fabricated form vocabulary and
  carpenter's rigging capacity.
- Waiting on: carpenter visit + paper mache weekend.
- Can move when both land.

## Move-now list (priority order for action)

Items that can move NOW with no external blocker:

1. `IR-sensor-prototype` (highest priority – blocks the largest unknown).
2. `direction-commit` (A/B/C).
3. `branch-led-power-method` (wired/battery).
4. `folded-sky-rename`.
5. `paper-mache-prototyping-weekend` (schedule it).
6. `power-distribution` (electrician call).
7. `emergency-egress` (venue requirements).
8. `mist-or-fog` (in/out).
9. `sunset-colour-curve` and `horizon-line-spec` (decisions).
10. `staff-and-session-operations`.
11. `window-wall-positions` and `column-footprint` (measurements).
12. `ceiling-pathway-extension` (does the sculptural ceiling continue over the `pathway`?).

## After-life and dismantling

### Installation duration

TBD -- flag for designer input.

### Dismantling responsibility

TBD -- flag for designer input.

### Material disposal and reuse

TBD -- flag for designer input.

### Documentation and archival

TBD -- flag for designer input.

### Salvage decisions

TBD -- flag for designer input.
