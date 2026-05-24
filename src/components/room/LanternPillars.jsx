import * as THREE from 'three'
import { buildLanterns } from '../../geometry/lanternPlacement.js'
import {
  LANTERN_DIAMETER, LANTERN_COLOR,
  LANTERN_ROUGHNESS, LANTERN_METALNESS,
} from '../../geometry/dimensions.js'

// Base cylinder is unit-height (1 m) with the local origin moved to
// the base so per-instance Y scaling extends the pillar upward from
// the floor without offsetting the anchor.
const PILLAR_RADIUS = LANTERN_DIAMETER / 2
const PILLAR_GEO = new THREE.CylinderGeometry(PILLAR_RADIUS, PILLAR_RADIUS, 1, 24, 1)
PILLAR_GEO.translate(0, 0.5, 0)

const PILLAR_MAT = new THREE.MeshStandardMaterial({
  color: LANTERN_COLOR,
  roughness: LANTERN_ROUGHNESS,
  metalness: LANTERN_METALNESS,
})

const { pillars } = buildLanterns()

function buildPillarMesh() {
  const mesh = new THREE.InstancedMesh(PILLAR_GEO, PILLAR_MAT, pillars.count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < pillars.count; i++) {
    dummy.position.set(
      pillars.positions[i * 3 + 0],
      pillars.positions[i * 3 + 1],
      pillars.positions[i * 3 + 2],
    )
    dummy.rotation.set(0, 0, 0)
    dummy.scale.set(1, pillars.heights[i], 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

const PILLAR_MESH = buildPillarMesh()

export default function LanternPillars() {
  return <primitive object={PILLAR_MESH} />
}
