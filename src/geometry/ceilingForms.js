import {
  ROOM, WALL_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  CEILING_FORM_COUNT,
  CEILING_FORM_Y_MIN, CEILING_FORM_Y_MAX,
  CEILING_FORM_TILT_MAX,
  CEILING_RNG_SEED,
  CEILING_CLUSTER_CENTRES, CEILING_CLUSTER_BIAS, CEILING_CLUSTER_RADIUS,
  CEILING_CLUSTER_OFFSET, CEILING_CLUSTER_MIN_DIST_FROM_LOOFAH,
  CEILING_FORM_MIN_GAP,
  CEILING_SEATING_FORM_SKIP_RADIUS,
  CEILING_EXTENDS_OVER_PATHWAY,
  CEILING_MODULES_TOTAL, CEILING_LEDS_PER_MODULE,
  CEILING_VARIANT_DEFAULT,
  CEILING_FORM_MAX_EDGE_X,
  SEATING_ZONES,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'
import {
  makePrimitivePicker,
  sampleSize,
  sampleLowerSurfacePoint,
  anchorsTooClose,
  getPrimitiveHalfExtents,
} from './ceilingPrimitives.js'
import { inForestExclusion } from './forestExclusion.js'

// Sculptural ceiling — procedural pipeline.
//
// Variants (slice 9):
//   'oblong'  5 ellipsoid primitives (slice 7 spec).
//   'flat'    5 box primitives (squares + rectangles).
//   'mixed'   50/50 split via shuffled exact-count queue.
//
// Pipeline stages (variant-independent):
//   1. Place CEILING_FORM_COUNT forms via cluster-and-clearing Poisson-
//      disc rejection sampling in the forest footprint, biased toward
//      seating-zone-anchored cluster centres.
//   2. Distribute CEILING_MODULES_TOTAL modules across the forms with
//      power-law skew (~12.5% dark, ~50% one, ~25% two, ~10% three,
//      ~2.5% four). Top-up loop balances to exactly 110.
//   3. For each module, pick a lower-surface anchor and sample 16 LEDs
//      around it via the primitive's kind-specific sampler.
//
// Per-variant pipeline output is cached in `_cacheByVariant` so the
// renderer (SculpturalCeiling.jsx) and the static LED renderer
// (CeilingLEDs.jsx) share one instance per variant for the page
// lifetime.

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

const LOOFAH_WALL_PLANE_X = 8.5

const CLUSTER_OFFSET_DIRS = [
  { dx: +1, dz:  0 },
  { dx: -1, dz:  0 },
  { dx:  0, dz: +1 },
  { dx:  0, dz: -1 },
]

function generateClusterCentres(rng) {
  const xMin = CEILING_EXTENDS_OVER_PATHWAY ? 0 : FOREST_X_MIN
  const xMax = Math.min(FOREST_X_MAX, LOOFAH_WALL_PLANE_X - CEILING_CLUSTER_MIN_DIST_FROM_LOOFAH)
  const zMin = CEILING_EXTENDS_OVER_PATHWAY ? 0 : FOREST_Z_MIN
  const zMax = FOREST_Z_MAX

  const anchors = [SEATING_ZONES[0], SEATING_ZONES[1], SEATING_ZONES[2]]
  const centres = []

  for (let i = 0; i < CEILING_CLUSTER_CENTRES; i++) {
    const anchor = anchors[i % anchors.length]

    const startIdx = Math.floor(rng() * CLUSTER_OFFSET_DIRS.length)
    let cx = null, cz = null
    for (let k = 0; k < CLUSTER_OFFSET_DIRS.length; k++) {
      const d = CLUSTER_OFFSET_DIRS[(startIdx + k) % CLUSTER_OFFSET_DIRS.length]
      const tx = anchor.x + d.dx * CEILING_CLUSTER_OFFSET
      const tz = anchor.z + d.dz * CEILING_CLUSTER_OFFSET
      if (tx < xMin + 0.5 || tx > xMax - 0.5) continue
      if (tz < zMin + 0.5 || tz > zMax - 0.5) continue
      cx = tx
      cz = tz
      break
    }
    if (cx === null) {
      cx = Math.min(Math.max(anchor.x, xMin + 0.5), xMax - 0.5)
      cz = Math.min(Math.max(anchor.z, zMin + 0.5), zMax - 0.5)
    }

    cx += (rng() - 0.5) * 0.6
    cz += (rng() - 0.5) * 0.6
    cx = Math.min(Math.max(cx, xMin + 0.5), xMax - 0.5)
    cz = Math.min(Math.max(cz, zMin + 0.5), zMax - 0.5)
    centres.push({ x: cx, z: cz })
  }
  return centres
}

function generateForms(variant) {
  const rng = makeRng(CEILING_RNG_SEED)
  const pickPrimitive = makePrimitivePicker(variant, rng)
  const centres = generateClusterCentres(rng)
  const forms = []
  const maxAttempts = CEILING_FORM_COUNT * 100

  let attempts = 0
  while (forms.length < CEILING_FORM_COUNT && attempts < maxAttempts) {
    attempts++

    let x, z
    if (rng() < CEILING_CLUSTER_BIAS) {
      const c = centres[Math.floor(rng() * centres.length)]
      const r = Math.sqrt(rng()) * CEILING_CLUSTER_RADIUS
      const a = rng() * Math.PI * 2
      x = c.x + Math.cos(a) * r
      z = c.z + Math.sin(a) * r
    } else {
      const xMin = CEILING_EXTENDS_OVER_PATHWAY ? 0 : FOREST_X_MIN
      const zMin = CEILING_EXTENDS_OVER_PATHWAY ? 0 : FOREST_Z_MIN
      x = xMin + rng() * (FOREST_X_MAX - xMin)
      z = zMin + rng() * (FOREST_Z_MAX - zMin)
    }

    if (x < FOREST_X_MIN || x > FOREST_X_MAX) continue
    if (z < FOREST_Z_MIN || z > FOREST_Z_MAX) continue

    if (inForestExclusion(x, z)) continue
    if (nearSeatingZone(x, z)) continue

    let tooClose = false
    for (const f of forms) {
      const dx = f.x - x
      const dz = f.z - z
      if (dx * dx + dz * dz < CEILING_FORM_MIN_GAP * CEILING_FORM_MIN_GAP) {
        tooClose = true
        break
      }
    }
    if (tooClose) continue

    // Peek at the next primitive without committing — mixed variant
    // uses a shuffled queue and we only want to advance it if this
    // candidate actually passes every rejection check.
    const pick = pickPrimitive()
    const { primitive, kind } = pick
    const size = sampleSize(rng, primitive)

    // Size-aware envelope check. Conservative bounding circle of radius
    // size/2; covers any Y-rotation. Front-wall edge clamp uses
    // CEILING_FORM_MAX_EDGE_X so no form edge intrudes on the loofah-
    // wall / front-wall area.
    const half = size / 2
    if (x - half < FOREST_X_MIN || x + half > CEILING_FORM_MAX_EDGE_X) continue
    if (z - half < 0 || z + half > PATHWAY_PARTITION_Z) continue

    const y = CEILING_FORM_Y_MIN + rng() * (CEILING_FORM_Y_MAX - CEILING_FORM_Y_MIN)
    const tiltX = (rng() - 0.5) * 2 * CEILING_FORM_TILT_MAX
    const tiltZ = (rng() - 0.5) * 2 * CEILING_FORM_TILT_MAX
    const rotY = rng() * Math.PI * 2

    const halfExtents = getPrimitiveHalfExtents(primitive, size)
    forms.push({ x, y, z, primitive, kind, size, halfExtents, tiltX, tiltZ, rotY })
    pick.commit()
  }

  return forms
}

function assignModuleCounts(forms, rng) {
  const n = forms.length
  const initial = [
    { mods: 0, count: Math.round(n * 0.125) },
    { mods: 1, count: Math.round(n * 0.50) },
    { mods: 2, count: Math.round(n * 0.25) },
    { mods: 3, count: Math.round(n * 0.10) },
    { mods: 4, count: Math.round(n * 0.025) },
  ]
  let sumForms = initial.reduce((s, b) => s + b.count, 0)
  while (sumForms < n) { initial[1].count++; sumForms++ }
  while (sumForms > n) { initial[1].count--; sumForms-- }

  const counts = []
  for (const bucket of initial) {
    for (let i = 0; i < bucket.count; i++) counts.push(bucket.mods)
  }
  for (let i = counts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[counts[i], counts[j]] = [counts[j], counts[i]]
  }

  let total = counts.reduce((s, v) => s + v, 0)
  let guard = 0
  while (total < CEILING_MODULES_TOTAL && guard < 10000) {
    guard++
    const idx = Math.floor(rng() * counts.length)
    if (counts[idx] === 0) continue
    if (counts[idx] >= 6) continue
    counts[idx]++
    total++
  }
  while (total > CEILING_MODULES_TOTAL) {
    let maxIdx = 0
    for (let i = 1; i < counts.length; i++) if (counts[i] > counts[maxIdx]) maxIdx = i
    counts[maxIdx]--
    total--
  }
  return counts
}

// Transform a form-local point by the form's tilt + Y rotation and add
// the form's world position. Tilt order matches Euler XYZ.
function formLocalToWorld(form, lx, ly, lz) {
  const sX = Math.sin(form.tiltX), cX = Math.cos(form.tiltX)
  const sZ = Math.sin(form.tiltZ), cZ = Math.cos(form.tiltZ)
  const sY = Math.sin(form.rotY),  cY = Math.cos(form.rotY)

  const x1 = lx * cY + lz * sY
  const z1 = -lx * sY + lz * cY
  const y1 = ly

  const y2 = y1 * cX - z1 * sX
  const z2 = y1 * sX + z1 * cX
  const x2 = x1

  const x3 = x2 * cZ - y2 * sZ
  const y3 = x2 * sZ + y2 * cZ
  const z3 = z2

  return [form.x + x3, form.y + y3, form.z + z3]
}

function generateLEDs(forms, moduleCounts) {
  const rng = makeRng(CEILING_RNG_SEED + 1)
  const positions = []
  const unitIndices = []
  const unitCenters = []
  let moduleIdx = 0

  for (let f = 0; f < forms.length; f++) {
    const form = forms[f]
    const numModules = moduleCounts[f]
    if (numModules === 0) continue

    for (let m = 0; m < numModules; m++) {
      // Anchor for this module — free sample on form's lower surface.
      const anchorSample = sampleLowerSurfacePoint(rng, form.primitive, form.size, null)
      const [, , , ] = anchorSample.local
      const [acx, acy, acz] = formLocalToWorld(
        form,
        anchorSample.local[0],
        anchorSample.local[1],
        anchorSample.local[2],
      )
      unitCenters.push([acx, acy, acz])

      const ledAnchors = []
      let attempts = 0
      while (ledAnchors.length < CEILING_LEDS_PER_MODULE && attempts < CEILING_LEDS_PER_MODULE * 30) {
        attempts++
        const cand = sampleLowerSurfacePoint(rng, form.primitive, form.size, anchorSample.anchor)
        let ok = true
        for (const prev of ledAnchors) {
          if (anchorsTooClose(form.primitive, cand.anchor, prev.anchor)) { ok = false; break }
        }
        if (!ok) continue
        ledAnchors.push(cand)
      }
      while (ledAnchors.length < CEILING_LEDS_PER_MODULE) {
        const cand = sampleLowerSurfacePoint(rng, form.primitive, form.size, anchorSample.anchor)
        ledAnchors.push(cand)
      }

      for (const led of ledAnchors) {
        const [wx, wy, wz] = formLocalToWorld(form, led.local[0], led.local[1], led.local[2])
        positions.push(wx, wy, wz)
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

// Per-variant cache. Each variant runs the pipeline once on first
// access and the result is reused for the page lifetime.
const _cacheByVariant = new Map()

export function buildCeiling(variant = CEILING_VARIANT_DEFAULT) {
  if (_cacheByVariant.has(variant)) return _cacheByVariant.get(variant)
  const forms = generateForms(variant)
  const rng = makeRng(CEILING_RNG_SEED + 2)
  const moduleCounts = assignModuleCounts(forms, rng)
  const leds = generateLEDs(forms, moduleCounts)
  const result = { forms, moduleCounts, leds }
  _cacheByVariant.set(variant, result)
  return result
}

// Re-exports — keep existing consumers working without an import shuffle.
export { getPrimitiveHalfExtents, getPrimitiveKind } from './ceilingPrimitives.js'
