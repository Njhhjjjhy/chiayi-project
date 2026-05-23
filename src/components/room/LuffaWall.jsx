import * as THREE from 'three'
import { ROOM, WALL_T } from '../../geometry/dimensions.js'

// Warm-lit placeholder panel against the front-wall, inside the forest.
// Stand-in for a hand-woven fibre wall feature the final installation
// will carry. Renders as a 2.0 × 1.8 m emissive panel plus a short-range
// point light that washes the surrounding wall.
//
// Spec section 3.1 places the centre at X = ROOM.W - WALL_T/2 (= 8.77),
// but in v2 the front-wall body extends inward from the nominal line so
// 8.77 sits inside the wall mesh. Same Option A pattern as the curtain:
// offset the panel just in front of the wall's room-facing surface.
//
// Z = 3.5 ESTIMATE — position confirmed on install day.

const LUFFA_OFFSET = 0.005

export default function LuffaWall() {
  return (
    <group>
      <mesh
        position={[ROOM.W - WALL_T - LUFFA_OFFSET, 0.9, 3.5]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[2.0, 1.8]} />
        {/* lit-no-bloom: deeper amber than a paper-lantern read. The
            rendering-upgrade plan proposed #fff0cc × 1.4 here; deferred
            as a design decision pending client review. */}
        <meshStandardMaterial
          color="#3a2a10"
          emissive="#5a3a10"
          emissiveIntensity={0.3}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight
        position={[8.5, 0.9, 3.5]}
        color="#ffd080"
        intensity={0.4}
        distance={2.0}
      />
    </group>
  )
}
