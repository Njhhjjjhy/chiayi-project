# iPadOS base — tablet and intermediate viewport rules for Claude Code

Behavioural and accessibility base extracted from Apple's iPadOS developer documentation and iPadOS-specific HIG pages. This file is the floor for tablet responsive behaviour in a web theme. Brand visuals are applied on top later and must not override the rules in this file.

iPadOS is the bridge between mobile and desktop. The dominant rule of this file: fluid resize. Layouts must look correct at every width, not just at named breakpoints.

Non-negotiable rules at the bottom must be honoured by every component.

---

## Core principle: fluid resize

iPad windows are freely resizable down to a minimum and up to a maximum. Design for the full-screen view first and defer switching to a compact view for as long as possible. System window snap configurations: halves, thirds, quadrants.

Implementation principle: avoid fixed breakpoint jumps. Use container queries on the layout root, not viewport media queries. Use `clamp()` for type and spacing. Use `minmax()` with `auto-fit` or `auto-fill` inside CSS grid.

```css
:root {
  font-size: clamp(15px, 0.6vw + 13px, 18px);
}

.app-root {
  container-type: inline-size;
  container-name: app;
}

@container app (min-width: 768px)  { /* narrow */ }
@container app (min-width: 1024px) { /* mid */ }
@container app (min-width: 1280px) { /* wide */ }

.col {
  width: clamp(220px, 22vw, 320px);
}
```

---

## Size classes

iPadOS maps to four size class combinations. Translate each to a media query and prefer container queries for components that appear in multiple slots.

| Token | iPadOS meaning | Web equivalent |
| --- | --- | --- |
| compact-width | Narrow window, slide over, minimum windowed width | `@media (max-width: 767.98px)` |
| regular-width | Full multi-column layout permitted | `@media (min-width: 768px)` |
| compact-height | Very short window | `@media (max-height: 599.98px)` |
| regular-height | Standard vertical space | `@media (min-height: 600px)` |

```css
@container layout (inline-size < 48rem)  { /* compact */ }
@container layout (inline-size >= 48rem) { /* regular */ }
```

iPad point widths range from 744pt (iPad mini portrait) to 1366pt (iPad Pro 12.9 landscape).

---

## Adaptive layout

A single interface restructures across size classes. Order of collapse when narrowing:

1. Inspector or tertiary column collapses first.
2. Supplementary column collapses second.
3. Sidebar collapses last (to a toggle).
4. At very narrow widths, push navigation replaces multi-column entirely.

```css
.app {
  display: grid;
  grid-template-areas: "side supp detail inspect";
  grid-template-columns: 260px 280px 1fr 320px;
}

@container app (max-width: 1280px) {
  .app {
    grid-template-areas: "side supp detail";
    grid-template-columns: 260px 280px 1fr;
  }
  .inspector { display: none; }
}

@container app (max-width: 1024px) {
  .app {
    grid-template-areas: "side detail";
    grid-template-columns: 260px 1fr;
  }
  .supplementary { display: none; }
}

@container app (max-width: 768px) {
  .app {
    grid-template-areas: "detail";
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 250ms ease;
  }
  .sidebar[data-open="true"] { transform: translateX(0); }
}
```

Each collapse must keep tab order matching reading order. Every collapsed column needs a labelled toggle.

---

## Multi-column layouts and split view

Two-pane (primary, secondary) or three-pane (primary, supplementary, secondary). Selection in one pane drives the next.

| Pane | Role | Min width | Collapse order |
| --- | --- | --- | --- |
| Primary | Top-level list or sidebar | 220px | Third |
| Supplementary | Mid-level list | 260px | Second |
| Secondary | Detail | 1fr | Never |
| Inspector | Optional metadata | 300–360px | First |

ARIA: each pane is `role="region"` with `aria-labelledby`. Selection state is `aria-current="true"` on the selected row. Provide keyboard navigation between panes via roving tabindex or arrow keys.

