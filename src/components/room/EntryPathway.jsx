import {
  ROOM, HW, HD, WALL_T,
  CORRIDOR_WIDTH, PARTITION_HEIGHT, SEG2_FACE_X,
  ENT_END,
} from '../../geometry/dimensions.js'
import { useVariant } from '../../hooks/useVariant.js'
import ArchEdges from './ArchEdges.jsx'

// L-shaped guided corridor (per blueprint firefly-room-partition.webp).
// Visitors enter at the entrance wall, walk along the front wall
// (segment 1), turn right at the front/window corner into segment 2
// along the window wall, then exit into the open forest at the
// south-east corner.
//
// Partitions are 12 cm thick (matching the project's WALL_T) — modelled
// as plywood-on-stud interior partitions, the standard for exhibition
// build-outs. The plywood is finished in matte black paint — same paint
// colour as the existing concrete walls, so the room reads as one
// continuous dark surface.
//
// Always rendered — no toggles, no left/right variants.

const PARTITION_THICKNESS  = WALL_T // 0.12 m, matches room walls
const HALF_THICK           = PARTITION_THICKNESS / 2

const CARDS_PER_SEG = 3
const CARD_W        = 0.42
const CARD_H        = 0.30
const CARD_Y        = 1.55          // centre height — readable while standing
const CARD_LIFT     = 0.01          // distance off the partition surface so card doesn't z-fight

// Segment 1 — parallel to the front wall, corridor-side face flush
// with the south edge of the entrance opening. Stops at the
// front-window inner corner where segment-2 starts (i.e. it does NOT
// extend all the way to the window wall — that would put its end
// right in front of the silver service door).
const SEG1_FACE     = ENT_END                             // -2.15, flush with entrance opening south edge
const SEG1_CENTER_Z = SEG1_FACE + HALF_THICK              // -2.09
const SEG1_X_START  = -HW                                 // -4.415, entrance-wall side
const SEG1_X_END    = SEG2_FACE_X                         // +2.50, front/window inner corner
const SEG1_LENGTH   = SEG1_X_END - SEG1_X_START           // ~6.92 m
const SEG1_X_CENTER = (SEG1_X_START + SEG1_X_END) / 2     // ~-0.96
// Segment 2 (parallel to window wall) — SEG2_FACE_X is imported from
// dimensions.js; it's pulled inward from the wall to clear the HVAC
// plenum (which extends 1.8 m into the room from the window wall, x
// range 2.615–4.415). The corridor balloons to ≈1.9 m wide along this
// segment as a result; visitors walk under the plenum overhead at the
// silver-door area.
const SEG2_CENTER = SEG2_FACE_X - HALF_THICK                // +2.44
// Segment 2 starts where seg-1's far face ends (the front/window
// inner corner) and runs along the window wall toward the back wall,
// stopping a corridor-width short of the back wall so visitors can
// exit at the south-east corner.
const SEG2_Z_START = SEG1_CENTER_Z + HALF_THICK           // -2.03, meets seg-1 at front/window corner
const SEG2_Z_END   = HD - CORRIDOR_WIDTH - HALF_THICK     // +3.59
const SEG2_LENGTH  = SEG2_Z_END - SEG2_Z_START            // ~5.62 m
const SEG2_Z_CENTER = (SEG2_Z_START + SEG2_Z_END) / 2     // ~+0.78

// Plywood partition finished in matte black paint. Same paint colour
// family as the concrete walls but slightly lighter and a bit smoother
// — the plywood substrate gives the painted surface a fractional sheen
// that the corridor lights catch, so the partitions read as separate
// volumes from the walls without breaking the unified black palette.
// Switches to wireframe in construction mode so the partition system
// reads consistently with the wireframe walls.
function partitionMaterial(isConstruction) {
  return isConstruction
    ? { color: '#dcdcdc', roughness: 0.9, metalness: 0 }
    : { color: '#1c1c1c', roughness: 0.55, metalness: 0 }
}

function cardMaterial(isConstruction) {
  return isConstruction
    ? { color: '#cfd8e3', roughness: 0.9, metalness: 0 }
    : {
        color: '#0a1628',
        emissive: '#4a8fcc',
        emissiveIntensity: 0.6,
        roughness: 0.4,
      }
}

// Soft warm-cool corridor lighting. Slightly brighter and longer-reach
// than before so the non-emissive plywood reads at the default-darkness
// timeline position (DEFAULT_TIMELINE_T = 0.78).
const LIGHT_PROPS = {
  color: '#b8c4d8',
  intensity: 1.0,
  distance: 3.5,
  decay: 2,
}
const LIGHT_Y = 1.8

export default function EntryPathway() {
  const { isConstruction } = useVariant()
  const partition = partitionMaterial(isConstruction)
  const card = cardMaterial(isConstruction)

  const seg1Cards = makeCardPositions(SEG1_X_START + 1.0, SEG1_X_END - 1.0, CARDS_PER_SEG)
  const seg2Cards = makeCardPositions(SEG2_Z_START + 1.0, SEG2_Z_END - 1.0, CARDS_PER_SEG)

  return (
    <group>
      {/* === Segment 1 — face flush with entrance opening south edge, stops at front/window corner === */}
      <mesh
        position={[SEG1_X_CENTER, PARTITION_HEIGHT / 2, SEG1_CENTER_Z]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[SEG1_LENGTH, PARTITION_HEIGHT, PARTITION_THICKNESS]} />
        <meshStandardMaterial {...partition} />
        <ArchEdges color="#0a8c5b" />
      </mesh>
      {seg1Cards.map((x, i) => (
        <mesh
          key={`s1-card-${i}`}
          position={[x, CARD_Y, SEG1_FACE - CARD_LIFT]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshStandardMaterial {...card} />
        </mesh>
      ))}
      <pointLight position={[-HW + 2.5, LIGHT_Y, (-HD + SEG1_FACE) / 2]} {...LIGHT_PROPS} />
      <pointLight position={[ HW - 2.5, LIGHT_Y, (-HD + SEG1_FACE) / 2]} {...LIGHT_PROPS} />

      {/* === Segment 2 — along window wall, inset to clear the HVAC plenum === */}
      <mesh
        position={[SEG2_CENTER, PARTITION_HEIGHT / 2, SEG2_Z_CENTER]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[PARTITION_THICKNESS, PARTITION_HEIGHT, SEG2_LENGTH]} />
        <meshStandardMaterial {...partition} />
        <ArchEdges color="#0a8c5b" />
      </mesh>
      {seg2Cards.map((z, i) => (
        <mesh
          key={`s2-card-${i}`}
          position={[SEG2_FACE_X + CARD_LIFT, CARD_Y, z]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshStandardMaterial {...card} />
        </mesh>
      ))}
      <pointLight position={[(SEG2_FACE_X + HW) / 2, LIGHT_Y, SEG2_Z_START + 1.5]} {...LIGHT_PROPS} />
      <pointLight position={[(SEG2_FACE_X + HW) / 2, LIGHT_Y, SEG2_Z_END - 1.5]} {...LIGHT_PROPS} />
    </group>
  )
}

// Even spacing between two endpoints, inclusive at both ends.
function makeCardPositions(start, end, n) {
  if (n === 1) return [(start + end) / 2]
  const step = (end - start) / (n - 1)
  return Array.from({ length: n }, (_, i) => start + i * step)
}
