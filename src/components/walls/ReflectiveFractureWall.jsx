import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../../hooks/useVariant.jsx'

const WALL_WIDTH = 10
const WALL_HEIGHT = 3.52
const WALL_Z = -5

// Reflective fracture wall: triangular mirror acrylic panels on a dark backing.
// Each triangle is a flat plane angled slightly differently so they catch and
// reflect light from different directions. Clearly visible as distinct panels
// with bright mirror surfaces and dark edge gaps between them.

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function createTriangleGeometry(ax, ay, bx, by, cx, cy) {
  const geo = new THREE.BufferGeometry()
  const vertices = new Float32Array([ax, ay, 0, bx, by, 0, cx, cy, 0])
  geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geo.computeVertexNormals()
  return geo
}

export default function ReflectiveFractureWall() {
  const { isConstruction, isLight } = useVariant()

  // Generate a grid of triangles with slight angular variation
  const triangles = useMemo(() => {
    const rand = seededRandom(77)
    const tris = []
    const cols = 14
    const rows = 8
    const cellW = (WALL_WIDTH * 0.98) / cols
    const cellH = (WALL_HEIGHT * 0.96) / rows
    const gap = 0.02 // dark gap between panels

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = -WALL_WIDTH * 0.49 + c * cellW + gap
        const y0 = -WALL_HEIGHT * 0.48 + r * cellH + gap
        const x1 = x0 + cellW - gap * 2
        const y1 = y0 + cellH - gap * 2

        // Split each cell into 2 triangles along a diagonal
        // Randomize which diagonal
        const diag = rand() > 0.5

        const tiltX = (rand() - 0.5) * 0.12
        const tiltY = (rand() - 0.5) * 0.15

        if (diag) {
          tris.push({
            geo: createTriangleGeometry(x0, y0, x1, y0, x0, y1),
            tiltX, tiltY,
            z: 0.01 + rand() * 0.02,
          })
          tris.push({
            geo: createTriangleGeometry(x1, y0, x1, y1, x0, y1),
            tiltX: (rand() - 0.5) * 0.12,
            tiltY: (rand() - 0.5) * 0.15,
            z: 0.01 + rand() * 0.02,
          })
        } else {
          tris.push({
            geo: createTriangleGeometry(x0, y0, x1, y0, x1, y1),
            tiltX, tiltY,
            z: 0.01 + rand() * 0.02,
          })
          tris.push({
            geo: createTriangleGeometry(x0, y0, x1, y1, x0, y1),
            tiltX: (rand() - 0.5) * 0.12,
            tiltY: (rand() - 0.5) * 0.15,
            z: 0.01 + rand() * 0.02,
          })
        }
      }
    }
    return tris
  }, [])

  const mirrorColor = isLight ? '#d8d8d8' : '#888888'

  return (
    <group position={[0, WALL_HEIGHT / 2, WALL_Z]}>
      {/* Dark plywood backing */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <meshStandardMaterial
          color={isConstruction ? '#333' : '#0a0a0a'}
          wireframe={isConstruction}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mirror panels */}
      {triangles.map((tri, i) => (
        <mesh
          key={i}
          geometry={tri.geo}
          position={[0, 0, tri.z]}
          rotation={[tri.tiltX, tri.tiltY, 0]}
        >
          <meshStandardMaterial
            color={isConstruction ? '#aaa' : mirrorColor}
            metalness={isConstruction ? 0 : 0.92}
            roughness={isConstruction ? 0.8 : 0.08}
            wireframe={isConstruction}
            side={THREE.DoubleSide}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  )
}
