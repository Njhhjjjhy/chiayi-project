import {
  SEATING_BENCH_SLIM_LENGTH, SEATING_BENCH_SLIM_DEPTH, SEATING_BENCH_SLIM_HEIGHT,
  SEATING_BENCH_SLIM_FRAME_T, SEATING_BENCH_SLIM_LEG_T, SEATING_BENCH_SLIM_LEG_INSET,
  SEATING_BENCH_BOX_LENGTH, SEATING_BENCH_BOX_DEPTH, SEATING_BENCH_BOX_HEIGHT,
  SEATING_BENCH_BOX_PLINTH_H, SEATING_BENCH_BOX_PLINTH_INSET, SEATING_BENCH_BOX_PANEL_MARGIN,
  SEATING_BENCH_BODY_COLOR, SEATING_BENCH_BODY_ROUGHNESS,
  SEATING_BENCH_PANEL_COLOR, SEATING_BENCH_PLINTH_COLOR,
  SEATING_BENCH_PAD_T, SEATING_BENCH_PAD_COLOR, SEATING_BENCH_PAD_ROUGHNESS,
} from '../../geometry/dimensions.js'
import { buildSeating } from '../../geometry/seatingPlacement.js'

// Seating variant 'benches' (concept image 15) — five benches in a
// symmetric horseshoe facing the loofah wall, each under its own
// downbeam (see SeatingSpotlights). Two designs from the image:
//
//   slim  centre + two flanks — a dark pad on a thin top frame carried
//         by slab legs at each end, open underneath so the downbeam's
//         light passes below the seat
//   box   two outer corners — a panelled chest sitting on a recessed
//         plinth (shadow gap at the floor), dark pad on top

const BODY_MATERIAL = {
  color: SEATING_BENCH_BODY_COLOR,
  roughness: SEATING_BENCH_BODY_ROUGHNESS,
  metalness: 0,
}

const PANEL_MATERIAL = {
  color: SEATING_BENCH_PANEL_COLOR,
  roughness: SEATING_BENCH_BODY_ROUGHNESS,
  metalness: 0,
}

const PLINTH_MATERIAL = {
  color: SEATING_BENCH_PLINTH_COLOR,
  roughness: 0.9,
  metalness: 0,
}

const PAD_MATERIAL = {
  color: SEATING_BENCH_PAD_COLOR,
  roughness: SEATING_BENCH_PAD_ROUGHNESS,
  metalness: 0,
}

// How proud the box design's face panels sit off the body, and the
// panel slab thickness — just enough to catch a shadow line so the
// faces read as frame-and-panel built rather than a plain block.
const PANEL_PROUD = 0.002
const PANEL_T = 0.004

function SlimBench({ x, z, rotY }) {
  const padBottomY = SEATING_BENCH_SLIM_HEIGHT - SEATING_BENCH_PAD_T
  const frameBottomY = padBottomY - SEATING_BENCH_SLIM_FRAME_T
  const legX = SEATING_BENCH_SLIM_LENGTH / 2 - SEATING_BENCH_SLIM_LEG_INSET - SEATING_BENCH_SLIM_LEG_T / 2
  const legDepth = SEATING_BENCH_SLIM_DEPTH - 0.06
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* top frame slab */}
      <mesh position={[0, frameBottomY + SEATING_BENCH_SLIM_FRAME_T / 2, 0]}>
        <boxGeometry args={[SEATING_BENCH_SLIM_LENGTH, SEATING_BENCH_SLIM_FRAME_T, SEATING_BENCH_SLIM_DEPTH]} />
        <meshStandardMaterial {...BODY_MATERIAL} />
      </mesh>
      {/* dark seat pad */}
      <mesh position={[0, padBottomY + SEATING_BENCH_PAD_T / 2, 0]}>
        <boxGeometry args={[SEATING_BENCH_SLIM_LENGTH, SEATING_BENCH_PAD_T, SEATING_BENCH_SLIM_DEPTH]} />
        <meshStandardMaterial {...PAD_MATERIAL} />
      </mesh>
      {/* slab legs at each end */}
      {[-legX, legX].map((lx) => (
        <mesh key={lx} position={[lx, frameBottomY / 2, 0]}>
          <boxGeometry args={[SEATING_BENCH_SLIM_LEG_T, frameBottomY, legDepth]} />
          <meshStandardMaterial {...BODY_MATERIAL} />
        </mesh>
      ))}
    </group>
  )
}

