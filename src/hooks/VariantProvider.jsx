import { useState, useCallback } from 'react'
import { VariantContext } from './useVariant.js'
import { variantCategories } from '../variants/config.js'
import { DEFAULT_VARIANTS } from '../variants/defaults.js'

export function VariantProvider({ children }) {
  const [selections, setSelections] = useState({ ...DEFAULT_VARIANTS })
  const [viewMode, setViewMode] = useState('experience')
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
      // eslint-disable-next-line no-unused-vars -- strip savedAt from stored favorite
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
        randomize, favorites, saveFavorite, loadFavorite, removeFavorite,
      }}
    >
      {children}
    </VariantContext.Provider>
  )
}
