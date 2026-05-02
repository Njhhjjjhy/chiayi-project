import { useEffect } from 'react'
import { useTimeline } from '../../../hooks/useTimeline.js'
import { useVariant } from '../../../hooks/useVariant.js'

// Compressed day — the entire 24-hour sunset cycle compressed into 30
// seconds. Lighting moves continuously through golden hour → twilight →
// blue hour → darkness, looping. Forces the immersive "Experience" view
// mode (the light/construction modes use fixed lighting that ignores
// the timeline) and reuses the existing 4-phase shader.
//
// Also overrides:
//   - Firefly variant → 'motion' (the default 'blinking' variant has a
//     2-minute warm-up before fireflies become visible, which makes the
//     30-second compressed cycle look broken).
//   - Initial timeline position → 0.7 (late blue hour) so fireflies are
//     visible immediately on page load, instead of having to wait
//     through the daylight portion of the cycle.

export default function CompressedDay() {
  const { setSpeed, setTime, play, pause } = useTimeline()
  const { setViewMode, selectVariant } = useVariant()

  useEffect(() => {
    setViewMode('experience')
    selectVariant('fireflies', 'motion')
    setTime(0)
    setSpeed('30s')
    play()
    return () => pause()
  }, [setViewMode, selectVariant, setTime, setSpeed, play, pause])

  return null
}
