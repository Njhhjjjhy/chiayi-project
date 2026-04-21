# References — 3d web experiences, particle systems, and technical resources

## Immersive 3d web experiences (inspiration)

These are award-winning or notable websites that demonstrate what's possible with Three.js and WebGL in the browser. Use them as reference for quality, interaction patterns, and atmosphere.

**100 Lost Species — Immersive Garden**
https://www.100lostspecies.com/
A digital memorial for extinct species. Minimal, contemplative, scroll-driven. Relevant because it's an ecological story told through immersive web design. Uses soft watercolor textures and generous negative space. Awwwards site of the day.

**Immersive Garden — studio portfolio**
https://immersive.garden/
The studio behind 100 Lost Species. Their own website uses 3d bas-relief compositions, cinematic scroll transitions, and textural detail. Demonstrates how to balance visual complexity with usability.

**Awwwards WebGL collection**
https://www.awwwards.com/awwwards/collections/webgl/
A curated gallery of WebGL-powered websites. Browse for interaction patterns, transition styles, and visual treatments.

**Awwwards Three.js collection**
https://www.awwwards.com/awwwards/collections/three-js/
Specifically Three.js-based sites. Includes product configurators, portfolios, storytelling experiences, and art projects.

**Awwwards 3d websites**
https://www.awwwards.com/websites/3d/
Broader 3d web design showcase.

**Awwwards immersive WebGL exhibitions**
https://www.awwwards.com/immersive-webgl-virtual-gallery-exhibition-collection.html
Virtual museums and gallery experiences — close to what this project will become in its public phase.

**David Whyte Experience — Immersive Garden**
Awwwards site of the month, December 2024. An immersive experience built around the work of poet David Whyte. Relevant for mood, atmosphere, and how text/narrative can integrate with 3d environments.

## Firefly and particle references (technical)

**Three.js firefly shader and material**
https://github.com/thebenezer/threejs-fireflies
A dedicated firefly implementation for Three.js with custom shaders. Includes FireFlyMaterial (shader-based) and FireFlies class for instanced positioning. Directly applicable to this project.

**Three.js night fireflies — Codepen**
https://codepen.io/elliezen/pen/qmoqMv
A complete Three.js firefly scene with a jar, ground plane, and floating firefly particles. Good reference for particle behavior and glow effects.

**Three.quarks — particle/vfx engine for Three.js**
https://github.com/Alchemist0823/three.quarks
A full particle system engine with a visual editor. Supports instancing, emitter shapes, color over lifetime, and force fields. Could be useful for complex firefly behaviors like the wave variant.

**@newkrok/three-particles**
https://github.com/NewKrok/three-particles
Another particle system for Three.js with React Three Fiber integration. Has a live editor, sub-emitters, trail rendering, and soft particles. Includes a React component example.

**Three.js forest rendering**
https://github.com/ChanganVR/Forest
A Three.js forest scene with natural lighting and shadows. Good reference for environment setup even though this project builds environments from primitives.

**Three particle fire**
https://github.com/yomotsu/three-particle-fire
A particle fire effect for Three.js. The additive blending and glow techniques transfer to firefly rendering.

## Scroll-driven 3d (technical tutorials)

**Scroll-driven 3d image tube — Codrops / React Three Fiber**
https://tympanus.net/codrops/2026/02/17/reactive-depth-building-a-scroll-driven-3d-image-tube-with-react-three-fiber/
Detailed tutorial on building scroll-driven 3d with React Three Fiber. Covers shader deformation, inertial motion, and synchronized dom overlays. Relevant for phase 8 (public website).

**Scroll animations with React Three Fiber and GSAP**
https://wawasensei.hashnode.dev/scroll-animations-with-react-three-fiber-and-gsap
Tutorial on combining React Three Fiber with GSAP ScrollTrigger. Practical patterns for scroll-driven camera movement and scene transitions.

**@14islands/r3f-scroll-rig**
https://github.com/14islands/r3f-scroll-rig
A React Three Fiber library for syncing 3d objects with scrolling dom elements. Handles dom tracking, viewport rendering, and smooth scrolling.

## React Three Fiber ecosystem

**React Three Fiber documentation**
https://r3f.docs.pmnd.rs/

**@react-three/drei documentation**
https://drei.docs.pmnd.rs/

**Leva (parameter controls)**
https://github.com/pmndrs/leva

**Three.js documentation**
https://threejs.org/docs/

**Three.js examples**
https://threejs.org/examples/

## Codrops — React Three Fiber tutorials**
https://tympanus.net/codrops/tag/react-three-fiber/
A collection of advanced React Three Fiber tutorials covering scroll-driven scenes, instancing, weather simulation, cloth animation, and more.

## Notes on Three.js in 2026

As of 2026, Three.js r171+ supports WebGPU rendering with automatic fallback to WebGL 2. For this project, start with the standard WebGL renderer for maximum compatibility. WebGPU can be explored in a later optimization pass if needed. Safari 26 now supports WebGPU, so browser coverage is good.
