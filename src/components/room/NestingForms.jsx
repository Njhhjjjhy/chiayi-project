import * as THREE from 'three'
import { useProposal } from '../../hooks/useProposal.js'
import { buildNesting } from '../../geometry/nestingPlacement.js'
import { NESTING_PEBBLE_COLOR } from '../../geometry/dimensions.js'

// Nesting pebble ceiling (concept image 09) — dark rounded pebble-like
// forms covering the forest ceiling. Rendered instead of the regular
// sculptural ceiling when the nesting proposal is active (the proposal
// sets replacesCeiling). The green points on the undersides live in
// NestingLEDs.jsx.

const PEBBLE_MAT = new THREE.MeshStandardMaterial({
  color: NESTING_PEBBLE_COLOR,
  emissive: NESTING_PEBBLE_COLOR,
  emissiveIntensity: 0.08,
  roughness: 0.9,
  metalness: 0,
})

const SHARED_SPHERE_GEO = new THREE.SphereGeometry(1, 20, 14)

const { pebbles } = buildNesting()

const PEBBLE_GROUP = new THREE.Group()
for (const p of pebbles) {
  const mesh = new THREE.Mesh(SHARED_SPHERE_GEO, PEBBLE_MAT)
  mesh.position.set(p.x, p.y, p.z)
  mesh.rotation.set(0, p.rotY, 0)
  mesh.scale.set(p.halfX, p.halfY, p.halfZ)
  PEBBLE_GROUP.add(mesh)
}

export default function NestingForms() {
  const { hasNesting } = useProposal()
  if (!hasNesting) return null
  return <primitive object={PEBBLE_GROUP} />
}
