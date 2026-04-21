import { Instances, Instance } from '@react-three/drei'
import { useVariant } from '../hooks/useVariant.jsx'
import Ceiling from './Ceiling.jsx'
import Floor from './Floor.jsx'

// Room dimensions — post site-visit reality (Chiayi venue)
const W = 8.83      // width (x-axis): length of front-wall / back-wall
const D = 10        // depth (z-axis): length of entrance-wall / window-wall
const H = 3.52      // height
const WALL_T = 0.12
const HW = W / 2    // 4.415
const HD = D / 2    // 5

// Wall inside-face coordinates. All four wall meshes are offset OUT of the room
// by WALL_T/2, so every wall's room-facing surface sits exactly at the nominal
// boundary (±HW on x, ±HD on z). Overlays (wainscot, curtains, A/Cs, doors,
// etc.) reference these directly — no WALL_T/2 math in overlay expressions.
const INSIDE_FRONT_Z = -HD
const INSIDE_BACK_Z = HD
const INSIDE_ENTRANCE_X = -HW
const INSIDE_WINDOW_X = HW

// 3D code → user's wall names (existing venue reality; covering strategy TBD):
//   z = -HD wall → "front-wall" (8.83m). Feature-wall position. HVAC plenum + silver
//                   service door sit against this corner (on the window-wall side).
//   z = +HD wall → "back-wall" (8.83m). Piano wall with 2 real swing doors, 2 A/C heads,
//                   red sprinkler pipe along the top.
//   x = -HW wall → "entrance-wall" (10m). Visitor entrance + a long open span to the
//                   bistro past the entrance (modelled as continuous wall — actual
//                   infill + any column treatment is part of the deferred covering plan).
//   x = +HW wall → "window-wall" (10m). Multi-pane interior glass partition + small
//                   window in stepped notch + silver service door + HVAC plenum in the
//                   upper front-wall corner.

// ---- entrance-wall (x = -HW) ----
// Visitor entrance: 45 cm from front-wall corner (= z = -HD). Full room
// height — no transom above.
const ENT_W = 2.4
const ENT_H = 3.52
const ENT_START = -HD + 0.45        // -4.55
const ENT_END = ENT_START + ENT_W   // -2.15
const ENT_Z = (ENT_START + ENT_END) / 2 // -3.35

// ---- back-wall (z = +HD) — 2 door openings measured from window-wall corner (+HW) ----
const D1_W = 0.96, D1_H = 2.36
const D1_END_X = HW - 4.37       // +0.045
const D1_START_X = D1_END_X - D1_W // -0.915
const D1_X = (D1_START_X + D1_END_X) / 2 // -0.435

const D2_W = 0.90, D2_H = 2.36
const D2_END_X = HW - 7.93       // -3.515
const D2_START_X = D2_END_X - D2_W // -4.415 (= -HW, flush with entrance-wall corner)
const D2_X = (D2_START_X + D2_END_X) / 2 // -3.965

// ---- window-wall (x = +HW) — multi-pane glass partition + small window in stepped notch ----
// Reality: ~5-pane interior glass curtain (570 × 233) opening onto the adjacent space.
// Plus a small 59 × 178 window in a stepped notch on the front-wall end.
// Per dim drawing: 119 cm of solid wall from front-wall corner, then small window,
// then ~99 cm of solid wall, then the main 570-wide glass partition.
// Dim-drawing "height" numbers (233 / 178) are the TOP y-coordinate from floor,
// NOT the partition's vertical size. Partition vertical size = top − sill.
// Main partition + small window sit on top of the (short) window-wall panelling cap.
// Partition extends from the 99 cm gap (past the silver door) ALL THE WAY to the
// back-wall corner — there is no solid wall section between partition and back-wall.
// Main glass partition — 570 wide × 233 high, sill at 32 cm, 90 cm gap
// before it (past silver door). Ends flush with back-wall corner.
const MAIN_WIN_W = 5.70
const MAIN_WIN_SILL = 0.32, MAIN_WIN_TOP = 2.33
const MAIN_WIN_H = MAIN_WIN_TOP - MAIN_WIN_SILL              // 2.01
const MAIN_WIN_START_Z = HD - MAIN_WIN_W                      // -0.70
const MAIN_WIN_Z = MAIN_WIN_START_Z + MAIN_WIN_W / 2         // +2.15
// Small window — 178 × 59 per site dim drawing (window-wall.webp).
// Sill kept at 35 cm so window top (213 cm) stays below the HVAC plenum.
const SMALL_WIN_W = 0.59, SMALL_WIN_SILL = 0.35, SMALL_WIN_TOP = 2.13
const SMALL_WIN_H = SMALL_WIN_TOP - SMALL_WIN_SILL           // 1.78
const SMALL_WIN_Z = -HD + 1.19 + SMALL_WIN_W / 2             // -3.515

