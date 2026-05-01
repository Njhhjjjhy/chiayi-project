import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTour } from '../hooks/useTour.js'
import { useTimeline } from '../hooks/useTimeline.js'
import { useVariant } from '../hooks/useVariant.js'

// 3D camera controller — runs inside Canvas (must be child of Scene)
export function GuidedTourCamera({ controlsRef }) {
  const { active, step, currentStep, setStepProgress, advanceStep } = useTour()
  const { setTime, pause } = useTimeline()
  const { setViewMode } = useVariant()
  const elapsedRef = useRef(0)
  const targetRef = useRef({ pos: [0, 1.6, 3], tgt: [0, 1.6, -2] })

  // On step change, apply step settings
  useEffect(() => {
    if (!active || !step) return

    setViewMode(step.viewMode)
    setTime(step.timeline)
    pause()

    targetRef.current = {
      pos: [...step.camera.position],
      tgt: [...step.camera.target],
    }

    elapsedRef.current = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-apply on step change; setters and `step` are derived from currentStep
  }, [active, currentStep])

  useFrame((_, delta) => {
    if (!active || !step || !controlsRef?.current) return

    elapsedRef.current += delta
    const controls = controlsRef.current
    const t = targetRef.current

    // Smooth exponential lerp
    const lerpFactor = 1 - Math.pow(0.05, delta)

    // Lerp camera position
    controls.object.position.x += (t.pos[0] - controls.object.position.x) * lerpFactor
    controls.object.position.y += (t.pos[1] - controls.object.position.y) * lerpFactor
    controls.object.position.z += (t.pos[2] - controls.object.position.z) * lerpFactor

    // Lerp orbit target
    controls.target.x += (t.tgt[0] - controls.target.x) * lerpFactor
    controls.target.y += (t.tgt[1] - controls.target.y) * lerpFactor
    controls.target.z += (t.tgt[2] - controls.target.z) * lerpFactor
    controls.update()

    // Slow orbit effect on certain steps
    if (step.orbit) {
      const angle = elapsedRef.current * 0.08
      const r = 0.5
      t.pos[0] = step.camera.position[0] + Math.sin(angle) * r
      t.pos[2] = step.camera.position[2] + Math.cos(angle) * r * 0.3
    }

    // Update progress
    setStepProgress(Math.min(1, elapsedRef.current / step.duration))

    // Advance when duration expires
    if (elapsedRef.current >= step.duration) {
      advanceStep()
    }
  })

  return null
}

// HTML overlay — captions, progress bar, exit button (renders outside Canvas)
export function GuidedTourOverlay() {
  const { active, currentStep, totalSteps, stopTour, step } = useTour()
  const { setViewMode } = useVariant()
  const { pause } = useTimeline()
  const [opacity, setOpacity] = useState(0)
  const fadeRef = useRef(null)

  useEffect(() => {
    if (!active) return
    if (fadeRef.current) clearTimeout(fadeRef.current)
    // Reset to 0, then fade to 1 on next tick — decoupled from render via timeout.
    const reset = setTimeout(() => setOpacity(0), 0)
    fadeRef.current = setTimeout(() => setOpacity(1), 200)
    return () => {
      clearTimeout(reset)
      if (fadeRef.current) clearTimeout(fadeRef.current)
    }
  }, [active, currentStep])

  const handleStop = () => {
    const prev = stopTour()
    if (prev) {
      setViewMode(prev.viewMode)
    }
    pause()
  }

  if (!active) return null

  const progress = (currentStep / (totalSteps - 1)) * 100

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* Caption */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-opacity duration-1000"
        style={{ opacity }}
      >
        {step.isEndCard ? (
          <>
            <div
              className="text-white/80 text-2xl md:text-4xl font-light tracking-wide mb-3"
              style={{ textShadow: '0 0 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.7)' }}
            >
              {step.title}
            </div>
            <div
              className="text-white/40 text-xs md:text-sm tracking-widest uppercase"
              style={{ textShadow: '0 0 20px rgba(0,0,0,0.9)' }}
            >
              {step.caption}
            </div>
          </>
        ) : (
          <>
            <div
              className="text-white/70 text-lg font-light tracking-widest uppercase mb-2"
              style={{ textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)' }}
            >
              {step.title}
            </div>
            <div
              className="text-white/40 text-xs md:text-sm tracking-wide max-w-md mx-auto"
              style={{ textShadow: '0 0 15px rgba(0,0,0,0.9)' }}
            >
              {step.caption}
            </div>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48">
        <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center mt-2 text-[9px] text-white/20 uppercase tracking-widest">
          {currentStep + 1} / {totalSteps}
        </div>
      </div>

      {/* Exit button */}
      <button
        onClick={handleStop}
        className="absolute top-4 right-4 pointer-events-auto text-[10px] text-white/30 hover:text-white/60 cursor-pointer transition-colors border border-white/10 px-3 py-1.5 rounded hover:border-white/20"
      >
        Exit tour
      </button>
    </div>
  )
}
