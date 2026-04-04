import { createContext, useContext, useState, useCallback } from 'react'

const VariantContext = createContext(null)

export function VariantProvider({ children }) {
  const [selections, setSelections] = useState({
    mountainWall: 'softRolling',
    lighting: 'warmDominant',
    fireflies: 'flashLanguage',
    room: null,
  })
  const [viewMode, setViewMode] = useState('experience')

  const selectVariant = useCallback((category, variantId) => {
    setSelections((prev) => ({ ...prev, [category]: variantId }))
  }, [])

  return (
    <VariantContext.Provider
      value={{ selections, selectVariant, viewMode, setViewMode }}
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
