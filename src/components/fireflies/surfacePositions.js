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

// Jittered sub-grid distribution for LEDs inside a single unit footprint.
// Splits the unit into cols*rows cells (cells ≥ n), picks n cells at
// random, places one LED near the centre of each picked cell with a small
// jitter. Prevents the visual bunching that pure random scatter produces.
// Returns array of [dx, dz] offsets from unit centre in the range ±unit/2.
function jitteredOffsets(rand, n, unitSize) {
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  const cellW = unitSize / cols
  const cellH = unitSize / rows
  const jitter = 0.4 // ±40% of cell size, leaves a gap between neighbours

  const indices = []
  for (let i = 0; i < cols * rows; i++) indices.push(i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const out = []
  for (let k = 0; k < n; k++) {
    const idx = indices[k]
    const cx = idx % cols
    const cy = Math.floor(idx / cols)
    const centreU = (cx + 0.5) * cellW - unitSize / 2
    const centreV = (cy + 0.5) * cellH - unitSize / 2
    out.push([
      centreU + (rand() - 0.5) * cellW * jitter,
      centreV + (rand() - 0.5) * cellH * jitter,
    ])
  }
  return out
}

// Unit grid per installation spec:
//   - 60 × 60 cm squares on ceiling + 2 side walls (entrance + window)
//     — front wall is the feature wall, back wall has doors + infrastructure
//   - One unit = 2×2 squares = 1.2 × 1.2 m
//   - 18 LEDs per unit, jittered within the unit footprint
//   - One (virtual) IR detector per unit — unitIndex tags each LED so that
//     state #2 (motion) and state #3 (interaction) can light whole units at
//     once based on detector triggers.
//
// Returns { positions, unitIndices, surfaceIndices, unitCenters, count, unitCount }
// - positions: Float32Array of xyz flat triples
// - unitIndices: Uint16Array, unit each LED belongs to
// - surfaceIndices: Uint8Array, 0=ceiling 1=entrance 2=window
// - unitCenters: plain array of [x, y, z] per unit
export function distributeUnits({ unitSize = 1.2, ledsPerUnit = 18, seed = 77 } = {}) {
  const ROOM_W = ROOM.W, ROOM_D = ROOM.D, ROOM_H = ROOM.H
  const WAINSCOT = {
    back: WAINSCOT_H.back,
    window: WAINSCOT_H.window,
    entrance: WAINSCOT_H.entrance,
  }

  let s = seed
  function rand() {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }

  const positions = []
  const unitIndices = []
  const surfaceIndices = []
  const unitCenters = []
  let unitId = 0

  // CEILING — XZ plane at y = ROOM_H - INSET
  {
    const nx = Math.floor(ROOM_W / unitSize)    // 7
    const nz = Math.floor(ROOM_D / unitSize)    // 8
    const startX = -(nx * unitSize) / 2
    const startZ = -(nz * unitSize) / 2
    const y = ROOM_H - INSET
    for (let r = 0; r < nz; r++) {
      for (let c = 0; c < nx; c++) {
        const ucx = startX + (c + 0.5) * unitSize
        const ucz = startZ + (r + 0.5) * unitSize
        unitCenters.push([ucx, y, ucz])
        for (const [dx, dz] of jitteredOffsets(rand, ledsPerUnit, unitSize)) {
          positions.push(ucx + dx, y, ucz + dz)
          unitIndices.push(unitId)
          surfaceIndices.push(0)
        }
        unitId++
      }
    }
  }

  // ENTRANCE WALL — YZ plane at x = -HW + INSET, full height (no wainscot)
  {
    const nz = Math.floor(ROOM_D / unitSize)
    const wallH = ROOM_H - WAINSCOT.entrance
    const ny = Math.floor(wallH / unitSize)
    const startZ = -(nz * unitSize) / 2
    const startY = WAINSCOT.entrance
    const x = -HW + INSET
    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nz; c++) {
        const ucz = startZ + (c + 0.5) * unitSize
        const ucy = startY + (r + 0.5) * unitSize
        unitCenters.push([x, ucy, ucz])
        for (const [dz, dy] of jitteredOffsets(rand, ledsPerUnit, unitSize)) {
          positions.push(x, ucy + dy, ucz + dz)
          unitIndices.push(unitId)
          surfaceIndices.push(1)
        }
        unitId++
      }
    }
  }

  // WINDOW WALL — YZ plane at x = +HW - INSET, above short wainscot
  {
    const nz = Math.floor(ROOM_D / unitSize)
    const wallH = ROOM_H - WAINSCOT.window
    const ny = Math.floor(wallH / unitSize)
    const startZ = -(nz * unitSize) / 2
    const startY = WAINSCOT.window
    const x = HW - INSET
    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nz; c++) {
        const ucz = startZ + (c + 0.5) * unitSize
        const ucy = startY + (r + 0.5) * unitSize
        unitCenters.push([x, ucy, ucz])
        for (const [dz, dy] of jitteredOffsets(rand, ledsPerUnit, unitSize)) {
          positions.push(x, ucy + dy, ucz + dz)
          unitIndices.push(unitId)
          surfaceIndices.push(2)
        }
        unitId++
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    unitIndices: new Uint16Array(unitIndices),
    surfaceIndices: new Uint8Array(surfaceIndices),
    unitCenters,
    count: positions.length / 3,
    unitCount: unitId,
  }
}
