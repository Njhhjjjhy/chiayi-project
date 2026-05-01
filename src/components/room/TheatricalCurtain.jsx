import * as THREE from 'three'
import { ROOM, HW, MAIN_WIN_W, MAIN_WIN_Z, INSET } from '../../geometry/dimensions.js'

// Dark navy blackout curtain hung in front of the main glass partition
// on the window wall. Covers the 5.7 m main-glass run flush with the
// back wall, full room height. Stops short of the silver door + HVAC
// plenum on the entrance-wall side, so no clipping.
//
// Always rendered — the curtain is a permanent part of the canonical
// room, not a togglable proposal element.

const OFFSET = 0.04 // metres from window wall into the room

export default function TheatricalCurtain() {
  const x = HW - OFFSET - INSET
  const y = ROOM.H / 2
  const z = MAIN_WIN_Z

  return (
    <mesh
      position={[x, y, z]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <planeGeometry args={[MAIN_WIN_W, ROOM.H]} />
      <meshStandardMaterial
        color="#0d1b2a"
        roughness={0.95}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
