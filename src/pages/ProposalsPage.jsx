import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { VariantProvider } from '../hooks/VariantProvider.jsx'
import { TimelineProvider } from '../hooks/TimelineProvider.jsx'
import { ProposalsProvider } from '../hooks/ProposalsProvider.jsx'
import { useProposals } from '../hooks/useProposals.js'
import { useTimeline } from '../hooks/useTimeline.js'
import { useVariant } from '../hooks/useVariant.js'
import { useLightingState } from '../hooks/useLightingState.jsx'

import { ROOM } from '../geometry/dimensions.js'
import Room from '../components/Room'
import FireflySystem from '../components/fireflies/FireflySystem.jsx'
import { setFireflyCountOverride } from '../components/fireflies/surfacePositions.js'

import { proposalVariants, proposalVariantsById } from '../proposals/variants.js'
import {
  DEFAULT_TIMELINE_T,
  DEFAULT_PROPOSAL_VARIANT_ID,
} from '../proposals/defaults.js'
import {
  cameraPresets,
  DEFAULT_CAMERA_PRESET_ID,
} from '../proposals/cameraPresets.js'
import Null from '../components/proposals/variants/Null.jsx'

import VariantPicker from '../components/proposals/VariantPicker.jsx'
import ABToggle from '../components/proposals/ABToggle.jsx'
import TimeScrubber from '../components/proposals/TimeScrubber.jsx'
import ControlPanel from '../components/proposals/ControlPanel.jsx'
import HazePass from '../components/proposals/HazePass.jsx'

function Loader() {
  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
      <div className="text-white/30 text-xs uppercase tracking-widest">
        Loading proposals…
      </div>
    </div>
  )
}

// Keep the camera inside the room while orbiting.
function CameraBoundsEnforcer() {
  const { camera } = useThree()
  const halfW = ROOM.W / 2 - 0.3
  const halfD = ROOM.D / 2 - 0.3
  useFrame(() => {
    /* eslint-disable react-hooks/immutability */
    camera.position.x = Math.max(-halfW, Math.min(halfW, camera.position.x))
    camera.position.z = Math.max(-halfD, Math.min(halfD, camera.position.z))
    camera.position.y = Math.max(0.3, Math.min(ROOM.H - 0.2, camera.position.y))
    /* eslint-enable react-hooks/immutability */
  })
  return null
}

// Apply the initial timeline position on first mount. The value comes from
// the ?time URL param when set, otherwise the blue-hour default so
// treatment + fireflies both read.
function InitialTime({ time }) {
  const { setTime } = useTimeline()
  useEffect(() => {
    setTime(time)
  }, [setTime, time])
  return null
}

// Override the experience fireflies default to 'motion' on the
// proposals page. The shared default is 'blinking' with a 2-minute
// shuffle-in buildup, which is too slow for back-wall review.
function InitialFireflyVariant() {
  const { selectVariant } = useVariant()
  useEffect(() => {
    selectVariant('fireflies', 'motion')
  }, [selectVariant])
  return null
}

function SyncVariantFromUrl() {
  const { variantId } = useParams()
  const { currentVariantId, setCurrentVariantId } = useProposals()
  useEffect(() => {
    if (!variantId) return
    const resolved = proposalVariantsById[variantId]
      ? variantId
      : DEFAULT_PROPOSAL_VARIANT_ID
    if (resolved !== currentVariantId) setCurrentVariantId(resolved)
  }, [variantId, currentVariantId, setCurrentVariantId])
  return null
}

// Capture-mode signal. The Puppeteer script polls window.__captureReady
// and snaps the frame once it flips true. We wait ~1.5 s of R3F clock
// time after mount so the initial firefly fade-in settles into a
// representative pattern before capture.
function CaptureReadySignal() {
  const readyRef = useRef(false)
  useFrame(({ clock, scene }) => {
    if (readyRef.current) return
    if (clock.getElapsedTime() > 1.5) {
      readyRef.current = true
      if (typeof window !== 'undefined') {
        let instancedMeshes = 0
        let totalInstances = 0
        let meshes = 0
        scene.traverse((obj) => {
          if (obj.isInstancedMesh) {
            instancedMeshes++
            totalInstances += obj.count || 0
          } else if (obj.isMesh) {
            meshes++
          }
        })
        window.__captureDiag = { meshes, instancedMeshes, totalInstances }
        window.__captureReady = true
      }
    }
  })
  useEffect(() => () => {
    if (typeof window !== 'undefined') {
      delete window.__captureReady
      delete window.__captureDiag
    }
  }, [])
  return null
}

function VariantRenderer() {
  const { currentVariantId } = useProposals()
  const entry =
    proposalVariantsById[currentVariantId] ||
    proposalVariantsById[DEFAULT_PROPOSAL_VARIANT_ID]
  const Component = entry.component || Null
  return <Component />
}

