import * as THREE from 'three'
import {
  SEATING_CUBE_SIZE, SEATING_CUBE_H,
  SEATING_CUBE_COLOR, SEATING_CUBE_ROUGHNESS,
} from '../../geometry/dimensions.js'
import { buildSeating } from '../../geometry/seatingPlacement.js'

// Seating variant 'cubes' (concept image 03) — solid timber block
// stools in loose campfire clusters. No cushion; the block IS the seat.
// All 30 cubes render as one InstancedMesh (single draw call), same
// pattern as LanternPillars.

const CUBE_GEO = new THREE.BoxGeometry(SEATING_CUBE_SIZE, SEATING_CUBE_H, SEATING_CUBE_SIZE)
CUBE_GEO.translate(0, SEATING_CUBE_H / 2, 0)

const CUBE_MAT = new THREE.MeshStandardMaterial({
  color: SEATING_CUBE_COLOR,
  roughness: SEATING_CUBE_ROUGHNESS,
  metalness: 0,
})

function buildCubeMesh() {
  const { seats } = buildSeating('cubes')
  const mesh = new THREE.InstancedMesh(CUBE_GEO, CUBE_MAT, seats.length)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < seats.length; i++) {
    dummy.position.set(seats[i].x, 0, seats[i].z)
    dummy.rotation.set(0, seats[i].rotY, 0)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

const CUBE_MESH = buildCubeMesh()

export default function SeatingCubes() {
  return <primitive object={CUBE_MESH} />
}