// Silver service door on window-wall — 207 × 99 per site dim drawing.
// Sits 63 cm past the small window end; 90 cm clearance before the
// main glass partition.
const STEEL_DOOR_W = 0.99, STEEL_DOOR_H = 2.07
const STEEL_DOOR_Z = -HD + 1.19 + 0.59 + 0.63 + STEEL_DOOR_W / 2   // -2.095

// HVAC plenum — BACK flush with window-wall, positioned ABOVE the silver
// service door. NOT pressed against the front-wall — clearly detached from it
// per reference photos 8 / 14 / 36 / 41. Main body protrudes ~65 cm into the
// room from the window-wall. Stepped drop hangs below the main body's +z end.
const PLENUM_MAIN_DEPTH_Z = 1.35
const PLENUM_MAIN_WIDTH_X = 1.80
const PLENUM_MAIN_HEIGHT_Y = 0.70
const PLENUM_MAIN_X = INSIDE_WINDOW_X - PLENUM_MAIN_WIDTH_X / 2   // back flush with window-wall
const PLENUM_MAIN_Z = STEEL_DOOR_Z                                // z-centred on silver door
const PLENUM_MAIN_Y = H - PLENUM_MAIN_HEIGHT_Y / 2 - 0.47         // bottom ~50 cm above door-top
const PLENUM_DROP_DEPTH_Z = 0.80
const PLENUM_DROP_WIDTH_X = 0.60
const PLENUM_DROP_HEIGHT_Y = 0.45
// Drop hangs at the far (room-facing) end of the main duct, away from window-wall.
const PLENUM_DROP_X = PLENUM_MAIN_X - PLENUM_MAIN_WIDTH_X / 2 + PLENUM_DROP_WIDTH_X / 2 + 0.10
const PLENUM_DROP_Z = PLENUM_MAIN_Z
const PLENUM_DROP_Y = PLENUM_MAIN_Y - PLENUM_MAIN_HEIGHT_Y / 2 - PLENUM_DROP_HEIGHT_Y / 2



