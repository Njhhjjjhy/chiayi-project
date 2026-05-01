import { ROOM, HW, HD, INSET, WAINSCOT_H } from '../../geometry/dimensions.js'

// Seeded Park-Miller RNG — deterministic replacement for Math.random() so
// firefly variant initialisation is pure-render-safe (React 19 strict mode).
export function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Bridson's Poisson-disk sampling in a 2D rectangle. Produces blue-noise
// distributed points with a minimum inter-point distance `minDist`. Uniform,
// no visible structure — key property for making the LED layout not read
// as a grid.
function poissonDisk(rand, width, height, minDist, targetCount) {
  const K = 30
  const cellSize = minDist / Math.SQRT2
  const gridW = Math.ceil(width / cellSize)
  const gridH = Math.ceil(height / cellSize)
  const grid = new Int32Array(gridW * gridH).fill(-1)
  const points = []
  const active = []

  const x0 = rand() * width
  const y0 = rand() * height
  points.push([x0, y0])
  active.push(0)
  grid[Math.floor(y0 / cellSize) * gridW + Math.floor(x0 / cellSize)] = 0

  while (active.length > 0 && points.length < targetCount) {
    const ai = Math.floor(rand() * active.length)
    const p = points[active[ai]]
    let placed = false

    for (let attempt = 0; attempt < K; attempt++) {
      const a = rand() * Math.PI * 2
      const r = minDist * (1 + rand())
      const cx = p[0] + Math.cos(a) * r
      const cy = p[1] + Math.sin(a) * r

      if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue

      const gx = Math.floor(cx / cellSize)
      const gy = Math.floor(cy / cellSize)
      const minD2 = minDist * minDist
      let tooClose = false

      for (let dy = -2; dy <= 2 && !tooClose; dy++) {
        for (let dx = -2; dx <= 2 && !tooClose; dx++) {
          const nx = gx + dx
          const ny = gy + dy
          if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) continue
          const pi = grid[ny * gridW + nx]
          if (pi < 0) continue
          const np = points[pi]
          const ddx = np[0] - cx
          const ddy = np[1] - cy
          if (ddx * ddx + ddy * ddy < minD2) tooClose = true
        }
      }

      if (!tooClose) {
        points.push([cx, cy])
        active.push(points.length - 1)
        grid[gy * gridW + gx] = points.length - 1
        placed = true
        break
      }
    }

    if (!placed) {
      active[ai] = active[active.length - 1]
      active.pop()
    }
  }

  return points
}

// --- Proposals review page: total LED count override ---
// When set via setFireflyCountOverride(total), distributeUnits scales
// leds-per-unit uniformly across all three surfaces so the total count
// matches approximately. Null for all other callers (e.g. the /3d
// page) — their behaviour is unchanged. The proposals page clears the
// override on unmount.
let _totalCountOverride = null

export function setFireflyCountOverride(total) {
  _totalCountOverride = total
}

// Distribute LEDs across one flat surface using global Poisson-disk
// sampling, then assign each LED to its nearest unit for hardware-control
// purposes. The unit grid still exists conceptually (hardware reality: one
// IR detector per 1.2×1.2 m unit, 18 LEDs wired to that unit) but the LED
// placement no longer reveals unit boundaries visually.
//
// toWorld(u, v) maps 2D surface coords (origin at surface centre, u and v
// in [−size/2, +size/2]) to a world-space [x, y, z].
function distributeSurface({
  nU, nV, unitSize, ledsPerUnit,
  toWorld, surfaceIndex,
  unitIdStart, rand,
  positions, unitIndices, surfaceIndices, unitCenters,
}) {
  // Build the unit-centre list first so the nearest-unit lookup works.
  for (let r = 0; r < nV; r++) {
    for (let c = 0; c < nU; c++) {
      const u = (c + 0.5) * unitSize - (nU * unitSize) / 2
      const v = (r + 0.5) * unitSize - (nV * unitSize) / 2
      unitCenters.push(toWorld(u, v))
    }
  }

  const bboxU = nU * unitSize
  const bboxV = nV * unitSize
  const target = nU * nV * ledsPerUnit
  // Minimum inter-LED distance tuned to produce ~target points. Derived
  // from Poisson-disk density (≈ 0.7 × √(area/N)).
  const minDist = 0.7 * Math.sqrt((bboxU * bboxV) / target)
  const pts = poissonDisk(rand, bboxU, bboxV, minDist, target)

  for (const [pu, pv] of pts) {
    const col = Math.min(nU - 1, Math.max(0, Math.floor(pu / unitSize)))
    const row = Math.min(nV - 1, Math.max(0, Math.floor(pv / unitSize)))
    const uIdx = unitIdStart + row * nU + col

    const uCentred = pu - bboxU / 2
    const vCentred = pv - bboxV / 2
    const [x, y, z] = toWorld(uCentred, vCentred)
    positions.push(x, y, z)
    unitIndices.push(uIdx)
    surfaceIndices.push(surfaceIndex)
  }
}

