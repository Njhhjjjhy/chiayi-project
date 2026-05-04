import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import QAPanel from './components/QAPanel'

const FirefliesPage = lazy(() => import('./pages/FirefliesPage'))

const DEFAULT_VARIANT = 'compressed-day'

function ProposalsRedirect() {
  const { variantId } = useParams()
  return <Navigate to={`/fireflies/${variantId || DEFAULT_VARIANT}`} replace />
}

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
          <Route index element={<Navigate to={`/fireflies/${DEFAULT_VARIANT}`} replace />} />
          <Route path="fireflies" element={<Navigate to={`/fireflies/${DEFAULT_VARIANT}`} replace />} />
          <Route path="fireflies/:variantId" element={<FirefliesPage />} />
          <Route path="3d" element={<Navigate to={`/fireflies/${DEFAULT_VARIANT}`} replace />} />
          <Route path="proposals" element={<Navigate to={`/fireflies/${DEFAULT_VARIANT}`} replace />} />
          <Route path="proposals/:variantId" element={<ProposalsRedirect />} />
          <Route path="*" element={<Navigate to={`/fireflies/${DEFAULT_VARIANT}`} replace />} />
        </Routes>
      </Suspense>
      <QAPanel />
    </>
  )
}
