import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { useState, useEffect, useCallback } from 'react'
import { VariantProvider } from './hooks/useVariant.jsx'
import { TimelineProvider } from './hooks/useTimeline.jsx'
import { useLevaControls } from './components/LevaControls'
import Scene from './components/Scene'
import VariantSwitcher from './components/VariantSwitcher'
import TimelineController from './components/TimelineController'
import ConstructionToolbar from './components/ConstructionToolbar'
import IntroScreen from './components/IntroScreen'
import PhaseOverlay from './components/PhaseOverlay'

function AppInner() {
  const { roomWidth, roomDepth, roomHeight, showGrid, mountainOverrides } =
    useLevaControls()
  const [activeCameraPreset, setActiveCameraPreset] = useState(null)
  const [entered, setEntered] = useState(false)

  const handleEnter = useCallback(() => setEntered(true), [])

  return (
    <>
      <IntroScreen onEnter={handleEnter} />
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
      {entered && (
        <>
          <VariantSwitcher onCameraPreset={setActiveCameraPreset} />
          <TimelineController />
          <ConstructionToolbar />
          <PhaseOverlay />
        </>
      )}
    </>
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
        <div className="w-screen h-screen relative">
          <AppInner />
        </div>
      </TimelineProvider>
    </VariantProvider>
  )
}
