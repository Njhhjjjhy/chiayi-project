import {
  ROOM, WALL_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  CEILING_LEDS_PER_MODULE, CEILING_MODULE_RADIUS,
  FLOCK_RNG_SEED, FLOCK_MODULE_COUNT,
  FLOCK_Y_MIN, FLOCK_Y_MAX, FLOCK_Y_BIAS_CENTER, FLOCK_Y_SIGMA,
  FLOCK_GRID_SPACING, FLOCK_GRID_JITTER,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'
import { inForestExclusion } from './forestExclusion.js'

const FOREST_X_MIN = ENTRY_GAP_WIDTH + CABINET_T
const FOREST_X_MAX = ROOM.W - WALL_T
const FOREST_Z_MIN = CABINET_T
const FOREST_Z_MAX = PATHWAY_PARTITION_Z - CABINET_T

function generateModules() {
  const rng = makeRng(FLOCK_RNG_SEED)

  const candidates = []
  for (let x = FOREST_X_MIN + FLOCK_GRID_SPACING / 2; x < FOREST_X_MAX; x += FLOCK_GRID_SPACING) {
    for (let z = FOREST_Z_MIN + FLOCK_GRID_SPACING / 2; z < FOREST_Z_MAX; z += FLOCK_GRID_SPACING) {
      const jx = x + (rng() - 0.5) * 2 * FLOCK_GRID_JITTER
      const jz = z + (rng() - 0.5) * 2 * FLOCK_GRID_JITTER
      if (jx < FOREST_X_MIN || jx > FOREST_X_MAX) continue
      if (jz < FOREST_Z_MIN || jz > FOREST_Z_MAX) continue
      if (inForestExclusion(jx, jz)) continue
      candidates.push({ x: jx, z: jz })
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const modules = []
  for (let i = 0; i < Math.min(FLOCK_MODULE_COUNT, candidates.length); i++) {
    let y = FLOCK_Y_BIAS_CENTER
    for (let t = 0; t < 20; t++) {
      const u1 = Math.max(1e-10, rng())
      const u2 = rng()
      const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      y = FLOCK_Y_BIAS_CENTER + g * FLOCK_Y_SIGMA
      if (y >= FLOCK_Y_MIN && y <= FLOCK_Y_MAX) break
    }
    y = Math.max(FLOCK_Y_MIN, Math.min(FLOCK_Y_MAX, y))
    modules.push({ x: candidates[i].x, y, z: candidates[i].z })
  }

  return modules
}

function generateLEDs(modules) {
  const rng = makeRng(FLOCK_RNG_SEED + 1)
  const positions = []
  const unitIndices = []
  const unitCenters = []

  for (let m = 0; m < modules.length; m++) {
    const mod = modules[m]
    unitCenters.push([mod.x, mod.y, mod.z])

    for (let l = 0; l < CEILING_LEDS_PER_MODULE; l++) {
      const r = Math.sqrt(rng()) * CEILING_MODULE_RADIUS
      const theta = rng() * Math.PI * 2
      const phi = Math.acos(2 * rng() - 1)
      positions.push(
        mod.x + r * Math.sin(phi) * Math.cos(theta),
        mod.y + r * Math.cos(phi),
        mod.z + r * Math.sin(phi) * Math.sin(theta),
      )
      unitIndices.push(m)
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

export function buildFlock() {
  if (_cache) return _cache
  const modules = generateModules()
  const leds = generateLEDs(modules)
  _cache = { modules, leds }
  return _cache
}
