import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { useProposal } from '../../hooks/useProposal-v2.js'
import {
  FOREST_X_START, FOREST_X_END, FOREST_Z_START, FOREST_Z_END,
} from '../../geometry/dimensions-v2.js'

// 20 dried-bamboo / hardwood branches rigged horizontally below the
// panel ceiling. Only rendered for proposals with hasBranches=true
// (currently fireflies-within-reach).
//
// Position: random XZ inside the forest zone, Y between 2.0 and 2.8.
// Length 0.8–1.4 m per branch, random Y rotation, all horizontal.
//
// Bark textures: Bark007 from ambientCG (verified present in chunk-1
// flag check). Color + GL-convention normal map. Branches use the same
// emissive offset trick as the walls so they don't crush to pure black
// under ACES at ambient 0.01.

const BRANCH_COUNT = 20
const Y_MIN = 2.0
const Y_MAX = 2.8
const LEN_MIN = 0.8
const LEN_MAX = 1.4
const TOP_RADIUS = 0.015
const BOTTOM_RADIUS = 0.025
const SEED = 99

const BARK_COLOR = '/textures/Bark007/Bark007_2K-JPG_Color.jpg'
const BARK_NORMAL = '/textures/Bark007/Bark007_2K-JPG_NormalGL.jpg'

function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateBranches() {
  const rng = makeRng(SEED)
  const branches = []
  // Inset by the worst-case half-extent (half of the longest possible
  // branch) so a branch tip can't poke past a forest boundary regardless
  // of which way it rotates around Y.
  const HALF_MAX = LEN_MAX / 2
  const xMin = FOREST_X_START + HALF_MAX
  const xMax = FOREST_X_END - HALF_MAX
  const zMin = FOREST_Z_START + HALF_MAX
  const zMax = FOREST_Z_END - HALF_MAX
  for (let i = 0; i < BRANCH_COUNT; i++) {
    branches.push({
      x: xMin + rng() * (xMax - xMin),
      z: zMin + rng() * (zMax - zMin),
      y: Y_MIN + rng() * (Y_MAX - Y_MIN),
      length: LEN_MIN + rng() * (LEN_MAX - LEN_MIN),
      rotY: rng() * Math.PI * 2,
    })
  }
  return branches
}

function Branch({ branch, map, normalMap }) {
  return (
    <group position={[branch.x, branch.y, branch.z]} rotation={[0, branch.rotY, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[TOP_RADIUS, BOTTOM_RADIUS, branch.length, 6]} />
        <meshStandardMaterial
          map={map}
          normalMap={normalMap}
          emissive="#001100"
          emissiveIntensity={0.05}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

export default function Branches() {
  const { hasBranches } = useProposal()
  const branches = useMemo(() => generateBranches(), [])
  const [map, normalMap] = useTexture([BARK_COLOR, BARK_NORMAL])

  if (!hasBranches) return null

  return (
    <group>
      {branches.map((b, i) => (
        <Branch key={i} branch={b} map={map} normalMap={normalMap} />
      ))}
    </group>
  )
}
