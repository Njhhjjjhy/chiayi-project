// Mountain wall variant definitions.
// Each variant controls layer count, silhouette generation, colors, spacing, and backlight.

export const mountainWallVariants = {
  softRolling: {
    id: 'softRolling',
    label: 'Soft rolling peaks',
    layers: 3,
    spacing: 0.4,
    peakAmplitude: 0.8,
    peakFrequency: 0.6,
    // Smooth sine-based silhouette
    profileType: 'sine',
    // Colors from foreground (nearest) to background (farthest)
    layerColors: ['#1a3a1a', '#2d5a2d', '#7a9a7a'],
    backlightColor: '#d4a050',
    backlightIntensity: 2.0,
    sunLines: false,
  },
  sharpRidgelines: {
    id: 'sharpRidgelines',
    label: 'Sharp ridgelines',
    layers: 5,
    spacing: 0.2,
    peakAmplitude: 1.2,
    peakFrequency: 1.5,
    // Jagged peaks with treeline bumps
    profileType: 'jagged',
    layerColors: ['#0a0a0a', '#141e14', '#1e2e1e', '#2a3e2a', '#3a5a3a'],
    backlightColor: '#ffe8d0',
    backlightIntensity: 1.5,
    sunLines: false,
  },
  geometric: {
    id: 'geometric',
    label: 'Geometric / stylized',
    layers: 4,
    spacing: 0.3,
    peakAmplitude: 1.0,
    peakFrequency: 0.4,
    // Straight-line angular segments
    profileType: 'geometric',
    layerColors: ['#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a'],
    backlightColor: '#c060d0',
    backlightIntensity: 2.5,
    sunLines: true,
  },
}

export const mountainWallVariantList = Object.values(mountainWallVariants)
