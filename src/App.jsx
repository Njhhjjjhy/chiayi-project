import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { useState, useEffect, useCallback, useRef } from 'react'
import { VariantProvider } from './hooks/useVariant.jsx'
import { TimelineProvider } from './hooks/useTimeline.jsx'
import { useLevaControls } from './components/LevaControls'
import Scene from './components/Scene'
import VariantSwitcher from './components/VariantSwitcher'
import TimelineController from './components/TimelineController'
import ConstructionToolbar from './components/ConstructionToolbar'
import PhaseOverlay from './components/PhaseOverlay'
import LandingPage from './components/LandingPage'

function AppInner() {
  const { roomWidth, roomDepth, roomHeight, showGrid, mountainOverrides } =
    useLevaControls()
  const [activeCameraPreset, setActiveCameraPreset] = useState(null)
  const experienceRef = useRef(null)

  const scrollToExperience = useCallback(() => {
    experienceRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="overflow-y-auto h-screen">
      <LandingPage onScrollToExperience={scrollToExperience} />

      {/* 3D experience section */}
      <div ref={experienceRef} className="relative h-screen sticky top-0">
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
        <VariantSwitcher onCameraPreset={setActiveCameraPreset} />
        <TimelineController />
        <ConstructionToolbar />
        <PhaseOverlay />
        <SkipToFireflies />
      </div>
    </div>
  )
}

function SkipToFireflies() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <button
      onClick={() => {
        // Dispatch a custom event that TimelineController can listen for
        window.dispatchEvent(new CustomEvent('skipToFireflies'))
        setVisible(false)
      }}
      className="fixed bottom-20 right-4 z-10 text-[10px] text-white/25 hover:text-white/50 cursor-pointer transition-colors border border-white/10 px-3 py-1.5 rounded hover:border-white/20"
    >
      Skip to fireflies
    </button>
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
