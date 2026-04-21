import { useMemo } from 'react'
import { generateCurtainSegments } from './geometry.js'

// Bamboo lattice with an indigenous-weave diamond pattern.
// Layers from back to front:
//   1. Solid wood panel — covers every wall above the wainscot including
//      the transom above each door. No cream gaps anywhere.
//   2. Dense vertical back slats, edge-to-edge, hugging the panel.
//   3. Diamond lattice — two sets of 45° diagonals crossing each other.
//      Clipped to each segment rectangle. This is the "weaving" pattern.
//   4. A handful of thicker vertical bamboo poles pulled forward for depth.

const WOOD_COLOR = '#6b4f34'
const BAMBOO_COLOR = '#9aa86a'
const BAMBOO_COLOR_DARK = '#7a8a52'
const PANEL_THICKNESS = 0.04

const BACK_SPACING = 0.07
const BACK_RADIUS = 0.010
const BACK_OFFSET = PANEL_THICKNESS / 2 + BACK_RADIUS + 0.002

const DIAG_PERP_SPACING = 0.42     // perpendicular distance between diagonals
const DIAG_RADIUS = 0.020
const DIAG_OFFSET = BACK_OFFSET + 0.035

const POLE_SPACING = 0.72
const POLE_RADIUS = 0.032
const POLE_OFFSET = DIAG_OFFSET + 0.05

// Clip line v = u + k, u ∈ [-w/2, w/2], v ∈ [-h/2, h/2].
// Returns null or { uMin, uMax, vMin, vMax, length }.
function clipSlashDiagonal(k, w, h) {
  const uMin = Math.max(-w / 2, -h / 2 - k)
  const uMax = Math.min(w / 2, h / 2 - k)
  if (uMax <= uMin) return null
  return { uMin, uMax, vMin: uMin + k, vMax: uMax + k, length: Math.sqrt(2) * (uMax - uMin) }
}

// Clip line v = -u + k.
function clipBackslashDiagonal(k, w, h) {
  const uMin = Math.max(-w / 2, k - h / 2)
  const uMax = Math.min(w / 2, k + h / 2)
  if (uMax <= uMin) return null
  return { uMin, uMax, vMin: -uMin + k, vMax: -uMax + k, length: Math.sqrt(2) * (uMax - uMin) }
}

export default function BambooLattice() {
  const segments = useMemo(() => generateCurtainSegments(), [])

  return (
    <group>
      {segments.map((s, si) => {
        const panelArgs = s.normalAxis === 'z'
          ? [s.w, s.h, PANEL_THICKNESS]
          : [PANEL_THICKNESS, s.h, s.w]

        // Back layer verticals (edge-to-edge, no gaps).
        const backCount = Math.max(2, Math.ceil(s.w / BACK_SPACING))
        const backOffsets = []
        for (let i = 0; i <= backCount; i++) {
          backOffsets.push(-s.w / 2 + (i / backCount) * s.w)
        }

        // Diamond lattice diagonals. k spacing in line space = √2 × perpendicular.
        const kStep = Math.SQRT2 * DIAG_PERP_SPACING
        const kRange = (s.w + s.h) / 2
        const diagonals = []
        for (let k = -kRange; k <= kRange; k += kStep) {
          const sl = clipSlashDiagonal(k, s.w, s.h)
          if (sl) {
            diagonals.push({
              kind: 'slash',
              midU: (sl.uMin + sl.uMax) / 2,
              midV: (sl.vMin + sl.vMax) / 2,
              length: sl.length,
            })
          }
          const bs = clipBackslashDiagonal(k, s.w, s.h)
          if (bs) {
            diagonals.push({
              kind: 'back',
              midU: (bs.uMin + bs.uMax) / 2,
              midV: (bs.vMin + bs.vMax) / 2,
              length: bs.length,
            })
          }
        }

        // Thicker vertical poles for depth.
        const poleCount = Math.max(2, Math.floor(s.w / POLE_SPACING))
        const poleOffsets = []
        for (let i = 0; i <= poleCount; i++) {
          poleOffsets.push(-s.w / 2 + (i / poleCount) * s.w)
        }

        // Rotation helper: map (slash/back, normalAxis) to cylinder rotation.
        function diagRotation(kind) {
          if (s.normalAxis === 'z') {
            return kind === 'slash' ? [0, 0, Math.PI / 4] : [0, 0, -Math.PI / 4]
          }
          return kind === 'slash' ? [Math.PI / 4, 0, 0] : [-Math.PI / 4, 0, 0]
        }

        return (
          <group key={`seg-${si}`}>
            <mesh position={[s.x, s.y, s.z]} receiveShadow>
              <boxGeometry args={panelArgs} />
              <meshStandardMaterial color={WOOD_COLOR} roughness={0.85} metalness={0} />
            </mesh>

            {backOffsets.map((off, vi) => {
              const pos = s.normalAxis === 'z'
                ? [s.x + off, s.y, s.z + s.normalSign * BACK_OFFSET]
                : [s.x + s.normalSign * BACK_OFFSET, s.y, s.z + off]
              return (
                <mesh key={`b-${vi}`} position={pos}>
                  <cylinderGeometry args={[BACK_RADIUS, BACK_RADIUS, s.h, 6]} />
                  <meshStandardMaterial color={BAMBOO_COLOR_DARK} roughness={0.8} metalness={0} />
                </mesh>
              )
            })}

            {diagonals.map((d, di) => {
              const pos = s.normalAxis === 'z'
                ? [s.x + d.midU, s.y + d.midV, s.z + s.normalSign * DIAG_OFFSET]
                : [s.x + s.normalSign * DIAG_OFFSET, s.y + d.midV, s.z + d.midU]
              return (
                <mesh
                  key={`d-${di}`}
                  position={pos}
                  rotation={diagRotation(d.kind)}
                >
                  <cylinderGeometry args={[DIAG_RADIUS, DIAG_RADIUS, d.length, 8]} />
                  <meshStandardMaterial color={BAMBOO_COLOR} roughness={0.7} metalness={0} />
                </mesh>
              )
            })}

            {poleOffsets.map((off, pi) => {
              const pos = s.normalAxis === 'z'
                ? [s.x + off, s.y, s.z + s.normalSign * POLE_OFFSET]
                : [s.x + s.normalSign * POLE_OFFSET, s.y, s.z + off]
              return (
                <mesh key={`p-${pi}`} position={pos}>
                  <cylinderGeometry args={[POLE_RADIUS, POLE_RADIUS, s.h, 10]} />
                  <meshStandardMaterial color={BAMBOO_COLOR} roughness={0.7} metalness={0} />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}