```css
.split {
  display: grid;
  grid-template-areas: "primary supp secondary";
  grid-template-columns: minmax(220px, 1fr) minmax(260px, 1fr) 2fr;
}

@container split (max-width: 900px) {
  .split {
    grid-template-areas: "primary secondary";
    grid-template-columns: minmax(220px, 1fr) 2fr;
  }
  .supplementary { display: none; }
}
```

---

## Sidebar

Leading edge. Floats above content (Liquid Glass layer). Maximum two levels of hierarchy. Width fluid between 220px and 320px, ideal `clamp(220px, 22vw, 320px)`. Use SF Symbols equivalent (Lucide or Phosphor on web).

State matrix:

| State | Visual |
| --- | --- |
| Default | Row with icon and label |
| Hover (pointer) | Rounded background fill, gentle parallax |
| Focused (keyboard) | System focus ring |
| Selected | Persistent tinted background, contrasting text |
| Selected + focused | Tinted background combined with focus ring |
| Collapsed | Hidden, opened by toggle or edge swipe |
| Disclosed group | Expanded group with chevron |

```css
.sidebar {
  container-type: inline-size;
  position: sticky;
  top: 0;
  inline-size: clamp(220px, 22vw, 320px);
  block-size: 100dvh;
  overflow: auto;
}

.sidebar a[aria-current="page"] {
  background: color-mix(in oklab, currentColor 12%, transparent);
}

@media (hover: hover) and (pointer: fine) {
  .sidebar a:hover {
    background: color-mix(in oklab, currentColor 8%, transparent);
  }
}

@container app (max-width: 768px) {
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 250ms ease;
  }
  .sidebar[data-open="true"] { transform: translateX(0); }
}
```

Sidebar is `<nav aria-label="Sections">` when navigation, `<aside aria-label="Sidebar">` when content. Group headers are heading elements. Tab order top to bottom.

---

## Pointer on iPad

iPadOS integrates the appearance of the pointer with the element under it. Pointer is a circle by default. It transforms or morphs over targets. The system applies magnetism: elements appear to attract the pointer inside their hit region.

Hover effects, gated by media query:

```css
@media (hover: hover) and (pointer: fine) {
  /* Highlight effect: bar buttons, tab bar items, segmented controls */
  .control:hover {
    background: color-mix(in oklab, currentColor 10%, transparent);
    transition: background 150ms ease;
  }

  /* Lift effect: app icons, large action buttons */
  .lift:hover {
    transform: scale(1.04);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
    transition: transform 150ms ease, box-shadow 150ms ease;
  }
}
```

Hit region expansion (without changing visual size):

```css
/* Bezelled element: 12pt expansion */
.button { position: relative; }
.button::before {
  content: "";
  position: absolute;
  inset: -12px;
}

/* Non-bezelled element: 24pt expansion */
.text-button::before { inset: -24px; }
```

Drag image trigger: 3pt of movement before drag begins.

Magnetism has no native CSS equivalent. Approximate with Pointer Events: when pointer is within a small radius of a target, programmatically expand the target's hit rectangle.

Pointer shapes:

| Context | iPadOS pointer | CSS cursor |
| --- | --- | --- |
| Default | Circle | `default` |
| Text | I-beam | `text` |
| Resizable edge | Directional arrows | `ew-resize` / `ns-resize` |
| Not allowed | Circle-slash | `not-allowed` |
| Draggable | Open hand | `grab` |
| Dragging | Closed hand | `grabbing` |

---

## Keyboard support

Full Keyboard Access. Tab and Shift-Tab walk all controls. Escape cancels. Return submits or moves to next field.

Modifier order in shortcut listings: Control, Option, Shift, Command. Use Command as the primary modifier, not Control.

Reserved system shortcuts (must remain functional):

| Action | Shortcut | Notes |
| --- | --- | --- |
| Select all | Cmd-A | Native browser default |
| Copy / Cut / Paste | Cmd-C / X / V | Native |
| Undo / Redo | Cmd-Z / Shift-Cmd-Z | Native in form fields |
| Save | Cmd-S | `preventDefault` and handle custom |
| Find | Cmd-F | `preventDefault` for in-app search |
| New / Open / Close | Cmd-N / O / W | Custom handlers |
| Settings | Cmd-Comma | Open app settings dialog |
| Help | Cmd-? | Open help |
| Cancel | Esc or Cmd-Period | Close dialogs |

