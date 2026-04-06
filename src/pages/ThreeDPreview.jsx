import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { useState, useEffect, useRef, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { VariantProvider } from '../hooks/useVariant.jsx'
import { TimelineProvider } from '../hooks/useTimeline.jsx'
import { TourProvider } from '../hooks/useTour.jsx'
import { useLevaControls } from '../components/LevaControls'
import Scene from '../components/Scene'
import VariantSwitcher from '../components/VariantSwitcher'
import TimelineController from '../components/TimelineController'
import ConstructionToolbar from '../components/ConstructionToolbar'
import PhaseOverlay from '../components/PhaseOverlay'
import { GuidedTourOverlay } from '../components/GuidedTour.jsx'
import ViewModeLabel from '../components/ViewModeLabel.jsx'
import MeasureToolbar from '../components/MeasureToolbar.jsx'
import { useTour } from '../hooks/useTour.jsx'
import { MeasureProvider } from '../hooks/useMeasure.jsx'

function Loader() {
  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
      <div className="text-white/30 text-xs uppercase tracking-widest">Loading experience...</div>
    </div>
  )
}

function SkipToFireflies() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <button
      onClick={() => {
        window.dispatchEvent(new CustomEvent('skipToFireflies'))
        setVisible(false)
      }}
      className="fixed bottom-20 right-4 z-10 text-[10px] text-white/25 hover:text-white/50 cursor-pointer transition-colors border border-white/10 px-3 py-1.5 rounded hover:border-white/20 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
    >
      Skip to fireflies
    </button>
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

      {/* Back to site link */}
      <Link
        to="/"
        className="fixed top-4 right-4 z-20 text-[10px] text-white/25 hover:text-white/50 cursor-pointer transition-colors border border-white/10 px-3 py-1.5 rounded hover:border-white/20"
      >
        Back to site
      </Link>

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
          <VariantSwitcher onCameraPreset={setActiveCameraPreset} />
          <TimelineController />
          <ConstructionToolbar />
          <MeasureToolbar />
          <SkipToFireflies />
        </>
      )}

      <PhaseOverlay />
      <ViewModeLabel />
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
