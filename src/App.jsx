import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import QAPanel from './components/QAPanel'

const ThreeDPreview = lazy(() => import('./pages/ThreeDPreview'))
const ProposalsPage = lazy(() => import('./pages/ProposalsPage'))

function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-bg)', color: 'var(--color-dim)' }}
    >
      <div className="text-sm" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
        Loading...
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route index element={<Navigate to="/3d" replace />} />
          <Route path="3d" element={<ThreeDPreview />} />
          <Route path="proposals" element={<Navigate to="/proposals/compressed-day" replace />} />
          <Route path="proposals/:variantId" element={<ProposalsPage />} />
          <Route path="*" element={<Navigate to="/3d" replace />} />
        </Routes>
      </Suspense>
      <QAPanel />
    </>
  )
}
