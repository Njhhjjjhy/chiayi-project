import { useEffect, useState } from 'react'
import { useTimeline } from '../../../hooks/useTimeline.js'
import { useVariant } from '../../../hooks/useVariant.js'

// Strobe — the room is in absolute darkness. Pressing space (or
// clicking) fires a single global flash for a few frames, freezing the
// firefly motion as a single visible "frame" before darkness returns.
//
// Forces:
//   - Experience view mode (so the dark lighting actually applies)
//   - Firefly variant 'motion' (so each flash reveals a different
//     swarm position)
//   - Timeline parked at darkness, paused (no auto-cycle here)

const FLASH_DURATION_MS = 120

export default function Strobe() {
  const { setTime, pause } = useTimeline()
  const { setViewMode, selectVariant } = useVariant()
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    setViewMode('experience')
    selectVariant('fireflies', 'motion')
    setTime(1.0)
    pause()
  }, [setViewMode, selectVariant, setTime, pause])

  useEffect(() => {
    let timer = null
    function trigger() {
      setFlash(true)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setFlash(false), FLASH_DURATION_MS)
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

  if (!flash) return null
  return <ambientLight intensity={4} color="#ffffff" />
}
