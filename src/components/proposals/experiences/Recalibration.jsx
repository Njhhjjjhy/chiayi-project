import { useEffect, useState } from 'react'
import { useTimeline } from '../../../hooks/useTimeline.js'
import { useVariant } from '../../../hooks/useVariant.js'

// Recalibration — the room is dim (not pitch black). Stay still long
// enough and the eye adapts; more becomes visible. Pressing SPACE
// fires a slow bright pulse that wipes the visitor's dark adaption,
// forcing them to start over. The mechanic teaches the discipline
// of stillness by punishing the impulse to "see more, faster".
//
// Forces:
//   - Experience view mode
//   - Firefly variant 'blinking' (slow, contemplative)
//   - Timeline parked at twilight/blue-hour boundary (dim base layer)
//   - Timeline paused

const RESET_DURATION_MS = 600

export default function Recalibration() {
  const { setTime, pause } = useTimeline()
  const { setViewMode, selectVariant } = useVariant()
  const [reset, setReset] = useState(false)

  useEffect(() => {
    setViewMode('experience')
    // 'blinking' has a 120-second appear-one-by-one buildup that reads
    // as "no fireflies" for the first ~10 seconds; not what we want for
    // a review tool. 'motion' shows visible LEDs immediately while still
    // matching the contemplative tone of this proposal.
    selectVariant('fireflies', 'motion')
    setTime(0.85)
    pause()
  }, [setViewMode, selectVariant, setTime, pause])

  useEffect(() => {
    let timer = null
    function trigger() {
      setReset(true)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setReset(false), RESET_DURATION_MS)
    }
    function onKey(e) {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault()
        trigger()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (timer) clearTimeout(timer)
    }
  }, [])

  // Faint constant base layer so the eye has something to adapt TO. The
  // RESET pulse stacks a brighter warm pulse on top.
  return (
    <>
      <ambientLight intensity={0.35} color="#3a2a5a" />
      {reset && <ambientLight intensity={2.0} color="#ffe9c0" />}
    </>
  )
}
