import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Shared instanced particle renderer used by all firefly variants.
// Each variant provides a positions array, an opacities array, and a colors array.
// This component renders them as soft glowing points with additive blending.

const vertexShader = `
  attribute float aOpacity;
  attribute vec3 aColor;
  varying float vOpacity;
  varying vec3 vColor;
  uniform float uSize;

  void main() {
    vOpacity = aOpacity;
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    // Soft glow falloff
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 1.5);
    gl_FragColor = vec4(vColor, glow * vOpacity);
  }
`

export default function FireflyParticles({ count, positions, opacities, colors, size = 0.15 }) {
  const pointsRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(new Float32Array(count), 1))
    geo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    return geo
  }, [count])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uSize: { value: size } },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  // Update size uniform
  useEffect(() => {
    material.uniforms.uSize.value = size
  }, [size, material])

  // Update buffer attributes each frame
  useFrame(() => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry

    const posAttr = geo.getAttribute('position')
    const opAttr = geo.getAttribute('aOpacity')
    const colAttr = geo.getAttribute('aColor')

    if (positions) {
      posAttr.array.set(positions)
      posAttr.needsUpdate = true
    }
    if (opacities) {
      opAttr.array.set(opacities)
      opAttr.needsUpdate = true
    }
    if (colors) {
      colAttr.array.set(colors)
      colAttr.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  )
}
