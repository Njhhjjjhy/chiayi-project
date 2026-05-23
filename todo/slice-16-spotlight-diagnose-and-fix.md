# Slice 16: spotlight diagnose and fix

## Goal

Designer reports the spotlights are not visible at all. `SeatingSpotlights` exists in the codebase but doesn't appear in captures or live view. Find out why and fix.

## Step 0: discovery and diagnostic

1. Read `SeatingSpotlights.jsx` in full. Report:
   - What it actually renders (SpotLight component, mesh, helper, cone geometry, none?).
   - Intensity values, distance, angle, penumbra, decay.
   - Target positions.
   - Any timeline gating (expected to ramp off at `0.75` per prior context).
   - Whether the component is mounted in the scene graph. Find where it's imported and where it's rendered.
2. Report findings.
3. Run a diagnostic capture set:
   - Force timeline to `0.5` (twilight phase, spotlights should be at peak per code).
   - Capture 4 standard presets at this timeline.
   - Save as `baselines/[timestamp]-slice16-diagnose-*.png`.
4. Report what's visible vs what should be visible. Hypothesise the cause.
5. Stop. Wait for Step 1.

## Step 1: designer + Claude review

After Step 0, designer and Claude review the diagnostic captures. Hypotheses to test:

- Component not mounted → fix mount.
- Intensity too low → bump.
- SpotLight cone not visible because no volumetric / no fog interaction → add visible cone geometry, helper, or volumetric pass.
- Wrong target position / wrong direction → fix.
- Timeline gating cutting off at wrong time → adjust.
- Material `toneMapped` issue → set `toneMapped={false}` on emissive cone material if cone geometry is added.

Lock fix approach. Stop and flag if multiple plausible causes coexist.

## Step 2: apply fix

Apply locked fix only. lint, build, dev. Stop. Wait for Step 3.

## Step 3: capture

1. Standard 4-preset capture script.
2. Add captures at timeline = `0.5` and `0.8` to confirm spot visibility across the timeline arc.
3. Save to `baselines/[timestamp]-slice16-after-*.png`.

## Step 4: verify

1. Spotlights visibly present in captures at expected timeline positions.
2. Cones / pools / whatever the visible spotlight read is matches design intent.
3. No regressions on other lighting, ceiling, fireflies, or walls.
