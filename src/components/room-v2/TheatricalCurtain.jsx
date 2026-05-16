import * as THREE from 'three'
import { ROOM, WALL_T } from '../../geometry/dimensions-v2.js'

// Dark navy fabric plane hanging 4 cm in front of the window-wall's
// room-facing surface, full room width × room height. Always rendered —
// the curtain is a permanent part of the canonical room, not a togglable
// proposal element.
//
// Window-wall room-facing surface is at Z = ROOM.D - WALL_T. The curtain
// sits 4 cm further into the room from that surface so it reads as
// visibly hanging, not pressed against the wall.
//
// DoubleSide so the curtain reads from both sides; the spec says it
// faces inward (-Z) but DoubleSide avoids any rotation ambiguity.

const CURTAIN_OFFSET = 0.04 // metres in front of window-wall surface

export default function TheatricalCurtain() {
  return (
    <mesh
      position={[
        ROOM.W / 2,
        ROOM.H / 2,
        ROOM.D - WALL_T - CURTAIN_OFFSET,
      ]}
    >
      <planeGeometry args={[ROOM.W, ROOM.H]} />
      <meshStandardMaterial
        color="#0a1a2e"
        emissive="#0a1a2e"
        emissiveIntensity={0.06}
        roughness={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
