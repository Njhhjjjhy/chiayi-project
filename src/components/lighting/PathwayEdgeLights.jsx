import { useMemo } from 'react'
import * as THREE from 'three'
import {
  ROOM,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  COLUMN_X,
  PATHWAY_LED_HEIGHT, PATHWAY_LED_COLOR, PATHWAY_LED_INTENSITY,
  PATHWAY_STRIP_THICKNESS,
  PATHWAY_ARROW_LENGTH, PATHWAY_ARROW_WIDTH, PATHWAY_ARROW_COLOR,
  PATHWAY_ARROW_SPOT_HEIGHT,
  PATHWAY_ARROW_SPOT_INTENSITY, PATHWAY_ARROW_SPOT_ANGLE,
  PATHWAY_POOL_COUNT, PATHWAY_POOL_RADIUS,
  PATHWAY_POOL_INTENSITY, PATHWAY_POOL_HEIGHT,
} from '../../geometry/dimensions.js'

// Wayfinding lights along the L-shaped `pathway`. Three visual
// prototypes behind one component, selected by `variant`:
//
//   'off'    renders nothing (default).
//   'strip'  thin continuous emissive box along each of the four
//            pathway floor edges.
//   'arrows' three painted floor arrows at the pathway's decision
//            points, each lit by a tight overhead spot. Arrows are
//            matte paint, not emissive — they only read when a spot
//            reaches them.
//   'pools'  six discrete overhead downlights, three per pathway leg,
//            each casting a small emissive disc on the floor.
//
// The four pathway floor edges (used by the strip variant):
//   1. along `back-wall`              X = 0,    Z = 0    → Z = ROOM.D
//   2. along `window-wall`            Z = ROOM.D, X = 0  → X = COLUMN_X
//   3. pathway-side of `pathway-partition-vertical`   X = ENTRY_GAP_WIDTH, Z = 0 → PATHWAY_PARTITION_Z
//   4. pathway-side of `pathway-partition-horizontal` Z = PATHWAY_PARTITION_Z, X = ENTRY_GAP_WIDTH → COLUMN_X
//
// Surface-flush rule: strip runs are offset SURFACE_NUDGE + half-
// thickness inward from each surface. Arrow meshes sit ARROW_Y above
// the floor. Inward direction depends on which side of the surface the
// pathway sits on.

const SURFACE_NUDGE = 0.008                      // 8 mm inward
const ARROW_Y = 0.008                            // 8 mm above floor (paint sits on the foam)
const ARROW_SPOT_PENUMBRA = 0.3                  // soft cone edge
const ARROW_SPOT_DECAY = 1                       // gentler than physical 2 so 3.4 m reach reads
const ARROW_SPOT_DISTANCE = 5                    // cutoff just past floor

// Strip-only — pathway floor-edge runs at the correct inward-nudged
// position for the given cross-section thickness.
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
// lands at world +Z. The outer group's Y-rotation then turns the tip
// to its final world direction (rotY = 0 → +Z, rotY = -PI/2 → +X, etc.).
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

function FloorArrow({ x, z, rotY, shape }) {
  // Per-arrow spot target as a tiny Object3D positioned directly below
  // the fixture. The spot's target prop is wired to this object.
  const target = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(x, 0, z)
    return obj
  }, [x, z])

  return (
    <group>
      {/* Painted arrow on the floor (no emission — paint, not LED) */}
      <group position={[x, ARROW_Y, z]} rotation={[0, rotY, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial
            color={PATHWAY_ARROW_COLOR}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      </group>
      {/* Spot target — must live in the scene graph for spotLight.target to work */}
      <primitive object={target} />
      {/* Overhead spot — straight down onto the arrow */}
      <spotLight
        position={[x, PATHWAY_ARROW_SPOT_HEIGHT, z]}
        target={target}
        color={PATHWAY_LED_COLOR}
        intensity={PATHWAY_ARROW_SPOT_INTENSITY}
        angle={PATHWAY_ARROW_SPOT_ANGLE}
        penumbra={ARROW_SPOT_PENUMBRA}
        decay={ARROW_SPOT_DECAY}
        distance={ARROW_SPOT_DISTANCE}
        castShadow={false}
      />
    </group>
  )
}

// Three arrows at the pathway's three decision points. Tip directions
// follow the one-way visitor route: enter → walk +Z → turn +X at the
// corner → continue +X through the forest entry.
const ARROW_PLACEMENTS = [
  // 1. Entry: just inside the entry gap, pointing into the vertical leg.
  { x: 0.75, z: 0.6, rotY: 0 },           // tip +Z
  // 2. Corner: inside the L corner, turning the visitor onto the horizontal leg.
  { x: 0.75, z: 7.6, rotY: -Math.PI / 2 }, // tip +X
  // 3. Forest entry: just before the forest opening at X = 6.43.
  { x: 5.5,  z: 7.9, rotY: -Math.PI / 2 }, // tip +X
]

// Pool variant (unchanged from prior tuning).
function makePoolPositions() {
  const perLeg = PATHWAY_POOL_COUNT / 2
  const positions = []
  const verticalX = ENTRY_GAP_WIDTH / 2
  for (let i = 0; i < perLeg; i++) {
    const t = (i + 0.5) / perLeg
    positions.push([verticalX, t * ROOM.D])
  }
  const horizontalZ = (PATHWAY_PARTITION_Z + ROOM.D) / 2
  for (let i = 0; i < perLeg; i++) {
    const t = (i + 0.5) / perLeg
    positions.push([t * COLUMN_X, horizontalZ])
  }
  return positions
}

const POOL_DISC_Y = 0.003
const POOL_FIXTURE_RADIUS = 0.04
const POOL_FIXTURE_HEIGHT = 0.06

function PoolSpot({ x, z }) {
  return (
    <group>
      <mesh position={[x, POOL_DISC_Y, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[PATHWAY_POOL_RADIUS, 32]} />
        <meshStandardMaterial
          color={PATHWAY_LED_COLOR}
          emissive={PATHWAY_LED_COLOR}
          emissiveIntensity={PATHWAY_POOL_INTENSITY}
          roughness={1.0}
          metalness={0}
        />
      </mesh>
      <mesh position={[x, PATHWAY_POOL_HEIGHT, z]}>
        <cylinderGeometry
          args={[POOL_FIXTURE_RADIUS, POOL_FIXTURE_RADIUS, POOL_FIXTURE_HEIGHT, 12]}
        />
        <meshStandardMaterial
          color="#111111"
          emissive={PATHWAY_LED_COLOR}
          emissiveIntensity={0.5}
          roughness={0.7}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

export default function PathwayEdgeLights({ variant = 'off' }) {
  const arrowShape = useMemo(() => buildArrowShape(), [])

  if (variant === 'off') return null

  if (variant === 'strip') {
    const runs = makeEdgeRuns(PATHWAY_STRIP_THICKNESS)
    const material = {
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
            material={material}
          />
        ))}
      </group>
    )
  }

  if (variant === 'arrows') {
    return (
      <group>
        {ARROW_PLACEMENTS.map((a, i) => (
          <FloorArrow key={i} x={a.x} z={a.z} rotY={a.rotY} shape={arrowShape} />
        ))}
      </group>
    )
  }

  if (variant === 'pools') {
    const positions = makePoolPositions()
    return (
      <group>
        {positions.map(([x, z], i) => (
          <PoolSpot key={i} x={x} z={z} />
        ))}
      </group>
    )
  }

  return null
}
