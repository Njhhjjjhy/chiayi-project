import { useRef, useEffect, Suspense } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'
import { useLightingState } from '../hooks/useLightingState.jsx'
import Room from './Room'
import MountainWall from './MountainWall'
import SkyBackdrop from './SkyBackdrop'
import FireflySystem from './fireflies/FireflySystem.jsx'
import DimensionLabels from './DimensionLabels.jsx'

function CameraBreathing() {
  const { camera } = useThree()
  const baseY = useRef(camera.position.y)

  useEffect(() => {
    baseY.current = camera.position.y
  }, [camera.position.y])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Subtle breathing sway
    camera.position.y = baseY.current + Math.sin(t * 0.3) * 0.015
    camera.rotation.z = Math.sin(t * 0.2) * 0.002
  })

  return null
}

function CameraBoundsEnforcer({ roomWidth, roomDepth, roomHeight }) {
  const { camera } = useThree()
  const halfW = roomWidth / 2 - 0.3
  const halfD = roomDepth / 2 - 0.3

  useFrame(() => {
    camera.position.x = Math.max(-halfW, Math.min(halfW, camera.position.x))
    camera.position.z = Math.max(-halfD, Math.min(halfD, camera.position.z))
    camera.position.y = Math.max(0.3, Math.min(roomHeight - 0.2, camera.position.y))
  })

  return null
}

export default function Scene({ roomWidth = 10, roomDepth = 10, roomHeight = 3.5, showGrid = true, mountainOverrides = {}, cameraPreset }) {
  const controlsRef = useRef()
  const { viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'
  const lighting = useLightingState()
  const { camera, scene, gl } = useThree()

  const maxOrbitRadius = Math.min(roomWidth, roomDepth) / 2 - 0.5

  // H5: Tone mapping
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.9
  }, [gl])

  // Construction mode: light background. Experience: black.
  useEffect(() => {
    scene.background = new THREE.Color(isConstruction ? '#e8e8e8' : '#000000')
  }, [isConstruction, scene])

  // C2: Fog — driven by timeline in experience mode
  useEffect(() => {
    if (isConstruction) {
      scene.fog = null
    } else {
      scene.fog = new THREE.FogExp2(lighting.ambientColor, 0.04)
    }
  }, [isConstruction, lighting.ambientColor, scene])

  // Apply camera preset
  useEffect(() => {
    if (cameraPreset && controlsRef.current) {
      camera.position.set(...cameraPreset.position)
      controlsRef.current.target.set(...cameraPreset.target)
      controlsRef.current.update()
    }
  }, [cameraPreset, camera])

  // H1: Enable shadow maps
  useEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
  }, [gl])

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
        enableDamping
        dampingFactor={0.05}
      />

      {/* M2: Camera bounds enforcement in experience mode */}
      {!isConstruction && (
        <CameraBoundsEnforcer roomWidth={roomWidth} roomDepth={roomDepth} roomHeight={roomHeight} />
      )}

      {/* Subtle camera breathing in experience mode */}
      {!isConstruction && <CameraBreathing />}

      {/* Lighting */}
      {isConstruction ? (
        <>
          <ambientLight intensity={1.2} color="#ffffff" />
          <directionalLight position={[5, 10, 5]} intensity={0.5} />
        </>
      ) : (
        <>
          <ambientLight color={lighting.ambientColor} intensity={lighting.ambientIntensity} />
          <pointLight
            position={[0, roomHeight - 0.5, 0]}
            color={lighting.ambientColor}
            intensity={lighting.ambientIntensity * 0.8}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
        </>
      )}

      {/* C3: Grid only in construction mode, or when explicitly toggled */}
      {isConstruction && (
        <Grid
          position={[0, 0.001, 0]}
          args={[roomWidth, roomDepth]}
          cellSize={1}
          cellThickness={1}
          cellColor="#999"
          sectionSize={5}
          sectionThickness={2}
          sectionColor="#666"
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

      {/* C1: Bloom post-processing for firefly glow */}
      {!isConstruction && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.5}
            mipmapBlur
          />
        </EffectComposer>
      )}

      {/* Dimension labels — construction mode only */}
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
