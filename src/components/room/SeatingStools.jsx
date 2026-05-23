import { useMemo } from 'react'
import {
  SEATING_BOX_W, SEATING_BOX_D, SEATING_BOX_H,
  SEATING_BOX_COLOR, SEATING_BOX_ROUGHNESS,
  SEATING_CUSHION_T, SEATING_CUSHION_COLOR, SEATING_CUSHION_ROUGHNESS,
  SEATING_STOOL_CLUSTERS, SEATING_STOOLS_PER_CLUSTER,
  SEATING_STOOL_CLUSTER_RADIUS, SEATING_STOOL_JITTER,
  SEATING_STOOLS_RNG_SEED,
} from '../../geometry/dimensions.js'
import { makeRng } from '../../utils/parkMillerRng.js'

const BOX_MATERIAL = {
  color: SEATING_BOX_COLOR,
  roughness: SEATING_BOX_ROUGHNESS,
  metalness: 0,
}

const CUSHION_MATERIAL = {
  color: SEATING_CUSHION_COLOR,
  roughness: SEATING_CUSHION_ROUGHNESS,
  metalness: 0,
}

function Stool({ x, z, rotY }) {
  const boxCenterY = SEATING_BOX_H / 2
  const cushionCenterY = SEATING_BOX_H + SEATING_CUSHION_T / 2
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, boxCenterY, 0]}>
        <boxGeometry args={[SEATING_BOX_W, SEATING_BOX_H, SEATING_BOX_D]} />
        <meshStandardMaterial {...BOX_MATERIAL} />
      </mesh>
      <mesh position={[0, cushionCenterY, 0]}>
        <boxGeometry args={[SEATING_BOX_W, SEATING_CUSHION_T, SEATING_BOX_D]} />
        <meshStandardMaterial {...CUSHION_MATERIAL} />
      </mesh>
    </group>
  )
}

export default function SeatingStools() {
  const stools = useMemo(() => {
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
  }, [])

  return (
    <group>
      {stools.map((s, i) => (
        <Stool key={i} x={s.x} z={s.z} rotY={s.rotY} />
      ))}
    </group>
  )
}
