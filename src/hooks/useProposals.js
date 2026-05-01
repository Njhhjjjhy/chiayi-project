import { createContext, useContext } from 'react'

export const ProposalsContext = createContext(null)

export function useProposals() {
  const ctx = useContext(ProposalsContext)
  if (!ctx) throw new Error('useProposals must be used within ProposalsProvider')
  return ctx
}
