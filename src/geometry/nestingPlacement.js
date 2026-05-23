import {
  NESTING_RNG_SEED,
  NESTING_CLUSTER_CENTERS,
  NESTING_PER_CLUSTER_MIN, NESTING_PER_CLUSTER_MAX,
  NESTING_GAP,
  NESTING_LENGTH_MIN, NESTING_LENGTH_MAX,
  NESTING_RADIUS_MIN, NESTING_RADIUS_MAX,
} from './dimensions.js'
import { makeRng } from '../utils/parkMillerRng.js'

function generateBolsters() {
  const rng = makeRng(NESTING_RNG_SEED)
  const bolsters = []

  for (const center of NESTING_CLUSTER_CENTERS) {
    const clusterRotY = rng() * Math.PI
    const count = NESTING_PER_CLUSTER_MIN +
      Math.floor(rng() * (NESTING_PER_CLUSTER_MAX - NESTING_PER_CLUSTER_MIN + 1))

    for (let i = 0; i < count; i++) {
      const radius = NESTING_RADIUS_MIN + rng() * (NESTING_RADIUS_MAX - NESTING_RADIUS_MIN)
      const length = NESTING_LENGTH_MIN + rng() * (NESTING_LENGTH_MAX - NESTING_LENGTH_MIN)

      const offset = (i - (count - 1) / 2) * (NESTING_GAP + radius * 2)
      const perpX = Math.cos(clusterRotY + Math.PI / 2) * offset
      const perpZ = Math.sin(clusterRotY + Math.PI / 2) * offset

      bolsters.push({
        x: center.x + perpX,
        z: center.z + perpZ,
        length,
        radius,
        rotY: clusterRotY + (rng() - 0.5) * 0.2,
      })
    }
  }

  return bolsters
}

let _cache = null

export function buildNesting() {
  if (_cache) return _cache
  _cache = { bolsters: generateBolsters() }
  return _cache
}
