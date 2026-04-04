import { mountainWallVariantList } from './mountainWall.js'
import { lightingVariantList } from './lighting.js'
import { fireflyVariantList } from './fireflies.js'
import { ceilingVariantList, floorVariantList } from './room.js'

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
  ceiling: {
    label: 'Ceiling',
    variants: ceilingVariantList,
  },
  floor: {
    label: 'Floor',
    variants: floorVariantList,
  },
}

export const viewModes = {
  experience: 'Experience',
  construction: 'Construction',
}

export const cameraPresets = {
  standing: { label: 'Standing', position: [0, 1.6, 3], target: [0, 1.6, -2] },
  seated: { label: 'Seated', position: [0, 1.1, 3], target: [0, 1.1, -2] },
  overhead: { label: 'Overhead', position: [0, 9, 0.01], target: [0, 0, 0] },
  corner: { label: 'Corner', position: [4, 2.5, 4], target: [0, 1.5, -1] },
  free: { label: 'Free orbit', position: [0, 1.6, 3], target: [0, 1.6, -2] },
}
