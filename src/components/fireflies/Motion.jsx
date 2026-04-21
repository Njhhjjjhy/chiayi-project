import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits } from './surfacePositions.js'

// Phase 3 — fireflies come alive and move. The LEDs themselves are fixed,
// but five drifting "swarm" points wander through the room. LEDs within a
// swarm's radius light up, so visually the lit set of fireflies flows
// across the ceiling and walls as the swarm drifts past. Swarms bounce
// off the room walls and vary their speed and radius.
const SWARM_COUNT = 5
const SWARM_RADIUS = 1.9
const HW = 4.415, HD = 5.0, ROOM_H = 3.52

function makeSwarm(rand) {
  return {
    x: (rand() - 0.5) * (2 * HW * 0.8),
    y: 0.6 + rand() * (ROOM_H - 0.8),
    z: (rand() - 0.5) * (2 * HD * 0.8),
    vx: (rand() - 0.5) * 0.9,
    vy: (rand() - 0.5) * 0.35,
    vz: (rand() - 0.5) * 0.9,
    radius: SWARM_RADIUS * (0.85 + rand() * 0.35),
  }
}

export default function Motion({ masterOpacity }) {
  const state = useRef(null)

  if (!state.current) {
    const dist = distributeUnits({ seed: 77 })
    const n = dist.count
    const phases = new Float32Array(n)
    const rates = new Float32Array(n)
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      phases[i] = Math.random() * Math.PI * 2
      rates[i] = 0.5 + Math.random() * 1.3
      colors[i * 3]     = 0.30 + Math.random() * 0.20
      colors[i * 3 + 1] = 0.95 + Math.random() * 0.05
      colors[i * 3 + 2] = 0.25 + Math.random() * 0.20
    }

    let seed = 321
    const rand = () => {
      seed = (seed * 16807 + 0) % 2147483647
      return (seed - 1) / 2147483646
    }

    const swarms = []
    for (let i = 0; i < SWARM_COUNT; i++) swarms.push(makeSwarm(rand))

    state.current = { dist, phases, rates, colors, opacities, swarms, lastTime: null }
  }

  useFrame(() => {
    const s = state.current
    const now = Date.now() / 1000
    if (s.lastTime === null) s.lastTime = now
    const dt = Math.min(0.08, now - s.lastTime)
    s.lastTime = now
    const t = now

    for (const sw of s.swarms) {
      sw.x += sw.vx * dt
      sw.y += sw.vy * dt
      sw.z += sw.vz * dt
      if (sw.x < -HW + 0.3) { sw.x = -HW + 0.3; sw.vx = Math.abs(sw.vx) }
      if (sw.x >  HW - 0.3) { sw.x =  HW - 0.3; sw.vx = -Math.abs(sw.vx) }
      if (sw.y < 0.4)       { sw.y = 0.4;       sw.vy = Math.abs(sw.vy) }
      if (sw.y > ROOM_H - 0.2) { sw.y = ROOM_H - 0.2; sw.vy = -Math.abs(sw.vy) }
      if (sw.z < -HD + 0.3) { sw.z = -HD + 0.3; sw.vz = Math.abs(sw.vz) }
      if (sw.z >  HD - 0.3) { sw.z =  HD - 0.3; sw.vz = -Math.abs(sw.vz) }
    }

    for (let i = 0; i < s.dist.count; i++) {
      const px = s.dist.positions[i * 3]
      const py = s.dist.positions[i * 3 + 1]
      const pz = s.dist.positions[i * 3 + 2]
      let maxAct = 0
      for (const sw of s.swarms) {
        const dx = px - sw.x
        const dy = py - sw.y
        const dz = pz - sw.z
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
        const act = Math.max(0, 1 - d / sw.radius)
        if (act > maxAct) maxAct = act
      }
      const blink = Math.sin(t * s.rates[i] * 2 * Math.PI + s.phases[i]) * 0.35 + 0.65
      s.opacities[i] = maxAct * blink * masterOpacity
    }
  })

  return (
    <FireflyParticles
      count={state.current.dist.count}
      positions={state.current.dist.positions}
      opacities={state.current.opacities}
      colors={state.current.colors}
      size={0.028}
    />
  )
}
