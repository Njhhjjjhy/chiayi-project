import { useState, useEffect, useRef } from 'react'
import { useVariant } from '../hooks/useVariant.jsx'
import { useTour } from '../hooks/useTour.jsx'

const MODE_INFO = {
  light: {
    title: 'House lights',
    subtitle: 'The physical space before the show',
  },
  experience: {
    title: 'The show',
    subtitle: 'Compressed sunset to fireflies',
  },
  construction: {
    title: 'Technical view',
    subtitle: 'Dimensions and materials',
  },
}

export default function ViewModeLabel() {
  const { viewMode } = useVariant()
  const { active: tourActive } = useTour()
  const [show, setShow] = useState(false)
  const lastModeRef = useRef(viewMode)
  const timerRef = useRef(null)

  useEffect(() => {
    // Don't show during tour or on initial load
    if (tourActive) return
    if (viewMode === lastModeRef.current) return

    lastModeRef.current = viewMode
    setShow(true)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShow(false), 2500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [viewMode, tourActive])

  if (!show || tourActive) return null

  const info = MODE_INFO[viewMode]
  if (!info) return null

  const isLight = viewMode === 'construction' || viewMode === 'light'

  return (
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center transition-opacity duration-700 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`text-lg font-light tracking-widest uppercase mb-1 ${
          isLight ? 'text-black/50' : 'text-white/60'
        }`}
        style={{
          textShadow: isLight
            ? '0 0 20px rgba(255,255,255,0.8)'
            : '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)',
        }}
      >
        {info.title}
      </div>
      <div
        className={`text-xs tracking-wide ${
          isLight ? 'text-black/30' : 'text-white/35'
        }`}
        style={{
          textShadow: isLight
            ? '0 0 15px rgba(255,255,255,0.8)'
            : '0 0 15px rgba(0,0,0,0.9)',
        }}
      >
        {info.subtitle}
      </div>
    </div>
  )
}
