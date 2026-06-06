# iOS base — mobile interaction rules for Claude Code

Behavioural and accessibility base extracted from Apple's iOS developer documentation and iOS-specific HIG pages. This file is the floor for mobile responsive behaviour in a web theme. Brand visuals (colour, typography choices, motion personality) are applied on top later and must not override the rules in this file.

Non-negotiable rules at the bottom must be honoured by every component.

---

## Layout

### Safe area insets

A safe area is the region of a view not covered by toolbars, tab bars, status bars, Dynamic Island, sensor housings or the home indicator. Content must respect it.

Implementation.
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
```css
.app-edge {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

/* Combine baseline gutter with inset */
.bottom-bar {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
```

iPhone widths range 320pt (SE 4-inch) to 440pt (17 Pro Max). Dynamic Island corner radius is 44pt. Status bar height and home indicator region are system-defined; do not hard-code.

### Scroll edge effect

A variable blur transitions content beneath a floating toolbar. Use `position: sticky` with `backdrop-filter`. Provide an opaque fallback. Disable blur when `prefers-reduced-transparency: reduce` matches.

```css
.toolbar {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
}

@media (prefers-reduced-transparency: reduce) {
  .toolbar {
    background: white;
    backdrop-filter: none;
  }
}
```

### Large title behaviour on scroll

Title shrinks from large to inline on scroll, returns when scrolled to top. Implement with a sticky header that switches a class on scroll, driven by an IntersectionObserver on a top sentinel. Use `scroll-behavior: smooth` for the return.

Large title at default Dynamic Type: 31pt regular weight, 38pt leading; emphasised weight bold.

### Sticky section headers

Section headers in grouped lists pin to the top of their scroll container while their section remains visible.

```css
.section-header {
  position: sticky;
  top: 0;
}
```

Pair with `<section role="region" aria-labelledby="...">` so the heading remains the section's accessible name.

---

## Touch

### Minimum hit target

Default 44 by 44pt. Absolute minimum 28 by 28pt. Use 44 unless space is genuinely constrained.

```css
button, a.button, [role="button"] {
  min-width: 44px;
  min-height: 44px;
}
```

Use padding rather than fixed sizes so visible labels stay compact while hit area expands. Validate with WCAG 2.5.5.

Padding around controls: 12pt around bezelled elements, 24pt around unbezelled.

### Tap, press, long-press

| Gesture | Trigger | Common action |
| --- | --- | --- |
| Tap | Single touch down and up within slop | Activate, select |
| Double tap | Two taps within system interval | Zoom in or out |
| Touch and hold | Touch held past 500ms threshold | Reveal contextual controls or menu |
| Drag | Touch and move past slop (~10px) | Move element |
| Swipe | Quick directional drag | Reveal actions, dismiss, scroll |

Use Pointer Events. Long-press: 500ms timer started on `pointerdown`, cleared on `pointermove` exceeding 10px or `pointerup`. For double tap use `dblclick` and disable double-tap zoom with `touch-action: manipulation`.

Always pair gesture interactions with a button or menu alternative.

### Swipe to dismiss

Sheet dismisses on vertical swipe past threshold. Snap back if under threshold. If unsaved changes exist, confirm with an action sheet.

Always supply a visible close button alongside the gesture.

### Pull to refresh

Mobile Safari ships native pull-to-refresh on the document. Disable on custom scroll containers with `overscroll-behavior-y: contain`. Provide an explicit refresh button alongside the gesture. Announce updates with `aria-live="polite"`.

### Edge swipe to go back

Mobile Safari ships back-swipe for the browser history stack. Cannot be overridden. For SPAs that manage their own navigation, integrate with `history.pushState` and the `popstate` event. Always provide an explicit back button.

### Scroll momentum and rubber band

Native iOS scrolling provides momentum and elastic rubber-band automatically. `-webkit-overflow-scrolling: touch` is no longer required. Use `overscroll-behavior: contain | auto` to control rubber-band propagation to ancestor scrollers.

### Pinch zoom

Viewport pinch zoom controlled by viewport meta. Never set `maximum-scale=1` or `user-scalable=no` — both break accessibility zoom. Custom element pinch uses two `pointerdown` events with `pointerType === 'touch'` and computes scale from distance change.

