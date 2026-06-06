import {
  SEATING_STOOL_CLUSTERS, SEATING_STOOLS_PER_CLUSTER,
  SEATING_STOOL_CLUSTER_RADIUS, SEATING_STOOL_JITTER,
  SEATING_STOOLS_RNG_SEED,
  SEATING_BENCH_POCKETS, SEATING_BENCH_PAIR_GAP, SEATING_BENCH_FACE_TILT,
  SEAT_BEAM_POOL_RADIUS_STOOL, SEAT_BEAM_POOL_RADIUS_BENCH,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'

// Shared seat placement for the three seating variants ('cubes',
// 'frame-stools', 'benches') and their per-seat downbeams (concept
// image 15). Seating components and SeatingSpotlights both read from
// here so the beams always land exactly on the seats.
//
// Returns { seats, lightAnchors, poolRadius }:
//   seats:        [{ x, z, rotY }] — one per seat (one per bench for
//                 the bench variant; each seat gets a visible beam)
//   lightAnchors: [{ x, z }] — one per cluster/pocket; the real
//                 spotLights mount here so the live light count stays
//                 low while every seat still reads as individually lit
//   poolRadius:   floor pool radius for this variant's beams

// 5 campfire clusters of 6 seats each — shared by 'cubes' and
// 'frame-stools'. Same seeded loop the original stools used, so the
// arrangement on screen is unchanged.
function buildClusterSeats() {
  const rng = makeRng(SEATING_STOOLS_RNG_SEED)
  const out = []
  for (let c = 0; c < SEATING_STOOL_CLUSTERS.length; c++) {
    const { x: cx, z: cz } = SEATING_STOOL_CLUSTERS[c]
    const angleOffset = rng() * Math.PI * 2
    for (let i = 0; i < SEATING_STOOLS_PER_CLUSTER; i++) {
      const t = i / SEATING_STOOLS_PER_CLUSTER
      const angle = angleOffset + t * Math.PI * 2 + (rng() - 0.5) * 0.4
      const r = SEATING_STOOL_CLUSTER_RADIUS + (rng() - 0.5) * SEATING_STOOL_JITTER * 2
      const x = cx + Math.cos(angle) * r + (rng() - 0.5) * SEATING_STOOL_JITTER
      const z = cz + Math.sin(angle) * r + (rng() - 0.5) * SEATING_STOOL_JITTER
      const rotY = angle + Math.PI + (rng() - 0.5) * 0.4
      out.push({ x, z, rotY })
    }
  }
  return out
}

// 3 pockets of 2 benches each. Same pocket math the bench component
// used, so bench positions are unchanged.
function buildBenchSeats() {
  const out = []
  SEATING_BENCH_POCKETS.forEach((pocket) => {
    const half = SEATING_BENCH_PAIR_GAP / 2
    const offsets = [
      { sign: +1, tilt: -SEATING_BENCH_FACE_TILT },
      { sign: -1, tilt: +SEATING_BENCH_FACE_TILT },
    ]
    offsets.forEach((o) => {
      const localX = o.sign * half
      const cosA = Math.cos(pocket.openAngle)
      const sinA = Math.sin(pocket.openAngle)
      const x = pocket.x + cosA * localX
      const z = pocket.z + sinA * localX
      const rotY = pocket.openAngle + Math.PI / 2 + o.tilt
      out.push({ x, z, rotY })
    })
  })
  return out
}

const _cache = {}

export function buildSeating(variant) {
  const key = variant === 'benches' ? 'benches' : 'clusters'
  if (_cache[key]) return _cache[key]
  if (key === 'benches') {
    _cache[key] = {
      seats: buildBenchSeats(),
      lightAnchors: SEATING_BENCH_POCKETS.map((p) => ({ x: p.x, z: p.z })),
      poolRadius: SEAT_BEAM_POOL_RADIUS_BENCH,
    }
  } else {
    _cache[key] = {
      seats: buildClusterSeats(),
      lightAnchors: SEATING_STOOL_CLUSTERS.map((c) => ({ x: c.x, z: c.z })),
      poolRadius: SEAT_BEAM_POOL_RADIUS_STOOL,
    }
  }
  return _cache[key]
}
