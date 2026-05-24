import * as THREE from 'three'
import { buildFlock } from '../../geometry/flockPlacement.js'
import { FLOCK_LED_EMISSIVE_INTENSITY } from '../../geometry/dimensions.js'

const LED_RADIUS = 0.025
const LED_COLOR = '#00ff00'

const LED_GEO = new THREE.SphereGeometry(LED_RADIUS, 8, 8)
const LED_MAT = new THREE.MeshStandardMaterial({
  color: LED_COLOR,
  emissive: LED_COLOR,
  emissiveIntensity: FLOCK_LED_EMISSIVE_INTENSITY,
  toneMapped: false,
  roughness: 0.5,
  metalness: 0,
})

const { leds } = buildFlock()

function buildLedMesh() {
  const mesh = new THREE.InstancedMesh(LED_GEO, LED_MAT, leds.count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < leds.count; i++) {
    dummy.position.set(
      leds.positions[i * 3],
      leds.positions[i * 3 + 1],
      leds.positions[i * 3 + 2],
    )
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

const LED_MESH = buildLedMesh()

export default function FlockLEDs() {
  return <primitive object={LED_MESH} />
}
