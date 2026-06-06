import {
  ROOM, WALL_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z, COLUMN_X,
  LOOFAH_WALL_Z_START, LOOFAH_WALL_Z_END,
  CEILING_LEDS_PER_MODULE,
  CEILING_FORM_MAX_EDGE_X,
  FLOCK_RNG_SEED,
  FLOCK_STRING_MODULES, FLOCK_FIELD_MODULES,
  FLOCK_STRING_LENGTH_MIN, FLOCK_STRING_LENGTH_MAX,
  FLOCK_STRING_WALL_OFFSET, FLOCK_STRING_LED_JITTER,
  FLOCK_FIELD_Y_MIN, FLOCK_FIELD_Y_MAX, FLOCK_FIELD_SPREAD,
  FLOCK_SILHOUETTE_COUNT,
  FLOCK_SILHOUETTE_DIAMETER_MIN, FLOCK_SILHOUETTE_DIAMETER_MAX,
  FLOCK_SILHOUETTE_Y, FLOCK_SILHOUETTE_MIN_GAP,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'
import { inForestExclusion } from './forestExclusion.js'

// Flock placement (concept image 13). Three populations:
//
//   strings      vertical strings of green points draping the forest's
//                boundary walls like rain — one module per string,
//                16 LEDs spaced down its drop. The front-wall runs
//                skip the loofah wall span (the warm glowing wall owns
//                that stretch).
//   field        green points scattered in a thin band just under the
//                working ceiling — the glowing field the silhouettes
//                float against.
//   silhouettes  large dark discs hung below the field band so they
//                read as dark holes against the glow. No LEDs.
//
// LED invariant: FLOCK_STRING_MODULES + FLOCK_FIELD_MODULES = 110
// modules × 16 = 1,760 LEDs exactly.

const FOREST_X_MIN = ENTRY_GAP_WIDTH + CABINET_T               // 2.0
const FOREST_X_MAX = ROOM.W - WALL_T                           // 8.71
const FOREST_Z_MIN = CABINET_T                                 // 0.5
const FOREST_Z_MAX = PATHWAY_PARTITION_Z - CABINET_T           // 6.78

// Wall runs the strings mount along (forest-side faces). `fixed` is
// the wall-axis coordinate including the stand-off; `from`/`to` span
// the run along the wall.
function makeStringRuns() {
  const margin = 0.05
  return [
    // front-wall, either side of the loofah wall span
    {
      axis: 'z', fixed: FOREST_X_MAX - FLOCK_STRING_WALL_OFFSET,
      from: FOREST_Z_MIN + margin, to: LOOFAH_WALL_Z_START - margin,
    },
    {
      axis: 'z', fixed: FOREST_X_MAX - FLOCK_STRING_WALL_OFFSET,
      from: LOOFAH_WALL_Z_END + margin, to: FOREST_Z_MAX - margin,
    },
    // entrance-wall-partition forest face (stop short of the column)
    {
      axis: 'x', fixed: FOREST_Z_MIN + FLOCK_STRING_WALL_OFFSET,
      from: FOREST_X_MIN + margin, to: COLUMN_X - 0.25,
    },
    // pathway-partition-vertical forest face
    {
      axis: 'z', fixed: FOREST_X_MIN + FLOCK_STRING_WALL_OFFSET,
      from: FOREST_Z_MIN + margin, to: FOREST_Z_MAX - margin,
    },
    // pathway-partition-horizontal forest face
    {
      axis: 'x', fixed: FOREST_Z_MAX - FLOCK_STRING_WALL_OFFSET,
      from: FOREST_X_MIN + margin, to: COLUMN_X - margin,
    },
  ]
}

// Split FLOCK_STRING_MODULES across the runs proportionally to run
// length (largest remainder) so the drape density reads even all the
// way around.
function distributeStrings(runs) {
  const lengths = runs.map((r) => r.to - r.from)
  const total = lengths.reduce((s, l) => s + l, 0)
  const raw = lengths.map((l) => (l / total) * FLOCK_STRING_MODULES)
  const counts = raw.map((r) => Math.floor(r))
  let assigned = counts.reduce((s, c) => s + c, 0)
  const byRemainder = raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem)
  let k = 0
  while (assigned < FLOCK_STRING_MODULES) {
    counts[byRemainder[k % byRemainder.length].i]++
    assigned++
    k++
  }
  return counts
}

function generateStrings(rng) {
  const runs = makeStringRuns()
  const counts = distributeStrings(runs)
  const strings = []

  for (let r = 0; r < runs.length; r++) {
    const run = runs[r]
    const n = counts[r]
    for (let i = 0; i < n; i++) {
      const along = run.from + ((i + 0.5) / n) * (run.to - run.from) +
        (rng() - 0.5) * 0.08
      const length = FLOCK_STRING_LENGTH_MIN +
        rng() * (FLOCK_STRING_LENGTH_MAX - FLOCK_STRING_LENGTH_MIN)
      const x = run.axis === 'z' ? run.fixed : along
      const z = run.axis === 'z' ? along : run.fixed
      strings.push({ x, z, length })
    }
  }
  return strings
}

