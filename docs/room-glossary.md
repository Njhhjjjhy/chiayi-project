# Room glossary

Source of truth for what every room element is called. When Corbett writes a QA note in informal language, this is the file Claude reads to translate his words into the actual element in code.

If a name changes here, update `src/components/QAPanel/locations.js` (the dropdown options) to match.

---

## The four walls

| Canonical name | Aliases / how Corbett might describe it | Code reference |
| --- | --- | --- |
| **Entrance wall** | "the wall with the visitor entrance", "the wall you walk in through", "left side wall" (when facing back wall), "west wall" | `INSIDE.entrance` (x = -HW = -4.415) |
| **Window wall** | "the wall with the big windows", "the wall with the silver door", "the wall with the HVAC", "right side wall" (when facing back wall), "east wall" | `INSIDE.window` (x = +HW = +4.415) |
| **Front wall** | "the wall opposite the back wall", "the wall facing visitors when they enter", "north wall" | `INSIDE.front` (z = -HD = -5) |
| **Back wall** | "the wall with the two staff doors", "the back wall", "south wall" | `INSIDE.back` (z = +HD = +5) |

Fireflies (LEDs behind fabric) are on **ceiling + entrance wall + window wall** only. Front and back walls do NOT have fireflies. (See `src/components/fireflies/surfacePositions.js`.)

## Ceiling and floor

- **Ceiling** — the structural ceiling at 3.52 m. The `dropped ceiling` sits at 3.4 m — that's the lower fabric layer where the LEDs hang from.
- **Floor** — covered floor (venue is treated as a black box, see CLAUDE.md venue approach memory).

## Doors

- **Visitor entrance** — full-height (3.52 m) opening on the entrance wall. The single way visitors enter.
- **D1 / first staff door** — back wall, closer to the window-wall corner. 96 × 236 cm.
- **D2 / second staff door** — back wall, closer to the entrance-wall corner. 90 × 236 cm.
- **Silver service door** / **steel door** — window wall, between the small window and the main glass. 99 × 207 cm. Likely how Corbett refers to "that metal door".

## Window-wall fixtures

- **Main glass partition** — the big 5.7 m wide × 2.01 m tall window stretch, sill at 32 cm, top at 233 cm.
- **Small window** — the 59 × 178 cm window in the stepped notch near the front-wall corner.
- **HVAC plenum** — the L-shaped boxy thing in the upper corner, above the silver door. Made of a main box (1.8 m wide, 1.35 m along wall, 0.7 m tall) plus a smaller drop. Corbett may call it "the AC box", "the air con", "that big thing in the corner".

## Wainscoting

Dark wood band at the bottom of three walls — heights vary. Entrance wall has none.
- Front wall: 90 cm
- Back wall: 90 cm
- Window wall: 30 cm
- Entrance wall: 0 (no wainscoting)

## Visitor flow elements

- **Corridor / corridor partitions / entry pathway** — the narrow walking corridor that wraps around three walls (front, window, back). Visitors enter through the entrance wall, walk around the perimeter, and exit. Width 1.35 m. Component: `EntryPathway.jsx`.
- **Theatrical curtain** — the fabric curtain layer (the inner fabric that fireflies sit behind). Component: `TheatricalCurtain.jsx`.

## Wall coverings

The decorative fabric / lattice / panel layer on top of the structural walls. Currently includes a **bamboo lattice** variant. Corbett may call this "the panels", "the fabric layer", "the screens".

## Fireflies

The LEDs behind the fabric. Distributed in 60 × 60 cm squares on the ceiling, entrance wall, and window wall. Various behavior modes: blinking, motion (drift), interaction (visitor-triggered), the wave (synchronized).

---

## Translation cheatsheet

If Corbett writes... | He probably means...
--- | ---
"the partitions that close the open section next to the entrance" | the corridor partitions on the entrance side (the EntryPathway segment)
"the wall where you come in" | entrance wall
"the wall with all the windows" | window wall
"the wall with the two doors" | back wall
"that AC unit" / "the air con box" | HVAC plenum
"the metal door" / "service door" | silver service door (window wall)
"the staff doors" | D1 and D2 (back wall)
"the panels" / "the screens" / "the fabric layer" | wall coverings (bamboo lattice etc.)
"the LEDs" / "the lights" | fireflies (LEDs behind fabric)
"the wood at the bottom" | wainscoting
