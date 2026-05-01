import { useState } from 'react'
import { useTimeline, PHASES, SPEEDS } from '../hooks/useTimeline.js'
import Glass, { EASE_OUT, PlayGlyph, PauseGlyph } from './Glass'

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
    // Storage unavailable.
  }
}

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
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
        <Glass
          as="button"
          type="button"
          onClick={() => setCollapsedAndStore(false)}
          aria-label="Show timeline"
          style={TRANSITION}
          className="pointer-events-auto inline-flex min-h-[44px] items-center gap-3 rounded-t-2xl px-5 cursor-pointer hover:bg-black/55 transition-colors"
        >
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#a1a1a6]">
            {PHASES[currentPhase].label}
          </span>
          <span className="text-[15px]">Show timeline</span>
        </Glass>
      </div>
    )
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 select-none p-3"
      role="region"
      aria-label="Timeline controls"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <Glass className="rounded-2xl px-3 py-3">
        {/* Phase labels */}
        <div className="flex items-center gap-1 mb-2">
          {PHASES.map((phase, i) => {
            const active = currentPhase === i
            return (
              <button
                key={phase.id}
                onClick={() => jumpToPhase(i)}
                aria-label={`Jump to ${phase.label}`}
                aria-pressed={active}
                style={TRANSITION}
                className={`flex-1 inline-flex items-center justify-center min-h-[44px] rounded-full text-[12px] uppercase tracking-[0.08em] cursor-pointer transition-colors ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/65 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {phase.label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setCollapsedAndStore(true)}
            aria-label="Hide timeline"
            style={TRANSITION}
            className="ml-1 inline-flex min-h-[44px] items-center px-4 rounded-full text-[15px] text-white/85 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            Hide
          </button>
        </div>

        {/* Scrubber */}
        <div className="relative my-3">
          <div className="absolute top-0 left-0 right-0 h-full flex pointer-events-none">
            {[0.25, 0.5, 0.75].map((mark) => (
              <div
                key={mark}
                className="absolute top-0 bottom-0 w-px bg-white/15"
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
            className="w-full h-1.5 appearance-none bg-white/15 rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              style={TRANSITION}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors cursor-pointer"
            >
              {playing ? <PauseGlyph size={14} /> : <PlayGlyph size={14} />}
            </button>

            <div
              className="flex items-center gap-0.5 rounded-full p-0.5 border border-white/15"
              role="group"
              aria-label="Playback speed"
            >
              {Object.keys(SPEEDS).map((s) => {
                const active = speed === s
                return (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    aria-label={`Speed ${s}`}
                    aria-pressed={active}
                    style={TRANSITION}
                    className={`inline-flex min-h-[40px] min-w-[44px] items-center justify-center rounded-full px-3 text-[13px] cursor-pointer transition-colors ${
                      active
                        ? 'bg-white/15 text-white'
                        : 'text-white/65 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <span
            className="text-[12px] uppercase tracking-[0.08em] text-[#a1a1a6]"
            aria-live="polite"
          >
            {PHASES[currentPhase].label}
          </span>
        </div>
      </Glass>
    </div>
  )
}
