import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  WALL_DOT_RADIUS, WALL_DOT_COLOR, WALL_DOT_INTENSITY,
} from '../../geometry/dimensions.js'
import { buildWallDots } from '../../geometry/wallDotPlacement.js'

// Behaviour-driven wall LEDs. Same physical 8mm cream-green spheres
// as WallGlowDots so the room looks consistent, but instead of running
// a uniform shader breathe they take a per-dot opacity buffer from the
// active firefly behaviour and modulate emissive intensity per-instance.
//
// Mesh, geometry, and opacity buffer are owned by the mounted component
// (useMemo) so two simultaneous behaviour mounts can never share state.
// The standard MeshStandardMaterial is shared across mounts; the per-
// instance opacity flows through the geometry's aOpacity attribute, so
// each mount's geometry carries its own buffer independently.

const DOT_MATERIAL = new THREE.MeshStandardMaterial({
  color: WALL_DOT_COLOR,
  emissive: WALL_DOT_COLOR,
  emissiveIntensity: WALL_DOT_INTENSITY,
  roughness: 1.0,
  metalness: 0,
})

DOT_MATERIAL.onBeforeCompile = (shader) => {
  shader.vertexShader =
    'attribute float aOpacity;\nvarying float vOpacity;\n' +
    shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvOpacity = aOpacity;',
    )

  shader.fragmentShader =
    'varying float vOpacity;\n' +
    shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       totalEmissiveRadiance *= vOpacity;`,
    )
}

export default function WallFireflies({ opacities }) {
  const { mesh, buffer, attr } = useMemo(() => {
    const { positions, count } = buildWallDots()
    const geometry = new THREE.SphereGeometry(WALL_DOT_RADIUS, 8, 8)
    const opacityBuffer = new Float32Array(count)
    const opacityAttr = new THREE.InstancedBufferAttribute(opacityBuffer, 1)
    opacityAttr.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('aOpacity', opacityAttr)

    const instanced = new THREE.InstancedMesh(geometry, DOT_MATERIAL, count)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        positions[i * 3 + 0],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
      )
      dummy.updateMatrix()
      instanced.setMatrixAt(i, dummy.matrix)
    }
    instanced.instanceMatrix.needsUpdate = true
    instanced.frustumCulled = false
    return { mesh: instanced, buffer: opacityBuffer, attr: opacityAttr }
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    if (!opacities) return
    const n = Math.min(opacities.length, buffer.length)
    for (let i = 0; i < n; i++) buffer[i] = opacities[i]
    attr.needsUpdate = true
  })
  /* eslint-enable react-hooks/immutability */

  return <primitive object={mesh} />
}
