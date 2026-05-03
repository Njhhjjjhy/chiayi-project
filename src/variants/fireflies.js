import Awakening from '../components/fireflies/Awakening.jsx'
import Flashlight from '../components/fireflies/Flashlight.jsx'
import DriftingSwarm from '../components/fireflies/DriftingSwarm.jsx'
import PulseWave from '../components/fireflies/PulseWave.jsx'
import Heartbeat from '../components/fireflies/Heartbeat.jsx'

// Canonical registry for every firefly variant. To add a new variant:
//   1. Create the component file in components/fireflies/
//   2. Add one entry below with id, label, description, component, and
//      optionally isDefault: true
// Nothing else needs changing — FireflySystem reads components from the
// map, defaults.js reads the default id, and VariantSwitcher reads the
// list for UI display.

export const fireflyVariants = {
  awakening: {
    id: 'awakening',
    label: 'Awakening',
    description: 'A single firefly lights up first, then the awakening expands outward in widening rings until every LED is on. Once fully lit, the room settles into a long, slow breath.',
    component: Awakening,
    isDefault: true,
  },
  flashlight: {
    id: 'flashlight',
    label: 'Flashlight',
    description: 'A wide beam (60 cm) follows the cursor and wakes every LED it touches. The beam fades slowly so you see a trail of light following you, and the light spreads to neighbouring clusters as you move.',
    component: Flashlight,
  },
  'drifting-swarm': {
    id: 'drifting-swarm',
    label: 'Drifting swarm',
    description: 'Five glowing clusters drift slowly through the room. Each one lights up roughly fifty LEDs at a time and leaves a fading trail behind it as it moves on.',
    component: DriftingSwarm,
  },
  'pulse-wave': {
    id: 'pulse-wave',
    label: 'Pulse wave',
    description: 'Every fifteen seconds a wave of light radiates outward from a random point on the ceiling, sweeping across the ceiling and down the side walls. Between waves a few LEDs twinkle softly.',
    component: PulseWave,
  },
  heartbeat: {
    id: 'heartbeat',
    label: 'Heartbeat',
    description: 'Every LED in the room pulses in unison at about seventy beats per minute, with two beats per cycle so it reads as a heartbeat rather than a steady throb.',
    component: Heartbeat,
  },
}

export const fireflyVariantList = Object.values(fireflyVariants)

export const fireflyComponentMap = Object.fromEntries(
  fireflyVariantList.map((v) => [v.id, v.component]),
)

export const defaultFireflyId =
  fireflyVariantList.find((v) => v.isDefault)?.id ?? fireflyVariantList[0].id
