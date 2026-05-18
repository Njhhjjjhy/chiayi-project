import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { ROOM } from '../geometry/dimensions-v2.js'
import { cameraPresets } from '../variants/config-v2.js'
import { ProposalProvider } from '../hooks/ProposalProvider-v2.jsx'
import { TimelineProvider } from '../hooks/TimelineProvider.jsx'
import { useProposal } from '../hooks/useProposal-v2.js'
import { proposalVariants, defaultProposalId } from '../variants/proposals-v2.js'
import Room from '../components/room-v2/Room.jsx'
import { PostEffects } from '../postfx/PostEffects.jsx'
import V2VariantSwitcher from '../components/proposals-v2/V2VariantSwitcher.jsx'
import V2ScenePicker from '../components/proposals-v2/V2ScenePicker.jsx'
import V2FireflyPicker from '../components/proposals-v2/V2FireflyPicker.jsx'
import V2LightingPicker from '../components/proposals-v2/V2LightingPicker.jsx'
import ModeSwitcher from '../components/ModeSwitcher'
import BrightnessControl from '../components/proposals/BrightnessControl.jsx'
import TimelineController from '../components/TimelineController'
import VersionSwitcher from '../components/VersionSwitcher.jsx'

// v2 page. Layout mirrors v1 exactly: top-left Variants panel,
// top-center ModeSwitcher + the matching picker row, top-right
// Notes + version switch + brightness slider, bottom-center
// timeline. Same Glass aesthetic throughout.

const DEFAULT_VIEW = 'standing'
const DEFAULT_FOV = 50

function Loader() {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="text-white/40 text-sm tracking-widest">Loading...</div>
    </div>
  )
}

function ActiveProposalSync() {
  const { variantId } = useParams()
  const { setProposalId } = useProposal()

  useEffect(() => {
    if (variantId && proposalVariants[variantId]) {
      setProposalId(variantId)
    } else {
      setProposalId(defaultProposalId)
    }
  }, [variantId, setProposalId])

  return null
}

function FirefliesV2Inner() {
  const [searchParams] = useSearchParams()
  const viewKey = searchParams.get('view') ?? DEFAULT_VIEW
  const preset = cameraPresets[viewKey] ?? cameraPresets[DEFAULT_VIEW]
  const curtainOff = searchParams.get('curtain') === 'off'
  const isExperience = searchParams.get('mode') === 'experience'
  const { proposalId, defaultFirefly } = useProposal()
  const urlFirefly = searchParams.get('firefly')
  const fireflyVariant = urlFirefly !== null ? urlFirefly : (defaultFirefly ?? 'off')

  const canvasKey = useMemo(() => `${viewKey}-${proposalId}`, [viewKey, proposalId])

  // Top-center mode tab — controls which picker row shows below the
  // ModeSwitcher. Local state only, matching v1's pattern.
  const [mode, setMode] = useState('views')

  // Brightness override — multiplies the ambient light intensity so the
  // reviewer can lift the scene without committing to a different lighting
  // mode. Visual parity with v1's BrightnessControl.
  const [brightness, setBrightness] = useState(1.0)

  const ambientBase = isExperience ? 0.01 : 2.4
  const ambientIntensity = ambientBase * brightness

  // Outside-the-room background: white during verification (lets the room
  // outline read against a clean ground), near-black in experience mode.
  const outsideColor = isExperience ? '#0a0a0a' : '#ffffff'

  return (
    <div
      className="relative h-screen w-screen"
      style={{ backgroundColor: outsideColor }}
    >
      <Suspense fallback={<Loader />}>
        <Canvas
          key={canvasKey}
          flat
          dpr={Math.min(window.devicePixelRatio, 1.5)}
          camera={{
            position: preset.position,
            fov: DEFAULT_FOV,
            near: 0.05,
            far: 200,
          }}
          gl={{ antialias: false, powerPreference: 'high-performance', toneMappingExposure: 0.8 }}
          className="absolute! inset-0"
        >
          <color attach="background" args={[outsideColor]} />

          <ambientLight intensity={ambientIntensity} color="#ffffff" />
          {!isExperience && (
            <>
              <directionalLight position={[6, 14, 6]} intensity={1.2} />
              <directionalLight position={[-4, 10, -4]} intensity={0.6} />
              <gridHelper
                args={[20, 40, '#cccccc', '#eeeeee']}
                position={[ROOM.W / 2, 0.001, ROOM.D / 2]}
              />
            </>
          )}

          <OrbitControls
            target={preset.target}
            enableDamping
            dampingFactor={0.08}
            maxDistance={40}
            minDistance={0.3}
          />

          <Room curtainOff={curtainOff} fireflyVariant={fireflyVariant} />

          <PostEffects />
        </Canvas>
      </Suspense>

      {/* Top-left: Variants Glass panel (matches v1) */}
      <V2VariantSwitcher />

      {/* Top-center: ModeSwitcher + matching picker row (matches v1) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <ModeSwitcher mode={mode} onChange={setMode} />
        {mode === 'views' && <V2ScenePicker />}
        {mode === 'lighting' && <V2LightingPicker />}
        {mode === 'fireflies' && <V2FireflyPicker />}
      </div>

      {/* Top-right: version switcher next to Notes, brightness below */}
      <VersionSwitcher current="v2" />
      <div className="fixed top-20 right-4 z-10 flex flex-col items-end gap-2">
        <BrightnessControl value={brightness} onChange={setBrightness} />
      </div>

      {/* Bottom: timeline (matches v1) */}
      <TimelineController />
    </div>
  )
}

export default function FirefliesV2Page() {
  return (
    <ProposalProvider>
      <TimelineProvider>
        <ActiveProposalSync />
        <FirefliesV2Inner />
      </TimelineProvider>
    </ProposalProvider>
  )
}
