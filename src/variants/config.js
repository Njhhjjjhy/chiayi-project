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

// Each wall preset stands in the forest centre and looks head-on
// at the named wall, like an architectural elevation. Anything in
// front of that wall that would block the view is hidden for that
// preset only — and only while not walking the space.
//
//   - front: nothing on the front wall, but seg-1 partition is in
//     the way. Hidden.
//   - back: D1 + D2 visible, seg-3 + seg-4 don't block from this
//     camera position. Nothing hidden.
//   - entrance: visitor entrance opening visible head-on, seal
//     partition hidden so the opening reads through.
//   - window: silver door + small window + main glass + plenum
//     visible. Seg-2 partition + theatrical curtain hidden.
//     Windows switch to a visible glass material in this preset.
//   - ceiling: forest centre, looking up at dropped ceiling.
//   - standing: forest centre, eye-level visitor POV (full
//     installation visible — partitions + curtain + everything).
export const cameraPresets = {
  ceiling:  { label: 'Ceiling',       position: [0.5, 8, 0.5],     target: [0, 0, 0] },
  front:    { label: 'Front wall',    position: [0, 1.6, -2],      target: [0, 1.6, -5] },
  back:     { label: 'Back wall',     position: [0, 1.6, 2],       target: [0, 1.6, 5] },
  entrance: { label: 'Entrance wall', position: [0, 1.6, -3.35],   target: [-4.4, 1.6, -3.35] },
  window:   { label: 'Window wall',   position: [0, 1.6, 0],       target: [4.4, 1.6, 0] },
  standing: { label: 'Standing',      position: [0, 1.6, 0],       target: [0, 1.6, -2] },
}

// Window preset hides the theatrical curtain (so the main glass +
// door + small window are visible). Other presets keep it.
export const ELEVATION_PRESET_KEYS = new Set(['window'])
