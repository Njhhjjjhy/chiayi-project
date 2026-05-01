import { useState } from 'react'
import { variantCategories, viewModes } from '../variants/config'
import { useVariant } from '../hooks/useVariant.js'
import { useTour } from '../hooks/useTour.js'
import { useMeasure } from '../hooks/useMeasure.js'

function VariantDescription({ variant, onClose }) {
  if (!variant?.description) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white border border-gray-200 rounded-xl max-w-sm w-full p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-black text-sm font-medium mb-2">
          {variant.label}
        </div>
        <div className="text-black text-sm leading-relaxed">
          {variant.description}
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-sm cursor-pointer transition-colors"
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
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => hasVariants && setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
          hasVariants
            ? 'text-black hover:bg-gray-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none'
            : 'text-gray-400 cursor-default'
        }`}
      >
        <span>{label}</span>
        {hasVariants ? (
          <span className="text-sm text-gray-500">{open ? '−' : '+'}</span>
        ) : (
          <span className="text-sm text-gray-400">no variants yet</span>
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
                  className={`flex-1 text-left text-sm py-1.5 px-2 rounded transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-black hover:text-black hover:bg-gray-100'
                  }`}
                >
                  {v.label}
                </button>
                {v.description && (
                  <button
                    onClick={() => onShowInfo(v)}
                    className="text-sm text-gray-400 hover:text-black cursor-pointer transition-colors px-1.5 py-1"
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

export default function VariantSwitcher() {
  const { viewMode, setViewMode, randomize, favorites, saveFavorite, loadFavorite, removeFavorite, isConstruction, walkMode, setWalkMode } = useVariant()
  const { active: tourActive } = useTour()
  const { measureMode, toggleMeasure, measurements, removeMeasurement, clearMeasurements, pendingPoint } = useMeasure()
  const [collapsed, setCollapsed] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [infoVariant, setInfoVariant] = useState(null)

  if (tourActive) return null

  if (walkMode) {
    return (
      <div className="fixed top-4 left-4 z-10 select-none">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden w-72 shadow-lg">
          <div className="px-3 py-2.5 text-sm font-medium text-black border-b border-gray-200">
            Walk mode
          </div>
          <div className="px-3 py-2.5 text-sm text-gray-600 space-y-1">
            <div className="text-black mb-1.5">Click anywhere on the scene to start.</div>
            <div><span className="font-mono text-black">↑ ↓ ← →</span> &nbsp;walk</div>
            <div><span className="font-mono text-black">Shift</span> &nbsp;sprint · <span className="font-mono text-black">Mouse</span> &nbsp;look</div>
            <div><span className="font-mono text-black">Esc</span> &nbsp;exit walk mode</div>
          </div>
          <button
            onClick={() => setWalkMode(false)}
            className="w-full px-3 py-2 text-sm text-left bg-gray-100 text-black hover:bg-gray-200 cursor-pointer border-t border-gray-200"
          >
            Exit walk mode
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed top-4 left-4 z-10 select-none max-h-[calc(100vh-140px)] overflow-y-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden w-64 shadow-lg">
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-black hover:bg-gray-100 cursor-pointer"
        >
          <span>Variants</span>
          <span>{collapsed ? '+' : '−'}</span>
        </button>

        {!collapsed && (
          <>
            {/* View mode toggle */}
            <div className="px-3 py-2 border-t border-gray-200">
              <div className="flex rounded bg-gray-100 p-0.5">
                {Object.entries(viewModes).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className={`flex-1 text-sm py-1.5 rounded transition-colors cursor-pointer ${
                      viewMode === key
                        ? 'bg-gray-900 text-white'
                        : 'text-black hover:text-black hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Walk mode */}
            <div className="px-3 py-2 border-t border-gray-200">
              <button
                onClick={() => setWalkMode(true)}
                className="w-full text-sm py-1.5 rounded bg-gray-900 text-white hover:bg-gray-700 cursor-pointer transition-colors"
              >
                Walk
              </button>
            </div>

            {/* Category sections */}
            <div className="border-t border-gray-200">
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

            {/* Ruler — construction mode only */}
            {isConstruction && (
            <div className="px-3 py-2 border-t border-gray-200">
              <button
                onClick={toggleMeasure}
                className={`w-full flex items-center justify-between text-sm py-1.5 px-2 rounded transition-colors cursor-pointer ${
                  measureMode
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                <span>{measureMode ? 'Measuring...' : 'Ruler'}</span>
                <span className="text-sm">{measureMode ? 'ON' : 'OFF'}</span>
              </button>
              {measureMode && (
                <div className="mt-1.5 text-sm text-gray-500">
                  {pendingPoint ? 'Click second point' : 'Click first point'}
                </div>
              )}
              {measurements.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">
                      Measurements ({measurements.length})
                    </span>
                    <button
                      onClick={clearMeasurements}
                      className="text-sm text-gray-500 hover:text-black cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-0.5 max-h-32 overflow-y-auto">
                    {measurements.map((m) => (
                      <div key={m.id} className="flex items-center justify-between px-2 py-1 rounded bg-gray-100">
                        <span className="text-sm text-red-600 font-mono">
                          {m.distance.toFixed(2)}m
                        </span>
                        <button
                          onClick={() => removeMeasurement(m.id)}
                          className="text-sm text-gray-400 hover:text-black cursor-pointer px-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Actions */}
            <div className="px-3 py-2 border-t border-gray-200 flex gap-2">
              <button
                onClick={randomize}
                className="flex-1 text-sm py-1.5 rounded bg-gray-100 text-black hover:text-black hover:bg-gray-200 cursor-pointer transition-colors"
              >
                Randomize
              </button>
              <button
                onClick={saveFavorite}
                className="flex-1 text-sm py-1.5 rounded bg-gray-100 text-black hover:text-black hover:bg-gray-200 cursor-pointer transition-colors"
              >
                Save combo
              </button>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-200">
                <button
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="w-full flex items-center justify-between text-sm text-black hover:text-black cursor-pointer"
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
                          className="flex-1 text-left text-sm py-1 px-1.5 rounded bg-gray-100 text-black hover:text-black hover:bg-gray-200 cursor-pointer truncate transition-colors"
                        >
                          #{i + 1}
                        </button>
                        <button
                          onClick={() => removeFavorite(i)}
                          className="text-sm px-1 text-gray-400 hover:text-black cursor-pointer"
                        >
                          ×
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
