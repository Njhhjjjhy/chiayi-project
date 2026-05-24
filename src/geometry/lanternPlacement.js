import {
  ROOM, WALL_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  SEATING_ZONES, CEILING_SEATING_FORM_SKIP_RADIUS,
  LANTERN_RNG_SEED, LANTERN_PILLAR_COUNT, LANTERN_PER_TIER,
  LANTERN_TIER_HEIGHTS, LANTERN_MIN_PILLAR_SPACING,
  LANTERN_LED_BASE_PER_PILLAR, LANTERN_LED_REMAINDER_PER_PILLAR,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'
import { inForestExclusion } from './forestExclusion.js'

const FOREST_X_MIN = ENTRY_GAP_WIDTH + CABINET_T               // 2.0
const FOREST_X_MAX = ROOM.W - WALL_T                           // 8.71
const FOREST_Z_MIN = CABINET_T                                 // 0.5
const FOREST_Z_MAX = PATHWAY_PARTITION_Z - CABINET_T           // 6.78

function nearSeatingZone(x, z) {
  for (const zone of SEATING_ZONES) {
    const dx = x - zone.x
    const dz = z - zone.z
    if (dx * dx + dz * dz < CEILING_SEATING_FORM_SKIP_RADIUS * CEILING_SEATING_FORM_SKIP_RADIUS) return true
  }
  return false
}

function generatePillars() {
  const rng = makeRng(LANTERN_RNG_SEED)
  const pillars = []
  const maxAttempts = LANTERN_PILLAR_COUNT * 1000
  const minSpacingSq = LANTERN_MIN_PILLAR_SPACING * LANTERN_MIN_PILLAR_SPACING
  let attempts = 0

  while (pillars.length < LANTERN_PILLAR_COUNT && attempts < maxAttempts) {
    attempts++
    const x = FOREST_X_MIN + rng() * (FOREST_X_MAX - FOREST_X_MIN)
    const z = FOREST_Z_MIN + rng() * (FOREST_Z_MAX - FOREST_Z_MIN)

    if (inForestExclusion(x, z)) continue
    if (nearSeatingZone(x, z)) continue

    let tooClose = false
    for (const p of pillars) {
      const dx = x - p.x
      const dz = z - p.z
      if (dx * dx + dz * dz < minSpacingSq) { tooClose = true; break }
    }
    if (tooClose) continue

    pillars.push({ x, z })
  }

  // Tier assignment in seed order: first 5 take the shortest tier,
  // next 5 the middle tier, last 5 the tallest.
  for (let i = 0; i < pillars.length; i++) {
    const tierIdx = Math.floor(i / LANTERN_PER_TIER)
    pillars[i].height = LANTERN_TIER_HEIGHTS[Math.min(tierIdx, LANTERN_TIER_HEIGHTS.length - 1)]
  }

  // LED count assignment in seed order: first 5 carry the remainder
  // count (118), the remaining 10 carry the base count (117). This is
  // independent of tier assignment per spec.
  for (let i = 0; i < pillars.length; i++) {
    pillars[i].ledCount = i < LANTERN_PER_TIER
      ? LANTERN_LED_REMAINDER_PER_PILLAR
      : LANTERN_LED_BASE_PER_PILLAR
  }

  return { pillars, attempts }
}

// LEDs are stacked along the pillar's vertical centre axis with even
// spacing across the full pillar height (Y from 0 to pillar.height).
function generateLEDs(pillars) {
  const positions = []
  for (const pillar of pillars) {
    const n = pillar.ledCount
    for (let l = 0; l < n; l++) {
      const yFrac = (l + 0.5) / n
      const y = yFrac * pillar.height
      positions.push(pillar.x, y, pillar.z)
    }
  }
  return {
    positions: new Float32Array(positions),
    count: positions.length / 3,
  }
}

let _cache = null

export function buildLanterns() {
  if (_cache) return _cache
  const { pillars, attempts } = generatePillars()

  if (pillars.length < LANTERN_PILLAR_COUNT) {
    console.warn(
      `[lantern] placed only ${pillars.length} of ${LANTERN_PILLAR_COUNT} ` +
      `pillars after ${attempts} attempts at min spacing ${LANTERN_MIN_PILLAR_SPACING} m`,
    )
  }

  const leds = generateLEDs(pillars)

  const positions = new Float32Array(pillars.length * 3)
  const heights = new Float32Array(pillars.length)
  for (let i = 0; i < pillars.length; i++) {
    positions[i * 3 + 0] = pillars[i].x
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = pillars[i].z
    heights[i] = pillars[i].height
  }

  _cache = {
    pillars: { positions, heights, count: pillars.length, ledCounts: pillars.map((p) => p.ledCount) },
    leds,
  }
  return _cache
}
