import { useVariant } from '../../hooks/useVariant.js'
import { DEFAULT_VARIANTS } from '../../variants/defaults.js'
import BambooLattice from './BambooLattice.jsx'

const COMPONENTS = {
  none: () => null,
  bambooLattice: BambooLattice,
}

export default function WallCoveringSystem() {
  const { selections } = useVariant()
  const variantId = selections.wallCovering || DEFAULT_VARIANTS.wallCovering
  const Component = COMPONENTS[variantId] || COMPONENTS[DEFAULT_VARIANTS.wallCovering]
  return <Component />
}
