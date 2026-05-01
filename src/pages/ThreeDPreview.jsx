import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { useState, useEffect, Suspense } from 'react'
import { VariantProvider } from '../hooks/VariantProvider.jsx'
import { TimelineProvider } from '../hooks/TimelineProvider.jsx'
import { TourProvider } from '../hooks/TourProvider.jsx'
import { useLevaControls } from '../components/LevaControls'
import Scene from '../components/Scene'
import VariantSwitcher from '../components/VariantSwitcher'
import ScenePicker from '../components/ScenePicker'
import TimelineController from '../components/TimelineController'
import ConstructionToolbar from '../components/ConstructionToolbar'
import { GuidedTourOverlay } from '../components/GuidedTour.jsx'
import { useTour } from '../hooks/useTour.js'
import { MeasureProvider } from '../hooks/MeasureProvider.jsx'

function Loader() {
  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
      <div className="text-white/30 text-xs uppercase tracking-widest">Loading experience...</div>
    </div>
  )
}

function PreviewInner() {
  const { roomWidth, roomDepth, roomHeight, showGrid } =
    useLevaControls()
  const { active: tourActive } = useTour()
  const [activeCameraPreset, setActiveCameraPreset] = useState(null)
  const [uiHidden, setUiHidden] = useState(false)
  const [levaHidden, setLevaHidden] = useState(true)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'h' || e.key === 'H') {
        setUiHidden((prev) => !prev)
      }
      if (e.key === 'l' || e.key === 'L') {
        setLevaHidden((prev) => !prev)
      }
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
        </Canvas>
      </Suspense>

      {/* UI overlays */}
      {!uiHidden && !tourActive && (
        <>
          <ScenePicker onSelect={setActiveCameraPreset} />
          <VariantSwitcher />
          <TimelineController />
          <ConstructionToolbar />
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

export default function ThreeDPreview() {
  return (
    <VariantProvider>
      <TimelineProvider>
        <TourProvider>
          <MeasureProvider>
            <PreviewInner />
          </MeasureProvider>
        </TourProvider>
      </TimelineProvider>
    </VariantProvider>
  )
}
