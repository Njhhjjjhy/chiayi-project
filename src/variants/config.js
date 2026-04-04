import { mountainWallVariantList } from './mountainWall.js'
import { lightingVariantList } from './lighting.js'

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
    variants: [],
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