### Gesture-to-web cross reference

| iOS gesture | Web mobile Safari equivalent |
| --- | --- |
| Tap | `click` or `pointerup` after `pointerdown` |
| Double tap | `dblclick` or two `pointerup` within 300ms |
| Touch and hold | `pointerdown` then 500ms timer |
| Drag | `pointerdown` + `pointermove`; HTML5 `dragstart` for inter-element |
| Swipe | Pointer-event delta with velocity check |
| Pinch / zoom | Two-finger pointer events |
| Three-finger swipe | No equivalent; provide buttons |
| Three-finger pinch | No equivalent; use Clipboard API + button |
| Shake | `DeviceMotion` with permission; unreliable; provide button |
| Edge swipe back | `popstate` from browser back gesture |

---

## Haptics

Mobile Safari does not expose the Taptic Engine. `navigator.vibrate` is not supported on iOS. Haptics are effectively unavailable.

Substitute: a visual micro-feedback animation of 80 to 120ms, paired with `aria-live="polite"` announcement, and an optional short sound.

---

## Motion

Brief, precise, cancellable. Custom animation max 2 seconds.

Apple does not publish global spring values. SwiftUI presets are `.smooth`, `.snappy`, `.bouncy`, `.interactiveSpring`.

Web approximation:

```css
:root {
  --ease-ios: cubic-bezier(0.32, 0.72, 0, 1);
  --duration-micro: 100ms;
  --duration-transient: 240ms;
  --duration-sheet: 480ms;
}

.modal {
  transition: transform var(--duration-sheet) var(--ease-ios);
}
```

Duration ranges:
- Micro-feedback: 80–120ms
- Transient UI: 220–320ms
- Sheet present: 400–600ms
- Custom cap: 2000ms

Reduced motion. When `prefers-reduced-motion: reduce` matches: replace slides and zooms with cross fades (`opacity` 150ms), tighten springs, avoid z-axis depth, avoid animating into/out of blurs, no repetitive motion.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 150ms !important;
    animation-duration: 150ms !important;
  }
  .slide-up { transform: none !important; }
}
```

---

## Navigation

### Tab bar

Fixed bottom navigation between top-level sections. Five or fewer tabs. Visible during navigation within a section.

```html
<nav role="tablist" aria-label="Primary" class="tab-bar">
  <a role="tab" aria-current="page" href="/">Home</a>
  <a role="tab" href="/shop">Shop</a>
  <a role="tab" href="/journal">Journal</a>
  <a role="tab" href="/account">Account</a>
</nav>
```

```css
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: env(safe-area-inset-bottom);
  backdrop-filter: saturate(180%) blur(20px);
}
```

### Navigation bar

Title under 15 characters. Three groupings: leading, centre, trailing.

```css
header {
  position: sticky;
  top: 0;
  padding-top: env(safe-area-inset-top);
}
```

Icon-only buttons require `aria-label`.

### Modal

One modal at a time. Parent view blocked and dimmed. Modal must be simple and short. Confirm dismissal if unsaved changes exist.

Use the `<dialog>` element with `.showModal()` — handles focus trapping and inert background. Always restore focus to the trigger on close.

```html
<dialog id="edit-modal" aria-labelledby="modal-title">
  <h2 id="modal-title">Edit item</h2>
  <button autofocus>Close</button>
</dialog>
```

### Sheet with detents

Two named detents: medium (~50%) and large (~100%). Grabber at top edge. Always provide a close button.

```css
.sheet {
  position: fixed;
  inset: auto 0 0 0;
  border-radius: 16px 16px 0 0;
  transition: transform var(--duration-sheet) var(--ease-ios);
}
.sheet[data-detent="closed"] { transform: translateY(100%); }
.sheet[data-detent="medium"] { transform: translateY(50vh); }
.sheet[data-detent="large"]  { transform: translateY(0); }
```

Use `inert` on the background to block interaction.

### Popover

On iPad regular width: floating, anchored with arrow. On iPhone compact: replaced by full-screen sheet.

```css
.popover { position: absolute; /* anchor positioning where supported */ }

