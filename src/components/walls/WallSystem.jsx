import { useVariant } from '../../hooks/useVariant.jsx'
import LivingMossWall from './LivingMossWall.jsx'
import LayeredMountainWall from './LayeredMountainWall.jsx'
import ReflectiveFractureWall from './ReflectiveFractureWall.jsx'
import FiberVeilWall from './FiberVeilWall.jsx'
import ProjectionReactiveWall from './ProjectionReactiveWall.jsx'

const WALL_COMPONENTS = {
  livingMoss: LivingMossWall,
  layeredMountain: LayeredMountainWall,
  reflectiveFracture: ReflectiveFractureWall,
  fiberVeil: FiberVeilWall,
  projectionReactive: ProjectionReactiveWall,
}

export default function WallSystem() {
  const { selections } = useVariant()

  const variantId = selections.wall || 'layeredMountain'
  const WallComponent = WALL_COMPONENTS[variantId] || LayeredMountainWall

  return <WallComponent />
}
