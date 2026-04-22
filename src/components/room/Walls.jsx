import { useVariant } from '../../hooks/useVariant.js'
import { wallMaterial } from './roomMaterials.js'
import {
  ROOM, HW, HD, WALL_T,
  INSIDE,
  ENT_START, ENT_END,
  D1_W, D1_H, D1_START_X, D1_END_X, D1_X,
  D2_W, D2_H, D2_END_X, D2_X,
} from '../../geometry/dimensions.js'

// All four wall meshes, sectioned around door openings. Meshes are
// offset OUT by WALL_T/2, so each wall's room-facing surface sits on
// the nominal boundary (±HW on x, ±HD on z).

export default function Walls({ width = ROOM.W, depth = ROOM.D, height = ROOM.H }) {
  const { isConstruction } = useVariant()
  const wall = wallMaterial(isConstruction)

  // entrance-wall (x = -HW): sections flanking the visitor entrance
  const leftA_len = ENT_START - (-HD)
  const leftA_z = (-HD + ENT_START) / 2
  const leftB_len = HD - ENT_END
  const leftB_z = (ENT_END + HD) / 2

  // back-wall (z = +HD): sections flanking D1 and D2
  // D2 spans [-HW, D2_END_X]; D1 spans [D1_START_X, D1_END_X]
  const backA_len = D1_START_X - D2_END_X
  const backA_x = (D2_END_X + D1_START_X) / 2
  const backB_len = HW - D1_END_X
  const backB_x = (D1_END_X + HW) / 2

  return (
    <group>
      {/* entrance-wall sections (x = -HW) */}
      <mesh position={[INSIDE.entrance - WALL_T / 2, height / 2, leftA_z]} receiveShadow>
        <boxGeometry args={[WALL_T, height, leftA_len]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[INSIDE.entrance - WALL_T / 2, height / 2, leftB_z]} receiveShadow>
        <boxGeometry args={[WALL_T, height, leftB_len]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      {/* window-wall (x = +HW) — continuous */}
      <mesh position={[INSIDE.window + WALL_T / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_T, height, depth]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      {/* front-wall (z = -HD) — continuous */}
      <mesh position={[0, height / 2, INSIDE.front - WALL_T / 2]} receiveShadow>
        <boxGeometry args={[width, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      {/* back-wall (z = +HD) sections */}
      <mesh position={[backA_x, height / 2, INSIDE.back + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[backA_len, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[backB_x, height / 2, INSIDE.back + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[backB_len, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {/* walls above D1 + D2 (from door top to ceiling) */}
      <mesh position={[D1_X, (D1_H + height) / 2, INSIDE.back + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[D1_W, height - D1_H, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[D2_X, (D2_H + height) / 2, INSIDE.back + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[D2_W, height - D2_H, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
    </group>
  )
}
