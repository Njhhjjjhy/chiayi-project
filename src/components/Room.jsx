import { useVariant } from '../hooks/useVariant.jsx'
import Ceiling from './Ceiling.jsx'
import Floor from './Floor.jsx'

// Room dimensions from phase 1
const W = 10        // width (x-axis)
const D = 10        // depth (z-axis)
const H = 3.52      // usable height after beams
const WALL_T = 0.12 // wall thickness
const HW = W / 2    // 5
const HD = D / 2    // 5

// Entrance: 2.4m wide × full height, on LEFT wall (x = -HW)
// centered at z = -1.0 (roughly centered, slightly toward back wall)
const ENT_W = 2.4
const ENT_Z = -1.0
const ENT_START = ENT_Z - ENT_W / 2  // 0.8
const ENT_END = ENT_Z + ENT_W / 2    // 3.2

// Back windows: on RIGHT wall (x = +HW), row of 4 panes
const WIN_TOTAL_W = 5.6
const WIN_H = 1.6
const WIN_SILL = 0.9
const WIN_Z = -1.0 // center position along z

// Vent on back wall (z = -HD)
const VENT_W = 1.0
const VENT_H = 0.5
const VENT_Y = 2.6
const VENT_X = 1.5

// Wainscoting
const WAINSCOT_H = 0.95


