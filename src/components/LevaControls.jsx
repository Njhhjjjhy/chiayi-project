import { useControls, folder } from 'leva'

const CAMERA_PRESETS = {
  'Eye level': [0, 1.6, 4],
  Overhead: [0, 8, 0.1],
  Corner: [4, 2.5, 4],
}

export function useLevaControls() {
  const controls = useControls({
    room: folder(
      {
        width: { value: 10, min: 4, max: 20, step: 0.5 },
        depth: { value: 10, min: 4, max: 20, step: 0.5 },
        height: { value: 3.5, min: 2.5, max: 6, step: 0.1 },
      },
      { collapsed: false }
    ),
    grid: folder(
      {
        showGrid: { value: true, label: 'Show grid' },
      },
      { collapsed: true }
    ),
    camera: folder(
      {
        preset: {
          value: 'Eye level',
          options: Object.keys(CAMERA_PRESETS),
          label: 'Preset',
        },
      },
      { collapsed: true }
    ),
  })

  return {
    roomWidth: controls.width,
    roomDepth: controls.depth,
    roomHeight: controls.height,
    showGrid: controls.showGrid,
    cameraPreset: CAMERA_PRESETS[controls.preset],
  }
}
