import * as THREE from 'three'
import { useMemo } from 'react'
import { useLightingState } from '../hooks/useLightingState.jsx'
import { useVariant } from '../hooks/useVariant.jsx'

const WALL_WIDTH = 10
const WALL_HEIGHT = 3.5

function SkyGradientMaterial({ topColor, bottomColor }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(topColor) },
        bottomColor: { value: new THREE.Color(bottomColor) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
        }
      `,
    })
  }, [])

  // Update uniforms reactively
  material.uniforms.topColor.value.set(topColor)
  material.uniforms.bottomColor.value.set(bottomColor)

  return <primitive object={material} attach="material" />
}

export default function SkyBackdrop() {
  const { viewMode } = useVariant()
  const { skyTopColor, skyBottomColor } = useLightingState()

  if (viewMode === 'construction') return null

  return (
    <mesh position={[0, WALL_HEIGHT / 2, -5.1]}>
      <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
      <SkyGradientMaterial topColor={skyTopColor} bottomColor={skyBottomColor} />
    </mesh>
  )
}
