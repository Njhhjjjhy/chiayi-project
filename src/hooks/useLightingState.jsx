import { useMemo } from 'react'
import * as THREE from 'three'
import { useTimeline } from './useTimeline.jsx'
import { useVariant } from './useVariant.jsx'

const PHASE_KEYS = ['golden', 'twilight', 'blue', 'darkness']

// Single inlined palette for the 4-phase sunset → darkness cycle.
// Lighting variant picker has been removed — this is the only palette.
const PALETTE = {
  golden: {
    ambient: '#f5c842',
    ambientIntensity: 0.15,
    backlight: '#f5c842',
    skyTop: '#f5c842',
    skyBottom: '#c44b6c',
    sunLineOpacity: 1.0,
  },
  twilight: {
    ambient: '#c44b6c',
    ambientIntensity: 0.08,
    backlight: '#c44b6c',
    skyTop: '#5a3b8a',
    skyBottom: '#c44b6c',
    sunLineOpacity: 0.3,
  },
  blue: {
    ambient: '#3a2a5a',
    ambientIntensity: 0.05,
    backlight: '#1a1050',
    skyTop: '#0a0a20',
    skyBottom: '#1a1a2e',
    sunLineOpacity: 0,
  },
  darkness: {
    ambient: '#050510',
    ambientIntensity: 0.01,
    backlight: '#050510',
    skyTop: '#000000',
    skyBottom: '#000000',
    sunLineOpacity: 0,
  },
}

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
  const { viewMode } = useVariant()

  return useMemo(() => {
    if (viewMode === 'light') return DAYLIGHT_STATE

    // Determine which two phases we're between
    const phaseProgress = time * 4 // 0-4 range
    const phaseIndex = Math.min(Math.floor(phaseProgress), 3)
    const nextIndex = Math.min(phaseIndex + 1, 3)
    const t = smoothstep(phaseProgress - phaseIndex)

    const from = PALETTE[PHASE_KEYS[phaseIndex]]
    const to = PALETTE[PHASE_KEYS[nextIndex]]

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
  }, [time, viewMode])
}
