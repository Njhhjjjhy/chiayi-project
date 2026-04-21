# Chiayi firefly exhibition — PBR texture reference

Companion to `exhibition-build-prompt.md` (the R3F build specification) and `useExhibitionTextures.ts` (the texture loading hooks). Read both files together — the build prompt defines geometry and lighting; this file defines every surface material.

This document maps every physical surface in the 10x10m immersive firefly exhibition space at the Tsou community and cultural center in the Alishan mountains, Chiayi, Taiwan. Each surface is matched to a specific free CC0 texture from ambientCG.com, with material settings tuned for React Three Fiber / Three.js `meshStandardMaterial` or `meshPhysicalMaterial`.

All textures are CC0 public domain. No attribution required.


---


## Exhibition space overview

The room is 10m wide x 10m deep x approximately 3.5m tall (estimated). It is divided into these primary surfaces:

- **Ceiling:** dropped ceiling made of modular 120x120cm panels, dark material, housing firefly LEDs above and through the panels. Represents the forest canopy.
- **Mountain wall (back wall, ~10m wide):** 4-5 layered CNC-cut plywood panels forming a mountain silhouette, with RGB LED strips behind each layer for a sunset-to-darkness transition. The layers have 5-15cm gaps between them.
- **Side walls:** dark, receding into blackness. May have fiber/textile treatment or remain minimal.
- **Floor:** forest floor aesthetic — real wood, grass, and stones. The feeling of walking through an Alishan forest clearing at dusk.
- **Entrance transition zone:** visitors move from the lit cultural center into darkness. Needs a threshold material.

The overall lighting condition is near-total darkness once the sunset sequence completes, punctuated only by 100 warm firefly LEDs (2700-3000K with slight green shift) distributed across the ceiling and walls.


---


## Surface-by-surface texture mapping


### 1. Floor — forest floor with wood, earth, and grass

The floor should feel like a field of grass with stones — walking through nature. In the 3D version, this needs to read as a dark, organic ground surface.

**Primary texture: Ground052 (forest floor with leaves and moss)**

- Preview: https://ambientcg.com/view?id=Ground052
- Download 2K: https://ambientcg.com/get?file=Ground052_2K-JPG.zip
- Download 1K: https://ambientcg.com/get?file=Ground052_1K-JPG.zip
- Tags: dirt, forest, ground, leaves, moss, nature
- Why: this is a photogrammetry-scanned forest floor with leaf litter, moss patches, and exposed earth. It directly matches the brief of "field of grass with stones."

Material settings for R3F:
```
roughness: 0.92
metalness: 0
displacementScale: 0.08
envMapIntensity: 0.05
repeat: [4, 4]
color adjustment: darken by multiplying with #404030 to simulate low-light conditions
```

**Alternative floor texture: Ground037 (mossy forest ground)**

- Preview: https://ambientcg.com/view?id=Ground037
- Download 2K: https://ambientcg.com/get?file=Ground037_2K-JPG.zip
- Why: denser moss coverage, more uniformly green. Use if you want the floor to feel more like a moss carpet.

**Alternative floor texture: Ground026 (smooth clay/earth)**

- Preview: https://ambientcg.com/view?id=Ground026
- Download 2K: https://ambientcg.com/get?file=Ground026_2K-JPG.zip
- Why: if you want a simpler, more architectural earth floor (like rammed earth) instead of the naturalistic forest floor.

**Wood plank paths through the floor: WoodFloor008 (dark parquet)**

- Preview: https://ambientcg.com/view?id=WoodFloor008
- Download 2K: https://ambientcg.com/get?file=WoodFloor008_2K-JPG.zip
- Tags: clean, dark, floor, parquet, smooth, wood
- Why: for any raised wooden walkway paths that guide visitors through the space. Dark-stained wood matches the mood.
- Use on narrow rectangular planes representing boardwalk paths across the forest floor.

Material settings for wood paths:
```
roughness: 0.55
metalness: 0
displacementScale: 0.01
envMapIntensity: 0.15
repeat: [2, 8] (planks running lengthwise along the path)
```


### 2. Ceiling — dark modular panels (forest canopy)

The dropped ceiling is made of 120x120cm modular panels. These are dark — they need to disappear into blackness while allowing tiny points of firefly light to emerge through perforations or gaps.

**Primary texture: Fabric030 (grey cloth)**

- Preview: https://ambientcg.com/view?id=Fabric030
- Download 2K: https://ambientcg.com/get?file=Fabric030_2K-JPG.zip
- Tags: cloth, fabric, grey
- Why: the woven texture reads as acoustic felt when darkened. The subtle weave pattern gives the ceiling surface micro-detail without being visually distracting.

Material settings for R3F:
```
roughness: 0.95
metalness: 0
displacementScale: 0.005
envMapIntensity: 0.02
repeat: [10, 10] (dense tiling for fine weave)
color: multiply base map with #1a1a1a (near-black — the ceiling must nearly vanish)
```

