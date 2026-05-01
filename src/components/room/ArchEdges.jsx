import { Edges } from '@react-three/drei'
import { useVariant } from '../../hooks/useVariant.js'

// Drop-in <ArchEdges /> child for any construction-mode mesh. Renders
// only the actual box/plane edges (via EdgesGeometry) — no triangulation
// diagonals. Returns null outside construction mode.

export default function ArchEdges({ color = '#444', threshold = 15 }) {
  const { isConstruction } = useVariant()
  if (!isConstruction) return null
  return <Edges color={color} threshold={threshold} />
}
