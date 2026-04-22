import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'
import { ROOM, HW, HD } from '../../geometry/dimensions.js'

// Phase 3 — fireflies come alive and move. The LEDs themselves are fixed,
// but ten small drifting "swarm" points wander through the room. LEDs
// within a swarm's radius light up; when a swarm moves away, the LEDs
// fade out slowly, leaving a visible afterglow trail. That trail is what
// reads as motion on the fixed grid.
const SWARM_COUNT = 10
const SWARM_RADIUS = 1.1
const ROOM_H = ROOM.H
// Rise/fall smoothing rates per second. Rise fast, fall slow = trails.
const RISE_RATE = 8.0
const FALL_RATE = 1.5

function makeSwarm(rand) {
  // Mix of fast-darting and slow-meandering swarms — varied speed keeps
  // the room feeling alive instead of a uniform drift.
  const speedScale = rand() < 0.3 ? 1.8 : 0.7
  return {
    x: (rand() - 0.5) * (2 * HW * 0.8),
    y: 0.6 + rand() * (ROOM_H - 0.8),
    z: (rand() - 0.5) * (2 * HD * 0.8),
    vx: (rand() - 0.5) * 0.9 * speedScale,
    vy: (rand() - 0.5) * 0.3 * speedScale,
    vz: (rand() - 0.5) * 0.9 * speedScale,
    radius: SWARM_RADIUS * (0.75 + rand() * 0.5),
  }
}

export default function Motion({ masterOpacity }) {
  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(303)
    const n = dist.count
    const phases = new Float32Array(n)
    const rates = new Float32Array(n)
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      phases[i] = rng() * Math.PI * 2
      rates[i] = 0.5 + rng() * 1.3
      colors[i * 3]     = 0.30 + rng() * 0.20
      colors[i * 3 + 1] = 0.95 + rng() * 0.05
      colors[i * 3 + 2] = 0.25 + rng() * 0.20
    }

    const swarmRng = makeRng(321)
    const swarms = []
    for (let i = 0; i < SWARM_COUNT; i++) swarms.push(makeSwarm(swarmRng))

    return { dist, phases, rates, colors, opacities, swarms, lastTime: null }
  }, [])

  // Per-frame mutation of typed-array buffers + swarm objects held inside
  // state — standard @react-three/fiber pattern.
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
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
      const target = maxAct * blink * masterOpacity
      // Asymmetric smoothing: snap on when a swarm arrives, fade slowly
      // when it leaves. The lingering fade is the visible trail.
      const rate = target > s.opacities[i] ? RISE_RATE : FALL_RATE
      s.opacities[i] += (target - s.opacities[i]) * Math.min(1, rate * dt)
    }
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <FireflyParticles
      count={state.dist.count}
      positions={state.dist.positions}
      opacities={state.opacities}
      colors={state.colors}
      size={0.028}
    />
  )
}
