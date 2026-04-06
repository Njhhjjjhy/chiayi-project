import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'

// Lazy-load heavy pages
const ThreeDPreview = lazy(() => import('./pages/ThreeDPreview'))
const SpacePage = lazy(() => import('./pages/SpacePage'))
const WallPage = lazy(() => import('./pages/WallPage'))
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))
const MarketingPage = lazy(() => import('./pages/MarketingPage'))
const FloorPage = lazy(() => import('./pages/FloorPage'))
const MerchandisePage = lazy(() => import('./pages/MerchandisePage'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-white/20 text-sm uppercase tracking-widest">Loading...</div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="space" element={<SpacePage />} />
          <Route path="wall" element={<WallPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="floor" element={<FloorPage />} />
          <Route path="merchandise" element={<MerchandisePage />} />
          <Route path="3d" element={<ThreeDPreview />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
