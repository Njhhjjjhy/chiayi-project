import { useMemo } from 'react'
import * as THREE from 'three'
import {
  ROOM,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z, COLUMN_X,
  PATHWAY_DOWNLIGHT_WALL_OFFSET, PATHWAY_DOWNLIGHT_SPACING,
  PATHWAY_DOWNLIGHT_CAN_RADIUS, PATHWAY_DOWNLIGHT_CAN_HEIGHT,
  PATHWAY_DOWNLIGHT_COLOR,
  PATHWAY_SCALLOP_WIDTH, PATHWAY_SCALLOP_HEIGHT, PATHWAY_SCALLOP_OPACITY,
} from '../../geometry/dimensions.js'

// Pathway look (concept image 05). The L-shaped pathway corridor stays
// near-black; small warm downlights run along the partition side of
// each leg, each washing a soft scallop of light onto the wall. This
// sits alongside the always-on pathway lighting (edge strips + painted
// arrows in PathwayEdgeLights) — nothing here duplicates it. No real
// lights are added: cans and scallops are emissive/additive.

// Pathway faces the fixtures mount against:
//   pathway-partition-vertical pathway face    X = ENTRY_GAP_WIDTH (1.5)
//   pathway-partition-horizontal pathway face  Z = PATHWAY_PARTITION_Z (7.28)
// The partition drawer faces sit 5 mm proud of the body, so anything
// mounted on a partition face stands off by at least 13 mm.
const FACE_CLEARANCE = 0.013

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

// Scallop material shared across every downlight fixture.
const DOWNLIGHT_SCALLOP_MAT = makeScallopMaterial(
  PATHWAY_DOWNLIGHT_COLOR, PATHWAY_SCALLOP_OPACITY, 1.0,
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

export default function Pathway() {
  return <DarkLook />
}
