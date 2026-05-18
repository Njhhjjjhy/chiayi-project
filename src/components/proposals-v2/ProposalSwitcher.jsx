import { Link, useSearchParams } from 'react-router-dom'
import { useProposal } from '../../hooks/useProposal-v2.js'
import { proposalVariantList } from '../../variants/proposals-v2.js'
import Glass, { EASE_OUT } from '../Glass'

// Top-left proposal toggle. Glass pill row matching the v1 chrome
// aesthetic — same min-h-[44px] tap target and text-sm size as
// ScenePicker / FireflyPicker on v1.
//
// Each pill navigates to /fireflies-v2/<proposal-id> and intentionally
// drops the ?firefly param so the new proposal's defaultFirefly boots.
// Preserves ?view, ?curtain, ?mode so switching proposal doesn't reset
// the viewpoint / curtain / experience-mode toggle.

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

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
    <div className="fixed top-4 left-4 z-10 select-none">
      <Glass className="rounded-full flex items-center gap-1 p-1">
        {proposalVariantList.map((v) => {
          const active = proposalId === v.id
          return (
            <Link
              key={v.id}
              to={urlFor(v.id)}
              style={TRANSITION}
              className={`min-h-[44px] px-4 flex items-center rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {v.label}
            </Link>
          )
        })}
      </Glass>
    </div>
  )
}
