import {
  ENTRY_GAP_WIDTH, COLUMN_X, PATHWAY_PARTITION_Z, CABINET_T,
  WALL_DOT_DENSITY, WALL_DOT_MIN_GAP,
  WALL_DOT_DRAWER_FACE_PROUD,
  WALL_DOT_BAND_Y_MIN, WALL_DOT_BAND_Y_MAX,
  WALL_DOT_BASE_SEED,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'

// Shared wall-dot position pipeline. Originally inlined in
// src/components/lighting/WallGlowDots.jsx; extracted so the firefly
// behaviour modules can read the same positions and drive per-dot
// opacity, instead of the walls running a separate uniform breathe.

const BAND_HEIGHT = WALL_DOT_BAND_Y_MAX - WALL_DOT_BAND_Y_MIN

// Fireflies live only on the ceiling and the partition cabinets, and are
// only ever seen from inside the forest (locked decision). So the wall
// dots sit on three surfaces only: the forest-facing face of each
// partition cabinet. The side walls (front/back) carry none, and neither
// do the cabinet faces that point back toward the entrance or along the
// pathway — nothing glows toward the way in, nothing is visible from
// outside the exhibition.
//
// Each surface is described in face-local (u, v) where v is world Y
// (vertical band) and u is the face's horizontal axis. `toWorld(u, v)`
// projects local coords back to world, the dots sitting proud of the
// drawer fronts by WALL_DOT_DRAWER_FACE_PROUD. Seed offsets are kept
// from the original eight-surface set so the surviving forest-facing
// dots land in exactly the same places as before.
const SURFACES = [
  {
    id: 'entrance-partition-forest',
    seedOffset: 2,
    uMin: ENTRY_GAP_WIDTH, uMax: COLUMN_X,
    excludes: [],
    toWorld: (u, v) => [u, v, CABINET_T + WALL_DOT_DRAWER_FACE_PROUD],
  },
  {
    id: 'pathway-vertical-forest',
    seedOffset: 4,
    uMin: 0, uMax: PATHWAY_PARTITION_Z,
    excludes: [],
    toWorld: (u, v) => [ENTRY_GAP_WIDTH + CABINET_T + WALL_DOT_DRAWER_FACE_PROUD, v, u],
  },
  {
    id: 'pathway-horizontal-forest',
    seedOffset: 6,
    uMin: ENTRY_GAP_WIDTH, uMax: COLUMN_X,
    excludes: [],
    toWorld: (u, v) => [u, v, PATHWAY_PARTITION_Z - CABINET_T - WALL_DOT_DRAWER_FACE_PROUD],
  },
]

function samplePoints(uSpan, vSpan, targetCount, excludes, rng) {
  const r = WALL_DOT_MIN_GAP
  const r2 = r * r
  const cell = r / Math.SQRT2
  const cols = Math.max(1, Math.ceil(uSpan / cell))
  const rows = Math.max(1, Math.ceil(vSpan / cell))
  const grid = new Array(cols * rows).fill(null)
  const points = []
  const maxAttempts = targetCount * 40

  function neighborTooClose(u, v) {
    const cu = Math.floor(u / cell)
    const cv = Math.floor(v / cell)
    for (let dv = -2; dv <= 2; dv++) {
      const ncv = cv + dv
      if (ncv < 0 || ncv >= rows) continue
      for (let du = -2; du <= 2; du++) {
        const ncu = cu + du
        if (ncu < 0 || ncu >= cols) continue
        const p = grid[ncv * cols + ncu]
        if (!p) continue
        const ddu = p[0] - u, ddv = p[1] - v
        if (ddu * ddu + ddv * ddv < r2) return true
      }
    }
    return false
  }

  let attempts = 0
  while (points.length < targetCount && attempts < maxAttempts) {
    attempts++
    const u = rng() * uSpan
    const v = rng() * vSpan
    let excluded = false
    for (const e of excludes) {
      if (u >= e.uOffMin && u <= e.uOffMax && v >= e.vOffMin && v <= e.vOffMax) {
        excluded = true
        break
      }
    }
    if (excluded) continue
    if (neighborTooClose(u, v)) continue
    points.push([u, v])
    const cu = Math.floor(u / cell)
    const cv = Math.floor(v / cell)
    grid[cv * cols + cu] = [u, v]
  }
  return points
}

let _cache = null

export function buildWallDots() {
  if (_cache) return _cache
  const xyz = []
  const phases = []
  for (const surface of SURFACES) {
    const uSpan = surface.uMax - surface.uMin
    const vSpan = BAND_HEIGHT
    const localExcludes = surface.excludes.map((e) => ({
      uOffMin: e.uMin - surface.uMin,
      uOffMax: e.uMax - surface.uMin,
      vOffMin: e.vMin - WALL_DOT_BAND_Y_MIN,
      vOffMax: e.vMax - WALL_DOT_BAND_Y_MIN,
    }))
    const totalArea = uSpan * vSpan
    let excludedArea = 0
    for (const e of localExcludes) {
      const uOv = Math.max(0, Math.min(e.uOffMax, uSpan) - Math.max(e.uOffMin, 0))
      const vOv = Math.max(0, Math.min(e.vOffMax, vSpan) - Math.max(e.vOffMin, 0))
      excludedArea += uOv * vOv
    }
    const eligibleArea = Math.max(0, totalArea - excludedArea)
    const targetCount = Math.round(eligibleArea * WALL_DOT_DENSITY)
    const posRng = makeRng(WALL_DOT_BASE_SEED + surface.seedOffset)
    const phaseRng = makeRng(WALL_DOT_BASE_SEED + surface.seedOffset + 100)

    const pts = samplePoints(uSpan, vSpan, targetCount, localExcludes, posRng)
    for (const [uLocal, vLocal] of pts) {
      const u = uLocal + surface.uMin
      const v = vLocal + WALL_DOT_BAND_Y_MIN
      const w = surface.toWorld(u, v)
      xyz.push(w[0], w[1], w[2])
      phases.push(phaseRng() * Math.PI * 2)
    }
  }
  _cache = {
    positions: new Float32Array(xyz),
    phases: new Float32Array(phases),
    count: phases.length,
  }
  return _cache
}
