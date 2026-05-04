import { fireflyVariantList } from './fireflies.js'
import { ceilingVariantList, floorVariantList } from './room.js'
import { wallCoveringVariantList } from './wallCovering.js'
import { HW, HD, ENT_W, WINDOW_PRESET_CAMERA_X } from '../geometry/dimensions.js'

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

// Each wall preset stands inside the room and looks head-on at the
// named wall, like an architectural elevation. Positions and targets
// are derived from ROOM constants so they auto-update when room
// dimensions change.
//
//   - front: camera near back-wall, looking at front-wall centre.
//     Pathway-partition's front-wall side will appear in foreground
//     (not auto-hidden in current implementation).
//   - back: camera near front-wall, looking at back-wall centre.
//     No pathway-partition obstruction (pathway-partition only has
//     front + window arms).
//   - window: camera between the pathway-partition's window-wall arm
//     and the window-wall itself, so the actual fixtures (small
//     window, silver door, main glass) read clearly. Theatrical
//     curtain hidden in this preset.
//   - entrance: camera on the entrance-wall side of the pathway-
//     partition arm (so the pathway-partition is behind the camera,
//     not occluding view).
//   - ceiling: top-down. y = 9 m fits the 8.83 × 8.78 footprint.
//   - standing: visitor POV — just inside the entrance, at the south
//     edge of the entrance opening, looking into the room interior.
export const cameraPresets = {
  ceiling:  { label: 'Ceiling',       position: [0.5, 9, 0.5],                                target: [0, 0, 0] },
  front:    { label: 'Front-wall',    position: [0, 1.6, HD - 0.3],                           target: [0, 1.6, -HD] },
  back:     { label: 'Back-wall',     position: [0, 1.6, -HD + 0.3],                          target: [0, 1.6, HD] },
  window:   {
    label: 'Window-wall',
    position: [WINDOW_PRESET_CAMERA_X, 1.6, 0],
    target:   [HW, 1.6, 0],
  },
  entrance: { label: 'Entrance-wall', position: [HW / 2, 1.6, 0],                             target: [-HW, 1.6, 0] },
  standing: { label: 'Standing',      position: [-HW + 0.5, 1.6, -HD + ENT_W],                target: [0, 1.6, 0] },
}

// Window preset hides the theatrical curtain (so the main glass +
// door + small window are visible). Other presets keep it.
export const ELEVATION_PRESET_KEYS = new Set(['window'])
