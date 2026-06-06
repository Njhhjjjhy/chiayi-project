# hig base

This file is the cross-platform behavioural floor for the theme. It is distilled from Apple's Human Interface Guidelines and translated into web equivalents so Claude Code can use it directly. It sits alongside `ios-base.md`, `ipados-base.md`, and `macos-base.md`. Where the platform files describe how the device behaves (touch on iOS, hover on macOS, fluid resize on iPadOS), this file describes how components and patterns behave regardless of platform.

The base layer here is non-negotiable. The brand layer (colour, type, spacing, imagery) will be layered on top later. Brand never overrides accessibility, hit targets, focus visibility, or state coverage.

---

## Core principle

Components have states, not just appearances. Every interactive element must define default, hover, focus, active, disabled, and where relevant loading and error. Every interruption (alert, sheet, popover) must trap focus while open and return focus on close. Every meaningful action must produce visible feedback within one second.

---

## How components are specified

Each component below lists:

1. **Principle** — what the component is for.
2. **Measurable value** — the numbers Apple publishes (hit target, count limits). Anything Apple leaves to platform is marked unspecified.
3. **States** — a table of behavioural states the component must implement.
4. **Accessibility** — required ARIA, keyboard, and screen-reader behaviour.
5. **Web equivalent** — the HTML, ARIA, and CSS pattern to build it.

If Claude Code cannot find a value in this file, the fallback is: 44 px minimum hit target, `:focus-visible` ring, sentence case label, and one row per state in the matrix above.

---

## Components

### Buttons

**Principle.** A button performs an action when activated. Label describes the action in sentence case.

**Measurable value.** Hit area minimum 44 by 44 px. Apple does not publish a fixed visual size.

**States.**

| State | Behaviour |
| --- | --- |
| Default | Visible, enabled, label readable |
| Hover | Pointer-platform highlight (colour or border shift) |
| Focus | Visible focus ring on `:focus-visible` |
| Active | Pressed appearance |
| Disabled | Reduced opacity, non-interactive, `aria-disabled="true"` |
| Loading | Spinner replaces label, button keeps width, `aria-busy="true"` |
| Destructive | Distinct treatment from primary, requires confirmation for irreversible actions |

**Accessibility.** Every button has an accessible name from its text content, `aria-label`, or `aria-labelledby`. Disabled buttons remain in tab order with `aria-disabled` rather than `disabled` so screen readers announce them.

**Web equivalent.**

```html
<button type="button" class="btn btn-primary">Add to bag</button>
<button type="button" class="btn btn-primary" aria-busy="true" disabled>
  <span class="spinner" aria-hidden="true"></span>
  <span class="sr-only">Adding to bag</span>
</button>
```

```css
.btn { min-height: 44px; min-width: 44px; padding: 12px 24px; }
.btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.btn[aria-disabled="true"], .btn:disabled { opacity: 0.4; cursor: not-allowed; }
```

Source. https://developer.apple.com/design/human-interface-guidelines/buttons

---

### Text fields

**Principle.** A text field accepts free-form text input. Always paired with a visible label.

**Measurable value.** Hit area minimum 44 by 44 px. Font size minimum 17 px on iOS to prevent zoom-on-focus.

**States.**

| State | Behaviour |
| --- | --- |
| Default | Empty, label visible above |
| Focus | Visible focus ring, caret blinking |
| Filled | Value present, label still visible |
| Error | Border or underline in error colour, message below, `aria-invalid="true"` |
| Disabled | Reduced opacity, non-interactive |
| Read-only | Selectable but not editable, distinct from disabled |

**Accessibility.** Every input has a `<label for>` association. Placeholder is never a substitute for a label. Errors are announced through `aria-describedby` pointing at the error message and `aria-invalid="true"` on the field.

**Web equivalent.**

```html
<div class="field">
  <label for="email">Email address</label>
  <input
    id="email"
    type="email"
    name="email"
    inputmode="email"
    autocomplete="email"
    aria-describedby="email-error"
    aria-invalid="false"
  />
  <p id="email-error" class="field-error" hidden>Enter a valid email address.</p>
</div>
```

```css
input { font-size: max(17px, 1rem); min-height: 44px; }
input:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
```

Source. https://developer.apple.com/design/human-interface-guidelines/text-fields

---

### Toggles

**Principle.** A toggle switches a single setting between two states. Use only when the change applies immediately.

**Measurable value.** Hit area 44 by 44 px wrapping the visible switch.

**States.**

| State | Behaviour |
| --- | --- |
| Off | Default, neutral colour |
| On | Tinted, indicator at opposite end |
| Focus | Visible focus ring |
| Disabled | Reduced opacity, non-interactive |

**Accessibility.** Use `role="switch"` with `aria-checked="true|false"`. Label associated via `<label for>` or `aria-labelledby`.

