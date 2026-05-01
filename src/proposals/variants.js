import Null from '../components/proposals/variants/Null.jsx'

// Canonical registry of the six proposal variants for the back-wall
// treatment review.
//
//   id                — URL slug and lookup key.
//   label             — human-readable name, shown in the chip bar and
//                       hover info panel (built in chunk 1b).
//   emotionalRegister — one-line distinct register per spec. These are
//                       non-negotiable as distinct: if any two collapse
//                       in sim the set has failed and must be reworked.
//   component         — React component rendering the treatment on the
//                       back wall. `null` means "not yet built" — the
//                       page falls back to the Null variant so the
//                       route is never broken.
//   hazeCadence       — per-variant haze cadence key, read by HazePass
//                       (wired in chunk 1c).
//   orientation       — panel orientation default; individual variants
//                       may override per-panel.
//   notes             — freeform, surfaced in the hover info panel.

export const proposalVariants = [
  {
    id: 'null',
    label: 'Null',
    emotionalRegister: 'quiet baseline; the room as-built',
    component: Null,
    hazeCadence: 'baseline-low',
    orientation: 'landscape',
    notes: 'Calibration anchor. No treatment, no big-wall fireflies.',
  },
  {
    id: 'moss',
    label: 'Living moss',
    emotionalRegister: 'intimate bodily tissue; hushed, close, alive',
    component: null,
    hazeCadence: 'near-zero',
    orientation: 'landscape',
    notes: 'Phase 2. Not yet built.',
  },
  {
    id: 'silhouette',
    label: 'Layered mountain silhouette',
    emotionalRegister: 'receding distance; a window onto landscape',
    component: null,
    hazeCadence: 'gentle-drift',
    orientation: 'landscape',
    notes: 'Phase 2. Not yet built. Variant may override orientation per layer.',
  },
  {
    id: 'fracture',
    label: 'Reflective fracture',
    emotionalRegister: 'shattered sky; a constellation made of the wall itself',
    component: null,
    hazeCadence: 'minimal',
    orientation: 'landscape',
    notes: 'Phase 3. Not yet built.',
  },
  {
    id: 'fiberVeil',
    label: 'Fiber veil',
    emotionalRegister: 'stilled star field; cold precision against living warmth',
    component: null,
    hazeCadence: 'gentle',
    orientation: 'landscape',
    notes: 'Phase 3. Not yet built.',
  },
  {
    id: 'projection',
    label: 'Projection-reactive',
    emotionalRegister: 'weather moving through the room; atmosphere as drawing',
    component: null,
    hazeCadence: 'high',
    orientation: 'landscape',
    // Panel-paradigm exception: this variant uses a projector, not a
    // panel treatment. Must be flagged wherever it is surfaced.
    notes: 'Phase 4. Not yet built. Panel-paradigm exception — uses a projector, not a panel treatment.',
  },
]

export const proposalVariantsById = Object.fromEntries(
  proposalVariants.map((v) => [v.id, v]),
)
