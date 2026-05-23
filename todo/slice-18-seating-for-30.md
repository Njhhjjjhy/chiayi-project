# Slice 18: seating for 30

## Status: BLOCKED

This slice cannot proceed until designer provides bench layout. Step 0 is gated on the locks below.

## Goal

Current seating geometry is 3 zone markers. Cannot seat 30 people. Replace with actual bench geometry sized for 30-person capacity.

## Designer decisions required (lock these to unblock)

**A. Number and size of benches**:
- a1: 6 benches × 1.8m each (5 people per bench)
- a2: 5 benches × 2.4m each (6 people per bench)
- a3: 10 benches × 1.2m each (3 people per bench, more clusters)
- a4: designer specifies own count + length

**B. Arrangement**:
- b1: linear rows (theatre-style facing `front-wall`)
- b2: clustered groups (small islands across the forest)
- b3: scatter (single benches at varied angles)
- b4: u-shape or arc facing `front-wall`
- b5: designer specifies

**C. Bench geometry**:
- Seat height (suggest 0.42m)
- Seat depth (suggest 0.35m)
- Backless or with backrest?
- Material (plywood matching the partition cabinet face, darker stain, other?)

**D. Spacing constraints**:
- Minimum aisle width for staff and visitor movement (suggest 0.9m)
- Minimum clearance from walls (suggest 0.5m)
- Minimum distance from `pathway` (suggest 0.5m)

Once designer locks A through D, the slice unblocks.

## Step 0: discovery (BLOCKED until designer locks above)

1. Read current `SeatingBoxes.jsx` and any seating-related constants. Report current state.
2. Survey forest floor for clearance per locked spacing constraints.
3. Report findings. Stop. Wait for Step 1.

## Step 1: implement (after Step 0)

Geometry + placement per locked decisions.

## Step 2: capture

Standard 4-preset capture script + a seating-area close preset.

## Step 3: verify

1. 30 seats accommodated.
2. Aisles and clearances respected.
3. Sightlines from entry and forest path read clear (no trip hazards in low light).
4. No regressions on partition, wayfinding, or other floor-level elements.