Detect platform with `event.metaKey` on Mac and `event.ctrlKey` on Windows/Linux.

```css
:focus-visible {
  outline: 2px solid Highlight;
  outline-offset: 2px;
  border-radius: 6px;
}
```

Tab order: document source order. Use `tabindex="0"` only on custom controls. Never use positive `tabindex` values.

Form return key per field:

```html
<input enterkeyhint="next">   <!-- intermediate field -->
<input enterkeyhint="done">   <!-- final field -->
<input enterkeyhint="send">   <!-- submission -->
<input enterkeyhint="search"> <!-- search field -->
```

---

## Drag and drop

Drag is a move within the same container, copy across containers. Show translucent drag image after 3pt of pointer movement. Provide clear feedback for valid and invalid drops. Support multi-item drag. Provide undo.

Prefer Pointer Events for in-page drag (supports multi-touch and pencil). Use HTML5 Drag and Drop API for files from outside the browser.

State matrix:

| State | Visual feedback |
| --- | --- |
| Source ready | Default cursor |
| Drag started | Translucent clone under pointer (opacity 0.7) |
| Multi-item gather | Items flock together with count badge |
| Over valid target | Highlight or insertion line on target |
| Over invalid target | `cursor: not-allowed` or circle-slash |
| Drop accepted | Target accepts, focus restored to dropped element |
| Drop rejected | Snaps back to source with transform animation |
| Spring loaded | After 500–800ms hover, target activates (folder opens) |

```js
el.addEventListener("pointerdown", onDragStart);
el.addEventListener("pointermove", onDragMove);
el.addEventListener("pointerup", onDragEnd);
el.setPointerCapture(e.pointerId);
```

Keyboard equivalent (always provide):

```
Space: pick up
Arrows: move
Space: drop
Esc: cancel
```

Announce state via `aria-live`. Provide non-drag alternatives such as a "Move to..." menu.

---

## Multitasking and Stage Manager

Apps must work in full screen and freely resized windows. System remembers window size and placement. App receives no signal of the mode.

Treat the browser viewport as a freely resizable iPad window. Any width from 320px upward is legitimate. There is no Stage Manager equivalent on the web — fluid responsive design handles this naturally.

iPadOS 26 introduces:
- Resize handle in bottom-right corner
- Window controls in top-left
- Menu bar revealed by swipe down from top edge or pointer at top edge

Web has no system menu bar. Equivalent: a top app bar (`position: sticky`) with a command palette opened by Cmd-K.

---

## Modals on iPad

| Modal type | iPadOS sizing | Dismiss |
| --- | --- | --- |
| Page sheet | Large centred card, dimmed background | Cancel button, swipe down, tap outside if nonmodal |
| Form sheet | Medium centred card | Cancel button, swipe down |
| Popover | Sized to content, arrow to source, regular width only | Tap outside, item selected |
| Fullscreen | Edge to edge | Done or Close button |
| Alert | Centred, blocking | Action buttons |

Detents on resizable sheets: medium (~50%) and large (~100%). Grabber at top edge.

```html
<dialog id="edit" aria-labelledby="edit-title">
  <h2 id="edit-title">Edit item</h2>
  <button autofocus>Close</button>
</dialog>
```

```css
dialog {
  border: none;
  border-radius: 16px;
  padding: 0;
  max-inline-size: min(720px, 92vw);
  max-block-size: 86dvh;
}

/* Form sheet (medium) */
dialog.form-sheet {
  max-inline-size: min(560px, 92vw);
  max-block-size: 70dvh;
}

/* Compact width: bottom sheet */
@media (max-width: 767.98px) {
  dialog {
    inline-size: 100vw;
    max-inline-size: 100vw;
    block-size: 100dvh;
    max-block-size: 100dvh;
    border-radius: 0;
  }
}

/* Popover at tablet+, bottom sheet on phone */
@media (min-width: 768px) {
  .menu { position: absolute; }
}
@media (max-width: 767.98px) {
  .menu {
    position: fixed;
    inset: auto 0 0 0;
    border-radius: 16px 16px 0 0;
  }
}
```

