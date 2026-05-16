import { createContext, useContext } from 'react'

// Context + hook for the v2 proposal switcher. Mirrors the v1
// useVariant shape: the context is null by default so consumers throw
// loud and clear if they're rendered outside a ProposalProvider — easier
// to catch than a silent fallback.

export const ProposalContext = createContext(null)

export function useProposal() {
  const ctx = useContext(ProposalContext)
  if (!ctx) throw new Error('useProposal must be used within ProposalProvider')
  return ctx
}