function generateFieldModules(rng) {
  const modules = []
  const maxAttempts = FLOCK_FIELD_MODULES * 200
  const minGap = 0.4
  let attempts = 0
  while (modules.length < FLOCK_FIELD_MODULES && attempts < maxAttempts) {
    attempts++
    const x = FOREST_X_MIN + 0.3 + rng() * (CEILING_FORM_MAX_EDGE_X - FOREST_X_MIN - 0.6)
    const z = FOREST_Z_MIN + 0.3 + rng() * (FOREST_Z_MAX - FOREST_Z_MIN - 0.6)
    if (inForestExclusion(x, z)) continue
    let tooClose = false
    for (const m of modules) {
      const dx = m.x - x
      const dz = m.z - z
      if (dx * dx + dz * dz < minGap * minGap) { tooClose = true; break }
    }
    if (tooClose) continue
    modules.push({ x, z })
  }
  // Density fallback: drop the gap rather than the module count — the
  // 1,760 invariant always wins.
  while (modules.length < FLOCK_FIELD_MODULES) {
    modules.push({
      x: FOREST_X_MIN + 0.3 + rng() * (CEILING_FORM_MAX_EDGE_X - FOREST_X_MIN - 0.6),
      z: FOREST_Z_MIN + 0.3 + rng() * (FOREST_Z_MAX - FOREST_Z_MIN - 0.6),
    })
  }
  return modules
}

function generateSilhouettes(rng) {
  const silhouettes = []
  const maxAttempts = FLOCK_SILHOUETTE_COUNT * 300
  let attempts = 0
  while (silhouettes.length < FLOCK_SILHOUETTE_COUNT && attempts < maxAttempts) {
    attempts++
    const diameter = FLOCK_SILHOUETTE_DIAMETER_MIN +
      rng() * (FLOCK_SILHOUETTE_DIAMETER_MAX - FLOCK_SILHOUETTE_DIAMETER_MIN)
    const half = diameter / 2
    const x = FOREST_X_MIN + half + rng() * (CEILING_FORM_MAX_EDGE_X - FOREST_X_MIN - diameter)
    const z = FOREST_Z_MIN + half + rng() * (FOREST_Z_MAX - FOREST_Z_MIN - diameter)
    let tooClose = false
    for (const s of silhouettes) {
      const dx = s.x - x
      const dz = s.z - z
      const minDist = half + s.diameter / 2 + FLOCK_SILHOUETTE_MIN_GAP
      if (dx * dx + dz * dz < minDist * minDist) { tooClose = true; break }
    }
    if (tooClose) continue
    silhouettes.push({ x, z, y: FLOCK_SILHOUETTE_Y, diameter })
  }
  return silhouettes
}

function generateLEDs(strings, fieldModules, rng) {
  const positions = []
  const unitIndices = []
  const unitCenters = []
  let moduleIdx = 0

  // Wall strings — 16 LEDs spaced evenly down each drop, with small
  // jitter along and off the string so the rain reads organic.
  for (const s of strings) {
    unitCenters.push([s.x, ROOM.H - s.length / 2, s.z])
    for (let i = 0; i < CEILING_LEDS_PER_MODULE; i++) {
      const t = (i + 0.5) / CEILING_LEDS_PER_MODULE
      positions.push(
        s.x + (rng() - 0.5) * 2 * FLOCK_STRING_LED_JITTER,
        ROOM.H - t * s.length + (rng() - 0.5) * 2 * FLOCK_STRING_LED_JITTER,
        s.z + (rng() - 0.5) * 2 * FLOCK_STRING_LED_JITTER,
      )
      unitIndices.push(moduleIdx)
    }
    moduleIdx++
  }

  // Ceiling field — each module a loose cluster in the thin band under
  // the working ceiling.
  for (const m of fieldModules) {
    const cy = (FLOCK_FIELD_Y_MIN + FLOCK_FIELD_Y_MAX) / 2
    unitCenters.push([m.x, cy, m.z])
    for (let i = 0; i < CEILING_LEDS_PER_MODULE; i++) {
      const r = Math.sqrt(rng()) * FLOCK_FIELD_SPREAD
      const a = rng() * Math.PI * 2
      positions.push(
        m.x + Math.cos(a) * r,
        FLOCK_FIELD_Y_MIN + rng() * (FLOCK_FIELD_Y_MAX - FLOCK_FIELD_Y_MIN),
        m.z + Math.sin(a) * r,
      )
      unitIndices.push(moduleIdx)
    }
    moduleIdx++
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
  const rng = makeRng(FLOCK_RNG_SEED)
  const strings = generateStrings(rng)
  const fieldModules = generateFieldModules(rng)
  const silhouettes = generateSilhouettes(rng)
  const leds = generateLEDs(strings, fieldModules, makeRng(FLOCK_RNG_SEED + 1))
  _cache = { strings, fieldModules, silhouettes, leds }
  return _cache
}
