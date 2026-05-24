import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  WALL_DOT_RADIUS,
  WALL_DOT_COLOR, WALL_DOT_INTENSITY,
  WALL_DOT_BREATHE_PERIOD, WALL_DOT_BREATHE_AMPLITUDE,
} from '../../geometry/dimensions.js'
import { buildWallDots } from '../../geometry/wallDotPlacement.js'

// Static ambient wall glow dots. When no firefly behaviour is active
// the dots render here with a slow uniform breathe driven by a time
// uniform. When a behaviour IS active the room mounts WallFireflies
// instead (which drives per-dot opacity from the same positions), and
// this component hides itself via `hideLeds` to avoid double-rendering.

const DOT_GEO = new THREE.SphereGeometry(WALL_DOT_RADIUS, 8, 8)

const DOT_MATERIAL = new THREE.MeshStandardMaterial({
  color: WALL_DOT_COLOR,
  emissive: WALL_DOT_COLOR,
  emissiveIntensity: WALL_DOT_INTENSITY,
  roughness: 1.0,
  metalness: 0,
})

const BREATHE_UNIFORMS = {
  uTime: { value: 0 },
  uPeriod: { value: WALL_DOT_BREATHE_PERIOD },
  uAmp: { value: WALL_DOT_BREATHE_AMPLITUDE },
}

DOT_MATERIAL.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = BREATHE_UNIFORMS.uTime
  shader.uniforms.uPeriod = BREATHE_UNIFORMS.uPeriod
  shader.uniforms.uAmp = BREATHE_UNIFORMS.uAmp

  shader.vertexShader =
    'attribute float aPhase;\nvarying float vPhase;\n' +
    shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvPhase = aPhase;',
    )

  shader.fragmentShader =
    'uniform float uTime;\nuniform float uPeriod;\nuniform float uAmp;\nvarying float vPhase;\n' +
    shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float wdAngle = uTime * 6.2831853 / uPeriod + vPhase;
       float wdBreathe = 1.0 - uAmp * 0.5 + uAmp * 0.5 * sin(wdAngle);
       totalEmissiveRadiance *= wdBreathe;`,
    )
}

function buildInstancedMesh() {
  const { positions, phases, count } = buildWallDots()
  const mesh = new THREE.InstancedMesh(DOT_GEO, DOT_MATERIAL, count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < count; i++) {
    dummy.position.set(
      positions[i * 3 + 0],
      positions[i * 3 + 1],
      positions[i * 3 + 2],
    )
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.frustumCulled = false
  mesh.geometry.setAttribute(
    'aPhase',
    new THREE.InstancedBufferAttribute(phases, 1),
  )
  return mesh
}

const INSTANCED_MESH = buildInstancedMesh()

export default function WallGlowDots({ hideLeds = false }) {
  useFrame((state) => {
    BREATHE_UNIFORMS.uTime.value = state.clock.getElapsedTime()
  })
  if (hideLeds) return null
  return <primitive object={INSTANCED_MESH} />
}
