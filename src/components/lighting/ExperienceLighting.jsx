import { useTimeline } from '../../hooks/useTimeline.js'
import { sampleSunset } from './sunsetArc.js'

// Experience-mode room lighting — applies the shared sunset arc (see
// sunsetArc.js) as the room's ambient light, following the timeline
// player.

export default function ExperienceLighting({ brightness = 1 }) {
  const { time } = useTimeline()
  const { hex, intensity } = sampleSunset(time)

  return <ambientLight color={hex} intensity={intensity * brightness} />
}
