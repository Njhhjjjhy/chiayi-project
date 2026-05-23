import { ROOM } from '../../geometry/dimensions.js'

// Flat dark floor plane covering the full room footprint at Y = 0.
// Standard structural emissive material at half the wall intensity, so
// the floor reads marginally darker than the walls — keeps the eye
// drawn upward into the panel ceiling instead of down to the floor.

export default function Floor() {
  return (
    <mesh
      position={[ROOM.W / 2, 0, ROOM.D / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[ROOM.W, ROOM.D]} />
      <meshStandardMaterial
        color="#1a1a1a"
        emissive="#1a1a1a"
        emissiveIntensity={0.04}
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  )
}
