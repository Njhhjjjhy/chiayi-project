import {
  ROOM,
  FOREST_X_START, FOREST_X_END,
  FOREST_Z_START, FOREST_Z_END,
} from '../../geometry/dimensions.js'

// v2 firefly surface positions. Mirrors Ceiling.jsx's panel generation
// so the firefly system targets the exact same LEDs the static ceiling
// renders — seed 42, identical PANEL_SPEC.
//
// Unit concept (in v1): each LED belonged to a 1.2×1.2m hardware unit
// with one IR detector + 18 LEDs. v2 retires that wiring concept and
// uses 'one panel = one unit' instead, so Flashlight's beam still wakes
// a coherent cluster (a whole panel's 12–30 LEDs at once) and the
// cascade still has a natural neighbour graph (adjacent panels).
//
// Returns:
//   positions:    Float32Array of xyz flat triples (length count * 3)
//   unitIndices:  Uint16Array, panel each LED belongs to (0..24)
//   unitCenters:  Array of [x, y, z] panel centres (length unitCount)
//   count:        total LED count (= 470 with the default spec)
//   unitCount:    25

// Seeded Park-Miller RNG — deterministic so the LED layout is pure-
// render-safe under React 19 strict mode.
export function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const PANEL_SPEC = [
  { count: 10, size: 0.40, ledCols: 4, ledRows: 3 }, // 12 LEDs
  { count: 10, size: 0.65, ledCols: 5, ledRows: 4 }, // 20 LEDs
  { count: 5,  size: 0.90, ledCols: 6, ledRows: 5 }, // 30 LEDs
]
const PANEL_THICKNESS = 0.01
const LED_RADIUS = 0.003 // matches firefly particle size (3 mm — real-world)
const MAX_TILT_RAD = (15 * Math.PI) / 180
const PANEL_Y_MIN = 2.2
const PANEL_Y_MAX = 3.2
const SEED = 42

function generatePanels() {
  const rng = makeRng(SEED)
  const panels = []
  for (const spec of PANEL_SPEC) {
    for (let i = 0; i < spec.count; i++) {
      const half = spec.size / 2
      const x = FOREST_X_START + half + rng() * (FOREST_X_END - FOREST_X_START - spec.size)
      const z = FOREST_Z_START + half + rng() * (FOREST_Z_END - FOREST_Z_START - spec.size)
      const y = PANEL_Y_MIN + rng() * (PANEL_Y_MAX - PANEL_Y_MIN)
      const tiltX = (rng() - 0.5) * 2 * MAX_TILT_RAD
      const tiltZ = (rng() - 0.5) * 2 * MAX_TILT_RAD
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

// Apply panel rotation [tiltX, 0, tiltZ] (Euler XYZ) to a panel-local
// LED point and offset by panel position.
function localToWorld(panel, lx, lz) {
  const ledY = -PANEL_THICKNESS / 2 - LED_RADIUS
  const sinX = Math.sin(panel.tiltX), cosX = Math.cos(panel.tiltX)
  const sinZ = Math.sin(panel.tiltZ), cosZ = Math.cos(panel.tiltZ)
  // Rx then Rz on (lx, ledY, lz)
  const y1 = ledY * cosX - lz * sinX
  const z1 = ledY * sinX + lz * cosX
  const x2 = lx * cosZ - y1 * sinZ
  const y2 = lx * sinZ + y1 * cosZ
  const z2 = z1
  return [panel.x + x2, panel.y + y2, panel.z + z2]
}

export function getLedSurface() {
  const panels = generatePanels()
  const positions = []
  const unitIndices = []
  const unitCenters = []

  for (let p = 0; p < panels.length; p++) {
    const panel = panels[p]
    unitCenters.push([panel.x, panel.y, panel.z])
    for (const [lx, lz] of panel.leds) {
      const [wx, wy, wz] = localToWorld(panel, lx, lz)
      positions.push(wx, wy, wz)
      unitIndices.push(p)
    }
  }

  return {
    positions: new Float32Array(positions),
    unitIndices: new Uint16Array(unitIndices),
    unitCenters,
    count: positions.length / 3,
    unitCount: unitCenters.length,
  }
}

// Convenience constants for behaviours that need them.
export const FOREST_CENTER_X = (FOREST_X_START + FOREST_X_END) / 2
export const FOREST_CENTER_Z = (FOREST_Z_START + FOREST_Z_END) / 2
export const FOREST_SPAN_X = FOREST_X_END - FOREST_X_START
export const FOREST_SPAN_Z = FOREST_Z_END - FOREST_Z_START
export const PANEL_Y_MID = (PANEL_Y_MIN + PANEL_Y_MAX) / 2

export { ROOM }
