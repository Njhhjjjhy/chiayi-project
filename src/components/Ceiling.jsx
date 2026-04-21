import { useMemo, Suspense, useRef } from 'react'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'
import { useTimeline } from '../hooks/useTimeline.jsx'
import { useCeilingPanelTexture } from '../useExhibitionTextures.js'

const ROOM = { w: 8.83, d: 10 }
const DROPPED_H = 3.4    // dropped ceiling height
const STRUCTURAL_H = 3.5 // structural ceiling above panels
const PANEL_SIZE = 1.18  // panel dimension (1.2m pitch - 0.02m gap)
const PANEL_GAP = 0.02
const PANEL_PITCH = PANEL_SIZE + PANEL_GAP
const PANEL_THICKNESS = 0.02
const GRID_COLS = 8
const GRID_ROWS = 8

// Textured panel grid using instanced mesh for performance
function TexturedPanelGrid({ ceilingOpacity }) {
  const matProps = useCeilingPanelTexture()
  const meshRef = useRef()

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Compute instance transforms
  useMemo(() => {
    if (!meshRef.current) return
    const totalW = GRID_COLS * PANEL_PITCH - PANEL_GAP
    const totalD = GRID_ROWS * PANEL_PITCH - PANEL_GAP
    const startX = -totalW / 2 + PANEL_SIZE / 2
    const startZ = -totalD / 2 + PANEL_SIZE / 2

    let idx = 0
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = startX + col * PANEL_PITCH
        const z = startZ + row * PANEL_PITCH
        dummy.position.set(x, DROPPED_H, z)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(idx, dummy.matrix)
        idx++
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  const panelGeo = useMemo(() => {
    return new THREE.BoxGeometry(PANEL_SIZE, PANEL_THICKNESS, PANEL_SIZE)
  }, [])

  return (
    <group>
      {/* Instanced panel grid */}
      <instancedMesh
        ref={meshRef}
        args={[panelGeo, null, GRID_COLS * GRID_ROWS]}
        receiveShadow
      >
        <meshStandardMaterial
          {...matProps}
          roughness={0.95}
          envMapIntensity={0.02}
          transparent
          opacity={ceilingOpacity}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Structural ceiling above (dark void) */}
      <mesh position={[0, STRUCTURAL_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.w, ROOM.d]} />
        <meshStandardMaterial
          color="#050505"
          roughness={1}
          side={THREE.DoubleSide}
          transparent
          opacity={ceilingOpacity}
        />
      </mesh>
    </group>
  )
}

// Dropped panel grid ceiling — the primary ceiling design
function DroppedPanelGrid({ isConstruction, ceilingOpacity }) {
  if (isConstruction) {
    // Wireframe representation showing panel positions
    const totalW = GRID_COLS * PANEL_PITCH - PANEL_GAP
    const totalD = GRID_ROWS * PANEL_PITCH - PANEL_GAP
    const startX = -totalW / 2 + PANEL_SIZE / 2
    const startZ = -totalD / 2 + PANEL_SIZE / 2

    return (
      <group>
        {Array.from({ length: GRID_ROWS }, (_, row) =>
          Array.from({ length: GRID_COLS }, (_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[
                startX + col * PANEL_PITCH,
                DROPPED_H,
                startZ + row * PANEL_PITCH,
              ]}
            >
              <boxGeometry args={[PANEL_SIZE, PANEL_THICKNESS, PANEL_SIZE]} />
              <meshStandardMaterial color="#555" wireframe />
            </mesh>
          ))
        )}
        {/* Structural ceiling wireframe */}
        <mesh position={[0, STRUCTURAL_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM.w, ROOM.d]} />
          <meshStandardMaterial color="#333" wireframe />
        </mesh>
      </group>
    )
  }

  return (
    <Suspense
      fallback={
        <mesh position={[0, DROPPED_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROOM.w, ROOM.d]} />
          <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
        </mesh>
      }
    >
      <TexturedPanelGrid ceilingOpacity={ceilingOpacity} />
    </Suspense>
  )
}

// Keep mountain topology as an alternative
function MountainTopologyCeiling({ isConstruction, ceilingOpacity }) {
  // Seeded random for reproducible topology
  function seededRandom(seed) {
    let s = seed
    return () => {
      s = (s * 16807 + 0) % 2147483647
      return (s - 1) / 2147483646
    }
  }

  const geometry = useMemo(() => {
    const rand = seededRandom(42)
    const gridX = 14
    const gridZ = 14
    const vertices = []

    for (let iz = 0; iz <= gridZ; iz++) {
      for (let ix = 0; ix <= gridX; ix++) {
        const x = (ix / gridX - 0.5) * ROOM.w
        const z = (iz / gridZ - 0.5) * ROOM.d
        let h = 0
        h += Math.sin(x * 0.8 + 1.2) * Math.cos(z * 0.6 + 0.8) * 0.12
        h += Math.sin(x * 1.5 + z * 1.0) * 0.08
        h += Math.cos(x * 0.5 - z * 1.3 + 2.0) * 0.06
        h += Math.sin(x * 2.2 - z * 0.7) * 0.04
        h += (rand() - 0.5) * 0.08
        const edgeFade = Math.min(1, Math.min(ix, gridX - ix) / 2, Math.min(iz, gridZ - iz) / 2)
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

        // Triangle 1
        const a1 = new THREE.Vector3(...v00), b1 = new THREE.Vector3(...v10), c1 = new THREE.Vector3(...v01)
        const n1 = new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(b1, a1), new THREE.Vector3().subVectors(c1, a1)).normalize()
        positions.push(...v00, ...v10, ...v01)
        normals.push(n1.x, n1.y, n1.z, n1.x, n1.y, n1.z, n1.x, n1.y, n1.z)
        const s1 = baseShades[Math.floor(rand() * baseShades.length)] * (0.7 + Math.abs(n1.y) * 0.3)
        colors.push(s1, s1, s1 * 1.05, s1, s1, s1 * 1.05, s1, s1, s1 * 1.05)

        // Triangle 2
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
    <group position={[0, DROPPED_H, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          wireframe={isConstruction}
          side={THREE.DoubleSide}
          transparent
          opacity={isConstruction ? 1 : ceilingOpacity}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      {!isConstruction && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial color="#000" transparent opacity={ceilingOpacity * 0.5} />
        </lineSegments>
      )}
    </group>
  )
}

function OpenExposed({ isConstruction }) {
  if (!isConstruction) return null
  return (
    <mesh position={[0, STRUCTURAL_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROOM.w, ROOM.d]} />
      <meshStandardMaterial color="#444" wireframe side={THREE.DoubleSide} />
    </mesh>
  )
}

const CEILING_COMPONENTS = {
  droppedPanelGrid: DroppedPanelGrid,
  mountainTopology: MountainTopologyCeiling,
  openExposed: OpenExposed,
}

export default function Ceiling() {
  const { selections, viewMode } = useVariant()
  const { time } = useTimeline()
  const isConstruction = viewMode === 'construction'
  const variantId = selections.ceiling || 'droppedPanelGrid'
  const Component = CEILING_COMPONENTS[variantId] || DroppedPanelGrid

  const darknessAmount = Math.max(0, (time - 0.6) / 0.2)
  const ceilingOpacity = 1 - darknessAmount * 0.7

  return <Component isConstruction={isConstruction} ceilingOpacity={Math.max(0.3, ceilingOpacity)} />
}
