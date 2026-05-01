// Three camera presets used for review and phase-gate screenshot
// capture. Coordinates from the spec; may be refined once scaffold
// renders in phase 1 and the viewpoints are sanity-checked.

export const cameraPresets = {
  entranceStanding: {
    id: 'entranceStanding',
    label: 'Entrance standing',
    position: [-3.5, 1.6, -3.3],
    target: [0, 1.6, 5],
  },
  midRoomStanding: {
    id: 'midRoomStanding',
    label: 'Mid-room standing',
    position: [0, 1.6, 0],
    target: [0, 1.6, 5],
  },
  bigWallOblique: {
    id: 'bigWallOblique',
    label: 'Big-wall oblique',
    position: [-2.5, 1.6, 2.0],
    target: [1.5, 1.6, 5],
  },
}

export const DEFAULT_CAMERA_PRESET_ID = 'midRoomStanding'
