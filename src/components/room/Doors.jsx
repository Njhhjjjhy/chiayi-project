import * as THREE from 'three'
import {
  WALL_T,
  D1_Z, D1_W, D1_H,
  D2_Z, D2_W, D2_H,
} from '../../geometry/dimensions.js'

// D1 and D2 staff doors on the back-wall (X = 0 face). Existing building
// elements, not part of the visitor route. Rendered here as flat fill
// planes slightly lighter than the surrounding wall — read as "there is
// a door here" without modelling a real opening, since the back-wall
// itself is a continuous mesh at this build stage.
//
// Each plane sits 1 cm in front of the back-wall's room-facing surface
// (room-facing surface at X = WALL_T = 0.12; doors at X = 0.13).
//
// ESTIMATE — confirm Z positions, widths, and heights from building visit.

const DOOR_OFFSET = 0.01 // metres in front of back-wall surface
const DOOR_X = WALL_T + DOOR_OFFSET

const DOOR_MATERIAL = {
  color: '#2a2a2a',
  emissive: '#2a2a2a',
  emissiveIntensity: 0.1,
  roughness: 0.95,
  metalness: 0,
}

export default function Doors() {
  return (
    <group>
      {/* D1 — ESTIMATE — confirm from building visit */}
      <mesh
        position={[DOOR_X, D1_H / 2, D1_Z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[D1_W, D1_H]} />
        <meshStandardMaterial {...DOOR_MATERIAL} side={THREE.DoubleSide} />
      </mesh>

      {/* D2 — ESTIMATE — confirm from building visit */}
      <mesh
        position={[DOOR_X, D2_H / 2, D2_Z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[D2_W, D2_H]} />
        <meshStandardMaterial {...DOOR_MATERIAL} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
