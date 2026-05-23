import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import QAPanel from './components/QAPanel'

const FirefliesV2Page = lazy(() => import('./pages/FirefliesV2Page'))

function FirefliesRedirect() {
  const { variantId } = useParams()
  return <Navigate to={`/fireflies-v2/${variantId || ''}`} replace />
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
          <Route index element={<Navigate to="/fireflies-v2" replace />} />
          <Route path="fireflies-v2" element={<FirefliesV2Page />} />
          <Route path="fireflies-v2/:variantId" element={<FirefliesV2Page />} />
          <Route path="fireflies" element={<Navigate to="/fireflies-v2" replace />} />
          <Route path="fireflies/:variantId" element={<FirefliesRedirect />} />
          <Route path="3d" element={<Navigate to="/fireflies-v2" replace />} />
          <Route path="proposals" element={<Navigate to="/fireflies-v2" replace />} />
          <Route path="proposals/:variantId" element={<FirefliesRedirect />} />
          <Route path="*" element={<Navigate to="/fireflies-v2" replace />} />
        </Routes>
      </Suspense>
      <QAPanel />
    </>
  )
}
