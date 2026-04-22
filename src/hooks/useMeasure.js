import { createContext, useContext } from 'react'

export const MeasureContext = createContext(null)

export function useMeasure() {
  const ctx = useContext(MeasureContext)
  if (!ctx) throw new Error('useMeasure must be used within MeasureProvider')
  return ctx
}