**Alternative: Fabric048 (dark denim-like fabric)**

- Preview: https://ambientcg.com/view?id=Fabric048
- Download 2K: https://ambientcg.com/get?file=Fabric048_2K-JPG.zip
- Why: darker out of the box, heavier weave texture. May work better if you want visible panel seams to suggest a grid structure.

**How to render firefly perforations in the ceiling:**
The ceiling panels should be modeled as 120x120cm quads with small circular holes (5-10mm diameter) at random positions. Behind each panel, place point lights (warm 2700K, intensity very low, animated fade-in/fade-out). The fabric texture goes on the front face; the holes reveal the glow from behind. Alternatively, skip geometry holes and use emissive point sprites positioned just below the ceiling surface.


### 3. Mountain wall — layered silhouette panels

The back wall is the centerpiece: 4-5 layers of CNC-cut plywood mountain profiles with 5-15cm gaps between them. RGB LED strips behind each layer transition from sunset colors to darkness.

**Layer surfaces (front face of each plywood panel): Plywood001**

- Preview: https://ambientcg.com/view?id=Plywood001
- Download 2K: https://ambientcg.com/get?file=Plywood001_2K-JPG.zip
- Tags: birch, plywood, wood
- Why: the panels are literally CNC-cut plywood. This gives them an honest, craft-forward materiality that connects to the handmade ethos.

Material settings for mountain layers (front-facing):
```
roughness: 0.7
metalness: 0
displacementScale: 0
envMapIntensity: 0.1
color: tint each layer differently —
  layer 1 (foreground, darkest): multiply with #1a2a15 (near-black forest green)
  layer 2: multiply with #2a3a22
  layer 3: multiply with #3a4a30
  layer 4 (background, lightest): multiply with #556b4a (sage)
```

**Alternative approach: solid flat colors on the mountain layers.**

In the reference images (project images 6 and 7), the mountain layers are painted in flat gradient greens. You could skip texturing and just use `meshStandardMaterial` with flat colors and no maps. This is simpler and might actually look more faithful to the reference.

Solid color values per layer (front to back):
```
layer 1 (foreground): #0d1a0a
layer 2: #1a2e14
layer 3: #2d4423
layer 4: #4a6b3a
layer 5 (most distant): #7a9a6a
```

**Sky backdrop behind all layers:**

This is the illuminated surface that receives the sunset gradient. Use a large plane behind all mountain layers.

