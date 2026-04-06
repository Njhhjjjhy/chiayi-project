# Phase 1: space and architecture

Priority: highest.

## Room dimensions

Replace all placeholder or outdated dimensions with these confirmed specs:

| measurement | value |
|---|---|
| total ceiling height | 4.2 m |
| usable height after beams | 3.52 m |
| pillar to opposite wall | 5.82 m |
| entrance width | 240 cm |
| entrance height | 352 cm |
| approximate floor area | 10 m x 10 m (confirm exact from the architectural floor plan) |
| max comfortable capacity | 30 adults |

## Room layout

The exhibition occupies the right portion of the visitor service center (遊客服務中心). The left section is retail/merchandise.

Key landmarks and their positions (see annotated floor plans for exact locations):

- **Entrance:** left side of the exhibition zone, opening from the retail area. See `firefly-room-dimensions_entrance.webp` (green highlight).
- **Big wall:** runs horizontally along the top/north side, spanning the full width of the exhibition area. See `firefly-room-dimensions_big-wall.webp` (purple/magenta highlight).
- **Back windows:** far right/east wall. Must be blacked out completely for darkness. See `firefly-room-dimensions_back-windows.webp` (blue highlight).
- **Vent:** on the back wall, must be covered or concealed. See `exhibition-details_exhibition-sections.webp` (green text label).
- **Total exhibition area:** see `firefly-room-dimensions_total-exhibition-area.webp` (red outline).

## Existing constraints

- There are track lights already mounted on the ceiling. They cannot be removed. The dropped ceiling module system must sit below them or accommodate them.
- The room has structural columns and exposed beams that divide the ceiling into zones.
- The space is in a government-leased venue, so all installations must be modular and removable.

## Ceiling module system - two options side by side

The ceiling grid size is undecided. Present both options on the same page so they can be compared visually.

### Option A - small squares

- Grid unit: 60 cm x 60 cm.
- One module = 4 squares arranged 2x2 = 120 cm x 120 cm total.
- Each module: 18 LEDs (greenish tone), 1 infrared motion detector.
- Calculate and display: total modules that fit the ~10 x 10 m space, total LED count, total IR sensors.
- Show a grid layout diagram with module placement.
- Mark where modules cannot be placed due to beams or existing lights.

### Option B - large panels

- Grid unit: 120 cm x 120 cm (single panel per module).
- Each module: 18 LEDs (greenish tone), 1 infrared motion detector.
- Calculate and display: total modules that fit the ~10 x 10 m space, total LED count, total IR sensors.
- Show a grid layout diagram with module placement.
- Mark where modules cannot be placed due to beams or existing lights.

### For both options

- LEDs operate in sequences driven by an algorithm. At any moment some lights are on, some are off.
- Each module's infrared detector tracks visitor movement below.
- The algorithm logic is detailed in phase 3.
