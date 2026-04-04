// Color palette variants for the 4-phase sunset transition.
// Each palette defines colors at 4 keyframes (golden, twilight, blue, darkness).
// Colors are interpolated smoothly between keyframes.

export const lightingVariants = {
  warmDominant: {
    id: 'warmDominant',
    label: 'Warm dominant',
    phases: {
      golden: {
        ambient: '#ffb347',
        ambientIntensity: 0.6,
        backlight: '#ff9a1a',
        skyTop: '#ffe4c4',
        skyBottom: '#ffa500',
        sunLineOpacity: 1.0,
      },
      twilight: {
        ambient: '#ff6b6b',
        ambientIntensity: 0.3,
        backlight: '#e0507a',
        skyTop: '#8b2252',
        skyBottom: '#ff4500',
        sunLineOpacity: 0.3,
      },
      blue: {
        ambient: '#2d1b69',
        ambientIntensity: 0.15,
        backlight: '#1a1050',
        skyTop: '#0a0a20',
        skyBottom: '#1a0a3a',
        sunLineOpacity: 0,
      },
      darkness: {
        ambient: '#0a0a15',
        ambientIntensity: 0.02,
        backlight: '#050510',
        skyTop: '#000000',
        skyBottom: '#000005',
        sunLineOpacity: 0,
      },
    },
  },
  coolDominant: {
    id: 'coolDominant',
    label: 'Cool dominant',
    phases: {
      golden: {
        ambient: '#e8a860',
        ambientIntensity: 0.5,
        backlight: '#d4944c',
        skyTop: '#d4bfa0',
        skyBottom: '#c87830',
        sunLineOpacity: 0.8,
      },
      twilight: {
        ambient: '#9060a0',
        ambientIntensity: 0.3,
        backlight: '#7040a0',
        skyTop: '#4a1a6a',
        skyBottom: '#a03060',
        sunLineOpacity: 0.15,
      },
      blue: {
        ambient: '#1a1560',
        ambientIntensity: 0.15,
        backlight: '#0a0a40',
        skyTop: '#050515',
        skyBottom: '#0a0a30',
        sunLineOpacity: 0,
      },
      darkness: {
        ambient: '#080810',
        ambientIntensity: 0.02,
        backlight: '#030308',
        skyTop: '#000000',
        skyBottom: '#000003',
        sunLineOpacity: 0,
      },
    },
  },
  natural: {
    id: 'natural',
    label: 'Natural / documentary',
    phases: {
      golden: {
        ambient: '#d4a870',
        ambientIntensity: 0.5,
        backlight: '#c09050',
        skyTop: '#c8b89a',
        skyBottom: '#b08040',
        sunLineOpacity: 0.6,
      },
      twilight: {
        ambient: '#a07068',
        ambientIntensity: 0.25,
        backlight: '#806058',
        skyTop: '#5a3040',
        skyBottom: '#905040',
        sunLineOpacity: 0.1,
      },
      blue: {
        ambient: '#253050',
        ambientIntensity: 0.12,
        backlight: '#152038',
        skyTop: '#0a0a18',
        skyBottom: '#101828',
        sunLineOpacity: 0,
      },
      darkness: {
        ambient: '#0a0a10',
        ambientIntensity: 0.02,
        backlight: '#050508',
        skyTop: '#000000',
        skyBottom: '#000003',
        sunLineOpacity: 0,
      },
    },
  },
}

export const lightingVariantList = Object.values(lightingVariants)
