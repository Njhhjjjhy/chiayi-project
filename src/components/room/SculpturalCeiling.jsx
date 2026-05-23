import * as THREE from 'three'
import {
  ROOM,
  CEILING_FORM_COLOR, CEILING_FORM_ROUGHNESS, CEILING_FORM_EMISSIVE_INTENSITY,
  CEILING_VARIANT_DEFAULT,
} from '../../geometry/dimensions.js'
import { buildCeiling } from '../../geometry/ceilingForms.js'

// Sculptural ceiling — variant-aware (slice 9). Three vocabularies
// share one renderer:
//   ellipsoid forms  rendered via shared unit-sphere geometry, scaled
//                    per-form to the form's halfExtents.
//   box forms        rendered via shared unit-box geometry, scaled
//                    per-form to the form's halfExtents (thin Y slab).
//
// Cable anchors derive from form.halfExtents.y (top of form) and
// form.halfExtents.x (horizontal offset) so both kinds get correctly-
// proportioned suspension cables.

const FORM_MATERIAL = {
  color: CEILING_FORM_COLOR,
  emissive: CEILING_FORM_COLOR,
  emissiveIntensity: CEILING_FORM_EMISSIVE_INTENSITY,
  roughness: CEILING_FORM_ROUGHNESS,
  metalness: 0,
}

const CABLE_MATERIAL = {
  color: '#222222',
  emissive: '#222222',
  emissiveIntensity: 0.05,
  roughness: 0.6,
  metalness: 0.3,
}
const CABLE_RADIUS = 0.003

// Module-scoped shared geometries — one allocation, scaled per-form.
const SHARED_SPHERE_GEO = new THREE.SphereGeometry(1, 16, 12)
const SHARED_BOX_GEO = new THREE.BoxGeometry(1, 1, 1)

function Form({ form }) {
  const geo = form.kind === 'box' ? SHARED_BOX_GEO : SHARED_SPHERE_GEO
  const { x: hx, y: hy, z: hz } = form.halfExtents
  // Sphere geometry has radius 1 (full extent 2), box has full extent 1.
  // Scale half-extents accordingly so both kinds end up at the correct
  // world size.
  const sx = form.kind === 'box' ? hx * 2 : hx
  const sy = form.kind === 'box' ? hy * 2 : hy
  const sz = form.kind === 'box' ? hz * 2 : hz

  return (
    <group position={[form.x, form.y, form.z]}>
      <group rotation={[form.tiltX, form.rotY, form.tiltZ]}>
        <mesh geometry={geo} scale={[sx, sy, sz]}>
          <meshStandardMaterial {...FORM_MATERIAL} />
        </mesh>
      </group>
    </group>
  )
}

function Cable({ form }) {
  const topY = ROOM.H_TOTAL
  const startY = form.y + form.halfExtents.y
  const len = Math.max(0.05, topY - startY)
  const midY = (startY + topY) / 2
  // Horizontal offset uses the form's actual X half-extent so cables
  // sit on the top face of boxes and on the upper-X side of ellipsoids
  // without overshooting.
  const offset = Math.min(form.halfExtents.x * 0.7, 0.4)
  const sY = Math.sin(form.rotY), cY = Math.cos(form.rotY)
  const dx = offset * cY
  const dz = -offset * sY
  return (
    <group>
      <mesh position={[form.x + dx, midY, form.z + dz]}>
        <cylinderGeometry args={[CABLE_RADIUS, CABLE_RADIUS, len, 6]} />
        <meshStandardMaterial {...CABLE_MATERIAL} />
      </mesh>
      <mesh position={[form.x - dx, midY, form.z - dz]}>
        <cylinderGeometry args={[CABLE_RADIUS, CABLE_RADIUS, len, 6]} />
        <meshStandardMaterial {...CABLE_MATERIAL} />
      </mesh>
    </group>
  )
}

export default function SculpturalCeiling({ variant = CEILING_VARIANT_DEFAULT }) {
  const { forms } = buildCeiling(variant)

  return (
    <group>
      {forms.map((form, i) => (
        <Form key={i} form={form} />
      ))}
      {forms.map((form, i) => (
        <Cable key={`c${i}`} form={form} />
      ))}
    </group>
  )
}
