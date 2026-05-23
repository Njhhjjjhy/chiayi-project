# Slice 15: partition cabinet face with drawers

## Goal

The entrance-wall-partition currently renders as a flat block. Designer flagged it should look like a cabinet bank with drawers. The partition is conceptually a row of low cabinets forming the wall, not a blank surface.

## Step 0: discovery (read only)

1. Identify the component(s) that render the entrance-wall-partition. Report file paths.
2. Report current geometry (single mesh, composed boxes, other), material, dimensions.
3. Confirm partition footprint and height from `dimensions.js`.
4. Report findings. Stop. Wait for Step 1.

## Step 1: designer decisions (stop and flag)

Designer locks before any code changes:

**A. Drawer grid layout**:
- Rows (vertical drawer tiers): e.g. 2 or 3
- Columns (drawers per row across partition length): e.g. 5 or 6
- Designer confirms or provides own grid.

**B. Drawer face style**:
- b1: flat inset panels with thin border bevel (modern cabinetry)
- b2: shaker-style framed panels
- b3: flush flat faces with horizontal seam lines only

**C. Handle style**:
- c1: small recessed cup-pulls (horizontal grooves)
- c2: small protruding bar handles (cylinders or boxes)
- c3: no handles (push-to-open look)

**D. Material**:
- d1: plywood-ish warm wood tone (light)
- d2: dark stained wood (matches seating if those are dark)
- d3: matte painted (specify color)

Stop after Step 0. Wait for designer to lock A, B, C, D.

## Step 2: implement (after Step 1 locks)

Apply locked decisions. Keep partition footprint and overall dimensions unchanged. This is a face treatment, not a footprint change.

## Step 3: capture

1. Standard 4-preset capture script.
2. Add a close-range preset facing the partition from the forest side.
3. Save to `baselines/[timestamp]-slice15-after-*.png`.

## Step 4: verify

1. Partition reads as cabinet bank vs flat wall.
2. Drawer grid legible from forest-side approach.
3. Material matches locked decision.
4. No regressions on partition footprint, mounting, or adjacent elements.