function BoxBench({ x, z, rotY }) {
  const padBottomY = SEATING_BENCH_BOX_HEIGHT - SEATING_BENCH_PAD_T
  const bodyH = padBottomY - SEATING_BENCH_BOX_PLINTH_H
  const bodyCenterY = SEATING_BENCH_BOX_PLINTH_H + bodyH / 2
  const panelW = SEATING_BENCH_BOX_LENGTH - SEATING_BENCH_BOX_PANEL_MARGIN * 2
  const panelEndW = SEATING_BENCH_BOX_DEPTH - SEATING_BENCH_BOX_PANEL_MARGIN * 2
  const panelH = bodyH - SEATING_BENCH_BOX_PANEL_MARGIN * 2
  const panelZ = SEATING_BENCH_BOX_DEPTH / 2 - PANEL_T / 2 + PANEL_PROUD
  const panelX = SEATING_BENCH_BOX_LENGTH / 2 - PANEL_T / 2 + PANEL_PROUD
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* recessed plinth — shadow gap at the floor */}
      <mesh position={[0, SEATING_BENCH_BOX_PLINTH_H / 2, 0]}>
        <boxGeometry
          args={[
            SEATING_BENCH_BOX_LENGTH - SEATING_BENCH_BOX_PLINTH_INSET * 2,
            SEATING_BENCH_BOX_PLINTH_H,
            SEATING_BENCH_BOX_DEPTH - SEATING_BENCH_BOX_PLINTH_INSET * 2,
          ]}
        />
        <meshStandardMaterial {...PLINTH_MATERIAL} />
      </mesh>
      {/* chest body */}
      <mesh position={[0, bodyCenterY, 0]}>
        <boxGeometry args={[SEATING_BENCH_BOX_LENGTH, bodyH, SEATING_BENCH_BOX_DEPTH]} />
        <meshStandardMaterial {...BODY_MATERIAL} />
      </mesh>
      {/* face panels — long faces */}
      {[-panelZ, panelZ].map((pz) => (
        <mesh key={`l${pz}`} position={[0, bodyCenterY, pz]}>
          <boxGeometry args={[panelW, panelH, PANEL_T]} />
          <meshStandardMaterial {...PANEL_MATERIAL} />
        </mesh>
      ))}
      {/* face panels — ends */}
      {[-panelX, panelX].map((px) => (
        <mesh key={`e${px}`} position={[px, bodyCenterY, 0]}>
          <boxGeometry args={[PANEL_T, panelH, panelEndW]} />
          <meshStandardMaterial {...PANEL_MATERIAL} />
        </mesh>
      ))}
      {/* dark seat pad */}
      <mesh position={[0, padBottomY + SEATING_BENCH_PAD_T / 2, 0]}>
        <boxGeometry
          args={[SEATING_BENCH_BOX_LENGTH - 0.04, SEATING_BENCH_PAD_T, SEATING_BENCH_BOX_DEPTH - 0.04]}
        />
        <meshStandardMaterial {...PAD_MATERIAL} />
      </mesh>
    </group>
  )
}

export default function SeatingBenches() {
  const { seats } = buildSeating('benches')
  return (
    <group>
      {seats.map((b, i) =>
        b.kind === 'box'
          ? <BoxBench key={i} x={b.x} z={b.z} rotY={b.rotY} />
          : <SlimBench key={i} x={b.x} z={b.z} rotY={b.rotY} />,
      )}
    </group>
  )
}
