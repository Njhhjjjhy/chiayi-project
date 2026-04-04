import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { useState, useEffect } from 'react'
import { VariantProvider } from './hooks/useVariant.jsx'
import { useLevaControls } from './components/LevaControls'
import Scene from './components/Scene'
import VariantSwitcher from './components/VariantSwitcher'

function AppInner() {
  const { roomWidth, roomDepth, roomHeight, showGrid, cameraPreset } =
    useLevaControls()

  return (
    <>
      <Canvas
        camera={{
          position: cameraPreset,
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
        />
      </Canvas>
      <VariantSwitcher />
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
      <Leva hidden={levaHidden} collapsed={false} />
      <div className="w-screen h-screen relative">
        <AppInner />
      </div>
    </VariantProvider>
  )
}
