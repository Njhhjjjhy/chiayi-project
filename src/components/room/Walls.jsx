import {
  ROOM, WALL_T,
  SPRINKLER_Y, SPRINKLER_RADIUS, SPRINKLER_OFFSET,
} from '../../geometry/dimensions.js'

// Three real walls of the exhibition room: back, front, and window.
// The entrance-wall is not a real wall — it is built from three plywood
// partitions handled by EntranceWallPartition.jsx in chunk 1.5.
//
// Walls are continuous: no door or window cut-outs at this layer.
// Door and window meshes overlay them in chunks 1.8 + 1.9.
//
// Each wall is a box of thickness WALL_T = 0.12 m. The wall's room-facing
// surface sits on the nominal wall line (X = 0, X = ROOM.W, Z = ROOM.D);
// the box body extends INWARD from that line.
//
// Standard structural emissive material — the room reads dark but is
// not crushed to pure black by ACES tone mapping at ambient 0.01.

const STRUCTURAL = {
  color: '#1a1a1a',
  emissive: '#1a1a1a',
  emissiveIntensity: 0.08,
  roughness: 0.95,
  metalness: 0,
}

// Existing bright-red sprinkler pipe on the back-wall.
const SPRINKLER_RED = {
  color: '#c62828',
  emissive: '#c62828',
  emissiveIntensity: 0.15,
  roughness: 0.6,
  metalness: 0.1,
}

const PIPE_X = WALL_T + SPRINKLER_OFFSET

export default function Walls() {
  return (
    <group>
      {/* back-wall — X = 0 face */}
      <mesh position={[WALL_T / 2, ROOM.H / 2, ROOM.D / 2]}>
        <boxGeometry args={[WALL_T, ROOM.H, ROOM.D]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>

      {/* back-wall red sprinkler pipe — horizontal run near the top, just off the wall */}
      <mesh position={[PIPE_X, SPRINKLER_Y, ROOM.D / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[SPRINKLER_RADIUS, SPRINKLER_RADIUS, ROOM.D, 12]} />
        <meshStandardMaterial {...SPRINKLER_RED} />
      </mesh>
      {/* vertical drop near the entrance-wall corner (Z = 0) */}
      <mesh position={[PIPE_X, (SPRINKLER_Y + ROOM.H) / 2, 0.15]}>
        <cylinderGeometry args={[SPRINKLER_RADIUS, SPRINKLER_RADIUS, ROOM.H - SPRINKLER_Y, 12]} />
        <meshStandardMaterial {...SPRINKLER_RED} />
      </mesh>

      {/* front-wall — X = ROOM.W face */}
      <mesh position={[ROOM.W - WALL_T / 2, ROOM.H / 2, ROOM.D / 2]}>
        <boxGeometry args={[WALL_T, ROOM.H, ROOM.D]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>

      {/* window-wall — Z = ROOM.D face */}
      <mesh position={[ROOM.W / 2, ROOM.H / 2, ROOM.D - WALL_T / 2]}>
        <boxGeometry args={[ROOM.W, ROOM.H, WALL_T]} />
        <meshStandardMaterial {...STRUCTURAL} />
      </mesh>
    </group>
  )
}
