import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { useState, useEffect, useRef, Suspense } from 'react'
import { VariantProvider } from './hooks/useVariant.jsx'
import { TimelineProvider } from './hooks/useTimeline.jsx'
import { useLevaControls } from './components/LevaControls'
import Scene from './components/Scene'
import VariantSwitcher from './components/VariantSwitcher'
import TimelineController from './components/TimelineController'
import ConstructionToolbar from './components/ConstructionToolbar'
import PhaseOverlay from './components/PhaseOverlay'
import LandingPage from './components/LandingPage'

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

function AppInner() {
  const { roomWidth, roomDepth, roomHeight, showGrid, mountainOverrides } =
    useLevaControls()
  const [activeCameraPreset, setActiveCameraPreset] = useState(null)
  const [uiHidden, setUiHidden] = useState(false)
  const experienceRef = useRef(null)

  // C4: H key to toggle all UI
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'h' || e.key === 'H') {
        setUiHidden((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const scrollToExperience = () => {
    experienceRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="overflow-y-auto h-screen">
      <LandingPage onScrollToExperience={scrollToExperience} />

      {/* 3D experience section */}
      <div ref={experienceRef} className="relative h-screen sticky top-0">
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
              mountainOverrides={mountainOverrides}
              cameraPreset={activeCameraPreset}
            />
          </Canvas>
        </Suspense>

        {/* UI overlays — hidden with H key */}
        {!uiHidden && (
          <>
            <VariantSwitcher onCameraPreset={setActiveCameraPreset} />
            <TimelineController />
            <ConstructionToolbar />
            <SkipToFireflies />
          </>
        )}

        <PhaseOverlay />

        {/* H key hint */}
        {uiHidden && (
          <div className="fixed bottom-4 right-4 z-10 text-[10px] text-white/10 pointer-events-none">
            Press H to show controls
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [levaHidden, setLevaHidden] = useState(true)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'l' || e.key === 'L') {
        setLevaHidden((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <VariantProvider>
      <TimelineProvider>
        <Leva hidden={levaHidden} collapsed={false} />
        <AppInner />
      </TimelineProvider>
    </VariantProvider>
  )
}
