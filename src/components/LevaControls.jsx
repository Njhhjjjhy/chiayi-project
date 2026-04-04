import { useControls, folder } from 'leva'

const CAMERA_PRESETS = {
  'Eye level': [0, 1.6, 3],
  'Close to wall': [0, 1.6, 0],
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
    mountain: folder(
      {
        layerSpacing: { value: 0.4, min: 0.05, max: 1.0, step: 0.05, label: 'Layer spacing' },
        peakAmplitude: { value: 0.8, min: 0.2, max: 2.0, step: 0.1, label: 'Peak amplitude' },
        peakFrequency: { value: 0.6, min: 0.2, max: 3.0, step: 0.1, label: 'Peak frequency' },
        backlightColor: { value: '#d4a050', label: 'Backlight color' },
        backlightIntensity: { value: 2.0, min: 0, max: 5, step: 0.1, label: 'Backlight intensity' },
        sunLines: { value: false, label: 'Sun lines' },
      },
      { collapsed: false }
    ),
  })

  return {
    roomWidth: controls.width,
    roomDepth: controls.depth,
    roomHeight: controls.height,
    showGrid: controls.showGrid,
    cameraPreset: CAMERA_PRESETS[controls.preset],
    mountainOverrides: {
      spacing: controls.layerSpacing,
      peakAmplitude: controls.peakAmplitude,
      peakFrequency: controls.peakFrequency,
      backlightColor: controls.backlightColor,
      backlightIntensity: controls.backlightIntensity,
      sunLines: controls.sunLines,
    },
  }
}
