import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { VariantProvider } from '../hooks/VariantProvider.jsx'
import { TimelineProvider } from '../hooks/TimelineProvider.jsx'
import { TourProvider } from '../hooks/TourProvider.jsx'
import { MeasureProvider } from '../hooks/MeasureProvider.jsx'
import Scene from '../components/Scene'
import VariantSwitcher from '../components/VariantSwitcher'
import TimelineController from '../components/TimelineController'
import ConstructionToolbar from '../components/ConstructionToolbar'
import ExperiencePicker from '../components/proposals/ExperiencePicker.jsx'
import PlaceholderBanner from '../components/proposals/PlaceholderBanner.jsx'
import InstructionsOverlay from '../components/proposals/InstructionsOverlay.jsx'
import { experienceComponents } from '../components/proposals/experiences'

// Five experience proposals — picker mounted above the same room shown
// on /3d. Each proposal renders its own treatment on top of the bare
// scene; experiences without a component fall through to the bare room
// and the placeholder banner.

function Loader() {
  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
      <div className="text-white/30 text-xs uppercase tracking-widest">Loading proposals...</div>
    </div>
  )
}

function ActiveExperience() {
  const { variantId } = useParams()
  const Experience = experienceComponents[variantId]
  return Experience ? <Experience /> : null
}

function PreviewInner() {
  const [uiHidden, setUiHidden] = useState(false)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'h' || e.key === 'H') setUiHidden((prev) => !prev)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="relative h-screen w-screen bg-black">
      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{
            position: [0, 1.6, 2.5],
            fov: 65,
            near: 0.1,
            far: 100,
          }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          className="!absolute inset-0"
        >
          <Scene />
          <ActiveExperience />
        </Canvas>
      </Suspense>

      {!uiHidden && (
        <>
          <ExperiencePicker />
          <PlaceholderBanner />
          <InstructionsOverlay />
          <VariantSwitcher hideViewMode hideCategories={['fireflies']} />
          <TimelineController />
          <ConstructionToolbar />
        </>
      )}

      {uiHidden && (
        <div className="fixed bottom-4 right-4 z-10 text-[10px] text-white/10 pointer-events-none">
          Press H to show controls
        </div>
      )}
    </div>
  )
}

export default function ProposalsPage() {
  return (
    <VariantProvider>
      <TimelineProvider>
        <TourProvider>
          <MeasureProvider>
            <PreviewInner />
          </MeasureProvider>
        </TourProvider>
      </TimelineProvider>
    </VariantProvider>
  )
}
