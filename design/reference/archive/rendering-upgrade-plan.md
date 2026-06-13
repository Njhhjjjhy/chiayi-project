# Rendering upgrade plan – chiayi-project

## What this is

A plan and build prompt for upgrading the `chiayi-project` Vite + R3F simulation from its current flat rendering to a cinematically accurate dark-installation look. Two parallel tracks: **rendering** and **audio foundation**. Both are independent of the proposals work and the `EntryPathway` mounting bug.

---

## Context

The current simulation renders geometry correctly but looks flat. The research document (`compass_artifact_wf-c8ef98ef-2bfb-4281-9085-ff20920bb0ed_text_markdown.md`) establishes the full post-processing and audio architecture. This plan puts that research into executable form for Claude Code.

Decisions locked from research:
- AgX tone mapping (not ACES) – preserves green hue in emissive points through highlight roll-off.
- `HalfFloatType` on `EffectComposer` – prevents banding in near-black areas.
- Pass order: N8AO → Bloom → Vignette → Noise → SMAA → ToneMapping.
- Clustered audio (8 sources, not 800) – performance requirement.
- `<Canvas flat>` – renderer tone mapping off, composer owns it.

---

## Scope

### Track A – rendering (priority)

Replaces the current renderer setup with the full post-processing stack. No geometry changes. No new firefly logic. Rendering layer only.

### Track B – audio foundation

Builds the audio architecture skeleton: `AudioProvider`, ambient bed, cluster stubs, thunder cue structure. No audio files required for this pass – stubs with placeholder paths. Architecture must be correct so audio can be wired in once files are sourced.

---

## Build pattern

- Step 0: read-only discovery – list every file that will be touched before changing anything.
- 5 simultaneous batches before any confirmation stop.
- One summary block per stop: built / flagged / deferred.

---

## Hard rules (apply throughout)

- Canonical wall names only – no compass directions.
- "Pathway" always – never "corridor."
- No artist, designer, studio, or artwork names in code, comments, filenames, or commits.
- Sentence case in all comments.
- Surface-flush nudge: any mesh placed against a wall face must be nudged 5–10 mm away from the wall along the flush axis.
- Never remove geometry silently – list and flag before deleting.
- One `EffectComposer` in the tree, always. Remove any existing one found during discovery.

---

## Build prompt

Paste the following into Claude Code.

---

**Prompt: Rendering upgrade + audio foundation – `chiayi-project`**

**Codebase path:** `/Users/riaan/Documents/Design Files/Code Projects/chiayi-project/`

---

### Step 0 – Read-only discovery (mandatory, do not skip)

Before changing any file:

1. List every file in `src/` and its subdirectories.
2. Open and read the current `<Canvas>` props in the root scene file (likely `App.jsx`, `App.tsx`, `main.jsx`, or `src/scene/Scene.jsx` – check all).
3. Find every existing `EffectComposer`, `Bloom`, tone mapping, or ambient occlusion reference anywhere in the codebase. List file paths and line numbers.
4. Find every `THREE.AudioListener`, `PositionalAudio`, or `AudioContext` reference anywhere in the codebase. List file paths and line numbers.
5. Find every `meshStandardMaterial` or `MeshStandardMaterial` with an `emissive` prop. List them.
6. Check `package.json` for current installed versions of: `three`, `@react-three/fiber`, `@react-three/postprocessing`, `postprocessing`, `n8ao`.

Stop here. Output the full discovery list. Do not proceed to batch 1 until discovery is complete.

---

### Batch group A – rendering track (5 batches simultaneously)

**Batch A1 – install and pin dependencies**

Run in the project root:

```bash
npm install three@latest @react-three/fiber@latest @react-three/postprocessing@latest postprocessing@latest n8ao@latest
```

After install, read `package.json` and confirm installed versions. Flag if any version is below the minimums: `three` ≥ r161, `@react-three/fiber` ≥ 8.x, `@react-three/postprocessing` ≥ 3.0, `postprocessing` ≥ 6.37, `n8ao` ≥ 1.9.x.

**Batch A2 – update `<Canvas>` props**

Locate the root `<Canvas>` element. Replace or add the following props exactly:

```jsx
<Canvas
  flat
  dpr={Math.min(window.devicePixelRatio, 1.5)}
  gl={{ antialias: false, powerPreference: 'high-performance' }}
>
```

`flat` forces `THREE.NoToneMapping` on the renderer. This is required so the composer's `<ToneMapping>` is the single source of truth. If any existing `toneMapping` or `toneMappingExposure` props are on the `<Canvas>`, remove them.