**Web equivalent.**

```html
<label class="toggle">
  <input type="checkbox" role="switch" />
  <span>Email me when this piece returns</span>
</label>
```

Source. https://developer.apple.com/design/human-interface-guidelines/toggles

---

### Sliders, steppers, segmented controls

**Principle.** Sliders pick a value from a continuous range. Steppers increment or decrement a value. Segmented controls pick one of a small number of mutually exclusive options.

**Measurable value.** Hit area 44 by 44 px per thumb, stepper button, or segment.

**Accessibility.** Slider uses `role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. Stepper buttons are paired with the displayed value, kept in sync via `aria-live`. Segmented control uses `role="radiogroup"` with `role="radio"` children, or `role="tablist"` when each segment changes a visible content panel.

**Web equivalent.**

```html
<!-- slider -->
<input type="range" min="0" max="100" value="50" aria-label="Price range" />

<!-- stepper -->
<div class="stepper">
  <button type="button" aria-label="Decrease quantity">&minus;</button>
  <span aria-live="polite">1</span>
  <button type="button" aria-label="Increase quantity">+</button>
</div>

<!-- segmented control -->
<div role="radiogroup" aria-label="Locale">
  <button role="radio" aria-checked="true">繁體中文</button>
  <button role="radio" aria-checked="false">English</button>
</div>
```

Sources. https://developer.apple.com/design/human-interface-guidelines/sliders, /steppers, /segmented-controls

---

### Pickers

**Principle.** Pickers present a fixed set of options for selection. Native equivalents include drop-downs, date pickers, and wheel pickers.

**Measurable value.** Hit area 44 by 44 px per row.

**States.**

| State | Behaviour |
| --- | --- |
| Closed | Single value shown |
| Open | Option list visible |
| Focus on option | Visible focus on active option |
| Disabled option | Non-interactive |
| Empty | Empty-state message when no options |

**Accessibility.** Use `<select>` for short lists. For richer pickers, `role="listbox"` with `role="option"`, or `role="combobox"` with `aria-expanded` for typed input. Use `:focus-visible` on the active option, and arrow-key navigation managed via `aria-activedescendant`.

**Web equivalent.**

```html
<label for="size">Size</label>
<select id="size" name="size">
  <option>5</option>
  <option>5.5</option>
  <option>6</option>
</select>
```

Source. https://developer.apple.com/design/human-interface-guidelines/pickers

---

### Toolbars

**Principle.** A toolbar provides quick access to frequently used commands relevant to the current view; it sits above or below content and remains visible.

**Measurable value.** Minimum hit area 44 by 44 px per control. Apple does not publish a fixed toolbar height across platforms.

**States.**

| State | Behaviour |
| --- | --- |
| Default | Controls visible and enabled |
| Disabled control | Reduced opacity, non-interactive |
| Selected control | Tinted to indicate active mode |
| Focus | Visible focus ring on focused control |
| Compact | Less important controls move to an overflow menu |

**Accessibility.** Every toolbar control needs an accessible label. Group related controls with an accessible group role. Honour Dynamic Type so labels do not truncate.

**Web equivalent.**

```html
<div role="toolbar" aria-label="Product gallery controls">
  <button type="button" aria-label="Previous image">&larr;</button>
  <button type="button" aria-label="Next image">&rarr;</button>
  <button type="button" aria-haspopup="menu" aria-label="More">&hellip;</button>
</div>
```

Source. https://developer.apple.com/design/human-interface-guidelines/toolbars

---

### Action sheets

**Principle.** An action sheet presents a short list of choices related to a single task, typically anchored to the control that triggered it.

**Measurable value.** Hit area 44 by 44 px per row. Apple does not publish a max item count; keep the list short and scannable.

**States.**

| State | Behaviour |
| --- | --- |
| Default | List shown above (popover) or from edge (sheet) |
| Focus | Visible focus on the active row |
| Active row | Highlighted while pressed |
| Disabled row | Non-interactive |
| Destructive row | Distinct treatment (e.g. red text) |
| Cancel row | Always present unless dismissal is otherwise obvious |

**Accessibility.** Announce as a menu or dialog. Provide a clearly labelled cancel option. Focus must move into the sheet on open and return to the trigger on close. Support Escape to dismiss.

**Web equivalent.** `<dialog>` with `role="dialog"` and `aria-modal="true"`, or a `role="menu"` anchored to the trigger. Manage focus trap during the open state.

Source. https://developer.apple.com/design/human-interface-guidelines/action-sheets

---

### Alerts

**Principle.** An alert conveys important information that requires acknowledgement; it interrupts the user, so use it sparingly.

**Measurable value.** Apple recommends one to two buttons; three is the practical maximum. Hit area 44 by 44 px per button.

**States.**

| State | Behaviour |
| --- | --- |
| Default | Modal, blocks underlying content |
| Focus | Default button focused on open |
| Active button | Pressed appearance |
| Destructive button | Distinct treatment |
| Disabled button | Non-interactive while a task completes |

**Accessibility.** Use `role="alertdialog"` with `aria-modal="true"`. Title and description must be programmatically associated via `aria-labelledby` and `aria-describedby`. Trap focus while open and restore focus on dismiss. Support Escape and Return.

**Web equivalent.**

```html
<dialog id="confirm-remove" aria-labelledby="alert-title" aria-describedby="alert-desc">
  <h2 id="alert-title">Remove this piece from your bag?</h2>
  <p id="alert-desc">You can add it back at any time while stock lasts.</p>
  <div class="actions">
    <button type="button" data-close>Cancel</button>
    <button type="button" data-confirm class="destructive">Remove</button>
  </div>
