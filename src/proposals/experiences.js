// Five experience proposals for the firefly room. Each one is a complete
// corridor → forest → exit experience, anchored on a different reference
// principle. Source document: docs/experience-proposals.md.
//
// Phase status:
//   - 'placeholder' — picker entry exists, scene renders bare room only.
//   - 'built'       — variant applies its own lighting / firefly /
//                     material treatment on top of the base scene.

export const experiences = [
  {
    id: 'dark-corridor',
    label: 'Dark corridor',
    summary: 'Almost no light. Flashlight makes a small bubble of legibility; everything outside the bubble must be sensed by other means.',
    status: 'built',
  },
  {
    id: 'strobe',
    label: 'Strobe',
    summary: 'Absolute darkness between flashlight clicks. Each click is a single frozen frame of a film the visitor edits in real time.',
    status: 'built',
  },
  {
    id: 'recalibration',
    label: 'Recalibration',
    summary: 'Dark adaption is the subject. The corridor walks the visitor through a tuned dimming curve; the forest rewards stillness.',
    status: 'built',
  },
  {
    id: 'mirrored-self',
    label: 'Mirrored self',
    summary: 'The visitor sees themselves inside the firefly system. Striped mirror partition; LEDs pulse with the visitor’s heart rate.',
    status: 'built',
  },
  {
    id: 'compressed-day',
    label: 'Compressed day',
    summary: 'A 24-hour cycle in 15–20 minutes. The corridor is the day, the forest is the night, the flashlight is the moon.',
    status: 'built',
  },
]

export const experiencesById = Object.fromEntries(
  experiences.map((e) => [e.id, e])
)

export const DEFAULT_EXPERIENCE_ID = 'compressed-day'
