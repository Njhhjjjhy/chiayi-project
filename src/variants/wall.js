// Wall treatment variant definitions.
// 5 options from phase 2, replacing the old mountain-only concept.

export const wallVariants = {
  livingMoss: {
    id: 'livingMoss',
    label: 'Living moss wall',
    description: 'A wall-sized surface covered in living moss or lichen, woven into wire mesh. Moss texture catches and scatters firefly light.',
    complexity: 'medium',
    cost: 'medium',
  },
  reflectiveFracture: {
    id: 'reflectiveFracture',
    label: 'Reflective fracture wall',
    description: 'Triangular and angular mirror fragments creating kaleidoscopic reflections. "You are what you see" made literal.',
    complexity: 'medium',
    cost: 'medium',
  },
  fiberVeil: {
    id: 'fiberVeil',
    label: 'Fiber veil wall',
    description: 'A deep-pile surface of natural fibers with embedded micro-LEDs at varying depths. The forest floor turned vertical.',
    complexity: 'high',
    cost: 'medium to high',
  },
  projectionReactive: {
    id: 'projectionReactive',
    label: 'Projection-reactive surface',
    description: 'A matte surface used as a projection canvas, connected to the infrared detection system. Visitors become part of the artwork.',
    complexity: 'high',
    cost: 'high',
  },
}

export const wallVariantList = Object.values(wallVariants)
