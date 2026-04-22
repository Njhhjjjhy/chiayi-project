import { Instances, Instance } from '@react-three/drei'
import { useVariant } from '../../hooks/useVariant.js'
import { wainscotMaterial, plankFaceMaterial } from './roomMaterials.js'
import {
  ROOM, HW, HD, INSIDE,
  D1_START_X, D1_END_X,
  D2_START_X, D2_END_X,
  STEEL_DOOR_W, STEEL_DOOR_Z,
  WAINSCOT_H as WAINSCOT_CFG,
} from '../../geometry/dimensions.js'

// Dark wood plank band, bottom ~90 cm of front/back walls, ~30 cm of window-wall.
// Three layers:
//   (1) bulk back panels (recessed backing — fills space between planks)
//   (2) vertical plank faces (sit ~1.5 cm proud, tongue-and-groove relief)
//   (3) cap rail at top + skirting board at bottom (horizontal trim)
// Cut around every real door with a 2 cm visible clearance on each side.

const WAINSCOT_H = WAINSCOT_CFG.front        // front + back walls (0.90)
const WW_WAINSCOT_H = WAINSCOT_CFG.window    // window wall, shorter (0.30)
const WAINSCOT_T = 0.04
const PLANK_PITCH = 0.14      // centre-to-centre
const PLANK_W = 0.115         // visible plank width (~3 cm gap → groove)
const PLANK_RELIEF = 0.035    // each plank sits proud of the bulk backing
const SKIRT_H = 0.06
const CAP_H = 0.03
const DOOR_CLEAR = 0.02       // panels visibly stop before door frames

// Plank-position generator. Skips planks whose centre falls inside any
// skipRange [lo,hi]. axis='x' for front/back walls, axis='z' for window wall.
function plankPositions(axis, wallInsideFace, signDir, totalLen, wsH, skipRanges = []) {
  const count = Math.floor(totalLen / PLANK_PITCH)
  const startT = -((count - 1) * PLANK_PITCH) / 2
  const out = []
  for (let i = 0; i < count; i++) {
    const t = startT + i * PLANK_PITCH
    if (skipRanges.some(([lo, hi]) => t >= lo && t <= hi)) continue
    if (axis === 'x') {
      out.push([t, wsH / 2, wallInsideFace + signDir * (PLANK_RELIEF / 2 + 0.001)])
    } else {
      out.push([wallInsideFace + signDir * (PLANK_RELIEF / 2 + 0.001), wsH / 2, t])
    }
  }
  return out
}