**Batch A3 – create `src/postfx/PostEffects.jsx`**

Create the file at `src/postfx/PostEffects.jsx`:

```jsx
import { EffectComposer, N8AO, Bloom, Vignette, Noise, SMAA, ToneMapping }
  from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import * as THREE from 'three'

// Post-processing stack for the firefly installation sim.
// Pass order is load-bearing – do not reorder.
// Tone mapping lives here only; renderer is NoToneMapping via <Canvas flat>.
export function PostEffects() {
  return (
    <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
      {/* Ambient occlusion – must run first, while depth is pristine */}
      <N8AO
        aoRadius={0.4}
        distanceFalloff={1.0}
        intensity={3.0}
        color="black"
        halfRes={false}
        quality="High"
        screenSpaceRadius={false}
      />
      {/* Selective bloom – only materials with emissiveIntensity > 1
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
```

**Batch A4 – mount `<PostEffects>` inside `<Canvas>`**

Find the root scene component that is a direct child of `<Canvas>`. Mount `<PostEffects />` there. Import from `'../postfx/PostEffects'` (adjust relative path as needed). If an existing `EffectComposer` or post-processing setup already exists anywhere, remove it entirely – do not leave it alongside the new component. There must be exactly one `EffectComposer` in the tree.

**Batch A5 – audit emissive materials**

Go through every material visible in the scene. Apply the following rules:

