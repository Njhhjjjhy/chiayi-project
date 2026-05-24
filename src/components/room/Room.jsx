import Walls from './Walls.jsx'
import Floor from './Floor.jsx'
import Column from './Column.jsx'
import EntranceWallPartition from './EntranceWallPartition.jsx'
import Pathway from './Pathway.jsx'
import TheatricalCurtain from './TheatricalCurtain.jsx'
import {
  WINDOW_CURTAIN_WIDTH, WINDOW_CURTAIN_HEIGHT,
  WINDOW_CURTAIN_CENTER_X, WINDOW_CURTAIN_CENTER_Y, WINDOW_CURTAIN_CENTER_Z,
  ENTRANCE_CURTAIN_WIDTH, ENTRANCE_CURTAIN_HEIGHT,
  ENTRANCE_CURTAIN_CENTER_X, ENTRANCE_CURTAIN_CENTER_Y, ENTRANCE_CURTAIN_CENTER_Z,
  EXIT_CURTAIN_WIDTH, EXIT_CURTAIN_HEIGHT,
  EXIT_CURTAIN_CENTER_X, EXIT_CURTAIN_CENTER_Y, EXIT_CURTAIN_CENTER_Z,
} from '../../geometry/dimensions.js'
import Doors from './Doors.jsx'
import Windows from './Windows.jsx'
import SculpturalCeiling from './SculpturalCeiling.jsx'
import CeilingLEDs from '../fireflies/CeilingLEDs.jsx'
import Branches from './Branches.jsx'
import WallLighting from './WallLighting.jsx'
import LuffaWall from './LuffaWall.jsx'
import SeatingStools from './SeatingStools.jsx'
import SeatingBenches from './SeatingBenches.jsx'
import SeatingPillows from './SeatingPillows.jsx'
import PathwayEdgeLights from '../lighting/PathwayEdgeLights.jsx'
import SeatingSpotlights from '../lighting/SeatingSpotlights.jsx'
import WallGlowDots from '../lighting/WallGlowDots.jsx'
import FireflySystem from '../fireflies/FireflySystem.jsx'
import { useProposal } from '../../hooks/useProposal.js'
import FlockHangers from './FlockHangers.jsx'
import FlockLEDs from '../fireflies/FlockLEDs.jsx'
import NestingForms from './NestingForms.jsx'

// v2 room wrapper. Mounts every piece of the canonical room geometry
// in one group so consumers only need to render <Room /> and don't
// have to track which sub-components exist.
//
// Coordinate system (parallel to dimensions.js):
//   Origin (0, 0, 0) sits at the back-wall / entrance-wall corner.
//   X axis → positive toward front-wall.    back-wall at X = 0,           front-wall at X = ROOM.W.
//   Y axis → up.                            floor at Y = 0,                working ceiling at Y = ROOM.H.
//   Z axis → positive toward window-wall.   entrance-wall line at Z = 0,   window-wall at Z = ROOM.D.
//
// fireflyVariant: when set to a valid variant id ('awakening', etc.)
// the FireflySystem renders animated particles at the panel LED
// positions and the static LED dots in Ceiling are hidden so they
// don't double up. 'off' (default) leaves the static LEDs visible.
//
// wayfindVariant: 'off' | 'strip' | 'arrows' | 'pools' — the pathway
// wayfinding lighting prototype to render (slice 4). 'off' (default)
// renders nothing.
//
// loofahVariant: 'variant1' | 'variant2' | 'variant3' — the loofah
// wall prototype (slice 5). loofahCorner is consumed only by variant3.
export default function Room({
  spotlightDim = 1,
  fireflyVariant = 'off',
  wayfindVariant = 'off',
  loofahVariant = 'variant1',
  loofahCorner = 'back-left',
  ceilingVariant = 'oblong',
  seatingVariant = 'stools',
}) {
  const { ledSurface } = useProposal()
  const fireflyActive = fireflyVariant && fireflyVariant !== 'off'
  return (
    <group>
      <Floor />
      <Walls />
      <Column />
      <EntranceWallPartition />
      <Pathway />
      <>
          <TheatricalCurtain
            width={WINDOW_CURTAIN_WIDTH}
            height={WINDOW_CURTAIN_HEIGHT}
            centerX={WINDOW_CURTAIN_CENTER_X}
            centerY={WINDOW_CURTAIN_CENTER_Y}
            centerZ={WINDOW_CURTAIN_CENTER_Z}
            orientation="window-wall"
          />
          <TheatricalCurtain
            width={ENTRANCE_CURTAIN_WIDTH}
            height={ENTRANCE_CURTAIN_HEIGHT}
            centerX={ENTRANCE_CURTAIN_CENTER_X}
            centerY={ENTRANCE_CURTAIN_CENTER_Y}
            centerZ={ENTRANCE_CURTAIN_CENTER_Z}
            orientation="entrance-wall"
          />
          <TheatricalCurtain
            width={EXIT_CURTAIN_WIDTH}
            height={EXIT_CURTAIN_HEIGHT}
            centerX={EXIT_CURTAIN_CENTER_X}
            centerY={EXIT_CURTAIN_CENTER_Y}
            centerZ={EXIT_CURTAIN_CENTER_Z}
            orientation="entrance-wall"
          />
      </>
      <Doors />
      <Windows />
      <SculpturalCeiling variant={ceilingVariant} />
      <CeilingLEDs hideLeds={fireflyActive || ledSurface !== 'ceiling'} variant={ceilingVariant} />
      {ledSurface === 'flock' && (
        <>
          <FlockHangers />
          <FlockLEDs />
        </>
      )}
      <NestingForms />
      <Branches />
      <WallLighting />
      <PathwayEdgeLights variant={wayfindVariant} />
      <LuffaWall variant={loofahVariant} corner={loofahCorner} />
      {seatingVariant === 'stools' && <SeatingStools />}
      {seatingVariant === 'benches' && <SeatingBenches />}
      {seatingVariant === 'pillows' && <SeatingPillows />}
      <SeatingSpotlights dim={spotlightDim} />
      <WallGlowDots animated={fireflyActive} />
      <FireflySystem variantId={fireflyVariant} ceilingVariant={ceilingVariant} />
    </group>
  )
}
