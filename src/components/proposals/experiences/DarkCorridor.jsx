import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTimeline } from '../../../hooks/useTimeline.js'
import { useVariant } from '../../../hooks/useVariant.js'

// Dark corridor — almost no ambient light. A spotlight rides with the
// camera and points wherever the camera looks, so the visitor sees
// only a small bubble of legibility around the centre of frame. The
// rest of the room must be sensed (and the fireflies are still doing
// their thing in the dark, just barely visible at the edges).
//
// Forces:
//   - Experience view mode
//   - Firefly variant 'motion'
//   - Timeline parked at full darkness
//   - Timeline paused

const FLASHLIGHT_DISTANCE = 4.5
const FLASHLIGHT_ANGLE = Math.PI / 7   // ~26° cone
const FLASHLIGHT_INTENSITY = 6
const FLASHLIGHT_COLOR = '#fff1c8'     // warm amber

export default function DarkCorridor() {
  const { setTime, pause } = useTimeline()
  const { setViewMode, selectVariant } = useVariant()
  const { camera } = useThree()
  const lightRef = useRef(null)
  const target = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    setViewMode('experience')
    selectVariant('fireflies', 'motion')
    setTime(1.0)
    pause()
  }, [setViewMode, selectVariant, setTime, pause])

  // Point the spotlight forward from the camera every frame.
  useFrame(() => {
    if (!lightRef.current) return
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    lightRef.current.position.copy(camera.position)
    target.position.copy(camera.position).add(dir.multiplyScalar(FLASHLIGHT_DISTANCE))
    target.updateMatrixWorld()
  })

  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={lightRef}
        color={FLASHLIGHT_COLOR}
        intensity={FLASHLIGHT_INTENSITY}
        distance={FLASHLIGHT_DISTANCE}
        angle={FLASHLIGHT_ANGLE}
        penumbra={0.55}
        decay={1.4}
        target={target}
      />
    </>
  )
}
