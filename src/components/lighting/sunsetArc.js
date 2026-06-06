import * as THREE from 'three'

// The sunset colour arc — single source of truth for the timeline
// player's four phases. Experience mode applies it as the room's
// ambient; verification mode follows the same arc at brighter
// inspection levels. Scrubbing the player drives BOTH modes.

export const SUNSET_KEYFRAMES = [
  { t: 0.0,  color: new THREE.Color('#FFA040'), intensity: 1.8 },  // golden hour
  { t: 0.25, color: new THREE.Color('#C07AAF'), intensity: 1.0 },  // twilight
  { t: 0.5,  color: new THREE.Color('#1E3A5F'), intensity: 0.5 },  // blue hour
  { t: 0.75, color: new THREE.Color('#050510'), intensity: 0.05 }, // darkness
  { t: 1.0,  color: new THREE.Color('#050510'), intensity: 0.05 },
]

// Golden-hour baseline — consumers normalise against this so the
// brightest phase maps to "full brightness" in their own scale.
export const SUNSET_BASE_INTENSITY = SUNSET_KEYFRAMES[0].intensity

const _c = new THREE.Color()

export function sampleSunset(t) {
  for (let i = 0; i < SUNSET_KEYFRAMES.length - 1; i++) {
    if (t <= SUNSET_KEYFRAMES[i + 1].t) {
      const span = SUNSET_KEYFRAMES[i + 1].t - SUNSET_KEYFRAMES[i].t
      const alpha = span > 0 ? (t - SUNSET_KEYFRAMES[i].t) / span : 0
      _c.copy(SUNSET_KEYFRAMES[i].color).lerp(SUNSET_KEYFRAMES[i + 1].color, alpha)
      const intensity =
        SUNSET_KEYFRAMES[i].intensity +
        (SUNSET_KEYFRAMES[i + 1].intensity - SUNSET_KEYFRAMES[i].intensity) * alpha
      return { hex: '#' + _c.getHexString(), intensity }
    }
  }
  return {
    hex: '#' + SUNSET_KEYFRAMES[0].color.getHexString(),
    intensity: SUNSET_KEYFRAMES[0].intensity,
  }
}
