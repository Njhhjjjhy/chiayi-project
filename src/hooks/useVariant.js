import { createContext, useContext } from 'react'

export const VariantContext = createContext(null)

export function useVariant() {
  const ctx = useContext(VariantContext)
  if (!ctx) throw new Error('useVariant must be used within VariantProvider')
  return ctx
}
