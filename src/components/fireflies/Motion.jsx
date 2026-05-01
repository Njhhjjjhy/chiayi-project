import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import FireflyParticles from './FireflyParticles.jsx'
import { distributeUnits, makeRng } from './surfacePositions.js'
import { ROOM, HW, HD } from '../../geometry/dimensions.js'

// Phase 3 — fireflies moving. The LEDs are physically fixed, but a pool
// of "virtual fireflies" drifts through the room. Each is a tiny point
// (not a swarm) that lights only the very nearest LED(s) — so as the
// virtual firefly moves, different LEDs light up and it reads as a single
// firefly travelling across the surface. No block-grid zones.
// Real Photinus flight speed is ~0.5 m/s; we stay near there.
const FIREFLY_COUNT = 40
const GLOW_RADIUS = 0.22           // metres — lights only the nearest ~1-3 LEDs
const RISE_RATE = 10.0             // fast snap to bright when a firefly arrives
const FALL_RATE = 1.2              // slow fade when it leaves → visible trail
const ROOM_H = ROOM.H

function makeFirefly(rng) {
  // Speed 0.2–0.5 m/s with random direction. Slight vertical drift only.
  const speed = 0.20 + rng() * 0.30
  const theta = rng() * Math.PI * 2
  return {
    x: (rng() - 0.5) * (2 * HW * 0.8),
    y: 0.6 + rng() * (ROOM_H - 1.0),
    z: (rng() - 0.5) * (2 * HD * 0.8),
    vx: Math.cos(theta) * speed,
    vy: (rng() - 0.5) * 0.1,
    vz: Math.sin(theta) * speed,
    // Each virtual firefly has its own slow breathing cycle so not every
    // LED-passing is at the same brightness.
    breathPeriod: 2.5 + rng() * 3.5,
    breathOffset: rng() * 10,
    // Random-walk turn timer — changes heading every 1–3 seconds.
    nextTurn: 1 + rng() * 2,
  }
}

export default function Motion({ masterOpacity }) {
  const lastTimeRef = useRef(null)

  const state = useMemo(() => {
    const dist = distributeUnits({ seed: 77 })
    const rng = makeRng(303)
    const n = dist.count
    const colors = new Float32Array(n * 3)
    const opacities = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      colors[i * 3]     = 0.60 + rng() * 0.20
      colors[i * 3 + 1] = 1.00
      colors[i * 3 + 2] = 0.50 + rng() * 0.20
    }

    const fireflies = []
    for (let i = 0; i < FIREFLY_COUNT; i++) fireflies.push(makeFirefly(rng))

    return { dist, colors, opacities, fireflies, rng }
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const s = state
    const now = Date.now() / 1000
    if (lastTimeRef.current === null) lastTimeRef.current = now
    const dt = Math.min(0.08, now - lastTimeRef.current)
    lastTimeRef.current = now

    // Update virtual firefly positions — random-walk drift with wall
    // reflection. No axis-aligned box behaviour so paths look organic.
    for (const f of s.fireflies) {
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.z += f.vz * dt

      // Soft turn at random interval
      f.nextTurn -= dt
      if (f.nextTurn <= 0) {
        const speed = Math.sqrt(f.vx * f.vx + f.vz * f.vz)
        const theta = s.rng() * Math.PI * 2
        f.vx = Math.cos(theta) * speed
        f.vz = Math.sin(theta) * speed
        f.vy += (s.rng() - 0.5) * 0.1
        f.vy = Math.max(-0.2, Math.min(0.2, f.vy))
        f.nextTurn = 1 + s.rng() * 2
      }

      // Reflect gently off walls so fireflies don't escape
      if (f.x < -HW + 0.3) { f.x = -HW + 0.3; f.vx = Math.abs(f.vx) }
      if (f.x >  HW - 0.3) { f.x =  HW - 0.3; f.vx = -Math.abs(f.vx) }
      if (f.y < 0.4)       { f.y = 0.4;       f.vy = Math.abs(f.vy) }
      if (f.y > ROOM_H - 0.2) { f.y = ROOM_H - 0.2; f.vy = -Math.abs(f.vy) }
      if (f.z < -HD + 0.3) { f.z = -HD + 0.3; f.vz = Math.abs(f.vz) }
      if (f.z >  HD - 0.3) { f.z =  HD - 0.3; f.vz = -Math.abs(f.vz) }
    }

    const t = now
    const r2 = GLOW_RADIUS * GLOW_RADIUS
    const positions = s.dist.positions
    for (let i = 0; i < s.dist.count; i++) {
      const px = positions[i * 3]
      const py = positions[i * 3 + 1]
      const pz = positions[i * 3 + 2]
      let best = 0
      // For each LED, find the single closest virtual firefly and use its
      // proximity + breath. Multiple fireflies near the same LED still
      // just contribute the brightest — no additive stacking blobs.
      for (const f of s.fireflies) {
        const dx = px - f.x
        const dy = py - f.y
        const dz = pz - f.z
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 >= r2) continue
        const falloff = 1 - Math.sqrt(d2) / GLOW_RADIUS
        const breath = 0.7 + Math.sin((t + f.breathOffset) * (Math.PI * 2 / f.breathPeriod)) * 0.3
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
      // Real-world LED is 3 mm diameter (~1.5 mm physical radius).
      // Scaled up to 0.015 for visibility at sim camera distances.
      // This is a display value, not a physical measurement.
      size={0.015}
    />
  )
}
