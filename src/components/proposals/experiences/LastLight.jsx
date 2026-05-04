import { useEffect } from 'react'
import { useTimeline } from '../../../hooks/useTimeline.js'
import { useVariant } from '../../../hooks/useVariant.js'

// Last light — the room never quite reaches full darkness. The shader is
// held at the very start of the darkness phase, so the sky retains a
// residue of blue and the walls keep some colour. Fireflies arrive into
// a sky that has not yet gone out, instead of into pure black.
//
// Forces:
//   - Experience view mode
//   - Firefly variant 'drifting-swarm' (visible against the residual sky)
//   - Timeline parked just past the firefly visibility threshold
//   - Timeline paused

export default function LastLight() {
  const { setTime, pause } = useTimeline()
  const { setViewMode, selectVariant } = useVariant()

  useEffect(() => {
    setViewMode('experience')
    selectVariant('fireflies', 'drifting-swarm')
    setTime(0.78)
    pause()
  }, [setViewMode, selectVariant, setTime, pause])

  return null
}
