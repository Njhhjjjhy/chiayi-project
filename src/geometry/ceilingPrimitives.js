import {
  CEILING_FORM_PRIMITIVES, CEILING_FORM_PRIMITIVE_WEIGHTS,
  CEILING_FORM_MIN_SIZE, CEILING_FORM_MAX_SIZE,
  CEILING_DISC_PRIMITIVES, CEILING_DISC_PRIMITIVE_WEIGHTS,
  CEILING_DISC_SMALL_MIN, CEILING_DISC_SMALL_MAX,
  CEILING_DISC_MEDIUM_MIN, CEILING_DISC_MEDIUM_MAX,
  CEILING_DISC_LARGE_MIN, CEILING_DISC_LARGE_MAX,
  CEILING_DISC_THICKNESS, CEILING_DISC_THICKNESS_LARGE,
  CEILING_MODULE_RADIUS, CEILING_LED_MIN_GAP,
} from './dimensions.js'

// Ceiling form vocabularies.
//
// Two kinds of primitive share one form-object shape:
//   ellipsoid   ovoid, blade, lens, pod, patch     (slice 7 vocab)
//   disc        small/medium/large-disc            (concept images
//               07 / 09 / 10 / 13 — flat rounded plates; canonical
//               doc 11. Replaced the earlier flat-square vocab.)
//
// Form shape (locked across kinds):
//   { primitive, kind, size, halfExtents: {x, y, z},
//     x, y, z, tiltX, tiltZ, rotY }
//
// `size` is the longest horizontal edge in metres. `halfExtents` carries
// the per-primitive geometry so the renderer doesn't need to re-derive
// it. For ellipsoid forms `size` equals the X full extent; for discs
// it's the diameter.

const ELLIPSOID_SCALES = {
  ovoid: { y: 0.4,  z: 0.5 },
  blade: { y: 0.25, z: 0.2 },
  lens:  { y: 0.2,  z: 0.8 },
  pod:   { y: 0.7,  z: 0.7 },
  patch: { y: 0.15, z: 0.9 },
}

const DISC_SCALES = {
  'small-disc':  { thickness: CEILING_DISC_THICKNESS },
  'medium-disc': { thickness: CEILING_DISC_THICKNESS },
  'large-disc':  { thickness: CEILING_DISC_THICKNESS_LARGE },
}

const ELLIPSOID_SET = new Set(Object.keys(ELLIPSOID_SCALES))
const DISC_SET = new Set(Object.keys(DISC_SCALES))

export function getPrimitiveKind(primitive) {
  if (ELLIPSOID_SET.has(primitive)) return 'ellipsoid'
  if (DISC_SET.has(primitive)) return 'disc'
  return 'ellipsoid'
}

// Returns { x, y, z } half-extents in metres for a form of the given
// primitive at the given size. Renderer uses this directly as mesh
// scale on a unit sphere or unit cylinder.
export function getPrimitiveHalfExtents(primitive, size) {
  if (ELLIPSOID_SET.has(primitive)) {
    const s = ELLIPSOID_SCALES[primitive]
    return {
      x: size / 2,
      y: (size * s.y) / 2,
      z: (size * s.z) / 2,
    }
  }
  const s = DISC_SCALES[primitive] || DISC_SCALES['small-disc']
  return {
    x: size / 2,
    y: s.thickness / 2,
    z: size / 2,
  }
}

// Returns the size in metres for the primitive. Disc primitives have
// per-class diameter bands (small / medium / large). Oblong primitives
// all share the slice 7 power-curve skew toward smaller.
export function sampleSize(rng, primitive) {
  switch (primitive) {
    case 'small-disc':
      return CEILING_DISC_SMALL_MIN + rng() * (CEILING_DISC_SMALL_MAX - CEILING_DISC_SMALL_MIN)
    case 'medium-disc':
      return CEILING_DISC_MEDIUM_MIN + rng() * (CEILING_DISC_MEDIUM_MAX - CEILING_DISC_MEDIUM_MIN)
    case 'large-disc':
      return CEILING_DISC_LARGE_MIN + rng() * (CEILING_DISC_LARGE_MAX - CEILING_DISC_LARGE_MIN)
    default: {
      const t = Math.pow(rng(), 2.2)
      return CEILING_FORM_MIN_SIZE + t * (CEILING_FORM_MAX_SIZE - CEILING_FORM_MIN_SIZE)
    }
  }
}

// Mixed-variant target distribution: 20 discs + 20 oblong. Pre-built so
// the picker just shuffles a copy each call. Sub-primitive counts match
// the dedicated-variant weights scaled to the 20-form half.
const MIXED_TARGET = [
  ...Array(6).fill('small-disc'),
  ...Array(9).fill('medium-disc'),
  ...Array(5).fill('large-disc'),
  ...Array(12).fill('ovoid'),
  ...Array(4).fill('blade'),
  ...Array(2).fill('lens'),
  ...Array(1).fill('pod'),
  ...Array(1).fill('patch'),
]

