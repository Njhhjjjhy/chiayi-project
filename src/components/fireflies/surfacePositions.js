// Utility to distribute firefly LEDs across ceiling + 2 side walls.
// All positions are ON the surface, not floating in air.
// LEDs glow through fabric panels — fixed positions, no drift.

const ROOM = { w: 8.83, h: 3.52, d: 10, droppedCeiling: 3.2, structuralCeiling: 3.5 }
const INSET = 0.05 // slight inset from wall so glow faces inward

// Surface types
export const SURFACE = {
  CEILING: 'ceiling',
  LEFT_WALL: 'leftWall',
  RIGHT_WALL: 'rightWall',
}

// Distribute count LEDs across ceiling and two side walls.
// ratio: { ceiling, leftWall, rightWall } — proportions (should sum to 1)
export function distributeSurface(count, ratio = { ceiling: 0.5, leftWall: 0.25, rightWall: 0.25 }, seed = 42) {
  const positions = new Float32Array(count * 3)
  const surfaces = new Uint8Array(count) // which surface each LED is on
  let s = seed

  function rand() {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }

  const ceilingCount = Math.floor(count * ratio.ceiling)
  const leftCount = Math.floor(count * ratio.leftWall)
  // rightCount gets the remainder
  const rightCount = count - ceilingCount - leftCount

  let idx = 0

  // Ceiling: y = roomHeight, x/z spread across ceiling
  for (let i = 0; i < ceilingCount; i++) {
    positions[idx * 3] = (rand() - 0.5) * ROOM.w * 0.9
    positions[idx * 3 + 1] = ROOM.h - INSET
    positions[idx * 3 + 2] = (rand() - 0.5) * ROOM.d * 0.9
    surfaces[idx] = 0 // ceiling
    idx++
  }

  // Left wall: x = -roomWidth/2, y/z spread
  for (let i = 0; i < leftCount; i++) {
    positions[idx * 3] = -ROOM.w / 2 + INSET
    positions[idx * 3 + 1] = 0.3 + rand() * (ROOM.h - 0.6)
    positions[idx * 3 + 2] = (rand() - 0.5) * ROOM.d * 0.85
    surfaces[idx] = 1 // left wall
    idx++
  }

  // Right wall: x = +roomWidth/2, y/z spread
  for (let i = 0; i < rightCount; i++) {
    positions[idx * 3] = ROOM.w / 2 - INSET
    positions[idx * 3 + 1] = 0.3 + rand() * (ROOM.h - 0.6)
    positions[idx * 3 + 2] = (rand() - 0.5) * ROOM.d * 0.85
    surfaces[idx] = 2 // right wall
    idx++
  }

  return { positions, surfaces }
}

// Place LEDs in a grid pattern on surfaces (for structured variants)
export function distributeSurfaceGrid(cols, rows, surfaces = ['ceiling', 'leftWall', 'rightWall']) {
  const positions = []

  for (const surface of surfaces) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = (c + 0.5) / cols // 0-1 normalized
        const v = (r + 0.5) / rows

        if (surface === 'ceiling') {
          positions.push(
            (u - 0.5) * ROOM.w * 0.9,
            ROOM.h - INSET,
            (v - 0.5) * ROOM.d * 0.9
          )
        } else if (surface === 'leftWall') {
          positions.push(
            -ROOM.w / 2 + INSET,
            0.3 + v * (ROOM.h - 0.6),
            (u - 0.5) * ROOM.d * 0.85
          )
        } else if (surface === 'rightWall') {
          positions.push(
            ROOM.w / 2 - INSET,
            0.3 + v * (ROOM.h - 0.6),
            (u - 0.5) * ROOM.d * 0.85
          )
        }
      }
    }
  }

  return new Float32Array(positions)
}

