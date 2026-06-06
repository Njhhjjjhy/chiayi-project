import {
  SEATING_BENCH_LENGTH, SEATING_BENCH_DEPTH, SEATING_BENCH_HEIGHT,
  SEATING_BENCH_COLOR, SEATING_BENCH_ROUGHNESS,
  SEATING_CUSHION_T, SEATING_CUSHION_COLOR, SEATING_CUSHION_ROUGHNESS,
} from '../../geometry/dimensions.js'
import { buildSeating } from '../../geometry/seatingPlacement.js'

// Seating variant 'benches' (concept image 15) — low boxy benches,
// each sitting under its own downbeam (see SeatingSpotlights). The top
// slab overhangs the body slightly so the bench reads as a built box
// with a lid rather than a single block.

const BODY_MATERIAL = {
  color: SEATING_BENCH_COLOR,
  roughness: SEATING_BENCH_ROUGHNESS,
  metalness: 0,
}

const TOP_MATERIAL = {
  color: SEATING_CUSHION_COLOR,
  roughness: SEATING_CUSHION_ROUGHNESS,
  metalness: 0,
}

const TOP_OVERHANG = 0.02

function Bench({ x, z, rotY }) {
  const bodyCenterY = SEATING_BENCH_HEIGHT / 2
  const topCenterY = SEATING_BENCH_HEIGHT + SEATING_CUSHION_T / 2
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, bodyCenterY, 0]}>
        <boxGeometry args={[SEATING_BENCH_LENGTH, SEATING_BENCH_HEIGHT, SEATING_BENCH_DEPTH]} />
        <meshStandardMaterial {...BODY_MATERIAL} />
      </mesh>
      <mesh position={[0, topCenterY, 0]}>
        <boxGeometry
          args={[
            SEATING_BENCH_LENGTH + TOP_OVERHANG * 2,
            SEATING_CUSHION_T,
            SEATING_BENCH_DEPTH + TOP_OVERHANG * 2,
          ]}
        />
        <meshStandardMaterial {...TOP_MATERIAL} />
      </mesh>
    </group>
  )
}

export default function SeatingBenches() {
  const { seats } = buildSeating('benches')
  return (
    <group>
      {seats.map((b, i) => (
        <Bench key={i} x={b.x} z={b.z} rotY={b.rotY} />
      ))}
    </group>
  )
}
