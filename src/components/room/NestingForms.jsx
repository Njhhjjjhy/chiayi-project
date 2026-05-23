import * as THREE from 'three'
import { useProposal } from '../../hooks/useProposal.js'
import { buildNesting } from '../../geometry/nestingPlacement.js'
import {
  NESTING_COLOR, NESTING_EMISSIVE_INTENSITY, NESTING_ROUGHNESS,
} from '../../geometry/dimensions.js'

const NESTING_MAT = new THREE.MeshStandardMaterial({
  color: NESTING_COLOR,
  emissive: NESTING_COLOR,
  emissiveIntensity: NESTING_EMISSIVE_INTENSITY,
  roughness: NESTING_ROUGHNESS,
  metalness: 0,
})

const { bolsters } = buildNesting()

const NESTING_GROUP = new THREE.Group()
for (const b of bolsters) {
  const geo = new THREE.CapsuleGeometry(b.radius, b.length, 8, 16)
  const mesh = new THREE.Mesh(geo, NESTING_MAT)
  mesh.position.set(b.x, b.radius, b.z)
  mesh.rotation.order = 'ZYX'
  mesh.rotation.set(0, b.rotY, Math.PI / 2)
  NESTING_GROUP.add(mesh)
}

export default function NestingForms() {
  const { hasNesting } = useProposal()
  if (!hasNesting) return null
  return <primitive object={NESTING_GROUP} />
}
