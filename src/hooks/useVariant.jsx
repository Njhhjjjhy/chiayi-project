import { createContext, useContext, useState, useCallback } from 'react'
import { variantCategories } from '../variants/config.js'

const VariantContext = createContext(null)

export function VariantProvider({ children }) {
  const [selections, setSelections] = useState({
    wall: 'livingMoss',
    lighting: 'warmDominant',
    fireflies: 'scatteredDrift',
    ceiling: 'droppedPanelGrid',
    floor: 'forestFloorPBR',
  })
  const [viewMode, setViewMode] = useState('experience')
  const [showSeating, setShowSeating] = useState(false)
  const [favorites, setFavorites] = useState([])

  const selectVariant = useCallback((category, variantId) => {
    setSelections((prev) => ({ ...prev, [category]: variantId }))
  }, [])

  const randomize = useCallback(() => {
    const newSelections = {}
    for (const [key, cat] of Object.entries(variantCategories)) {
      if (cat.variants.length > 0) {
        const rand = Math.floor(Math.random() * cat.variants.length)
        newSelections[key] = cat.variants[rand].id
      }
    }
    setSelections((prev) => ({ ...prev, ...newSelections }))
  }, [])

  const saveFavorite = useCallback(() => {
    setFavorites((prev) => [...prev, { ...selections, savedAt: Date.now() }])
  }, [selections])

  const loadFavorite = useCallback((index) => {
    const fav = favorites[index]
    if (fav) {
      const { savedAt, ...rest } = fav
      setSelections((prev) => ({ ...prev, ...rest }))
    }
  }, [favorites])

  const removeFavorite = useCallback((index) => {
    setFavorites((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <VariantContext.Provider
      value={{
        selections, selectVariant, viewMode, setViewMode,
        isExperience: viewMode === 'experience',
        isConstruction: viewMode === 'construction',
        isLight: viewMode === 'light',
        showSeating, setShowSeating,
        randomize, favorites, saveFavorite, loadFavorite, removeFavorite,
      }}
    >
      {children}
    </VariantContext.Provider>
  )
}

export function useVariant() {
  const ctx = useContext(VariantContext)
  if (!ctx) throw new Error('useVariant must be used within VariantProvider')
  return ctx
}
