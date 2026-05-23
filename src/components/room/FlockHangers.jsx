import * as THREE from 'three'
import { buildFlock } from '../../geometry/flockPlacement.js'
import {
  ROOM,
  FLOCK_THREAD_RADIUS, FLOCK_THREAD_COLOR, FLOCK_THREAD_EMISSIVE_INTENSITY,
} from '../../geometry/dimensions.js'

const THREAD_GEO = new THREE.CylinderGeometry(FLOCK_THREAD_RADIUS, FLOCK_THREAD_RADIUS, 1, 4)
const THREAD_MAT = new THREE.MeshStandardMaterial({
  color: FLOCK_THREAD_COLOR,
  emissive: FLOCK_THREAD_COLOR,
  emissiveIntensity: FLOCK_THREAD_EMISSIVE_INTENSITY,
  roughness: 0.6,
  metalness: 0,
})

const { modules } = buildFlock()

function buildThreadMesh() {
  const mesh = new THREE.InstancedMesh(THREAD_GEO, THREAD_MAT, modules.length)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]
    const threadLen = ROOM.H - mod.y
    dummy.position.set(mod.x, (ROOM.H + mod.y) / 2, mod.z)
    dummy.scale.set(1, threadLen, 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

const THREAD_MESH = buildThreadMesh()

export default function FlockHangers() {
  return <primitive object={THREAD_MESH} />
}
