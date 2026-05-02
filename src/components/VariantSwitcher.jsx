import { useState } from 'react'
import { variantCategories, viewModes } from '../variants/config'
import { useVariant } from '../hooks/useVariant.js'
import { useTour } from '../hooks/useTour.js'
import { useMeasure } from '../hooks/useMeasure.js'
import Glass, { EASE_OUT, ChevronUp, ChevronDown, CloseGlyph } from './Glass'

const TRANSITION = {
  transitionDuration: '280ms',
  transitionTimingFunction: EASE_OUT,
}

function VariantDescription({ variant, onClose }) {
  if (!variant?.description) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <Glass
        className="relative rounded-2xl max-w-sm w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[12px] uppercase tracking-[0.08em] text-[#a1a1a6] mb-2">
          {variant.label}
        </div>
        <div className="text-[15px] leading-relaxed text-white/90">
          {variant.description}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={TRANSITION}
          className="absolute top-3 right-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
        >
          <CloseGlyph size={12} />
        </button>
      </Glass>
    </div>
  )
}

function CategorySection({ categoryKey, label, variants }) {
  const [open, setOpen] = useState(false)
  const { selections, selectVariant } = useVariant()
  const hasVariants = variants.length > 0
  const activeId = selections[categoryKey]

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => hasVariants && setOpen(!open)}
        style={TRANSITION}
        className={`w-full flex items-center justify-between px-4 min-h-[44px] text-left text-[15px] transition-colors ${
          hasVariants
            ? 'text-white/90 hover:bg-white/[0.06] cursor-pointer'
            : 'text-white/35 cursor-default'
        }`}
      >
        <span>{label}</span>
        {hasVariants ? (
          open ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        ) : (
          <span className="text-[12px] uppercase tracking-[0.08em] text-white/35">none</span>
        )}
      </button>
      {open && hasVariants && (
        <div className="px-2 pb-2 space-y-1">
          {variants.map((v) => {
            const isActive = activeId === v.id
            return (
              <div key={v.id} className="flex items-center gap-1">
                <button
                  onClick={() => selectVariant(categoryKey, v.id)}
                  style={TRANSITION}
                  className={`flex-1 text-left text-[15px] min-h-[40px] px-3 rounded-full cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/75 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {v.label}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function VariantSwitcher({ hideViewMode = false, hideCategories = [] } = {}) {
  const {
    viewMode, setViewMode, randomize,
    favorites, saveFavorite, loadFavorite, removeFavorite,
    isConstruction, walkMode, setWalkMode,
  } = useVariant()
  const { active: tourActive } = useTour()
  const {
    measureMode, toggleMeasure, measurements,
    removeMeasurement, clearMeasurements, pendingPoint,
  } = useMeasure()
  const [collapsed, setCollapsed] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)

  if (tourActive) return null

  if (walkMode) {
    return (
      <Glass className="fixed top-4 left-4 z-10 select-none rounded-2xl overflow-hidden w-72">
        <div className="px-4 py-3 text-[12px] uppercase tracking-[0.08em] text-white/55 border-b border-white/10">
          Walk mode
        </div>
        <div className="px-4 py-3 text-[13px] text-white/80 space-y-1.5 leading-relaxed">
          <div className="text-white/95">Click anywhere on the scene to start.</div>
          <div><span className="text-white">↑ ↓ ← →</span><span className="text-white/55">  walk</span></div>
          <div><span className="text-white">Shift</span><span className="text-white/55">  sprint · </span><span className="text-white">Mouse</span><span className="text-white/55">  look</span></div>
          <div><span className="text-white">Esc</span><span className="text-white/55">  exit</span></div>
        </div>
        <button
          onClick={() => setWalkMode(false)}
          style={TRANSITION}
          className="w-full min-h-[44px] px-4 text-[15px] text-left text-white/85 hover:text-white hover:bg-white/[0.06] cursor-pointer border-t border-white/10 transition-colors"
        >
          Exit walk mode
        </button>
      </Glass>
    )
  }

  return (
    <div
      className="fixed top-4 left-4 z-10 select-none max-h-[calc(100vh-140px)] overflow-y-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <Glass className="rounded-2xl overflow-hidden w-64">
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={TRANSITION}
          className="w-full flex items-center justify-between px-4 min-h-[44px] text-[12px] uppercase tracking-[0.08em] text-white/85 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
        >
          <span>Variants</span>
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>

        {!collapsed && (
          <>
            {/* View mode toggle */}
            {!hideViewMode && (
              <div className="px-3 py-2 border-t border-white/10">
                <div className="flex rounded-full p-0.5 border border-white/10 gap-0.5">
                  {Object.entries(viewModes).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setViewMode(key)}
                      style={TRANSITION}
                      className={`flex-1 min-h-[36px] text-[13px] rounded-full cursor-pointer transition-colors ${
                        viewMode === key
                          ? 'bg-white/15 text-white'
                          : 'text-white/65 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Walk mode trigger */}
            <div className="px-3 py-2 border-t border-white/10">
              <button
                onClick={() => setWalkMode(true)}
                style={TRANSITION}
                className="w-full min-h-[44px] text-[15px] rounded-full border border-white/20 text-white/85 hover:text-white hover:border-white/40 cursor-pointer transition-colors"
              >
                Walk
              </button>
            </div>

            {/* Category sections */}
            <div className="border-t border-white/10">
              {Object.entries(variantCategories)
                .filter(([key]) => !hideCategories.includes(key))
                .map(([key, cat]) => (
                  <CategorySection
                    key={key}
                    categoryKey={key}
                    label={cat.label}
                    variants={cat.variants}
                  />
                ))}
            </div>

            {/* Ruler — construction mode only */}
            {isConstruction && (
              <div className="px-3 py-2 border-t border-white/10">
                <button
                  onClick={toggleMeasure}
                  style={TRANSITION}
                  className={`w-full flex items-center justify-between min-h-[44px] px-4 rounded-full text-[15px] cursor-pointer transition-colors ${
                    measureMode
                      ? 'bg-white/15 text-white border border-white/30'
                      : 'border border-white/15 text-white/85 hover:text-white hover:border-white/30'
                  }`}
                >
                  <span>{measureMode ? 'Measuring…' : 'Ruler'}</span>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-white/55">
                    {measureMode ? 'on' : 'off'}
                  </span>
                </button>
                {measureMode && (
                  <div className="mt-2 text-[13px] text-white/70">
                    {pendingPoint ? 'Click second point' : 'Click first point'}
                  </div>
                )}
                {measurements.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] uppercase tracking-[0.08em] text-white/55">
                        Measurements ({measurements.length})
                      </span>
                      <button
                        onClick={clearMeasurements}
                        style={TRANSITION}
                        className="text-[13px] text-white/65 hover:text-white cursor-pointer transition-colors px-2 py-1"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {measurements.map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-3 py-1.5 rounded-full bg-white/[0.06]">
                          <span className="text-[13px] text-white/90 font-mono">
                            {m.distance.toFixed(2)}m
                          </span>
                          <button
                            onClick={() => removeMeasurement(m.id)}
                            aria-label="Remove measurement"
                            style={TRANSITION}
                            className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full text-white/55 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
                          >
                            <CloseGlyph size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="px-3 py-2 border-t border-white/10 flex gap-2">
              <button
                onClick={randomize}
                style={TRANSITION}
                className="flex-1 min-h-[44px] text-[15px] rounded-full border border-white/15 text-white/85 hover:text-white hover:border-white/35 cursor-pointer transition-colors"
              >
                Randomize
              </button>
              <button
                onClick={saveFavorite}
                style={TRANSITION}
                className="flex-1 min-h-[44px] text-[15px] rounded-full border border-white/15 text-white/85 hover:text-white hover:border-white/35 cursor-pointer transition-colors"
              >
                Save combo
              </button>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="px-3 py-2 border-t border-white/10">
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  style={TRANSITION}
                  className="w-full flex items-center justify-between min-h-[44px] text-[15px] text-white/85 hover:text-white cursor-pointer transition-colors"
                >
                  <span>Saved ({favorites.length})</span>
                  {showFavorites ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {showFavorites && (
                  <div className="mt-1 space-y-1">
                    {favorites.map((fav, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <button
                          onClick={() => loadFavorite(i)}
                          style={TRANSITION}
                          className="flex-1 text-left text-[15px] min-h-[40px] px-3 rounded-full bg-white/[0.06] text-white/85 hover:text-white hover:bg-white/[0.12] truncate cursor-pointer transition-colors"
                        >
                          #{i + 1}
                        </button>
                        <button
                          onClick={() => removeFavorite(i)}
                          aria-label="Remove favourite"
                          style={TRANSITION}
                          className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-white/55 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
                        >
                          <CloseGlyph size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Glass>
    </div>
  )
}
