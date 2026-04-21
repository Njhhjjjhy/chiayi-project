export const fireflyVariants = {
  blinking: {
    id: 'blinking',
    label: 'Phase 1: appearing',
    description: 'Fireflies start appearing — very few at first, then more and more over ~30 seconds until the whole ceiling and walls are alive with them. Each 1.2×1.2 m unit lights up in a shuffled order; once a unit is on, its 18 LEDs blink independently.',
  },
  interaction: {
    id: 'interaction',
    label: 'Phase 2: flashlight',
    description: 'Visitors sweep an IR flashlight (simulated here with the mouse pointer). Each unit the beam enters toggles — on becomes off, off becomes on. Sweep around to "paint" the firefly pattern yourself.',
  },
  motion: {
    id: 'motion',
    label: 'Phase 3: fireflies moving',
    description: 'The fireflies come alive and start moving around. Five drifting swarms wander through the room; the LEDs light up as each swarm passes over them, so the glow flows across the ceiling and walls.',
  },
  theWave: {
    id: 'theWave',
    label: 'The wave',
    description: 'A bright wave of light sweeps across the room every 15 seconds — left to right, front to back, or radiating outward. Between waves, LEDs flicker quietly.',
  },
}

export const fireflyVariantList = Object.values(fireflyVariants)
