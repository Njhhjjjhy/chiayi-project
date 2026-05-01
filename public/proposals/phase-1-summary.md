# Proposals viewer — phase 1 build summary

Rough-pass scaffold of the `/proposals/:variantId` review tool. Route, providers, UI shell, haze pass, DEM scaffold, and the null variant are live. Remaining five variants render as "not yet built" placeholders that fall back to null so the route never breaks.

## What's built

### Route and page
- `/proposals` redirects to `/proposals/null`.
- `/proposals/:variantId` renders `ProposalsPage` outside the site `<Layout>` — no nav chrome, no footer, full viewport.
- Unknown `variantId` values fall back to null with a "not yet built" banner.

### State
- `ProposalsProvider` owns `currentVariantId`, `abPair`, `fireflyCount`, `hazeOverride`. Timeline playback reuses `TimelineProvider` unchanged.
- URL query params drive initial capture state: `?preset=<id>&time=<0–1>&capture=1`. `capture=1` hides every UI overlay so screenshots show the scene only and exposes `window.__proposalVariants` + `window.__proposalPresets` for registry enumeration.

### Null variant
- Bare 900 × 1200 mm landscape panel grid on the back wall (z = +HD), above the 0.90 m wainscot, respecting both service-door skips.
- Matte off-white face `#d8d4cc` on `meshStandardMaterial` — placeholder shade, confirm at gate.
- Result: 8 visible panels. 0.82 m unused vertical gap above the top row (deferred to polish).

