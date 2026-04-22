import Blinking from '../components/fireflies/Blinking.jsx'
import Interaction from '../components/fireflies/Interaction.jsx'
import Motion from '../components/fireflies/Motion.jsx'
import TheWave from '../components/fireflies/TheWave.jsx'

// Canonical registry for every firefly variant. To add a new variant:
//   1. Create the component file (e.g. Sparkle.jsx) in components/fireflies/
//   2. Add one entry below with id, label, description, component, and
//      optionally isDefault: true
// Nothing else needs changing — FireflySystem reads components from the
// map, defaults.js reads the default id, and VariantSwitcher reads the
// list for UI display.

export const fireflyVariants = {
  blinking: {
    id: 'blinking',
    label: 'Phase 1: appearing',
    description: 'Fireflies start appearing — very few at first, then more and more over ~30 seconds until the whole ceiling and walls are alive with them. Each 1.2×1.2 m unit lights up in a shuffled order; once a unit is on, its 18 LEDs blink independently.',
    component: Blinking,
    isDefault: true,
  },
  interaction: {
    id: 'interaction',
    label: 'Phase 2: flashlight',
    description: 'Visitors sweep an IR flashlight (simulated here with the mouse pointer). Each unit the beam enters toggles — on becomes off, off becomes on. Sweep around to "paint" the firefly pattern yourself.',
    component: Interaction,
  },
  motion: {
    id: 'motion',
    label: 'Phase 3: fireflies moving',
    description: 'The fireflies come alive and start moving around. Five drifting swarms wander through the room; the LEDs light up as each swarm passes over them, so the glow flows across the ceiling and walls.',
    component: Motion,
  },
  theWave: {
    id: 'theWave',
    label: 'The wave',
    description: 'A bright wave of light sweeps across the room every 15 seconds — left to right, front to back, or radiating outward. Between waves, LEDs flicker quietly.',
    component: TheWave,
  },
}

export const fireflyVariantList = Object.values(fireflyVariants)

export const fireflyComponentMap = Object.fromEntries(
  fireflyVariantList.map((v) => [v.id, v.component]),
)

export const defaultFireflyId =
  fireflyVariantList.find((v) => v.isDefault)?.id ?? fireflyVariantList[0].id
