import { useMemo } from 'react'
import * as THREE from 'three'
import { useProposal } from '../../hooks/useProposal.js'
import { buildCeiling } from '../../geometry/ceilingForms.js'
import { CEILING_VARIANT_DEFAULT } from '../../geometry/dimensions.js'
import { makeRng } from '../../utils/parkMillerRng.js'

// Hanging branches (concept image 10) — long thin dark strands hanging
// from the undersides of the ceiling forms, tips low enough for a
// standing visitor to reach. Only rendered for proposals with
// hasBranches=true (currently fireflies-within-reach).
//
// Each ceiling form sheds a number of strands proportional to its
// diameter, anchored toward the form's rim. Strands are near-vertical
// with a small random lean so the curtain of sticks reads organic
// rather than combed. All strands render as one InstancedMesh.

const SEED = 99
const STRANDS_PER_METRE = 9        // strand count ≈ form size × this
const TIP_Y_MIN = 1.3              // lowest strand tips — within reach
const TIP_Y_MAX = 2.1
const STRAND_RADIUS = 0.004
const LEAN_MAX = 0.07              // radians off vertical
const STRAND_COLOR = '#221a12'

const STRAND_GEO = new THREE.CylinderGeometry(STRAND_RADIUS, STRAND_RADIUS * 0.6, 1, 5)
const STRAND_MAT = new THREE.MeshStandardMaterial({
  color: STRAND_COLOR,
  emissive: STRAND_COLOR,
  emissiveIntensity: 0.08,
  roughness: 0.95,
  metalness: 0,
})

function buildStrandMesh(ceilingVariant) {
  const { forms } = buildCeiling(ceilingVariant)
  const rng = makeRng(SEED)
  const euler = new THREE.Euler()
  const local = new THREE.Vector3()
  const anchor = new THREE.Vector3()
  const dummy = new THREE.Object3D()

  // First pass: generate every strand's transform.
  const strands = []
  for (const form of forms) {
    const n = Math.max(2, Math.round(form.size * STRANDS_PER_METRE))
    for (let i = 0; i < n; i++) {
      // Anchor on the form's underside, biased toward the rim — the
      // image shows strands shedding off the disc edges.
      const rr = (0.45 + 0.55 * rng())
      const a = rng() * Math.PI * 2
      local.set(
        form.halfExtents.x * rr * Math.cos(a),
        -form.halfExtents.y * 0.8,
        form.halfExtents.z * rr * Math.sin(a),
      )
      euler.set(form.tiltX, form.rotY, form.tiltZ)
      anchor.copy(local).applyEuler(euler)
      anchor.x += form.x
      anchor.y += form.y
      anchor.z += form.z

      const tipY = TIP_Y_MIN + rng() * (TIP_Y_MAX - TIP_Y_MIN)
      const length = anchor.y - tipY
      if (length < 0.3) continue

      strands.push({
        x: anchor.x,
        y: anchor.y,
        z: anchor.z,
        length,
        leanX: (rng() - 0.5) * 2 * LEAN_MAX,
        leanZ: (rng() - 0.5) * 2 * LEAN_MAX,
      })
    }
  }

  const mesh = new THREE.InstancedMesh(STRAND_GEO, STRAND_MAT, strands.length)
  for (let i = 0; i < strands.length; i++) {
    const s = strands[i]
    // Hang from the anchor: place the strand's top at the anchor and
    // let the body fall along its (slightly leaned) local -Y.
    dummy.position.set(s.x, s.y, s.z)
    dummy.rotation.set(s.leanX, 0, s.leanZ)
    dummy.scale.set(1, 1, 1)
    dummy.translateY(-s.length / 2)
    dummy.scale.set(1, s.length, 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  return mesh
}

// One strand mesh per ceiling variant, built lazily and cached for the
// page lifetime (mirrors the buildCeiling per-variant cache).
const _meshByVariant = new Map()

function getStrandMesh(ceilingVariant) {
  if (!_meshByVariant.has(ceilingVariant)) {
    _meshByVariant.set(ceilingVariant, buildStrandMesh(ceilingVariant))
  }
  return _meshByVariant.get(ceilingVariant)
}

export default function Branches({ ceilingVariant = CEILING_VARIANT_DEFAULT }) {
  const { hasBranches } = useProposal()
  const mesh = useMemo(() => getStrandMesh(ceilingVariant), [ceilingVariant])
  if (!hasBranches) return null
  return <primitive object={mesh} />
}
