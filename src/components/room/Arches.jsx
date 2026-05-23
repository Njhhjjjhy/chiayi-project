import * as THREE from 'three'
import { useProposal } from '../../hooks/useProposal.js'
import { buildArches } from '../../geometry/archesPlacement.js'
import {
  ARCHES_TUBE_RADIUS, ARCHES_COLOR,
  ARCHES_EMISSIVE_INTENSITY, ARCHES_ROUGHNESS, ARCHES_METALNESS,
  ARCHES_TUBE_SEGMENTS,
} from '../../geometry/dimensions.js'

const ARCH_MAT = new THREE.MeshStandardMaterial({
  color: ARCHES_COLOR,
  emissive: ARCHES_COLOR,
  emissiveIntensity: ARCHES_EMISSIVE_INTENSITY,
  roughness: ARCHES_ROUGHNESS,
  metalness: ARCHES_METALNESS,
})

const { arches } = buildArches()

function createArchMesh(arch) {
  const points = []
  for (let i = 0; i <= ARCHES_TUBE_SEGMENTS; i++) {
    const t = i / ARCHES_TUBE_SEGMENTS
    const angle = t * Math.PI
    const lx = (arch.width / 2) * -Math.cos(angle)
    const ly = arch.height * Math.sin(angle)
    points.push(new THREE.Vector3(lx, ly, 0))
  }
  const curve = new THREE.CatmullRomCurve3(points)
  const geo = new THREE.TubeGeometry(curve, ARCHES_TUBE_SEGMENTS, ARCHES_TUBE_RADIUS, 8, false)
  const mesh = new THREE.Mesh(geo, ARCH_MAT)
  mesh.position.set(arch.x, 0, arch.z)
  mesh.rotation.y = arch.rotY
  return mesh
}

const ARCH_GROUP = new THREE.Group()
for (const arch of arches) {
  ARCH_GROUP.add(createArchMesh(arch))
}

export default function Arches() {
  const { hasArches } = useProposal()
  if (!hasArches) return null
  return <primitive object={ARCH_GROUP} />
}
