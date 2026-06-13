import * as THREE from 'three'
import {
  ROOM, WALL_T,
  WW_DOOR_X, WW_DOOR_W, WW_DOOR_H,
  WW_SMALLWIN_X, WW_SMALLWIN_W, WW_SMALLWIN_H, WW_SMALLWIN_SILL,
  WW_BIGWIN_X, WW_BIGWIN_W, WW_BIGWIN_H, WW_BIGWIN_SILL,
} from '../../geometry/dimensions.js'

// Window-wall openings (Z = ROOM.D face): one silver service door and two
// windows — a small vertical window beside the door, and a large wide window
// (interior glass) running toward the back-wall corner. Rendered as fill
// planes 1 cm in front of the wall's room-facing surface; in operation they
// sit behind the theatrical curtain, but exist so the openings read if the
// curtain is off.

const WW_OFFSET = 0.01 // metres in front of window-wall surface
const WW_Z = ROOM.D - WALL_T - WW_OFFSET

// Dark blue-grey glass for the windows.
const GLASS_MATERIAL = {
  color: '#1a2030',
  emissive: '#1a2030',
  emissiveIntensity: 0.05,
  roughness: 0.9,
  metalness: 0,
}

// Brushed-steel face for the silver service door.
const STEEL_MATERIAL = {
  color: '#9aa0a6',
  emissive: '#3a3d42',
  emissiveIntensity: 0.05,
  roughness: 0.45,
  metalness: 0.8,
}

export default function Windows() {
  return (
    <group>
      {/* silver service door — under the HVAC, near the front-wall corner */}
      <mesh position={[WW_DOOR_X, WW_DOOR_H / 2, WW_Z]}>
        <planeGeometry args={[WW_DOOR_W, WW_DOOR_H]} />
        <meshStandardMaterial {...STEEL_MATERIAL} side={THREE.DoubleSide} />
      </mesh>

      {/* small vertical window — beside the door */}
      <mesh position={[WW_SMALLWIN_X, WW_SMALLWIN_SILL + WW_SMALLWIN_H / 2, WW_Z]}>
        <planeGeometry args={[WW_SMALLWIN_W, WW_SMALLWIN_H]} />
        <meshStandardMaterial {...GLASS_MATERIAL} side={THREE.DoubleSide} />
      </mesh>

      {/* large wide window — interior glass toward the back-wall corner */}
      <mesh position={[WW_BIGWIN_X, WW_BIGWIN_SILL + WW_BIGWIN_H / 2, WW_Z]}>
        <planeGeometry args={[WW_BIGWIN_W, WW_BIGWIN_H]} />
        <meshStandardMaterial {...GLASS_MATERIAL} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