@media (max-width: 599px) {
  .popover {
    position: fixed;
    inset: auto 0 0 0;
    border-radius: 16px 16px 0 0;
  }
}
```

Use the HTML `popover` attribute with `<button popovertarget>` where available.

### Action sheet

Two or more choices related to an action just initiated. Destructive choices at top. Cancel at bottom. Avoid scrolling.

```html
<dialog role="alertdialog" aria-labelledby="sheet-title" class="action-sheet">
  <h2 id="sheet-title">Are you sure?</h2>
  <button class="destructive">Delete</button>
  <button>Keep</button>
  <button autofocus>Cancel</button>
</dialog>
```

### Alert

Maximum three buttons. Avoid scrolling. Specific verbs ("Erase", "Delete") not "OK". Cancel as escape.

```html
<dialog role="alertdialog" aria-labelledby="alert-title">
  <h2 id="alert-title">Discard changes?</h2>
  <button autofocus>Cancel</button>
  <button class="destructive">Discard</button>
</dialog>
```

Escape key cancels.

---

## Inputs

### Keyboard avoidance

When the virtual keyboard appears, important UI must remain visible. Use the `VisualViewport` API to compute the visible area.

```js
window.visualViewport.addEventListener('resize', () => {
  const visibleHeight = window.visualViewport.height;
  document.documentElement.style.setProperty('--visible-h', `${visibleHeight}px`);
});
```

Set `scroll-padding-bottom` on the scroll container so focused fields remain visible. Avoid `autofocus` except after user action.

### Virtual keyboard types and return key

Use the right input type, inputmode, autocomplete, and enterkeyhint to surface the correct keyboard and return key label.

```html
<input type="email"   inputmode="email"    enterkeyhint="next" autocomplete="email">
<input type="tel"     inputmode="tel"      enterkeyhint="next" autocomplete="tel">
<input type="search"  inputmode="search"   enterkeyhint="search">
<input type="url"     inputmode="url"      enterkeyhint="go" autocomplete="url">
<input type="number"  inputmode="numeric"  enterkeyhint="done">
<input type="password" autocomplete="current-password" enterkeyhint="done">
```

`autocapitalize` values: `off`, `none`, `on`, `sentences`, `words`, `characters`.

### Search

Bottom placement on iPhone where possible. Live results refine as user types (debounce input event 150–250ms).

```html
<div role="search">
  <input type="search" inputmode="search" enterkeyhint="search"
         aria-label="Search products"
         aria-controls="search-results"
         aria-activedescendant="">
</div>
<div id="search-results" role="listbox" aria-live="polite"></div>
```

Suggestions: `role="listbox"` with `aria-activedescendant` tracking highlighted item.

---

## Lists

### Row heights

Row content scales with Dynamic Type. Minimum 44px per row.

```html
<ul role="list">
  <li>
    <a href="..." class="row" style="min-height: 44px;">
      <span class="leading-icon" aria-hidden="true"></span>
      <span class="row-label">Item name</span>
      <span class="chevron" aria-hidden="true"></span>
    </a>
  </li>
</ul>
```

Separators: `border-bottom` with left inset matching leading content (`padding-left: 16px` + icon width).

### Swipe actions

Track `pointermove` on row, `transform: translateX`. Snap to revealed-actions state past ~25% of row width. Expose each action as a hidden but focusable button. Surface same actions in a contextual menu opened by long-press or trailing more-options button.

### Reorder

`aria-grabbed` is deprecated. Use "Move up" / "Move down" actions on each row via a menu button for accessible keyboard support.

---

## Forms

Inline validation. Visible labels (placeholder is not a label). Helper text via `aria-describedby`. Errors via `aria-invalid="true"`.

```html
<form>
  <label for="email">Email</label>
  <input id="email" type="email" inputmode="email"
         autocomplete="email" enterkeyhint="next"
         aria-describedby="email-hint">
  <p id="email-hint">We will only use this for order updates.</p>

  <label for="pwd">Password</label>
  <input id="pwd" type="password"
         autocomplete="current-password" enterkeyhint="done">