export default function Wainscot({ width = ROOM.W, depth = ROOM.D }) {
  const { isConstruction } = useVariant()
  const wainscot = wainscotMaterial(isConstruction)
  const plankFace = plankFaceMaterial(isConstruction)

  // Back-wall: cuts at D2 and D1. D2 is flush with entrance-wall corner so
  // there is no section on the entrance side of D2.
  const bwA_lo = D2_END_X + DOOR_CLEAR
  const bwA_hi = D1_START_X - DOOR_CLEAR
  const bwA_len = bwA_hi - bwA_lo
  const bwA_x = (bwA_lo + bwA_hi) / 2
  const bwB_lo = D1_END_X + DOOR_CLEAR
  const bwB_hi = HW
  const bwB_len = bwB_hi - bwB_lo
  const bwB_x = (bwB_lo + bwB_hi) / 2

  // Window-wall: cut at silver service door.
  const WW_DOOR_LO = STEEL_DOOR_Z - STEEL_DOOR_W / 2 - DOOR_CLEAR
  const WW_DOOR_HI = STEEL_DOOR_Z + STEEL_DOOR_W / 2 + DOOR_CLEAR
  const wwA_len = WW_DOOR_LO - (-HD)
  const wwA_z = (-HD + WW_DOOR_LO) / 2
  const wwB_len = HD - WW_DOOR_HI
  const wwB_z = (WW_DOOR_HI + HD) / 2

  const fwPlankPos = plankPositions('x', INSIDE.front + WAINSCOT_T + 0.01, +1, width, WAINSCOT_H)
  const bwPlankPos = plankPositions(
    'x', INSIDE.back - WAINSCOT_T - 0.01, -1, width, WAINSCOT_H,
    [[D2_START_X, D2_END_X + DOOR_CLEAR], [D1_START_X - DOOR_CLEAR, D1_END_X + DOOR_CLEAR]],
  )
  const tallPlankPos = [...fwPlankPos, ...bwPlankPos]
  const wwPlankPos = plankPositions(
    'z', INSIDE.window - WAINSCOT_T - 0.01, -1, depth, WW_WAINSCOT_H,
    [[WW_DOOR_LO, WW_DOOR_HI]],
  )

  return (
    <group>
      {/* (1) Bulk wainscoting back panels */}
      {/* Front-wall: continuous, no doors */}
      <mesh position={[0, WAINSCOT_H / 2, INSIDE.front + WAINSCOT_T / 2 + 0.005]} receiveShadow>
        <boxGeometry args={[width, WAINSCOT_H, WAINSCOT_T]} />
        <meshStandardMaterial {...wainscot} />
      </mesh>
      {/* Back-wall A — between D2 and D1 */}
      <mesh position={[bwA_x, WAINSCOT_H / 2, INSIDE.back - WAINSCOT_T / 2 - 0.005]} receiveShadow>
        <boxGeometry args={[bwA_len, WAINSCOT_H, WAINSCOT_T]} />
        <meshStandardMaterial {...wainscot} />
      </mesh>
      {/* Back-wall B — from D1 to window-wall corner */}
      <mesh position={[bwB_x, WAINSCOT_H / 2, INSIDE.back - WAINSCOT_T / 2 - 0.005]} receiveShadow>
        <boxGeometry args={[bwB_len, WAINSCOT_H, WAINSCOT_T]} />
        <meshStandardMaterial {...wainscot} />
      </mesh>
      {/* Window-wall A — front-wall corner to silver door (short panelling) */}
      <mesh position={[INSIDE.window - WAINSCOT_T / 2 - 0.005, WW_WAINSCOT_H / 2, wwA_z]} receiveShadow>
        <boxGeometry args={[WAINSCOT_T, WW_WAINSCOT_H, wwA_len]} />
        <meshStandardMaterial {...wainscot} />
      </mesh>
      {/* Window-wall B — silver door to back-wall corner (short panelling) */}
      <mesh position={[INSIDE.window - WAINSCOT_T / 2 - 0.005, WW_WAINSCOT_H / 2, wwB_z]} receiveShadow>
        <boxGeometry args={[WAINSCOT_T, WW_WAINSCOT_H, wwB_len]} />
        <meshStandardMaterial {...wainscot} />
      </mesh>
      {/* entrance-wall intentionally has NO wainscot — matches real venue */}

      {/* (2) Vertical plank faces — instanced */}
      {tallPlankPos.length > 0 && (
        <Instances limit={tallPlankPos.length} receiveShadow>
          <boxGeometry args={[PLANK_W, WAINSCOT_H, PLANK_RELIEF]} />
          <meshStandardMaterial {...plankFace} />
          {tallPlankPos.map((p, i) => <Instance key={`tall-${i}`} position={p} />)}
        </Instances>
      )}
      {wwPlankPos.length > 0 && (
        <Instances limit={wwPlankPos.length} receiveShadow>
          <boxGeometry args={[PLANK_RELIEF, WW_WAINSCOT_H, PLANK_W]} />
          <meshStandardMaterial {...plankFace} />
          {wwPlankPos.map((p, i) => <Instance key={`ww-${i}`} position={p} />)}
        </Instances>
      )}

      {/* (3a) Cap rail — same cuts as the bulk panels */}
      <mesh position={[0, WAINSCOT_H + CAP_H / 2, INSIDE.front + 0.05]}>
        <boxGeometry args={[width, CAP_H, 0.06]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
      <mesh position={[bwA_x, WAINSCOT_H + CAP_H / 2, INSIDE.back - 0.05]}>
        <boxGeometry args={[bwA_len, CAP_H, 0.06]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
      <mesh position={[bwB_x, WAINSCOT_H + CAP_H / 2, INSIDE.back - 0.05]}>
        <boxGeometry args={[bwB_len, CAP_H, 0.06]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
      <mesh position={[INSIDE.window - 0.03, WW_WAINSCOT_H + CAP_H / 2, wwA_z]}>
        <boxGeometry args={[0.06, CAP_H, wwA_len]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
      <mesh position={[INSIDE.window - 0.03, WW_WAINSCOT_H + CAP_H / 2, wwB_z]}>
        <boxGeometry args={[0.06, CAP_H, wwB_len]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>

      {/* (3b) Skirting board — same cuts as the bulk panels */}
      <mesh position={[0, SKIRT_H / 2, INSIDE.front + 0.05]}>
        <boxGeometry args={[width, SKIRT_H, 0.06]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
      <mesh position={[bwA_x, SKIRT_H / 2, INSIDE.back - 0.05]}>
        <boxGeometry args={[bwA_len, SKIRT_H, 0.06]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
      <mesh position={[bwB_x, SKIRT_H / 2, INSIDE.back - 0.05]}>
        <boxGeometry args={[bwB_len, SKIRT_H, 0.06]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
      <mesh position={[INSIDE.window - 0.03, SKIRT_H / 2, wwA_z]}>
        <boxGeometry args={[0.06, SKIRT_H, wwA_len]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
      <mesh position={[INSIDE.window - 0.03, SKIRT_H / 2, wwB_z]}>
        <boxGeometry args={[0.06, SKIRT_H, wwB_len]} />
        <meshStandardMaterial {...plankFace} />
      </mesh>
    </group>
  )
}