</dialog>
```

Source. https://developer.apple.com/design/human-interface-guidelines/alerts

---

### Sheets

**Principle.** A sheet presents content related to a discrete task while keeping the originating context visible behind it.

**Measurable value.** Heights are platform driven; sheets can be full, partial, or resizable to detents. Apple does not publish a universal pixel detent.

**States.**

| State | Behaviour |
| --- | --- |
| Default | Presented at chosen detent |
| Resizing | Grabber visible; sheet adjusts to detents |
| Dismissing | Swipe-down or close button |
| Focus | Initial focusable element receives focus |

**Accessibility.** Use `role="dialog"` with `aria-modal="true"`. Focus must trap inside while open and restore on close. Provide a clear close affordance reachable by keyboard.

**Web equivalent.** `<dialog>` or a custom modal with backdrop. Detents map to CSS `height` snap-points combined with pointer-driven drag, or to `@media (max-height: ...)` rules.

Source. https://developer.apple.com/design/human-interface-guidelines/sheets

---

### Popovers

**Principle.** A popover shows transient content anchored to the control that triggered it; dismissing the popover returns the user to the previous context.

**Measurable value.** Anchor offset and arrow size are platform driven. Hit area for the trigger 44 by 44 px.

**States.**

| State | Behaviour |
| --- | --- |
| Default | Hidden |
| Open | Anchored to trigger; backdrop may dim slightly |
| Focus | First focusable element focused |
| Dismissing | Tap outside, Escape, or explicit close |

**Accessibility.** Use a non-modal dialog or `role="dialog"` with `aria-modal="false"`. Manage focus return to the trigger on close. Provide a labelled close control.

**Web equivalent.** The native `popover` attribute, `<dialog>` with `show()` (non-modal), or a custom layer using CSS anchor positioning (`anchor-name`, `position-anchor`).

```html
<button type="button" popovertarget="size-guide">Size guide</button>
<div id="size-guide" popover>
  <h2>Ring size guide</h2>
  <button type="button" popovertarget="size-guide" popovertargetaction="hide">Close</button>
</div>
```

Source. https://developer.apple.com/design/human-interface-guidelines/popovers

---

### Modality

**Principle.** Modality demands a choice or completion before the user can return to the parent context; reserve it for tasks that require focused attention or carry significant consequences.

**Measurable value.** Unspecified. Avoid using modality for content people need to refer to while working elsewhere.

**Accessibility.** Modal dialogs trap focus, support Escape to dismiss when safe, and announce their presence with `aria-modal="true"` and a labelled title.

**Web equivalent.** `<dialog>.showModal()`, or `role="dialog" aria-modal="true"` plus a focus trap implementation.

Source. https://developer.apple.com/design/human-interface-guidelines/modality

---

### Progress indicators

**Principle.** A progress indicator communicates that work is happening and, when possible, how much remains.

**Measurable value.** Use determinate when total work is known; indeterminate when not. Show progress only when work exceeds a perceptible delay (about one second).

**States.**

| State | Behaviour |
| --- | --- |
| Indeterminate | Looping animation, no value |
| Determinate | Filled portion reflects percent complete |
| Paused | Animation halted, current value preserved |
| Cancelled | Removed or replaced with an error state |
| Completed | Replaced with success state or removed |

**Accessibility.** Provide `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. For indeterminate, omit `aria-valuenow`. Announce completion through a live region. Honour Reduce Motion by replacing spinners with static text or a less animated indicator.

**Web equivalent.**

```html
<!-- determinate -->
<progress value="60" max="100">60%</progress>

<!-- indeterminate -->
<div role="progressbar" aria-label="Loading" aria-busy="true"></div>
```

Sources. /progress-indicators, /loading

---

### Lists and tables

**Principle.** Lists and tables present collections of items in a vertical arrangement of rows, optionally grouped or arranged in columns.

