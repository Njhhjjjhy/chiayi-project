import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { ROOM } from '../geometry/dimensions.js'
import { cameraPresets } from '../variants/config.js'
import { ProposalProvider } from '../hooks/ProposalProvider.jsx'
import { TimelineProvider } from '../hooks/TimelineProvider.jsx'
import { useProposal } from '../hooks/useProposal.js'
import { proposalVariants, defaultProposalId } from '../variants/proposals.js'
import Room from '../components/room/Room.jsx'
import { PostEffects } from '../postfx/PostEffects.jsx'
import { getLoofahCornerCenter } from '../geometry/loofahCorners.js'
import ControlPanel from '../components/ControlPanel.jsx'
import TimelineController from '../components/TimelineController'
import ExperienceLighting from '../components/lighting/ExperienceLighting.jsx'
import { sunsetLevel } from '../components/lighting/sunsetArc.js'
import { useTimeline } from '../hooks/useTimeline.js'

// Layout: left panel (ControlPanel) with all settings, bottom timeline.
// Glass aesthetic throughout.

const DEFAULT_VIEW = 'standing'
const DEFAULT_FOV = 50

// Parse a comma-separated triplet "x,y,z" into [x, y, z], or null on
// any malformed input. Used by the ?campos= and ?camtarget= URL params
// to drive one-off design-review captures without adding a permanent
// preset to the dropdown.
function parseTriplet(raw) {
  if (!raw) return null
  const parts = raw.split(',').map((s) => parseFloat(s))
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null
  return parts
}

function Loader() {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="text-white/85 text-sm tracking-widest">Loading...</div>
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

// Verification-mode lighting. Neutral white inspection lights — the
// sunset COLOURS live on the room's fixtures (horizon strips, sky
// spotlights), never on a scene tint. These lights only dim along the
// sunset's level as the player runs, so the fixtures' colour story
// stays readable against a darkening room. A small floor keeps
// geometry inspectable even in the darkness phase. Subscribes to the
// timeline inside its own component so playback re-renders only these
// lights, not the entire room tree.
function VerificationLighting({ brightness }) {
  const { time } = useTimeline()
  const level = Math.max(sunsetLevel(time), 0.06)
  return (
    <>
      <ambientLight intensity={2.4 * brightness * level} color="#ffffff" />
      <directionalLight position={[6, 14, 6]} intensity={1.2 * level} color="#ffffff" />
      <directionalLight position={[-4, 10, -4]} intensity={0.6 * level} color="#ffffff" />
    </>
  )
}

// Entering experience mode starts the sunset from golden hour and
// plays it — the visitor arrives at the start of the story, never into
// a black room. Leaving experience mode pauses wherever the arc is so
// the designer can inspect that exact moment. An explicit ?timeline=
// in the URL (capture scripts, shared links) suppresses the auto-play
// so stills stay still. Lives in its own null component so the
// timeline subscription never re-renders the page tree.
function ExperienceAutoPlay({ active, suppress }) {
  const { setTime, play, pause } = useTimeline()
  useEffect(() => {
    if (active) {
      if (!suppress) {
        setTime(0)
        play()
      }
    } else {
      pause()
    }
  }, [active, suppress, setTime, play, pause])
  return null
}

function DevExpose() {
  const { scene } = useThree()
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__scene = scene
    window.THREE = THREE
    return () => {
      delete window.__scene
      delete window.THREE
    }
  }, [scene])
  return null
}

