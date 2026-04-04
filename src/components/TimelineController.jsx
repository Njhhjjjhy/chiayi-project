import { useTimeline, PHASES, SPEEDS } from '../hooks/useTimeline.jsx'

export default function TimelineController() {
  const { time, setTime, playing, toggle, speed, setSpeed, jumpToPhase } = useTimeline()

  const currentPhase = time < 0.25 ? 0 : time < 0.5 ? 1 : time < 0.75 ? 2 : 3

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 select-none">
      <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-3">
        {/* Phase labels */}
        <div className="flex mb-2">
          {PHASES.map((phase, i) => (
            <button
              key={phase.id}
              onClick={() => jumpToPhase(i)}
              className={`flex-1 text-center text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                currentPhase === i
                  ? 'text-white/80'
                  : 'text-white/25 hover:text-white/40'
              }`}
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
            className="w-full h-1.5 appearance-none bg-white/10 rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white/80
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/pause */}
            <button
              onClick={toggle}
              className="text-white/60 hover:text-white text-sm cursor-pointer w-6 text-center"
            >
              {playing ? '||' : '\u25B6'}
            </button>

            {/* Speed */}
            <div className="flex items-center gap-1">
              {Object.keys(SPEEDS).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    speed === s
                      ? 'bg-white/15 text-white/80'
                      : 'text-white/25 hover:text-white/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Current phase */}
          <span className="text-[10px] text-white/30 uppercase tracking-wider">
            {PHASES[currentPhase].label}
          </span>
        </div>
      </div>
    </div>
  )
}