**Measurable value.** Minimum interactive row height 44 px.

**States.**

| State | Behaviour |
| --- | --- |
| Default | Row visible at rest |
| Hover | Pointer-platform highlight |
| Focus | Visible focus ring on row |
| Selected | Active selection appearance |
| Disabled | Non-interactive row |
| Empty | Empty-state message replaces the list |
| Loading | Skeleton or progress indicator |

**Accessibility.** Use semantic list markup (`<ul>`, `<ol>`, `<li>`) for unordered or ordered content. Use `<table>` with `<thead>`, `<tbody>`, `<th>`, and `scope` for tabular data. Announce selection changes via `aria-selected` on rows using `role="listbox"`/`role="option"` or `role="grid"` patterns when needed.

**Web equivalent.** Keyboard navigation with arrow keys, Home, End, Page Up, Page Down.

Source. https://developer.apple.com/design/human-interface-guidelines/lists-and-tables

---

### Labels

**Principle.** A label provides a static, accessible piece of text that names or describes an adjacent control or piece of content.

**Measurable value.** Honour Dynamic Type. Apple does not specify a minimum label size beyond the body minimum (17 px on iOS, 13 px on macOS).

**Accessibility.** Programmatically associate labels with their controls. Avoid relying on placeholder text alone.

**Web equivalent.** `<label for="...">`, or `aria-labelledby` and `aria-label` where a visible label is unavailable.

Source. https://developer.apple.com/design/human-interface-guidelines/labels

---

### Scroll views

**Principle.** A scroll view lets people view content that exceeds the visible area; scrolling is the most common navigation gesture.

**States.**

| State | Behaviour |
| --- | --- |
| Default | Content at rest |
| Scrolling | Indicators visible |
| At top, at bottom | Bounce or sticky behaviour as appropriate |
| Refreshing | Pull-to-refresh indicator visible |

**Accessibility.** Ensure content remains reachable by keyboard (Tab, arrow keys, Page Up, Page Down, Home, End). Avoid hijacking native scroll. Respect Reduce Motion by limiting parallax.

**Web equivalent.** CSS `overflow: auto`, `scroll-snap-type`, `overscroll-behavior`, `scroll-behavior: smooth`. Honour `@media (prefers-reduced-motion: reduce)` by setting `scroll-behavior: auto`.

```css
.gallery { overflow-x: auto; scroll-snap-type: x mandatory; }
.gallery > * { scroll-snap-align: start; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

Source. https://developer.apple.com/design/human-interface-guidelines/scroll-views

---

### Charts

**Principle.** A chart communicates relationships between data values visually; choose the chart type that best reveals the comparison.

**Accessibility.** Never communicate meaning by colour alone; pair with shape, pattern, or label. Provide a tabular or text alternative for screen readers. Honour Reduce Motion by removing entry animations.

**Web equivalent.** SVG with `role="img"` and `aria-label` for the summary, plus a hidden `<table>` providing the data; or `role="figure"` with a visible caption.

Source. https://developer.apple.com/design/human-interface-guidelines/charts

---

### Notifications

**Principle.** Deliver timely, relevant information; respect the user's attention by matching urgency to interruption level.

**Measurable value.** Apple defines four interruption levels (passive, active, time-sensitive, critical). Time-sensitive notifications must relate to events occurring now or within an hour.

**Accessibility.** Announce in-app notifications through assistive technology with a live region. Provide settings to control or silence notifications.

**Web equivalent.** Web Notifications API (`Notification`, `ServiceWorkerRegistration.showNotification`) with explicit permission. In-app: `role="status"` for polite updates, `role="alert"` for assertive ones.

```html
<div role="status" aria-live="polite">Added to bag.</div>
<div role="alert">Stock running low.</div>
```

Sources. /notifications, /managing-notifications

---

### Virtual keyboards

**Principle.** Match the on-screen keyboard to the content the user is entering so the right characters are quick to reach.

**Accessibility.** Inputs must declare their content type so VoiceOver, autofill, and the on-screen keyboard align. Avoid forcing input types that conflict with content.

**Web equivalent.** `inputmode="text|decimal|numeric|tel|search|email|url"` on `<input>` and `<textarea>`. Pair with `autocomplete`, `enterkeyhint`, and `pattern` as appropriate.

```html
<input type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="next" />
<input type="email" inputmode="email" autocomplete="email" enterkeyhint="done" />
<input type="search" inputmode="search" enterkeyhint="search" />
```

Source. https://developer.apple.com/design/human-interface-guidelines/virtual-keyboards

---

## Patterns

### Feedback

**Principle.** Provide feedback for every meaningful interaction so people know their action was received and what happened.

**Measurable value.** Show feedback within the perceptible delay window. Work taking longer than about one second should display a progress indicator.

**Accessibility.** Pair haptic and audio feedback with visual feedback so users who cannot see, hear, or feel one channel still receive the information.

**Web equivalent.** ARIA live regions (`role="status"`, `role="alert"`), CSS transitions on state changes, `Audio` for sound effects, and the Vibration API where supported.

Source. https://developer.apple.com/design/human-interface-guidelines/feedback

---

### Loading

**Principle.** Mask waiting time with informative feedback; restore state quickly and avoid blocking content already visible.

**Accessibility.** Announce loading start and completion via `aria-live`. Avoid unbounded spinners with no description.

**Web equivalent.** Skeleton screens via CSS, `<progress>` elements, `aria-busy="true"` on the loading region, fetch with abort signals.

```html
<section aria-busy="true" aria-live="polite">
  <div class="skeleton skeleton-image"></div>
  <div class="skeleton skeleton-line"></div>
