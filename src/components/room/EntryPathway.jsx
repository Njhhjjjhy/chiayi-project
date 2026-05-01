import {
  ROOM, HW, HD, D1_X, WALL_T,
  CORRIDOR_WIDTH, PARTITION_HEIGHT, SEG2_FACE_X,
} from '../../geometry/dimensions.js'
import { useVariant } from '../../hooks/useVariant.js'
import ArchEdges from './ArchEdges.jsx'

// L-shaped guided corridor (per blueprint firefly-room-partition.webp).
// Visitors enter at the entrance wall, walk along the front wall
// (segment 1), turn right at the front/window corner into segment 2
// along the window wall, then exit into the open forest at the
// south-east corner.
//
// Two segments only — front wall + window wall. No partition along
// the back wall, no perpendicular stub, no entrance seal.
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

// Each SEG*_FACE constant is the corridor-walking-side face of the
// partition — the surface visitors see and where cards mount. The
// partition body extends from there into the forest by
// PARTITION_THICKNESS, so corridor walking width stays at exactly
// CORRIDOR_WIDTH.

// Segment 1 (parallel to front wall)
const SEG1_FACE   = -HD + CORRIDOR_WIDTH                  // -3.65, corridor-side face
const SEG1_CENTER = SEG1_FACE + HALF_THICK                // -3.59
// Segment 2 (parallel to window wall) — SEG2_FACE_X is imported from
// dimensions.js; it's pulled inward from the wall to clear the HVAC
// plenum (which extends 1.8 m into the room from the window wall, x
// range 2.615–4.415). The corridor balloons to ≈1.9 m wide along this
// segment as a result; visitors walk under the plenum overhead at the
// silver-door area.
const SEG2_CENTER = SEG2_FACE_X - HALF_THICK                // +2.44
// Segment 2 spans only the middle of the window-wall length so it
// doesn't overlap with segments 1 and 3 at the inner corners.
const SEG2_Z_START = SEG1_CENTER + HALF_THICK             // -3.53
const SEG2_Z_END   = HD - CORRIDOR_WIDTH - HALF_THICK     // +3.59 - 0.06 = +3.53
const SEG2_LENGTH  = SEG2_Z_END - SEG2_Z_START            // 7.06 m
const SEG2_Z_CENTER = (SEG2_Z_START + SEG2_Z_END) / 2     // 0
// Segment 3 (parallel to back wall)
const SEG3_FACE   = HD - CORRIDOR_WIDTH                   // +3.65, corridor-side face
const SEG3_CENTER = SEG3_FACE - HALF_THICK                // +3.59

// Corridor-exit opening at D1. Width = corridor width.
const OPENING_HALF      = CORRIDOR_WIDTH / 2
const OPENING_X_NEAR    = D1_X + OPENING_HALF             // window-side edge
const OPENING_X_FAR     = D1_X - OPENING_HALF             // entrance-side edge
// Segment 3 piece A: from window-wall corner to opening's window-side edge.
// Corridor does not extend past the opening toward D2 — no piece beyond.
const SEG3_PIECE_LENGTH = HW - OPENING_X_NEAR             // ~4.175 m
const SEG3_PIECE_X      = (HW + OPENING_X_NEAR) / 2

// Segment 4 — perpendicular finish stub past D1 into the forest. Sits
// flush with the entrance-side opening edge so it guides visitors deeper
// without letting them turn left toward D2.
const SEG4_LENGTH = CORRIDOR_WIDTH                        // 1.35 m into the forest
const SEG4_FACE_X = OPENING_X_FAR                         // corridor-side face on the +X side
const SEG4_CENTER_X = SEG4_FACE_X - HALF_THICK            // partition body extends -X from the face
const SEG4_CENTER_Z = SEG3_FACE - SEG4_LENGTH / 2

// Entrance-wall side forest seal. Visitor enters at z = -3.35 (entrance
// opening spans z = -4.55 to -2.15). The portion from z = -3.65 to
// z = -2.15 sits inside the forest; this seal blocks visitors from
// walking through that portion straight into the forest, funnelling
// them toward z < -3.65 where segment 1 begins.
const ENTRANCE_SEAL_FACE_X   = -HW + 0.04                 // 4 cm gap to the entrance wall, room-facing edge
const ENTRANCE_SEAL_CENTER_X = ENTRANCE_SEAL_FACE_X + HALF_THICK
const ENTRANCE_SEAL_Z_START  = SEG1_FACE                  // -3.65
const ENTRANCE_SEAL_Z_END    = -2.15
const ENTRANCE_SEAL_LENGTH   = ENTRANCE_SEAL_Z_END - ENTRANCE_SEAL_Z_START
const ENTRANCE_SEAL_CENTER_Z = (ENTRANCE_SEAL_Z_START + ENTRANCE_SEAL_Z_END) / 2

export default function EntryPathway() {
  const { isConstruction } = useVariant()
  const partition = partitionMaterial(isConstruction)
  const card = cardMaterial(isConstruction)

  const seg1Cards = makeCardPositions(-HW + 1.5, HW - 1.5, CARDS_PER_SEG)
  const seg2Cards = makeCardPositions(SEG2_Z_START + 1.0, SEG2_Z_END - 1.0, CARDS_PER_SEG)

  return (
    <group>
      {/* === Segment 1 — along front wall === */}
      <mesh
        position={[0, PARTITION_HEIGHT / 2, SEG1_CENTER]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[ROOM.W, PARTITION_HEIGHT, PARTITION_THICKNESS]} />
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
      <pointLight position={[-HW + 2.5, LIGHT_Y, -HD + CORRIDOR_WIDTH / 2]} {...LIGHT_PROPS} />
      <pointLight position={[ HW - 2.5, LIGHT_Y, -HD + CORRIDOR_WIDTH / 2]} {...LIGHT_PROPS} />

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
