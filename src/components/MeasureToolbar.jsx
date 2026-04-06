import { useMeasure } from '../hooks/useMeasure.jsx'

export default function MeasureToolbar() {
  const { measureMode, toggleMeasure, measurements, removeMeasurement, clearMeasurements, pendingPoint } = useMeasure()

  return (
    <div
      className="fixed bottom-16 left-4 z-10 select-none"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden w-44">
        {/* Ruler toggle */}
        <button
          onClick={toggleMeasure}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
            measureMode
              ? 'bg-red-900/40 text-red-300'
              : 'text-white/50 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          <span>{measureMode ? 'Measuring...' : 'Ruler'}</span>
          <span className="text-[10px]">{measureMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Hint when measuring */}
        {measureMode && (
          <div className="px-3 py-1.5 text-[9px] text-white/30 border-t border-white/5">
            {pendingPoint ? 'Click second point' : 'Click first point'}
          </div>
        )}

        {/* Measurement list */}
        {measurements.length > 0 && (
          <div className="border-t border-white/10">
            <div className="px-3 py-1.5 flex items-center justify-between">
              <span className="text-[9px] text-white/30 uppercase tracking-wider">
                Measurements ({measurements.length})
              </span>
              <button
                onClick={clearMeasurements}
                className="text-[9px] text-white/20 hover:text-white/50 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="px-2 pb-2 space-y-0.5 max-h-32 overflow-y-auto">
              {measurements.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-1.5 py-1 rounded bg-white/5">
                  <span className="text-[10px] text-red-300/80 font-mono">
                    {m.distance.toFixed(2)}m
                  </span>
                  <button
                    onClick={() => removeMeasurement(m.id)}
                    className="text-[10px] text-white/20 hover:text-white/50 cursor-pointer px-1"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