export default function Room({ width = W, depth = D, height = H }) {
  const { isConstruction, isLight } = useVariant()

  // All materials currently render in their real venue colors regardless of view mode.
  // The "paint everything black for the dark immersive experience" strategy is a future
  // step — the user will define which surfaces get covered and how. For now: everything visible.
  const wall = isConstruction
    ? { wireframe: true, color: '#666' }
    : { color: '#f0ece5', roughness: 0.85, metalness: 0 }

  const blackout = isConstruction
    ? { wireframe: true, color: '#222' }
    : { color: '#1a1a1a', roughness: 0.4, metalness: 0.1 }   // dark glass — multi-pane partition

  const curtain = isConstruction
    ? { wireframe: true, color: '#600' }
    : { color: '#2a1520', roughness: 0.95, metalness: 0 }

  // Dark wood wainscoting band — bottom 90 cm of every wall in real venue.
  const wainscot = isConstruction
    ? { wireframe: true, color: '#5d4037' }
    : { color: '#241509', roughness: 0.85, metalness: 0.04 }   // darker recess so planks read
  const WAINSCOT_H = 0.90       // front-wall + back-wall panelling height
  const WW_WAINSCOT_H = 0.30    // window-wall panelling is intentionally short
  const WAINSCOT_T = 0.04
  // Plank detail constants (each wall covered with vertical planks for tongue-and-groove look)
  const PLANK_PITCH = 0.14    // centre-to-centre
  const PLANK_W = 0.115       // visible plank width (~3 cm gap → groove between planks)
  const PLANK_RELIEF = 0.035  // each plank sits 3.5 cm proud of the bulk wainscoting
  const SKIRT_H = 0.06        // skirting board height
  const CAP_H = 0.03          // cap rail height
  // 2 cm clearance on each side of any door — guarantees the panels visibly stop before the door frame
  const DOOR_CLEAR = 0.02
  // Plank face material — slightly lighter than the recessed bulk so light catches the relief.
  const plankFace = isConstruction
    ? { wireframe: true, color: '#7a5a40' }
    : { color: '#4a3220', roughness: 0.7, metalness: 0.04 }

  // Silver/stainless steel service door material (window-wall, near front-wall corner)
  const steelDoor = isConstruction
    ? { wireframe: true, color: '#aaa' }
    : { color: '#c8c8c8', roughness: 0.4, metalness: 0.7 }

  // HVAC plenum + duct metal
  const ductMetal = isConstruction
    ? { wireframe: true, color: '#444' }
    : { color: '#2a2a2a', roughness: 0.5, metalness: 0.6 }

  // Wall A/C unit — white plastic
  const acUnit = isConstruction
    ? { wireframe: true, color: '#ddd' }
    : { color: '#f0f0f0', roughness: 0.7, metalness: 0.05 }

  // Sprinkler pipe — red
  const sprinklerRed = { color: '#c1272d', roughness: 0.6, metalness: 0.1 }

  // entrance-wall (x = -HW): sections flanking the visitor entrance
  const leftA_len = ENT_START - (-HD)      // 0.45
  const leftA_z = (-HD + ENT_START) / 2    // -4.775
  const leftB_len = HD - ENT_END           // 8.65
  const leftB_z = (ENT_END + HD) / 2       // +0.675

  // back-wall (z = +HD): sections flanking D1 and D2
  // D2 spans x=[-HW, -3.515] (flush with entrance-wall corner)
  // D1 spans x=[-0.915, +0.045]
  // Sections: [D2_END, D1_START] and [D1_END, +HW]
  const backA_len = D1_START_X - D2_END_X  // 2.6
  const backA_x = (D2_END_X + D1_START_X) / 2 // -2.215
  const backB_len = HW - D1_END_X          // 4.37
  const backB_x = (D1_END_X + HW) / 2      // +2.23

  return (
    <group>
      <Floor />
      <Ceiling />

      {/* ===== entrance-wall (x = -HW) — mesh offset OUT by WALL_T/2; inside face at INSIDE_ENTRANCE_X ===== */}
      {/* Section A: front-wall side of entrance (0.45m sliver) */}
      <mesh position={[INSIDE_ENTRANCE_X - WALL_T / 2, height / 2, leftA_z]} receiveShadow>
        <boxGeometry args={[WALL_T, height, leftA_len]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {/* Section B: from entrance to back-wall corner (includes structural column + panels filling big opening) */}
      <mesh position={[INSIDE_ENTRANCE_X - WALL_T / 2, height / 2, leftB_z]} receiveShadow>
        <boxGeometry args={[WALL_T, height, leftB_len]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {/* Visitor entrance curtain — full room height, no transom above */}
      <mesh position={[INSIDE_ENTRANCE_X + 0.04, ENT_H / 2, ENT_Z]}>
        <boxGeometry args={[0.02, ENT_H - 0.04, ENT_W - 0.04]} />
        <meshStandardMaterial {...curtain} transparent opacity={0.9} />
      </mesh>

      {/* ===== window-wall (x = +HW) — mesh offset OUT by WALL_T/2; inside face at INSIDE_WINDOW_X ===== */}
      <mesh position={[INSIDE_WINDOW_X + WALL_T / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_T, height, depth]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {/* Main glass partition (multi-pane interior glazing) */}
      <mesh position={[INSIDE_WINDOW_X - 0.02, MAIN_WIN_SILL + MAIN_WIN_H / 2, MAIN_WIN_Z]}>
        <boxGeometry args={[0.05, MAIN_WIN_H, MAIN_WIN_W]} />
        <meshStandardMaterial {...blackout} />
      </mesh>
      {/* Small window in stepped notch */}
      <mesh position={[INSIDE_WINDOW_X - 0.02, SMALL_WIN_SILL + SMALL_WIN_H / 2, SMALL_WIN_Z]}>
        <boxGeometry args={[0.05, SMALL_WIN_H, SMALL_WIN_W]} />
        <meshStandardMaterial {...blackout} />
      </mesh>

      {/* ===== front-wall (z = -HD) — mesh offset OUT by WALL_T/2; inside face at INSIDE_FRONT_Z ===== */}
      <mesh position={[0, height / 2, INSIDE_FRONT_Z - WALL_T / 2]} receiveShadow>
        <boxGeometry args={[width, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      {/* ===== back-wall (z = +HD) — mesh offset OUT by WALL_T/2; inside face at INSIDE_BACK_Z ===== */}
      {/* Section A: between D2 and D1 */}
      <mesh position={[backA_x, height / 2, INSIDE_BACK_Z + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[backA_len, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {/* Section B: from D1 to window-wall corner */}
      <mesh position={[backB_x, height / 2, INSIDE_BACK_Z + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[backB_len, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {/* Wall above D1 (from door top to ceiling) */}
      <mesh position={[D1_X, (D1_H + height) / 2, INSIDE_BACK_Z + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[D1_W, height - D1_H, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {/* Wall above D2 */}
      <mesh position={[D2_X, (D2_H + height) / 2, INSIDE_BACK_Z + WALL_T / 2]} receiveShadow>
        <boxGeometry args={[D2_W, height - D2_H, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      {/* D1 curtain (floor to door-top) */}
      <mesh position={[D1_X, D1_H / 2, INSIDE_BACK_Z - 0.04]}>
        <boxGeometry args={[D1_W - 0.04, D1_H - 0.04, 0.02]} />
        <meshStandardMaterial {...curtain} transparent opacity={0.9} />
      </mesh>
      {/* D2 curtain */}
      <mesh position={[D2_X, D2_H / 2, INSIDE_BACK_Z - 0.04]}>
        <boxGeometry args={[D2_W - 0.04, D2_H - 0.04, 0.02]} />
        <meshStandardMaterial {...curtain} transparent opacity={0.9} />
      </mesh>

      {/* ===== Window-wall existing infrastructure ===== */}
      {/* Silver/stainless service door (between small window and main glass partition) */}
      <mesh position={[INSIDE_WINDOW_X - 0.04, STEEL_DOOR_H / 2, STEEL_DOOR_Z]} castShadow receiveShadow>
        <boxGeometry args={[0.06, STEEL_DOOR_H, STEEL_DOOR_W]} />
        <meshStandardMaterial {...steelDoor} />
      </mesh>
      {/* Wall A/C unit on upper window-wall, near back-wall corner */}
      <mesh position={[INSIDE_WINDOW_X - 0.15, 2.85, INSIDE_BACK_Z - 1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.36, 0.95]} />
        <meshStandardMaterial {...acUnit} />
      </mesh>
      {/* HVAC plenum L-shape — main horizontal duct flush with structural ceiling */}
      <mesh position={[PLENUM_MAIN_X, PLENUM_MAIN_Y, PLENUM_MAIN_Z]} castShadow receiveShadow>
        <boxGeometry args={[PLENUM_MAIN_WIDTH_X, PLENUM_MAIN_HEIGHT_Y, PLENUM_MAIN_DEPTH_Z]} />
        <meshStandardMaterial {...ductMetal} />
      </mesh>
      {/* HVAC stepped-drop extension — smaller box continuing +z past the main body, hanging lower */}
      <mesh position={[PLENUM_DROP_X, PLENUM_DROP_Y, PLENUM_DROP_Z]} castShadow receiveShadow>
        <boxGeometry args={[PLENUM_DROP_WIDTH_X, PLENUM_DROP_HEIGHT_Y, PLENUM_DROP_DEPTH_Z]} />
        <meshStandardMaterial {...ductMetal} />
      </mesh>

      {/* Control / electrical panel — centred directly above the silver door */}
      <mesh position={[INSIDE_WINDOW_X - 0.04, STEEL_DOOR_H + 0.20, STEEL_DOOR_Z]}>
        <boxGeometry args={[0.05, 0.32, 0.28]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Back-wall existing infrastructure */}
      {/* Two split A/C units mounted high above the doors */}
      <mesh position={[-2.215, 2.85, INSIDE_BACK_Z - 0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.36, 0.28]} />
        <meshStandardMaterial {...acUnit} />
      </mesh>
      <mesh position={[2.0, 2.85, INSIDE_BACK_Z - 0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.36, 0.28]} />
        <meshStandardMaterial {...acUnit} />
      </mesh>
      {/* Red sprinkler pipe — horizontal run across upper back-wall, with vertical drop near entrance-wall corner */}
      <mesh position={[0, 3.05, INSIDE_BACK_Z - 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, W, 12]} />
        <meshStandardMaterial {...sprinklerRed} />
      </mesh>
      <mesh position={[INSIDE_ENTRANCE_X + 0.15, (3.05 + height) / 2, INSIDE_BACK_Z - 0.06]}>
        <cylinderGeometry args={[0.025, 0.025, height - 3.05, 12]} />
        <meshStandardMaterial {...sprinklerRed} />
      </mesh>

      {/* ===== Wainscoting — dark wood plank band, bottom 90 cm of every wall =====
          Each wall has 3 layers:
            (1) bulk back panel (recessed wainscoting backing — fills space between planks)
            (2) vertical plank faces (sit ~1.5 cm proud — creates tongue-and-groove relief)
            (3) cap rail at top + skirting board at bottom (horizontal trim)
       */}
      {(() => {
        // Wainscot cuts around every real door with a 2cm clearance on each side.
        // Back-wall: cut at D2 and D1. D2 is flush with the entrance-wall corner so
        // there is no section on the entrance-wall side of D2.
        //   bwA_z: between D2 and D1
        //   bwB_z: between D1 and the window-wall corner
        // Window-wall: cut at the silver service door.
        //   wwA_z: between the front-wall corner and the silver door
        //   wwB_z: between the silver door and the back-wall corner
        const bwA_lo = D2_END_X + DOOR_CLEAR              // -3.495
        const bwA_hi = D1_START_X - DOOR_CLEAR            // -0.935
        const bwA_len = bwA_hi - bwA_lo                   // 2.56
        const bwA_x = (bwA_lo + bwA_hi) / 2               // -2.215
        const bwB_lo = D1_END_X + DOOR_CLEAR              // +0.065
        const bwB_hi = HW                                 // +4.415
        const bwB_len = bwB_hi - bwB_lo                   // 4.35
        const bwB_x = (bwB_lo + bwB_hi) / 2               // +2.24
        const WW_DOOR_LO = STEEL_DOOR_Z - STEEL_DOOR_W / 2 - DOOR_CLEAR  // -3.14
        const WW_DOOR_HI = STEEL_DOOR_Z + STEEL_DOOR_W / 2 + DOOR_CLEAR  // -2.30
        const wwA_len = WW_DOOR_LO - (-HD)                // 1.86
        const wwA_z = (-HD + WW_DOOR_LO) / 2              // -4.07
        const wwB_len = HD - WW_DOOR_HI                   // 7.30
        const wwB_z = (WW_DOOR_HI + HD) / 2               // +1.35

        // Plank-position generator. Skips planks whose centre falls inside any skipRange [lo,hi].
        // axis='x' → planks distributed along x (front/back walls, plank face normal in z)
        // axis='z' → planks distributed along z (window wall, plank face normal in x)
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

        // Front-wall + back-wall planks share the same geometry (PLANK_W × WAINSCOT_H × PLANK_RELIEF)
        const fwPlankPos = plankPositions('x', INSIDE_FRONT_Z + WAINSCOT_T + 0.01, +1, width, WAINSCOT_H)
        const bwPlankPos = plankPositions('x', INSIDE_BACK_Z - WAINSCOT_T - 0.01, -1, width, WAINSCOT_H,
          [[D2_START_X, D2_END_X + DOOR_CLEAR], [D1_START_X - DOOR_CLEAR, D1_END_X + DOOR_CLEAR]])
        const tallPlankPos = [...fwPlankPos, ...bwPlankPos]
        // Window-wall planks use short wainscot and a rotated footprint (PLANK_RELIEF × WW_WAINSCOT_H × PLANK_W)
        const wwPlankPos = plankPositions('z', INSIDE_WINDOW_X - WAINSCOT_T - 0.01, -1, depth, WW_WAINSCOT_H,
          [[WW_DOOR_LO, WW_DOOR_HI]])

        return (
          <>
            {/* (1) Bulk wainscoting back panels — split at every real door opening */}
            {/* Front-wall: continuous, no doors */}
            <mesh position={[0, WAINSCOT_H / 2, INSIDE_FRONT_Z + WAINSCOT_T / 2 + 0.005]} receiveShadow>
              <boxGeometry args={[width, WAINSCOT_H, WAINSCOT_T]} />
              <meshStandardMaterial {...wainscot} />
            </mesh>
            {/* Back-wall A — between D2 and D1 */}
            <mesh position={[bwA_x, WAINSCOT_H / 2, INSIDE_BACK_Z - WAINSCOT_T / 2 - 0.005]} receiveShadow>
              <boxGeometry args={[bwA_len, WAINSCOT_H, WAINSCOT_T]} />
              <meshStandardMaterial {...wainscot} />
            </mesh>
            {/* Back-wall B — from D1 to window-wall corner */}
            <mesh position={[bwB_x, WAINSCOT_H / 2, INSIDE_BACK_Z - WAINSCOT_T / 2 - 0.005]} receiveShadow>
              <boxGeometry args={[bwB_len, WAINSCOT_H, WAINSCOT_T]} />
              <meshStandardMaterial {...wainscot} />
            </mesh>
            {/* Window-wall A — from front-wall corner to silver service door (short panelling) */}
            <mesh position={[INSIDE_WINDOW_X - WAINSCOT_T / 2 - 0.005, WW_WAINSCOT_H / 2, wwA_z]} receiveShadow>
              <boxGeometry args={[WAINSCOT_T, WW_WAINSCOT_H, wwA_len]} />
              <meshStandardMaterial {...wainscot} />
            </mesh>
            {/* Window-wall B — from silver service door to back-wall corner (short panelling) */}
            <mesh position={[INSIDE_WINDOW_X - WAINSCOT_T / 2 - 0.005, WW_WAINSCOT_H / 2, wwB_z]} receiveShadow>
              <boxGeometry args={[WAINSCOT_T, WW_WAINSCOT_H, wwB_len]} />
              <meshStandardMaterial {...wainscot} />
            </mesh>
            {/* Entrance-wall intentionally has NO wainscot — matches the real venue */}

            {/* (2) Vertical plank faces — rendered via instanced meshes for performance.
                  Two groups (tall vs. short) because front/back walls and window-wall use
                  different wainscot heights and rotated plank footprints. */}
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
            <mesh position={[0, WAINSCOT_H + CAP_H / 2, INSIDE_FRONT_Z + 0.05]}>
              <boxGeometry args={[width, CAP_H, 0.06]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
            <mesh position={[bwA_x, WAINSCOT_H + CAP_H / 2, INSIDE_BACK_Z - 0.05]}>
              <boxGeometry args={[bwA_len, CAP_H, 0.06]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
            <mesh position={[bwB_x, WAINSCOT_H + CAP_H / 2, INSIDE_BACK_Z - 0.05]}>
              <boxGeometry args={[bwB_len, CAP_H, 0.06]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
            <mesh position={[INSIDE_WINDOW_X - 0.03, WW_WAINSCOT_H + CAP_H / 2, wwA_z]}>
              <boxGeometry args={[0.06, CAP_H, wwA_len]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
            <mesh position={[INSIDE_WINDOW_X - 0.03, WW_WAINSCOT_H + CAP_H / 2, wwB_z]}>
              <boxGeometry args={[0.06, CAP_H, wwB_len]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>

            {/* (3b) Skirting board — same cuts as the bulk panels */}
            <mesh position={[0, SKIRT_H / 2, INSIDE_FRONT_Z + 0.05]}>
              <boxGeometry args={[width, SKIRT_H, 0.06]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
            <mesh position={[bwA_x, SKIRT_H / 2, INSIDE_BACK_Z - 0.05]}>
              <boxGeometry args={[bwA_len, SKIRT_H, 0.06]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
            <mesh position={[bwB_x, SKIRT_H / 2, INSIDE_BACK_Z - 0.05]}>
              <boxGeometry args={[bwB_len, SKIRT_H, 0.06]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
            <mesh position={[INSIDE_WINDOW_X - 0.03, SKIRT_H / 2, wwA_z]}>
              <boxGeometry args={[0.06, SKIRT_H, wwA_len]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
            <mesh position={[INSIDE_WINDOW_X - 0.03, SKIRT_H / 2, wwB_z]}>
              <boxGeometry args={[0.06, SKIRT_H, wwB_len]} />
              <meshStandardMaterial {...plankFace} />
            </mesh>
          </>
        )
      })()}

    </group>
  )
}
