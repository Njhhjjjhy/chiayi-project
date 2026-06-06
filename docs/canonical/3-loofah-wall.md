# Loofah wall – canonical reference

## Status

Canonical. Set in the 21 May 2026 meeting. Replaces the prior sundown / breath-paced front-wall lighting concept as a wall *feature*. The wall *lighting modes* (`sundown`, `horizon-line`) remain in their respective proposals – see docs 4 and 5.

## Placement

- Mounted flush against `front-wall` (X=8.83 face), inside `forest` zone.
- Render flush BUT nudged 5–10mm inward to avoid being buried inside the wall surface. (Surface-flush geometry rule in doc 1.)

## Construction

| Element | Spec |
|---|---|
| Armature | Bamboo sticks |
| Surface | Loofah pieces attached to bamboo |
| Adhesion | Loofah fibres compress and stick together naturally. NO complex fasteners required |
| Lighting | Hidden INSIDE the bamboo armature |
| Light visibility | Light source MUST NEVER be visible to visitor |
| Light colour | Warm, glowing through the loofah from behind |

## Role in the room

- The ONLY warm element in the otherwise cool, dark forest (alongside the wall lighting mode).
- Touch + sight element. Visitors can feel the texture.
- NOT a photo zone. Phones remain in `pathway` only.

## Extended placement (optional)

Loofah MAY also appear as corner sculptural elements to soften the room's square geometry. Treat as optional layer, NOT core spec.

## Sourcing

- Local markets in Taiwan. Easy. Cheap.
- Sourcing ongoing. Keep receipts.

## Visual reference

Build prompts for the loofah wall MUST instruct Claude Code to research images of:

- Raw loofah / luffa fibre texture under warm directional lighting.
- Bamboo armature construction (vertical framing, attachment methods).
- Backlit organic-fibre wall installations.

Do NOT name any specific installations or artists.

The visual reference image at codebase root (`meeting-refrence-3.webp`) does NOT cover loofah specifically – it covers ceiling direction. Loofah needs separate research.

## What is locked

- `front-wall` placement (X=8.83 face, inside forest).
- Bamboo armature + loofah construction method.
- Hidden warm lighting from behind the loofah surface.
- Touch + sight (NOT a photo zone).
- Replaces prior sundown wall *feature* concept (the *lighting modes* are separate, see docs 4 and 5).

## Stop-and-flag – do NOT infer defaults

1. Exact height of the loofah wall.
2. Exact width of the loofah wall.
3. Vertical Z position along the `front-wall` (where it starts and ends).
4. Specific warm light colour (hex value).
5. Specific warm light intensity.
6. Whether corner loofah extensions are included.
7. If corner extensions included: which corners, what dimensions.

All install-day decisions.

## Simulation rendering (placeholder, until install-day values known)

- Render as a warm-lit rectangular panel flush against `front-wall` at X=8.83, nudged 5–10mm inward.
- Placeholder dimensions: TBD via build prompt parameter, NOT hardcoded.
- Material: self-emissive warm tone (specific hex TBD via build prompt parameter).
- Bloom-eligible if intensity warrants.
- Do NOT add texture maps for loofah surface until reference photos confirm appearance.
