import * as THREE from 'three'
import { buildCeiling } from '../../geometry/ceilingForms.js'
import { CEILING_VARIANTS, CEILING_VARIANT_DEFAULT } from '../../geometry/dimensions.js'

// Static green LED population for the sculptural ceiling — variant-
// aware (slice 9). One InstancedMesh per variant is built eagerly at
// module load (cheap — three meshes of 1,760 instances each); the
// component renders the InstancedMesh matching the active variant.
//
// hideLeds: when an animated firefly variant is active the FireflySystem
// renders the same population, and CeilingLEDs hides itself so the two
// don't double up.

const LED_RADIUS = 0.025
const LED_COLOR = '#00ff00'
const LED_EMISSIVE_INTENSITY = 5

const SHARED_LED_GEO = new THREE.SphereGeometry(LED_RADIUS, 8, 8)
const SHARED_LED_MATERIAL = new THREE.MeshStandardMaterial({
  color: LED_COLOR,
  emissive: LED_COLOR,
  emissiveIntensity: LED_EMISSIVE_INTENSITY,
  toneMapped: false,
  roughness: 0.5,
  metalness: 0,
})

function buildInstancedMesh(variant) {
  const { leds } = buildCeiling(variant)
  const m = new THREE.InstancedMesh(SHARED_LED_GEO, SHARED_LED_MATERIAL, leds.count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < leds.count; i++) {
    dummy.position.set(
      leds.positions[i * 3 + 0],
      leds.positions[i * 3 + 1],
      leds.positions[i * 3 + 2],
    )
    dummy.updateMatrix()
    m.setMatrixAt(i, dummy.matrix)
  }
  m.instanceMatrix.needsUpdate = true
  m.frustumCulled = false
  return m
}

// Build all three variants up front. Each is deterministic, the cost is
// negligible (3 × 1,760 instances) and switching variants at runtime
// becomes a pure object swap.
const INSTANCED_MESH_BY_VARIANT = Object.fromEntries(
  CEILING_VARIANTS.map((v) => [v, buildInstancedMesh(v)]),
)

export default function CeilingLEDs({ hideLeds = false, variant = CEILING_VARIANT_DEFAULT }) {
  if (hideLeds) return null
  const mesh = INSTANCED_MESH_BY_VARIANT[variant] || INSTANCED_MESH_BY_VARIANT[CEILING_VARIANT_DEFAULT]
  return <primitive object={mesh} />
}
