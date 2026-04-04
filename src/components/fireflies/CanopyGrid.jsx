import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'

const ROOM = { w: 10, h: 3.5, d: 10 }

export default function CanopyGrid({ masterOpacity }) {
  const { gridSpacing, stripMinLen, stripMaxLen, swayAmp, swayFreq } = useControls('fireflies', {
    canopyGrid: folder({
      gridSpacing: { value: 1.0, min: 0.7, max: 2.5, step: 0.1, label: 'Grid spacing (m)' },
      stripMinLen: { value: 0.4, min: 0.1, max: 1, step: 0.1, label: 'Min strip length' },
      stripMaxLen: { value: 1.5, min: 0.5, max: 2.5, step: 0.1, label: 'Max strip length' },
      swayAmp: { value: 0.15, min: 0, max: 0.5, step: 0.01, label: 'Sway amplitude' },
      swayFreq: { value: 0.8, min: 0.1, max: 2, step: 0.1, label: 'Sway frequency' },
    }, { collapsed: true }),
  })

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

  const count = strips.length
  const state = useRef(null)

  if (!state.current || state.current.count !== count) {
    const positions = new Float32Array(count * 3)
    const opacities = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const s = strips[i]
      positions[i * 3] = s.baseX
      positions[i * 3 + 1] = ROOM.h - s.length
      positions[i * 3 + 2] = s.baseZ
      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.8
      colors[i * 3 + 2] = 0.5
    }
    state.current = { positions, opacities, colors, count }
  }

  useFrame(() => {
    const s = state.current
    const t = Date.now() / 1000

    for (let i = 0; i < count; i++) {
      const strip = strips[i]

      // Sway position
      const swayX = Math.sin(t * swayFreq + strip.phase) * swayAmp
      const swayZ = Math.cos(t * swayFreq * 0.7 + strip.phase * 1.3) * swayAmp * 0.6
      s.positions[i * 3] = strip.baseX + swayX
      s.positions[i * 3 + 1] = ROOM.h - strip.length
      s.positions[i * 3 + 2] = strip.baseZ + swayZ

      // Pulse
      const pulse = Math.sin(t * strip.pulseSpeed + strip.pulsePhase) * 0.5 + 0.5
      s.opacities[i] = pulse * masterOpacity
    }
  })

  // A few point lights for ambient glow (just 4, not per-strip)
  return (
    <>
      <FireflyParticles
        count={count}
        positions={state.current.positions}
        opacities={state.current.opacities}
        colors={state.current.colors}
        size={0.25}
      />
      {/* Minimal ambient point lights for glow on surrounding geometry */}
      {[[-2, 0], [2, 0], [0, -2], [0, 2]].map(([x, z], i) => (
        <pointLight
          key={i}
          position={[x, ROOM.h - 1, z]}
          color="#ffb060"
          intensity={0.5 * masterOpacity}
          distance={4}
          decay={2}
        />
      ))}
    </>
  )
}
