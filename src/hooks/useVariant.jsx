import { create } from 'zustand'

// Removed zustand dependency — using simple React context instead
// to avoid adding another dependency. Can switch to zustand later if needed.

import { createContext, useContext, useState, useCallback } from 'react'

const VariantContext = createContext(null)

export function VariantProvider({ children }) {
  const [selections, setSelections] = useState({
    mountainWall: null,
    lighting: null,
    fireflies: null,
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
