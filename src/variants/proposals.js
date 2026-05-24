// Canonical registry for the two real design proposals shown in the
// /fireflies route. The proposal switcher reads this list to render
// its toggle, and downstream components (Branches, WallLighting) read
// the active proposal's `hasBranches` and `wallLight` flags via the
// ProposalProvider context.
//
// Adding a new proposal here automatically exposes it to the switcher.

export const proposalVariants = {
  'fireflies-suspended-sky': {
    id: 'fireflies-suspended-sky',
    label: 'Fireflies suspended sky',
    hasBranches: false,
    ledSurface: 'ceiling',
    wallLight: 'sundown',
    defaultFirefly: 'awakening',
    isDefault: true,
    // TODO: flashlight spec — IR wavelength, body glow method, charging method, supplier
  },
  'fireflies-within-reach': {
    id: 'fireflies-within-reach',
    label: 'Fireflies within reach',
    hasBranches: true,
    ledSurface: 'ceiling',
    wallLight: 'horizon-line',
    defaultFirefly: 'drifting-swarm',
    isDefault: false,
    // TODO: flashlight spec — IR wavelength, body glow method, charging method, supplier
  },
  'fireflies-flock': {
    id: 'fireflies-flock',
    label: 'Fireflies flock',
    hasBranches: false,
    ledSurface: 'flock',
    wallLight: 'sundown',
    defaultFirefly: 'awakening',
    isDefault: false,
  },
  'fireflies-grove': {
    id: 'fireflies-grove',
    label: 'Fireflies grove',
    hasBranches: false,
    ledSurface: 'grove',
    wallLight: 'sundown',
    defaultFirefly: 'awakening',
    isDefault: false,
  },
  'fireflies-lanterns': {
    id: 'fireflies-lanterns',
    label: 'Fireflies lanterns',
    hasBranches: false,
    ledSurface: 'lanterns',
    wallLight: 'sundown',
    defaultFirefly: 'awakening',
    isDefault: false,
  },
  'fireflies-nesting': {
    id: 'fireflies-nesting',
    label: 'Fireflies nesting',
    hasBranches: false,
    hasNesting: true,
    ledSurface: 'nesting-hybrid',
    wallLight: 'sundown',
    defaultFirefly: 'off',
    isDefault: false,
  },
}

export const proposalVariantList = Object.values(proposalVariants)

export const defaultProposalId =
  proposalVariantList.find((v) => v.isDefault)?.id ?? proposalVariantList[0].id
