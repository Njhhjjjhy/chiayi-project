# Additional firefly variants — canonical reference

## Status

Active. Four LED-placement variants that extend the original two proposals (folded-sky in doc 4, within-reach in doc 5). Same room, same visitor flow, same lighting framework. Only the LED carrier changes.

All four sit under `/fireflies/<variant-id>` on the live site, accessible via the variant picker. Final selection between the six variants (suspended-sky, within-reach, flock, grove, lanterns, nesting) is a designer call still pending.

## Shared invariants

Every variant carries the locked 1,760 green LED total. The visitor experience (pathway, forest, three-stage flow, seating, audio) is shared from doc 4 / doc 5. The loofah wall (doc 3) and wall lighting are independent of the LED variant.

Each LED placement is deterministic (seeded). Re-running the placement produces the same positions.

---

## Fireflies flock

### What it is

LEDs hang on suspended threads that drift across the forest like a flock of fireflies caught mid-flight. Hanger anchors live near the working ceiling; threads drop the LEDs to varying heights between the ceiling and head height.

### LED placement

- Count: 1,760, all on flock threads.
- Distribution: Poisson-disc in the forest XZ area with seating-zone exclusion. Threads drop from anchors near the ceiling.
- Emissive intensity: 3 (vs. the ceiling's 5). The lower brightness reads as a luminous suspended band at side distances of 3 to 6.5 m without forming oversized halos at close eye-level distances of 1 to 3 m.

### Locked values

- `FLOCK_LED_EMISSIVE_INTENSITY = 3` (locked after the step-1 emissive dial-down).

### Open designer locks

None outstanding.

---

## Fireflies grove

### What it is

LEDs cluster at the tips of floor-rooted stems standing in the forest. The stems read as tall grasses or thin reeds. Each stem carries a small volumetric cluster of LEDs at its top rather than a single point of light.

### LED placement

- Count: 1,760 (110 stems × 16 LEDs per stem).
- Distribution: Poisson-disc with minimum stem spacing, exclusion-aware against partition footprints, the concrete column, and seating zones.
- Stem tilt randomised within a small angle range so the grove reads as natural growth.
- LEDs spread laterally inside a 0.08 m radius cluster at the top of each stem.

### Locked values

- 110 stems, 16 LEDs per stem.
- `GROVE_LED_CLUSTER_RADIUS = 0.08 m` (locked after step-2 follow-up review).

### Open designer locks

None outstanding.

---

## Fireflies lanterns

### What it is

LEDs erupt above the caps of 15 opaque cream pillars standing in the forest. The pillars themselves do not glow. They are solid cream sculptural columns that read as a clear architectural presence against the loofah wall. The LEDs sit as a small volumetric cluster floating just above each pillar cap.

### LED placement

- Count: 1,760 (5 pillars × 118 LEDs + 10 pillars × 117 LEDs).
- Pillar heights: three tiers at 1.2 m, 1.8 m, and 2.4 m. 5 pillars per tier.
- Pillar diameter: 20 cm.
- Pillar material: opaque cream `#f5e6c8`. No transparency.
- LED cluster above each pillar cap: 0.12 m radius cylinder, 0.2 m vertical extent, uniform volume distribution.

### Locked values

- 15 pillars, three tier heights, opaque cream pillar bodies.
- `LANTERN_LED_CLUSTER_RADIUS = 0.12 m`, `LANTERN_LED_CLUSTER_HEIGHT = 0.2 m` (locked at option C selection).

### Open designer locks

None outstanding.

---

## Fireflies nesting (hybrid)

### What it is

LEDs are split between two carriers. Bolster sculptures sit on the forest floor with LEDs on their upper surfaces (264 LEDs total). The original sculptural ceiling carries the remaining 1,496 LEDs. The bolster is a soft elongated cushion form that visitors can sit beside or around. The hybrid distribution lets visitors see fireflies both at hand-reachable height and overhead.

### LED placement

- Bolster LEDs: 264 total, distributed across the runtime-resolved bolster count (typically 6 to 8 bolsters). Per-bolster count uses floor-plus-remainder so the sum is always 264 exactly.
- Bolster placement: seeded rejection-sample Poisson-disc on the upper hemisphere of each capsule. Minimum 0.06 m LED spacing.
- Ceiling LEDs: 1,496. An evenly-distributed subset of the original 1,760 ceiling positions.
- Subset selection: fractional-stride interleave. Slot `i` of the rendered subset maps to original ceiling index `floor(i × 1760 / 1496)` for `i ∈ [0, 1496)`. The remaining 264 positions sit in the cache but are not rendered when the hybrid variant is active.

### Locked values

- 1,760 total preserved (264 bolster + 1,496 ceiling).
- Interleave permutation baked at module load (no per-frame work).

### Open designer locks

None outstanding.

---

## Wall LEDs (shared across all variants)

When any firefly behaviour is active (Awakening, Flashlight, Drifting swarm, Pulse wave, Heartbeat), the side-wall and partition glow dots respond to the same spatial logic as the ceiling LEDs. Walls and ceiling read as one room of light points.

- Visual style: 8 mm cream-green emissive spheres on the upper half of every interior wall surface (`front-wall`, `back-wall`, both partition faces, both faces of each partition).
- Brightness scaler: walls always sit at 60% intensity below the ceiling LEDs so they read as ambient supporting cast.
- Coverage: all five firefly behaviours propagate to walls.
- Static fallback: when no firefly behaviour is active, walls render a uniform slow breathe driven by a shared time uniform.

## What changed from earlier passes

- `fireflies-arches` proposal was created, reviewed, and reverted in the same week. No longer a candidate.
- `fireflies-nesting` originally had ceiling-only LEDs. Converted to the hybrid distribution (264 bolster + 1,496 ceiling) so the bolster sculptures carry the closer-reach light.
- The lantern envelope went through three passes (translucent 0.7, translucent 0.85, opaque cream) before settling on opaque cream plus LED-cluster-above-cap (option C).
- Wall dots previously only ran a uniform breathe when a firefly variant was on. They now respond to the active behaviour.

## Stop-and-flag — do not infer defaults

1. Final variant selection between the six is a designer call still pending.
2. LED placement constants (counts, spacings, intensities) reflect the locked state at time of writing. Verify against `src/geometry/dimensions.js` before quoting.
3. Firefly behaviour wall scaler (60%) is locked at `WALL_DOT_BEHAVIOUR_DIM = 0.6`. Adjusting affects every behaviour.
