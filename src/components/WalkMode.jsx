import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'

// First-person walk controls. Camera is locked to standing eye
// height (no fly, no crouch). Arrow keys move on the floor plane
// and work as soon as walk mode is enabled. Mouse look engages
// once the user clicks the canvas (browsers require a user
// gesture to request pointer lock). ESC releases the lock and
// fires onExit, which exits walk mode entirely.

const SPEED = 3.5            // metres per second, normal pace
const SPRINT_MULTIPLIER = 2.2
const EYE_HEIGHT = 1.6       // standing eye level in metres

export default function WalkMode({ onExit }) {
  const { camera } = useThree()
  const keys = useRef({})
  const forward = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const UP = useRef(new THREE.Vector3(0, 1, 0))

  // Snap to eye level on enter so anyone who flew off via the
  // previous (now-removed) space/ctrl bindings is reset.
  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    camera.position.y = EYE_HEIGHT
    /* eslint-enable react-hooks/immutability */
  }, [camera])

  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.code] = true }
    const onKeyUp = (e) => { keys.current[e.code] = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    const k = keys.current
    const sprint = k.ShiftLeft || k.ShiftRight
    const speed = SPEED * (sprint ? SPRINT_MULTIPLIER : 1) * delta

    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    if (forward.current.lengthSq() > 0) forward.current.normalize()
    right.current.crossVectors(forward.current, UP.current).normalize()

    if (k.ArrowUp)    camera.position.addScaledVector(forward.current,  speed)
    if (k.ArrowDown)  camera.position.addScaledVector(forward.current, -speed)
    if (k.ArrowLeft)  camera.position.addScaledVector(right.current,   -speed)
    if (k.ArrowRight) camera.position.addScaledVector(right.current,    speed)

    // Lock vertical position — feet stay on the floor.
    camera.position.y = EYE_HEIGHT
  })
  /* eslint-enable react-hooks/immutability */

  return (
    <PointerLockControls onUnlock={() => onExit?.()} />
  )
}
