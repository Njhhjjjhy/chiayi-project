import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useLightingState } from '../hooks/useLightingState.jsx'
import { useVariant } from '../hooks/useVariant.jsx'
import { useTimeline } from '../hooks/useTimeline.jsx'

const WALL_WIDTH = 10
const WALL_HEIGHT = 3.5

// 5-stop vertical gradient shader that animates with the timeline
function SkyGradientMaterial({ topColor, midTopColor, midColor, midBottomColor, bottomColor }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color(topColor) },
        uMidTop: { value: new THREE.Color(midTopColor) },
        uMid: { value: new THREE.Color(midColor) },
        uMidBottom: { value: new THREE.Color(midBottomColor) },
        uBottom: { value: new THREE.Color(bottomColor) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTop;
        uniform vec3 uMidTop;
        uniform vec3 uMid;
        uniform vec3 uMidBottom;
        uniform vec3 uBottom;
        varying vec2 vUv;

        vec3 gradient5(float t) {
          if (t < 0.25) return mix(uBottom, uMidBottom, t / 0.25);
          if (t < 0.5) return mix(uMidBottom, uMid, (t - 0.25) / 0.25);
          if (t < 0.75) return mix(uMid, uMidTop, (t - 0.5) / 0.25);
          return mix(uMidTop, uTop, (t - 0.75) / 0.25);
        }

        void main() {
          gl_FragColor = vec4(gradient5(vUv.y), 1.0);
        }
      `,
    })
  }, [])

  material.uniforms.uTop.value.set(topColor)
  material.uniforms.uMidTop.value.set(midTopColor)
  material.uniforms.uMid.value.set(midColor)
  material.uniforms.uMidBottom.value.set(midBottomColor)
  material.uniforms.uBottom.value.set(bottomColor)

  return <primitive object={material} attach="material" />
}

// Compute 5-stop gradient colors based on timeline phase
function useGradientColors() {
  const { time } = useTimeline()

  // Phase 1 (0-0.25): warm sunset
  // Phase 2 (0.25-0.5): blue hour
  // Phase 3 (0.5-0.75): darkness transition
  // Phase 4 (0.75-1.0): total dark

  const sunset = {
    top: '#f5c842',
    midTop: '#e8a030',
    mid: '#e87d3e',
    midBottom: '#c44b6c',
    bottom: '#5a3b8a',
  }

  const blueHour = {
    top: '#5a3b8a',
    midTop: '#3a2a5a',
    mid: '#2a1a3a',
    midBottom: '#1a1a2e',
    bottom: '#0a0a1a',
  }

  const dark = {
    top: '#000000',
    midTop: '#000000',
    mid: '#000000',
    midBottom: '#000000',
    bottom: '#000000',
  }

  function lerpColor(a, b, t) {
    const ca = new THREE.Color(a)
    const cb = new THREE.Color(b)
    return '#' + ca.lerp(cb, t).getHexString()
  }

  function lerpGradient(g1, g2, t) {
    return {
      top: lerpColor(g1.top, g2.top, t),
      midTop: lerpColor(g1.midTop, g2.midTop, t),
      mid: lerpColor(g1.mid, g2.mid, t),
      midBottom: lerpColor(g1.midBottom, g2.midBottom, t),
      bottom: lerpColor(g1.bottom, g2.bottom, t),
    }
  }

  if (time < 0.25) {
    return sunset
  } else if (time < 0.5) {
    const t = (time - 0.25) / 0.25
    return lerpGradient(sunset, blueHour, t)
  } else if (time < 0.75) {
    const t = (time - 0.5) / 0.25
    return lerpGradient(blueHour, dark, t)
  } else {
    return dark
  }
}

function SunLines() {
  const { time } = useTimeline()
  // Sun lines visible during sunset, fade through blue hour
  const opacity = time < 0.25 ? 1 : time < 0.5 ? 1 - (time - 0.25) / 0.25 : 0
  if (opacity <= 0) return null

  const linePositions = [1.8, 2.0, 2.2, 2.5, 2.7]
  const lineWidths = [8, 7, 6.5, 7.5, 5]

  return (
    <group position={[0, 0, -5.05]}>
      {linePositions.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <planeGeometry args={[lineWidths[i], 0.015]} />
          <meshBasicMaterial
            color="#f5c842"
            transparent
            opacity={opacity * (0.4 + Math.random() * 0.2)}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function SkyBackdrop() {
  const { isConstruction, isLight, selections } = useVariant()
  const gradient = useGradientColors()

  if (isConstruction) return null
  if (selections.wall !== 'layeredMountain') return null

  if (isLight) {
    return (
      <mesh position={[0, WALL_HEIGHT / 2, -5.1]}>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <meshBasicMaterial color="#c8c0b0" />
      </mesh>
    )
  }

  return (
    <group>
      <mesh position={[0, WALL_HEIGHT / 2, -5.1]}>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <SkyGradientMaterial
          topColor={gradient.top}
          midTopColor={gradient.midTop}
          midColor={gradient.mid}
          midBottomColor={gradient.midBottom}
          bottomColor={gradient.bottom}
        />
      </mesh>
      <SunLines />
    </group>
  )
}
