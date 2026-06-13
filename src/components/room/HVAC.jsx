import {
  ROOM, WALL_T,
  HVAC_W, HVAC_D, HVAC_H, HVAC_X, HVAC_COLOR,
} from '../../geometry/dimensions.js'

// Existing HVAC plenum — a near-black boxy duct hanging in the window-wall's
// upper corner near the front-wall end, above the silver service door. A main
// box plus a smaller drop.

const METAL = {
  color: HVAC_COLOR,
  emissive: HVAC_COLOR,
  emissiveIntensity: 0.03,
  roughness: 0.7,
  metalness: 0.2,
}

export default function HVAC() {
  const z = ROOM.D - WALL_T - HVAC_D / 2   // hugs the window-wall, extends into the room
  const y = ROOM.H - HVAC_H / 2             // top tucked up near the ceiling
  return (
    <group>
      {/* main plenum box */}
      <mesh position={[HVAC_X, y, z]}>
        <boxGeometry args={[HVAC_W, HVAC_H, HVAC_D]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* smaller drop below the front-wall end of the box */}
      <mesh position={[HVAC_X + HVAC_W / 2 - 0.3, y - HVAC_H / 2 - 0.2, ROOM.D - WALL_T - 0.3]}>
        <boxGeometry args={[0.6, 0.4, 0.55]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
    </group>
  )
}
