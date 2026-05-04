import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { VariantProvider } from '../hooks/VariantProvider.jsx'
import { TimelineProvider } from '../hooks/TimelineProvider.jsx'
import { TourProvider } from '../hooks/TourProvider.jsx'
import { MeasureProvider } from '../hooks/MeasureProvider.jsx'
import { useLevaControls } from '../components/LevaControls'
import { useTour } from '../hooks/useTour.js'
import Scene from '../components/Scene'
import VariantSwitcher from '../components/VariantSwitcher'
import ScenePicker from '../components/ScenePicker'
import TimelineController from '../components/TimelineController'
import ConstructionToolbar from '../components/ConstructionToolbar'
import { GuidedTourOverlay } from '../components/GuidedTour.jsx'
import ExperiencePicker from '../components/proposals/ExperiencePicker.jsx'
import PlaceholderBanner from '../components/proposals/PlaceholderBanner.jsx'
import InstructionsOverlay from '../components/proposals/InstructionsOverlay.jsx'
import BrightnessControl from '../components/proposals/BrightnessControl.jsx'
import { experienceComponents } from '../components/proposals/experiences'

function Loader() {
  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
      <div className="text-white/30 text-xs uppercase tracking-widest">Loading...</div>
    </div>
  )
}

function ActiveExperience() {
  const { variantId } = useParams()
  const Experience = experienceComponents[variantId]
  return Experience ? <Experience /> : null
}

function FirefliesInner() {
  const { roomWidth, roomDepth, roomHeight, showGrid } = useLevaControls()
  const { active: tourActive } = useTour()
  const [activeCameraPreset, setActiveCameraPreset] = useState(null)
  const [uiHidden, setUiHidden] = useState(false)
  const [levaHidden, setLevaHidden] = useState(true)
  const [brightness, setBrightness] = useState(0.4)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'h' || e.key === 'H') setUiHidden((prev) => !prev)
      if (e.key === 'l' || e.key === 'L') setLevaHidden((prev) => !prev)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="relative h-screen w-screen bg-black">
      <Leva hidden={levaHidden} collapsed={false} />

      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{
            position: [0, 1.6, 2.5],
            fov: 65,
            near: 0.1,
            far: 100,
          }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          className="!absolute inset-0"
        >
          <Scene
            roomWidth={roomWidth}
            roomDepth={roomDepth}
            roomHeight={roomHeight}
            showGrid={showGrid}
            cameraPreset={activeCameraPreset}
          />
          <ActiveExperience />
          {brightness > 0 && (
            <ambientLight intensity={brightness} color="#ffffff" />
          )}
        </Canvas>
      </Suspense>

      {!uiHidden && !tourActive && (
        <>
          <VariantSwitcher />

          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            <ExperiencePicker />
            <ScenePicker onSelect={setActiveCameraPreset} />
          </div>

          <div className="fixed top-4 right-4 z-10 flex flex-col items-end gap-2">
            <BrightnessControl value={brightness} onChange={setBrightness} />
            <ConstructionToolbar />
          </div>

          <PlaceholderBanner />
          <InstructionsOverlay />
          <TimelineController />
        </>
      )}

      <GuidedTourOverlay />

      {uiHidden && (
        <div className="fixed bottom-4 right-4 z-10 text-[10px] text-white/10 pointer-events-none">
          Press H to show controls
        </div>
      )}
    </div>
  )
}

export default function FirefliesPage() {
  return (
    <VariantProvider>
      <TimelineProvider>
        <TourProvider>
          <MeasureProvider>
            <FirefliesInner />
          </MeasureProvider>
        </TourProvider>
      </TimelineProvider>
    </VariantProvider>
  )
}
