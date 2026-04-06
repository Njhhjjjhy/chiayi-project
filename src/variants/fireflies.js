export const fireflyVariants = {
  scatteredDrift: {
    id: 'scatteredDrift',
    label: 'Scattered souls',
    description: '100 fireflies across 6 ceiling modules, each pulsing independently with staggered activation. No coordination — like individual souls flickering in the dark.',
  },
  waveSync: {
    id: 'waveSync',
    label: 'Synchronization wave',
    description: 'Fireflies gradually synchronize within local groups (Kuramoto coupling). Every 45-90 seconds, a visible wave of coordinated pulsing rolls across the ceiling, then dissolves back.',
  },
  stillnessResponse: {
    id: 'stillnessResponse',
    label: 'The listening dark (v2)',
    description: 'Fireflies respond to your stillness. Stop moving for 3 seconds and nearby fireflies fade in. Move and they vanish. The room listens.',
  },
  listeningDark: {
    id: 'listeningDark',
    label: 'The listening dark (legacy)',
    description: 'Fireflies only appear when you are still. Move and they vanish. Stop moving for 3 seconds and they slowly fade in — as if the room is listening.',
  },
  flashLanguage: {
    id: 'flashLanguage',
    label: 'Flash language',
    description: 'Three species of firefly, each with its own flash signature. Amber LEDs pulse slowly, yellow ones double-flash, and green ones flutter in rapid bursts — just like real fireflies communicating.',
  },
  theWave: {
    id: 'theWave',
    label: 'The wave',
    description: 'A bright wave of light sweeps across the room every 15 seconds — left to right, front to back, or radiating outward. Between waves, LEDs flicker quietly.',
  },
  canopyGrid: {
    id: 'canopyGrid',
    label: 'Canopy grid',
    description: 'LEDs arranged in a structured 12 × 12 grid across ceiling and walls. Each pulses at its own rhythm. Feels more architectural and designed than organic.',
  },
  theVeil: {
    id: 'theVeil',
    label: 'The veil',
    description: '80% of LEDs are on the side walls, only 20% on the ceiling. Each breathes at its own pace (4–8 seconds). Creates curtains of soft light flanking the audience.',
  },
  theReflection: {
    id: 'theReflection',
    label: 'The reflection',
    description: 'Interactive — LEDs near your cursor glow brighter, creating a spotlight that follows your gaze across the walls and ceiling. When you stop, they fade to a dim ambient flicker.',
  },
  sodiumMist: {
    id: 'sodiumMist',
    label: 'Sodium mist',
    description: 'Deep sodium-orange LEDs pulse in near-unison, slightly staggered for organic feel. Evokes the haze of streetlights through fog. Pairs with the Sodium Sun wall variant.',
  },
  prismaticDust: {
    id: 'prismaticDust',
    label: 'Prismatic dust',
    description: 'Each LED is a different colour across the full spectrum — red through violet. All breathe gently and independently. A slow, colourful shimmer. Pairs with the Prismatic Arc wall variant.',
  },
}

export const fireflyVariantList = Object.values(fireflyVariants)
