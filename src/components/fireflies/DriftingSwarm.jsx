import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import {
  getLedSurface, makeRng,
  ROOM,
  FOREST_CENTER_X, FOREST_CENTER_Z, FOREST_SPAN_X, FOREST_SPAN_Z,
} from './surfacePositions-v2.js'

// Five glowing swarms drift slowly through the room. Each lights every
// LED inside a ~1 m sphere around its centre, so visitors see five
// clusters of ~50 LEDs at a time. When a swarm moves on, the LEDs it
// lit fade slowly — a visible trail reads as motion.

const SWARM_COUNT = 5
const SWARM_RADIUS = 1.0
const SWARM_SPEED = 0.3
const RISE_RATE = 12.0
const FALL_RATE = 0.6

const X_MIN = FOREST_CENTER_X - FOREST_SPAN_X / 2
const X_MAX = FOREST_CENTER_X + FOREST_SPAN_X / 2
const Z_MIN = FOREST_CENTER_Z - FOREST_SPAN_Z / 2
const Z_MAX = FOREST_CENTER_Z + FOREST_SPAN_Z / 2

function makeSwarm(rng) {
  const theta = rng() * Math.PI * 2
  return {
    x: FOREST_CENTER_X + (rng() - 0.5) * FOREST_SPAN_X * 0.7,
    y: 1.0 + rng() * (ROOM.H - 1.5),
    z: FOREST_CENTER_Z + (rng() - 0.5) * FOREST_SPAN_Z * 0.7,
    vx: Math.cos(theta) * SWARM_SPEED,
    vy: (rng() - 0.5) * 0.05,
    vz: Math.sin(theta) * SWARM_SPEED,
    breathPeriod: 4 + rng() * 3,
    breathOffset: rng() * 10,
    nextTurn: 2 + rng() * 3,
  }
}

export default function DriftingSwarm({ masterOpacity = 1 }) {
  const lastTimeRef = useRef(null)

  const state = useMemo(() => {
    const dist = getLedSurface()
    const rng = makeRng(303)
    const n = dist.count
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      colors[i * 3]     = 0.60 + rng() * 0.20
      colors[i * 3 + 1] = 1.00
      colors[i * 3 + 2] = 0.50 + rng() * 0.20
    }

    const swarms = []
    for (let i = 0; i < SWARM_COUNT; i++) swarms.push(makeSwarm(rng))

    return { dist, colors, opacities, swarms, rng }
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
    const now = Date.now() / 1000
    if (lastTimeRef.current === null) lastTimeRef.current = now
    const dt = Math.min(0.08, now - lastTimeRef.current)
    lastTimeRef.current = now

    for (const f of s.swarms) {
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.z += f.vz * dt

      f.nextTurn -= dt
      if (f.nextTurn <= 0) {
        const theta = s.rng() * Math.PI * 2
        f.vx = Math.cos(theta) * SWARM_SPEED
        f.vz = Math.sin(theta) * SWARM_SPEED
        f.vy += (s.rng() - 0.5) * 0.05
        f.vy = Math.max(-0.1, Math.min(0.1, f.vy))
        f.nextTurn = 2 + s.rng() * 3
      }

      if (f.x < X_MIN + 0.5) { f.x = X_MIN + 0.5; f.vx = Math.abs(f.vx) }
      if (f.x > X_MAX - 0.5) { f.x = X_MAX - 0.5; f.vx = -Math.abs(f.vx) }
      if (f.y < 0.6)             { f.y = 0.6;             f.vy = Math.abs(f.vy) }
      if (f.y > ROOM.H - 0.3)    { f.y = ROOM.H - 0.3;    f.vy = -Math.abs(f.vy) }
      if (f.z < Z_MIN + 0.5) { f.z = Z_MIN + 0.5; f.vz = Math.abs(f.vz) }
      if (f.z > Z_MAX - 0.5) { f.z = Z_MAX - 0.5; f.vz = -Math.abs(f.vz) }
    }

    const t = now
    const r2 = SWARM_RADIUS * SWARM_RADIUS
    const positions = s.dist.positions
    for (let i = 0; i < s.dist.count; i++) {
      const px = positions[i * 3]
      const py = positions[i * 3 + 1]
      const pz = positions[i * 3 + 2]
      let best = 0
      for (const f of s.swarms) {
        const dx = px - f.x
        const dy = py - f.y
        const dz = pz - f.z
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 >= r2) continue
        const falloff = 1 - Math.sqrt(d2) / SWARM_RADIUS
        const breath = 0.75 + Math.sin((t + f.breathOffset) * (Math.PI * 2 / f.breathPeriod)) * 0.25
        const contribution = falloff * breath
        if (contribution > best) best = contribution
      }
      const target = best * masterOpacity
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
      size={0.003}
    />
  )
}
