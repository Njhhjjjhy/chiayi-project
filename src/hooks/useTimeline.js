import { createContext, useContext } from 'react'

export const TimelineContext = createContext(null)

export const SPEEDS = {
  '30s': 1 / 30,
  '60s': 1 / 60,
  '2min': 1 / 120,
  '5min': 1 / 300,
}

export const PHASES = [
  { id: 'golden', label: 'Golden hour', start: 0.0 },
  { id: 'twilight', label: 'Twilight', start: 0.25 },
  { id: 'blue', label: 'Blue hour', start: 0.5 },
  { id: 'darkness', label: 'Darkness', start: 0.75 },
]

export function useTimeline() {
  const ctx = useContext(TimelineContext)
  if (!ctx) throw new Error('useTimeline must be used within TimelineProvider')
  return ctx
}
