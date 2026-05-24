import { useState } from 'react'
import { ProposalContext } from './useProposal.js'
import { proposalVariants, defaultProposalId } from '../variants/proposals.js'

// Holds the active proposal id and exposes the active proposal's flags
// (`hasBranches`, `wallLight`) to consumers via ProposalContext.
//
// Wrap any tree that uses useProposal() with this provider. If a non-
// existent id ever lands in state we fall back to the default proposal
// — defensive, since the URL can hand us arbitrary strings.

export function ProposalProvider({ children }) {
  const [proposalId, setProposalId] = useState(defaultProposalId)
  const active = proposalVariants[proposalId] ?? proposalVariants[defaultProposalId]

  return (
    <ProposalContext.Provider
      value={{
        proposalId,
        setProposalId,
        hasBranches: active.hasBranches,
        hasNesting: active.hasNesting ?? false,
        ledSurface: active.ledSurface,
        wallLight: active.wallLight,
        defaultFirefly: active.defaultFirefly,
      }}
    >
      {children}
    </ProposalContext.Provider>
  )
}
