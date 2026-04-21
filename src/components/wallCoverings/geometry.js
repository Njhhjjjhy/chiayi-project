// Shared geometry helpers for wall-covering variants.
// All four walls' inside faces sit at ±HW (x) and ±HD (z). Wainscoting heights
// vary per wall (entrance-wall has none). Door areas must always be skipped.

export const ROOM = { W: 8.83, D: 10, H: 3.52 }
export const HW = ROOM.W / 2   // 4.415
export const HD = ROOM.D / 2   // 5

export const INSIDE = {
  front: -HD,    // z
  back: HD,      // z
  entrance: -HW, // x
  window: HW,    // x
}

export const WAINSCOT_H = {
  front: 0.90,
  back: 0.90,
  window: 0.30,
  entrance: 0,
}

// Door skip ranges per wall, along the wall's main axis (x for front/back, z for entrance/window)
const DOOR_CLEAR = 0.08
export const DOOR_SKIPS = {
  front: [],
  back: [
    [-4.415 - DOOR_CLEAR, -3.515 + DOOR_CLEAR],   // D2
    [-0.915 - DOOR_CLEAR, 0.045 + DOOR_CLEAR],    // D1
  ],
  entrance: [
    [-4.55 - DOOR_CLEAR, -2.15 + DOOR_CLEAR],     // visitor entrance (240 × 352)
  ],
  window: [
    [-2.59 - DOOR_CLEAR, -1.60 + DOOR_CLEAR],     // silver service door (99 × 207)
  ],
}

export function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Generate sparse box placements across all four walls.
// Returns array of { wall, x, y, z, wx, wy, wz, normalAxis, normalSign }
// where wx/wy/wz are box dimensions in WORLD axes (already rotated for the wall).
export function generateBoxPlacements({ countPerWall = 10, sizes = [0.20, 0.50, 0.90], depth = 0.20, seed = 33, skipsPerWall = DOOR_SKIPS }) {
  const rand = seededRandom(seed)
  const placements = []

  const walls = [
    { name: 'front',    along: 'x', a: -HW + 0.45, b: HW - 0.45,
      normal: { axis: 'z', coord: INSIDE.front, sign: +1 },
      ymin: WAINSCOT_H.front + 0.05 },
    { name: 'back',     along: 'x', a: -HW + 0.45, b: HW - 0.45,
      normal: { axis: 'z', coord: INSIDE.back, sign: -1 },
      ymin: WAINSCOT_H.back + 0.05 },
    { name: 'entrance', along: 'z', a: -HD + 0.45, b: HD - 0.45,
      normal: { axis: 'x', coord: INSIDE.entrance, sign: +1 },
      ymin: WAINSCOT_H.entrance + 0.05 },
    { name: 'window',   along: 'z', a: -HD + 0.45, b: HD - 0.45,
      normal: { axis: 'x', coord: INSIDE.window, sign: -1 },
      ymin: WAINSCOT_H.window + 0.05 },
  ]

  for (const wall of walls) {
    const skips = skipsPerWall[wall.name] || []
    let attempts = 0
    let placed = 0
    while (placed < countPerWall && attempts < countPerWall * 12) {
      attempts++
      const size = sizes[Math.floor(rand() * sizes.length)]
      const halfSize = size / 2
      const t = wall.a + rand() * (wall.b - wall.a)
      // Skip if box footprint overlaps any door range
      const isInSkip = skips.some(([lo, hi]) => t + halfSize > lo && t - halfSize < hi)
      if (isInSkip) continue
      const ymax = ROOM.H - 0.10 - size
      const y = wall.ymin + rand() * Math.max(0.01, ymax - wall.ymin)
      const offset = depth / 2 + 0.001

      const pos = {
        wall: wall.name,
        normalAxis: wall.normal.axis,
        normalSign: wall.normal.sign,
        y: y + size / 2,
      }
      if (wall.along === 'x') {
        pos.x = t
        pos.z = wall.normal.coord + wall.normal.sign * offset
        pos.wx = size
        pos.wy = size
        pos.wz = depth
      } else {
        pos.z = t
        pos.x = wall.normal.coord + wall.normal.sign * offset
        pos.wx = depth
        pos.wy = size
        pos.wz = size
      }
      placements.push(pos)
      placed++
    }
  }

  return placements
}

