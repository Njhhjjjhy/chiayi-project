import { useProposal } from '../../hooks/useProposal-v2.js'
import { proposalVariantList } from '../../variants/proposals-v2.js'

// Two-button toggle for the v2 design proposals. Styled to match the
// other v2 verification UI (monospace, bordered buttons on white) rather
// than v1's dark VariantSwitcher chrome — v2 page background is white,
// dark pills would clash.

export default function ProposalSwitcher() {
  const { proposalId, setProposalId } = useProposal()

  return (
    <div className="fixed top-4 left-4 z-20 flex gap-1">
      {proposalVariantList.map((v) => {
        const active = proposalId === v.id
        return (
          <button
            key={v.id}
            onClick={() => setProposalId(v.id)}
            className={`text-[11px] font-mono px-3 py-1.5 rounded border transition-colors cursor-pointer ${
              active
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
            }`}
          >
            {v.label}
          </button>
        )
      })}
    </div>
  )
}
