import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeSurface } from './surfacePositions.js'

const SPECIES = [
  { count: 100, cycle: 4, color: [1.0, 0.67, 0.24] },
  { count: 120, cycle: 3, color: [1.0, 0.78, 0.39] },
  { count: 80, cycle: 10, color: [0.78, 0.9, 0.39] },
]

const TOTAL = SPECIES.reduce((sum, s) => sum + s.count, 0)

export default function FlashLanguage({ masterOpacity }) {
  useControls('fireflies', {
    flashLanguage: folder({
      info: { value: '3 species: amber, yellow, green', editable: false, label: 'Species' },
    }, { collapsed: true }),
  })

  const state = useRef(null)

  if (!state.current) {
    const { positions } = distributeSurface(TOTAL, { ceiling: 0.5, leftWall: 0.25, rightWall: 0.25 }, 101)
    const opacities = new Float32Array(TOTAL)
    const colors = new Float32Array(TOTAL * 3)
    const phases = new Float32Array(TOTAL)

    let idx = 0
    for (const species of SPECIES) {
      for (let i = 0; i < species.count; i++) {
        colors[idx * 3] = species.color[0]
        colors[idx * 3 + 1] = species.color[1]
        colors[idx * 3 + 2] = species.color[2]
        phases[idx] = Math.random() * species.cycle
        idx++
      }
    }

    state.current = { positions, opacities, colors, phases }
  }

  useFrame(() => {
    const s = state.current
    const t = Date.now() / 1000
    let idx = 0

    for (let si = 0; si < SPECIES.length; si++) {
      const species = SPECIES[si]
      for (let i = 0; i < species.count; i++) {
        const phase = (t + s.phases[idx]) % species.cycle
        const norm = phase / species.cycle
        let brightness = 0

        if (si === 0) {
          if (norm < 0.375) brightness = norm / 0.375
          else if (norm < 0.625) brightness = 1
          else brightness = 1 - (norm - 0.625) / 0.375
        } else if (si === 1) {
          const tInCycle = phase
          if (tInCycle < 0.15) brightness = 1
          else if (tInCycle < 0.4) brightness = 0
          else if (tInCycle < 0.55) brightness = 1
          else brightness = 0
        } else {
          const tInCycle = phase
          if (tInCycle < 2) {
            brightness = Math.sin(tInCycle * Math.PI * 6) > 0.3 ? 0.9 : 0.05
          } else {
            brightness = 0
          }
        }

        s.opacities[idx] = brightness * masterOpacity
        idx++
      }
    }
  })

  return (
    <FireflyParticles
      count={TOTAL}
      positions={state.current.positions}
      opacities={state.current.opacities}
      colors={state.current.colors}
      size={0.03}
    />
  )
}