</section>
```

Source. https://developer.apple.com/design/human-interface-guidelines/loading

---

### Onboarding

**Principle.** Get people into the experience quickly; teach only what they cannot infer from the interface itself.

**Accessibility.** Provide skip and back affordances reachable by keyboard. Announce step changes through a live region. Avoid time-limited steps.

**Web equivalent.** A sequence of routed views or a multi-step `<dialog>`. Manage focus on step transitions and expose progress with `aria-current="step"`.

Source. https://developer.apple.com/design/human-interface-guidelines/onboarding

---

### Entering data

**Principle.** Make data entry quick and forgiving; minimise input, validate gently, explain errors clearly.

**Accessibility.** Mark required fields with `aria-required="true"` and a visible indicator. Announce validation errors via `aria-describedby` and `aria-invalid="true"`. Avoid moving focus on error without warning.

**Web equivalent.** HTML form validation with `required`, `pattern`, `min`, `max`, `step`; `aria-invalid`, `aria-describedby`, `aria-errormessage`.

```html
<label for="postcode">Postcode <span aria-hidden="true">*</span></label>
<input
  id="postcode"
  type="text"
  required
  aria-required="true"
  aria-invalid="false"
  aria-describedby="postcode-help postcode-error"
/>
<p id="postcode-help">Used for delivery only.</p>
<p id="postcode-error" hidden>Enter a valid postcode.</p>
```

Source. https://developer.apple.com/design/human-interface-guidelines/entering-data

---

### Drag and drop

**Principle.** Support drag and drop where it adds value, and always provide an alternative for users who cannot or do not wish to drag.

**Measurable value.** Drag begins after the user moves the selection about three points. Provide a translucent drag image until drop.

**States.**

| State | Behaviour |
| --- | --- |
| Idle | No drag |
| Picking up | Selection captured, drag image appears |
| Dragging | Drag image follows pointer or finger |
| Over valid target | Target highlights |
| Over invalid target | Show not-allowed cue |
| Dropped | Result animates into place; failures animate back to source |

**Accessibility.** Provide a keyboard-only alternative such as cut-and-paste or move commands. Announce source, destination, and result.

**Web equivalent.** HTML5 drag and drop events (`dragstart`, `dragover`, `drop`). For accessibility, expose keyboard equivalents and use live-region announcements.

Source. https://developer.apple.com/design/human-interface-guidelines/drag-and-drop

---

### Searching

**Principle.** Make content searchable through a single, clearly identified location; help people search faster with suggestions, recent searches, and clear scope.

**Accessibility.** Use the search landmark. Announce result count changes through a polite live region.

**Web equivalent.** `role="search"` landmark containing `<input type="search">`; suggestions implemented as a combobox-listbox pattern.

```html
<form role="search">
  <label for="q" class="sr-only">Search the collection</label>
  <input id="q" type="search" name="q" enterkeyhint="search" />
  <button type="submit">Search</button>
