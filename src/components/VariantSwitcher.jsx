import { useState } from 'react'
import { variantCategories, viewModes } from '../variants/config'
import { useVariant } from '../hooks/useVariant.jsx'

function CategorySection({ label, variants }) {
  const [open, setOpen] = useState(false)
  const hasVariants = variants.length > 0

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => hasVariants && setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
          hasVariants
            ? 'hover:bg-white/5 cursor-pointer'
            : 'opacity-40 cursor-default'
        }`}
      >
        <span>{label}</span>
        {hasVariants ? (
          <span className="text-xs text-white/40">{open ? '−' : '+'}</span>
        ) : (
          <span className="text-xs text-white/30">no variants yet</span>
        )}
      </button>
      {open && hasVariants && (
        <div className="px-3 pb-2 text-xs text-white/50">
          {variants.map((v) => (
            <div key={v.id} className="py-1">
              {v.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function VariantSwitcher() {
  const { viewMode, setViewMode } = useVariant()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="fixed top-4 left-4 z-10 select-none">
      <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden w-56">
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-white/60 hover:bg-white/5 cursor-pointer"
        >
          <span>Variants</span>
          <span>{collapsed ? '+' : '−'}</span>
        </button>

        {!collapsed && (
          <>
            {/* View mode toggle */}
            <div className="px-3 py-2 border-t border-white/10">
              <div className="flex rounded bg-white/5 p-0.5">
                {Object.entries(viewModes).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className={`flex-1 text-xs py-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === key
                        ? 'bg-white/15 text-white'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category sections */}
            <div className="border-t border-white/10">
              {Object.entries(variantCategories).map(([key, cat]) => (
                <CategorySection
                  key={key}
                  label={cat.label}
                  variants={cat.variants}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
