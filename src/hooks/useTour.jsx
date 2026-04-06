import { createContext, useContext, useState, useCallback, useRef } from 'react'

const TourContext = createContext(null)

// Tour step definitions — the narrative sequence
export const TOUR_STEPS = [
  {
    id: 'room',
    viewMode: 'light',
    camera: { position: [4, 2.5, 4], target: [0, 1.2, -1] },
    timeline: 0,
    title: 'The Room',
    caption: 'A 10-metre space in Alishan, Taiwan. Benches face a layered mountain wall.',
    duration: 10,
    showSeating: true,
  },
  {
    id: 'transition',
    viewMode: 'experience',
    camera: { position: [0, 1.1, 3], target: [0, 1.4, -2] },
    timeline: 0.02,
    title: 'The Show Begins',
    caption: 'House lights dim. The compressed sunset starts.',
    duration: 5,
    showSeating: true,
  },
  {
    id: 'golden',
    viewMode: 'experience',
    camera: { position: [1.5, 1.6, 2.5], target: [0, 1.6, -3] },
    timeline: 0.1,
    title: 'Golden Hour',
    caption: 'Warm amber light washes across layered mountain silhouettes.',
    duration: 15,
    orbit: true,
  },
  {
    id: 'twilight',
    viewMode: 'experience',
    camera: { position: [-1, 1.6, 2], target: [0, 1.5, -3] },
    timeline: 0.35,
    title: 'Twilight',
    caption: 'Color deepens as the sun slips below the horizon.',
    duration: 15,
  },
  {
    id: 'blue',
    viewMode: 'experience',
    camera: { position: [0, 1.6, 1.5], target: [0, 1.6, -4] },
    timeline: 0.6,
    title: 'Blue Hour',
    caption: 'The last traces of light dissolve into indigo.',
    duration: 15,
  },
  {
    id: 'darkness',
    viewMode: 'experience',
    camera: { position: [0, 1.3, 2], target: [0, 1.5, -2] },
    timeline: 0.85,
    title: 'Darkness',
    caption: 'Stillness. Then — emergence.',
    duration: 10,
  },
  {
    id: 'fireflies',
    viewMode: 'experience',
    camera: { position: [0, 2.2, 1], target: [0, 2.0, -2] },
    timeline: 0.95,
    title: 'The Fireflies',
    caption: 'Hundreds of warm points of light appear above, around, and through the space.',
    duration: 20,
    orbit: true,
  },
  {
    id: 'end',
    viewMode: 'experience',
    camera: { position: [0, 1.6, 2.5], target: [0, 1.6, -2] },
    timeline: 0.98,
    title: 'Firefly Immersive Experience',
    caption: 'Alishan, Chiayi County, Taiwan',
    duration: 8,
    isEndCard: true,
  },
]

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

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}