</form>
<div role="status" aria-live="polite">12 results</div>
```

Source. https://developer.apple.com/design/human-interface-guidelines/searching

---

### Settings

**Principle.** Default sensibly so most people never need to open settings; reserve the settings surface for infrequently changed, global options.

**Accessibility.** Each setting must have a visible label, a clear current value, and a discoverable description where useful. Avoid duplicating system-wide settings.

**Web equivalent.** A form composed of grouped fieldsets, with `aria-describedby` for descriptions and `aria-current="page"` for the active section in a side navigation.

Source. https://developer.apple.com/design/human-interface-guidelines/settings

---

### Undo and redo

**Principle.** Let people reverse recent actions and clearly preview or highlight the result of each undo and redo.

**Measurable value.** Apple recommends no unnecessary limits on the number of undo steps available within a session.

**Accessibility.** Provide keyboard shortcuts (Cmd+Z on macOS, Ctrl+Z elsewhere). Announce the action that will be reversed.

**Web equivalent.** Custom command stack wired to keyboard shortcuts. For content-editable areas the browser's native undo applies. Provide `aria-keyshortcuts` on toolbar buttons.

Source. https://developer.apple.com/design/human-interface-guidelines/undo-and-redo

---

### Offering help

**Principle.** Offer help contextually, briefly, and only when it adds value; tooltips describe a single control, tips introduce features.

**Measurable value.** Apple recommends tooltips remain at roughly 60 to 75 characters where possible. Tips work best for features that take no more than about three steps.

**Accessibility.** Tooltips must not be the only way to convey essential information. Ensure tooltip content is reachable by keyboard focus and announced by screen readers.

**Web equivalent.** CSS `:hover` and `:focus-visible` plus `aria-describedby` pointing to a visible tooltip element. Honour `prefers-reduced-motion` by removing tooltip transitions.

Source. https://developer.apple.com/design/human-interface-guidelines/offering-help

---

### Launching

**Principle.** Make launching feel instant and restore previous state so people can continue where they left off.

**Measurable value.** Unspecified; aim for no more than a couple of seconds before interaction is possible.

**Web equivalent.** Service workers for instant return visits, `sessionStorage` and `localStorage` for restoring scroll position and selection, `<link rel="preload">` for critical resources.

Source. https://developer.apple.com/design/human-interface-guidelines/launching

---

### Multitasking

**Principle.** Always be ready to be interrupted; save and restore context so people can leave and return without losing work.

**Web equivalent.** `visibilitychange` event, `Page Visibility API`, `beforeunload` and `pagehide` handlers; persist state to storage on backgrounding.

Source. https://developer.apple.com/design/human-interface-guidelines/multitasking

---

### File management

**Principle.** Save people's work automatically and let them browse files in ways consistent with the platform's file system.

**Web equivalent.** File System Access API where supported, `<input type="file">` otherwise. `showOpenFilePicker()` and `showSaveFilePicker()` for richer flows.

Source. https://developer.apple.com/design/human-interface-guidelines/file-management

---

### Ratings and reviews

**Principle.** Ask for ratings only after the user has demonstrated engagement; never on first launch or during onboarding.

**Measurable value.** Apple's system prompt limits itself to three appearances per app within 365 days. Allow at least one to two weeks between requests.

**Accessibility.** Ratings prompts must be dismissible by keyboard, focusable, and announced as dialogs.

**Web equivalent.** A custom modal using `role="dialog"`, gated by engagement metrics tracked locally.

Source. https://developer.apple.com/design/human-interface-guidelines/ratings-and-reviews

---

### Playing audio

**Principle.** Match audio behaviour to user expectation: respect the silent switch where appropriate, do not mix unexpectedly with other apps, and pause when headphones disconnect.

**Accessibility.** Never convey essential information by audio alone. Provide captions and transcripts.

**Web equivalent.** HTML `<audio>` element with the Media Session API (`navigator.mediaSession`) and the Page Visibility API for pausing when hidden.

Source. https://developer.apple.com/design/human-interface-guidelines/playing-audio

---

### Playing video

**Principle.** Use the system video player so people get a familiar, accessible experience; show content in its native aspect ratio.

**Measurable value.** Default playback mode is aspect-fill for wide video (2:1 through 2.40:1) and aspect-fit for standard (4:3, 16:9, up to 2:1) and ultrawide (above 2.40:1).

**Accessibility.** Provide captions, audio descriptions, and transcripts. Honour Reduce Motion by avoiding autoplay where possible.

**Web equivalent.** `<video controls playsinline>` with `<track kind="captions">` and `<track kind="descriptions">`. Use the Picture-in-Picture API and Fullscreen API.

```html
<video controls playsinline preload="metadata" poster="hero-poster.jpg">
  <source src="hero.mp4" type="video/mp4" />
  <track kind="captions" srclang="en" src="hero.en.vtt" default />
  <track kind="captions" srclang="zh-Hant" src="hero.zh.vtt" />
