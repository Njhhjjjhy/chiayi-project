import { wallVariantList } from './wall.js'
import { lightingVariantList } from './lighting.js'
import { fireflyVariantList } from './fireflies.js'
import { ceilingVariantList, floorVariantList } from './room.js'

export const variantCategories = {
  wall: {
    label: 'The big wall',
    variants: wallVariantList,
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
  light: 'Light',
  construction: 'Construction',
}

export const cameraPresets = {
  standing: { label: 'Standing', position: [0, 1.6, 3], target: [0, 1.6, -2] },
  seated: { label: 'Seated', position: [0, 1.1, 3], target: [0, 1.1, -2] },
  overhead: { label: 'Overhead', position: [0, 9, 0.01], target: [0, 0, 0] },
  corner: { label: 'Corner', position: [4, 2.5, 4], target: [0, 1.5, -1] },
  free: { label: 'Free orbit', position: [0, 1.6, 3], target: [0, 1.6, -2] },
  audienceView: { label: 'Audience POV', position: [0, 1.1, 2.5], target: [0, 1.4, -3] },
  installationOverview: { label: 'Overview', position: [5, 3.5, 5], target: [0, 1.2, -1] },
}
