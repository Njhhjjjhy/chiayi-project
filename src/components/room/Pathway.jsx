import { useMemo } from 'react'
import * as THREE from 'three'
import {
  ROOM, WALL_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z, COLUMN_X,
  D1_Z, D1_W, D1_H, D2_Z, D2_W, D2_H,
  PATHWAY_LOOK_DEFAULT,
  PATHWAY_DOWNLIGHT_WALL_OFFSET, PATHWAY_DOWNLIGHT_SPACING,
  PATHWAY_DOWNLIGHT_CAN_RADIUS, PATHWAY_DOWNLIGHT_CAN_HEIGHT,
  PATHWAY_DOWNLIGHT_COLOR,
  PATHWAY_SCALLOP_WIDTH, PATHWAY_SCALLOP_HEIGHT, PATHWAY_SCALLOP_OPACITY,
  PATHWAY_TIMBER_SEED, PATHWAY_TIMBER_BOARD_WIDTH, PATHWAY_TIMBER_BOARD_T,
  PATHWAY_TIMBER_GAP, PATHWAY_TIMBER_COLOR, PATHWAY_TIMBER_COLOR_JITTER,
  PATHWAY_LAMP_Y, PATHWAY_LAMP_SPACING, PATHWAY_LAMP_RADIUS,
  PATHWAY_LAMP_COLOR, PATHWAY_LAMP_INTENSITY, PATHWAY_LAMP_SCALLOP_HEIGHT,
} from '../../geometry/dimensions.js'
import { makeRng } from '../../utils/parkMillerRng.js'

// Pathway looks (concept images 05 / 14, canonical doc 11). Two
// switchable treatments of the L-shaped pathway, selected by the
// `variant` prop (`?pathway=` URL param):
//
//   'dark'    image 05 — the corridor stays near-black; small warm
//             downlights run along the partition side of each leg,
//             each washing a soft scallop of light onto the wall.
//   'timber'  image 14 — warm wood planks line the back-wall and the
//             two partition faces; small glowing dome lamps run down
//             the partition side, washing the boards around them.
//
// Both looks sit alongside the always-on pathway lighting (edge strips
// + painted arrows in PathwayEdgeLights) — nothing here duplicates it.
// The window-wall side of the horizontal leg keeps its blackout
// curtain in both looks (the real room has the 570 cm glass partition
// there). No real lights are added: cans, scallops, and lamps are all
// emissive/additive.

// Pathway faces the fixtures mount against:
//   pathway-partition-vertical pathway face    X = ENTRY_GAP_WIDTH (1.5)
//   pathway-partition-horizontal pathway face  Z = PATHWAY_PARTITION_Z (7.28)
//   back-wall pathway face                     X = WALL_T (0.12)
// The partition drawer faces sit 5 mm proud of the body, so anything
// mounted on a partition face stands off by at least 13 mm.
const FACE_CLEARANCE = 0.013
const BOARD_STANDOFF = 0.02       // timber boards clear the drawer bevels

// ─── Shared wall-glow scallop ───
// Additive gradient plane: light radiates from a centre point (top
// edge for downlights, plane centre for lamps) and dies toward the
// plane's borders, reading as a soft wash on the wall behind it.
const SCALLOP_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SCALLOP_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uCenterY;
  varying vec2 vUv;
  void main() {
    vec2 p = vec2((vUv.x - 0.5) * 2.0, (vUv.y - uCenterY) * 2.0);
    float d = length(p * vec2(1.7, 1.0));
    float fall = pow(clamp(1.0 - d, 0.0, 1.0), 1.6);
    gl_FragColor = vec4(uColor, uOpacity * fall);
  }
