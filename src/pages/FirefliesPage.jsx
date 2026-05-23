import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
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

// Layout: left panel (ControlPanel) with all settings, bottom timeline.
// Glass aesthetic throughout.

const DEFAULT_VIEW = 'standing'
const DEFAULT_FOV = 50

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

function FirefliesInner() {
  const [searchParams] = useSearchParams()
  const viewKey = searchParams.get('view') ?? DEFAULT_VIEW
  const preset = cameraPresets[viewKey] ?? cameraPresets[DEFAULT_VIEW]
  const isExperience = searchParams.get('mode') === 'experience'
  const { proposalId, defaultFirefly } = useProposal()
  const urlFirefly = searchParams.get('firefly')
  const fireflyVariant = urlFirefly !== null ? urlFirefly : (defaultFirefly ?? 'off')
  const wayfindVariant = searchParams.get('wayfind') ?? 'strip'
  const loofahVariant = searchParams.get('loofah') ?? 'variant1'
  const loofahCorner = searchParams.get('corner') ?? 'back-left'
  const ceilingVariant = searchParams.get('ceiling') ?? 'oblong'
  const seatingVariant = searchParams.get('seating') ?? 'stools'
  const gridOff = searchParams.get('grid') === 'off'

  // Special view used only by slice 5 corner-comparison captures.
  // Camera fixed at [4.4, 1.6, 4.4]; target follows the active
  // `?corner=` so all four corners can be compared from the same angle.
  const isCornerCompare = viewKey === 'corner-compare'
  const cornerTarget = useMemo(() => {
    if (!isCornerCompare) return null
    const [cx, cz] = getLoofahCornerCenter(loofahCorner)
    return [cx, 1.6, cz]
  }, [isCornerCompare, loofahCorner])

  // Slice 6 diagnostic views (capture-only, not in the picker UI):
  //   close-range-seating   — ~1.5 m from zone 1's stool pair, looking
  //                            down at the box + cushion so the materials
  //                            read at close range.
  //   seating-spotlight-pool — slight oblique on zone 2 with the ceiling
  //                            in frame so the overhead spot's floor
  //                            pool reads as a defined disc.
  const isCloseRange = viewKey === 'close-range-seating'
  const isSpotPool = viewKey === 'seating-spotlight-pool'

  // Slice 7 diagnostic views (capture-only, not in the picker UI):
  //   looking-up-from-seating — seated head height in zone 2 looking
  //                              straight up at the ceiling forms.
  //   ceiling-led-density     — high-altitude topdown to test whether
  //                              the 1,760 LEDs read as a credible
  //                              firefly field or as a uniform wash.
  const isSeatedUp = viewKey === 'looking-up-from-seating'
  const isLedDensity = viewKey === 'ceiling-led-density'

  // Slice 14 diagnostic views (capture-only, not in the picker UI):
  //   loofah-close-range — 1.5 m in front of the loofah wall, mid-height,
  //                         facing the wall. Reveals piece-level fibre
  //                         texture and per-piece size/colour variation.
  //   loofah-overview   — oblique forest-side angle that frames the
  //                         loofah wall (front-wall side) and the
  //                         variant 3 back-left corner column together.
  const isLoofahCloseRange = viewKey === 'loofah-close-range'
  const isLoofahOverview = viewKey === 'loofah-overview'

  // Slice 15 diagnostic views (capture-only, not in the picker UI):
  //   partition-close-range — 1.2 m forest-side of the entrance-wall-
  //                            partition, mid-height, facing the face.
  //                            Drawer grid + cup-pull groove read at
  //                            close range.
  //   partition-corner      — oblique close-in shot of the interior
  //                            corner where entrance-wall-partition
  //                            meets pathway-partition-vertical in the
  //                            forest. Both drawer grids in one frame.
  const isPartitionCloseRange = viewKey === 'partition-close-range'
  const isPartitionCorner = viewKey === 'partition-corner'

  // Slice 17 diagnostic view (capture-only, not in the picker UI):
  //   walldots-closerange — 1.2 m from the back-wall, mid-band height,
  //                          facing the wall. Glow-dot density, colour,
  //                          and Poisson spacing read at close range.
  const isWalldotsCloseRange = viewKey === 'walldots-closerange'

  let cameraPosition = preset.position
  let orbitTarget = preset.target
  if (isCornerCompare) {
    cameraPosition = [4.4, 1.6, 4.4]
    orbitTarget = cornerTarget
  } else if (isCloseRange) {
    cameraPosition = [3.5, 1.0, 2.6]
    orbitTarget = [4.2, 0.45, 1.4]
  } else if (isSpotPool) {
    cameraPosition = [5.5, 2.6, 1.6]
    orbitTarget = [5.5, 0.0, 4.0]
  } else if (isSeatedUp) {
    cameraPosition = [5.5, 1.05, 4.0]
    orbitTarget = [5.5, 4.2, 4.0]
  } else if (isLedDensity) {
    cameraPosition = [4.4, 6.0, 4.4]
    orbitTarget = [4.4, 0.0, 4.4]
  } else if (isLoofahCloseRange) {
    cameraPosition = [7.14, 1.2, 3.64]
    orbitTarget = [8.7, 1.2, 3.64]
  } else if (isLoofahOverview) {
    cameraPosition = [3.5, 1.8, 4.5]
    orbitTarget = [7.0, 1.2, 2.0]
  } else if (isPartitionCloseRange) {
    // 1.2 m forest-side of entrance-wall-partition forest face
    // (face at Z = 0.5, partition centred at X = 3.965).
    cameraPosition = [3.965, 1.76, 1.7]
    orbitTarget = [3.965, 1.76, 0.5]
  } else if (isPartitionCorner) {
    // Inside-the-forest oblique on the corner where the entrance-wall-
    // partition (forest face at Z = 0.5) meets the pathway-partition-
    // vertical (forest face at X = 2.0).
    cameraPosition = [3.6, 1.4, 2.4]
    orbitTarget = [2.0, 1.4, 0.5]
  } else if (isWalldotsCloseRange) {
    cameraPosition = [1.32, 2.5, 4.39]
    orbitTarget = [0.12, 2.5, 4.39]
  }

  const canvasKey = useMemo(() => `${viewKey}-${proposalId}`, [viewKey, proposalId])

  const [brightness, setBrightness] = useState(1.0)
  const [spotlights, setSpotlights] = useState(1.0)

  const ambientIntensity = 2.4 * brightness

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
            position: cameraPosition,
            fov: DEFAULT_FOV,
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
            <ambientLight intensity={ambientIntensity} color="#ffffff" />
          )}
          {!isExperience && (
            <>
              <directionalLight position={[6, 14, 6]} intensity={1.2} />
              <directionalLight position={[-4, 10, -4]} intensity={0.6} />
              {!gridOff && (
                <gridHelper
                  args={[20, 40, '#cccccc', '#eeeeee']}
                  position={[ROOM.W / 2, 0.001, ROOM.D / 2]}
                />
              )}
            </>
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
            wayfindVariant={wayfindVariant}
            loofahVariant={loofahVariant}
            loofahCorner={loofahCorner}
            ceilingVariant={ceilingVariant}
            seatingVariant={seatingVariant}
            spotlightDim={isExperience ? 0 : spotlights}
          />

          <PostEffects />
        </Canvas>
      </Suspense>

      <ControlPanel
        brightness={brightness}
        onBrightnessChange={setBrightness}
        spotlights={spotlights}
        onSpotlightsChange={setSpotlights}
      />

      {/* Bottom: timeline */}
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
