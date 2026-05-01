import { useCallback, useEffect, useRef, useState } from 'react'
import { useProposals } from '../../hooks/useProposals.js'
import { useVariant } from '../../hooks/useVariant.js'
import { useTimeline, PHASES } from '../../hooks/useTimeline.js'
import { fireflyVariantList } from '../../variants/fireflies.js'

// Side panel with the global review controls:
//   - Haze override slider (wired through HazePass)
//   - Firefly count slider (drives the setFireflyCountOverride → key-prop
//     remount path in ProposalsPage; committed on pointer-up + 200 ms idle
//     so drag doesn't continuously reset the firefly animation)
//   - Firefly mode switch — overrides the experience firefly variant for
//     the proposals page only (default 'motion', set on mount)
//   - Phase indicator — derived from timeline time

const COMMIT_IDLE_MS = 200

export default function ControlPanel() {
  const {
    hazeOverride, setHazeOverride,
    fireflyCount, setFireflyCount,
    showCurtain, setShowCurtain,
    showPathway, setShowPathway,
    showPathwayLeft, setShowPathwayLeft,
  } = useProposals()
  const { selections, selectVariant } = useVariant()
  const { time } = useTimeline()
  const currentFireflyId = selections.fireflies

  // Local mirror of the slider position. Updated on every onChange so the
  // visual thumb tracks the user's input without latency, but the provider
  // state (which triggers the FireflySystem remount) only updates on
  // pointer-up or after a 200 ms idle window — avoiding a full animation
  // reset on every intermediate tick during a drag.
  const [localCount, setLocalCount] = useState(fireflyCount)
  const idleTimerRef = useRef(null)

  const commit = useCallback((v) => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
    setFireflyCount(v)
  }, [setFireflyCount])

  const handleCountChange = useCallback((e) => {
    const v = parseInt(e.target.value, 10)
    setLocalCount(v)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => commit(v), COMMIT_IDLE_MS)
  }, [commit])

  const handleCountPointerUp = useCallback(() => {
    commit(localCount)
  }, [commit, localCount])

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  const currentPhase = PHASES.reduce(
    (acc, p) => (time >= p.start ? p : acc),
    PHASES[0],
  )

  return (
    <div className="fixed top-16 right-4 z-10 w-56 p-4 bg-black/40 border border-white/10 backdrop-blur-sm rounded space-y-4 text-[10px]">
      <div>
        <PanelLabel>Haze</PanelLabel>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={hazeOverride}
            onChange={(e) => setHazeOverride(parseFloat(e.target.value))}
            aria-label="Haze override"
            className="flex-1 accent-white/40"
          />
          <span className="w-10 text-right text-white/70">{hazeOverride.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <PanelLabel>Fireflies count</PanelLabel>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={500}
            max={3000}
            step={10}
            value={localCount}
            onChange={handleCountChange}
            onPointerUp={handleCountPointerUp}
            aria-label="Firefly count"
            className="flex-1 accent-white/40"
          />
          <span className="w-10 text-right text-white/70">{localCount}</span>
        </div>
      </div>

      <div>
        <PanelLabel>Firefly mode</PanelLabel>
        <select
          value={currentFireflyId}
          onChange={(e) => selectVariant('fireflies', e.target.value)}
          aria-label="Firefly mode"
          className="w-full bg-black/60 text-white/85 border border-white/15 rounded px-2 py-1"
        >
          {fireflyVariantList.map((v) => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      </div>

      <div>
        <PanelLabel>Phase</PanelLabel>
        <div className="text-white/70">{currentPhase.label}</div>
      </div>

      <div>
        <PanelLabel>Add-ons</PanelLabel>
        <label className="flex items-center gap-2 text-white/70 cursor-pointer">
          <input
            type="checkbox"
            checked={showCurtain}
            onChange={(e) => setShowCurtain(e.target.checked)}
            className="accent-white/40"
          />
          {' '}Blackout curtain
        </label>
        <label className="flex items-center gap-2 text-white/70 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={showPathway}
            onChange={(e) => setShowPathway(e.target.checked)}
            className="accent-white/40"
          />
          {' '}Entry pathway (right)
        </label>
        <label className="flex items-center gap-2 text-white/70 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={showPathwayLeft}
            onChange={(e) => setShowPathwayLeft(e.target.checked)}
            className="accent-white/40"
          />
          {' '}Entry pathway (left)
        </label>
      </div>
    </div>
  )
}

function PanelLabel({ children }) {
  return (
    <div className="text-[9px] uppercase tracking-widest text-white/40 mb-1">
      {children}
    </div>
  )
}
