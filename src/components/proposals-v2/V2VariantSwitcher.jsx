import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProposal } from '../../hooks/useProposal-v2.js'
import { proposalVariantList } from '../../variants/proposals-v2.js'
import Glass, { EASE_OUT, ChevronUp, ChevronDown } from '../Glass'

// Top-left Glass panel matching v1's VariantSwitcher visual. Collapsible
// header + expandable category sections. v2's only category right now is
// the proposal toggle (suspended sky / within reach).

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

function CategorySection({ label, items, activeId, urlFor }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        style={TRANSITION}
        className="w-full flex items-center justify-between px-4 min-h-[44px] text-left text-[15px] text-white/90 hover:bg-white/[0.06] cursor-pointer transition-colors"
      >
        <span>{label}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="px-2 pb-2 space-y-1">
          {items.map((item) => {
            const isActive = activeId === item.id
            return (
              <Link
                key={item.id}
                to={urlFor(item.id)}
                style={TRANSITION}
                className={`block text-left text-[15px] min-h-[40px] flex items-center px-3 rounded-full cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/75 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function V2VariantSwitcher() {
  const { proposalId } = useProposal()
  const [searchParams] = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)

  const proposalUrlFor = (newProposalId) => {
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
      <Glass className="rounded-2xl overflow-hidden w-64">
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={TRANSITION}
          className="w-full flex items-center justify-between px-4 min-h-[44px] text-[12px] tracking-[0.08em] text-white/85 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
        >
          <span>Variants</span>
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
        {!collapsed && (
          <div className="border-t border-white/10">
            <CategorySection
              label="Proposal"
              items={proposalVariantList}
              activeId={proposalId}
              urlFor={proposalUrlFor}
            />
          </div>
        )}
      </Glass>
    </div>
  )
}
