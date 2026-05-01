import { useEffect } from 'react'
import { useTimeline, PHASES } from '../../hooks/useTimeline.js'

// Scrubber + play/pause reading TimelineProvider. No auto-loop.
// Space hotkey toggles play/pause when focus is not on an input,
// select, textarea, or button (the button already handles its own
// space via native activation).

export default function TimeScrubber() {
  const { time, setTime, playing, toggle } = useTimeline()

  useEffect(() => {
    function handleKey(e) {
      if (e.code !== 'Space') return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'BUTTON') return
      e.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [toggle])

  // Current phase: the latest phase whose start is ≤ time.
  const currentPhase = PHASES.reduce(
    (acc, p) => (time >= p.start ? p : acc),
    PHASES[0],
  )

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 backdrop-blur-sm rounded w-[420px]">
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause timeline' : 'Play timeline'}
        className="text-[12px] text-white/70 hover:text-white/95 w-5 text-center cursor-pointer"
      >
        {playing ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={time}
        onChange={(e) => setTime(parseFloat(e.target.value))}
        aria-label="Timeline position"
        className="flex-1 accent-white/40"
      />
      <span className="text-[10px] uppercase tracking-widest text-white/50 w-20 text-right">
        {currentPhase.label}
      </span>
    </div>
  )
}
