import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
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

// v2 verification scaffold. Wraps everything in ProposalProvider so the
// proposal switcher, Branches, and WallLighting can read the active
// proposal. URL :variantId param maps to a known proposal id; unknown
// or absent values fall back to the default proposal.
//
// Lighting and tone mapping are intentionally bright/Linear for this
// verification pass so dark spec materials are easy to inspect. Final
// lighting design comes later.
//
// Viewpoint switcher reads from cameraPresets — six canonical views
// (ceiling, back, front, window, entrance, standing). Default lands on
// 'standing' since that's the most natural eye-level introduction shot.

const DEFAULT_VIEW = 'standing'
const DEFAULT_FOV = 50

// Sets the renderer's tone mapping at runtime so toggling modes doesn't
// require remounting the Canvas (which would reset every firefly's
// in-progress animation).
function ToneMappingSetter({ isExperience }) {
  const gl = useThree((s) => s.gl)
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    gl.toneMapping = isExperience ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping
    gl.toneMappingExposure = isExperience ? 1.2 : 1.0
  }, [isExperience, gl])
  /* eslint-enable react-hooks/immutability */
  return null
}

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
          camera={{
            position: preset.position,
            fov: DEFAULT_FOV,
            near: 0.05,
            far: 200,
          }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            toneMapping: THREE.NoToneMapping,
          }}
          className="absolute! inset-0"
        >
          <color attach="background" args={[outsideColor]} />

          <ToneMappingSetter isExperience={isExperience} />

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

          {isExperience && (
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
              <Noise
                premultiply
                blendFunction={BlendFunction.ADD}
                opacity={0.03}
              />
            </EffectComposer>
          )}
        </Canvas>
      </Suspense>

      <ProposalSwitcher />

      {/* Verification chrome — bottom-left. Two rows: viewpoint + curtain
          on top, firefly variant switcher below. */}
      <div className="fixed bottom-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="text-[10px] text-gray-500 font-mono">
          fireflies v2 — {preset.label} · {proposalId}
          {curtainOff && ' · curtain off'}
          {fireflyVariant !== 'off' && ` · firefly: ${fireflyVariant}`}
          {isExperience && ' · experience mode'}
        </div>
        <div className="flex flex-wrap gap-1 pointer-events-auto max-w-xl">
          {Object.entries(cameraPresets).map(([key, p]) => (
            <Link
              key={key}
              to={urlFor({ view: key })}
              className={`text-[10px] font-mono px-2 py-1 rounded border ${
                viewKey === key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {p.label}
            </Link>
          ))}
          <Link
            to={urlFor({ curtain: curtainOff ? null : 'off' })}
            className={`text-[10px] font-mono px-2 py-1 rounded border ml-2 ${
              curtainOff
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
            }`}
          >
            Curtain {curtainOff ? 'off' : 'on'}
          </Link>
          <Link
            to={urlFor({ mode: isExperience ? null : 'experience' })}
            className={`text-[10px] font-mono px-2 py-1 rounded border ${
              isExperience
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
            }`}
          >
            Experience mode
          </Link>
        </div>
        <div className="flex flex-wrap gap-1 pointer-events-auto max-w-xl">
          {[{ id: 'off', label: 'Static LEDs' }, ...fireflyVariantList.map((v) => ({ id: v.id, label: v.label }))].map(({ id, label }) => {
            const active = fireflyVariant === id
            return (
              <Link
                key={id}
                to={urlFor({ firefly: id })}
                className={`text-[10px] font-mono px-2 py-1 rounded border ${
                  active
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
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