Esc closes a sheet, panel, alert. Provide explicit close button.

---

## Apple Pencil hover

M2 Apple Pencil and Apple Pencil Pro preview the result of a touch as the pencil approaches. Use hover to predict what a touch will do, never to perform an action. Avoid destructive triggers on hover.

```css
@media (hover: hover) and (pointer: fine) {
  .swatch:hover .preview { opacity: 1; }
}
```

Detect stylus hover in JS:

```js
el.addEventListener("pointerrawupdate", (e) => {
  if (e.pointerType === "pen" && e.buttons === 0) {
    // Pencil hovering, not touching
  }
});
```

---

## Media display

iPad scale factor is 2x. Serve @2x retina assets via `srcset`. iPad does not use @3x.

Fluid image grids:

```css
.gallery {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

img {
  max-inline-size: 100%;
  height: auto;
}
```

```html
<picture>
  <source type="image/avif" srcset="hero-768.avif 1x, hero-1536.avif 2x">
  <source type="image/webp" srcset="hero-768.webp 1x, hero-1536.webp 2x">
  <img src="hero-768.jpg" srcset="hero-768.jpg 1x, hero-1536.jpg 2x"
       width="768" height="432" alt="" loading="lazy" decoding="async">
</picture>
```

Pinch zoom:
```css
.zoomable { touch-action: pinch-zoom; }
```

Swipe between images: horizontal `scroll-snap`:
```css
.gallery-strip {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.gallery-strip > img {
  scroll-snap-align: center;
}
```

---

## Forms on iPad

Hardware keyboard support. Tab and Shift-Tab walk fields. Return submits or moves to next field per `enterkeyhint`.

Apple values:

| Token | Value | Web equivalent |
| --- | --- | --- |
| Default text size | 17pt | `max(17px, 1rem)` |
| Minimum text size | 11pt | 11px minimum on dense data |
| Default control size | 44 by 44pt | `min-block-size: 44px; min-inline-size: 44px` |
| Minimum control size | 28 by 28pt | 28px floor in dense toolbars only |
| Bezelled control padding | 12pt | `padding: 12px` |
| Non-bezelled control padding | 24pt | `padding: 24px` |

```css
input, button, select, textarea {
  min-block-size: 44px;
  padding: 10px 12px;
  font-size: max(17px, 1rem);
}

input:invalid:not(:placeholder-shown) {
  outline: 2px solid #c0392b;
}
```

Scribble: Apple Pencil writes into any text field except password. Use standard `<input>`. Do not resize or autoscroll the field while the user is writing.

Hide placeholder text on focus or first input.

Autofill values: `email`, `tel`, `name`, `given-name`, `family-name`, `street-address`, `postal-code`, `country`, `cc-number`, `cc-exp`, `cc-csc`, `one-time-code`, `current-password`, `new-password`.

---

## Accessibility

Support every assistive technology iPadOS provides. Do not rely on a single sense or input mode.

| Assistive tech | Behaviour to support |
| --- | --- |
| VoiceOver | Every interactive element exposes role, name, value, state |
| Switch Control | All actions reachable via sequential focus |
| AssistiveTouch | Every gesture has a button alternative |
| Full Keyboard Access | Every control reachable by Tab, visible focus ring, no focus traps |
| Voice Control | Visible, descriptive labels on every control |
| Dynamic Type | Layouts reflow when text scales up to 200% |
| Reduce Motion | Replace movement with fades, disable parallax |
| Increase Contrast | Higher-contrast scheme meets WCAG AA |
| Pointer accommodations | Hit regions large enough, never rely on hover alone |
| Assistive Access | Optional simplified mode with double confirmation on destructive actions |

