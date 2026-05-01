# Fireflies — project brief

A condensed reference of the facts, dimensions, and concepts that the website pages used to carry. Preserved here after the marketing pages were removed in the May 2026 cleanup. The 3D preview and proposals viewer remain the only live tools in the project.

## What it is

Immersive firefly art exhibition at **Nanghia, Laiji Village, Alishan Township, Taiwan** — a community gathering place with an immersive gallery, cultural park, and bistro. Profits support the local Tsou indigenous community.

Visitors enter a darkened room where the ceiling and side walls come alive with hundreds of green LED "fireflies." Visitors carry infrared flashlights; pointing a flashlight at a ceiling module triggers a response. Real-world ecology becomes spatial experience.

## Collaborators

- **Riaan Burger** — tech and immersive design.
- **Corbett Wall** — organizer, Nanghia founder.

## Venue dimensions

- Total ceiling height: **4.2 m**
- Usable height after beams: **3.52 m**
- Pillar to opposite wall: **5.82 m**
- Entrance: **240 cm wide × 352 cm tall** (full-height, no transom)
- Floor area: **~10 m × ~10 m** (8.83 m × 10 m precisely)
- Max comfortable capacity: **30 adults**

The canonical numeric source is `src/geometry/dimensions.js` — change a number there and every mesh, label, and overlay updates.

## Visitor journey (three behavioral phases)

1. **Idle.** No visitors detected. Fireflies blink in a naturalistic pattern; not all LEDs are ever on simultaneously. Two registers explored: random scatter (independent timing per LED) and drift wave (slow activation moving across the ceiling).
2. **Motion.** Infrared sensor detects a body moving below. Two registers: ripple (increased activity follows the visitor) or startle (fireflies go dark, then cautiously return — mimicking real disturbance behavior).
3. **Flashlight interaction.** Visitor deliberately aims an IR flashlight at a module. Two registers: discovery reward (a burst rewards the visitor) or chain reaction (activation spreads outward from the flashlight point, creating interconnection across the ceiling).

## Big-wall treatment concepts (visual descriptions)

The back wall is the major surface. Six treatment proposals are tracked in the proposals viewer (`/proposals/:variantId`). Visual logic only — sources are not cited per the project's attribution policy ("the form carries the reference").

- **Living moss.** Wall-sized surface of living moss or lichen woven into wire mesh. The wall is alive; ecology made tangible; visitors smell forest. Local Alishan mountain moss preferred.
- **Layered mountain silhouette.** Multiple thin wood/foam-core panels cut into mountain ridge profiles, spaced 5–15 cm apart, LED rope lights behind each layer. Backlit silhouettes glow; warm-to-cool gradient back to front. Cost: under 50,000 TWD.
- **Reflective fracture.** Triangular and angular mirror fragments mounted across the wall. Multiplied reflections of every light source and every visitor. Reinforces "you are what you see" — visitors see themselves fragmented among the firefly lights.
- **Fiber veil.** Deep-pile (10–15 cm thick) wall of natural fibers with embedded micro-LEDs at varying depths. The wall appears to breathe; an intimate, close-looking counterpart to the ceiling.
- **Projection-reactive surface.** Matte white/light-fabric canvas wired to the same IR detection system. Visitor silhouettes appear surrounded by projected fireflies; movement makes the projected fireflies scatter and regroup.

## Bilingual marketing copy (long-form, EN)

Reusable as-is for any future external description:

> Step into a mountain room at dusk and watch it dissolve into darkness. Hundreds of firefly LEDs emerge above you, responding to your movement through infrared flashlights. An art + science + tech exhibition at Nanghia, Laiji Village, Alishan — where ecology becomes experience. Based on real Alishan firefly ecology (42 species, April–June season), the exhibition uses technology to reconnect visitors with nature. Located in Laiji Village, a growing destination near 德恩亞納 and the Alishan Forest Railway. A Nanghia social enterprise project — all profits support the local Tsou indigenous community.

## Cost categories tracked (open work)

- Ceiling modules — materials and fabrication
- LEDs — quantity × unit cost
- Infrared sensors — quantity × unit cost
- Infrared flashlights — quantity × unit cost
- Wall-treatment build (per chosen proposal)
- Floor + sound infrastructure
- Merchandise (post-launch)

Detailed numbers were never filled in; they belong in a future budget doc.

## Source provenance

The content above was extracted from the marketing pages (`HomePage`, `SpacePage`, `WallPage`, `ExperiencePage`, `MarketingPage`, `FloorPage`, `MerchandisePage`) before they were deleted in the cleanup pass. Anything not preserved here is recoverable from git history.
