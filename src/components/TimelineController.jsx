import { useTimeline, PHASES, SPEEDS } from '../hooks/useTimeline.js'

export default function TimelineController() {
  const { time, setTime, playing, toggle, speed, setSpeed, jumpToPhase } = useTimeline()

  const currentPhase = time < 0.25 ? 0 : time < 0.5 ? 1 : time < 0.75 ? 2 : 3

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 select-none"
      role="region"
      aria-label="Timeline controls"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
        {/* Phase labels */}
        <div className="flex mb-2">
          {PHASES.map((phase, i) => (
            <button
              key={phase.id}
              onClick={() => jumpToPhase(i)}
              className={`flex-1 text-center text-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none rounded py-1 ${
                currentPhase === i
                  ? 'text-black font-medium'
                  : 'text-gray-500 hover:text-black'
              }`}
              aria-label={`Jump to ${phase.label}`}
            >
              {phase.label}
            </button>
          ))}
        </div>

        {/* Scrubber */}
        <div className="relative mb-2">
          {/* Phase markers */}
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
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/pause */}
            <button
              onClick={toggle}
              className="text-black hover:text-gray-700 text-sm cursor-pointer w-6 text-center focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none rounded"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? '||' : '▶'}
            </button>

            {/* Speed */}
            <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
              {Object.keys(SPEEDS).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`text-sm px-2 py-0.5 rounded cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${
                    speed === s
                      ? 'bg-black text-white'
                      : 'text-gray-500 hover:text-black hover:bg-gray-100'
                  }`}
                  aria-label={`${s} cycle`}
                  aria-pressed={speed === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Current phase */}
          <span className="text-sm text-gray-500" aria-live="polite">
            {PHASES[currentPhase].label}
          </span>
        </div>
      </div>
    </div>
  )
}