// Unit grid per installation spec:
//   - 60 × 60 cm squares on ceiling + back wall + 2 side walls
//   - One unit = 2×2 squares = 1.2 × 1.2 m
//   - 18 LEDs per unit, jittered within the unit footprint
//   - One (virtual) IR detector per unit — unitIndex tags each LED so that
//     state #2 (motion) and state #3 (interaction) can light whole units at
//     once based on detector triggers.
//
// Returns { positions, unitIndices, surfaceIndices, unitCenters, count, unitCount }
// - positions: Float32Array of xyz flat triples
// - unitIndices: Uint16Array, unit each LED belongs to
// - surfaceIndices: Uint8Array, 0=ceiling 1=back 2=entrance 3=window
// - unitCenters: plain array of [x, y, z] per unit
export function distributeUnits({ unitSize = 1.2, ledsPerUnit = 18, seed = 77 } = {}) {
  const ROOM_W = 8.83, ROOM_D = 10, ROOM_H = 3.52
  const HW = ROOM_W / 2, HD = ROOM_D / 2
  const INSET = 0.05
  const WAINSCOT = { back: 0.90, window: 0.30, entrance: 0 }

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
        for (let i = 0; i < ledsPerUnit; i++) {
          const dx = (rand() - 0.5) * unitSize * 0.9
          const dz = (rand() - 0.5) * unitSize * 0.9
          positions.push(ucx + dx, y, ucz + dz)
          unitIndices.push(unitId)
          surfaceIndices.push(0)
        }
        unitId++
      }
    }
  }

  // BACK WALL — XY plane at z = +HD - INSET, y above wainscot
  {
    const nx = Math.floor(ROOM_W / unitSize)
    const wallH = ROOM_H - WAINSCOT.back
    const ny = Math.floor(wallH / unitSize)
    const startX = -(nx * unitSize) / 2
    const startY = WAINSCOT.back
    const z = HD - INSET
    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nx; c++) {
        const ucx = startX + (c + 0.5) * unitSize
        const ucy = startY + (r + 0.5) * unitSize
        unitCenters.push([ucx, ucy, z])
        for (let i = 0; i < ledsPerUnit; i++) {
          const dx = (rand() - 0.5) * unitSize * 0.9
          const dy = (rand() - 0.5) * unitSize * 0.9
          positions.push(ucx + dx, ucy + dy, z)
          unitIndices.push(unitId)
          surfaceIndices.push(1)
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
        for (let i = 0; i < ledsPerUnit; i++) {
          const dy = (rand() - 0.5) * unitSize * 0.9
          const dz = (rand() - 0.5) * unitSize * 0.9
          positions.push(x, ucy + dy, ucz + dz)
          unitIndices.push(unitId)
          surfaceIndices.push(2)
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
        for (let i = 0; i < ledsPerUnit; i++) {
          const dy = (rand() - 0.5) * unitSize * 0.9
          const dz = (rand() - 0.5) * unitSize * 0.9
          positions.push(x, ucy + dy, ucz + dz)
          unitIndices.push(unitId)
          surfaceIndices.push(3)
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

// 6 ceiling modules for the dropped panel grid system.
// Each module is a ~3m x 4.5m zone containing 16-18 fireflies.
// Fireflies positioned in the cavity between dropped ceiling (y=3.2) and structural ceiling (y=3.5).
export const CEILING_MODULES = [
  { center: [-2.5, -2.5], label: 'back-left' },
  { center: [0,    -2.5], label: 'back-center' },
  { center: [2.5,  -2.5], label: 'back-right' },
  { center: [-2.5,  1.0], label: 'front-left' },
  { center: [0,     1.0], label: 'front-center' },
  { center: [2.5,   1.0], label: 'front-right' },
]

// Distribute 100 fireflies across 6 ceiling modules.
// Returns { positions, moduleIndices, phases, speeds, baseIntensities }
export function distributeCeilingModules(totalCount = 100, seed = 77) {
  let s = seed
  function rand() {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }

  const perModule = Math.floor(totalCount / CEILING_MODULES.length)
  const remainder = totalCount - perModule * CEILING_MODULES.length

  const positions = new Float32Array(totalCount * 3)
  const moduleIndices = new Uint8Array(totalCount)
  const phases = new Float32Array(totalCount)
  const speeds = new Float32Array(totalCount)
  const baseIntensities = new Float32Array(totalCount)

  let idx = 0
  CEILING_MODULES.forEach((mod, mi) => {
    const count = perModule + (mi < remainder ? 1 : 0)
    for (let i = 0; i < count; i++) {
      // Scatter within 2m x 2m area around module center
      const x = mod.center[0] + (rand() - 0.5) * 2.0
      const z = mod.center[1] + (rand() - 0.5) * 2.0
      // Y between dropped ceiling and structural ceiling
      const y = ROOM.droppedCeiling - 0.05 + rand() * 0.2 // 3.15 to 3.35

      positions[idx * 3] = Math.max(-4.5, Math.min(4.5, x))
      positions[idx * 3 + 1] = y
      positions[idx * 3 + 2] = Math.max(-4.5, Math.min(4.5, z))
      moduleIndices[idx] = mi
      phases[idx] = rand() * Math.PI * 2
      speeds[idx] = 0.5 + rand() * 1.0 // period 2-6 seconds
      baseIntensities[idx] = 0.3 + rand() * 0.5
      idx++
    }
  })

  return { positions, moduleIndices, phases, speeds, baseIntensities, count: totalCount }
}