// Returns a picker function. Each call returns
//   { primitive, kind, commit() }
// where `commit()` advances any per-pick state (only the mixed queue
// uses this). Caller must invoke `commit()` if the candidate passes all
// rejection checks; if a placement is rejected the caller skips commit
// and the next call returns the same queue entry. This guarantees the
// mixed variant lands exactly 20 discs + 20 oblong even when individual
// placements get rejected by Poisson / envelope / exclusion checks.
//
// For 'discs' and 'oblong' the picker is a weighted lottery — `commit`
// is a no-op because there is no queue state to advance.
const NOOP = () => {}

export function makePrimitivePicker(variant, rng) {
  if (variant === 'mixed') {
    const queue = MIXED_TARGET.slice()
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[queue[i], queue[j]] = [queue[j], queue[i]]
    }
    let idx = 0
    return () => {
      const primitive = queue[idx % queue.length]
      return {
        primitive,
        kind: getPrimitiveKind(primitive),
        commit: () => { idx++ },
      }
    }
  }
  const primitives = variant === 'discs' ? CEILING_DISC_PRIMITIVES : CEILING_FORM_PRIMITIVES
  const weights = variant === 'discs' ? CEILING_DISC_PRIMITIVE_WEIGHTS : CEILING_FORM_PRIMITIVE_WEIGHTS
  return () => {
    const r = rng()
    let acc = 0
    for (let i = 0; i < primitives.length; i++) {
      acc += weights[i]
      if (r < acc) {
        const primitive = primitives[i]
        return { primitive, kind: getPrimitiveKind(primitive), commit: NOOP }
      }
    }
    const fallback = primitives[primitives.length - 1]
    return { primitive: fallback, kind: getPrimitiveKind(fallback), commit: NOOP }
  }
}

// Sample a point on the form's lower surface in form-local space.
//
//   anchor = null   free sample.
//   anchor = ref    sample near the previous anchor, with kind-
//                    appropriate jitter (angular for ellipsoid, metric
//                    disc for disc faces). `ref` is opaque — pass back
//                    the `anchor` field from a previous return value.
//
// For ellipsoid: ref = { theta, phi }. Jitter is
//   angularSpread = min(0.9, CEILING_MODULE_RADIUS / max(0.2, size/2)).
//
// For disc: ref = { lx, lz }. Jitter is a uniform disc of radius
//   CEILING_MODULE_RADIUS in form-local XZ, clamped to the bottom
//   circular face.
export function sampleLowerSurfacePoint(rng, primitive, size, anchor = null) {
  const half = getPrimitiveHalfExtents(primitive, size)
  if (ELLIPSOID_SET.has(primitive)) {
    let theta, phi
    if (anchor) {
      const spread = Math.min(0.9, CEILING_MODULE_RADIUS / Math.max(0.2, size / 2))
      theta = anchor.theta + (rng() - 0.5) * 2 * spread
      phi = anchor.phi + (rng() - 0.5) * 2 * spread
      if (theta < Math.PI / 2) theta = Math.PI / 2 + (Math.PI / 2 - theta)
      if (theta > Math.PI) theta = Math.PI - (theta - Math.PI)
    } else {
      theta = (Math.PI / 2) + rng() * (Math.PI / 2)
      phi = rng() * Math.PI * 2
    }
    const lx = half.x * Math.sin(theta) * Math.cos(phi)
    const ly = half.y * Math.cos(theta)
    const lz = half.z * Math.sin(theta) * Math.sin(phi)
    return { local: [lx, ly, lz], anchor: { theta, phi } }
  }
  // disc — bottom circular face of radius half.x
  let lx, lz
  if (anchor) {
    const r = Math.sqrt(rng()) * CEILING_MODULE_RADIUS
    const a = rng() * Math.PI * 2
    lx = anchor.lx + Math.cos(a) * r
    lz = anchor.lz + Math.sin(a) * r
    // Clamp back inside the circle, preserving direction from centre.
    const d = Math.sqrt(lx * lx + lz * lz)
    if (d > half.x) {
      lx = (lx / d) * half.x
      lz = (lz / d) * half.x
    }
  } else {
    const r = Math.sqrt(rng()) * half.x
    const a = rng() * Math.PI * 2
    lx = Math.cos(a) * r
    lz = Math.sin(a) * r
  }
  const ly = -half.y
  return { local: [lx, ly, lz], anchor: { lx, lz } }
}

// Returns true if two anchors on the same form are within the LED
// minimum-gap distance. Threshold is shared (CEILING_LED_MIN_GAP) but
// the metric differs by kind: radians on ellipsoid, metres on disc.
export function anchorsTooClose(primitive, a, b) {
  if (ELLIPSOID_SET.has(primitive)) {
    const dt = a.theta - b.theta
    const dp = a.phi - b.phi
    return dt * dt + dp * dp < CEILING_LED_MIN_GAP * CEILING_LED_MIN_GAP
  }
  const dx = a.lx - b.lx
  const dz = a.lz - b.lz
  return dx * dx + dz * dz < CEILING_LED_MIN_GAP * CEILING_LED_MIN_GAP
}
