import {
  ROOM, WALL_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  COLUMN_X, COLUMN_W, COLUMN_D,
  SEATING_ZONES, CEILING_SEATING_FORM_SKIP_RADIUS,
  ARCHES_RNG_SEED, ARCHES_COUNT,
  ARCHES_HEIGHT_MIN, ARCHES_HEIGHT_MAX,
  ARCHES_WIDTH_MIN, ARCHES_WIDTH_MAX,
  ARCHES_MIN_SPACING,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'

const FOREST_X_MIN = ENTRY_GAP_WIDTH + CABINET_T
const FOREST_X_MAX = ROOM.W - WALL_T
const FOREST_Z_MIN = CABINET_T
const FOREST_Z_MAX = PATHWAY_PARTITION_Z - CABINET_T

function inExclusion(x, z) {
  if (x >= ENTRY_GAP_WIDTH && x <= COLUMN_X && z >= 0 && z <= CABINET_T) return true
  if (x >= ENTRY_GAP_WIDTH && x <= ENTRY_GAP_WIDTH + CABINET_T && z >= 0 && z <= PATHWAY_PARTITION_Z) return true
  if (x >= ENTRY_GAP_WIDTH && x <= COLUMN_X && z >= PATHWAY_PARTITION_Z - CABINET_T && z <= PATHWAY_PARTITION_Z) return true
  if (x >= COLUMN_X - COLUMN_W / 2 && x <= COLUMN_X + COLUMN_W / 2 &&
      z >= 0 && z <= COLUMN_D) return true
  return false
}

function nearSeating(x, z) {
  for (const zone of SEATING_ZONES) {
    const dx = x - zone.x, dz = z - zone.z
    if (dx * dx + dz * dz < CEILING_SEATING_FORM_SKIP_RADIUS * CEILING_SEATING_FORM_SKIP_RADIUS) return true
  }
  return false
}

function generateArches() {
  const rng = makeRng(ARCHES_RNG_SEED)
  const arches = []
  let attempts = 0

  while (arches.length < ARCHES_COUNT && attempts < ARCHES_COUNT * 80) {
    attempts++
    const x = FOREST_X_MIN + 0.5 + rng() * (FOREST_X_MAX - FOREST_X_MIN - 1.0)
    const z = FOREST_Z_MIN + 0.5 + rng() * (FOREST_Z_MAX - FOREST_Z_MIN - 1.0)

    if (inExclusion(x, z)) continue
    if (nearSeating(x, z)) continue

    let tooClose = false
    for (const a of arches) {
      const dx = a.x - x, dz = a.z - z
      if (dx * dx + dz * dz < ARCHES_MIN_SPACING * ARCHES_MIN_SPACING) { tooClose = true; break }
    }
    if (tooClose) continue

    const height = ARCHES_HEIGHT_MIN + rng() * (ARCHES_HEIGHT_MAX - ARCHES_HEIGHT_MIN)
    const width = ARCHES_WIDTH_MIN + rng() * (ARCHES_WIDTH_MAX - ARCHES_WIDTH_MIN)
    const rotY = rng() * Math.PI * 2

    arches.push({ x, z, height, width, rotY })
  }

  return arches
}

let _cache = null

export function buildArches() {
  if (_cache) return _cache
  _cache = { arches: generateArches() }
  return _cache
}
