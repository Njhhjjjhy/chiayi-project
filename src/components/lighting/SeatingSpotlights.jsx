import { useMemo } from 'react'
import * as THREE from 'three'
import {
  SEATING_ZONES,
  SEATING_SPOT_Y, SEATING_SPOT_CONE_ANGLE,
  SEATING_SPOT_PENUMBRA, SEATING_SPOT_DECAY, SEATING_SPOT_DISTANCE,
  SEATING_SPOT_INTENSITY, SEATING_SPOT_COLOR,
  SEATING_SPOT_RAMP_START, SEATING_SPOT_RAMP_END,
} from '../../geometry/dimensions.js'
import { useTimeline } from '../../hooks/useTimeline.js'

// SeatingSpotlights
//
// One overhead spot per zone in SEATING_ZONES. Each spot is rendered as
// THREE pieces: the three.js spotLight (actual light contribution), a
// thin additive cone mesh (visible beam read), and a floor pool disc
// (visible pool read). Cone + pool opacity scales with the spot's
// current intensity ratio so the visible read tracks the lighting ramp.
//
// Intensity is full from t = 0 to SEATING_SPOT_RAMP_START, ramps
// linearly down to zero from RAMP_START to RAMP_END, then off. The
// blue→darkness boundary in useTimeline.js sits at t = 0.75, which is
// RAMP_END — once fireflies are visible the spotlights are off so they
// don't contaminate the darkness phase.

function rampIntensity(time) {
  if (time <= SEATING_SPOT_RAMP_START) return SEATING_SPOT_INTENSITY
  if (time >= SEATING_SPOT_RAMP_END) return 0
  const t = (time - SEATING_SPOT_RAMP_START) / (SEATING_SPOT_RAMP_END - SEATING_SPOT_RAMP_START)
  return SEATING_SPOT_INTENSITY * (1 - t)
}

// Floor pool radius at the spot-to-floor distance. The spotLight angle
// is the half-angle from the cone axis, so the floor radius is
// height × tan(angle).
const POOL_RADIUS = SEATING_SPOT_Y * Math.tan(SEATING_SPOT_CONE_ANGLE)

function ZoneSpot({ x, z, intensity }) {
  const target = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(x, 0, z)
    return obj
  }, [x, z])

  return (
    <group>
      <primitive object={target} />
      <spotLight
        position={[x, SEATING_SPOT_Y, z]}
        target={target}
        color={SEATING_SPOT_COLOR}
        intensity={intensity}
        angle={SEATING_SPOT_CONE_ANGLE}
        penumbra={SEATING_SPOT_PENUMBRA}
        decay={SEATING_SPOT_DECAY}
        distance={SEATING_SPOT_DISTANCE}
        castShadow={false}
      />
    </group>
  )
}

export default function SeatingSpotlights({ dim = 1 }) {
  const { time } = useTimeline()
  const intensity = rampIntensity(time) * dim
  if (dim <= 0) return null
  return (
    <group>
      {SEATING_ZONES.map((zone, i) => (
        <ZoneSpot key={i} x={zone.x} z={zone.z} intensity={intensity} />
      ))}
    </group>
  )
}