</video>
```

Source. https://developer.apple.com/design/human-interface-guidelines/playing-video

---

### Playing haptics

**Principle.** Use haptics to complement visual and auditory feedback; reinforce cause and effect, and never overuse.

**Measurable value.** Apple defines three categories: notification (success, warning, error), impact (light, medium, heavy, rigid, soft), and selection. Apple does not publish exact durations in HIG.

**Accessibility.** Make haptics optional. Never use haptics as the only feedback channel.

**Web equivalent.** Vibration API (`navigator.vibrate(durationMs | pattern[])`) where supported. No exact match for the Taptic Engine library; degrade to short patterns or omit on unsupported browsers.

Source. https://developer.apple.com/design/human-interface-guidelines/playing-haptics

---

### Managing accounts

**Principle.** Require accounts only when core functionality demands it; delay sign-in for as long as possible.

**Accessibility.** Sign-in flows must be keyboard accessible, support password managers, and announce errors clearly.

**Web equivalent.** `<input autocomplete="username | current-password | new-password | one-time-code">`, WebAuthn for passkeys, the Credential Management API.

```html
<input type="email" autocomplete="username" />
<input type="password" autocomplete="current-password" />
<input type="text" autocomplete="one-time-code" inputmode="numeric" />
```

Source. https://developer.apple.com/design/human-interface-guidelines/managing-accounts

---

### Collaboration and sharing

**Principle.** Make share and collaborate actions easy to find; show a persistent indicator when content is shared.

**Accessibility.** Share sheets and collaboration popovers must trap focus, announce title, and provide a keyboard-accessible close.

**Web equivalent.** `navigator.share()` for the system share sheet on supporting platforms; otherwise a custom modal with `role="dialog"`.

Source. https://developer.apple.com/design/human-interface-guidelines/collaboration-and-sharing

---

### Privacy

**Principle.** Request access only to data you actually need, at the moment you need it; describe the use clearly.

**Accessibility.** Permission prompts must be reachable by keyboard, announced as dialogs, and dismissible without granting permission.

**Web equivalent.** Permissions API (`navigator.permissions.query`), feature-specific prompts (geolocation, camera, microphone, notifications). Prefer a custom pre-prompt explaining the reason before invoking the browser prompt.

Source. https://developer.apple.com/design/human-interface-guidelines/privacy

---

### Branding

**Principle.** Express identity through tone, accent colour, and restrained use of brand assets; defer to content.

**Web equivalent.** CSS custom properties for accent colour, `accent-color` CSS property, and reserved space for content over branding.

```css
:root { accent-color: var(--brand-accent); }
```

Source. https://developer.apple.com/design/human-interface-guidelines/branding

---

## Inputs

### Pointing devices

**Principle.** Pointer-driven interactions add hover, precise positioning, and right-click affordances; design controls to respond clearly without requiring hover for essential information.

**Measurable value.** Hit targets remain at least 44 px on touch; pointer targets may be smaller but should remain comfortably clickable. Apple does not publish a single minimum pixel size for pointer targets.

**Accessibility.** Never gate essential information on hover alone. Ensure all pointer-only interactions have keyboard equivalents.

**Web equivalent.** CSS `:hover`, `:active`, the `contextmenu` event, and the Pointer Events API. Gate hover styles behind `@media (hover: hover) and (pointer: fine)` so touch devices do not inherit them.

```css
@media (hover: hover) and (pointer: fine) {
  .product-card:hover img { transform: scale(1.03); }
}
```

Source. https://developer.apple.com/design/human-interface-guidelines/pointing-devices

---

## Universal pattern: density swap

Inherited from the macOS base, applied across every platform. One component definition serves both touch and pointer contexts.

> **Approved divergence (2026-06-04, designer).** This project does **not** shrink hit targets on desktop. The `--hit-target` token stays 44px on touch and scales **up to 48px** on hover-capable/fine-pointer devices — the opposite of the macOS density collapse to 28px below. `--control-size`, `--text-size`, and `--control-padding` still follow the documented collapse; only the interactive *hit target* diverges. Implemented in `assets/foundation.css`. Rationale: the brand wants generous, confident click targets on desktop. This override of a non-negotiable floor rule was explicitly approved.

```css
:root {
  --control-size: 44px;
  --text-size: 17px;
  --control-padding: 12px;
}

@media (hover: hover) and (pointer: fine) {
  :root {
    --control-size: 28px;
    --text-size: 13px;
    --control-padding: 8px;
  }
}

button, input, select, textarea {
  min-height: var(--control-size);
  font-size: var(--text-size);
  padding: var(--control-padding);
}
```

---

## Universal pattern: focus ring

Every focusable element must show a visible focus indicator. Use `:focus-visible` so the ring appears for keyboard but not for mouse click.

```css
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

---

## Universal pattern: dialog focus trap

Every modal uses the native `<dialog>` element with `.showModal()`. The browser handles focus trapping, Escape dismissal, and inert backdrop. No third-party focus-trap library needed.

```html
<dialog id="size-guide" aria-labelledby="sg-title">
  <h2 id="sg-title">Ring size guide</h2>
  <button type="button" autofocus data-close>Close</button>
</dialog>

<script>
  const dlg = document.querySelector('#size-guide');
  document.querySelector('#open-size-guide').addEventListener('click', () => dlg.showModal());
  dlg.querySelector('[data-close]').addEventListener('click', () => dlg.close());
</script>
```

---

## Universal pattern: live region

