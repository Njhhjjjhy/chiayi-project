import {
  ROOM, WALL_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  SEATING_ZONES, CEILING_SEATING_FORM_SKIP_RADIUS,
  GROVE_RNG_SEED, GROVE_STEM_COUNT,
  GROVE_STEM_HEIGHT_MIN, GROVE_STEM_HEIGHT_MAX,
  GROVE_STEM_DIAMETER, GROVE_STEM_TILT_MAX_DEGREES,
  GROVE_MIN_STEM_SPACING,
  GROVE_LED_PER_STEM, GROVE_LED_CLUSTER_FRACTION,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'
import { inForestExclusion } from './forestExclusion.js'

const FOREST_X_MIN = ENTRY_GAP_WIDTH + CABINET_T               // 2.0
const FOREST_X_MAX = ROOM.W - WALL_T                           // 8.71
const FOREST_Z_MIN = CABINET_T                                 // 0.5
const FOREST_Z_MAX = PATHWAY_PARTITION_Z - CABINET_T           // 6.78

const STEM_RADIUS = GROVE_STEM_DIAMETER / 2
const TILT_MAX_RAD = (GROVE_STEM_TILT_MAX_DEGREES * Math.PI) / 180

function nearSeatingZone(x, z) {
  for (const zone of SEATING_ZONES) {
    const dx = x - zone.x
    const dz = z - zone.z
    if (dx * dx + dz * dz < CEILING_SEATING_FORM_SKIP_RADIUS * CEILING_SEATING_FORM_SKIP_RADIUS) return true
  }
  return false
}

// Poisson-disc-like placement: dense candidate pool sampled uniformly
// over the forest rectangle, exclusion-filtered, then rejection-
// sampled against the running set with the minimum stem spacing.
// Capped at 30k attempts to surface placement failures rather than
// loop indefinitely.
function generateStems() {
  const rng = makeRng(GROVE_RNG_SEED)
  const stems = []
  const maxAttempts = GROVE_STEM_COUNT * 300
  let attempts = 0
  const minSpacingSq = GROVE_MIN_STEM_SPACING * GROVE_MIN_STEM_SPACING

  while (stems.length < GROVE_STEM_COUNT && attempts < maxAttempts) {
    attempts++
    const x = FOREST_X_MIN + rng() * (FOREST_X_MAX - FOREST_X_MIN)
    const z = FOREST_Z_MIN + rng() * (FOREST_Z_MAX - FOREST_Z_MIN)

    if (inForestExclusion(x, z)) continue
    if (nearSeatingZone(x, z)) continue

    let tooClose = false
    for (const s of stems) {
      const dx = x - s.x
      const dz = z - s.z
      if (dx * dx + dz * dz < minSpacingSq) { tooClose = true; break }
    }
    if (tooClose) continue

    const height = GROVE_STEM_HEIGHT_MIN +
      rng() * (GROVE_STEM_HEIGHT_MAX - GROVE_STEM_HEIGHT_MIN)
    const tiltX = (rng() - 0.5) * 2 * TILT_MAX_RAD
    const tiltZ = (rng() - 0.5) * 2 * TILT_MAX_RAD

    stems.push({ x, z, height, tiltX, tiltZ })
  }

  return { stems, attempts }
}

// LED placement: 16 LEDs distributed inside the cylindrical segment
// covering the upper 30% of each stem. Even axial spacing along the
// stem axis with seeded lateral jitter inside the stem radius. World
// positions are baked here so the renderer is a flat InstancedMesh.
//
// The stem axis is tilted by (tiltX, tiltZ) in Euler XYZ order
// (matching how Three.js Object3D applies rotation). For small tilts
// the linear approximation
//   worldX = stem.x + lx - y * sin(tiltZ)
//   worldY = y * cos(tiltX) * cos(tiltZ)
//   worldZ = stem.z + lz + y * sin(tiltX) * cos(tiltZ)
// matches the same matrix used by the GroveStems InstancedMesh.
function generateLEDs(stems) {
  const rng = makeRng(GROVE_RNG_SEED + 1)
  const positions = []

  for (const stem of stems) {
    const segmentBottom = stem.height * (1 - GROVE_LED_CLUSTER_FRACTION)
    const segmentLength = stem.height - segmentBottom
    const sinX = Math.sin(stem.tiltX)
    const cosX = Math.cos(stem.tiltX)
    const sinZ = Math.sin(stem.tiltZ)
    const cosZ = Math.cos(stem.tiltZ)

    for (let l = 0; l < GROVE_LED_PER_STEM; l++) {
      const yFrac = (l + 0.5) / GROVE_LED_PER_STEM
      const yAxial = segmentBottom + yFrac * segmentLength

      // Lateral jitter inside the stem cross-section
      const r = Math.sqrt(rng()) * STEM_RADIUS
      const theta = rng() * Math.PI * 2
      const lx = r * Math.cos(theta)
      const lz = r * Math.sin(theta)

      const worldX = stem.x + lx - yAxial * sinZ
      const worldY = yAxial * cosX * cosZ
      const worldZ = stem.z + lz + yAxial * sinX * cosZ

      positions.push(worldX, worldY, worldZ)
    }
  }

  return {
    positions: new Float32Array(positions),
    count: positions.length / 3,
  }
}

let _cache = null

export function buildGrove() {
  if (_cache) return _cache
  const { stems, attempts } = generateStems()

  if (stems.length < GROVE_STEM_COUNT) {
    console.warn(
      `[grove] placed only ${stems.length} of ${GROVE_STEM_COUNT} ` +
      `stems after ${attempts} attempts at min spacing ${GROVE_MIN_STEM_SPACING} m`,
    )
  }

  const leds = generateLEDs(stems)

  const positions = new Float32Array(stems.length * 3)
  const tilts = new Float32Array(stems.length * 2)
  const heights = new Float32Array(stems.length)
  for (let i = 0; i < stems.length; i++) {
    positions[i * 3 + 0] = stems[i].x
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = stems[i].z
    tilts[i * 2 + 0] = stems[i].tiltX
    tilts[i * 2 + 1] = stems[i].tiltZ
    heights[i] = stems[i].height
  }

  _cache = {
    stems: { positions, rotations: tilts, heights, count: stems.length },
    leds,
  }
  return _cache
}
