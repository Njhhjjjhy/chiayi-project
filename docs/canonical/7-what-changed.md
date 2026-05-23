# What changed — meeting and decision log

## Status

Authoritative record of changes from the pre-meeting canonical state to the current canonical state. Anchored on the 21 May 2026 meeting between Riaan Burger and Corbett Wall. Mid-cycle changes since that meeting are appended at the bottom.

## Changes summary (from 21 May 2026 meeting)

| # | Category | Before | After | Status |
|---|----------|--------|-------|--------|
| 1 | Ceiling form | Flat plywood panels, 14×14 grid, fold geometry | Sculptural suspended forms, varied heights, paper mache / plywood / hybrid | LOCKED direction. Form TBD. |
| 2 | LED count | 882 (14×14 grid derived) | 1,760 (110 modules × 16 LEDs) | LOCKED count. Distribution TBD. |
| 3 | `front-wall` | Sundown wall lighting concept (yellow → purple) OR breath-paced warm pulse | Loofah wall, bamboo armature, hidden warm light | LOCKED. Dimensions TBD. |
| 4 | Partitions | Thin plywood movable walls, ~18mm | Cabinet structures, 0.5m thickness, internal storage | LOCKED. `CABINET_T` = 0.5 in `dimensions.js`. |
| 5 | Floor | Unspecified / shoes off / foam mat / fake grass | Polished grey marble (existing), shoes ON throughout | SUPERSEDED — see entry 14 below. |
| 6 | Capacity | Unspecified | Max 30, min 5, cozy 20 | LOCKED. |
| 7 | Curtain | Theatrical blackout curtain | Same + MUST be fire-resistant or fire-resistant treated | LOCKED. |
| 8 | Spray bottles | Open item for multiple sessions | DROPPED from scope | LOCKED. |
| 9 | Mist/fog | Out of scope | Idea under consideration | UNDER CONSIDERATION. |
| 10 | Pathway floor lighting | Not specified | LED strip along floor edges | LOCKED. |
| 11 | Seating | Unspecified | Plywood storage box stools, 50–60cm, cushioned, internal storage | LOCKED. Count and placement TBD. |
| 12 | Pathway facts | Not specified | 4–5 firefly facts, painted stick-on letters along pathway walls | LOCKED. Content TBD. |
| 13 | Track lighting in pathway | Not specified | Under consideration | UNDER CONSIDERATION. |

## Post-meeting changes

| # | Category | Before | After | Status |
|---|----------|--------|-------|--------|
| 14 | Floor (replaces entry 5) | Polished grey marble, reflective, "doubles the firefly canopy" | Interlocking foam mat tiles, dark, textured, matte, no reflectivity | LOCKED 23 May 2026. Shoes-on policy preserved. |

## Sundown progression status

The yellow → purple sundown colour progression was tied to wall lighting that no longer exists (replaced by loofah wall on `front-wall` + dark surfaces elsewhere). The IDEA is kept as a possibility for:

- Ceiling lighting (over duration of session).
- Synchrony stage timing.

Decision deferred. NOT locked to either implementation.

## Mountain-ridge silhouette status

The mountain-ridge silhouette concept (within-reach proposal v3/v4) is PARKED. May inform loofah wall composition. Not in active build.

## Horizon-line strip status

DROPPED. Replaced by loofah wall warm element + pathway floor edge strips covering the warm-glow role.

## Folded-sky name

NAME REQUIRES REPLACEMENT. The original name referenced fold geometry that no longer exists in the design. Rename pending — Riaan decision.

## Items waiting on others

- Carpenter visit (week of 25 May 2026): partition design, ceiling support method, structural load.
- Paper mache prototyping weekend (scheduled): lock ceiling form direction.
- IR sensor prototype (Riaan to set up): validate the local-wake radius and beam-position resolution. BLOCKING for build commitment.
- Loofah sourcing: ongoing, keep receipts.
- Electrician assessment: total power draw, venue capacity.
- Venue emergency egress requirements check.
- Foam mat sourcing: tile size, exact colour, supplier. Confirm with physical sample.

## Items moved out of "open" to "locked"

- Floor material (foam mat, locked 23 May 2026).
- Shoes-on policy.
- Capacity numbers.
- Partition type (cabinet, 0.5m thickness).
- Fire-resistant curtain requirement.
- Spray bottles (locked OUT of scope).
- Ceiling direction (sculptural).
- LED count (1,760).
- Front-wall element (loofah wall).

## Confirmation note for Corbett

The above is what was decided. The 23 May floor change (marble → foam mat) is a post-meeting decision. If anything in this list does NOT match Corbett's understanding, flag immediately. Misalignment between Riaan and Corbett's records compounds quickly.

## Simulation impact of the floor change

- `Floor.jsx` material must change from solid colour to a foam-mat surface treatment: matte, dark, visible interlocking tile seams, surface texture.
- Reflectivity removed. Any "marble doubles the canopy" assumption in sim or render decisions is invalid.
- Slice 3 in the current sim plan handles this change.
