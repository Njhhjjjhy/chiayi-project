import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'
import { useLightingState } from '../hooks/useLightingState.jsx'
import Room from './Room'
import MountainWall from './MountainWall'
import SkyBackdrop from './SkyBackdrop'
import FireflySystem from './fireflies/FireflySystem.jsx'
import DimensionLabels from './DimensionLabels.jsx'

export default function Scene({ roomWidth = 10, roomDepth = 10, roomHeight = 3.5, showGrid = true, mountainOverrides = {}, cameraPreset }) {
  const controlsRef = useRef()
  const { viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'
  const lighting = useLightingState()
  const { camera, scene } = useThree()

  const maxOrbitRadius = Math.min(roomWidth, roomDepth) / 2 - 0.5

  // Construction mode: light background. Experience: black.
  useEffect(() => {
    scene.background = new THREE.Color(isConstruction ? '#e8e8e8' : '#000000')
  }, [isConstruction, scene])

  // Apply camera preset
  useEffect(() => {
    if (cameraPreset && controlsRef.current) {
      camera.position.set(...cameraPreset.position)
      controlsRef.current.target.set(...cameraPreset.target)
      controlsRef.current.update()
    }
  }, [cameraPreset, camera])

  return (
    <>
      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        target={[0, 1.6, -2]}
        maxDistance={isConstruction ? 15 : maxOrbitRadius}
        minDistance={0.5}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.1}
        enablePan={true}
        panSpeed={0.5}
        rotateSpeed={0.5}
      />

      {/* Lighting */}
      {isConstruction ? (
        <>
          <ambientLight intensity={1.2} color="#ffffff" />
          <directionalLight position={[5, 10, 5]} intensity={0.5} />
        </>
      ) : (
        <>
          <ambientLight color={lighting.ambientColor} intensity={lighting.ambientIntensity} />
          <pointLight position={[0, roomHeight - 0.5, 0]} color={lighting.ambientColor} intensity={lighting.ambientIntensity * 0.8} />
        </>
      )}

      {/* Floor grid */}
      {(isConstruction || showGrid) && (
        <Grid
          position={[0, 0.001, 0]}
          args={[roomWidth, roomDepth]}
          cellSize={1}
          cellThickness={isConstruction ? 1 : 0.5}
          cellColor={isConstruction ? '#999' : '#333'}
          sectionSize={5}
          sectionThickness={isConstruction ? 2 : 1}
          sectionColor={isConstruction ? '#666' : '#555'}
          fadeDistance={25}
          infiniteGrid={false}
        />
      )}

      {/* Sky backdrop behind mountain wall */}
      <SkyBackdrop />

      {/* Room shell */}
      <Room width={roomWidth} depth={roomDepth} height={roomHeight} />

      {/* Mountain wall */}
      <MountainWall overrides={mountainOverrides} />

      {/* Fireflies */}
      <FireflySystem />

      {/* Dimension labels and material annotations — construction mode only */}
      {isConstruction && (
        <DimensionLabels
          roomWidth={roomWidth}
          roomDepth={roomDepth}
          roomHeight={roomHeight}
          mountainOverrides={mountainOverrides}
        />
      )}
    </>
  )
}
