import { useVariant } from '../../hooks/useVariant.jsx'
import LivingMossWall from './LivingMossWall.jsx'
import ReflectiveFractureWall from './ReflectiveFractureWall.jsx'
import FiberVeilWall from './FiberVeilWall.jsx'
import ProjectionReactiveWall from './ProjectionReactiveWall.jsx'

const WALL_COMPONENTS = {
  livingMoss: LivingMossWall,
  reflectiveFracture: ReflectiveFractureWall,
  fiberVeil: FiberVeilWall,
  projectionReactive: ProjectionReactiveWall,
}

export default function WallSystem() {
  const { selections } = useVariant()

  const variantId = selections.wall || 'livingMoss'
  const WallComponent = WALL_COMPONENTS[variantId] || LivingMossWall

  return <WallComponent />
}