For all async results (search counts, cart updates, form validation), announce changes through a live region.

```html
<div role="status" aria-live="polite" aria-atomic="true" id="cart-status"></div>

<script>
  document.querySelector('#cart-status').textContent = 'Added to bag.';
</script>
```

---

## Non-negotiable rules

These 15 rules survive any brand override. Claude Code treats them as constraints, not suggestions.

1. Every interactive element is at least 44 by 44 px hit target.
2. Every focusable element shows a visible `:focus-visible` outline at 2 px offset 2 px.
3. Every button, input, select, and textarea has an accessible name from text, `<label for>`, or `aria-label`.
4. Every modal uses native `<dialog>` with `.showModal()` for focus trapping and Escape dismissal.
5. Every dialog title is associated via `aria-labelledby`; description via `aria-describedby`.
6. Every form field that can error declares `aria-invalid` and links its error message with `aria-describedby`.
7. Every input declares the correct `type`, `inputmode`, and `autocomplete`.
8. Every async status change (cart add, search count, form submit) announces through a live region.
9. Every animation honours `@media (prefers-reduced-motion: reduce)` by reducing or removing motion.
10. Hover styles live behind `@media (hover: hover) and (pointer: fine)` so touch devices never inherit them.
11. Essential information is never conveyed by colour alone; pair with label, icon, or pattern.
12. Tab order matches document source order; no `tabindex` greater than 0.
13. Placeholder text is never a substitute for a visible label.
14. Toolbars, lists, and tables use semantic HTML (`role="toolbar"`, `<ul>`/`<ol>`, `<table>` with `<th scope>`).
15. Every page has exactly one `<h1>`; heading levels never skip.

---

## Sources

- https://developer.apple.com/design/human-interface-guidelines/buttons
- https://developer.apple.com/design/human-interface-guidelines/text-fields
- https://developer.apple.com/design/human-interface-guidelines/toggles
- https://developer.apple.com/design/human-interface-guidelines/sliders
- https://developer.apple.com/design/human-interface-guidelines/steppers
- https://developer.apple.com/design/human-interface-guidelines/segmented-controls
- https://developer.apple.com/design/human-interface-guidelines/pickers
- https://developer.apple.com/design/human-interface-guidelines/toolbars
- https://developer.apple.com/design/human-interface-guidelines/action-sheets
- https://developer.apple.com/design/human-interface-guidelines/alerts
- https://developer.apple.com/design/human-interface-guidelines/sheets
- https://developer.apple.com/design/human-interface-guidelines/popovers
- https://developer.apple.com/design/human-interface-guidelines/modality
- https://developer.apple.com/design/human-interface-guidelines/progress-indicators
- https://developer.apple.com/design/human-interface-guidelines/loading
- https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- https://developer.apple.com/design/human-interface-guidelines/labels
- https://developer.apple.com/design/human-interface-guidelines/scroll-views
- https://developer.apple.com/design/human-interface-guidelines/charts
- https://developer.apple.com/design/human-interface-guidelines/notifications
- https://developer.apple.com/design/human-interface-guidelines/managing-notifications
- https://developer.apple.com/design/human-interface-guidelines/virtual-keyboards
- https://developer.apple.com/design/human-interface-guidelines/feedback
- https://developer.apple.com/design/human-interface-guidelines/onboarding
- https://developer.apple.com/design/human-interface-guidelines/entering-data
- https://developer.apple.com/design/human-interface-guidelines/drag-and-drop
- https://developer.apple.com/design/human-interface-guidelines/searching
- https://developer.apple.com/design/human-interface-guidelines/settings
- https://developer.apple.com/design/human-interface-guidelines/undo-and-redo
- https://developer.apple.com/design/human-interface-guidelines/offering-help
- https://developer.apple.com/design/human-interface-guidelines/launching
- https://developer.apple.com/design/human-interface-guidelines/multitasking
- https://developer.apple.com/design/human-interface-guidelines/file-management
- https://developer.apple.com/design/human-interface-guidelines/ratings-and-reviews
- https://developer.apple.com/design/human-interface-guidelines/playing-audio
- https://developer.apple.com/design/human-interface-guidelines/playing-video
- https://developer.apple.com/design/human-interface-guidelines/playing-haptics
- https://developer.apple.com/design/human-interface-guidelines/managing-accounts
- https://developer.apple.com/design/human-interface-guidelines/collaboration-and-sharing
- https://developer.apple.com/design/human-interface-guidelines/privacy
- https://developer.apple.com/design/human-interface-guidelines/branding
- https://developer.apple.com/design/human-interface-guidelines/pointing-devices

---

**End of hig base.** Companion files: `ios-base.md`, `ipados-base.md`, `macos-base.md`. Brand layer applies on top of all four.
