import {
  ROOM, WALL_T,
  LOOFAH_WALL_Z_START, LOOFAH_WALL_Z_END,
  SEATING_STOOL_CLUSTERS, SEATING_STOOLS_PER_CLUSTER,
  SEATING_STOOL_CLUSTER_RADIUS, SEATING_STOOL_JITTER,
  SEATING_STOOLS_RNG_SEED,
  SEATING_BENCH_LAYOUT,
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
//   lightAnchors: [{ x, z }] — one per cluster (one per bench for the
//                 bench variant); the real spotLights mount here so
//                 the live light count stays low while every seat
//                 still reads as individually lit
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

// Five benches in a symmetric horseshoe facing the loofah wall
// (concept image 15). Each layout entry gives a distance out from the
// wall surface and an offset along the wall; the bench then turns so
// its seat faces the wall's centre. rotY maps the bench's local +Z
// (its facing normal) onto the direction toward the focus point.
function buildBenchSeats() {
  const focusX = ROOM.W - WALL_T
  const focusZ = (LOOFAH_WALL_Z_START + LOOFAH_WALL_Z_END) / 2
  return SEATING_BENCH_LAYOUT.map((b) => {
    const x = focusX - b.out
    const z = focusZ + b.side
    const rotY = Math.atan2(focusX - x, focusZ - z)
    return { x, z, rotY, kind: b.kind }
  })
}

const _cache = {}

export function buildSeating(variant) {
  const key = variant === 'benches' ? 'benches' : 'clusters'
  if (_cache[key]) return _cache[key]
  if (key === 'benches') {
    // One anchor per bench — every bench sits under its own downbeam
    // in the image, so the real lights mount over each bench.
    const seats = buildBenchSeats()
    _cache[key] = {
      seats,
      lightAnchors: seats.map((s) => ({ x: s.x, z: s.z })),
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
