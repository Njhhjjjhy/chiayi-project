import {
  ROOM, WALL_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  CEILING_MODULES_TOTAL, CEILING_LEDS_PER_MODULE, CEILING_MODULE_RADIUS,
  CEILING_FORM_MAX_EDGE_X,
  NESTING_RNG_SEED,
  NESTING_PEBBLE_COUNT,
  NESTING_PEBBLE_DIAMETER_MIN, NESTING_PEBBLE_DIAMETER_MAX,
  NESTING_PEBBLE_HEIGHT_RATIO_MIN, NESTING_PEBBLE_HEIGHT_RATIO_MAX,
  NESTING_PEBBLE_SQUASH_MIN,
  NESTING_PEBBLE_DROP_MAX, NESTING_PEBBLE_EDGE_GAP,
  NESTING_LED_MIN_SPACING,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'
import { inForestExclusion } from './forestExclusion.js'

// Nesting pebble ceiling (concept image 09). Dark rounded pebble-like
// forms cover the forest ceiling, each studded with green points set
// into its underside. All CEILING_MODULES_TOTAL modules (1,760 LEDs)
// live here — this proposal replaces the regular sculptural ceiling
// rather than adding to it.
//
// Pipeline:
//   1. Place NESTING_PEBBLE_COUNT pebbles by rejection sampling across
//      the forest footprint — dense coverage, near-touching, like
//      river stones seen from below.
//   2. Distribute the 110 modules across the pebbles proportionally to
//      footprint area (largest remainder), so big pebbles carry more
//      points. Total is exactly 110 regardless of how many pebbles the
//      seed managed to place.
//   3. Sample each module's 16 LEDs on the pebble's lower surface with
//      metric min-spacing, clustered within CEILING_MODULE_RADIUS of a
//      module anchor.

const FOREST_X_MIN = ENTRY_GAP_WIDTH + CABINET_T               // 2.0
const FOREST_X_MAX = ROOM.W - WALL_T                           // 8.71
const FOREST_Z_MIN = CABINET_T                                 // 0.5
const FOREST_Z_MAX = PATHWAY_PARTITION_Z - CABINET_T           // 6.78

function generatePebbles() {
  const rng = makeRng(NESTING_RNG_SEED)
  const pebbles = []
  const maxAttempts = NESTING_PEBBLE_COUNT * 300

  let attempts = 0
  while (pebbles.length < NESTING_PEBBLE_COUNT && attempts < maxAttempts) {
    attempts++

    const diameter = NESTING_PEBBLE_DIAMETER_MIN +
      rng() * (NESTING_PEBBLE_DIAMETER_MAX - NESTING_PEBBLE_DIAMETER_MIN)
    const halfX = diameter / 2
    const squash = NESTING_PEBBLE_SQUASH_MIN + rng() * (1 - NESTING_PEBBLE_SQUASH_MIN)
    const halfZ = halfX * squash
    const heightRatio = NESTING_PEBBLE_HEIGHT_RATIO_MIN +
      rng() * (NESTING_PEBBLE_HEIGHT_RATIO_MAX - NESTING_PEBBLE_HEIGHT_RATIO_MIN)
    const halfY = (diameter * heightRatio) / 2
    const rotY = rng() * Math.PI * 2
    const maxHalf = Math.max(halfX, halfZ)

    const x = FOREST_X_MIN + maxHalf + rng() * (CEILING_FORM_MAX_EDGE_X - FOREST_X_MIN - 2 * maxHalf)
    const z = FOREST_Z_MIN + maxHalf + rng() * (FOREST_Z_MAX - FOREST_Z_MIN - 2 * maxHalf)

    if (inForestExclusion(x, z)) continue

    let tooClose = false
    for (const p of pebbles) {
      const dx = p.x - x
      const dz = p.z - z
      const minDist = maxHalf + Math.max(p.halfX, p.halfZ) + NESTING_PEBBLE_EDGE_GAP
      if (dx * dx + dz * dz < minDist * minDist) { tooClose = true; break }
    }
    if (tooClose) continue

    const drop = rng() * NESTING_PEBBLE_DROP_MAX
    const y = ROOM.H - halfY - drop

    pebbles.push({ x, y, z, halfX, halfY, halfZ, rotY })
  }

  return pebbles
}

// Module counts per pebble, proportional to footprint area, balanced
// to exactly CEILING_MODULES_TOTAL by largest remainder.
function distributeModules(pebbles) {
  const areas = pebbles.map((p) => p.halfX * p.halfZ)
  const totalArea = areas.reduce((s, a) => s + a, 0)
  const raw = areas.map((a) => (a / totalArea) * CEILING_MODULES_TOTAL)
  const counts = raw.map((r) => Math.floor(r))
  let assigned = counts.reduce((s, c) => s + c, 0)

  const byRemainder = raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem)
  let k = 0
  while (assigned < CEILING_MODULES_TOTAL) {
    counts[byRemainder[k % byRemainder.length].i]++
    assigned++
    k++
  }
  return counts
}

