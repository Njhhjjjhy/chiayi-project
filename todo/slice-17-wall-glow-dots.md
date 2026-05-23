# Slice 17: wall glow dots

## Goal

Add a new ambient layer of small glowing LED-like dots embedded into wall surfaces. Designer description: "little lights INTO the walls like glowing dots." Separate from the ceiling firefly system. These are ambient, always-on, static or slow-pulse glow points.

## Context

Pattern reuse: ceiling LEDs already use `InstancedMesh` + `SHARED_LED_MATERIAL`. Wall dots use the same pattern but on wall surfaces with possibly different color / intensity / behaviour. Distinct from firefly behaviour system. These don't wake or pulse with firefly modes.

## Step 0: discovery (read only)

1. Identify all wall components and their interior surface geometry. Report file paths and dimensions for:
   - `front-wall`
   - `back-wall`
   - `window-wall`
   - `entrance-wall` (including the partition section)
   - Loofah wall (clarify whether this is a treatment on `front-wall` or its own component).
2. Confirm wall mounting faces (which face is the interior surface, where dots should sit slightly recessed or flush).
3. Report findings. Stop. Wait for Step 1.

## Step 1: designer decisions (stop and flag)

Designer locks before any code changes:

**A. Which walls get glow dots**:
- a1: all four interior walls (front, back, window, entrance)
- a2: `front-wall` only
- a3: `front-wall` + `back-wall`
- a4: all walls except the loofah wall (loofah already has its own light system)
- a5: designer specifies subset

**B. Density**:
- b1: sparse (e.g. 10 dots per m²)
- b2: medium (e.g. 25 per m²)
- b3: dense (e.g. 50 per m²)
- b4: designer specifies count or m² rate

**C. Distribution pattern**:
- c1: Poisson-disc (organic, no clumping, no grid)
- c2: pure random
- c3: gradient density (denser top, sparser bottom, or vice versa)
- c4: designer specifies

**D. Vertical band on each wall**:
- d1: full wall height
- d2: top half only
- d3: top third only
- d4: designer specifies range

**E. Material, color, intensity**:
- e1: reuse `SHARED_LED_MATERIAL` (same green as ceiling LEDs)
- e2: new material with custom color (warm white / amber / blue / other, designer specifies)
- e3: intensity value (suggest `2.0` to `4.0`)

**F. Behaviour**:
- f1: fully static (always on at locked intensity)
- f2: slow pulse (each dot has individual breathing, period roughly 10s)
- f3: rare random twinkle (per-dot on/off events, low rate)

Stop after Step 0. Wait for designer to lock A through F.

## Step 2: implement (after Step 1 locks)

1. Create `WallGlowDots.jsx` component using the `InstancedMesh` pattern from `CeilingLEDs.jsx`.
2. Add constants to `dimensions.js`: `WALL_DOT_*` family.
3. Generate positions per locked distribution method, per locked wall set, per locked band.
4. Mount component in `Room.jsx`.
5. lint, build, dev.

## Step 3: capture

1. Standard 4-preset capture script.
2. Add a wall-close preset (camera 1.5m from a glow-dotted wall).
3. Save to `baselines/[timestamp]-slice17-after-*.png`.

## Step 4: verify

1. Dots visible on locked walls per locked density.
2. Distribution reads as locked pattern.
3. Color and intensity match locked decision.
4. Behaviour (static / pulse / twinkle) matches locked decision.
5. No regression on ceiling fireflies, loofah wall, or other lighting.

## Notes

These are NOT firefly behaviour targets. The ceiling LED grid remains the firefly anchor surface. Wall dots are ambient layer only.
