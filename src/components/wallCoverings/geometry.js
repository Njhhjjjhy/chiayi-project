// Wall-covering segment generator. Reads geometry from the canonical source
// in src/geometry/dimensions.js. This file only holds the curtain-segment
// algorithm — dimensions belong to the whole scene, not just wall coverings.

import {
  ROOM, HW, HD, INSIDE, WAINSCOT_H, DOOR_SKIPS, DOOR_TOPS,
} from '../../geometry/dimensions.js'

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
