import Awakening from '../components/fireflies-v2/Awakening.jsx'
import Flashlight from '../components/fireflies-v2/Flashlight.jsx'
import DriftingSwarm from '../components/fireflies-v2/DriftingSwarm.jsx'
import PulseWave from '../components/fireflies-v2/PulseWave.jsx'
import Heartbeat from '../components/fireflies-v2/Heartbeat.jsx'

// Canonical registry for v2 firefly variants. Mirrors v1's fireflies.js
// shape so adding a new behaviour is the same recipe: file in
// components/fireflies-v2/, entry below, set isDefault: true on one.

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
    description: 'A wide beam follows the cursor and wakes every LED it touches. The beam fades slowly so a trail of light follows you, and light spreads to neighbouring clusters as you move.',
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
    description: 'Every fifteen seconds a wave of light radiates outward from a random point on the ceiling. Between waves a few LEDs twinkle softly.',
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
