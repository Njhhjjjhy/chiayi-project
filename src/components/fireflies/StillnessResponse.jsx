import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeCeilingModules } from './surfacePositions.js'

// "The listening dark" — fireflies respond to camera stillness.
// When the camera stops moving for 3 seconds, nearby fireflies fade in.
// If the camera moves, they fade out. The room "listens" to you.

const FIREFLY_COLOR = [0.9, 0.78, 0.29]
const STILLNESS_THRESHOLD = 3 // seconds before fireflies respond
const RESPONSE_RADIUS = 4 // meters — how far from camera fireflies respond
const FADE_IN_SPEED = 0.4
const FADE_OUT_SPEED = 0.8
const MOVEMENT_THRESHOLD = 0.01 // camera velocity threshold

export default function StillnessResponse({ masterOpacity = 1 }) {
  const data = useMemo(() => distributeCeilingModules(100), [])
  const opacities = useMemo(() => new Float32Array(data.count), [data.count])
  const targetOpacities = useMemo(() => new Float32Array(data.count), [data.count])
  const colors = useMemo(() => {
    const c = new Float32Array(data.count * 3)
    for (let i = 0; i < data.count; i++) {
      c[i * 3] = FIREFLY_COLOR[0]
      c[i * 3 + 1] = FIREFLY_COLOR[1]
      c[i * 3 + 2] = FIREFLY_COLOR[2]
    }
    return c
  }, [data.count])

  const { camera } = useThree()
  const state = useRef({
    lastCamPos: { x: 0, y: 0, z: 0 },
    stillTime: 0,
    isStill: false,
  })
  const lightRefs = useRef([])

  useFrame((_, dt) => {
    const s = state.current
    const cam = camera.position

    const dx = cam.x - s.lastCamPos.x
    const dy = cam.y - s.lastCamPos.y
    const dz = cam.z - s.lastCamPos.z
    const velocity = Math.sqrt(dx * dx + dy * dy + dz * dz) / Math.max(dt, 0.001)

    s.lastCamPos.x = cam.x
    s.lastCamPos.y = cam.y
    s.lastCamPos.z = cam.z

    if (velocity < MOVEMENT_THRESHOLD) {
      s.stillTime += dt
    } else {
      s.stillTime = 0
    }
    s.isStill = s.stillTime > STILLNESS_THRESHOLD

    for (let i = 0; i < data.count; i++) {
      const fx = data.positions[i * 3]
      const fz = data.positions[i * 3 + 2]
      const dist = Math.sqrt((fx - cam.x) ** 2 + (fz - cam.z) ** 2)

      if (s.isStill && dist < RESPONSE_RADIUS) {
        const proximity = 1 - dist / RESPONSE_RADIUS
        const pulse = Math.max(0, Math.sin(s.stillTime * data.speeds[i] + data.phases[i]))
        targetOpacities[i] = proximity * pulse * data.baseIntensities[i]
      } else {
        targetOpacities[i] = 0
      }

      const fadeSpeed = targetOpacities[i] > opacities[i] ? FADE_IN_SPEED : FADE_OUT_SPEED
      opacities[i] += (targetOpacities[i] - opacities[i]) * fadeSpeed * dt * 3
      opacities[i] = Math.max(0, opacities[i]) * masterOpacity
    }

    // Drive real lights
    for (let li = 0; li < 16; li++) {
      const light = lightRefs.current[li]
      if (light) light.intensity = (opacities[li * 6] || 0) * 0.6
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
      {Array.from({ length: 16 }, (_, i) => {
        const fi = i * 6
        return (
          <pointLight
            key={i}
            ref={(el) => { lightRefs.current[i] = el }}
            position={[data.positions[fi * 3], data.positions[fi * 3 + 1], data.positions[fi * 3 + 2]]}
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
