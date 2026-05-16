import { Link, useSearchParams } from 'react-router-dom'
import { useProposal } from '../../hooks/useProposal-v2.js'
import { proposalVariantList } from '../../variants/proposals-v2.js'

// Two-button toggle for the v2 design proposals. Styled to match the
// other v2 verification UI (monospace, bordered buttons on white) rather
// than v1's dark VariantSwitcher chrome — v2 page background is white,
// dark pills would clash.
//
// Each button navigates to /fireflies-v2/<proposal-id> and intentionally
// drops the ?firefly param so the new proposal's defaultFirefly boots.
// Preserves ?view, ?curtain, ?mode so switching proposal doesn't reset
// the viewpoint / curtain / experience-mode toggle.

export default function ProposalSwitcher() {
  const { proposalId } = useProposal()
  const [searchParams] = useSearchParams()

  const urlFor = (newProposalId) => {
    const params = new URLSearchParams()
    const view = searchParams.get('view')
    const curtain = searchParams.get('curtain')
    const mode = searchParams.get('mode')
    if (view) params.set('view', view)
    if (curtain) params.set('curtain', curtain)
    if (mode) params.set('mode', mode)
    const qs = params.toString()
    return `/fireflies-v2/${newProposalId}${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="fixed top-4 left-4 z-20 flex gap-1">
      {proposalVariantList.map((v) => {
        const active = proposalId === v.id
        return (
          <Link
            key={v.id}
            to={urlFor(v.id)}
            className={`text-[11px] font-mono px-3 py-1.5 rounded border transition-colors cursor-pointer ${
              active
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
            }`}
          >
            {v.label}
          </Link>
        )
      })}
    </div>
  )
}