// Sample a point on the pebble's lower surface in world space. The
// pebble is an ellipsoid with half-extents (halfX, halfY, halfZ),
// rotated rotY about Y. theta ∈ [π/2, π] keeps the sample on the
// underside.
function sampleUnderside(pebble, rng, theta = null, phi = null) {
  const t = theta ?? (Math.PI / 2) + rng() * (Math.PI / 2)
  const p = phi ?? rng() * Math.PI * 2
  const lx = pebble.halfX * Math.sin(t) * Math.cos(p)
  const ly = pebble.halfY * Math.cos(t)
  const lz = pebble.halfZ * Math.sin(t) * Math.sin(p)
  const cY = Math.cos(pebble.rotY), sY = Math.sin(pebble.rotY)
  return {
    x: pebble.x + lx * cY + lz * sY,
    y: pebble.y + ly,
    z: pebble.z - lx * sY + lz * cY,
    theta: t,
    phi: p,
  }
}

function generateLEDs(pebbles, moduleCounts) {
  const rng = makeRng(NESTING_RNG_SEED + 1)
  const positions = []
  const unitIndices = []
  const unitCenters = []
  const minSpacingSq = NESTING_LED_MIN_SPACING * NESTING_LED_MIN_SPACING
  let moduleIdx = 0

  for (let i = 0; i < pebbles.length; i++) {
    const pebble = pebbles[i]
    // Angular spread that maps CEILING_MODULE_RADIUS onto this
    // pebble's surface, so module clusters stay readable on big and
    // small pebbles alike.
    const spread = Math.min(0.9, CEILING_MODULE_RADIUS / Math.max(0.2, pebble.halfX))

    for (let m = 0; m < moduleCounts[i]; m++) {
      const anchor = sampleUnderside(pebble, rng)
      unitCenters.push([anchor.x, anchor.y, anchor.z])

      const placed = []
      let attempts = 0
      while (placed.length < CEILING_LEDS_PER_MODULE && attempts < CEILING_LEDS_PER_MODULE * 40) {
        attempts++
        let theta = anchor.theta + (rng() - 0.5) * 2 * spread
        const phi = anchor.phi + (rng() - 0.5) * 2 * spread
        // reflect back into the underside band
        if (theta < Math.PI / 2) theta = Math.PI / 2 + (Math.PI / 2 - theta)
        if (theta > Math.PI) theta = Math.PI - (theta - Math.PI)
        const cand = sampleUnderside(pebble, rng, theta, phi)

        let tooClose = false
        for (const prev of placed) {
          const dx = cand.x - prev.x
          const dy = cand.y - prev.y
          const dz = cand.z - prev.z
          if (dx * dx + dy * dy + dz * dz < minSpacingSq) { tooClose = true; break }
        }
        if (tooClose) continue
        placed.push(cand)
      }
      // Top up without the spacing constraint if rejection ran dry —
      // the 1,760 invariant always wins.
      while (placed.length < CEILING_LEDS_PER_MODULE) {
        placed.push(sampleUnderside(pebble, rng))
      }

      for (const led of placed) {
        positions.push(led.x, led.y, led.z)
        unitIndices.push(moduleIdx)
      }
      moduleIdx++
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

let _cache = null

export function buildNesting() {
  if (_cache) return _cache
  const pebbles = generatePebbles()
  const moduleCounts = distributeModules(pebbles)
  const leds = generateLEDs(pebbles, moduleCounts)
  _cache = { pebbles, moduleCounts, leds }
  return _cache
}
