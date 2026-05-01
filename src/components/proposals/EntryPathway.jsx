import { ROOM, HD } from '../../geometry/dimensions.js'

// L-shaped guided corridor along one long wall and the back wall, with
// a 2 m exit gap at the far end of the back-wall partition that opens
// into the main room. Five placeholder fact cards mounted on the
// corridor-facing face of the long partition. Soft cool point light
// inside the corridor for ambient.
//
// The `side` prop mirrors the geometry across x = 0:
//   'right' (default) — partition along +x wall, exit gap at −x end of B
//   'left'            — partition along −x wall, exit gap at +x end of B
// Both sides may be mounted at once for side-by-side comparison.

const CORRIDOR_WIDTH      = 1.2   // metres, clear walking width
const PARTITION_THICKNESS = 0.08  // metres
const PARTITION_HEIGHT    = 2.4   // metres — stops below ceiling beams
const EXIT_GAP            = 2.0   // metres — opening at far end of Partition B

export default function EntryPathway({ side = 'right' }) {
  const mirror = side === 'left' ? -1 : 1

  const partitionAX = mirror * (ROOM.W / 2 - CORRIDOR_WIDTH)

  // Partition B spans the inner long-wall edge to the EXIT_GAP edge.
  // Width is symmetric across x = 0, so the same expression works for
  // both sides — only the centre x flips with `mirror`.
  const partitionBWidth = ROOM.W - CORRIDOR_WIDTH - EXIT_GAP
  const partitionBX =
    mirror * ((ROOM.W / 2 - CORRIDOR_WIDTH + (-ROOM.W / 2 + EXIT_GAP)) / 2)
  const partitionBZ = HD - CORRIDOR_WIDTH

  // Cards on the corridor-facing face of Partition A. The 1 cm offset
  // moves them off the partition into the corridor — flips sign with
  // `mirror` so they sit in the corridor on either side.
  const cardX =
    mirror * (ROOM.W / 2 - CORRIDOR_WIDTH) +
    mirror * (PARTITION_THICKNESS / 2 + 0.01)
  const zStart = -HD + 1.0
  const zEnd = HD - CORRIDOR_WIDTH - 0.5
  const cardZs = Array.from(
    { length: 5 },
    (_, i) => zStart + (i / 4) * (zEnd - zStart),
  )
  const cardRotY = side === 'left' ? -Math.PI / 2 : Math.PI / 2

  console.log('[EntryPathway] mounting', {
    side,
    mirror,
    partitionAx: mirror * (ROOM.W / 2 - CORRIDOR_WIDTH),
    partitionBz: HD - CORRIDOR_WIDTH,
    roomW: ROOM.W,
    HD,
  })

  return (
    <group>
      <mesh position={[partitionAX, PARTITION_HEIGHT / 2, 0]}>
        <boxGeometry args={[PARTITION_THICKNESS, PARTITION_HEIGHT, HD * 2]} />
        <meshStandardMaterial
          color="#1a1a1a"
          emissive="#3a4a5a"
          emissiveIntensity={0.35}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      <mesh position={[partitionBX, PARTITION_HEIGHT / 2, partitionBZ]}>
        <boxGeometry
          args={[partitionBWidth, PARTITION_HEIGHT, PARTITION_THICKNESS]}
        />
        <meshStandardMaterial
          color="#1a1a1a"
          emissive="#3a4a5a"
          emissiveIntensity={0.35}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {cardZs.map((z, i) => (
        <mesh
          key={i}
          position={[cardX, 1.55, z]}
          rotation={[0, cardRotY, 0]}
        >
          <planeGeometry args={[0.42, 0.30]} />
          <meshStandardMaterial
            color="#0a1628"
            emissive="#4a8fcc"
            emissiveIntensity={0.8}
            roughness={0.4}
          />
        </mesh>
      ))}

      {[-HD / 2, 0, HD / 2 - CORRIDOR_WIDTH / 2].map((z, i) => (
        <pointLight
          key={i}
          position={[mirror * (ROOM.W / 2 - CORRIDOR_WIDTH / 2), 2.0, z]}
          color="#4a8fcc"
          intensity={1.2}
          distance={6}
          decay={2}
        />
      ))}
    </group>
  )
}
