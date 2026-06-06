# motion base

This file is the cross-platform **motion floor** for the web theme. It is distilled from the motion guidance scattered across `hig-base.md`, `ios-base.md`, `ipados-base.md`, and `macos-base.md`, reconciled into one timing system. Where those files describe *how a component behaves*, this file describes *how anything that moves is allowed to move* — duration, easing, what reverses, what is cancellable, and what happens when the user asks for less motion.

The base layer here is non-negotiable. The brand layer — the motion *personality*, expressed through the `--brand-dur-*` and `--brand-ease-*` tokens — is applied on top later and maps onto the floor roles defined here (see **Brand-layer mapping**). Brand never lengthens a duration past the caps, never removes a reduced-motion path, and never makes motion load-bearing.

---

## Core principle

Motion is feedback, not decoration. Every animation either confirms an action, shows continuity between two states, or directs attention — and then gets out of the way. Apple's word across all four platforms is the same: **brief, precise, cancellable.**

Four rules follow from that, and they hold regardless of platform:

1. **Feedback within one second.** Every meaningful action produces visible response within the perceptible-delay window. Work that exceeds roughly one second shows a progress indicator instead of a silent wait.
2. **Motion is never the only signal.** Meaning carried by movement is also carried by text, state, or a static change. A user with Reduce Motion on must lose nothing but the movement.
3. **State changes reverse; they don't replay.** Use CSS `transition` for anything that can toggle back (hover, open/close, select) so the reverse is automatic. Reserve `animation` (keyframes) for looping or one-shot entrances.
4. **Reduce Motion is a first-class path, not a fallback.** Every animated rule ships its `prefers-reduced-motion: reduce` counterpart in the same file. A component is not done until both paths exist.

---

## How motion is specified

Every animated interaction is defined by four values:

1. **Duration** — a token from the scale below. Never a hand-picked millisecond value.
2. **Easing** — a token from the easing set. Enter, exit, and reposition each have a curve.
3. **Property** — what animates. Prefer `opacity` and `transform` (compositor-friendly); avoid animating `width`, `height`, `top`, `left`, or anything that triggers layout.
4. **Reduced-motion behaviour** — what this becomes when motion is suppressed.

If a value cannot be found here, the fallback is: `--duration-short` (180ms), `--ease-out`, animate `opacity` only, and cross-fade under Reduce Motion.

---

## Duration scale

A five-step scale absorbs every value the platform docs publish. Each step is a **role**, not a raw number — the number is allowed to shift with input precision (the density swap), but the role is fixed.

| Token | Touch default | Pointer default | Role |
| --- | --- | --- | --- |
| `--duration-instant` | 90ms | 90ms | Tap / press acknowledgement, haptic-substitute flash |
| `--duration-micro` | 120ms | 120ms | Focus ring, hover tint, checkbox, small colour shift |
| `--duration-short` | 200ms | 180ms | Background fill, scale, hover lift, link underline, popover open |
| `--duration-transient` | 260ms | 220ms | Dropdown, menu, sidebar slide, toast, desktop sheet entrance |
| `--duration-sheet` | 480ms | 280ms | Full sheet / drawer present and dismiss (travels furthest on touch) |

Why the swap: a sheet crosses most of a phone screen, so it needs ~480ms to read as physical; the same surface on a pointer-dense desktop travels less and wants to feel snappy at ~280ms. This mirrors the control-size density swap in `macos-base.md` — one definition, two densities.

```css
:root {
  --duration-instant:   90ms;
  --duration-micro:     120ms;
  --duration-short:     200ms;
  --duration-transient: 260ms;
  --duration-sheet:     480ms;
}

@media (hover: hover) and (pointer: fine) {
  :root {
    --duration-short:     180ms;
    --duration-transient: 220ms;
    --duration-sheet:     280ms;
  }
}
```

**Published ranges** (use the token; these are the bounds it lives within):

| Role | Range | Hard cap |
| --- | --- | --- |
| Micro-feedback | 80–120ms | — |
| Transient UI | 180–320ms | — |
| Sheet / drawer present | 280–600ms | — |
| Any custom animation | — | **2000ms absolute** |

Nothing animates longer than two seconds. A continuous loop (skeleton shimmer, indeterminate spinner) is exempt from the cap but must pause or stop under Reduce Motion.

---

## Easing

Enter, exit, and reposition each get a curve. Defaulting everything to one easing is the most common motion mistake.