- No texture needed — use a shader or animated color gradient.
- Sunset phase colors (top to bottom): #f5c842 (warm gold), #e87d3e (deep orange), #c44b6c (magenta), #5a3b8a (deep purple), #1a1a2e (night blue).
- Animate by lerping these colors over time, eventually fading to pure black (#000000) for the firefly phase.
- The horizontal sun lines from image 6 can be rendered as thin emissive strips (2-3px tall planes) positioned behind the distant mountain layers.


### 4. Side walls — dark / receding

The side walls should dissolve into darkness. Three options depending on which design direction you go:

**Option A: dark concrete (gallery-style)**

- Texture: Concrete015 (clean, dark, smooth)
- Preview: https://ambientcg.com/view?id=Concrete015
- Download 2K: https://ambientcg.com/get?file=Concrete015_2K-JPG.zip
- Tags: clean, concrete, dark, smooth

Material settings:
```
roughness: 0.6
metalness: 0
displacementScale: 0.01
envMapIntensity: 0.05
repeat: [3, 2]
color: multiply with #0a0a0a (the walls should be barely visible)
```

**Option B: moss/fiber wall (the "veil" concept)**

If one of the side walls becomes the textured fiber wall with embedded firefly lights, use:

- Texture: Moss002 (dense green moss)
- Preview: https://ambientcg.com/view?id=Moss002
- Download 2K: https://ambientcg.com/get?file=Moss002_2K-JPG.zip
- Tags: green, moss, mossy

Material settings:
```
roughness: 0.95
metalness: 0
displacementScale: 0.15 (high — the moss should look pillowy and deep)
envMapIntensity: 0.05
repeat: [6, 3]
color: darken significantly — multiply with #151a12
```

This wall would also have emissive point sprites scattered across it to simulate LEDs buried in the fiber mass.

**Option C: rammed earth wall**

- Texture: Ground026 (clay, flat, smooth)
- Preview: https://ambientcg.com/view?id=Ground026
- Download 2K: https://ambientcg.com/get?file=Ground026_2K-JPG.zip

Material settings:
```
roughness: 0.85
metalness: 0
displacementScale: 0.03
envMapIntensity: 0.05
repeat: [3, 2]
color: multiply with #1a1510 (very dark earth)
```


### 5. Entrance tunnel / transition zone

Visitors walk from the bright cultural center into the exhibition darkness. This threshold needs a distinct material that signals transition.

**Texture: Bark007 (dark tree bark)**

- Preview: https://ambientcg.com/view?id=Bark007
- Download 2K: https://ambientcg.com/get?file=Bark007_2K-JPG.zip
- Tags: bark, brown, dark, tree, wood
- Why: walking through a bark-textured passage simulates entering a hollow tree or forest passage. Connects to the Tsou relationship with the Alishan forest.

Material settings:
```
roughness: 0.9
metalness: 0
displacementScale: 0.1
envMapIntensity: 0.03
repeat: [2, 4]
```


---


## Complete texture download table

Run from your project root. All URLs point to ambientCG 2K JPG packs.

| texture ID | surface | download URL |
|---|---|---|
| Ground052 | forest floor (primary) | https://ambientcg.com/get?file=Ground052_2K-JPG.zip |
| Ground037 | forest floor (alt: mossy) | https://ambientcg.com/get?file=Ground037_2K-JPG.zip |
| Ground026 | earth floor / earth wall | https://ambientcg.com/get?file=Ground026_2K-JPG.zip |
| WoodFloor008 | wood plank paths | https://ambientcg.com/get?file=WoodFloor008_2K-JPG.zip |
| Fabric030 | ceiling panels (primary) | https://ambientcg.com/get?file=Fabric030_2K-JPG.zip |
| Fabric048 | ceiling panels (alt) | https://ambientcg.com/get?file=Fabric048_2K-JPG.zip |
| Plywood001 | mountain wall panels | https://ambientcg.com/get?file=Plywood001_2K-JPG.zip |
| Concrete015 | side walls (gallery) | https://ambientcg.com/get?file=Concrete015_2K-JPG.zip |
| Moss002 | moss/fiber wall | https://ambientcg.com/get?file=Moss002_2K-JPG.zip |
| Bark007 | entrance tunnel | https://ambientcg.com/get?file=Bark007_2K-JPG.zip |


---


## AmbientCG file naming convention

Every 2K JPG pack unzips to these files:

```
{TextureID}_2K_Color.jpg           — albedo / diffuse (load as sRGB)
{TextureID}_2K_NormalGL.jpg        — normal map, OpenGL format (load as linear)
{TextureID}_2K_Roughness.jpg       — roughness (load as linear, white = rough)
{TextureID}_2K_Displacement.jpg    — height map (load as linear)
{TextureID}_2K_AmbientOcclusion.jpg — AO (load as linear)
```


---


## Lighting notes for the 3D scene

The exhibition lighting is extremely specific. Here is the full sequence:

**Phase 1 — sunset (warm).** The sky backdrop behind the mountain wall glows warm gold-to-orange. Ambient light in the room is very low and warm (color: #f5c842, intensity: 0.15). The rest of the room is already quite dark.

**Phase 2 — blue hour (cool transition).** Sky shifts through magenta to purple to deep blue. Ambient drops further (color: #3a2a5a, intensity: 0.05). Mountain layers become pure silhouettes.

**Phase 3 — darkness.** Near-total black. Ambient intensity: 0.01, color: #050510. Only the faintest edge of night sky visible behind the mountains.

**Phase 4 — firefly emergence.** In complete darkness, individual point lights begin to appear across the ceiling and walls. Each firefly is a point light with:
```
color: #e6c84a (warm yellow with slight green — firefly bioluminescence)
intensity: 0.3 to 0.8 (randomized per firefly)
distance: 2.5 (limited falloff radius)
decay: 2
animation: sinusoidal fade-in/fade-out, period 2-6 seconds (randomized)
```

100 firefly points total, distributed in clusters of 16-18 per ceiling module. Some modules have infrared-triggered fireflies that respond to visitor presence (simulate with raycasting in the 3D version).

**Environmental light sources:**
- No overhead lights, no visible light fixtures.
- Floor-level dim path lighting for safety: small warm LEDs embedded in the wood walkway edges (emissive material on the walkway edge strips, color: #4a3520, intensity: very low).
- Faint moonlight wash from above: a single very dim directional light, color: #2a2a40, intensity: 0.02, pointing downward.

**Shadow settings:**
- Firefly point lights should not cast shadows (too expensive, and fireflies do not cast meaningful shadows).
- The moonlight directional can cast soft shadows (shadow map: 1024, bias: -0.001, shadow radius: 8 for soft edges).


---


## Color palette

These are the dominant colors drawn from the reference images and the Alishan forest environment:

```
alishan forest night:     #0a0f08
mountain foreground:      #0d1a0a
mountain mid-green:       #2d4423
mountain distant sage:    #7a9a6a
sunset gold:              #f5c842
sunset orange:            #e87d3e
sunset magenta:           #c44b6c
night sky deep:           #0a0a1a
firefly glow:             #e6c84a
firefly glow green:       #b8c84a
moss deep:                #1a2a12
earth warm:               #3a2a1a
bark dark:                #1a1210
wood path:                #2a1f15
path light dim:           #4a3520
moonlight wash:           #2a2a40
```


---


## Sound design notes (for the 3D web experience)

If building an interactive web experience, consider these ambient audio layers:

- **Sunset phase:** distant bird calls (Taiwan blue magpie, Mikado pheasant), wind through bamboo. Volume: low. Source: positioned behind the mountain wall.
- **Blue hour:** sounds thin out. Last bird calls. A single temple bell in the distance. Volume: very low.
- **Darkness:** near silence. Then gradually: crickets, frogs, water dripping. Volume: whisper-level.
- **Firefly phase:** continuous soft night forest soundscape. Occasional Tsou flute melody (low, slow, pentatonic). Volume: barely audible.

Use Web Audio API spatial audio. Position sources in 3D space so they shift as the visitor (camera) moves.


---


## Reference image index

Every image in the project mapped to its function:

| file | what it shows | design function |
|---|---|---|
| `durer_20230317T00_54_37_956Z.png` | carved wooden disc with concentric patterns on a stand, by durer.ai x Christiaan Jurie Burger | art direction reference — craft vocabulary, radial geometry |
| `Light1_15.jpg`, `Light1_18.jpg`, `Light1_19.jpg` | illuminated rectangular lamps: perforated copper mesh upper section, wooden base | ceiling module housing reference — how light diffuses through mesh |
| `download15.jpg` | hourglass/double-pyramid light sculpture with granular textured surface | lighting design reference — inverted forms, warm glow from within |
| `1000004539.jpg` | woven lattice pendant lamps, dark screen backdrop (durer.ai x Christiaan Jurie Burger) | craft-informed lighting — open weave casting shadow patterns |
| `1000004540.jpg` | painted mountain mural on a wall, layered green ridges with sunset orange/gold sky, horizontal line details | mountain wall design reference — color palette, horizontal sun lines |
| `1000004541.jpg` | LED-backlit mountain silhouettes with purple/magenta backlighting, geometric peak shapes | mountain wall design reference — 3D layered panel approach with LED edges |
| `1000003491.jpg` | Japanese ceiling light fixture with geometric lattice panels, wooden frame with flower medallions | traditional light diffusion reference — how geometric patterns filter light |
| `1000003492.jpg` | Japanese ceiling fixture close-up, triangular geometric pattern in diffusion panels | detail reference — kumiko-style patterning for ceiling modules |
| `1000003493.jpg` | Japanese ceiling fixture from below in dark room, diamond shape with patterned panels | mood reference — how a single illuminated object reads in near-darkness |
| `1000001417.jpg` | dark scene with columns of light falling onto a floor, like light through a forest canopy | atmosphere reference — the quality of light in the darkened exhibition space |
| `1000001418.jpg` | illuminated water fountain/spray in total darkness, white light on water droplets | firefly emergence reference — points of light appearing from nothing |
| `1000001419.jpg` | same fountain from different angle, wider view showing the spray pattern | firefly distribution reference — scattered light points in darkness |
| `1000001420.jpg` | close-up texture of dense, bumpy natural material (moss, lichen, or coral) | tactile wall surface reference — the "veil" concept's fiber texture target |
| `1000001421.jpg` | large-scale textured wall installation in a gallery, dense natural material covering entire wall surface | wall treatment reference — scale and density of fiber/moss wall |
| `1000001422.jpg` | layered translucent silhouette figures in gold and blue tones, overlapping human forms | shadow/projection art reference — layered transparency, color mixing |
| `1000001430.jpg` | same layered silhouette figures in pink and green tones | shadow/projection art reference — different color scheme, same technique |
| `fbff0e765c554e869eba61838def9cfd1_all_113.jpg` | ceramic coiled sculpture at an art fair, white tubular forms creating open lattice | sculptural reference — organic form-making from repeated elements |
| `fbff0e765c554e869eba61838def9cfd1_all_123.jpg` | abstract layered painting/textile work, blues, greens, cyans, golds, ribbons of fabric stretched across structural armature | material art reference — layered tension, color through structure |
| `fbff0e765c554e869eba61838def9cfd1_all_124.jpg` | same artist ("Daun"), greens, reds, yellows, pinks — more organic palette | material art reference — natural color palette through structural form |
| `fbff0e765c554e869eba61838def9cfd1_all_144.jpg` | carved wooden totem/column, dense interlocking biomorphic forms with voids | sculptural reference — the "understory column" concept's form language |
| `fbff0e765c554e869eba61838def9cfd1_all_145.jpg` | same totem from rear angle, showing through-holes and deep carving | structural reference — how light passes through carved wood voids |
