import { useNavigate } from 'react-router-dom'
import { proposalVariants } from '../../proposals/variants.js'
import { useProposals } from '../../hooks/useProposals.js'

// Select two variants from the built set. A click on the flip button
// toggles the current variant between A and B. Disabled while fewer
// than two variants are built.

export default function ABToggle() {
  const { abPair, currentVariantId } = useProposals()
  const navigate = useNavigate()
  const builtVariants = proposalVariants.filter((v) => v.component)
  const enabled = builtVariants.length >= 2
  const [a, b] = abPair
  const canFlip = enabled && !!a && !!b

  function flip() {
    if (!canFlip) return
    const next = currentVariantId === a ? b : a
    navigate(`/proposals/${next}`)
  }

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 backdrop-blur-sm rounded ${
        enabled ? '' : 'opacity-40 pointer-events-none'
      }`}
      aria-disabled={!enabled}
    >
      <span className="text-[9px] uppercase tracking-widest text-white/40 mr-1">A/B</span>
      <ABSelect slot={0} />
      <button
        onClick={flip}
        disabled={!canFlip}
        aria-label="Flip between A and B"
        className={`w-6 text-[12px] ${
          canFlip
            ? 'text-white/80 hover:text-white cursor-pointer'
            : 'text-white/25 cursor-not-allowed'
        }`}
      >
        ⇄
      </button>
      <ABSelect slot={1} />
      <span className="text-[9px] uppercase tracking-widest text-white/40 ml-1">
        {enabled ? 'click ⇄ to flip' : 'needs ≥2 built'}
      </span>
    </div>
  )
}

function ABSelect({ slot }) {
  const { abPair, setAbPair } = useProposals()
  const value = abPair[slot] || ''
  const options = proposalVariants.filter((v) => v.component)

  return (
    <select
      value={value}
      onChange={(e) => {
        const next = [...abPair]
        next[slot] = e.target.value || null
        setAbPair(next)
      }}
      aria-label={slot === 0 ? 'A/B slot A' : 'A/B slot B'}
      className="bg-black/60 text-[10px] text-white/75 border border-white/15 rounded px-1.5 py-0.5"
    >
      <option value="">—</option>
      {options.map((v) => (
        <option key={v.id} value={v.id}>{v.label}</option>
      ))}
    </select>
  )
}
