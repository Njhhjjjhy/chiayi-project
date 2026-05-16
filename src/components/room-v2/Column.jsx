import { ROOM, COLUMN_X, COLUMN_W, COLUMN_D } from '../../geometry/dimensions-v2.js'

// Existing structural concrete column sitting on the entrance-wall line.
// Its left face is at X = COLUMN_X = 6.43, right face at X = 6.73, creating
// the 2.4 m exit/gift opening between its right face and the front-wall
// at X = 8.83. Together with the entrance-wall-partition (chunk 1.5) it
// closes the south side of the room.
//
// ESTIMATE: column footprint 0.3 × 0.3 — confirm from building visit.

const STRUCTURAL = {
  color: '#1a1a1a',
  emissive: '#1a1a1a',
  emissiveIntensity: 0.08,
  roughness: 0.95,
  metalness: 0,
}

export default function Column() {
  return (
    <mesh position={[COLUMN_X + COLUMN_W / 2, ROOM.H / 2, COLUMN_D / 2]}>
      <boxGeometry args={[COLUMN_W, ROOM.H, COLUMN_D]} />
      <meshStandardMaterial {...STRUCTURAL} />
    </mesh>
  )
}