- Firefly LED spheres: `emissive="#00ff00"`, `emissiveIntensity={3}`, `toneMapped={false}`. These will bloom. Do not change sphere radius – keep at 0.025.
- Warm luffa wall / any warm-lit panel: `emissive` set to warm white (around `#fff0cc`), `emissiveIntensity={1.4}`, `toneMapped={true}`. Lit but does not bloom.
- All walls, floor, partitions, column, ceiling panels: at least a low emissive value (`emissiveIntensity` around 0.04–0.08, matching the material's dark base colour) so it is not crushed to pure black by the AgX pass. Use `emissive` matching the surface colour (`#1a1a1a` for matte near-black plywood).
- Theatrical curtain plane: `emissive="#0a0f1c"` (dark blue), `emissiveIntensity={0.06}`, `toneMapped={true}`.
- Any material currently with no emissive and non-firefly geometry is a bug – fix it.

Add a brief comment above each material group: blooms / lit-no-bloom / ambient-visible.

Stop after batch group A. Output: built / flagged / deferred. Wait for go signal before proceeding to batch group B.

---

### Batch group B – audio foundation track (5 batches simultaneously)

Start only after batch group A is confirmed.

**Batch B1 – create `src/audio/AudioProvider.jsx`**

```jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Single audio listener for the entire scene.
// AudioContext starts suspended in all browsers – resumes only after
// a real user gesture (pointerdown or keydown).
// iOS: the hardware silent switch mutes Web Audio regardless of code – no workaround.

const AudioCtx = createContext(null)
export const useAudio = () => useContext(AudioCtx)

export function AudioProvider({ children }) {
  const [ready, setReady] = useState(false)
  const listenerRef = useRef(new THREE.AudioListener())

  useEffect(() => {
    const unlock = () => {
      listenerRef.current.context.resume().then(() => setReady(true))
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      // Clean up on unmount to avoid AudioContext accumulation in dev HMR.
      listenerRef.current.context.close()
    }
  }, [])

  return (
    <AudioCtx.Provider value={{ listener: listenerRef.current, ready }}>
      {children}
    </AudioCtx.Provider>
  )
}
```

**Batch B2 – create `src/audio/AmbientBed.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useAudio } from './AudioProvider'

// Three non-positional looped ambient layers.
// Placeholder paths – replace with real OGG files before install.
// OGG Vorbis only – MP3 will not loop seamlessly.
const LAYERS = [
  { url: '/audio/ambient-drone.ogg', volume: 0.4 },
  { url: '/audio/ambient-pad.ogg', volume: 0.3 },
  { url: '/audio/ambient-forest-night.ogg', volume: 0.25 },
]

export function AmbientBed() {
  const { listener, ready } = useAudio()
  const soundsRef = useRef([])

  useEffect(() => {
    if (!ready) return
    const loader = new THREE.AudioLoader()
    LAYERS.forEach(({ url, volume }) => {
      const sound = new THREE.Audio(listener)
      loader.load(url, (buffer) => {
        sound.setBuffer(buffer)
        sound.setLoop(true)
        sound.setVolume(volume)
        sound.play()
        soundsRef.current.push(sound)
      })
    })
    return () => {
      soundsRef.current.forEach((s) => { s.stop(); s.disconnect() })
      soundsRef.current = []
    }
  }, [ready, listener])

  return null
}
```

**Batch B3 – create `src/audio/FireflyClusters.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAudio } from './AudioProvider'

// Eight cluster PositionalAudio sources – one per spatial zone in the forest.
// Do not use one source per firefly (800 PannerNodes will kill audio performance).
// Cluster centroids are approximate zone centres; adjust after viewing in sim.
// Placeholder audio paths – replace with OGG files before install.
const CLUSTERS = [
  { position: [3.0, 1.5, 1.5], url: '/audio/firefly-rustle-a.ogg' },
  { position: [5.0, 1.5, 1.5], url: '/audio/firefly-rustle-b.ogg' },
  { position: [7.0, 1.5, 1.5], url: '/audio/firefly-rustle-a.ogg' },
  { position: [3.0, 1.5, 3.5], url: '/audio/firefly-rustle-b.ogg' },
  { position: [5.0, 1.5, 3.5], url: '/audio/firefly-rustle-a.ogg' },
  { position: [7.0, 1.5, 3.5], url: '/audio/firefly-rustle-b.ogg' },
  { position: [4.0, 1.5, 5.5], url: '/audio/firefly-rustle-a.ogg' },
  { position: [6.5, 1.5, 5.5], url: '/audio/firefly-rustle-b.ogg' },
]

export function FireflyClusters() {
  const { listener, ready } = useAudio()
  const { scene } = useThree()
  const sourcesRef = useRef([])

  useEffect(() => {
    if (!ready) return
    const loader = new THREE.AudioLoader()
    CLUSTERS.forEach(({ position, url }) => {
      const obj = new THREE.Object3D()
      obj.position.set(...position)
      scene.add(obj)
      const sound = new THREE.PositionalAudio(listener)
      sound.setRefDistance(0.6)
      sound.setRolloffFactor(2)
      sound.panner.panningModel = 'HRTF'
      loader.load(url, (buffer) => {
        sound.setBuffer(buffer)
        sound.setLoop(true)
        sound.setVolume(0.5)
        sound.play()
      })
      obj.add(sound)
      sourcesRef.current.push({ obj, sound })
    })
    return () => {
      sourcesRef.current.forEach(({ obj, sound }) => {
        sound.stop()
        sound.disconnect()
        scene.remove(obj)
      })
      sourcesRef.current = []
    }
  }, [ready, listener, scene])

  return null
}
```

**Batch B4 – create `src/audio/ThunderCue.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useAudio } from './AudioProvider'

// Non-positional thunder cue – plays equally everywhere in the room.
// Scheduled on the audio clock (not setTimeout) for sample-accurate timing.
// Placeholder path – replace with OGG file before install.

export function ThunderCue() {
  const { listener, ready } = useAudio()
  const soundRef = useRef(null)

  useEffect(() => {
    if (!ready) return
    const sound = new THREE.Audio(listener)
    const loader = new THREE.AudioLoader()
    loader.load('/audio/thunder.ogg', (buffer) => {
      sound.setBuffer(buffer)
      sound.setLoop(false)
      sound.setVolume(0.7)
      soundRef.current = sound
    })
    return () => {
      sound.stop()
      sound.disconnect()
    }
  }, [ready, listener])

  return null
}
```

**Batch B5 – mount audio components and attach listener to camera**

1. Wrap the root app (above `<Canvas>`) with `<AudioProvider>`.
2. Inside `<Canvas>`, in the root scene component, add a `useEffect` that attaches the listener to the camera:

```jsx
const { listener } = useAudio()
const { camera } = useThree()
useEffect(() => {
  camera.add(listener)
  return () => camera.remove(listener)
}, [camera, listener])
```

3. Mount `<AmbientBed />`, `<FireflyClusters />`, and `<ThunderCue />` inside `<Canvas>` as siblings to the scene geometry.
4. Create `public/audio/` directory with a `.gitkeep` file. Add a `README.md` in that directory: "Audio files go here. Format: OGG Vorbis. All ambient layers must have a clean loop point. See `src/audio/` for expected filenames."

Stop after batch group B. Output final summary: built / flagged / deferred. Take a screenshot of the sim before stopping – confirm the rendering change is visible and the scene is not black.

---

### Pacing

5 simultaneous batches before any confirmation stop. After each stop, output: built / flagged / deferred. Do not proceed past a stop without a go signal.
