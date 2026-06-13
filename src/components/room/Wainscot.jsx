import {
  ROOM, WALL_T,
  WAINSCOT_FRONT_H, WAINSCOT_BACK_H, WAINSCOT_WINDOW_H,
  WAINSCOT_T, WAINSCOT_COLOR,
  D1_Z, D1_W, D2_Z, D2_W,
  WW_DOOR_X, WW_DOOR_W,
} from '../../geometry/dimensions.js'

// Existing dark-wood wainscoting along the base of the back-wall, front-wall,
// and window-wall (the entrance-wall has none). Each band is a thin box
// standing slightly proud of that wall's room-facing surface. The bands break
// around door openings — a door reaches the floor, so the wainscoting can't run
// across it.

const WOOD = {
  color: WAINSCOT_COLOR,
  emissive: WAINSCOT_COLOR,
  emissiveIntensity: 0.04,
  roughness: 0.85,
  metalness: 0,
}

// Split a 0..total run into the segments left between the given gaps (doors).
function segments(total, gaps) {
  const sorted = [...gaps].sort((a, b) => a.a - b.a)
  const out = []
  let p = 0
  for (const g of sorted) {
    if (g.a > p) out.push([p, g.a])
    p = Math.max(p, g.b)
  }
  if (p < total) out.push([p, total])
  return out
}

export default function Wainscot() {
  const backX = WALL_T + WAINSCOT_T / 2
  const frontX = ROOM.W - WALL_T - WAINSCOT_T / 2
  const winZ = ROOM.D - WALL_T - WAINSCOT_T / 2

  // back-wall: break around the two staff doors (run is along Z)
  const backSegs = segments(ROOM.D, [
    { a: D1_Z - D1_W / 2, b: D1_Z + D1_W / 2 },
    { a: D2_Z - D2_W / 2, b: D2_Z + D2_W / 2 },
  ])
  // window-wall: break around the silver service door (run is along X)
  const winSegs = segments(ROOM.W, [
    { a: WW_DOOR_X - WW_DOOR_W / 2, b: WW_DOOR_X + WW_DOOR_W / 2 },
  ])

  return (
    <group>
      {/* back-wall (X = 0 face) — band along Z, broken at the two doors */}
      {backSegs.map(([z0, z1], i) => (
        <mesh key={`b${i}`} position={[backX, WAINSCOT_BACK_H / 2, (z0 + z1) / 2]}>
          <boxGeometry args={[WAINSCOT_T, WAINSCOT_BACK_H, z1 - z0]} />
          <meshStandardMaterial {...WOOD} />
        </mesh>
      ))}

      {/* front-wall (X = ROOM.W face) — continuous band along Z (loofah wall, no doors) */}
      <mesh position={[frontX, WAINSCOT_FRONT_H / 2, ROOM.D / 2]}>
        <boxGeometry args={[WAINSCOT_T, WAINSCOT_FRONT_H, ROOM.D]} />
        <meshStandardMaterial {...WOOD} />
      </mesh>

      {/* window-wall (Z = ROOM.D face) — low band along X, broken at the silver door */}
      {winSegs.map(([x0, x1], i) => (
        <mesh key={`w${i}`} position={[(x0 + x1) / 2, WAINSCOT_WINDOW_H / 2, winZ]}>
          <boxGeometry args={[x1 - x0, WAINSCOT_WINDOW_H, WAINSCOT_T]} />
          <meshStandardMaterial {...WOOD} />
        </mesh>
      ))}
    </group>
  )
}
