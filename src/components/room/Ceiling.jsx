import { useMemo } from 'react'
import {
  ROOM,
  FOREST_X_START, FOREST_X_END, FOREST_Z_START, FOREST_Z_END,
} from '../../geometry/dimensions.js'

// FlatPanelCeiling — 25 plywood panels suspended at varying heights and
// slight tilts across the forest zone. Each panel carries a jittered grid
// of green LED pinpoints on its lower face and hangs by two thin cables
// from the structural ceiling at Y = ROOM.H.
//
// Panel inventory (per spec section 2.1):
//   10 small panels  0.40 × 0.40 m  · 12 LEDs each
//   10 medium panels 0.65 × 0.65 m  · 20 LEDs each
//    5 large panels  0.90 × 0.90 m  · 30 LEDs each
//   ────────────────────────────────────
//   25 panels total · 470 LEDs total
//
// Distribution: seeded PRNG (Park–Miller, seed 42) places panels
// organically within the forest zone — no uniform grid, organic
// scatter. Re-rolls via a seed change are possible but the seed is
// fixed for this build.
//
// Construction-mode material swap is not wired up in v2 yet — v2 has
// no equivalent viewMode infrastructure. Deferred until the proposal
// switcher / mode system lands.

const PANEL_SPEC = [
  { count: 10, size: 0.40, ledCols: 4, ledRows: 3 }, // 12 LEDs
  { count: 10, size: 0.65, ledCols: 5, ledRows: 4 }, // 20 LEDs
  { count: 5,  size: 0.90, ledCols: 6, ledRows: 5 }, // 30 LEDs
]

// ambient-visible: dark plywood panel body, just lifted off pure black.
const PANEL_MATERIAL = {
  color: '#111111',
  emissive: '#111111',
  emissiveIntensity: 0.06,
  roughness: 0.95,
  metalness: 0,
}

// blooms: intensity 5 with toneMapped:false pushes luminance past the
// bloom threshold (1.0) regardless of the AgX pass.
const LED_MATERIAL = {
  color: '#00ff00',
  emissive: '#00ff00',
  emissiveIntensity: 5,
  toneMapped: false,
  roughness: 0.5,
  metalness: 0,
}

// ambient-visible: cables would crush to pure black without a small
// emissive lift now that the renderer runs flat into AgX.
const CABLE_MATERIAL = {
  color: '#333333',
  emissive: '#333333',
  emissiveIntensity: 0.05,
  roughness: 0.6,
  metalness: 0.3,
}

const PANEL_THICKNESS = 0.01
const LED_RADIUS = 0.003 // real-world LED size (3 mm) — matches firefly particles
const CABLE_RADIUS = 0.003
const MAX_TILT_RAD = (15 * Math.PI) / 180
const PANEL_Y_MIN = 2.2
const PANEL_Y_MAX = 3.2
const SEED = 42

// Park–Miller seeded PRNG so the panel layout is deterministic.
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generatePanels() {
  const rng = makeRng(SEED)
  const panels = []

  for (const spec of PANEL_SPEC) {
    for (let i = 0; i < spec.count; i++) {
      const half = spec.size / 2

      // Position inside forest zone with a half-panel inset so the panel
      // never clips past the zone boundary.
      const x = FOREST_X_START + half + rng() * (FOREST_X_END - FOREST_X_START - spec.size)
      const z = FOREST_Z_START + half + rng() * (FOREST_Z_END - FOREST_Z_START - spec.size)
      const y = PANEL_Y_MIN + rng() * (PANEL_Y_MAX - PANEL_Y_MIN)

      // Tilt ±15° on X and Z axes (not Y — Y rotation has no visual
      // effect on a square panel and would only complicate LED layout).
      const tiltX = (rng() - 0.5) * 2 * MAX_TILT_RAD
      const tiltZ = (rng() - 0.5) * 2 * MAX_TILT_RAD

      // LED positions on the lower face — jittered grid in panel-local
      // space (origin at panel centre, axes aligned with panel before
      // tilt). LEDs ride along with the panel's rotation since they
      // share the rotated sub-group.
      const leds = []
      const cellW = spec.size / spec.ledCols
      const cellH = spec.size / spec.ledRows
      for (let c = 0; c < spec.ledCols; c++) {
        for (let r = 0; r < spec.ledRows; r++) {
          const lx = -half + (c + 0.5) * cellW + (rng() - 0.5) * cellW * 0.4
          const lz = -half + (r + 0.5) * cellH + (rng() - 0.5) * cellH * 0.4
          leds.push([lx, lz])
        }
      }

      panels.push({ size: spec.size, x, y, z, tiltX, tiltZ, leds })
    }
  }

  return panels
}

function Panel({ panel, hideLeds }) {
  const halfSize = panel.size / 2
  const { tiltX, tiltZ } = panel
  const sinX = Math.sin(tiltX), cosX = Math.cos(tiltX)
  const sinZ = Math.sin(tiltZ), cosZ = Math.cos(tiltZ)
  const ceilingLocalY = ROOM.H - panel.y

  // A corner at panel-local (hx, 0, hz) after Euler XYZ rotation
  // [tiltX, 0, tiltZ] lands at this offset from the panel centre
  // (parent group has no rotation, so the offset is world-axis-aligned).
  const cornerOffset = (hx, hz) => [
    hx * cosZ + hz * sinX * sinZ,
    hx * sinZ - hz * sinX * cosZ,
    hz * cosX,
  ]

  const cableAnchors = [
    cornerOffset(+halfSize, +halfSize),
    cornerOffset(-halfSize, -halfSize),
  ]

  return (
    <group position={[panel.x, panel.y, panel.z]}>
      {/* Rotated sub-group: panel face + LEDs ride along with the tilt. */}
      <group rotation={[tiltX, 0, tiltZ]}>
        <mesh>
          <boxGeometry args={[panel.size, PANEL_THICKNESS, panel.size]} />
          <meshStandardMaterial {...PANEL_MATERIAL} />
        </mesh>
        {!hideLeds && panel.leds.map(([lx, lz], i) => (
          <mesh
            key={i}
            position={[lx, -PANEL_THICKNESS / 2 - LED_RADIUS, lz]}
          >
            <sphereGeometry args={[LED_RADIUS, 8, 8]} />
            <meshStandardMaterial {...LED_MATERIAL} />
          </mesh>
        ))}
      </group>

      {/* Two suspension cables anchored at the panel's rotated diagonal
          corners, running vertically up to the structural ceiling at
          Y = ROOM.H. Each cable's length and midpoint accounts for the
          corner's Y offset under tilt, so cables meet the panel cleanly
          even on the largest tilted panels. */}
      {cableAnchors.map(([dx, dy, dz], i) => {
        const cableLen = ceilingLocalY - dy
        const midY = (dy + ceilingLocalY) / 2
        return (
          <mesh key={i} position={[dx, midY, dz]}>
            <cylinderGeometry args={[CABLE_RADIUS, CABLE_RADIUS, cableLen, 6]} />
            <meshStandardMaterial {...CABLE_MATERIAL} />
          </mesh>
        )
      })}
    </group>
  )
}

// hideLeds: skip the static LED dots so the FireflySystem can render
// the animated particles at the same positions without doubling up.
export default function Ceiling({ hideLeds = false }) {
  const panels = useMemo(() => generatePanels(), [])

  return (
    <group>
      {panels.map((panel, i) => (
        <Panel key={i} panel={panel} hideLeds={hideLeds} />
      ))}
    </group>
  )
}
