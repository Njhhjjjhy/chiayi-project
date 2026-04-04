import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'

const ROOM = { w: 10, h: 3.5, d: 10 }
// The veil is on the front wall (opposite the mountain wall), at z = +5
const WALL_Z = 4.9

export default function TheVeil({ masterOpacity }) {
  const { lightCount, depthLevels, cycleMin, cycleMax } = useControls('fireflies', {
    theVeil: folder({
      lightCount: { value: 60, min: 20, max: 120, step: 5, label: 'Light count' },
      depthLevels: { value: 4, min: 2, max: 6, step: 1, label: 'Depth levels' },
      cycleMin: { value: 4, min: 1, max: 8, step: 0.5, label: 'Min cycle (s)' },
      cycleMax: { value: 8, min: 3, max: 15, step: 0.5, label: 'Max cycle (s)' },
    }, { collapsed: true }),
  })

  const lights = useMemo(() => {
    const result = []
    for (let i = 0; i < lightCount; i++) {
      const depthLevel = Math.floor(Math.random() * depthLevels)
      const depthFraction = depthLevel / (depthLevels - 1) // 0 = surface, 1 = deepest
      result.push({
        x: (Math.random() - 0.5) * ROOM.w * 0.85,
        y: 0.3 + Math.random() * (ROOM.h - 0.6),
        depth: depthFraction,
        cycle: cycleMin + Math.random() * (cycleMax - cycleMin),
        phase: Math.random() * Math.PI * 2,
        // Deeper lights are more diffuse (larger, dimmer)
        size: 0.015 + depthFraction * 0.025,
        maxIntensity: 0.6 * (1 - depthFraction * 0.5),
      })
    }
    return result
  }, [lightCount, depthLevels, cycleMin, cycleMax])

  const groupRef = useRef()

  useFrame(() => {
    if (!groupRef.current) return
    const t = Date.now() / 1000
    const children = groupRef.current.children

    for (let i = 0; i < lights.length && i < children.length; i++) {
      const light = lights[i]
      const brightness = (Math.sin(t / light.cycle * Math.PI * 2 + light.phase) * 0.5 + 0.5)
      const group = children[i]

      // Update sphere material opacity
      const sphere = group.children[0]
      if (sphere && sphere.material) {
        sphere.material.opacity = brightness * light.maxIntensity * masterOpacity
      }

      // Update point light
      const pl = group.children[1]
      if (pl) {
        pl.intensity = brightness * light.maxIntensity * 0.3 * masterOpacity
      }
    }
  })

  // Fiber texture background on the wall
  return (
    <group>
      {/* Fiber texture base */}
      <mesh position={[0, ROOM.h / 2, WALL_Z]}>
        <planeGeometry args={[ROOM.w * 0.9, ROOM.h * 0.85]} />
        <meshStandardMaterial color="#1a1510" roughness={1} transparent opacity={0.6 * masterOpacity} />
      </mesh>

      {/* Embedded lights */}
      <group ref={groupRef}>
        {lights.map((light, i) => {
          const z = WALL_Z - light.depth * 0.15
          return (
            <group key={i} position={[light.x, light.y, z]}>
              <mesh>
                <sphereGeometry args={[light.size, 6, 6]} />
                <meshBasicMaterial
                  color="#ffd0a0"
                  transparent
                  opacity={0.5 * masterOpacity}
                />
              </mesh>
              <pointLight
                color="#ffb870"
                intensity={0.2 * masterOpacity}
                distance={0.8 + (1 - light.depth) * 0.5}
                decay={2}
              />
            </group>
          )
        })}
      </group>
    </group>
  )
}
