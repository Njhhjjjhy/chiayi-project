# Slice 13: hanging panel spacing

## Goal

Increase the spread of the 40 hanging ceiling forms across the available envelope. Designer flagged that they currently cluster too tightly. Target: more open spacing between forms so the ceiling reads as scattered constellation rather than dense cluster.

## Step 0: discovery (read only)

1. Read `ceilingForms.js` in full. Report:
   - The placement algorithm (Poisson-disc / random / cluster-based).
   - All constants that affect form distribution (min-distance, cluster radius, envelope bounds, Y band, X/Z bounds).
   - Current values and where each is declared.
2. Read `dimensions.js` for any related ceiling constants.
3. Propose which constant(s) to bump and a target value for each. Use the reference image read of "scattered constellation" as the target feel.
4. Report findings. Stop. Wait for Step 1.

## Step 1: change (after designer go-ahead)

Designer locks the proposed constant bump from Step 0 before any code changes.

Constraints (do not change):

- 40 forms total.
- `CEILING_FORM_MAX_EDGE_X = 8.5` unchanged.
- Primitive distribution (flat / oblong / mixed weights) unchanged.
- RNG seed unchanged.

Apply locked bump. lint, build, dev. Stop. Wait for Step 2.

## Step 2: capture

1. Standard 4-preset capture script.
2. Run for all 3 ceiling variants (flat, oblong, mixed).
3. Save to `baselines/[timestamp]-slice13-after-*.png`.
4. Report file paths.

## Step 3: verify

1. Forms visibly more spread across the envelope vs slice 9 baseline.
2. Still 40 forms per variant, no clipping past `CEILING_FORM_MAX_EDGE_X`.
3. Mixed variant still hits exact 20/20 flat/oblong split.
4. No regressions on firefly behaviours, walls, or other ceiling elements.
