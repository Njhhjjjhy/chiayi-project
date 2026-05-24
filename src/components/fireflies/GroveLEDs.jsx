import * as THREE from 'three'
import { buildGrove } from '../../geometry/grovePlacement.js'
import {
  GROVE_LED_COLOR, GROVE_LED_EMISSIVE_INTENSITY,
} from '../../geometry/dimensions.js'

const LED_RADIUS = 0.025
const LED_GEO = new THREE.SphereGeometry(LED_RADIUS, 8, 8)
const LED_MAT = new THREE.MeshStandardMaterial({
  color: GROVE_LED_COLOR,
  emissive: GROVE_LED_COLOR,
  emissiveIntensity: GROVE_LED_EMISSIVE_INTENSITY,
  toneMapped: false,
  roughness: 0.5,
  metalness: 0,
})

const { leds } = buildGrove()

function buildLedMesh() {
  const mesh = new THREE.InstancedMesh(LED_GEO, LED_MAT, leds.count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < leds.count; i++) {
    dummy.position.set(
      leds.positions[i * 3 + 0],
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

export default function GroveLEDs() {
  return <primitive object={LED_MESH} />
}
