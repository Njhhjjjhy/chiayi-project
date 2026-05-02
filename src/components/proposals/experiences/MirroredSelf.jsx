import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTimeline } from '../../../hooks/useTimeline.js'
import { useVariant } from '../../../hooks/useVariant.js'
import { ROOM, HW, HD, INSET } from '../../../geometry/dimensions.js'

// Mirrored self — a chest-height reflective band runs around the room
// interior so the visitor sees themselves inside the firefly system.
// The forest fireflies are pulsed at a fake heart rate (~70 bpm), so
// the swarm rises and falls together as if breathing in time with the
// observer.
//
// Forces:
//   - Experience view mode
//   - Firefly variant 'motion' (the moving swarms read best with the
//     pulsing intensity)
//   - Timeline parked at blue hour (dim, but visible enough that the
//     mirror band reads against the wall)
//   - Timeline paused

const BAND_Y = 1.4               // chest-height for an average adult
const BAND_H = 0.18              // 18 cm thick reflective strip
const HEART_HZ = 70 / 60         // 70 bpm

export default function MirroredSelf() {
  const { setTime, pause } = useTimeline()
  const { setViewMode, selectVariant } = useVariant()
  const pulseRef = useRef(null)

  useEffect(() => {
    setViewMode('experience')
    selectVariant('fireflies', 'motion')
    setTime(0.85)
    pause()
  }, [setViewMode, selectVariant, setTime, pause])

  // Heart-rate pulse — gently modulates an extra ambient light so the
  // whole room breathes at ~70 bpm. Sin wave normalised to 0..1.
  useFrame(({ clock }) => {
    if (!pulseRef.current) return
    const t = clock.getElapsedTime()
    const beat = (Math.sin(t * Math.PI * 2 * HEART_HZ) + 1) / 2
    pulseRef.current.intensity = 0.5 + beat * 0.4
  })

  // Inset by INSET so the band sits just inside the wall surfaces and
  // doesn't z-fight with them.
  const bandPositions = [
    { pos: [0, BAND_Y, -HD + INSET],  size: [ROOM.W, BAND_H, 0.02], rot: [0, 0, 0] },
    { pos: [0, BAND_Y,  HD - INSET],  size: [ROOM.W, BAND_H, 0.02], rot: [0, 0, 0] },
    { pos: [-HW + INSET, BAND_Y, 0],  size: [0.02, BAND_H, ROOM.D], rot: [0, 0, 0] },
    { pos: [ HW - INSET, BAND_Y, 0],  size: [0.02, BAND_H, ROOM.D], rot: [0, 0, 0] },
  ]

  return (
    <>
      <ambientLight ref={pulseRef} color="#a8c4dd" />
      {bandPositions.map((b, i) => (
        <mesh key={i} position={b.pos} rotation={b.rot}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color="#d8e4f0"
            metalness={0.95}
            roughness={0.08}
          />
        </mesh>
      ))}
    </>
  )
}
