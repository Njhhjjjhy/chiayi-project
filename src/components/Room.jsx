import Ceiling from './Ceiling.jsx'
import Floor from './Floor.jsx'
import Walls from './room/Walls.jsx'
import Windows from './room/Windows.jsx'
import Doors from './room/Doors.jsx'
import HVAC from './room/HVAC.jsx'
import Wainscot from './room/Wainscot.jsx'
import { ROOM } from '../geometry/dimensions.js'

// 3D code → user's wall names (existing venue reality):
//   z = -HD wall → "front-wall" (8.83m). Feature-wall position.
//   z = +HD wall → "back-wall" (8.83m). Piano wall with 2 swing doors + 2 A/C heads.
//   x = -HW wall → "entrance-wall" (10m). Visitor entrance + long open span.
//   x = +HW wall → "window-wall" (10m). Multi-pane glass + small window + silver door + HVAC.

export default function Room({ width = ROOM.W, depth = ROOM.D, height = ROOM.H }) {
  return (
    <group>
      <Floor />
      <Ceiling />
      <Walls width={width} depth={depth} height={height} />
      <Windows />
      <Doors />
      <HVAC width={width} height={height} />
      <Wainscot width={width} depth={depth} />
    </group>
  )
}
