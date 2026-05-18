import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useMemo } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { ROOM } from '../geometry/dimensions-v2.js'
import { cameraPresets } from '../variants/config-v2.js'
import { fireflyVariantList } from '../variants/fireflies-v2.js'
import { ProposalProvider } from '../hooks/ProposalProvider-v2.jsx'
import { useProposal } from '../hooks/useProposal-v2.js'
import { proposalVariants, defaultProposalId } from '../variants/proposals-v2.js'
import ProposalSwitcher from '../components/proposals-v2/ProposalSwitcher.jsx'
import Room from '../components/room-v2/Room.jsx'
import { PostEffects } from '../postfx/PostEffects.jsx'
import VersionSwitcher from '../components/VersionSwitcher.jsx'
import Glass, { EASE_OUT } from '../components/Glass'

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

// Glass pill row used for both viewpoint and firefly-variant selection,
// matching v1's ScenePicker / FireflyPicker styling exactly.
function PillRow({ items, activeId, urlFor }) {
  return (
    <Glass className="rounded-full flex items-center gap-1 p-1">
      {items.map(({ id, label }) => {
        const active = activeId === id
        return (
          <Link
            key={id}
            to={urlFor(id)}
            style={TRANSITION}
            className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
              active
                ? 'bg-white/15 text-white'
                : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </Glass>
  )
}

// Smaller Glass toggle for binary states (curtain on/off, experience mode).
function TogglePill({ to, active, children }) {
  return (
    <Link
      to={to}
      style={TRANSITION}
      className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
        active
          ? 'bg-white/15 text-white'
          : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
      }`}
    >
      {children}
    </Link>
  )
}

// v2 verification scaffold. Wraps everything in ProposalProvider so the
// proposal switcher, Branches, and WallLighting can read the active
// proposal. URL :variantId param maps to a known proposal id; unknown
// or absent values fall back to the default proposal.
//
// The post-processing stack in PostEffects owns tone mapping (AgX); the
// Canvas runs NoToneMapping via the `flat` prop. Lighting is intentionally
// bright for verification so dark spec materials are easy to inspect.
//
// Viewpoint switcher reads from cameraPresets – six canonical views
// (ceiling, back, front, window, entrance, standing). Default lands on
// 'standing' since that's the most natural eye-level introduction shot.

const DEFAULT_VIEW = 'standing'
const DEFAULT_FOV = 50

function Loader() {
  return (
    <div className="fixed inset-0 z-40 bg-white flex items-center justify-center">
      <div className="text-gray-400 text-xs tracking-widest">Loading...</div>
    </div>
  )
}

// Reads :variantId from the URL and pushes it into the proposal state.
// Has to live inside ProposalProvider to call useProposal().
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
  // URL param overrides proposal default; explicit 'off' keeps the
  // static LEDs visible even on a proposal that boots with fireflies.
  const urlFirefly = searchParams.get('firefly')
  const fireflyVariant = urlFirefly !== null ? urlFirefly : (defaultFirefly ?? 'off')

  // Re-mount Canvas + Room when preset or proposal changes so camera
  // and toggleable geometry pick up fresh.
  const canvasKey = useMemo(() => `${viewKey}-${proposalId}`, [viewKey, proposalId])

  // Helpers for building viewpoint + curtain + firefly + mode URLs that
  // preserve each other's state, so toggling one doesn't drop the others.
  const urlFor = (overrides) => {
    const params = new URLSearchParams()
    params.set('view', overrides.view ?? viewKey)
    const c = overrides.curtain !== undefined ? overrides.curtain : (curtainOff ? 'off' : null)
    if (c) params.set('curtain', c)
    // firefly: pass any string (incl. 'off') to set the param explicitly.
    // urlFirefly captures the current URL value (null when absent) so
    // we preserve absence as absence on viewpoint/curtain/mode toggles.
    const f = overrides.firefly !== undefined ? overrides.firefly : urlFirefly
    if (f) params.set('firefly', f)
    const m = overrides.mode !== undefined ? overrides.mode : (isExperience ? 'experience' : null)
    if (m) params.set('mode', m)
    return `?${params.toString()}`
  }

  // Outside-the-room background: white during verification (lets the room
  // outline read against a clean ground), near-black in experience mode
  // (so the visitor entry opening doesn't punch a bright void through the
  // dark interior).
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

          <ambientLight intensity={isExperience ? 0.01 : 2.4} color="#ffffff" />
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

      <ProposalSwitcher />
      <VersionSwitcher current="v2" />

      {/* Top-center chrome — same Glass aesthetic as v1's ScenePicker /
          FireflyPicker rows. Viewpoint, firefly variant, and the
          curtain / experience-mode toggles stacked. */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-auto select-none">
        <PillRow
          items={Object.entries(cameraPresets).map(([key, p]) => ({ id: key, label: p.label }))}
          activeId={viewKey}
          urlFor={(key) => urlFor({ view: key })}
        />
        <PillRow
          items={[
            { id: 'off', label: 'Static LEDs' },
            ...fireflyVariantList.map((v) => ({ id: v.id, label: v.label })),
          ]}
          activeId={fireflyVariant}
          urlFor={(id) => urlFor({ firefly: id })}
        />
        <Glass className="rounded-full flex items-center gap-1 p-1">
          <TogglePill
            to={urlFor({ curtain: curtainOff ? null : 'off' })}
            active={curtainOff}
          >
            Curtain {curtainOff ? 'off' : 'on'}
          </TogglePill>
          <TogglePill
            to={urlFor({ mode: isExperience ? null : 'experience' })}
            active={isExperience}
          >
            Experience mode
          </TogglePill>
        </Glass>
      </div>
    </div>
  )
}

export default function FirefliesV2Page() {
  return (
    <ProposalProvider>
      <ActiveProposalSync />
      <FirefliesV2Inner />
    </ProposalProvider>
  )
}
