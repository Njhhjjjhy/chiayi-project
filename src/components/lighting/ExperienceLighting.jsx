import * as THREE from 'three'
import { useTimeline } from '../../hooks/useTimeline.js'

const KEYFRAMES = [
  { t: 0.0,  color: new THREE.Color('#FFA040'), intensity: 1.8 },
  { t: 0.25, color: new THREE.Color('#C07AAF'), intensity: 1.0 },
  { t: 0.5,  color: new THREE.Color('#1E3A5F'), intensity: 0.5 },
  { t: 0.75, color: new THREE.Color('#050510'), intensity: 0.05 },
  { t: 1.0,  color: new THREE.Color('#050510'), intensity: 0.05 },
]

const _c = new THREE.Color()

function sample(t) {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (t <= KEYFRAMES[i + 1].t) {
      const span = KEYFRAMES[i + 1].t - KEYFRAMES[i].t
      const alpha = span > 0 ? (t - KEYFRAMES[i].t) / span : 0
      _c.copy(KEYFRAMES[i].color).lerp(KEYFRAMES[i + 1].color, alpha)
      const intensity =
        KEYFRAMES[i].intensity + (KEYFRAMES[i + 1].intensity - KEYFRAMES[i].intensity) * alpha
      return { hex: '#' + _c.getHexString(), intensity }
    }
  }
  return { hex: '#' + KEYFRAMES[0].color.getHexString(), intensity: KEYFRAMES[0].intensity }
}

export default function ExperienceLighting({ brightness = 1 }) {
  const { time } = useTimeline()
  const { hex, intensity } = sample(time)

  return <ambientLight color={hex} intensity={intensity * brightness} />
}
