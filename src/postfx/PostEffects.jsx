import { EffectComposer, Bloom, Vignette, Noise, SMAA, ToneMapping }
  from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// Single post-processing stack for the v2 firefly scene.
// Pass order is load-bearing – do not reorder.
// Tone mapping lives here only; the renderer runs NoToneMapping via <Canvas flat>.
// N8AO removed — was crushing the dark plywood to pure black.
export function PostEffects() {
  return (
    <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
      {/* Selective bloom – only materials with emissiveIntensity above 1
          and toneMapped={false} will bloom */}
      <Bloom
        mipmapBlur
        luminanceThreshold={1.0}
        luminanceSmoothing={0.025}
        intensity={0.8}
        levels={7}
        radius={0.85}
      />
      {/* Atmosphere and grain */}
      <Vignette offset={0.3} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
      {/* Antialiasing before tone mapping – operates on linear data */}
      <SMAA />
      {/* AgX tone mapping – preserves green hue in emissive points
          through highlight roll-off. Do not switch to ACES without testing. */}
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  )
}
