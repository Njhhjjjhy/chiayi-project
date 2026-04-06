# 3D preview — improvement suggestions

Compiled from 18 Impeccable design skill assessments. These are suggestions for the 3D interactive preview tool (used by Riaan and Corbett only, not public-facing). None of these have been implemented.

---

## Performance

- **Memory leak in ListeningDark.jsx**: Uses `useRef` instead of `useEffect` for a `window` event listener — the listener is never cleaned up. Switch to `useEffect` with a cleanup return.
- **SkyBackdrop.jsx**: Creates new `THREE.Color` objects every frame inside the render loop. Hoist color objects to module scope or `useMemo`.
- **Particle loops**: `useFrame` loops in firefly components iterate all particles every frame without early exit. Add distance culling or visibility checks.
- **Ceiling.jsx**: Updates 64 instance matrices every render even when nothing changed. Gate updates behind a dirty flag or `useMemo`.
- **VariantSwitcher.jsx**: Triggers broad re-renders. Consider `React.memo` or splitting state.
- **Leva controls**: Verify Leva is excluded from production builds (tree-shaking or conditional import).
- **JSZip**: Check if JSZip is lazy-loaded — it's a large dependency.

## Accessibility

- **No keyboard access** to any 3D controls (variant switcher, timeline, camera presets, construction toolbar).
- **Missing ARIA attributes** systematically:
  - Toggle buttons need `aria-pressed`
  - Collapsible sections need `aria-expanded`
  - Related panels need `aria-controls`
- **Canvas has no accessible alternative**: Add `aria-label="3D preview of the firefly exhibition room"` to the Canvas element.
- **No focus-visible styles** on any 3D UI controls.
- **No skip link** to bypass the 3D canvas for keyboard users.

## UX and onboarding

- **First-visit tour**: Add a 4-step spotlight walkthrough (room intro, timeline, variants, camera presets). Track completion via `localStorage`. Make it dismissable and replayable via a "?" button.
- **"Press H" help text** is at `text-white/10` — nearly invisible. Raise to `white/40`.
- **Empty states needed**: No favorites message, WebGL failure fallback, texture load failure fallback.
- **Double-click prevention**: Add debounce to buttons that trigger expensive operations.

## Responsive and mobile

- **VariantSwitcher**: Fixed at 224px width, occupies 60% of mobile viewport. Convert to a bottom sheet on small screens.
- **Touch targets**: All 3D controls are under 44px — increase to meet minimum touch target size.
- **TimelineController**: Needs vertical stack layout on mobile.
- **Orientation hint**: Consider suggesting landscape orientation on mobile devices.

## Visual

- **ConstructionToolbar**: Uses `bg-white/95` (white background) — should match the dark overlay pattern `bg-black/80` used elsewhere.
- **Timeline phase buttons**: Color-code using the lighting variant colors (golden `#f5c842`, twilight `#c44b6c`, blue `#3a2a5a`).

## Copy and labeling

Rename UI labels to plain language (sentence case):

| Current | Suggested |
|---|---|
| Experience | Immersive |
| Light | Lighting check |
| Free orbit | Look around |
| Audience POV | Visitor view |
| "variant" | "option" |
| "ceiling modules" | "ceiling panels" |
| "firefly algorithm" | "firefly behavior" |

## Reduced motion

- No `prefers-reduced-motion` support. Disable or simplify animations for users who prefer reduced motion.
- Add a WebGL error boundary so the page doesn't show a blank screen on GPU failure.
