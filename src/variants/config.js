import { fireflyVariantList } from './fireflies.js'
import { ceilingVariantList, floorVariantList } from './room.js'
import { wallCoveringVariantList } from './wallCovering.js'

export const variantCategories = {
  wallCovering: {
    label: 'Wall covering',
    variants: wallCoveringVariantList,
  },
  ceiling: {
    label: 'Ceiling',
    variants: ceilingVariantList,
  },
  floor: {
    label: 'Floor',
    variants: floorVariantList,
  },
  fireflies: {
    label: 'Fireflies',
    variants: fireflyVariantList,
  },
}

export const viewModes = {
  experience: 'Experience',
  light: 'Light',
  construction: 'Construction',
}

// Architectural review angles. Wall names map to dimensions.js:
// front (z=-HD), back (z=+HD), entrance (x=-HW), window (x=+HW).
//
// All elevation presets are INSIDE the room — the user reviews the
// space, not its exterior. Each elevation puts the camera in the
// corridor that hugs the named wall, so the wall is visible without
// the seg-1/2/3 partitions getting between camera and wall.
//
//   - front, back: stand at one end of the corridor, look lengthwise
//     down it. Front-wall corridor has no features. Back-wall corridor
//     passes the D1 opening at far end — visible as a gap in seg-3.
//   - entrance: stand in seg-1 corridor at z=-4, look head-on at the
//     entrance wall. Visitor entrance opening fills most of the view.
//     Camera z=-4 is in the open part of the entrance opening (seal
//     partition only covers z = -3.65 to -2.15).
//   - window: stand in seg-2 corridor at z=-2.5, look head-on at the
//     window wall. Silver door + small window + HVAC plenum visible.
//     Main glass partition is hidden by the theatrical curtain (by
//     design — curtain is a permanent installation fixture).
//   - ceiling: forest centre, looking up at dropped ceiling.
//   - top-down: bird's-eye plan view from above the room.
//   - standing: forest centre, eye-level visitor POV.
export const cameraPresets = {
  ceiling:  { label: 'Ceiling',       position: [0, 0.3, 0.3],     target: [0, 3.4, 0] },
  front:    { label: 'Front wall',    position: [-3.7, 1.6, -4.3], target: [3.7, 1.6, -4.3] },
  back:     { label: 'Back wall',     position: [3.7, 1.6, 4.3],   target: [-3.7, 1.6, 4.3] },
  entrance: { label: 'Entrance wall', position: [-2.5, 1.6, -4.0], target: [-4.4, 1.6, -4.0] },
  window:   { label: 'Window wall',   position: [2.7, 1.6, -2.5],  target: [4.4, 1.6, -2.5] },
  topDown:  { label: 'Top-down',      position: [0.5, 9, 0.5],     target: [0, 0, 0] },
  standing: { label: 'Standing',      position: [0, 1.6, 0],       target: [0, 1.6, -2] },
}
