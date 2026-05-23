import {
  SEATING_PILLOW_DIAMETER, SEATING_PILLOW_LENGTH, SEATING_PILLOW_GAP,
  SEATING_PILLOWS_PER_CLUSTER, SEATING_PILLOW_COLOR, SEATING_PILLOW_ROUGHNESS,
  SEATING_PILLOW_CLUSTERS,
} from '../../geometry/dimensions.js'

const PILLOW_MATERIAL = {
  color: SEATING_PILLOW_COLOR,
  roughness: SEATING_PILLOW_ROUGHNESS,
  metalness: 0,
}

const RADIUS = SEATING_PILLOW_DIAMETER / 2

function Pillow({ x, z, rotY }) {
  return (
    <group position={[x, RADIUS, z]} rotation={[0, rotY, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry
          args={[RADIUS, RADIUS, SEATING_PILLOW_LENGTH, 16, 1]}
        />
        <meshStandardMaterial {...PILLOW_MATERIAL} />
      </mesh>
      <mesh position={[0, 0, -SEATING_PILLOW_LENGTH / 2]}>
        <sphereGeometry args={[RADIUS, 16, 12]} />
        <meshStandardMaterial {...PILLOW_MATERIAL} />
      </mesh>
      <mesh position={[0, 0, +SEATING_PILLOW_LENGTH / 2]}>
        <sphereGeometry args={[RADIUS, 16, 12]} />
        <meshStandardMaterial {...PILLOW_MATERIAL} />
      </mesh>
    </group>
  )
}

export default function SeatingPillows() {
  const pillows = []
  const stride = SEATING_PILLOW_DIAMETER + SEATING_PILLOW_GAP
  const totalSpan = stride * (SEATING_PILLOWS_PER_CLUSTER - 1)

  SEATING_PILLOW_CLUSTERS.forEach((cluster, c) => {
    const cosA = Math.cos(cluster.rotY)
    const sinA = Math.sin(cluster.rotY)
    for (let i = 0; i < SEATING_PILLOWS_PER_CLUSTER; i++) {
      const localX = -totalSpan / 2 + i * stride
      const localZ = 0
      const x = cluster.x + cosA * localX - sinA * localZ
      const z = cluster.z + sinA * localX + cosA * localZ
      pillows.push({ key: `${c}-${i}`, x, z, rotY: cluster.rotY })
    }
  })

  return (
    <group>
      {pillows.map((p) => (
        <Pillow key={p.key} x={p.x} z={p.z} rotY={p.rotY} />
      ))}
    </group>
  )
}
