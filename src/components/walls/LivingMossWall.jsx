import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../../hooks/useVariant.jsx'

const WALL_WIDTH = 8.83
const WALL_HEIGHT = 3.52
const WALL_Z = -5
// Wainscot on the front-wall occupies the bottom 0.90 m + 0.03 m cap + 0.005 m seam.
// The moss wall must NEVER overlap the panelling — start the plane above the cap.
const WAINSCOT_TOP = 0.935
const USABLE_H = WALL_HEIGHT - WAINSCOT_TOP            // 2.585
const USABLE_Y = WAINSCOT_TOP + USABLE_H / 2           // vertical centre of the moss panel

// Living moss wall: a dense green surface of moss clumps on wire mesh.
// Rendered as a displaced plane with vertex colors creating patches of
// different greens — light moss, dark moss, lichen yellow-green.
// No point lights or glow effects — just realistic organic texture.

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function LivingMossWall() {
  const { isConstruction, isLight } = useVariant()

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WALL_WIDTH, USABLE_H, 80, 44)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const rand = seededRandom(42)

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)

      // Organic bumpy displacement — irregular moss clumps
      const large = Math.sin(x * 2.5 + y * 1.8) * Math.cos(x * 1.2 - y * 2.3) * 0.06
      const medium = Math.sin(x * 7 + y * 5) * 0.03
      const small = Math.sin(x * 18 + y * 14) * 0.012
      const micro = (rand() - 0.5) * 0.015
      pos.setZ(i, large + medium + small + micro)

      // Vertex colors — patches of different greens
      const patch = Math.sin(x * 3 + y * 2) * 0.5 + 0.5
      const detail = rand()

      let r, g, b
      if (patch > 0.7) {
        // Light yellow-green lichen patches
        r = 0.25 + detail * 0.08
        g = 0.35 + detail * 0.1
        b = 0.12 + detail * 0.05
      } else if (patch > 0.3) {
        // Medium forest green
        r = 0.08 + detail * 0.05
        g = 0.2 + detail * 0.08
        b = 0.06 + detail * 0.04
      } else {
        // Dark deep green / shadow areas
        r = 0.04 + detail * 0.03
        g = 0.1 + detail * 0.05
        b = 0.04 + detail * 0.03
      }

      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  if (isConstruction) {
    return (
      <mesh position={[0, USABLE_Y, WALL_Z]} geometry={geometry}>
        <meshStandardMaterial wireframe color="#4a4" side={THREE.DoubleSide} />
      </mesh>
    )
  }

  return (
    <mesh position={[0, USABLE_Y, WALL_Z]} geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