function Lighting() {
  const lighting = useLightingState()
  return (
    <>
      <ambientLight
        color={lighting.ambientColor}
        intensity={lighting.ambientIntensity}
      />
      {lighting.phaseIndex >= 1 && (
        <directionalLight
          position={[2, 10, -2]}
          color="#2a2a40"
          intensity={0.02}
        />
      )}
    </>
  )
}

function SceneContents({ captureMode }) {
  const { fireflyCount, hazeOverride } = useProposals()

  // Apply the firefly count override during render so FireflySystem's
  // remount (via key={fireflyCount} below) picks it up synchronously —
  // before the variant component's useMemo runs distributeUnits().
  useMemo(() => {
    setFireflyCountOverride(fireflyCount)
  }, [fireflyCount])

  // Clear the override when the proposals page unmounts so the /3d
  // scene isn't affected by whatever the reviewer last set.
  useEffect(() => {
    return () => setFireflyCountOverride(null)
  }, [])

  return (
    <>
      <Lighting />
      <Room />
      {/* key forces a remount on count change so variant useMemo reruns */}
      <FireflySystem key={fireflyCount} />
      <VariantRenderer />
      {captureMode && <CaptureReadySignal />}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.05}
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
        <HazePass hazeLevel={hazeOverride} />
      </EffectComposer>
    </>
  )
}

// Surface a small "not yet built" banner when the current variant has
// no component yet. Null is rendered as fallback by VariantRenderer.
function NotYetBuiltBanner() {
  const { currentVariantId } = useProposals()
  const entry =
    proposalVariantsById[currentVariantId] ||
    proposalVariantsById[DEFAULT_PROPOSAL_VARIANT_ID]
  if (entry.component) return null
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-black/60 border border-amber-300/30 backdrop-blur-sm rounded text-[10px] uppercase tracking-widest text-amber-200/80">
      {entry.label} — not yet built · null rendered as placeholder
    </div>
  )
}

function PageInner() {
  const [searchParams] = useSearchParams()

  // URL-driven initial state. The capture script drives preset + time
  // through these params so each screenshot lands on the exact camera
  // and timeline position the gate calls for.
  const presetId = searchParams.get('preset') || DEFAULT_CAMERA_PRESET_ID
  const preset = cameraPresets[presetId] || cameraPresets[DEFAULT_CAMERA_PRESET_ID]

  const timeParamRaw = searchParams.get('time')
  const timeParam = timeParamRaw !== null ? parseFloat(timeParamRaw) : NaN
  const initialTime =
    Number.isFinite(timeParam) && timeParam >= 0 && timeParam <= 1
      ? timeParam
      : DEFAULT_TIMELINE_T

  // Capture mode hides every UI overlay so the screenshot shows the
  // scene only. Also exposes the variant and preset registries on
  // window for the Puppeteer script to enumerate.
  const captureMode = searchParams.get('capture') === '1'

  useEffect(() => {
    if (!captureMode || typeof window === 'undefined') return
    window.__proposalVariants = proposalVariants.map((v) => ({
      id: v.id,
      label: v.label,
      built: !!v.component,
    }))
    window.__proposalPresets = Object.keys(cameraPresets)
    return () => {
      delete window.__proposalVariants
      delete window.__proposalPresets
    }
  }, [captureMode])

  return (
    <div className="relative h-screen w-screen bg-black">
      {!captureMode && (
        <Link
          to="/"
          className="fixed top-4 right-4 z-30 text-[10px] text-white/25 hover:text-white/50 cursor-pointer transition-colors border border-white/10 px-3 py-1.5 rounded hover:border-white/20"
        >
          Back to site
        </Link>
      )}

      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{
            position: preset.position,
            fov: 65,
            near: 0.1,
            far: 100,
          }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          className="!absolute inset-0"
        >
          <SyncVariantFromUrl />
          <InitialTime time={initialTime} />
          <InitialFireflyVariant />
          <color attach="background" args={['#000000']} />
          <fogExp2 attach="fog" args={['#000000', 0.08]} />
          <OrbitControls
            target={preset.target}
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI * 0.85}
            minPolarAngle={Math.PI * 0.1}
            rotateSpeed={0.5}
            panSpeed={0.5}
            maxDistance={Math.min(ROOM.W, ROOM.D) / 2 - 0.5}
            minDistance={0.5}
          />
          <CameraBoundsEnforcer />
          <SceneContents captureMode={captureMode} />
        </Canvas>
      </Suspense>

      {!captureMode && (
        <>
          <NotYetBuiltBanner />
          <ABToggle />
          <ControlPanel />
          <TimeScrubber />
          <VariantPicker />
        </>
      )}
    </div>
  )
}

export default function ProposalsPage() {
  return (
    <VariantProvider>
      <TimelineProvider>
        <ProposalsProvider>
          <PageInner />
        </ProposalsProvider>
      </TimelineProvider>
    </VariantProvider>
  )
}
