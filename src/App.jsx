import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { useState, useEffect } from 'react'
import { VariantProvider } from './hooks/useVariant.jsx'
import { TimelineProvider } from './hooks/useTimeline.jsx'
import { useLevaControls } from './components/LevaControls'
import Scene from './components/Scene'
import VariantSwitcher from './components/VariantSwitcher'
import TimelineController from './components/TimelineController'

function AppInner() {
  const { roomWidth, roomDepth, roomHeight, showGrid, mountainOverrides } =
    useLevaControls()
  const [activeCameraPreset, setActiveCameraPreset] = useState(null)

  return (
    <>
      <Canvas
        camera={{
          position: [0, 1.6, 3],
          fov: 60,
          near: 0.1,
          far: 100,
        }}
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
