import { useMemo } from 'react'
import * as THREE from 'three'
import {
  ROOM,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  COLUMN_X,
  PATHWAY_LED_HEIGHT, PATHWAY_LED_COLOR, PATHWAY_LED_INTENSITY,
  PATHWAY_STRIP_THICKNESS,
  PATHWAY_ARROW_LENGTH, PATHWAY_ARROW_WIDTH, PATHWAY_ARROW_COLOR,
} from '../../geometry/dimensions.js'

// Pathway lighting — always on, no switcher (designer decision 6 June
// 2026):
//
//   strips  thin continuous warm strips along the four pathway floor
//           edges (part of the pathway in both concept images). These
//           are the LED fixtures.
//   arrows  three painted arrows on the floor at the route's decision
//           points. Paint only — no fixtures are installed for them;
//           they read by the pathway's existing light.
//
// The four pathway floor edges (strip runs):
//   1. along `back-wall`              X = 0,    Z = 0    → Z = ROOM.D
//   2. along `window-wall`            Z = ROOM.D, X = 0  → X = COLUMN_X
//   3. pathway-side of `pathway-partition-vertical`   X = ENTRY_GAP_WIDTH, Z = 0 → PATHWAY_PARTITION_Z
//   4. pathway-side of `pathway-partition-horizontal` Z = PATHWAY_PARTITION_Z, X = ENTRY_GAP_WIDTH → COLUMN_X
//
// Surface-flush rule: strip runs are offset SURFACE_NUDGE + half-
// thickness inward from each surface.

const SURFACE_NUDGE = 0.008                      // 8 mm inward

// Strip runs at the correct inward-nudged position for the cross-
// section thickness.
function makeEdgeRuns(thickness) {
  const inward = SURFACE_NUDGE + thickness / 2
  return [
    { label: 'back-wall',                     axis: 'z', fixed: 0 + inward,                   from: 0,                to: ROOM.D },
    { label: 'window-wall',                   axis: 'x', fixed: ROOM.D - inward,              from: 0,                to: COLUMN_X },
    { label: 'pathway-partition-vertical',    axis: 'z', fixed: ENTRY_GAP_WIDTH - inward,     from: 0,                to: PATHWAY_PARTITION_Z },
    { label: 'pathway-partition-horizontal',  axis: 'x', fixed: PATHWAY_PARTITION_Z + inward, from: ENTRY_GAP_WIDTH,  to: COLUMN_X },
  ]
}

function StripRun({ run, thickness, material }) {
  const length = run.to - run.from
  const centerAlong = (run.from + run.to) / 2
  const position = run.axis === 'z'
    ? [run.fixed, PATHWAY_LED_HEIGHT, centerAlong]
    : [centerAlong, PATHWAY_LED_HEIGHT, run.fixed]
  const args = run.axis === 'z'
    ? [thickness, thickness, length]
    : [length, thickness, thickness]
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial {...material} />
    </mesh>
  )
}

// Arrow shape — built once and reused for all three arrows. Tip points
// in shape-local -Y; after the mesh's [-PI/2, 0, 0] rotation the tip
// lands at group-local +Z. The outer group's Y-rotation then turns the
// tip to its final world direction:
//   rotY = 0       → tip +Z
//   rotY = +PI/2   → tip +X
//   rotY = PI      → tip -Z
//   rotY = -PI/2   → tip -X
function buildArrowShape() {
  const halfL = PATHWAY_ARROW_LENGTH / 2          // 0.30
  const halfW = PATHWAY_ARROW_WIDTH / 2           // 0.15
  const shaftHalfW = halfW / 2                    // 0.075
  const headStartY = -halfL + PATHWAY_ARROW_LENGTH / 3   // -0.10 — front 1/3 is the arrowhead

  const s = new THREE.Shape()
  s.moveTo(0, -halfL)                             // tip
  s.lineTo(+halfW, headStartY)                    // head corner +
  s.lineTo(+shaftHalfW, headStartY)               // step in
  s.lineTo(+shaftHalfW, +halfL)                   // shaft tail +
  s.lineTo(-shaftHalfW, +halfL)                   // shaft tail -
  s.lineTo(-shaftHalfW, headStartY)               // step out
  s.lineTo(-halfW, headStartY)                    // head corner -
  s.closePath()
  return s
}

// One painted arrow on the floor mats (no emission — paint, not LED).
const ARROW_Y = 0.008 // 8 mm above floor (paint sits on the foam)

// The bloom pass halos anything rendering above luminance 1.0 — that's
// how the LEDs glow. The verification lights are overbright (ambient
// 2.4 + two directionals ≈ 4× irradiance on the floor), so full-albedo
// white paint crossed the bloom threshold and haloed like an emitter.
// Scaling the paint's reflectance keeps its rendered luminance just
// under 1.0 at default brightness: it still reads white (the white
// outside ground renders at exactly 1.0) but never blooms, and it
// still dims with the room through the evening like real paint.
const ARROW_REFLECTANCE = 0.24
const ARROW_PAINT = new THREE.Color(PATHWAY_ARROW_COLOR).multiplyScalar(ARROW_REFLECTANCE)

function PaintedArrow({ x, z, rotY, shape }) {
  return (
    <group position={[x, ARROW_Y, z]} rotation={[0, rotY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color={ARROW_PAINT}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

// Three arrows at the pathway's three decision points. Tip directions
// follow the one-way visitor route: enter → walk +Z down the vertical
// leg → turn +X at the corner onto the horizontal leg → continue +X
// toward the forest entry.
const ARROW_PLACEMENTS = [
  // 1. Entry: just inside the entry gap, pointing down the vertical leg.
  { x: 0.75, z: 0.6, rotY: 0 },            // tip +Z
  // 2. Corner: inside the L corner, turning the visitor onto the horizontal leg.
  { x: 0.75, z: 7.6, rotY: Math.PI / 2 },  // tip +X
  // 3. Forest entry: just before the forest opening at X = 6.43.
  { x: 5.5,  z: 7.9, rotY: Math.PI / 2 },  // tip +X
]

export default function PathwayEdgeLights() {
  const arrowShape = useMemo(() => buildArrowShape(), [])
  const runs = makeEdgeRuns(PATHWAY_STRIP_THICKNESS)
  const stripMaterial = {
    color: PATHWAY_LED_COLOR,
    emissive: PATHWAY_LED_COLOR,
    emissiveIntensity: PATHWAY_LED_INTENSITY,
    roughness: 0.6,
    metalness: 0,
  }
  return (
    <group>
      {runs.map((run) => (
        <StripRun
          key={run.label}
          run={run}
          thickness={PATHWAY_STRIP_THICKNESS}
          material={stripMaterial}
        />
      ))}
      {ARROW_PLACEMENTS.map((a, i) => (
        <PaintedArrow key={i} x={a.x} z={a.z} rotY={a.rotY} shape={arrowShape} />
      ))}
    </group>
  )
}
