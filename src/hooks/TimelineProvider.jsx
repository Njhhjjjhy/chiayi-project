import { useState, useCallback, useRef, useEffect } from 'react'
import { TimelineContext, PHASES, SPEEDS } from './useTimeline.js'

// Lazy init for the `?timeline=` URL param. Read-only on first load —
// the scrubber does NOT write back to the URL when dragged.
function readInitialTime() {
  try {
    const raw = new URLSearchParams(window.location.search).get('timeline')
    if (raw === null) return 0
    const t = parseFloat(raw)
    if (!Number.isFinite(t)) return 0
    return Math.max(0, Math.min(1, t))
  } catch {
    return 0
  }
}

export function TimelineProvider({ children }) {
  const [time, setTime] = useState(readInitialTime)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('60s')
  const rafRef = useRef(null)
  const lastFrameRef = useRef(null)

  const play = useCallback(() => setPlaying(true), [])
  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => setPlaying((p) => !p), [])

  const jumpToPhase = useCallback((phaseIndex) => {
    setTime(PHASES[phaseIndex].start)
  }, [])

  // Animation loop
  useEffect(() => {
    if (!playing) {
      lastFrameRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const rate = SPEEDS[speed] || SPEEDS['60s']

    function tick(now) {
      if (lastFrameRef.current !== null) {
        const dt = (now - lastFrameRef.current) / 1000
        setTime((prev) => {
          const next = prev + dt * rate
          return next >= 1 ? 0 : next
        })
      }
      lastFrameRef.current = now
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, speed])

  // Listen for skip-to-fireflies event
  useEffect(() => {
    function handleSkip() {
      setTime(0.78)
      setPlaying(false)
    }
    window.addEventListener('skipToFireflies', handleSkip)
    return () => window.removeEventListener('skipToFireflies', handleSkip)
  }, [])

  // Listen for setTimelineTime event — used by capture scripts to sweep
  // the arc. Dispatch like:
  //   window.dispatchEvent(new CustomEvent('setTimelineTime', {
  //     detail: { time: 0.3 },
  //   }))
  useEffect(() => {
    function handleSetTime(e) {
      const t = e?.detail?.time
      if (typeof t === 'number' && t >= 0 && t <= 1) {
        setTime(t)
        setPlaying(false)
      }
    }
    window.addEventListener('setTimelineTime', handleSetTime)
    return () => window.removeEventListener('setTimelineTime', handleSetTime)
  }, [])

  return (
    <TimelineContext.Provider
      value={{ time, setTime, playing, play, pause, toggle, speed, setSpeed, jumpToPhase }}
    >
      {children}
    </TimelineContext.Provider>
  )
}
