import { useMemo } from 'react'
import { Effect, EffectAttribute, BlendFunction } from 'postprocessing'
import { Uniform } from 'three'

// Screen-space depth-based belly haze effect. Reads the current pixel's
// linear depth (provided by the postprocessing framework when the DEPTH
// attribute is set) and tints farther pixels with a cool haze colour
// scaled by the haze-level uniform. Near pixels stay crisp; haze builds
// toward the back wall. Matches the spec's "depth-based screen-space
// haze pass" without full world-Y reconstruction (polish-stage work).

const fragmentShader = /* glsl */`
uniform float uHazeLevel;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  // Depth is in [0,1]: 0 = near plane, 1 = far plane.
  // Squared so the haze onset is gentle close to camera.
  float d = clamp(depth, 0.0, 1.0);
  float fog = clamp(d * d * uHazeLevel * 3.0, 0.0, 1.0);
  // Faint cool-grey haze — matches the existing #0a0a0a background.
  vec3 hazeColor = vec3(0.12, 0.13, 0.18);
  outputColor = vec4(mix(inputColor.rgb, hazeColor, fog), inputColor.a);
}
`

class HazeEffectImpl extends Effect {
  constructor() {
    super('HazeEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map([['uHazeLevel', new Uniform(0.2)]]),
    })
  }
}

export default function HazePass({ hazeLevel = 0.2 }) {
  // useMemo body references no props — the effect is mount-stable.
  // Uniform updates below keep the shader in sync with the slider.
  const effect = useMemo(() => new HazeEffectImpl(), [])
  effect.uniforms.get('uHazeLevel').value = hazeLevel
  return <primitive object={effect} dispose={null} />
}
