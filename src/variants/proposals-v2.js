// Canonical registry for the two real design proposals shown in the
// /fireflies-v2 route. The proposal switcher reads this list to render
// its toggle, and downstream components (Branches, WallLighting) read
// the active proposal's `hasBranches` and `wallLight` flags via the
// ProposalProvider context.
//
// Adding a new proposal here automatically exposes it to the switcher.

export const proposalVariants = {
  'fireflies-folded-sky': {
    id: 'fireflies-folded-sky',
    label: 'Fireflies folded sky',
    hasBranches: false,
    wallLight: 'sundown',
    defaultFirefly: 'awakening',
    isDefault: true,
  },
  'fireflies-within-reach': {
    id: 'fireflies-within-reach',
    label: 'Fireflies within reach',
    hasBranches: true,
    wallLight: 'horizon-line',
    defaultFirefly: 'drifting-swarm',
    isDefault: false,
  },
}

export const proposalVariantList = Object.values(proposalVariants)

export const defaultProposalId =
  proposalVariantList.find((v) => v.isDefault)?.id ?? proposalVariantList[0].id
