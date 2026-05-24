import { useLayoutEffect } from 'react'
import * as THREE from 'three'
import { buildCeiling } from '../../geometry/ceilingForms.js'
import {
  CEILING_VARIANTS, CEILING_VARIANT_DEFAULT,
  NESTING_HYBRID_LED_TOTAL_CEILING,
} from '../../geometry/dimensions.js'

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

// Build an instance-slot order so that the first
// NESTING_HYBRID_LED_TOTAL_CEILING slots hold an evenly-distributed
// subset of the full Poisson-disc array, and the remaining slots hold
// the leftover positions. With a fractional stride of total / hybrid
// (≈ 1.176 for 1760 → 1496), src indices are picked as
// floor(i * total / hybrid) for i in [0, hybrid), guaranteeing 1,496
// distinct indices spread across the full 0..total-1 range. Non-hybrid
// renders use all `total` slots so the visual is identical regardless
// of order; hybrid renders set mesh.count = hybrid and get the
// interleaved subset for free.
function buildInterleavedOrder(total, hybrid) {
  const order = new Array(total)
  const used = new Uint8Array(total)
  for (let i = 0; i < hybrid; i++) {
    const src = Math.floor((i * total) / hybrid)
    order[i] = src
    used[src] = 1
  }
  let next = hybrid
  for (let i = 0; i < total; i++) {
    if (!used[i]) order[next++] = i
  }
  return order
}

function buildInstancedMesh(variant) {
  const { leds } = buildCeiling(variant)
  const order = buildInterleavedOrder(leds.count, NESTING_HYBRID_LED_TOTAL_CEILING)
  const m = new THREE.InstancedMesh(SHARED_LED_GEO, SHARED_LED_MATERIAL, leds.count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < leds.count; i++) {
    const src = order[i]
    dummy.position.set(
      leds.positions[src * 3 + 0],
      leds.positions[src * 3 + 1],
      leds.positions[src * 3 + 2],
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
//
// userData.fullCount preserves the original instance count so the
// nesting-hybrid render-time slice can fall back to the full population
// for non-hybrid variants without needing a separate cache.
const INSTANCED_MESH_BY_VARIANT = Object.fromEntries(
  CEILING_VARIANTS.map((v) => {
    const m = buildInstancedMesh(v)
    m.userData.fullCount = m.count
    return [v, m]
  }),
)

export default function CeilingLEDs({ hideLeds = false, variant = CEILING_VARIANT_DEFAULT, ledCount = null }) {
  const mesh = INSTANCED_MESH_BY_VARIANT[variant] || INSTANCED_MESH_BY_VARIANT[CEILING_VARIANT_DEFAULT]
  // Render-time slice: when ledCount is set the InstancedMesh renders
  // only the first N instances. The cached instance buffer is left
  // untouched; only the render count changes. The hybrid nesting
  // variant uses this to render 1,496 instead of the full 1,760.
  // Layout-effect timing keeps the count correct before the next r3f
  // frame paints, avoiding a one-frame flicker on variant switch.
  useLayoutEffect(() => {
    mesh.count = ledCount ?? mesh.userData.fullCount
  }, [mesh, ledCount])
  if (hideLeds) return null
  return <primitive object={mesh} />
}