</form>
```

Group related fields in `<fieldset>` with `<legend>`. Validate on `blur` for email and multi-step inputs. Validate on `input` for username and password rules.

Submit button placement: trailing end of top toolbar in modal flows, or full-width button beneath the form on standalone pages.

---

## Feedback

### Progress

Determinate when duration is known. Indeterminate spinner otherwise. Do not switch between bar and spinner.

```html
<progress max="100" value="60" aria-label="Upload progress"></progress>
<div role="progressbar" aria-label="Loading" class="spinner"></div>
```

Announce completion with `aria-live="polite"`.

### Skeleton screens

Placeholder blocks sized to expected content. Animated background gradient.

```css
.skeleton {
  background: linear-gradient(
    90deg,
    color-mix(in oklab, currentColor 8%, transparent) 0%,
    color-mix(in oklab, currentColor 16%, transparent) 50%,
    color-mix(in oklab, currentColor 8%, transparent) 100%
  );
  background-size: 200% 100%;
  animation: skeleton 1.5s ease-in-out infinite;
}

@keyframes skeleton {
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

### Optimistic UI

Render new state immediately. Roll back with toast on failure. Announce rollback with `aria-live="assertive"`.

---

## Accessibility

### Dynamic Type ramp (iOS body size)

Full ramp Apple publishes. Use `rem` units with `:root { font-size: 100%; }` so browser zoom respects user preference. On iOS Safari, `font: -apple-system-body` honours Dynamic Type when the page uses `font-size: 1rem`.

| Size | Body (pt) | Leading (pt) |
| --- | --- | --- |
| xSmall | 14 | 19 |
| Small | 15 | 20 |
| Medium | 16 | 21 |
| Large (default) | 17 | 22 |
| xLarge | 19 | 24 |
| xxLarge | 21 | 28 |
| xxxLarge | 23 | 29 |
| AX1 | 28 | 34 |
| AX2 | 33 | 40 |
| AX3 | 40 | 47 |
| AX4 | 47 | 53 |
| AX5 | 53 | 60 |

Never set `maximum-scale=1` or `user-scalable=no`. Both break iOS accessibility zoom.

### VoiceOver

Semantic HTML first. `aria-label` only when visible label is missing. `alt=""` for decorative images. `<h1>`–`<h6>` for hierarchy. `role="region"` with `aria-labelledby` for groups. `aria-live="polite"` or `"assertive"` for dynamic changes. `aria-rowindex`, `aria-colindex` for data tables.

### Reduce motion

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

Replace `transform` transitions with `opacity` fades of 150ms.

### Reduce transparency

```css
@media (prefers-reduced-transparency: reduce) {
  .glass-bar {
    background: white;
    backdrop-filter: none;
  }
}
```

### Button shapes

When user prefers more contrast, add visible border or solid fill to every interactive element.

```css
@media (prefers-contrast: more) {
  button, a.button {
    border: 2px solid currentColor;
  }
}
```

### Hit target

Minimum 44 by 44 CSS px on every interactive element.

---

## Performance

```html
<!-- Modern image formats with fallback -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="..." loading="lazy" decoding="async">
</picture>
```

```css
/* Long lists */
.long-list-section { content-visibility: auto; }

/* Reduced data */
@media (prefers-reduced-data: reduce) {
  .hero-video, .decorative-image { display: none; }
}
```

Passive scroll listeners:
```js
window.addEventListener('scroll', handler, { passive: true });
```

Batch DOM reads and writes via `requestAnimationFrame`. Throttle expensive scroll handlers.

---

## Safari-specific web behaviour

Checklist for every component built on this base.

| Topic | Detail |
| --- | --- |
| `viewport-fit=cover` | Required for `env(safe-area-inset-*)` to return non-zero values. |
| `env(safe-area-inset-*)` | Top, right, bottom, left safe-area insets. Use inside `max()` or `padding`. |
| Pull-to-refresh | Document scroller default. Disable per container with `overscroll-behavior-y: contain`. |
| `-webkit-touch-callout` | Set to `none` to suppress system long-press callout on links and images. |
| `-webkit-tap-highlight-color` | Set to `transparent` or brand colour. Pair with visible `:active` state. |
| Momentum scrolling | On by default. `-webkit-overflow-scrolling: touch` no longer required. |
| `scroll-snap` | `scroll-snap-type: x mandatory` + `scroll-snap-align: start` for paged carousels. |
| `position: sticky` | Parent must be scroll container or ancestor with overflow visible. Transforms on ancestors break sticky. |
| `backdrop-filter` | Available in iOS Safari. Provide opaque fallback for reduced transparency. |
| `dvh` units | Use `100dvh` over `100vh` so layout accounts for dynamic browser chrome. |
| `<dialog>` | Provides focus trapping and `::backdrop`. Use for modals, alerts, action sheets. |
| `popover` attribute | Use for transient popovers. Switch to sheet under ~600px width. |
| `inputmode`, `enterkeyhint`, `autocomplete`, `autocapitalize`, `autocorrect` | Drive correct virtual keyboard and return key label. |
| `VisualViewport` | `window.visualViewport.height` and `offsetTop` for keyboard avoidance. |
| `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`, `prefers-color-scheme`, `prefers-reduced-data` | Honour each to mirror iOS accessibility settings. |
| Haptics | Not available. Use visual micro-feedback. |
| `apple-mobile-web-app-status-bar-style` | Standalone PWAs only. Values: `default`, `black`, `black-translucent`. |

---

## Non-negotiable rules

These rules survive any brand override. Claude Code must not weaken them.

1. Every interactive element: `min-width: 44px; min-height: 44px`.
2. Every focusable element: visible `:focus-visible` outline. Never `outline: none` without a replacement.
3. Viewport meta must include `viewport-fit=cover` and must not include `maximum-scale=1` or `user-scalable=no`.
4. Every `@media (prefers-reduced-motion: reduce)` block must short-circuit non-essential animation.
5. Every `@media (prefers-reduced-transparency: reduce)` block must replace `backdrop-filter` with opaque fill.
6. Every `@media (prefers-contrast: more)` block must add visible borders to interactive elements.
7. Every form input has a visible `<label>` (placeholder is not a label).
8. Every icon-only button has `aria-label`.
9. Every dialog uses `<dialog>` with `.showModal()` for focus trapping.
10. Every dynamic content region announces changes via `aria-live`.
11. Every modern image uses `<picture>` with AVIF, WebP, and JPEG fallback.
12. Body type uses `rem` units to respect iOS Dynamic Type and browser zoom.
13. Touch slop: any `pointermove` under 10px during a press is still a tap.
14. Long-press timer: 500ms, cancelled by `pointermove` > 10px or `pointerup`.
15. Maximum custom animation duration: 2000ms.

---

## Sources

- https://developer.apple.com/ios/
- https://developer.apple.com/design/human-interface-guidelines/designing-for-ios
- https://developer.apple.com/design/human-interface-guidelines/layout
- https://developer.apple.com/design/human-interface-guidelines/gestures
- https://developer.apple.com/design/human-interface-guidelines/sheets
- https://developer.apple.com/design/human-interface-guidelines/toolbars
- https://developer.apple.com/design/human-interface-guidelines/tab-bars
- https://developer.apple.com/design/human-interface-guidelines/alerts
- https://developer.apple.com/design/human-interface-guidelines/action-sheets
- https://developer.apple.com/design/human-interface-guidelines/popovers
- https://developer.apple.com/design/human-interface-guidelines/searching
- https://developer.apple.com/design/human-interface-guidelines/search-fields
- https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- https://developer.apple.com/design/human-interface-guidelines/text-fields
- https://developer.apple.com/design/human-interface-guidelines/virtual-keyboards
- https://developer.apple.com/design/human-interface-guidelines/playing-haptics
- https://developer.apple.com/design/human-interface-guidelines/motion
- https://developer.apple.com/design/human-interface-guidelines/accessibility
- https://developer.apple.com/design/human-interface-guidelines/typography
- https://developer.apple.com/design/human-interface-guidelines/voiceover
- https://developer.apple.com/design/human-interface-guidelines/scroll-views
- https://developer.apple.com/design/human-interface-guidelines/modality
- https://developer.apple.com/design/human-interface-guidelines/progress-indicators
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://developer.apple.com/design/human-interface-guidelines/buttons
- https://developer.apple.com/design/human-interface-guidelines/materials
- https://developer.apple.com/design/human-interface-guidelines/entering-data
