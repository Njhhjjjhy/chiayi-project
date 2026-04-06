import { useMemo } from 'react'
import * as THREE from 'three'
import { useTimeline } from './useTimeline.jsx'
import { useVariant } from './useVariant.jsx'
import { lightingVariants } from '../variants/lighting.js'

const PHASE_KEYS = ['golden', 'twilight', 'blue', 'darkness']

// Lerp between two hex colors
function lerpColor(hex1, hex2, t) {
  const c1 = new THREE.Color(hex1)
  const c2 = new THREE.Color(hex2)
  c1.lerp(c2, t)
  return '#' + c1.getHexString()
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

// Smooth step for more natural transitions
function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

const DAYLIGHT_STATE = {
  ambientColor: '#ffffff',
  ambientIntensity: 1.0,
  backlightColor: '#e0d8c8',
  skyTopColor: '#d4d0c8',
  skyBottomColor: '#c8c0b0',
  sunLineOpacity: 0,
  phaseIndex: 0,
  phaseName: 'daylight',
}

export function useLightingState() {
  const { time } = useTimeline()
  const { selections, viewMode } = useVariant()

  const paletteId = selections.lighting || 'warmDominant'
  const palette = lightingVariants[paletteId] || lightingVariants.warmDominant

  return useMemo(() => {
    if (viewMode === 'light') return DAYLIGHT_STATE

    // Determine which two phases we're between
    const phaseProgress = time * 4 // 0-4 range
    const phaseIndex = Math.min(Math.floor(phaseProgress), 3)
    const nextIndex = Math.min(phaseIndex + 1, 3)
    const t = smoothstep(phaseProgress - phaseIndex)

    const from = palette.phases[PHASE_KEYS[phaseIndex]]
    const to = palette.phases[PHASE_KEYS[nextIndex]]

    return {
      ambientColor: lerpColor(from.ambient, to.ambient, t),
      ambientIntensity: lerp(from.ambientIntensity, to.ambientIntensity, t),
      backlightColor: lerpColor(from.backlight, to.backlight, t),
      skyTopColor: lerpColor(from.skyTop, to.skyTop, t),
      skyBottomColor: lerpColor(from.skyBottom, to.skyBottom, t),
      sunLineOpacity: lerp(from.sunLineOpacity, to.sunLineOpacity, t),
      phaseIndex,
      phaseName: PHASE_KEYS[phaseIndex],
    }
  }, [time, palette, viewMode])
}
