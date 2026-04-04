import { useVariant } from '../hooks/useVariant.jsx'

const WALL_THICKNESS = 0.1

export default function Room({ width = 10, depth = 10, height = 3.5 }) {
  const { viewMode } = useVariant()
  const isConstruction = viewMode === 'construction'

  const materialProps = isConstruction
    ? { wireframe: true, color: '#444' }
    : { color: '#1a1a1a' }

  const halfW = width / 2
  const halfD = depth / 2
  const halfH = height / 2

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Back wall (mountain wall placeholder — will be replaced in phase 2) */}
      <mesh position={[0, halfH, -halfD]}>
        <boxGeometry args={[width, height, WALL_THICKNESS]} />
        <meshStandardMaterial
          {...materialProps}
          color={isConstruction ? '#556' : '#222'}
        />
      </mesh>

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
