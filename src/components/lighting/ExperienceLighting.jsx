import * as THREE from 'three'
import { useTimeline } from '../../hooks/useTimeline.js'
import { sampleHorizon, sampleSky, sunsetLevel } from './sunsetArc.js'

// Experience-mode room lighting. The sunset itself lives on the
// physical fixtures (horizon strips in WallLighting, sky spotlights in
// SeatingSpotlights) — this component only adds what a real room gets
// back from those fixtures:
//
//   - a faint omnidirectional bounce so geometry stays barely navigable
//   - a low warm rake from the sun side (the front-wall strip is the
//     brightest fixture; its spill crosses the room like late sun)
//
// Neither must ever be bright enough to read as a light source of its
// own.

const BOUNCE_INTENSITY = 0.35
const RAKE_INTENSITY = 0.6

const _c1 = new THREE.Color()
const _c2 = new THREE.Color()

export default function ExperienceLighting({ brightness = 1 }) {
  const { time } = useTimeline()
  const horizon = sampleHorizon(time)
  const sky = sampleSky(time)
  const level = sunsetLevel(time)

  // Bounce colour: the mix of what the fixtures are currently emitting.
  const hex = '#' + _c1.set(horizon.hex).lerp(_c2.set(sky.hex), 0.5).getHexString()

  return (
    <>
      <ambientLight
        color={hex}
        intensity={BOUNCE_INTENSITY * level * brightness}
      />
      {/* low warm rake from behind the front-wall (the sun side) */}
      <directionalLight
        position={[12, 1.6, 4.4]}
        color={horizon.hex}
        intensity={RAKE_INTENSITY * horizon.factor * brightness}
      />
    </>
  )
}