// Firefly LEDs spec:
//   - 60 × 60 cm squares on ceiling + 2 side walls (entrance + window)
//   - One unit = 2×2 squares = 1.2 × 1.2 m with one IR detector + 18 LEDs
//   - LEDs scattered globally per surface with Poisson-disk sampling so
//     the physical layout looks natural, not grid-like. Each LED is still
//     mapped to its containing unit for hardware control.
//
// Returns { positions, unitIndices, surfaceIndices, unitCenters, count, unitCount }
// - positions: Float32Array of xyz flat triples
// - unitIndices: Uint16Array, unit each LED belongs to
// - surfaceIndices: Uint8Array, 0=ceiling 1=entrance 2=window
// - unitCenters: plain array of [x, y, z] per unit
export function distributeUnits({ unitSize = 1.2, ledsPerUnit = 18, seed = 77 } = {}) {
  const ROOM_W = ROOM.W, ROOM_D = ROOM.D, ROOM_H = ROOM.H

  const rand = makeRng(seed)

  // Per-surface unit counts. Pre-computed so the proposals-page total-
  // count override can scale leds-per-unit before sampling.
  const cNu = Math.floor(ROOM_W / unitSize)
  const cNv = Math.floor(ROOM_D / unitSize)
  const eNu = Math.floor(ROOM_D / unitSize)
  const eWallH = ROOM_H - WAINSCOT_H.entrance
  const eNv = Math.floor(eWallH / unitSize)
  const wNu = Math.floor(ROOM_D / unitSize)
  const wWallH = ROOM_H - WAINSCOT_H.window
  const wNv = Math.floor(wWallH / unitSize)

  const totalUnits = cNu * cNv + eNu * eNv + wNu * wNv

  // Proposals-only total-count override, if any. Keeps each surface's
  // relative density by scaling leds-per-unit uniformly.
  const effectiveLedsPerUnit =
    _totalCountOverride !== null && totalUnits > 0
      ? Math.max(1, Math.round(_totalCountOverride / totalUnits))
      : ledsPerUnit

  const positions = []
  const unitIndices = []
  const surfaceIndices = []
  const unitCenters = []

  // CEILING — y = ROOM.H − INSET. u along X, v along Z.
  const cY = ROOM_H - INSET
  distributeSurface({
    nU: cNu, nV: cNv, unitSize, ledsPerUnit: effectiveLedsPerUnit,
    toWorld: (u, v) => [u, cY, v],
    surfaceIndex: 0,
    unitIdStart: 0, rand,
    positions, unitIndices, surfaceIndices, unitCenters,
  })

  // ENTRANCE WALL — x = −HW + INSET, full height (no wainscot).
  // u along Z, v along Y (vertical).
  const eX = -HW + INSET
  const eYCentre = WAINSCOT_H.entrance + (eNv * unitSize) / 2
  const entranceUnitStart = unitCenters.length
  distributeSurface({
    nU: eNu, nV: eNv, unitSize, ledsPerUnit: effectiveLedsPerUnit,
    toWorld: (u, v) => [eX, eYCentre + v, u],
    surfaceIndex: 1,
    unitIdStart: entranceUnitStart, rand,
    positions, unitIndices, surfaceIndices, unitCenters,
  })

  // WINDOW WALL — x = +HW − INSET, above short wainscot.
  const wX = HW - INSET
  const wYCentre = WAINSCOT_H.window + (wNv * unitSize) / 2
  const windowUnitStart = unitCenters.length
  distributeSurface({
    nU: wNu, nV: wNv, unitSize, ledsPerUnit: effectiveLedsPerUnit,
    toWorld: (u, v) => [wX, wYCentre + v, u],
    surfaceIndex: 2,
    unitIdStart: windowUnitStart, rand,
    positions, unitIndices, surfaceIndices, unitCenters,
  })

  return {
    positions: new Float32Array(positions),
    unitIndices: new Uint16Array(unitIndices),
    surfaceIndices: new Uint8Array(surfaceIndices),
    unitCenters,
    count: positions.length / 3,
    unitCount: unitCenters.length,
  }
}
