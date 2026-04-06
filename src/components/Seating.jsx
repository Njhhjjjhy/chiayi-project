import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useVariant } from '../hooks/useVariant.jsx'

const BENCH_HEIGHT = 0.45
const BENCH_DEPTH = 0.4
const BENCH_THICKNESS = 0.05
const ROOM_WIDTH = 10

// Seeded random for deterministic placement
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Build a simple seated human silhouette geometry (torso + head)
function createFigureGeometry() {
  const torso = new THREE.CylinderGeometry(0.14, 0.16, 0.45, 6)
  torso.translate(0, 0.225, 0)

  const head = new THREE.SphereGeometry(0.11, 6, 5)
  head.translate(0, 0.52, 0)

  return mergeGeos(torso, head)
}

function mergeGeos(a, b) {
  // Manual merge since BufferGeometryUtils may not be available
  const merged = new THREE.BufferGeometry()

  const posA = a.getAttribute('position')
  const posB = b.getAttribute('position')
  const totalVerts = posA.count + posB.count

  const positions = new Float32Array(totalVerts * 3)
  positions.set(posA.array, 0)
  positions.set(posB.array, posA.count * 3)

  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  // Merge indices
  const idxA = a.getIndex()
  const idxB = b.getIndex()
  if (idxA && idxB) {
    const indices = new Uint16Array(idxA.count + idxB.count)
    indices.set(idxA.array, 0)
    for (let i = 0; i < idxB.count; i++) {
      indices[idxA.count + i] = idxB.array[i] + posA.count
    }
    merged.setIndex(new THREE.BufferAttribute(indices, 1))
  }

  merged.computeVertexNormals()
  return merged
}

// Bench rows configuration
const ROWS = [
  { z: 2.0, width: 8, seats: 10 },
  { z: 3.5, width: 7, seats: 8 },
]

export default function Seating() {
  const { isConstruction, isLight } = useVariant()
  const meshRef = useRef()

  const figureMaterial = useMemo(() => {
    if (isConstruction) {
      return new THREE.MeshBasicMaterial({ color: '#666', wireframe: true })
    }
    return new THREE.MeshStandardMaterial({
      color: isLight ? '#3a3a3a' : '#1a1a1a',
      roughness: 1,
      metalness: 0,
    })
  }, [isConstruction, isLight])

  const benchMaterial = useMemo(() => {
    if (isConstruction) {
      return new THREE.MeshBasicMaterial({ color: '#888', wireframe: true })
    }
    return new THREE.MeshStandardMaterial({
      color: isLight ? '#5a4a3a' : '#1e1e1e',
      roughness: 0.85,
      metalness: 0,
    })
  }, [isConstruction, isLight])

  // Generate figure geometry once
  const figureGeometry = useMemo(() => createFigureGeometry(), [])

  // Count total figures and build their transforms
  const totalFigures = ROWS.reduce((sum, row) => sum + row.seats, 0)

  const figureTransforms = useMemo(() => {
    const rand = seededRandom(42)
    const transforms = []

    for (const row of ROWS) {
      const startX = -row.width / 2 + 0.4
      const spacing = (row.width - 0.8) / (row.seats - 1)

      for (let i = 0; i < row.seats; i++) {
        const x = startX + i * spacing
        // Skip center aisle
        if (Math.abs(x) < 0.5) continue

        const leanAngle = (rand() - 0.5) * 0.08
        const heightVariation = 0.85 + rand() * 0.15 // 0.85-1.0 scale (adults/children)
        const zOffset = (rand() - 0.5) * 0.1

        transforms.push({
          x,
          z: row.z + zOffset,
          lean: leanAngle,
          scale: heightVariation,
        })
      }
    }

    return transforms
  }, [])

  // Set instance matrices
  useMemo(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()

    figureTransforms.forEach((t, i) => {
      dummy.position.set(t.x, BENCH_HEIGHT, t.z)
      dummy.rotation.set(0, 0, t.lean)
      dummy.scale.setScalar(t.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [figureTransforms])

  // Update instance matrices on first frame (ref may not be ready in useMemo)
  const initialized = useRef(false)
  useFrame(() => {
    if (!initialized.current && meshRef.current) {
      const dummy = new THREE.Object3D()
      figureTransforms.forEach((t, i) => {
        dummy.position.set(t.x, BENCH_HEIGHT, t.z)
        dummy.rotation.set(0, 0, t.lean)
        dummy.scale.setScalar(t.scale)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
      initialized.current = true
    }
  })

  return (
    <group>
      {/* Benches */}
      {ROWS.map((row, i) => (
        <group key={i}>
          {/* Bench seat */}
          <mesh
            position={[-(row.width / 2 + 0.3) / 2 - 0.25, BENCH_HEIGHT - BENCH_THICKNESS / 2, row.z]}
            material={benchMaterial}
          >
            <boxGeometry args={[row.width / 2 - 0.6, BENCH_THICKNESS, BENCH_DEPTH]} />
          </mesh>
          <mesh
            position={[(row.width / 2 + 0.3) / 2 + 0.25, BENCH_HEIGHT - BENCH_THICKNESS / 2, row.z]}
            material={benchMaterial}
          >
            <boxGeometry args={[row.width / 2 - 0.6, BENCH_THICKNESS, BENCH_DEPTH]} />
          </mesh>

          {/* Bench legs */}
          {[-row.width / 2 + 0.3, -0.6, 0.6, row.width / 2 - 0.3].map((x, j) => (
            <mesh key={j} position={[x, BENCH_HEIGHT / 2 - BENCH_THICKNESS, row.z]} material={benchMaterial}>
              <boxGeometry args={[0.04, BENCH_HEIGHT - BENCH_THICKNESS, 0.04]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Seated figures — instanced */}
      <instancedMesh
        ref={meshRef}
        args={[figureGeometry, figureMaterial, figureTransforms.length]}
        castShadow
        receiveShadow
      />
    </group>
  )
}
