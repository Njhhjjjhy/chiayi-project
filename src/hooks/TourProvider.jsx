import { useState, useCallback, useRef } from 'react'
import { TourContext, TOUR_STEPS } from './useTour.js'

export function TourProvider({ children }) {
  const [active, setActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const prevStateRef = useRef(null) // stores state to restore when tour ends

  const startTour = useCallback((saveState) => {
    prevStateRef.current = saveState
    setCurrentStep(0)
    setStepProgress(0)
    setActive(true)
  }, [])

  const stopTour = useCallback(() => {
    setActive(false)
    setCurrentStep(0)
    setStepProgress(0)
    const prev = prevStateRef.current
    prevStateRef.current = null
    return prev // caller can restore previous state
  }, [])

  const advanceStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= TOUR_STEPS.length - 1) {
        setActive(false)
        return 0
      }
      return prev + 1
    })
    setStepProgress(0)
  }, [])

  return (
    <TourContext.Provider
      value={{
        active,
        currentStep,
        stepProgress,
        setStepProgress,
        totalSteps: TOUR_STEPS.length,
        startTour,
        stopTour,
        advanceStep,
        step: TOUR_STEPS[currentStep],
      }}
    >
      {children}
    </TourContext.Provider>
  )
}
