import { mountainWallVariantList } from './mountainWall.js'
import { lightingVariantList } from './lighting.js'
import { fireflyVariantList } from './fireflies.js'

export const variantCategories = {
  mountainWall: {
    label: 'Mountain wall',
    variants: mountainWallVariantList,
  },
  lighting: {
    label: 'Lighting',
    variants: lightingVariantList,
  },
  fireflies: {
    label: 'Fireflies',
    variants: fireflyVariantList,
  },
  room: {
    label: 'Room',
    variants: [],
  },
}

export const viewModes = {
  experience: 'Experience',
  construction: 'Construction',
}
