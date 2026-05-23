import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Instanced sphere renderer for firefly particles. Identical to v1 —
// no v1 dimension dependencies. Additive blending + depthTest=false so
// the particles read as light bleeding through the panel fabric layer.
//
// LED visible point = 3 mm (0.003 scene units). Real-world LED size —
// do not inflate for "visibility".

const tempObject = new THREE.Object3D()
const tempColor = new THREE.Color()

export default function FireflyParticles({ count, positions, opacities, colors, size = 0.003 }) {
  const meshRef = useRef()

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 4, 4), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00ff6a',
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  }), [])

  useFrame(() => {
    if (!meshRef.current || !positions) return
    const mesh = meshRef.current

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      const op = opacities ? opacities[i] : 1

      const s = size * op
      tempObject.position.set(x, y, z)
      tempObject.scale.set(s, s, s)
      tempObject.updateMatrix()
      mesh.setMatrixAt(i, tempObject.matrix)

      if (colors) {
        tempColor.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])
      } else {
        tempColor.setRGB(0.4, 1.0, 0.5)
      }
      mesh.setColorAt(i, tempColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
  )
}
