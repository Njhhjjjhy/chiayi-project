import { useState, useEffect, useRef } from 'react'
import { useTimeline, PHASES } from '../hooks/useTimeline.jsx'
import { useVariant } from '../hooks/useVariant.jsx'

const PHASE_DESCRIPTIONS = {
  golden: 'Golden hour',
  twilight: 'Twilight',
  blue: 'Blue hour',
  darkness: 'Darkness',
}

const PHASE_SUBTITLES = {
  golden: 'Late afternoon light warms the mountain ridgeline',
  twilight: 'Color deepens as the sun slips below the horizon',
  blue: 'The last traces of light dissolve into indigo',
  darkness: 'Stillness. Then, emergence.',
}

export default function PhaseOverlay() {
  const { time } = useTimeline()
  const { viewMode } = useVariant()
  const [showLabel, setShowLabel] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('')
  const lastPhaseRef = useRef('')
  const timerRef = useRef(null)

  if (viewMode === 'construction') return null

  const phaseIndex = time < 0.25 ? 0 : time < 0.5 ? 1 : time < 0.75 ? 2 : 3
  const phaseKey = PHASES[phaseIndex].id

  // Show label when phase changes
  useEffect(() => {
    if (phaseKey !== lastPhaseRef.current) {
      lastPhaseRef.current = phaseKey
      setCurrentPhase(phaseKey)
      setShowLabel(true)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShowLabel(false), 3000)
    }
  }, [phaseKey])

  return (
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center transition-opacity duration-1000 ${
        showLabel ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-white/50 text-lg font-light tracking-widest uppercase mb-1">
        {PHASE_DESCRIPTIONS[currentPhase]}
      </div>
      <div className="text-white/25 text-xs tracking-wide">
        {PHASE_SUBTITLES[currentPhase]}
      </div>
    </div>
  )
}
