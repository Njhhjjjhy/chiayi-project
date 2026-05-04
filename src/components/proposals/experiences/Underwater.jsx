import { useEffect } from 'react'
import { useTimeline } from '../../../hooks/useTimeline.js'
import { useVariant } from '../../../hooks/useVariant.js'

// Underwater — full darkness with a faint cool ambient bleed across the
// whole room, so the space reads as submerged rather than nocturnal.
// Fireflies become deep-sea luminescence; pulse-wave fits the metaphor
// (ripples radiating across the surface above).
//
// Forces:
//   - Experience view mode
//   - Firefly variant 'pulse-wave' (radiating ripples)
//   - Timeline parked deep into darkness
//   - Timeline paused
//   - Faint cool ambient on top of the darkness shader

export default function Underwater() {
  const { setTime, pause } = useTimeline()
  const { setViewMode, selectVariant } = useVariant()

  useEffect(() => {
    setViewMode('experience')
    selectVariant('fireflies', 'pulse-wave')
    setTime(0.9)
    pause()
  }, [setViewMode, selectVariant, setTime, pause])

  return <ambientLight color="#0a2030" intensity={0.18} />
}
