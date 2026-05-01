import {
  ROOM, HW, HD, WAINSCOT_H, DOOR_SKIPS, DOOR_TOPS, INSET,
} from '../../geometry/dimensions.js'

// Shared panel grid mounted on the big wall (z = +HD) above the 0.90 m
// back-wall wainscot. Landscape 900 × 1200 mm panel module
// (0.9 m tall × 1.2 m wide) tiled horizontally, respecting
// DOOR_SKIPS.back so panels do not cover the two service doors.
//
// Variants render their own treatment inside each panel by passing a
// `renderPanel({ col, row, width, height })` function as a prop. Null
// renders a bare matte off-white face.
//
// Wall identity note — the spec and this component treat z = +HD as
// the big wall, matching DOOR_SKIPS.back. The inline comment at the
// top of src/components/Room.jsx describes z = -HD as the "feature-
// wall position," which conflicts with the spec. Flagged for phase 1
// review; the spec wins until that is resolved.

const PANEL_W = 1.2  // landscape width
const PANEL_H = 0.9  // landscape height

// Back-wall inside face, inset slightly from the wall mesh plane so
// the panels do not z-fight with the plaster behind them.
const WALL_Z = HD - INSET

export default function BackWallFrame({ renderPanel }) {
  const treatmentBottom = WAINSCOT_H.back
  const treatmentTop = ROOM.H
  const treatmentHeight = treatmentTop - treatmentBottom

  const cols = Math.floor(ROOM.W / PANEL_W)
  const rows = Math.floor(treatmentHeight / PANEL_H)
  const totalPanelsWidth = cols * PANEL_W
  const marginX = (ROOM.W - totalPanelsWidth) / 2
  const xStart = -HW + marginX + PANEL_W / 2

  // Tallest door top on the back wall; a panel whose bottom sits below
  // this is blocked if its x-range overlaps a door skip.
  const doorTopY = DOOR_TOPS.back.length ? Math.max(...DOOR_TOPS.back) : 0

  const panels = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = xStart + col * PANEL_W
      const cy = treatmentBottom + PANEL_H / 2 + row * PANEL_H
      const panelBottom = cy - PANEL_H / 2

      const pxMin = cx - PANEL_W / 2
      const pxMax = cx + PANEL_W / 2
      const overlapsDoor = DOOR_SKIPS.back.some(
        ([dxMin, dxMax]) => pxMin < dxMax && pxMax > dxMin,
      )
      if (overlapsDoor && panelBottom < doorTopY) continue

      panels.push({ col, row, cx, cy })
    }
  }

  return (
    <group>
      {panels.map(({ col, row, cx, cy }) => (
        <group
          key={`${row}-${col}`}
          position={[cx, cy, WALL_Z]}
          rotation={[0, Math.PI, 0]}
        >
          {renderPanel
            ? renderPanel({ col, row, width: PANEL_W, height: PANEL_H })
            : null}
        </group>
      ))}
    </group>
  )
}
