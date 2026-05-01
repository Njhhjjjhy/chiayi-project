import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { proposalVariants } from '../../proposals/variants.js'
import { useProposals } from '../../hooks/useProposals.js'

// Chip bar for selecting a proposal variant. Six chips, one per
// registry entry. Hotkeys 1–6 select by index. Hover shows a styled
// info panel above the bar with label, emotional register, and any
// flagged notes. Chips whose variant has no component yet are
// visually dimmed but still clickable (the page renders a "not yet
// built" banner while the null variant is drawn as the fallback).

export default function VariantPicker() {
  const navigate = useNavigate()
  const { currentVariantId } = useProposals()
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const selectByIndex = useCallback((idx) => {
    const v = proposalVariants[idx]
    if (!v) return
    navigate(`/proposals/${v.id}`)
  }, [navigate])

  useEffect(() => {
    function handleKey(e) {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      const n = parseInt(e.key, 10)
      if (Number.isFinite(n) && n >= 1 && n <= proposalVariants.length) {
        selectByIndex(n - 1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectByIndex])

  const hovered = hoveredIdx !== null ? proposalVariants[hoveredIdx] : null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
      {hovered && (
        <div className="mb-3 max-w-lg mx-auto px-4 py-2 bg-black/70 border border-white/10 backdrop-blur-sm rounded text-[11px] leading-relaxed">
          <div className="text-white/90">{hovered.label}</div>
          <div className="text-white/55 italic mt-0.5">{hovered.emotionalRegister}</div>
          {hovered.notes && (
            <div className="text-white/40 mt-1">{hovered.notes}</div>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {proposalVariants.map((v, i) => {
          const isActive = v.id === currentVariantId
          const isBuilt = !!v.component
          return (
            <button
              key={v.id}
              onClick={() => selectByIndex(i)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onFocus={() => setHoveredIdx(i)}
              onBlur={() => setHoveredIdx(null)}
              aria-current={isActive ? 'true' : undefined}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border rounded transition-colors cursor-pointer ${
                isActive
                  ? 'text-white border-white/45 bg-white/5'
                  : isBuilt
                    ? 'text-white/65 border-white/15 hover:text-white/95 hover:border-white/35'
                    : 'text-white/30 border-white/10 hover:text-white/55 hover:border-white/20'
              }`}
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            >
              <span className="mr-1.5 opacity-50">{i + 1}</span>
              {v.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
