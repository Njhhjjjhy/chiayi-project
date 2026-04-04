import { useVariant } from '../hooks/useVariant.jsx'
import Ceiling from './Ceiling.jsx'
import Floor from './Floor.jsx'

const WALL_THICKNESS = 0.1

export default function Room({ width = 10, depth = 10, height = 3.5 }) {
  const { viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'

  const materialProps = isConstruction
    ? { wireframe: true, color: '#444' }
    : { color: '#0e0e0e' }

  const halfW = width / 2
  const halfD = depth / 2
  const halfH = height / 2

  return (
    <group>
      {/* Floor — variant-driven */}
      <Floor />

      {/* Ceiling — variant-driven */}
      <Ceiling />

      {/* Back wall removed — replaced by MountainWall component */}

      {/* Front wall (behind the viewer) */}
      <mesh position={[0, halfH, halfD]}>
        <boxGeometry args={[width, height, WALL_THICKNESS]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-halfW, halfH, 0]}>
        <boxGeometry args={[WALL_THICKNESS, height, depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW, halfH, 0]}>
        <boxGeometry args={[WALL_THICKNESS, height, depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </group>
  )
}
