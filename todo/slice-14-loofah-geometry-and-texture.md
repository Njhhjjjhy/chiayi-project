# Slice 14: loofah geometry and texture

## Goal

Make the loofah wall actually look like loofah. Currently uses uniform ellipsoid scale per piece, reads as smooth blobs. Reference image (`design-reference-46.jpg`) shows vertical-stacked rectangular pieces with visible fibrous surface texture, warm light passing through. Replicate that read.

## Context

Sister slice to slice 12 (intensity drop). This slice handles geometry + texture. Intensity was already tuned. Big slice with real design decisions. Step 1 has explicit stop-and-flag for designer calls.

## Step 0: discovery (read only)

1. Read `LuffaWall.jsx` in full. Report:
   - Geometry primitive (sphere / ellipsoid / box / other).
   - Current per-piece transform (position, rotation, scale).
   - Piece count and layout algorithm.
   - Material setup including any maps (normal, roughness, alpha).
   - How pieces are mounted on the bamboo grid.
2. Read `dimensions.js` loofah section. Report all `LOOFAH_*` constants.
3. Survey codebase for existing texture / normal-map loading patterns. Do we load image files anywhere, or is everything procedural?
4. Report findings. Stop. Wait for Step 1.

## Step 1: designer decisions (stop and flag)

Designer locks ALL of the following before any code changes:

**A. Geometry shape**:
- a1: rounded box (e.g. `RoundedBoxGeometry` from drei, high `cornerRadius` for soft edges)
- a2: plain box (sharp corners)
- a3: extruded rounded profile (custom shape)

**B. Per-piece size variation range**:
- Width X (suggested 0.08m to 0.18m)
- Height Y (suggested 0.18m to 0.32m)
- Depth Z (suggested 0.04m to 0.08m)
- Designer confirms ranges or provides own.

**C. Surface texture approach**:
- c1: procedural noise normal map (generated in-shader or via DataTexture)
- c2: load a loofah surface texture file (designer provides asset)
- c3: pure geometry detail only (no normal map, rely on shape variation)

**D. Per-piece color variation**:
- d1: uniform `LOOFAH_BACKLIGHT_COLOR` for all pieces
- d2: small jitter range (designer specifies channel range)

Stop after Step 0. Wait for designer to lock A, B, C, D.

## Step 2: implement (after Step 1 locks)

Apply locked decisions. No bloom or intensity changes (those are slice 12 territory).

## Step 3: capture

1. Standard 4-preset capture script.
2. The close-range loofah preset from slice 12.
3. Save to `baselines/[timestamp]-slice14-after-*.png`.
4. Report file paths.

## Step 4: verify

1. Loofah pieces read as fibrous / rectangular vs current smooth-blob.
2. Vertical stacking pattern visible vs reference image.
3. Texture legibility at close range matches reference.
4. No regressions on intensity, halo (whatever survives at `1.0`), or other walls.
