import { useControls, folder } from 'leva'
import { ROOM } from '../geometry/dimensions.js'

export function useLevaControls() {
  const controls = useControls({
    room: folder(
      {
        width: { value: ROOM.W, min: 4, max: 20, step: 0.01 },
        depth: { value: ROOM.D, min: 4, max: 20, step: 0.5 },
        height: { value: ROOM.H, min: 2.5, max: 6, step: 0.01 },
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
