import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const TimelineContext = createContext(null)

const SPEEDS = {
  '30s': 1 / 30,
  '60s': 1 / 60,
  '2min': 1 / 120,
  '5min': 1 / 300,
}

const PHASES = [
  { id: 'golden', label: 'Golden hour', start: 0.0 },
  { id: 'twilight', label: 'Twilight', start: 0.25 },
  { id: 'blue', label: 'Blue hour', start: 0.5 },
  { id: 'darkness', label: 'Darkness', start: 0.75 },
]

export function TimelineProvider({ children }) {
  const [time, setTime] = useState(0)
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

  return (
    <TimelineContext.Provider
      value={{ time, setTime, playing, play, pause, toggle, speed, setSpeed, jumpToPhase }}
    >
      {children}
    </TimelineContext.Provider>
  )
}

export function useTimeline() {
  const ctx = useContext(TimelineContext)
  if (!ctx) throw new Error('useTimeline must be used within TimelineProvider')
  return ctx
}

export { PHASES, SPEEDS }