Contrast minimums:
- Text up to 17pt: 4.5:1
- Text 18pt or bold: 3:1
- Dynamic Type enlargement target: at least 200%

```css
:root { color-scheme: light dark; }

html { font-size: clamp(16px, 0.6vw + 14px, 19px); }
body { font-size: 1rem; line-height: 1.5; }

button, [role="button"], a, input, select, textarea {
  min-block-size: 44px;
  min-inline-size: 44px;
}

:focus-visible {
  outline: 2px solid Highlight;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

@media (prefers-contrast: more) {
  :root {
    --text: #000;
    --bg: #fff;
    --link: #00428a;
  }
}
```

ARIA pattern: every region named (`aria-labelledby`), every live update announced (`aria-live="polite"`), every modal trapped via `<dialog>` semantics. Provide `lang` on root. Use `inert` to exclude non-active regions.

---

## Performance

iPad displays are retina at 2x. Provide assets at 1x and 2x; @3x is iPhone-only.

```html
<picture>
  <source type="image/avif" srcset="hero-768.avif 1x, hero-1536.avif 2x">
  <source type="image/webp" srcset="hero-768.webp 1x, hero-1536.webp 2x">
  <img src="hero-768.jpg" srcset="hero-768.jpg 1x, hero-1536.jpg 2x"
       width="768" height="432" alt="" loading="lazy" decoding="async">
</picture>
```

```css
@media (prefers-reduced-data: reduce) {
  .hero { background-image: none; }
  video[autoplay] { display: none; }
}

.long-list-section {
  content-visibility: auto;
}
```

Use `fetchpriority="high"` on the hero image. Lazy-load below the fold. Inline critical CSS.

---

## Non-negotiable rules

These rules survive any brand override. Claude Code must not weaken them.

1. Every interactive element: `min-block-size: 44px; min-inline-size: 44px`.
2. Every focusable element: visible `:focus-visible` outline. Never `outline: none` without a replacement.
3. No fixed breakpoint jumps. Use container queries on the layout root and fluid `clamp()` typography.
4. Sidebar collapses to off-canvas below 768px container width; never to a floating obstruction.
5. Hover effects gated by `@media (hover: hover) and (pointer: fine)`. Never sticky on touch.
6. Hit-region expansion via `::before` pseudo-elements without changing visible size.
7. Every dialog uses `<dialog>` with `.showModal()` for focus trapping.
8. Every dynamic content region announces changes via `aria-live`.
9. Form inputs minimum 44px block-size with 17px or larger font-size to prevent iOS Safari zoom on focus.
10. `:focus-visible` outline 2px with 2px offset minimum.
11. Tab order matches document source order. Never positive `tabindex`.
12. Every interactive gesture has a button or menu alternative (drag, swipe, long-press).
13. Reserved system shortcuts (Cmd-A, C, V, X, Z, S, F, comma, period, escape) remain functional.
14. Layouts reflow up to 200% text scale without horizontal scroll.
15. Pencil hover never triggers destructive actions.

---

## Sources

- https://developer.apple.com/ipados/
- https://developer.apple.com/ipados/whats-new/
- https://developer.apple.com/design/human-interface-guidelines/layout
- https://developer.apple.com/design/human-interface-guidelines/multitasking
- https://developer.apple.com/design/human-interface-guidelines/windows
- https://developer.apple.com/design/human-interface-guidelines/split-views
- https://developer.apple.com/design/human-interface-guidelines/sidebars
- https://developer.apple.com/design/human-interface-guidelines/pointing-devices
- https://developer.apple.com/design/human-interface-guidelines/keyboards
- https://developer.apple.com/design/human-interface-guidelines/drag-and-drop
- https://developer.apple.com/design/human-interface-guidelines/popovers
- https://developer.apple.com/design/human-interface-guidelines/sheets
- https://developer.apple.com/design/human-interface-guidelines/modality
- https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble
- https://developer.apple.com/design/human-interface-guidelines/accessibility