function FirefliesInner() {
  const [searchParams] = useSearchParams()
  const isExperience = searchParams.get('mode') === 'experience'
  // Experience mode opens at the visitor viewpoint inside the forest —
  // never at an inspection view staring into an unlit corridor. An
  // explicit ?view= still wins in both modes.
  const viewKey = searchParams.get('view') ?? (isExperience ? 'experience' : DEFAULT_VIEW)
  const preset = cameraPresets[viewKey] ?? cameraPresets[DEFAULT_VIEW]

  useEffect(() => {
    if (!cameraPresets[viewKey]) {
      console.warn(`[camera] unknown view "${viewKey}", falling back to "${DEFAULT_VIEW}"`)
    }
  }, [viewKey])
  const { proposalId, defaultFirefly } = useProposal()
  const urlFirefly = searchParams.get('firefly')
  const fireflyVariant = urlFirefly !== null ? urlFirefly : (defaultFirefly ?? 'off')
  // Old QA-note links may carry variant1/2/3 — map them onto the new
  // look ids; anything unknown falls back to 'fibrous'.
  const rawLoofah = searchParams.get('loofah')
  const legacyLoofah = { variant1: 'fibrous', variant2: 'clusters', variant3: 'corners' }[rawLoofah]
  const loofahVariant = legacyLoofah
    ?? (['grid', 'fibrous', 'clusters', 'corners'].includes(rawLoofah) ? rawLoofah : 'fibrous')
  const loofahCorner = searchParams.get('corner') ?? 'back-left'
  // Old links may carry the retired 'flat' ceiling — fall back to
  // 'discs' (the locked direction) for anything unknown.
  const rawCeiling = searchParams.get('ceiling')
  const ceilingVariant = ['discs', 'oblong', 'mixed'].includes(rawCeiling)
    ? rawCeiling
    : 'discs'
  // Old QA-note links may still carry the retired 'stools'/'pillows'
  // values — fall back to 'cubes' for anything unknown so the room
  // never renders seat beams over an empty floor.
  const rawSeating = searchParams.get('seating')
  const seatingVariant = ['cubes', 'frame-stools', 'benches'].includes(rawSeating)
    ? rawSeating
    : 'cubes'
  const rawBeams = searchParams.get('beams')
  const beamMode = ['all', 'clusters', 'off'].includes(rawBeams) ? rawBeams : 'clusters'
  // Pathway looks (concept images 05 / 14) — 'dark' is the working
  // default; anything unknown falls back to it.
  const rawPathway = searchParams.get('pathway')
  const pathwayVariant = ['dark', 'timber'].includes(rawPathway) ? rawPathway : 'dark'
  const gridOn = searchParams.get('grid') === 'on'

  // `corner-compare` keeps a dynamic target so the camera tracks the
  // active `?corner=` value across the four loofah corners. Position
  // stays at the cameraPreset default.
  const isCornerCompare = viewKey === 'corner-compare'
  const cornerTarget = useMemo(() => {
    if (!isCornerCompare) return null
    const [cx, cz] = getLoofahCornerCenter(loofahCorner)
    return [cx, 1.6, cz]
  }, [isCornerCompare, loofahCorner])

  const camPosOverride = parseTriplet(searchParams.get('campos'))
  const camTargetOverride = parseTriplet(searchParams.get('camtarget'))
  const cameraPosition = camPosOverride ?? preset.position
  const orbitTarget = camTargetOverride ?? (isCornerCompare ? cornerTarget : preset.target)
  const cameraFov = preset.fov ?? DEFAULT_FOV

  const canvasKey = useMemo(() => `${viewKey}-${proposalId}`, [viewKey, proposalId])

  const [brightness, setBrightness] = useState(1.0)
  const [spotlights, setSpotlights] = useState(1.0)

  // Outside-the-room background: white during verification (lets the room
  // outline read against a clean ground), near-black in experience mode.
  const outsideColor = isExperience ? '#0a0a0a' : '#ffffff'

  // visionOS-style layout: the room fills the whole window (the glass
  // panes derive their look from blurring it), and the UI floats over
  // it as glass — the inspector pane owns the right-hand strip, the
  // player bar spans the rest of the bottom edge. The two strips never
  // overlap; in experience mode the inspector is gone and the player
  // takes the full width.
  return (
    <div
      className="relative h-dvh w-screen"
      style={{ backgroundColor: outsideColor }}
    >
      <Suspense fallback={<Loader />}>
        <Canvas
          key={canvasKey}
          flat
          dpr={Math.min(window.devicePixelRatio, 1.5)}
          camera={{
            position: cameraPosition,
            fov: cameraFov,
            near: 0.05,
            far: 200,
          }}
          gl={{ antialias: false, powerPreference: 'high-performance', toneMappingExposure: 0.8 }}
          className="absolute! inset-0"
        >
          <color attach="background" args={[outsideColor]} />

          {isExperience ? (
            <ExperienceLighting brightness={brightness} />
          ) : (
            <VerificationLighting brightness={brightness} />
          )}
          {!isExperience && gridOn && (
            <gridHelper
              args={[20, 40, '#cccccc', '#eeeeee']}
              position={[ROOM.W / 2, 0.001, ROOM.D / 2]}
            />
          )}

          <OrbitControls
            target={orbitTarget}
            enableDamping
            dampingFactor={0.08}
            maxDistance={40}
            minDistance={0.3}
          />

          <Room
            fireflyVariant={fireflyVariant}
            loofahVariant={loofahVariant}
            loofahCorner={loofahCorner}
            ceilingVariant={ceilingVariant}
            seatingVariant={seatingVariant}
            beamMode={beamMode}
            pathwayVariant={pathwayVariant}
            spotlightDim={spotlights}
            mist={isExperience}
          />

          <DevExpose />

          <PostEffects />
        </Canvas>
      </Suspense>

      <ExperienceAutoPlay
        active={isExperience}
        suppress={searchParams.has('timeline')}
      />

      {/* Floating glass panes: inspector (exit pill in experience mode)
          and the player bar */}
      <ControlPanel
        brightness={brightness}
        onBrightnessChange={setBrightness}
        spotlights={spotlights}
        onSpotlightsChange={setSpotlights}
      />
      <TimelineController />
    </div>
  )
}

export default function FirefliesPage() {
  return (
    <ProposalProvider>
      <TimelineProvider>
        <ActiveProposalSync />
        <FirefliesInner />
      </TimelineProvider>
    </ProposalProvider>
  )
}
