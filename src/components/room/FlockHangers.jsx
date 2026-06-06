import * as THREE from 'three'
import { buildFlock } from '../../geometry/flockPlacement.js'
import {
  ROOM,
  FLOCK_THREAD_RADIUS, FLOCK_THREAD_COLOR, FLOCK_THREAD_EMISSIVE_INTENSITY,
  FLOCK_SILHOUETTE_THICKNESS, FLOCK_SILHOUETTE_COLOR,
} from '../../geometry/dimensions.js'

// Flock structure (concept image 13): the fine threads each wall
// string hangs on, and the large dark disc silhouettes floating
// against the glowing ceiling field. The green points themselves live
// in FlockLEDs.jsx.

const THREAD_GEO = new THREE.CylinderGeometry(FLOCK_THREAD_RADIUS, FLOCK_THREAD_RADIUS, 1, 4)
const THREAD_MAT = new THREE.MeshStandardMaterial({
  color: FLOCK_THREAD_COLOR,
  emissive: FLOCK_THREAD_COLOR,
  emissiveIntensity: FLOCK_THREAD_EMISSIVE_INTENSITY,
  roughness: 0.6,
  metalness: 0,
})

const SILHOUETTE_GEO = new THREE.CylinderGeometry(1, 1, 1, 32)
const SILHOUETTE_MAT = new THREE.MeshStandardMaterial({
  color: FLOCK_SILHOUETTE_COLOR,
  emissive: FLOCK_SILHOUETTE_COLOR,
  emissiveIntensity: 0.04,
  roughness: 0.9,
  metalness: 0,
})

const { strings, silhouettes } = buildFlock()

function buildThreadMesh() {
  const mesh = new THREE.InstancedMesh(THREAD_GEO, THREAD_MAT, strings.length)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i]
    dummy.position.set(s.x, ROOM.H - s.length / 2, s.z)
    dummy.scale.set(1, s.length, 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

function buildSilhouetteGroup() {
  const group = new THREE.Group()
  for (const s of silhouettes) {
    const disc = new THREE.Mesh(SILHOUETTE_GEO, SILHOUETTE_MAT)
    disc.position.set(s.x, s.y, s.z)
    disc.scale.set(s.diameter / 2, FLOCK_SILHOUETTE_THICKNESS, s.diameter / 2)
    group.add(disc)

    // Two fine suspension threads per disc, rising past the working
    // ceiling to the structural ceiling like the sculptural-ceiling
    // cables do.
    const topY = ROOM.H_TOTAL
    const startY = s.y + FLOCK_SILHOUETTE_THICKNESS / 2
    const len = topY - startY
    const offset = Math.min(s.diameter * 0.3, 0.5)
    for (const side of [-1, 1]) {
      const thread = new THREE.Mesh(THREAD_GEO, THREAD_MAT)
      thread.position.set(s.x + side * offset, (startY + topY) / 2, s.z)
      thread.scale.set(1, len, 1)
      group.add(thread)
    }
  }
  return group
}

const THREAD_MESH = buildThreadMesh()
const SILHOUETTE_GROUP = buildSilhouetteGroup()

export default function FlockHangers() {
  return (
    <group>
      <primitive object={THREAD_MESH} />
      <primitive object={SILHOUETTE_GROUP} />
    </group>
  )
}
