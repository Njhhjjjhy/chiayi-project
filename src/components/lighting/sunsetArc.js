import * as THREE from 'three'

// The sunset — two researched colour journeys, applied through the
// room's PHYSICAL fixtures. There is no scene-wide tinted ambient:
// the sunset is what the fixtures do.
//
//   HORIZON — the LED strips along the forest boundaries and the glow
//             washing up the wall / partition (cabinet) faces. Plays
//             the low part of a real sunset: rich gold → fiery
//             orange → blush pink → dying ember → out.
//   SKY     — the colour-changing seat spotlights overhead. Plays the
//             upper sky: warm white-gold → violet → deep navy → out.
//
// A real sunset is always BOTH at once (warm low, cool high), blending
// mid-wall — the theatre cyclorama technique: one strip row washing up
// from the floor, a cooler source above, colours crossing over as the
// phases advance.
//
// Colour grounding (researched 6 June 2026):
//   golden hour  ~2000–3000K rich gold/amber light
//   civil twilight  vivid orange-red → blush pink/magenta low,
//                   violet-purple above (Alishan accounts: clouds go
//                   silver → gold → blush pink → deep purple)
//   blue hour    ~9000–12000K deep saturated navy, last ember band low
//   darkness     out — the fireflies take over
//
// `factor` is the fixture's intensity multiplier (1 at full, 0 at out).
// Timeline phases: golden 0–0.25, twilight 0.25–0.5, blue 0.5–0.75,
// darkness 0.75–1.

export const HORIZON_KEYFRAMES = [
  { t: 0.0,  color: new THREE.Color('#ffb347'), factor: 1.0 },  // rich gold
  { t: 0.25, color: new THREE.Color('#ff6a3d'), factor: 0.85 }, // fiery orange-red
  { t: 0.4,  color: new THREE.Color('#e96a8a'), factor: 0.55 }, // blush pink
  { t: 0.55, color: new THREE.Color('#7a2f23'), factor: 0.22 }, // dying ember
  { t: 0.75, color: new THREE.Color('#1a0b08'), factor: 0.0 },  // out
  { t: 1.0,  color: new THREE.Color('#1a0b08'), factor: 0.0 },
]

export const SKY_KEYFRAMES = [
  { t: 0.0,  color: new THREE.Color('#ffe9c4'), factor: 1.0 },  // warm white-gold
  { t: 0.25, color: new THREE.Color('#a98bd0'), factor: 0.6 },  // violet
  { t: 0.5,  color: new THREE.Color('#2e4a7d'), factor: 0.35 }, // deep navy
  { t: 0.75, color: new THREE.Color('#0a1226'), factor: 0.0 },  // out
  { t: 1.0,  color: new THREE.Color('#0a1226'), factor: 0.0 },
]

function makeSampler(frames) {
  const c = new THREE.Color()
  return function sampleArc(t) {
    for (let i = 0; i < frames.length - 1; i++) {
      if (t <= frames[i + 1].t) {
        const span = frames[i + 1].t - frames[i].t
        const alpha = span > 0 ? (t - frames[i].t) / span : 0
        c.copy(frames[i].color).lerp(frames[i + 1].color, alpha)
        const factor =
          frames[i].factor + (frames[i + 1].factor - frames[i].factor) * alpha
        return { hex: '#' + c.getHexString(), factor }
      }
    }
    return { hex: '#' + frames[0].color.getHexString(), factor: frames[0].factor }
  }
}

export const sampleHorizon = makeSampler(HORIZON_KEYFRAMES)
export const sampleSky = makeSampler(SKY_KEYFRAMES)

// Overall how-far-into-night factor — the brighter of the two journeys.
// Used to dim things that follow the sunset's level without carrying
// its colour (verification inspection lights, bounce ambient).
export function sunsetLevel(t) {
  return Math.max(sampleHorizon(t).factor, sampleSky(t).factor)
}
