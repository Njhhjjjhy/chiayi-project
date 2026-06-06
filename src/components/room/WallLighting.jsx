import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useProposal } from '../../hooks/useProposal.js'
import { useTimeline } from '../../hooks/useTimeline.js'
import { sampleHorizon, sampleSky } from '../lighting/sunsetArc.js'
import {
  ROOM, WALL_T, PARTITION_T, CABINET_T,
  ENTRY_GAP_WIDTH, PATHWAY_PARTITION_Z,
  FOREST_Z_START, FOREST_Z_END,
  FOREST_X_START,
  COLUMN_X,
} from '../../geometry/dimensions.js'

// The sunset's HORIZON fixtures — LED strips along the four forest
// boundaries, each washing colour up the surface behind it (wall or
// cabinet face). Cyclorama ground-row technique: the strip is the
// fixture, the wash above it is where the sunset is SEEN.
//
// Three things make it feel like a real sunset rather than mood strips:
//
//   1. DIRECTION — the sun sets behind the front-wall. Its strip burns
//      at full strength; the side boundaries carry a fraction; the
//      boundary facing away from the sun barely glows. (Physically:
//      the strips are simply driven at different levels.)
//   2. STACKED COLOUR — the wash is a vertical gradient: the horizon
//      colour at the strip blending into the sky colour higher up, so
//      at twilight the wall reads gold-pink low, violet above.
//   3. LIGHT DIES DOWNWARD — the wash's reach follows the arc: at
//      golden hour colour climbs high up the surface, then sinks as
//      night comes until only a low ember line remains, then out.
//
// Colour journeys live in sunsetArc.js; the timeline player drives
// everything. Subscribes to the timeline here so playback re-renders
// only this fixture layer.
//
// Style is selected from the active proposal's wallLight value:
//   sundown      → strips very low (Y = 0.05)
//   horizon-line → strips higher (Y = 0.35), slightly brighter

const BAR_SECTION = 0.02
const BAR_OFFSET = 0.01   // metres into the forest from each boundary surface
const WASH_OFFSET = 0.005 // wash plane sits between surface and strip
const WASH_PLANE_HEIGHT = 2.4 // tallest possible reach (golden hour)
const WASH_OPACITY = 0.55     // at full strength on the sun side

// How far up the wash reaches, as a fraction of WASH_PLANE_HEIGHT,
// derived from the horizon factor: full reach at golden hour sinking
// to a low band as the ember dies.
function washReach(factor) {
  return 0.22 + 0.78 * factor
}

const STYLES = {
  sundown: { y: 0.05, baseIntensity: 2.2 },
  'horizon-line': { y: 0.35, baseIntensity: 2.8 },
}

const WASH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// t runs 0 at the strip → 1 at uReach. Alpha dies toward the reach
// limit; colour blends from the horizon hue into the sky hue on the
// way up — the stacked sunset gradient.
const WASH_FRAGMENT = /* glsl */ `
  uniform vec3 uLow;
  uniform vec3 uHigh;
  uniform float uOpacity;
  uniform float uReach;
  varying vec2 vUv;
  void main() {
    float t = vUv.y / max(uReach, 0.001);
    float fall = pow(clamp(1.0 - t, 0.0, 1.0), 1.6);
    vec3 col = mix(uLow, uHigh, smoothstep(0.0, 1.2, t));
    gl_FragColor = vec4(col, uOpacity * fall);
  }
`

function makeWashMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: WASH_VERTEX,
    fragmentShader: WASH_FRAGMENT,
    uniforms: {
      uLow: { value: new THREE.Color('#ffb347') },
      uHigh: { value: new THREE.Color('#a98bd0') },
      uOpacity: { value: 0 },
      uReach: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

export default function WallLighting() {
  const { wallLight } = useProposal()
  const { time } = useTimeline()
  const style = STYLES[wallLight]

  // Strip runs along the forest boundaries, each with its sun weight.
  // The sun sets behind the front-wall: that strip is the brightest;
  // the two side boundaries carry less; the boundary facing away from
  // the sun (pathway-partition-vertical) barely glows.
  const runs = useMemo(() => {
    const X_BACK_FACE = FOREST_X_START + CABINET_T + PARTITION_T // pathway-partition-vertical's forest-side face
    const X_FRONT_FACE = ROOM.W - WALL_T                          // front-wall's forest-side face
    const Z_ENTRY_FACE = CABINET_T + PARTITION_T                  // entrance-wall-partition's forest-side face
    const Z_WIN_FACE = PATHWAY_PARTITION_Z - CABINET_T - PARTITION_T // pathway-partition-horizontal's forest-side face

    const FULL_FOREST_Z_CENTER = (FOREST_Z_START + FOREST_Z_END) / 2
    const FULL_FOREST_Z_SPAN = FOREST_Z_END - FOREST_Z_START
    const PARTITION_X_CENTER = (ENTRY_GAP_WIDTH + COLUMN_X) / 2
    const PARTITION_X_SPAN = COLUMN_X - ENTRY_GAP_WIDTH

    return [
      {
        key: 'front-wall',
        weight: 1.0,
        bar: { pos: [X_FRONT_FACE - BAR_OFFSET, FULL_FOREST_Z_CENTER], size: [BAR_SECTION, BAR_SECTION, FULL_FOREST_Z_SPAN] },
        wash: { pos: [X_FRONT_FACE - WASH_OFFSET, FULL_FOREST_Z_CENTER], rotY: -Math.PI / 2, width: FULL_FOREST_Z_SPAN },
      },
      {
        key: 'entrance-wall-partition',
        weight: 0.55,
        bar: { pos: [PARTITION_X_CENTER, Z_ENTRY_FACE + BAR_OFFSET], size: [PARTITION_X_SPAN, BAR_SECTION, BAR_SECTION] },
        wash: { pos: [PARTITION_X_CENTER, Z_ENTRY_FACE + WASH_OFFSET], rotY: 0, width: PARTITION_X_SPAN },
      },
      {
        key: 'pathway-partition-horizontal',
        weight: 0.55,
        bar: { pos: [PARTITION_X_CENTER, Z_WIN_FACE - BAR_OFFSET], size: [PARTITION_X_SPAN, BAR_SECTION, BAR_SECTION] },
        wash: { pos: [PARTITION_X_CENTER, Z_WIN_FACE - WASH_OFFSET], rotY: Math.PI, width: PARTITION_X_SPAN },
      },
      {
        key: 'pathway-partition-vertical',
        weight: 0.25,
        bar: { pos: [X_BACK_FACE + BAR_OFFSET, FULL_FOREST_Z_CENTER], size: [BAR_SECTION, BAR_SECTION, FULL_FOREST_Z_SPAN] },
        wash: { pos: [X_BACK_FACE + WASH_OFFSET, FULL_FOREST_Z_CENTER], rotY: Math.PI / 2, width: FULL_FOREST_Z_SPAN },
      },
    ]
  }, [])

  // One wash material per boundary so each carries its own sun weight.
  const washMats = useMemo(
    () => runs.map(() => makeWashMaterial()),
    [runs],
  )

  const horizon = sampleHorizon(time)
  const sky = sampleSky(time)

  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    const reach = washReach(horizon.factor)
    for (let i = 0; i < runs.length; i++) {
      const u = washMats[i].uniforms
      u.uLow.value.set(horizon.hex)
      u.uHigh.value.set(sky.hex)
      u.uOpacity.value = WASH_OPACITY * horizon.factor * runs[i].weight
      u.uReach.value = reach
    }
  })
  /* eslint-enable react-hooks/immutability */

  if (!style) return null
  if (horizon.factor <= 0) return null

  return (
    <group>
      {runs.map((run, i) => {
        return (
          <group key={run.key}>
            {/* the LED strip itself, driven at this boundary's level */}
            <mesh position={[run.bar.pos[0], style.y, run.bar.pos[1]]}>
              <boxGeometry args={run.bar.size} />
              <meshStandardMaterial
                color={horizon.hex}
                emissive={horizon.hex}
                emissiveIntensity={style.baseIntensity * horizon.factor * run.weight}
                roughness={0.6}
                metalness={0}
              />
            </mesh>
            {/* its colour washing up the surface behind it */}
            <mesh
              position={[run.wash.pos[0], style.y + WASH_PLANE_HEIGHT / 2, run.wash.pos[1]]}
              rotation={[0, run.wash.rotY, 0]}
              material={washMats[i]}
            >
              <planeGeometry args={[run.wash.width, WASH_PLANE_HEIGHT]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