// Generate vertical pole placements (bamboo / fibers) along all four walls.
// Returns array of { wall, x, z, ymin, ymax, radius }
export function generatePolePlacements({ countPerWall = 22, radius = 0.025, seed = 88 }) {
  const rand = seededRandom(seed)
  const placements = []

  const walls = [
    { name: 'front', along: 'x', a: -HW + 0.2, b: HW - 0.2,
      normal: { axis: 'z', coord: INSIDE.front, sign: +1 }, ymin: WAINSCOT_H.front + 0.02 },
    { name: 'back', along: 'x', a: -HW + 0.2, b: HW - 0.2,
      normal: { axis: 'z', coord: INSIDE.back, sign: -1 }, ymin: WAINSCOT_H.back + 0.02 },
    { name: 'entrance', along: 'z', a: -HD + 0.2, b: HD - 0.2,
      normal: { axis: 'x', coord: INSIDE.entrance, sign: +1 }, ymin: WAINSCOT_H.entrance + 0.02 },
    { name: 'window', along: 'z', a: -HD + 0.2, b: HD - 0.2,
      normal: { axis: 'x', coord: INSIDE.window, sign: -1 }, ymin: WAINSCOT_H.window + 0.02 },
  ]

  const offset = 0.08    // how far poles sit off the wall

  for (const wall of walls) {
    const skips = DOOR_SKIPS[wall.name]
    let attempts = 0
    let placed = 0
    while (placed < countPerWall && attempts < countPerWall * 10) {
      attempts++
      const t = wall.a + rand() * (wall.b - wall.a)
      const inSkip = skips.some(([lo, hi]) => t > lo && t < hi)
      if (inSkip) continue
      const pos = {
        wall: wall.name,
        radius: radius * (0.85 + rand() * 0.4),
        ymin: wall.ymin,
        ymax: ROOM.H - 0.05,
      }
      if (wall.along === 'x') {
        pos.x = t
        pos.z = wall.normal.coord + wall.normal.sign * offset
      } else {
        pos.z = t
        pos.x = wall.normal.coord + wall.normal.sign * offset
      }
      placements.push(pos)
      placed++
    }
  }

  return placements
}

// Door-top heights per wall (matching DOOR_SKIPS order). Area above the
// door up to ROOM.H is covered by an "overhead" curtain segment so the
// wall covering has no cream gap above any doorway.
export const DOOR_TOPS = {
  front: [],
  back:     [2.36, 2.36],   // D2, D1
  entrance: [3.52],         // visitor entrance — full room height, no overhead
  window:   [2.07],         // silver service door (top at 207 cm)
}

// Generate curtain segments covering every wall above its wainscot. Two
// kinds of segments:
//   - Floor-to-ceiling panels BETWEEN doors (horizontal door-skip logic)
//   - Overhead panels ABOVE each door (door-top to ceiling)
// Together they cover the entire above-wainscot area minus the door openings.
// Returns array of { wall, x, y, z, w, h, normalAxis, normalSign, isOverhead }
export function generateCurtainSegments() {
  const segments = []
  const offset = 0.06

  function addSegments(wall, axisName, normalCoord, normalSign, lo, hi, ymin) {
    const skips = DOOR_SKIPS[wall]
    const tops = DOOR_TOPS[wall] || []
    const withTops = skips.map((skip, i) => ({ skip, top: tops[i] ?? 2.36 }))
    const sorted = [...withTops].sort((a, b) => a.skip[0] - b.skip[0])

    // floor-to-ceiling ranges between doors
    const ranges = []
    let cursor = lo
    for (const { skip: [skipLo, skipHi] } of sorted) {
      if (skipHi < lo || skipLo > hi) continue
      const a = Math.max(cursor, lo)
      const b = Math.min(skipLo, hi)
      if (b > a) ranges.push([a, b])
      cursor = Math.max(cursor, skipHi)
    }
    if (cursor < hi) ranges.push([cursor, hi])

    const yCenter = (ymin + ROOM.H) / 2
    const h = ROOM.H - ymin
    for (const [a, b] of ranges) {
      const t = (a + b) / 2
      const w = b - a
      const seg = { wall, w, h, normalAxis: axisName, normalSign, isOverhead: false }
      if (axisName === 'z') {
        seg.x = t
        seg.z = normalCoord + normalSign * offset
        seg.y = yCenter
      } else {
        seg.z = t
        seg.x = normalCoord + normalSign * offset
        seg.y = yCenter
      }
      segments.push(seg)
    }

    // overhead segments above each door
    for (const { skip: [skipLo, skipHi], top } of sorted) {
      if (skipHi < lo || skipLo > hi) continue
      if (top >= ROOM.H) continue
      const a = Math.max(skipLo, lo)
      const b = Math.min(skipHi, hi)
      if (b <= a) continue
      const t = (a + b) / 2
      const w = b - a
      const ohH = ROOM.H - top
      const ohY = (top + ROOM.H) / 2
      const seg = { wall, w, h: ohH, normalAxis: axisName, normalSign, isOverhead: true }
      if (axisName === 'z') {
        seg.x = t
        seg.z = normalCoord + normalSign * offset
        seg.y = ohY
      } else {
        seg.z = t
        seg.x = normalCoord + normalSign * offset
        seg.y = ohY
      }
      segments.push(seg)
    }
  }

  addSegments('front',    'z', INSIDE.front, +1, -HW, HW, WAINSCOT_H.front)
  addSegments('back',     'z', INSIDE.back, -1, -HW, HW, WAINSCOT_H.back)
  addSegments('entrance', 'x', INSIDE.entrance, +1, -HD, HD, WAINSCOT_H.entrance)
  addSegments('window',   'x', INSIDE.window, -1, -HD, HD, WAINSCOT_H.window)

  return segments
}
