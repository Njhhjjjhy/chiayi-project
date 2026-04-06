import { useState } from 'react'
import { variantCategories, viewModes, cameraPresets } from '../variants/config'
import { useVariant } from '../hooks/useVariant.jsx'
import { useTour } from '../hooks/useTour.jsx'

function VariantDescription({ variant, onClose }) {
  if (!variant?.description) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-black/90 border border-white/15 rounded-xl max-w-sm w-full p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white/80 text-sm font-medium tracking-wide mb-2">
          {variant.label}
        </div>
        <div className="text-white/50 text-xs leading-relaxed">
          {variant.description}
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/20 hover:text-white/50 text-xs cursor-pointer transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function CategorySection({ categoryKey, label, variants, onShowInfo }) {
  const [open, setOpen] = useState(false)
  const { selections, selectVariant } = useVariant()
  const hasVariants = variants.length > 0
  const activeId = selections[categoryKey]

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => hasVariants && setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
          hasVariants
            ? 'hover:bg-white/5 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none'
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
        <div className="px-3 pb-2">
          {variants.map((v) => {
            const isActive = activeId === v.id
            return (
              <div key={v.id} className="flex items-center gap-1">
                <button
                  onClick={() => selectVariant(categoryKey, v.id)}
                  className={`flex-1 text-left text-xs py-1.5 px-2 rounded transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {v.label}
                </button>
                {v.description && (
                  <button
                    onClick={() => onShowInfo(v)}
                    className="text-[10px] text-white/20 hover:text-white/50 cursor-pointer transition-colors px-1 py-1"
                    title="Info"
                  >
                    ?
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function VariantSwitcher({ onCameraPreset }) {
  const { viewMode, setViewMode, showSeating, setShowSeating, randomize, favorites, saveFavorite, loadFavorite, removeFavorite } = useVariant()
  const { active: tourActive, startTour } = useTour()
  const [collapsed, setCollapsed] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [infoVariant, setInfoVariant] = useState(null)

  // Hide switcher during guided tour
  if (tourActive) return null

  return (
    <div
      className="fixed top-4 left-4 z-10 select-none max-h-[calc(100vh-120px)] overflow-y-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
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

            {/* Present button */}
            <div className="px-3 py-2 border-t border-white/10">
              <button
                onClick={() => startTour({ viewMode, showSeating })}
                className="w-full text-[10px] py-1.5 rounded bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 cursor-pointer transition-colors uppercase tracking-wider"
              >
                Present
              </button>
            </div>

            {/* Camera presets */}
            <div className="px-3 py-2 border-t border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Camera</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(cameraPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => onCameraPreset && onCameraPreset(preset)}
                    className="text-[10px] px-1.5 py-1 rounded bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category sections */}
            <div className="border-t border-white/10">
              {Object.entries(variantCategories).map(([key, cat]) => (
                <CategorySection
                  key={key}
                  categoryKey={key}
                  label={cat.label}
                  variants={cat.variants}
                  onShowInfo={setInfoVariant}
                />
              ))}
            </div>

            {/* Seating toggle */}
            <div className="px-3 py-2 border-t border-white/10">
              <button
                onClick={() => setShowSeating(!showSeating)}
                className={`w-full text-[10px] py-1.5 rounded transition-colors cursor-pointer ${
                  showSeating
                    ? 'bg-white/15 text-white'
                    : 'bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10'
                }`}
              >
                {showSeating ? 'Seating visible' : 'Show seating'}
              </button>
            </div>

            {/* Actions */}
            <div className="px-3 py-2 border-t border-white/10 flex gap-2">
              <button
                onClick={randomize}
                className="flex-1 text-[10px] py-1.5 rounded bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10 cursor-pointer transition-colors"
              >
                Randomize
              </button>
              <button
                onClick={saveFavorite}
                className="flex-1 text-[10px] py-1.5 rounded bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10 cursor-pointer transition-colors"
              >
                Save combo
              </button>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="px-3 py-2 border-t border-white/10">
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="w-full flex items-center justify-between text-[10px] uppercase tracking-wider text-white/30 cursor-pointer"
                >
                  <span>Saved ({favorites.length})</span>
                  <span>{showFavorites ? '−' : '+'}</span>
                </button>
                {showFavorites && (
                  <div className="mt-1.5 space-y-1">
                    {favorites.map((fav, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <button
                          onClick={() => loadFavorite(i)}
                          className="flex-1 text-left text-[10px] py-1 px-1.5 rounded bg-white/5 text-white/35 hover:text-white/60 hover:bg-white/10 cursor-pointer truncate transition-colors"
                        >
                          #{i + 1}
                        </button>
                        <button
                          onClick={() => removeFavorite(i)}
                          className="text-[10px] px-1 text-white/20 hover:text-white/50 cursor-pointer"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {infoVariant && (
        <VariantDescription variant={infoVariant} onClose={() => setInfoVariant(null)} />
      )}
    </div>
  )
}
