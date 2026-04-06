import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeCeilingModules } from './surfacePositions.js'

// "Scattered souls" — all 100 fireflies animate independently.
// Each has its own random speed and phase. No coordination.
// Staggered activation: fireflies turn on one by one over ~10 seconds.

const FIREFLY_COLOR = [0.9, 0.78, 0.29] // #e6c84a warm yellow-green
const REAL_LIGHT_COUNT = 16
const LIGHT_STRIDE = 6 // every 6th firefly gets a real point light

export default function ScatteredDrift({ masterOpacity = 1 }) {
  const data = useMemo(() => distributeCeilingModules(100), [])
  const opacities = useMemo(() => new Float32Array(data.count), [data.count])
  const colors = useMemo(() => {
    const c = new Float32Array(data.count * 3)
    for (let i = 0; i < data.count; i++) {
      c[i * 3] = FIREFLY_COLOR[0]
      c[i * 3 + 1] = FIREFLY_COLOR[1]
      c[i * 3 + 2] = FIREFLY_COLOR[2]
    }
    return c
  }, [data.count])

  const activationDelays = useMemo(() => {
    const delays = new Float32Array(data.count)
    for (let i = 0; i < data.count; i++) {
      delays[i] = 0.5 + Math.random() * 10
    }
    return delays
  }, [data.count])

  const elapsed = useRef(0)
  const lightRefs = useRef([])

  useFrame((_, dt) => {
    elapsed.current += dt

    for (let i = 0; i < data.count; i++) {
      const activeTime = elapsed.current - activationDelays[i]
      if (activeTime < 0) {
        opacities[i] = 0
        continue
      }
      const fadeIn = Math.min(1, activeTime / 2)
      const pulse = Math.max(0, Math.sin(elapsed.current * data.speeds[i] + data.phases[i]))
      opacities[i] = pulse * data.baseIntensities[i] * fadeIn * masterOpacity
    }

    // Update real point light intensities
    for (let li = 0; li < REAL_LIGHT_COUNT; li++) {
      const light = lightRefs.current[li]
      if (light) {
        const fi = li * LIGHT_STRIDE
        light.intensity = (opacities[fi] || 0) * 0.6
      }
    }
  })

  return (
    <group>
      <FireflyParticles
        count={data.count}
        positions={data.positions}
        opacities={opacities}
        colors={colors}
        size={0.04}
      />
      {Array.from({ length: REAL_LIGHT_COUNT }, (_, i) => {
        const fi = i * LIGHT_STRIDE
        return (
          <pointLight
            key={i}
            ref={(el) => { lightRefs.current[i] = el }}
            position={[
              data.positions[fi * 3],
              data.positions[fi * 3 + 1],
              data.positions[fi * 3 + 2],
            ]}
            color="#e6c84a"
            intensity={0}
            distance={2.5}
            decay={2}
          />
        )
      })}
    </group>
  )
}
