import * as THREE from 'three'
import { buildGrove } from '../../geometry/grovePlacement.js'
import {
  GROVE_STEM_DIAMETER, GROVE_STEM_COLOR,
  GROVE_STEM_ROUGHNESS, GROVE_STEM_METALNESS,
} from '../../geometry/dimensions.js'

// Base cylinder is unit-height (1 m) with the local origin moved to
// the base so per-instance Y scaling extends the stem upward from the
// floor without offsetting the anchor.
const STEM_RADIUS = GROVE_STEM_DIAMETER / 2
const STEM_GEO = new THREE.CylinderGeometry(STEM_RADIUS, STEM_RADIUS, 1, 6, 1)
STEM_GEO.translate(0, 0.5, 0)

const STEM_MAT = new THREE.MeshStandardMaterial({
  color: GROVE_STEM_COLOR,
  roughness: GROVE_STEM_ROUGHNESS,
  metalness: GROVE_STEM_METALNESS,
})

const { stems } = buildGrove()

function buildStemMesh() {
  const mesh = new THREE.InstancedMesh(STEM_GEO, STEM_MAT, stems.count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < stems.count; i++) {
    dummy.position.set(
      stems.positions[i * 3 + 0],
      stems.positions[i * 3 + 1],
      stems.positions[i * 3 + 2],
    )
    dummy.rotation.set(
      stems.rotations[i * 2 + 0],
      0,
      stems.rotations[i * 2 + 1],
    )
    dummy.scale.set(1, stems.heights[i], 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

const STEM_MESH = buildStemMesh()

export default function GroveStems() {
  return <primitive object={STEM_MESH} />
}
