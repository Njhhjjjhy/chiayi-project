import {
  SEATING_BENCH_LENGTH, SEATING_BENCH_DEPTH, SEATING_BENCH_HEIGHT,
  SEATING_BENCH_COLOR, SEATING_BENCH_ROUGHNESS,
  SEATING_CUSHION_T, SEATING_CUSHION_COLOR, SEATING_CUSHION_ROUGHNESS,
  SEATING_BENCH_POCKETS, SEATING_BENCH_PAIR_GAP, SEATING_BENCH_FACE_TILT,
} from '../../geometry/dimensions.js'

const BODY_MATERIAL = {
  color: SEATING_BENCH_COLOR,
  roughness: SEATING_BENCH_ROUGHNESS,
  metalness: 0,
}

const CUSHION_MATERIAL = {
  color: SEATING_CUSHION_COLOR,
  roughness: SEATING_CUSHION_ROUGHNESS,
  metalness: 0,
}

function Bench({ x, z, rotY }) {
  const bodyCenterY = SEATING_BENCH_HEIGHT / 2
  const cushionCenterY = SEATING_BENCH_HEIGHT + SEATING_CUSHION_T / 2
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, bodyCenterY, 0]}>
        <boxGeometry args={[SEATING_BENCH_LENGTH, SEATING_BENCH_HEIGHT, SEATING_BENCH_DEPTH]} />
        <meshStandardMaterial {...BODY_MATERIAL} />
      </mesh>
      <mesh position={[0, cushionCenterY, 0]}>
        <boxGeometry args={[SEATING_BENCH_LENGTH, SEATING_CUSHION_T, SEATING_BENCH_DEPTH]} />
        <meshStandardMaterial {...CUSHION_MATERIAL} />
      </mesh>
    </group>
  )
}

export default function SeatingBenches() {
  const benches = []
  SEATING_BENCH_POCKETS.forEach((pocket, p) => {
    const half = SEATING_BENCH_PAIR_GAP / 2
    const offsets = [
      { sign: +1, tilt: -SEATING_BENCH_FACE_TILT },
      { sign: -1, tilt: +SEATING_BENCH_FACE_TILT },
    ]
    offsets.forEach((o, i) => {
      const localX = o.sign * half
      const localZ = 0
      const cosA = Math.cos(pocket.openAngle)
      const sinA = Math.sin(pocket.openAngle)
      const x = pocket.x + cosA * localX - sinA * localZ
      const z = pocket.z + sinA * localX + cosA * localZ
      const rotY = pocket.openAngle + Math.PI / 2 + o.tilt
      benches.push({ key: `${p}-${i}`, x, z, rotY })
    })
  })

  return (
    <group>
      {benches.map((b) => (
        <Bench key={b.key} x={b.x} z={b.z} rotY={b.rotY} />
      ))}
    </group>
  )
}
