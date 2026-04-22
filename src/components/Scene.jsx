import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.js'
import { useLightingState } from '../hooks/useLightingState.jsx'
import { ROOM } from '../geometry/dimensions.js'
import Room from './Room'
import WallCoveringSystem from './wallCoverings/WallCoveringSystem.jsx'
import FireflySystem from './fireflies/FireflySystem.jsx'
import DimensionLabels from './DimensionLabels.jsx'
import Seating from './Seating.jsx'
import { GuidedTourCamera } from './GuidedTour.jsx'
import { useTour } from '../hooks/useTour.js'
import MeasureTool from './MeasureTool.jsx'
import RoomLabels from './RoomLabels.jsx'

function CameraBreathing({ controlsRef }) {
  useFrame(({ clock }) => {
    if (!controlsRef?.current) return
    const t = clock.getElapsedTime()
    // Subtle breathing via orbit target offset — doesn't fight OrbitControls
    const target = controlsRef.current.target
    target.y = 1.6 + Math.sin(t * 0.3) * 0.01
  })

  return null
}

function CameraBoundsEnforcer({ roomWidth, roomDepth, roomHeight }) {
  const { camera } = useThree()
  const halfW = roomWidth / 2 - 0.3
  const halfD = roomDepth / 2 - 0.3

  useFrame(() => {
    // eslint-disable-next-line react-hooks/immutability -- @react-three/fiber pattern: per-frame camera constraint needs direct property write
    camera.position.x = Math.max(-halfW, Math.min(halfW, camera.position.x))
    camera.position.z = Math.max(-halfD, Math.min(halfD, camera.position.z))
    camera.position.y = Math.max(0.3, Math.min(roomHeight - 0.2, camera.position.y))
  })

  return null
}

// gl + shadow-map setup. These are imperative Three.js configurations that
// can't be expressed declaratively inside <Canvas>. They run once, so the
// strict-mode immutability rule is suppressed here with intent.
function RendererSetup({ isConstruction, isLight }) {
  const { gl } = useThree()

  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
    /* eslint-enable react-hooks/immutability */
  }, [gl])

  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    if (isConstruction) {
      gl.toneMapping = THREE.NoToneMapping
      gl.toneMappingExposure = 1.0
    } else if (isLight) {
      gl.toneMapping = THREE.LinearToneMapping
      gl.toneMappingExposure = 1.2
    } else {
      gl.toneMapping = THREE.ACESFilmicToneMapping
      gl.toneMappingExposure = 0.9
    }
    /* eslint-enable react-hooks/immutability */
  }, [gl, isConstruction, isLight])

  return null
}

export default function Scene({ roomWidth = ROOM.W, roomDepth = ROOM.D, roomHeight = ROOM.H, cameraPreset }) {
  const controlsRef = useRef()
  const { isConstruction, isLight, isExperience, showSeating } = useVariant()
  const { active: tourActive } = useTour()
  const lighting = useLightingState()
  const { camera } = useThree()

  const maxOrbitRadius = Math.min(roomWidth, roomDepth) / 2 - 0.5

  const bg = isConstruction ? '#e8e8e8' : isLight ? '#f5f2ed' : '#000000'

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
      {/* Renderer setup — tone mapping + shadows */}
      <RendererSetup isConstruction={isConstruction} isLight={isLight} />

      {/* Scene background (declarative — replaces scene.background mutation) */}
      <color attach="background" args={[bg]} />

      {/* Fog — only in experience mode */}
      {isExperience && <fogExp2 attach="fog" args={['#000000', 0.08]} />}

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        target={[0, 1.6, -2]}
        maxDistance={isConstruction ? 15 : maxOrbitRadius}
        minDistance={0.5}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.1}
        enablePan={!tourActive}
        enableRotate={!tourActive}
        enableZoom={!tourActive}
        panSpeed={0.5}
        rotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Guided tour camera controller */}
      {tourActive && <GuidedTourCamera controlsRef={controlsRef} />}

      {/* M2: Camera bounds enforcement in experience/light mode */}
      {!isConstruction && (
        <CameraBoundsEnforcer roomWidth={roomWidth} roomDepth={roomDepth} roomHeight={roomHeight} />
      )}

      {/* Subtle camera breathing in experience mode only (disabled during tour) */}
      {isExperience && !tourActive && <CameraBreathing controlsRef={controlsRef} />}

      {/* Lighting */}
      {isConstruction ? (
        <>
          <ambientLight intensity={2.0} color="#ffffff" />
          <directionalLight position={[5, 10, 5]} intensity={1.0} />
          <directionalLight position={[-5, 8, -3]} intensity={0.5} />
        </>
      ) : isLight ? (
        <>
          <ambientLight intensity={1.2} color="#fff8f0" />
          <directionalLight
            position={[2, roomHeight + 2, 4]}
            intensity={2.5}
            color="#fff8e7"
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <directionalLight
            position={[-3, roomHeight, -2]}
            intensity={0.8}
            color="#e8e0d8"
          />
        </>
      ) : (
        <>
          <ambientLight color={lighting.ambientColor} intensity={lighting.ambientIntensity} />

          {/* Moonlight directional — faint, during blue hour and darkness */}
          {lighting.phaseIndex >= 1 && (
            <directionalLight
              position={[2, 10, -2]}
              target-position={[0, 0, 0]}
              color="#2a2a40"
              intensity={0.02}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-bias={-0.001}
              shadow-radius={8}
            />
          )}
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

      {/* Room shell */}
      <Room width={roomWidth} depth={roomDepth} height={roomHeight} />

      {/* Wall covering proposal (toggable variant) */}
      <WallCoveringSystem />

      {/* Fireflies */}
      <FireflySystem />

      {/* Seating — toggled via UI */}
      {showSeating && <Seating />}

      {/* Post-processing — experience mode only */}
      {isExperience && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            intensity={0.3}
            radius={0.15}
            mipmapBlur
          />
          <Vignette
            offset={0.3}
            darkness={0.6}
            blendFunction={BlendFunction.NORMAL}
          />
          <Noise
            premultiply
            blendFunction={BlendFunction.ADD}
            opacity={0.03}
          />
        </EffectComposer>
      )}

      {/* Dimension labels — construction mode only */}
      {isConstruction && (
        <DimensionLabels
          roomWidth={roomWidth}
          roomDepth={roomDepth}
          roomHeight={roomHeight}
        />
      )}

      {/* Hover labels for room elements */}
      <RoomLabels />

      {/* Measure tool — available in all modes */}
      <MeasureTool />
    </>
  )
}
