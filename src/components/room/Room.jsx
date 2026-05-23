import Walls from './Walls.jsx'
import Floor from './Floor.jsx'
import Column from './Column.jsx'
import EntranceWallPartition from './EntranceWallPartition.jsx'
import Pathway from './Pathway.jsx'
import TheatricalCurtain from './TheatricalCurtain.jsx'
import Doors from './Doors.jsx'
import Windows from './Windows.jsx'
import Ceiling from './Ceiling.jsx'
import Branches from './Branches.jsx'
import WallLighting from './WallLighting.jsx'
import LuffaWall from './LuffaWall.jsx'
import FireflySystem from '../fireflies/FireflySystem.jsx'

// v2 room wrapper. Mounts every piece of the canonical room geometry
// in one group so consumers only need to render <Room /> and don't
// have to track which sub-components exist.
//
// Coordinate system (parallel to dimensions-v2.js):
//   Origin (0, 0, 0) sits at the back-wall / entrance-wall corner.
//   X axis → positive toward front-wall.    back-wall at X = 0,           front-wall at X = ROOM.W.
//   Y axis → up.                            floor at Y = 0,                working ceiling at Y = ROOM.H.
//   Z axis → positive toward window-wall.   entrance-wall line at Z = 0,   window-wall at Z = ROOM.D.
//
// curtainOff (verification only): hides the theatrical curtain so the
// window-wall doors and windows behind it can be visually inspected.
//
// fireflyVariant: when set to a valid variant id ('awakening', etc.)
// the FireflySystem renders animated particles at the panel LED
// positions and the static LED dots in Ceiling are hidden so they
// don't double up. 'off' (default) leaves the static LEDs visible.
export default function Room({ curtainOff = false, fireflyVariant = 'off' }) {
  const fireflyActive = fireflyVariant && fireflyVariant !== 'off'
  return (
    <group>
      <Floor />
      <Walls />
      <Column />
      <EntranceWallPartition />
      <Pathway />
      {!curtainOff && <TheatricalCurtain />}
      <Doors />
      <Windows />
      <Ceiling hideLeds={fireflyActive} />
      <Branches />
      <WallLighting />
      <LuffaWall />
      <FireflySystem variantId={fireflyVariant} />
    </group>
  )
}
