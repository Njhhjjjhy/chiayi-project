import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Instanced mesh renderer for firefly particles.
// Uses small spheres with emissive material and additive blending for reliable glow.

const tempObject = new THREE.Object3D()
const tempColor = new THREE.Color()

// Real-world LED is 3 mm diameter (~1.5 mm physical radius).
// Scaled up to 0.015 for visibility at sim camera distances.
// This is a display value, not a physical measurement.
export default function FireflyParticles({ count, positions, opacities, colors, size = 0.015 }) {
  const meshRef = useRef()

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 4, 4), [])
  // Base material color is GREEN — fireflies are green, never yellow.
  // depthTest disabled so LEDs render "through" the mountain topology ceiling —
  // the ceiling is the fabric, the fireflies are the LEDs behind it, they bleed
  // through via additive blending.
  // Narrow-band green 520-530nm per firefly-panels-reference spec. Matches
  // Luciola cerata / filiformis wavelength; #66ff88 read as pale mint.
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

      // Scale by opacity — invisible when 0, full size when 1
      const s = size * op
      tempObject.position.set(x, y, z)
      tempObject.scale.set(s, s, s)
      tempObject.updateMatrix()
      mesh.setMatrixAt(i, tempObject.matrix)

      // Set color per instance — fallback is green
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
