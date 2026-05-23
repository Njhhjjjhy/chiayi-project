# Experience directions — canonical reference

## Status

Three narrative directions for the overall exhibition. Independent of the two design proposals (`folded-sky` and `within-reach`). Any direction CAN pair with any proposal.

These define the narrative arc and interaction model. They MAY influence implementation choices (sensor logic, LED behaviour algorithms, audio bed) but are reference material, NOT build specs themselves.

## Shared baseline

All three directions assume:

- Room composition per doc 1 (room spec).
- Ceiling per doc 2.
- Loofah wall per doc 3.
- Shoes on, marble floor, cabinet partitions.

## Direction A — `the-room-remembers`

### Tag

A living archive. Every visitor leaves traces. Every visitor finds the traces of those who came before.

### Mechanic

| Element | Behaviour |
|---|---|
| Flashlight | Charges surfaces it points at |
| Charged surfaces | Glow (handprints, sweeps, outlines) for an extended period — at least one visitor session |
| Firefly + charged surface | Fireflies passing near charged surfaces leave brighter, longer-lasting traces |
| Visitor + firefly | Visitor flashlight pointed at a passing firefly amplifies the trace it leaves |

### Stage flow

| Stage | State |
|---|---|
| `flicker` | Room enters already glowing from prior groups' charged surfaces |
| `interactive` | Visitor charges surfaces actively. Builds the next group's room |
| `programmed-movement` | Synchrony peak with accumulated glow at maximum |

### Narrative beat at exit

Visitor walks out knowing they have changed the room for the next group.

### Implementation implications

- Persistent state per session, possibly per night.
- Surface-tracking system (which surfaces are charged, decay rate).
- Decay timing balanced against session frequency.

## Direction B — `i-called-one`

### Tag

The flashlight is a way of calling fireflies. Effort brings them closer.

### Mechanic

| Element | Behaviour |
|---|---|
| Aim flashlight at target | Target glows after 5-second hold |
| Wait | Firefly moves to that exact spot and stays |
| Target = low floor | Fireflies descend to ankle height |
| Sitting on box | Ceiling shifts into pattern of synchrony overhead |

### Stage flow

| Stage | State |
|---|---|
| `flicker` | Room mostly dark, few fireflies present |
| `interactive` | Visitor population grows the firefly count through summoning |
| `programmed-movement` | Summoned population enters synchrony together |

### Narrative beat at exit

Visitor walks out knowing they prepared the place and the fireflies came because of their effort.

### Implementation implications

- Per-visitor summoning state.
- Threshold timing (5 seconds = called).
- Target-specific response patterns (floor summons low, ceiling summons overhead).
- Sitting detection (overhead pattern shift).

## Direction C — `forest-doesnt-need-you`

### Tag

The forest is a working ecology. You are a witness, NOT a participant.

### Mechanic

| Element | Behaviour |
|---|---|
| Fireflies | Operate on their own slow rhythm |
| Flashlight at firefly | Firefly scatters (real-animal behaviour, light disturbs them) |
| Flashlight at surfaces | Reveals hidden marks on loofah, silhouette on `front-wall` visible only at deep night |
| Once per session | Full ceiling synchrony flash, all painted surfaces light up for 30 seconds. NOT visitor-triggered |

### Stage flow

| Stage | State |
|---|---|
| `flicker` | Room alive on entry, breathing wall rhythm visible |
| `interactive` | Visitor exploration, finding hidden marks |
| `programmed-movement` | Non-visitor-triggered ceiling synchrony event |

### Narrative beat at exit

Visitor walks out knowing the forest continues without them. They were a witness, not a cause.

### Implementation implications

- Scatter-on-flashlight behaviour for fireflies.
- Hidden marks on loofah surface (NO UV. Hidden by ambient changes only).
- Silhouette on `front-wall` — emerges at low ambient threshold.
- Scheduled (not triggered) synchrony event per session.
- Wall breath rhythm (slow brighten/dim cycle).

## What is locked

- Three distinct directions: A, B, C.
- Each direction's core mechanic and narrative beat.
- All three share the same physical room.

## Stop-and-flag — do NOT infer defaults

1. Which direction is committed for build (Riaan + Corbett decision).
2. Specific timing values (charge decay, summon threshold, scatter radius).
3. Specific firefly count per stage in each direction.
4. Hidden mark content and location (direction C).
5. Silhouette content and rendering method (direction C).
6. Whether direction can be switched per session or is fixed per installation run.

## Selection summary

| Direction | What it is about |
|---|---|
| A `the-room-remembers` | What is left behind |
| B `i-called-one` | What you make happen |
| C `forest-doesnt-need-you` | What happens without you |