| Token | Curve | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | **Enter.** Things appearing, expanding, settling in. The default. |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | **Exit.** Things leaving, collapsing, accelerating away. |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | **Reposition.** Things moving from one on-screen spot to another. |
| `--ease-spring` | `cubic-bezier(0.32, 0.72, 0, 1)` | **Settle.** Sheets, drawers, large translations — the iOS spring-like curve. |
| `linear` | `linear` | Continuous loops only (shimmer, spinner). Never for entrances. |

```css
:root {
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
}
```

Apple publishes no public spring values; `--ease-spring` is the documented web approximation of the iOS sheet feel. Brand may retune curves, but enter must decelerate, exit must accelerate, and reposition must do both.

---

## Motion roles — the lookup table

The single source for "what duration + easing does this interaction use." Build from this row; don't invent.

| Interaction | Duration | Easing | Property | Under Reduce Motion |
| --- | --- | --- | --- | --- |
| Tap / press feedback | `--duration-instant` | `--ease-out` | `opacity`, `background` | Keep (already minimal) |
| Focus ring appear | `--duration-micro` | `--ease-out` | `outline`, `box-shadow` | Keep |
| Hover tint / background | `--duration-micro` | `--ease-out` | `background-color` | Keep (colour only) |
| Hover lift (card) | `--duration-short` | `--ease-out` | `transform`, `box-shadow` | **Drop** transform + shadow |
| Link underline | `--duration-short` | `--ease-out` | `text-decoration` / pseudo | Keep or instant |
| Popover / tooltip open | `--duration-short` | `--ease-out` | `opacity`, `transform: scale` | Cross-fade, no scale |
| Dropdown / menu / sidebar | `--duration-transient` | `--ease-out` (in) / `--ease-in` (out) | `transform: translate` | Cross-fade 150ms |
| Toast / inline status | `--duration-transient` | `--ease-out` | `opacity`, `transform` | Cross-fade, no translate |
| Sheet / drawer present | `--duration-sheet` | `--ease-spring` | `transform: translate` | Cross-fade 150ms |
| Skeleton shimmer | 1500ms loop | `linear` | `background-position` | **Stop** (`animation: none`) |
| Scroll to top / anchor | n/a (`scroll-behavior: smooth`) | — | scroll | `scroll-behavior: auto` |
| Drag pickup | `--duration-instant` | `--ease-out` | `opacity` → 0.7 | Keep |
| Drop rejected (snap back) | `--duration-transient` | `--ease-in-out` | `transform` | Instant reposition |

---

## Reduce Motion — the substitution rules

`prefers-reduced-motion: reduce` is not "turn animation off." It is "replace movement with a fade." Movement that conveyed meaning must still resolve — instantly or via opacity — so nothing is lost.

The floor reset, in every theme:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Then, per pattern, the considered substitution:

- **Slides and zooms → cross-fade** at `opacity` 150ms. The element still appears; it just doesn't travel.
- **No transform-based movement** — drop `translate`, `scale`, and rotation on hover, cards, and sheets.
- **No z-axis depth** — no layering animations that imply front/back motion.
- **No animating into or out of blur** — `backdrop-filter` transitions are removed; switch to the opaque state immediately.
- **No parallax** — backgrounds and foregrounds move together (i.e. not at all).
- **No repetitive motion** — looping shimmer, bounce, pulse, and marquee stop. Skeletons go static; spinners may keep a single minimal indicator or become text.
- **Smooth scroll → auto** — programmatic and CSS smooth scrolling jump instead.

A continuous brand animation (a pulsing hotspot, a drifting marquee) must define its `prefers-reduced-motion` stop, and continuous motion should pause on hover regardless (`animation-play-state: paused`) as a respectful default.

---

## Hover-driven motion is gated

Any motion triggered by hover lives behind the pointer query, so touch devices never inherit a stuck or unreachable state. This is the same gate the other base files apply to hover styling.

```css
@media (hover: hover) and (pointer: fine) {
  .card {
    transition: transform var(--duration-short) var(--ease-out),
                box-shadow var(--duration-short) var(--ease-out);
  }
  .card:hover { transform: scale(1.01); box-shadow: 0 4px 12px rgb(0 0 0 / 0.08); }
}

@media (prefers-reduced-motion: reduce) {
  .card:hover { transform: none; box-shadow: none; }
}
```

Hover motion is never the only affordance — the same control is reachable and legible by focus and click.

---

## Timing thresholds (not durations — delays and gestures)

These are perception and gesture thresholds the platforms publish. They govern *when* motion or feedback starts, distinct from how long it runs.