`

function makeScallopMaterial(color, opacity, centerY) {
  return new THREE.ShaderMaterial({
    vertexShader: SCALLOP_VERTEX,
    fragmentShader: SCALLOP_FRAGMENT,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uCenterY: { value: centerY },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

// One material per scallop role, shared across every fixture.
const DOWNLIGHT_SCALLOP_MAT = makeScallopMaterial(
  PATHWAY_DOWNLIGHT_COLOR, PATHWAY_SCALLOP_OPACITY, 1.0,
)
const LAMP_SCALLOP_MAT = makeScallopMaterial(
  PATHWAY_LAMP_COLOR, PATHWAY_SCALLOP_OPACITY, 0.5,
)

// Fixture positions along each leg's partition side. The vertical leg
// runs along the pathway-partition-vertical face; the horizontal leg
// along the pathway-partition-horizontal face (X ≥ 1.5 — the corner
// below that is open pathway with no wall behind it).
function makeFixtureSpots() {
  const vertical = []
  for (let z = 0.8; z <= PATHWAY_PARTITION_Z - 0.5; z += PATHWAY_DOWNLIGHT_SPACING) {
    vertical.push(z)
  }
  const horizontal = []
  for (let x = ENTRY_GAP_WIDTH + 0.5; x <= COLUMN_X - 0.4; x += PATHWAY_DOWNLIGHT_SPACING) {
    horizontal.push(x)
  }
  return { vertical, horizontal }
}

// ─── Dark look (image 05) ───

function Downlight({ x, z, scallop }) {
  return (
    <group>
      {/* fixture can at the ceiling */}
      <mesh position={[x, ROOM.H - PATHWAY_DOWNLIGHT_CAN_HEIGHT / 2, z]}>
        <cylinderGeometry
          args={[PATHWAY_DOWNLIGHT_CAN_RADIUS, PATHWAY_DOWNLIGHT_CAN_RADIUS, PATHWAY_DOWNLIGHT_CAN_HEIGHT, 12]}
        />
        <meshStandardMaterial color="#111111" roughness={0.9} metalness={0} />
      </mesh>
      {/* warm emitter face under the can */}
      <mesh position={[x, ROOM.H - PATHWAY_DOWNLIGHT_CAN_HEIGHT - 0.001, z]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[PATHWAY_DOWNLIGHT_CAN_RADIUS * 0.8, 12]} />
        <meshStandardMaterial
          color={PATHWAY_DOWNLIGHT_COLOR}
          emissive={PATHWAY_DOWNLIGHT_COLOR}
          emissiveIntensity={2.5}
          roughness={0.6}
          metalness={0}
        />
      </mesh>
      {/* scallop washing the partition wall behind the fixture */}
      <mesh
        position={scallop.position}
        rotation={[0, scallop.rotY, 0]}
        material={DOWNLIGHT_SCALLOP_MAT}
      >
        <planeGeometry args={[PATHWAY_SCALLOP_WIDTH, PATHWAY_SCALLOP_HEIGHT]} />
      </mesh>
    </group>
  )
}

function DarkLook() {
  const spots = useMemo(() => makeFixtureSpots(), [])
  const scallopCenterY = ROOM.H - PATHWAY_SCALLOP_HEIGHT / 2
  return (
    <group>
      {spots.vertical.map((z) => (
        <Downlight
          key={`v${z}`}
          x={ENTRY_GAP_WIDTH - PATHWAY_DOWNLIGHT_WALL_OFFSET}
          z={z}
          scallop={{
            position: [ENTRY_GAP_WIDTH - FACE_CLEARANCE, scallopCenterY, z],
            rotY: -Math.PI / 2,
          }}
        />
      ))}
      {spots.horizontal.map((x) => (
        <Downlight
          key={`h${x}`}
          x={x}
          z={PATHWAY_PARTITION_Z + PATHWAY_DOWNLIGHT_WALL_OFFSET}
          scallop={{
            position: [x, scallopCenterY, PATHWAY_PARTITION_Z + FACE_CLEARANCE],
            rotY: 0,
          }}
        />
      ))}
    </group>
  )
}

// ─── Timber look (image 14) ───

// Vertical planks along one wall run. Widths and tones vary per board
// so the panelling reads hand-built. A plank that lands over a door
// opening shortens to run from the door's top edge to the ceiling, so
// the panelling frames the opening instead of leaving bare wall.
function buildBoards(runLength, rng, openings = []) {
  const boards = []
  let along = 0
  while (along < runLength - 0.05) {
    const w = Math.min(
      PATHWAY_TIMBER_BOARD_WIDTH * (0.85 + 0.3 * rng()),
      runLength - along,
    )
    const center = along + w / 2
    const opening = openings.find(
      (o) => along < o.to && along + w > o.from,
    )
    const color = new THREE.Color(PATHWAY_TIMBER_COLOR)
    color.offsetHSL(0, (rng() - 0.5) * 0.04, (rng() - 0.5) * PATHWAY_TIMBER_COLOR_JITTER)
    boards.push({
      center,
      width: w - PATHWAY_TIMBER_GAP,
      color: '#' + color.getHexString(),
      yBottom: opening ? opening.height : 0,
    })
    along += w
  }
  return boards
}

function BoardRun({ boards, axis, fixed, height }) {
  return (
    <group>
      {boards.map((b, i) => {
        const boardH = height - b.yBottom
        const centerY = b.yBottom + boardH / 2
        const position = axis === 'z' ? [fixed, centerY, b.center] : [b.center, centerY, fixed]
        const args = axis === 'z'
          ? [PATHWAY_TIMBER_BOARD_T, boardH, b.width]
          : [b.width, boardH, PATHWAY_TIMBER_BOARD_T]
        return (
          <mesh key={i} position={position}>
            <boxGeometry args={args} />
            <meshStandardMaterial
              color={b.color}
              emissive={b.color}
              emissiveIntensity={0.06}
              roughness={0.75}
              metalness={0}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function WallLamp({ x, z, scallop }) {
  return (
    <group>
      {/* glowing dome shade */}
      <mesh position={[x, PATHWAY_LAMP_Y, z]}>
        <sphereGeometry args={[PATHWAY_LAMP_RADIUS, 16, 12]} />
        <meshStandardMaterial
          color={PATHWAY_LAMP_COLOR}
          emissive={PATHWAY_LAMP_COLOR}
          emissiveIntensity={PATHWAY_LAMP_INTENSITY}
          roughness={0.5}
          metalness={0}
        />
      </mesh>
      {/* glow washing the boards around the lamp */}
      <mesh
        position={scallop.position}
        rotation={[0, scallop.rotY, 0]}
        material={LAMP_SCALLOP_MAT}
      >
        <planeGeometry args={[PATHWAY_SCALLOP_WIDTH, PATHWAY_LAMP_SCALLOP_HEIGHT]} />
      </mesh>
    </group>
  )
}

function TimberLook() {
  const { backWall, verticalFace, horizontalFace, lampsV, lampsH } = useMemo(() => {
    const rng = makeRng(PATHWAY_TIMBER_SEED)
    // back-wall planks shorten over the two staff-door openings
    const doorOpenings = [
      { from: D1_Z - D1_W / 2, to: D1_Z + D1_W / 2, height: D1_H },
      { from: D2_Z - D2_W / 2, to: D2_Z + D2_W / 2, height: D2_H },
    ]
    const backWall = buildBoards(ROOM.D, rng, doorOpenings)
    const verticalFace = buildBoards(PATHWAY_PARTITION_Z, rng)
    const horizontalFace = buildBoards(COLUMN_X - ENTRY_GAP_WIDTH, rng)

    const lampsV = []
    for (let z = 1.0; z <= PATHWAY_PARTITION_Z - 0.3; z += PATHWAY_LAMP_SPACING) lampsV.push(z)
    const lampsH = []
    for (let x = ENTRY_GAP_WIDTH + 0.5; x <= COLUMN_X - 0.4; x += PATHWAY_LAMP_SPACING) lampsH.push(x)
    return { backWall, verticalFace, horizontalFace, lampsV, lampsH }
  }, [])

  // Board centre planes, proud of each wall / partition face.
  const backWallX = WALL_T + PATHWAY_TIMBER_BOARD_T / 2
  const verticalX = ENTRY_GAP_WIDTH - BOARD_STANDOFF - PATHWAY_TIMBER_BOARD_T / 2
  const horizontalZ = PATHWAY_PARTITION_Z + BOARD_STANDOFF + PATHWAY_TIMBER_BOARD_T / 2
  // Lamp domes and scallops sit just proud of the board faces.
  const verticalBoardFace = verticalX - PATHWAY_TIMBER_BOARD_T / 2
  const horizontalBoardFace = horizontalZ + PATHWAY_TIMBER_BOARD_T / 2

  return (
    <group>
      <BoardRun boards={backWall} axis="z" fixed={backWallX} height={ROOM.H} />
      <BoardRun boards={verticalFace} axis="z" fixed={verticalX} height={ROOM.H} />
      <BoardRun boards={horizontalFace} axis="x" fixed={horizontalZ} height={ROOM.H} />

      {lampsV.map((z) => (
        <WallLamp
          key={`v${z}`}
          x={verticalBoardFace - PATHWAY_LAMP_RADIUS * 0.4}
          z={z}
          scallop={{
            position: [verticalBoardFace - 0.002, PATHWAY_LAMP_Y, z],
            rotY: -Math.PI / 2,
          }}
        />
      ))}
      {lampsH.map((x) => (
        <WallLamp
          key={`h${x}`}
          x={x}
          z={horizontalBoardFace + PATHWAY_LAMP_RADIUS * 0.4}
          scallop={{
            position: [x, PATHWAY_LAMP_Y, horizontalBoardFace + 0.002],
            rotY: 0,
          }}
        />
      ))}
    </group>
  )
}

export default function Pathway({ variant = PATHWAY_LOOK_DEFAULT }) {
  if (variant === 'timber') return <TimberLook />
  return <DarkLook />
}
