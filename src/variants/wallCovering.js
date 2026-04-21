// Wall-covering proposal variants. Each variant covers all four walls above the
// wainscoting (entrance-wall has no wainscot so covers from floor). Door areas
// are always skipped. Toggle between proposals via the variant picker to A/B.
export const wallCoveringVariants = {
  none: {
    id: 'none',
    label: 'None (bare existing walls)',
    description: 'No covering. Cream walls + dark wainscoting visible — the "before" state.',
  },
  bambooLattice: {
    id: 'bambooLattice',
    label: 'Bamboo lattice',
    description: 'Vertical bamboo poles spaced sparsely along each wall. See-through, forest grove.',
  },
}

export const wallCoveringVariantList = Object.values(wallCoveringVariants)
