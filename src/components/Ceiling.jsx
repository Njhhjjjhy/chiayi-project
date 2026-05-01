import { useMemo } from 'react'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.js'
import { DEFAULT_VARIANTS } from '../variants/defaults.js'
import { ROOM, DROPPED_CEILING_Y } from '../geometry/dimensions.js'

function MountainTopologyCeiling({ isConstruction, ceilingOpacity }) {
  function seededRandom(seed) {
    let s = seed
    return () => {
      s = (s * 16807 + 0) % 2147483647
      return (s - 1) / 2147483646
    }
  }

  const geometry = useMemo(() => {
    const rand = seededRandom(42)
    const gridX = 18
    const gridZ = 18
    const vertices = []

    for (let iz = 0; iz <= gridZ; iz++) {
      for (let ix = 0; ix <= gridX; ix++) {
        const x = (ix / gridX - 0.5) * ROOM.W
        const z = (iz / gridZ - 0.5) * ROOM.D
        let h = 0
        h += Math.sin(x * 0.8 + 1.2) * Math.cos(z * 0.6 + 0.8) * 0.18
        h += Math.sin(x * 1.5 + z * 1.0) * 0.12
        h += Math.cos(x * 0.5 - z * 1.3 + 2.0) * 0.08
        h += Math.sin(x * 2.2 - z * 0.7) * 0.06
        h += (rand() - 0.5) * 0.08
        // Soft edge fade across ~1 grid cell only (was 2) — keeps relief
        // right up to the wall line so the ceiling reads as topology,
        // not a drooping tablecloth.
        const edgeFade = Math.min(1, Math.min(ix, gridX - ix), Math.min(iz, gridZ - iz))
        h *= edgeFade
        vertices.push([x, h, z])
      }
    }

    const positions = []
    const normals = []
    const colors = []
    const baseShades = [0.08, 0.10, 0.12, 0.14, 0.16, 0.18, 0.20, 0.22, 0.25]

    for (let iz = 0; iz < gridZ; iz++) {
      for (let ix = 0; ix < gridX; ix++) {
        const i00 = iz * (gridX + 1) + ix
        const i10 = iz * (gridX + 1) + ix + 1
        const i01 = (iz + 1) * (gridX + 1) + ix
        const i11 = (iz + 1) * (gridX + 1) + ix + 1

        const v00 = vertices[i00], v10 = vertices[i10], v01 = vertices[i01], v11 = vertices[i11]

        const a1 = new THREE.Vector3(...v00), b1 = new THREE.Vector3(...v10), c1 = new THREE.Vector3(...v01)
        const n1 = new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(b1, a1), new THREE.Vector3().subVectors(c1, a1)).normalize()
        positions.push(...v00, ...v10, ...v01)
        normals.push(n1.x, n1.y, n1.z, n1.x, n1.y, n1.z, n1.x, n1.y, n1.z)
        const s1 = baseShades[Math.floor(rand() * baseShades.length)] * (0.7 + Math.abs(n1.y) * 0.3)
        colors.push(s1, s1, s1 * 1.05, s1, s1, s1 * 1.05, s1, s1, s1 * 1.05)

        const a2 = new THREE.Vector3(...v10), b2 = new THREE.Vector3(...v11), c2 = new THREE.Vector3(...v01)
        const n2 = new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(b2, a2), new THREE.Vector3().subVectors(c2, a2)).normalize()
        positions.push(...v10, ...v11, ...v01)
        normals.push(n2.x, n2.y, n2.z, n2.x, n2.y, n2.z, n2.x, n2.y, n2.z)
        const s2 = baseShades[Math.floor(rand() * baseShades.length)] * (0.7 + Math.abs(n2.y) * 0.3)
        colors.push(s2, s2, s2 * 1.05, s2, s2, s2 * 1.05, s2, s2, s2 * 1.05)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geo
  }, [])

  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 5), [geometry])

  return (
    <group position={[0, DROPPED_CEILING_Y, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors={!isConstruction}
          color={isConstruction ? '#eeeeee' : undefined}
          side={THREE.DoubleSide}
          transparent
          opacity={isConstruction ? 1 : ceilingOpacity}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial
          color={isConstruction ? '#444' : '#000'}
          transparent
          opacity={isConstruction ? 1 : ceilingOpacity * 0.5}
        />
      </lineSegments>
    </group>
  )
}

const CEILING_COMPONENTS = {
  mountainTopology: MountainTopologyCeiling,
}

export default function Ceiling() {
  const { selections, viewMode, walkMode, activeSceneKey } = useVariant()
  const isConstruction = viewMode === 'construction'
  const variantId = selections.ceiling || DEFAULT_VARIANTS.ceiling
  const Component = CEILING_COMPONENTS[variantId] || CEILING_COMPONENTS[DEFAULT_VARIANTS.ceiling]

  // Ceiling preset = top-down plan view from above. Hide the ceiling
  // mesh so the camera can see into the room.
  if (!walkMode && activeSceneKey === 'ceiling') return null

  return <Component isConstruction={isConstruction} ceilingOpacity={1} />
}