export default function Room({ width = W, depth = D, height = H }) {
  const { isConstruction, isLight } = useVariant()

  const wall = isConstruction
    ? { wireframe: true, color: '#666' }
    : isLight
    ? { color: '#f0ece5', roughness: 0.85, metalness: 0 }
    : { color: '#0e0e0e', roughness: 1, metalness: 0 }

  const wainscot = isConstruction
    ? { wireframe: true, color: '#444' }
    : isLight
    ? { color: '#1a1a1a', roughness: 0.9, metalness: 0 }
    : { color: '#080808', roughness: 1, metalness: 0 }

  const blackout = isConstruction
    ? { wireframe: true, color: '#222' }
    : { color: '#050505', roughness: 1, metalness: 0 }

  const curtain = isConstruction
    ? { wireframe: true, color: '#600' }
    : isLight
    ? { color: '#2a1520', roughness: 0.95, metalness: 0 }
    : { color: '#0a0808', roughness: 1, metalness: 0 }

  // Left wall has entrance gap: two wall sections with a gap between them
  // Section A: from z=-5 to z=0.8 (behind entrance)
  const leftA_len = ENT_START - (-HD) // 0.8 - (-5) = 5.8
  const leftA_z = (-HD + ENT_START) / 2 // (-5 + 0.8) / 2 = -2.1

  // Section B: from z=3.2 to z=5 (in front of entrance)
  const leftB_len = HD - ENT_END // 5 - 3.2 = 1.8
  const leftB_z = (ENT_END + HD) / 2 // (3.2 + 5) / 2 = 4.1

  return (
    <group>
      <Floor />
      <Ceiling />

      {/* ===== LEFT WALL (x = -HW) — entrance opening ===== */}

      {/* Section A: behind entrance (z = -5 to 0.8) */}
      <mesh position={[-HW, height / 2, leftA_z]} receiveShadow>
        <boxGeometry args={[WALL_T, height, leftA_len]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      {/* Section B: in front of entrance (z = 3.2 to 5) */}
      <mesh position={[-HW, height / 2, leftB_z]} receiveShadow>
        <boxGeometry args={[WALL_T, height, leftB_len]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      {/* Wainscoting on left wall section A */}
      <mesh position={[-HW + WALL_T / 2 + 0.01, WAINSCOT_H / 2, leftA_z]}>
        <boxGeometry args={[0.02, WAINSCOT_H, leftA_len]} />
        <meshStandardMaterial {...wainscot} />
      </mesh>

      {/* Door frame around entrance opening */}
      {/* Top header */}
      <mesh position={[-HW, height - 0.06, ENT_Z]}>
        <boxGeometry args={[WALL_T + 0.04, 0.12, ENT_W + 0.12]} />
        <meshStandardMaterial color={isConstruction ? '#555' : isLight ? '#3a2a1a' : '#1a1010'} wireframe={isConstruction} roughness={0.85} />
      </mesh>
      {/* Left jamb */}
      <mesh position={[-HW, height / 2, ENT_START - 0.04]}>
        <boxGeometry args={[WALL_T + 0.04, height, 0.08]} />
        <meshStandardMaterial color={isConstruction ? '#555' : isLight ? '#3a2a1a' : '#1a1010'} wireframe={isConstruction} roughness={0.85} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[-HW, height / 2, ENT_END + 0.04]}>
        <boxGeometry args={[WALL_T + 0.04, height, 0.08]} />
        <meshStandardMaterial color={isConstruction ? '#555' : isLight ? '#3a2a1a' : '#1a1010'} wireframe={isConstruction} roughness={0.85} />
      </mesh>

      {/* Dark curtain set back behind door frame */}
      <mesh position={[-HW - 0.1, height / 2, ENT_Z]}>
        <boxGeometry args={[0.02, height - 0.15, ENT_W - 0.1]} />
        <meshStandardMaterial {...curtain} transparent opacity={isConstruction ? 0.6 : 0.7} />
      </mesh>

      {/* ===== RIGHT WALL (x = +HW) — back windows (blacked out) ===== */}

      <mesh position={[HW, height / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_T, height, depth]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      {/* Wainscoting on right wall */}
      <mesh position={[HW - WALL_T / 2 - 0.01, WAINSCOT_H / 2, 0]}>
        <boxGeometry args={[0.02, WAINSCOT_H, depth]} />
        <meshStandardMaterial {...wainscot} />
      </mesh>

      {/* Blacked-out window panels */}
      <mesh position={[HW - WALL_T / 2 - 0.02, WIN_SILL + WIN_H / 2, WIN_Z]}>
        <boxGeometry args={[0.05, WIN_H, WIN_TOTAL_W]} />
        <meshStandardMaterial {...blackout} />
      </mesh>

      {/* Window frame dividers (visible in light/construction) */}
      {(isLight || isConstruction) && (
        <group position={[HW - WALL_T / 2 - 0.03, WIN_SILL, WIN_Z - WIN_TOTAL_W / 2]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, WIN_H / 2, i * (WIN_TOTAL_W / 4)]}>
              <boxGeometry args={[0.025, WIN_H + 0.06, 0.04]} />
              <meshStandardMaterial color={isConstruction ? '#555' : '#333'} wireframe={isConstruction} />
            </mesh>
          ))}
          <mesh position={[0, 0, WIN_TOTAL_W / 2]}>
            <boxGeometry args={[0.025, 0.04, WIN_TOTAL_W + 0.06]} />
            <meshStandardMaterial color={isConstruction ? '#555' : '#333'} wireframe={isConstruction} />
          </mesh>
          <mesh position={[0, WIN_H, WIN_TOTAL_W / 2]}>
            <boxGeometry args={[0.025, 0.04, WIN_TOTAL_W + 0.06]} />
            <meshStandardMaterial color={isConstruction ? '#555' : '#333'} wireframe={isConstruction} />
          </mesh>
        </group>
      )}

      {/* ===== BACK WALL (z = -HD) — behind the big wall treatment ===== */}

      <mesh position={[0, height / 2, -HD - WALL_T / 2]} receiveShadow>
        <boxGeometry args={[width, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>

      {/* Vent on back wall — highlighted in construction, hidden behind mountain wall otherwise */}
      {isConstruction && (
        <>
          {/* Vent box */}
          <mesh position={[VENT_X, VENT_Y, -HD + 0.07]}>
            <boxGeometry args={[VENT_W, VENT_H, 0.08]} />
            <meshStandardMaterial color="#2a9d8f" opacity={0.35} transparent />
          </mesh>
          {/* Vent frame */}
          <mesh position={[VENT_X, VENT_Y, -HD + 0.08]}>
            <boxGeometry args={[VENT_W + 0.08, VENT_H + 0.08, 0.02]} />
            <meshStandardMaterial color="#2a9d8f" wireframe />
          </mesh>
        </>
      )}

      {/* ===== FRONT WALL (z = +HD) — behind audience ===== */}

      <mesh position={[0, height / 2, HD]} receiveShadow>
        <boxGeometry args={[width, height, WALL_T]} />
        <meshStandardMaterial {...wall} />
      </mesh>
      <mesh position={[0, WAINSCOT_H / 2, HD - WALL_T / 2 - 0.01]}>
        <boxGeometry args={[width, WAINSCOT_H, 0.02]} />
        <meshStandardMaterial {...wainscot} />
      </mesh>

      {/* Beams and column hidden — covered by ceiling treatment */}

      {/* ===== EDGE SAFETY LIGHTING (experience mode) ===== */}

      {!isConstruction && !isLight && (
        <>
          {[
            [0, 0.03, HD - 0.2],
            [HW - 0.2, 0.03, 0],
            [-HW + 0.2, 0.03, -2],
          ].map(([x, y, z], i) => (
            <pointLight key={`edge-${i}`} position={[x, y, z]} color="#ffaa44" intensity={0.04} distance={3} decay={2} />
          ))}
        </>
      )}
    </group>
  )
}
