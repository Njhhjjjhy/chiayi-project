import { useState } from 'react'
import { useTimeline, PHASES, SPEEDS } from '../hooks/useTimeline.js'

const COLLAPSED_KEY = 'timeline.collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(value) {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0')
  } catch {
    // Storage unavailable — fine, just won't persist.
  }
}

export default function TimelineController() {
  const { time, setTime, playing, toggle, speed, setSpeed, jumpToPhase } = useTimeline()
  const [collapsed, setCollapsed] = useState(() => readCollapsed())

  const currentPhase = time < 0.25 ? 0 : time < 0.5 ? 1 : time < 0.75 ? 2 : 3

  function setCollapsedAndStore(value) {
    setCollapsed(value)
    writeCollapsed(value)
  }

  if (collapsed) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-10 flex justify-center pointer-events-none"
        role="region"
        aria-label="Timeline (collapsed)"
      >
        <button
          type="button"
          onClick={() => setCollapsedAndStore(false)}
          className="pointer-events-auto inline-flex min-h-[44px] items-center gap-3 rounded-t-lg bg-gray-900 px-5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-black focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          aria-label="Show timeline"
        >
          <span className="text-white/70 font-normal">{PHASES[currentPhase].label}</span>
          Show timeline ▴
        </button>
      </div>
    )
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 select-none"
      role="region"
      aria-label="Timeline controls"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        {/* Phase labels row */}
        <div className="flex mb-2 items-center gap-1">
          {PHASES.map((phase, i) => {
            const active = currentPhase === i
            return (
              <button
                key={phase.id}
                onClick={() => jumpToPhase(i)}
                aria-label={`Jump to ${phase.label}`}
                aria-pressed={active}
                className={`flex-1 inline-flex items-center justify-center min-h-[44px] text-sm transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${
                  active
                    ? 'text-gray-900 font-semibold bg-gray-100'
                    : 'text-gray-800 hover:text-gray-900 hover:bg-gray-50 font-medium'
                }`}
              >
                {phase.label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setCollapsedAndStore(true)}
            className="ml-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none"
            aria-label="Hide timeline"
            title="Hide timeline"
          >
            Hide ▾
          </button>
        </div>

        {/* Scrubber */}
        <div className="relative my-3">
          <div className="absolute top-0 left-0 right-0 h-full flex pointer-events-none">
            {[0.25, 0.5, 0.75].map((mark) => (
              <div
                key={mark}
                className="absolute top-0 bottom-0 w-px bg-gray-300"
                style={{ left: `${mark * 100}%` }}
              />
            ))}
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={time}
            onChange={(e) => setTime(parseFloat(e.target.value))}
            aria-label="Timeline position"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={time}
            aria-valuetext={PHASES[currentPhase].label}
            className="w-full h-2 appearance-none bg-gray-200 rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gray-900
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none"
            >
              {playing ? '⏸' : '▶'}
            </button>

            <div
              className="flex items-center gap-1 rounded-lg bg-gray-100 p-1"
              role="group"
              aria-label="Playback speed"
            >
              {Object.keys(SPEEDS).map((s) => {
                const active = speed === s
                return (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    aria-label={`${s} cycle`}
                    aria-pressed={active}
                    className={`inline-flex min-h-[36px] items-center justify-center rounded-md px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${
                      active
                        ? 'bg-white text-gray-900 font-semibold shadow-sm'
                        : 'text-gray-800 hover:text-gray-900 font-medium'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <span
            className="text-sm font-medium text-gray-900"
            aria-live="polite"
          >
            {PHASES[currentPhase].label}
          </span>
        </div>
      </div>
    </div>
  )
}
