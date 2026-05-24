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
// One shared InstancedMesh built at module load with an aOpacity
// InstancedBufferAttribute pre-attached to the shared geometry. The
// component's useFrame copies the prop opacities into the attribute
// and marks it dirty. Only ever one behaviour is mounted at a time
// (FireflySystem dispatch), so the singleton mesh is safe.

const DOT_GEO = new THREE.SphereGeometry(WALL_DOT_RADIUS, 8, 8)

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

const { positions: WALL_POSITIONS, count: WALL_COUNT } = buildWallDots()

const OPACITY_BUFFER = new Float32Array(WALL_COUNT)
const OPACITY_ATTR = new THREE.InstancedBufferAttribute(OPACITY_BUFFER, 1)
OPACITY_ATTR.setUsage(THREE.DynamicDrawUsage)

function buildInstancedMesh() {
  const mesh = new THREE.InstancedMesh(DOT_GEO, DOT_MATERIAL, WALL_COUNT)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < WALL_COUNT; i++) {
    dummy.position.set(
      WALL_POSITIONS[i * 3 + 0],
      WALL_POSITIONS[i * 3 + 1],
      WALL_POSITIONS[i * 3 + 2],
    )
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  mesh.geometry.setAttribute('aOpacity', OPACITY_ATTR)
  return mesh
}

const INSTANCED_MESH = buildInstancedMesh()

export default function WallFireflies({ opacities }) {
  useFrame(() => {
    if (!opacities) return
    const n = Math.min(opacities.length, WALL_COUNT)
    for (let i = 0; i < n; i++) OPACITY_BUFFER[i] = opacities[i]
    OPACITY_ATTR.needsUpdate = true
  })

  return <primitive object={INSTANCED_MESH} />
}
