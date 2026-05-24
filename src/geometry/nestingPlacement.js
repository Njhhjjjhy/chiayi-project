import {
  NESTING_RNG_SEED,
  NESTING_CLUSTER_CENTERS,
  NESTING_PER_CLUSTER_MIN, NESTING_PER_CLUSTER_MAX,
  NESTING_GAP,
  NESTING_LENGTH_MIN, NESTING_LENGTH_MAX,
  NESTING_RADIUS_MIN, NESTING_RADIUS_MAX,
  NESTING_HYBRID_LED_TOTAL_BOLSTERS, NESTING_HYBRID_LED_MIN_SPACING,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'

function generateBolsters() {
  const rng = makeRng(NESTING_RNG_SEED)
  const bolsters = []

  for (const center of NESTING_CLUSTER_CENTERS) {
    const clusterRotY = rng() * Math.PI
    const count = NESTING_PER_CLUSTER_MIN +
      Math.floor(rng() * (NESTING_PER_CLUSTER_MAX - NESTING_PER_CLUSTER_MIN + 1))

    for (let i = 0; i < count; i++) {
      const radius = NESTING_RADIUS_MIN + rng() * (NESTING_RADIUS_MAX - NESTING_RADIUS_MIN)
      const length = NESTING_LENGTH_MIN + rng() * (NESTING_LENGTH_MAX - NESTING_LENGTH_MIN)

      const offset = (i - (count - 1) / 2) * (NESTING_GAP + radius * 2)
      const perpX = Math.cos(clusterRotY + Math.PI / 2) * offset
      const perpZ = Math.sin(clusterRotY + Math.PI / 2) * offset

      bolsters.push({
        x: center.x + perpX,
        z: center.z + perpZ,
        length,
        radius,
        rotY: clusterRotY + (rng() - 0.5) * 0.2,
      })
    }
  }

  return bolsters
}

// Per-bolster LED count distribution. Splits NESTING_HYBRID_LED_TOTAL_BOLSTERS
// (264) evenly across the runtime bolster count, with the first
// `remainder` bolsters carrying one extra LED each. Guarantees the sum
// equals 264 exactly regardless of how many bolsters the seed resolved.
function distributeLedCounts(bolsterCount) {
  const base = Math.floor(NESTING_HYBRID_LED_TOTAL_BOLSTERS / bolsterCount)
  const remainder = NESTING_HYBRID_LED_TOTAL_BOLSTERS - base * bolsterCount
  const counts = new Array(bolsterCount)
  for (let i = 0; i < bolsterCount; i++) {
    counts[i] = base + (i < remainder ? 1 : 0)
  }
  return counts
}

// Bolster upper-surface LED placement. The bolster mesh in NestingForms
// uses CapsuleGeometry with rotation order 'ZYX' and rotation
// (0, rotY, π/2), so the capsule axis (originally local Y) ends up
// pointing along world (-cos(rotY), 0, sin(rotY)). Local +X becomes
// world +Y (straight up) and local +Z becomes world (sin(rotY), 0,
// cos(rotY)). The mapping below places a candidate sample on the upper
// half of the cylinder body (axial parameter t along the capsule axis,
// circumferential angle θ in [-π/2, +π/2] so cos(θ) ≥ 0 always points
// at or above the capsule midline). Seeded rejection sampling enforces
// the min-spacing.
function placeLedsOnBolster(bolster, ledCount, rng, minSpacing) {
  const minSpacingSq = minSpacing * minSpacing
  const placed = []
  const maxAttempts = ledCount * 400

  const cosRotY = Math.cos(bolster.rotY)
  const sinRotY = Math.sin(bolster.rotY)
  const r = bolster.radius
  const halfLen = bolster.length / 2

  let attempts = 0
  while (placed.length < ledCount && attempts < maxAttempts) {
    attempts++
    const t = (rng() - 0.5) * bolster.length
    const theta = (rng() - 0.5) * Math.PI

    const sinT = Math.sin(theta)
    const cosT = Math.cos(theta)

    const wx = bolster.x - t * cosRotY + r * sinT * sinRotY
    const wy = r + r * cosT
    const wz = bolster.z + t * sinRotY + r * sinT * cosRotY

    let tooClose = false
    for (const p of placed) {
      const dx = wx - p.x
      const dy = wy - p.y
      const dz = wz - p.z
      if (dx * dx + dy * dy + dz * dz < minSpacingSq) { tooClose = true; break }
    }
    if (tooClose) continue

    placed.push({ x: wx, y: wy, z: wz })
  }

  // Silence unused-var warning for halfLen — kept for clarity in the
  // axial range derivation above.
  void halfLen

  return placed
}

let _cache = null

export function buildNesting() {
  if (_cache) return _cache
  const bolsters = generateBolsters()

  const counts = distributeLedCounts(bolsters.length)
  const rng = makeRng(NESTING_RNG_SEED + 1)
  const allPositions = []
  for (let i = 0; i < bolsters.length; i++) {
    const placed = placeLedsOnBolster(
      bolsters[i],
      counts[i],
      rng,
      NESTING_HYBRID_LED_MIN_SPACING,
    )
    if (placed.length < counts[i]) {
      console.warn(
        `[nesting-hybrid] bolster ${i}: placed only ${placed.length} of ` +
        `${counts[i]} LEDs at min spacing ${NESTING_HYBRID_LED_MIN_SPACING} m`,
      )
    }
    for (const p of placed) {
      allPositions.push(p.x, p.y, p.z)
    }
  }

  _cache = {
    bolsters,
    leds: {
      positions: new Float32Array(allPositions),
      count: allPositions.length / 3,
      perBolsterCounts: counts,
    },
  }
  return _cache
}
