import * as THREE from 'three'
import { ROOM, HD } from '../../geometry/dimensions.js'

// Dark navy blackout curtain hung 4 cm in front of the back wall (z = +HD),
// covering the back-wall surface in full. Front face points toward the
// entrance (-Z) so it reads as a solid black-out from any in-room camera.

export default function TheatricalCurtain() {
  return (
    <mesh
      position={[0, ROOM.H / 2, HD - 0.04]}
      rotation={[0, Math.PI, 0]}
    >
      <planeGeometry args={[ROOM.W, ROOM.H]} />
      <meshStandardMaterial
        color="#0d1b2a"
        roughness={0.95}
        metalness={0}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}