| Threshold | Value | Source behaviour |
| --- | --- | --- |
| Perceptible delay → show progress | ~1000ms | Below this, no spinner; above, show a progress indicator |
| Tooltip / hover-reveal delay | ~500ms | Tooltip appears after a ~500ms hover dwell |
| Long-press / touch-and-hold | 500ms | Cancelled by `pointermove` > 10px |
| Touch slop (still a tap) | 10px | Movement under 10px during a press is a tap, not a drag |
| Drag image trigger | ~3px | Drag begins after ~3px of pointer movement |
| Spring-loading (hover during drag) | 500–800ms | Target activates after sustained hover with an active payload |
| Search / live-filter debounce | 150–250ms | Debounce input before re-querying |
| Haptic substitute (no Taptic on web) | 80–120ms | Visual micro-feedback flash, paired with `aria-live` |
| Full-screen chrome auto-hide | ~3000ms idle | Toolbar/chrome fades after idle in full-screen |

---

## Brand-layer mapping

The brand motion tokens (the `--brand-*` family) are not a parallel system — they are names for these floor roles, tuned to the brand's personality. The mapping keeps the floor authoritative while letting the brand (and the merchant, for the tunable ones) adjust feel.

| Brand token | Floor role it maps to |
| --- | --- |
| `--brand-dur-underline` | `--duration-short` (link / nav underline) |
| `--brand-dur-overlay` | `--duration-transient` (overlay / dropdown fade) |
| `--brand-dur-drawer` | `--duration-sheet` (slide-in panel present) |
| `--brand-ease-out` | `--ease-out` |
| `--brand-dur-hover` *(merchant-tunable)* | `--duration-short`, within the 180–320ms range |
| `--brand-ease-hover` *(merchant-tunable)* | `--ease-out` / `--ease-in-out` |

A brand token may pick a value inside its role's published range. It may not exceed the 2000ms cap, skip a reduced-motion path, or move motion outside the hover gate. Each brand colour variant shares this floor; only the personality (exact curve, exact ms within range) differs.

---

## Non-negotiable rules

These rules survive any brand override. Claude Code treats them as constraints, not suggestions.

1. Every animation ships its `@media (prefers-reduced-motion: reduce)` counterpart in the same file; a component is not done until both paths exist.
2. Under Reduce Motion, movement becomes an `opacity` cross-fade of ~150ms — meaning is preserved, only travel is removed.
3. No custom animation exceeds **2000ms**. Continuous loops are exempt from the cap but must stop or pause under Reduce Motion.
4. Durations come from the five-token scale; easings from the four-curve set. No hand-picked millisecond or raw `cubic-bezier` in component CSS.
5. Enter eases out, exit eases in, reposition eases in-out. Never default everything to one curve.
6. Reversible state changes use `transition`, not `animation`, so the reverse is automatic.
7. Animate `opacity` and `transform` only for movement; never animate layout-triggering properties (`width`, `height`, `top`, `left`).
8. Hover-triggered motion lives behind `@media (hover: hover) and (pointer: fine)`; touch never inherits it.
9. Motion is never the sole signal — every animated meaning is also carried by text, state, or a static change.
10. Work exceeding ~1000ms shows a progress indicator; nothing waits silently.
11. Continuous motion (shimmer, marquee, pulse) pauses on hover and stops under Reduce Motion.
12. Programmatic and CSS smooth scrolling fall back to `auto` under Reduce Motion.
13. Sheet and drawer timing follows the density swap — longer on touch, snappier on pointer — never a single fixed value.
14. No animating into or out of `backdrop-filter` blur; switch to the opaque state immediately when transparency is reduced.
15. Brand motion tokens map onto floor roles and stay within their published ranges; they never weaken rules 1–14.

---

## Sources

Synthesised from the motion guidance in the sibling base files and the Apple pages they cite:

- `docs/base-setup-docs/ios-base.md` — Motion section (duration ranges, `--ease-ios`, reduced-motion substitutions, haptic substitute, skeletons)
- `docs/base-setup-docs/macos-base.md` — Motion and animation section (duration tokens, transition-not-animation, hover transition baseline, sheet/popover keyframes)
- `docs/base-setup-docs/ipados-base.md` — pointer hover lift/highlight timing, sidebar slide, drag thresholds, spring-loading
- `docs/base-setup-docs/hig-base.md` — feedback-within-one-second, progress thresholds, scroll/parallax, reduced-motion non-negotiables
- https://developer.apple.com/design/human-interface-guidelines/motion
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://developer.apple.com/design/human-interface-guidelines/loading

---

**End of motion base.** Companion files: `hig-base.md`, `ios-base.md`, `ipados-base.md`, `macos-base.md`, `content-base.md`. Brand layer (the `--brand-*` motion tokens) applies on top.
