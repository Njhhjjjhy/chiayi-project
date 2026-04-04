import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'

const ROOM = { w: 10, h: 3.5, d: 10 }

export default function CanopyGrid({ masterOpacity }) {
  const { gridSpacing, stripMinLen, stripMaxLen, swayAmp, swayFreq } = useControls('fireflies', {
    canopyGrid: folder({
      gridSpacing: { value: 1.2, min: 0.5, max: 2.5, step: 0.1, label: 'Grid spacing (m)' },
      stripMinLen: { value: 0.4, min: 0.1, max: 1, step: 0.1, label: 'Min strip length' },
      stripMaxLen: { value: 1.5, min: 0.5, max: 2.5, step: 0.1, label: 'Max strip length' },
      swayAmp: { value: 0.15, min: 0, max: 0.5, step: 0.01, label: 'Sway amplitude' },
      swayFreq: { value: 0.8, min: 0.1, max: 2, step: 0.1, label: 'Sway frequency' },
    }, { collapsed: true }),
  })

  // Generate grid points
  const strips = useMemo(() => {
    const result = []
    const halfW = ROOM.w / 2 - 1
    const halfD = ROOM.d / 2 - 1
    for (let x = -halfW; x <= halfW; x += gridSpacing) {
      for (let z = -halfD; z <= halfD; z += gridSpacing) {
        const len = stripMinLen + Math.random() * (stripMaxLen - stripMinLen)
        result.push({
          baseX: x + (Math.random() - 0.5) * 0.2,
          baseZ: z + (Math.random() - 0.5) * 0.2,
          length: len,
          phase: Math.random() * Math.PI * 2,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.3 + Math.random() * 0.4,
        })
      }
    }
    return result
  }, [gridSpacing, stripMinLen, stripMaxLen])

  const groupRef = useRef()

  useFrame(() => {
    if (!groupRef.current) return
    const t = Date.now() / 1000
    const children = groupRef.current.children

    for (let i = 0; i < strips.length && i < children.length; i++) {
      const strip = strips[i]
      const group = children[i]

      // Sway
      const swayX = Math.sin(t * swayFreq + strip.phase) * swayAmp
      const swayZ = Math.cos(t * swayFreq * 0.7 + strip.phase * 1.3) * swayAmp * 0.6
      group.position.x = strip.baseX + swayX
      group.position.z = strip.baseZ + swayZ

      // Pulse the light (second child = pointLight)
      const light = group.children[1]
      if (light) {
        const pulse = (Math.sin(t * strip.pulseSpeed + strip.pulsePhase) * 0.5 + 0.5)
        light.intensity = pulse * 0.8 * masterOpacity
      }
    }
  })

  return (
    <group ref={groupRef}>
      {strips.map((strip, i) => {
        const tipY = ROOM.h - strip.length
        return (
          <group key={i} position={[strip.baseX, 0, strip.baseZ]}>
            {/* Hanging fiber strip */}
            <mesh position={[0, ROOM.h - strip.length / 2, 0]}>
              <boxGeometry args={[0.008, strip.length, 0.008]} />
              <meshStandardMaterial
                color="#8a7a60"
                transparent
                opacity={0.4 * masterOpacity}
              />
            </mesh>
            {/* LED at tip */}
            <pointLight
              position={[0, tipY, 0]}
              color="#ffb060"
              intensity={0.5 * masterOpacity}
              distance={1.5}
              decay={2}
            />
            {/* Visible glow sphere at tip */}
            <mesh position={[0, tipY, 0]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial color="#ffcc80" transparent opacity={0.8 * masterOpacity} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
