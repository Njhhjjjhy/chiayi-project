import { useEffect } from 'react'
import { useTimeline } from '../../../hooks/useTimeline.js'
import { useVariant } from '../../../hooks/useVariant.js'

// Void — pure black. No supplementary ambient anywhere. The room itself
// disappears; the only thing that exists is the fireflies. Useful as a
// zero-baseline against which any other lighting proposal can be judged
// — does adding atmosphere read as more than just visual noise on top
// of this.
//
// Forces:
//   - Experience view mode
//   - Firefly variant 'awakening' (single LED, then expanding wave, then breathing)
//   - Timeline parked at maximum darkness
//   - Timeline paused
//   - No supplementary lighting at all

export default function Void() {
  const { setTime, pause } = useTimeline()
  const { setViewMode, selectVariant } = useVariant()

  useEffect(() => {
    setViewMode('experience')
    selectVariant('fireflies', 'awakening')
    setTime(0.97)
    pause()
  }, [setViewMode, selectVariant, setTime, pause])

  return null
}
