// Lighting experience proposals for the firefly room. Each one parks the
// timeline at a different point in the darkness phase and sets a default
// firefly behaviour. The variant switcher still lets you swap firefly
// behaviours on top of any lighting stance.
//
// Phase status:
//   - 'placeholder' — picker entry exists, scene renders bare room only.
//   - 'built'       — variant applies its own lighting / firefly /
//                     material treatment on top of the base scene.

export const experiences = [
  {
    id: 'last-light',
    label: 'Last light',
    summary: 'The room never quite goes dark. Fireflies arrive into a sky that still has colour, instead of pure black.',
    status: 'built',
  },
  {
    id: 'underwater',
    label: 'Underwater',
    summary: 'Full darkness with a faint cool ambient. The space feels submerged; fireflies become deep-sea luminescence.',
    status: 'built',
  },
  {
    id: 'void',
    label: 'Void',
    summary: 'Pure black, no ambient anywhere. The room disappears; the fireflies are the only thing that exists.',
    status: 'built',
  },
]

export const experiencesById = Object.fromEntries(
  experiences.map((e) => [e.id, e])
)

export const DEFAULT_EXPERIENCE_ID = 'last-light'
