import * as THREE from 'three'
import { buildNesting } from '../../geometry/nestingPlacement.js'
import {
  NESTING_LED_COLOR,
  NESTING_LED_EMISSIVE_INTENSITY,
} from '../../geometry/dimensions.js'

// Static green LEDs set into the pebble undersides (concept image 09).
// The full 1,760-LED population for the nesting proposal lives here.
const LED_RADIUS = 0.025
const LED_GEO = new THREE.SphereGeometry(LED_RADIUS, 8, 8)
const LED_MAT = new THREE.MeshStandardMaterial({
  color: NESTING_LED_COLOR,
  emissive: NESTING_LED_COLOR,
  emissiveIntensity: NESTING_LED_EMISSIVE_INTENSITY,
  toneMapped: false,
  roughness: 0.5,
  metalness: 0,
})

const { leds } = buildNesting()

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

export default function NestingLEDs() {
  return <primitive object={LED_MESH} />
}
