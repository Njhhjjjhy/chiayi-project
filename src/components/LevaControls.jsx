import { useControls, folder } from 'leva'

export function useLevaControls() {
  const controls = useControls({
    room: folder(
      {
        width: { value: 10, min: 4, max: 20, step: 0.5 },
        depth: { value: 10, min: 4, max: 20, step: 0.5 },
        height: { value: 3.52, min: 2.5, max: 6, step: 0.01 },
      },
      { collapsed: false }
    ),
    grid: folder(
      {
        showGrid: { value: true, label: 'Show grid' },
      },
      { collapsed: true }
    ),
  })

  return {
    roomWidth: controls.width,
    roomDepth: controls.depth,
    roomHeight: controls.height,
    showGrid: controls.showGrid,
  }
}