### UI shell
- **VariantPicker** — six-chip bar at bottom centre. Hotkeys `1`–`6`. Hover panel shows label, emotional register, and notes. Greyed chips for variants with `component: null` still clickable.
- **ABToggle** — two selects at top centre with a `⇄` flip button. Disabled until ≥ 2 built variants exist. Click-only flip (no hotkey).
- **TimeScrubber** — scrubber + play/pause wired to `useTimeline`. No auto-loop. `Space` toggles play/pause (skips input/select/textarea/button focus so focused-button native activation doesn't double-fire).
- **ControlPanel** — haze slider, firefly count slider (debounced — see below), firefly mode switch, phase indicator.

### Haze pass
- `HazePass.jsx` — custom `postprocessing` Effect with `EffectAttribute.DEPTH`. Fragment: `fog = d² * uHazeLevel * 3`, mix with cool-grey `rgb(0.12, 0.13, 0.18)`. Plugged into the existing EffectComposer after Bloom + Vignette. Slider-driven in real time.

### Firefly count slider
- Module-level `setFireflyCountOverride` in `surfacePositions.js` (one-file change, no modifications to the four firefly variant files).
- `<FireflySystem key={fireflyCount}>` forces remount on count change so the variant's seeded `useMemo(distributeUnits)` re-runs with the new override.
- **Debounce** in ControlPanel: local React state drives the slider visual on every `onChange`; commit to provider state on `pointerup` OR after a 200 ms idle window. One-file change (ControlPanel.jsx only); no changes to surfacePositions or the variants.
- Slider no longer resets firefly animation on every drag tick. **Debounce is resolved — removed from the deferred list.**

### DEM scaffold
- `src/proposals/dem.js` — OpenTopography SRTM GL3 primary, Taiwan NLSC secondary stub, procedural fallback with summed sinusoids.
- Scaffold only; silhouette geometry is a phase 2 job.
- Loud `console.warn` on any failure and a `source: 'fallback'` flag so phase 2's silhouette variant can surface a viewport warning when on fallback.

### Capture pipeline
- `scripts/capture-phase.mjs` takes a phase number, starts Vite, launches Puppeteer, enumerates variants + presets from the live app, iterates variants × presets × `[blue=0.60, darkness=0.92]`, writes PNGs to `public/proposals/screenshots/phase-<N>/{variantId}-{preset}-{timeLabel}.png`.
- `window.__captureReady` flips true ~1.5 s of R3F clock time after mount so the initial firefly fade-in settles before capture.
- Puppeteer launched with `--use-gl=angle --use-angle=swiftshader`, capturing via `canvas.toDataURL` (compositor path didn't carry canvas content on macOS headless).

## Gate 1 artifacts

Six PNGs at `public/proposals/screenshots/phase-1/`:

```
null-entranceStanding-blue.png
null-entranceStanding-darkness.png
null-midRoomStanding-blue.png
null-midRoomStanding-darkness.png
null-bigWallOblique-blue.png
null-bigWallOblique-darkness.png
```

Times:
- **blue = 0.60** — mid blue-hour palette. Panels lit by low blue-purple ambient, no fireflies yet (FireflySystem gate is `time ≥ 0.75`).
- **darkness = 0.92** — deep in darkness palette. Panels unlit; fireflies at full `masterOpacity`.

## Capture pipeline limitations

Read these before reviewing the screenshots:

1. **Null at darkness is by design near-black.** The panel face is `meshStandardMaterial` (matte, needs light). At `time = 0.92` the PALETTE ambient intensity is `0.01` and there is no narrative lighting in the null variant, so the panels are invisible to a camera. The only thing that should read is fireflies.

2. **Fireflies don't survive SwiftShader + Bloom in capture.** Scene-graph diagnostics confirm 1,760 instanced meshes present at `time = 0.92` — they render in the live browser and bloom cleanly there. The Puppeteer + SwiftShader pipeline appears to lose the sub-pixel additive points before they reach Bloom, so the darkness captures read as full black even though the scene is doing the right thing at runtime. Not digging into this for phase 1 per your call.

3. **Phase 2 will be the real test.** Once moss and layered-silhouette variants land, the back wall is self-emitting (moss texture under a moonlight wash; silhouette horizon slot with an emissive strip). Those variants write non-trivial pixel values into the captured buffer without depending on additive blending or Bloom, so the capture pipeline becomes useful as a durable review artifact from gate 2 onwards.

4. **Live walkthrough remains primary for gate 1.** Run `pnpm dev` and open `http://localhost:5173/proposals/null`. All other gate-1 checks (scrubber, haze slider affecting tint, firefly count slider behaving without reset, chip bar + hotkeys, A/B greyed pending, blue-hour-ish default on first entry) read correctly in the live browser.

## Placeholders flagged for gate 1 review

- Panel face shade `#d8d4cc`.
- Firefly density slider range `500–3000`, default `1,584`.
- DEM source (OpenTopography primary). Verify the unauthenticated GET still works before phase 2; if not, add key via `VITE_OPENTOPOGRAPHY_KEY` env var.
- Door handling per variant (wrap vs terminate vs insert panel) — per-variant call during that build.

## Deferred to polish

- Firefly slider debounce — ~~deferred~~ **resolved in phase 1**.
- Panel grid top-row vertical gap (0.82 m) — pick partial-row, centred grid, or resized module.
- HazePass world-Y belly-height reconstruction (currently depth-from-camera).
- Stale wall-identity comment at top of `src/components/Room.jsx` (z = +HD is the big wall per spec + `DOOR_SKIPS.back`, not z = -HD).
- Cross-reload last-used variant persistence (sessionStorage).
- Branch geometry on side walls matching the real installation.
- Auto-looping sunset cycle.
- Bilingual labels on proposals UI.
- Reduced-motion handling.
- Leva debug panel on proposals page.
- SwiftShader-in-Bloom firefly rendering in capture (keep live walkthrough as review surface; revisit only if capture becomes blocking).

## Renames in this pass

- `BLUE_HOUR_TIME` → `DEFAULT_TIMELINE_T` in `src/proposals/defaults.js`. Value unchanged (0.78) — it's the "skip-to-fireflies / first-load" default, not the blue-hour time.

## Hotkey contract (current)

- **1–6** → select proposal variant by index.
- **Space** → play/pause timeline.
- **Click ⇄** → flip A/B (no hotkey).
- Future hotkey reservation: **X**, not Tab.

## Build / lint

- `npx eslint src scripts/capture-phase.mjs` → clean (one unrelated pre-existing warning in `GuidedTour.jsx`).
- `npm run build` → passes in prior chunk; no changes to build graph in this pass beyond capture script (not in build).
