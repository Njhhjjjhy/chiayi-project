# macOS base — desktop interaction rules for Claude Code

Behavioural and accessibility base extracted from Apple's macOS developer documentation and macOS-specific HIG pages. This file is the floor for desktop responsive behaviour in a web theme. Brand visuals are applied on top later and must not override the rules in this file.

macOS contributes most heavily on three fronts: hover (a first-class state), density (tighter than mobile), and keyboard navigation (every interactive element keyboard reachable, full ARIA composite patterns). Those three sections carry the most weight.

Non-negotiable rules at the bottom must be honoured by every component.

---

## Viewport range and multi-window mindset

Mac users frequently run several windows side by side. A half-screen window on a 13" MacBook is around 720px wide. Layouts must survive at 720px and scale upward to ultra-wide displays.

- Lower bound: 720px
- Upper bound: 2560px and beyond for external displays
- Apple's default visionOS window 1280x720pt is a useful desktop reference size

Use fluid container queries and viewport units. `min-width: 720px` for the desktop base; switch to the touch base below this.

```css
:root {
  font-size: clamp(15px, 0.5vw + 13px, 18px);
}

.app-root {
  container-type: inline-size;
  min-width: 720px;
}
```

---

## Window zones

A macOS window comprises a frame (title bar and toolbar), optional sidebar, body, optional inspector, rare bottom bar. Mirror this on the web with semantic landmarks.

| macOS zone | Web equivalent |
| --- | --- |
| Title bar | `<header role="banner">` |
| Toolbar | `<div role="toolbar" aria-label="..." aria-orientation="horizontal">` |
| Sidebar (navigation) | `<nav aria-label="Sections">` inside `<aside>` |
| Sidebar (content) | `<aside aria-label="Sidebar">` |
| Body | `<main>` |
| Inspector | `<aside aria-label="Inspector">` on trailing side |

macOS menu bar height is 24pt. Avoid placing critical info or controls at the bottom edge of a window — users often relocate windows past the bottom of the screen.

Window states:
- Main — frontmost window of the app
- Key — accepts input, coloured controls active
- Inactive — subdued, no vibrancy

---

## Density

macOS uses tighter spacing than iOS because of high-precision pointers. The web must offer both densities so the same component is dense on hover-capable devices and looser on coarse pointer devices.

| Token | macOS (compact) | iOS / iPadOS (regular) |
| --- | --- | --- |
| Default control size | 28 by 28pt | 44 by 44pt |
| Minimum control size | 20 by 20pt | 28 by 28pt |
| Default body text | 13pt | 17pt |
| Minimum body text | 10pt | 11pt |
| Bezelled control padding | 12pt | 12pt |
| Non-bezelled control padding | 24pt | 24pt |

Activate compact density only when the input is precise:

```css
:root {
  --row-height: 44px;
  --control-size: 44px;
  --control-padding: 24px;
  --text-default: 17px;
}

@media (hover: hover) and (pointer: fine) {
  :root {
    --row-height: 28px;
    --control-size: 28px;
    --control-padding: 12px;
    --text-default: 13px;
  }
}
```

Never let dense mode drop control size below 20 by 20px. Provide a user setting to force the looser scale. Respect browser zoom and Dynamic Type.

---

## Hover

macOS treats hover as a first-class state. The pointer's appearance, the element's background, scale, tint, and shadow can change when the pointer enters a hit region. Hit regions extend beyond visible edges so elements appear to attract the pointer.

All hover rules gated by `@media (hover: hover) and (pointer: fine)`.

Transition baseline:
- Micro changes (focus ring): 120ms ease-out
- Standard changes (background tint, scale): 180ms ease-out
- Medium changes (sheet entrance, popover open): 250ms ease-out

State matrix:

| Element | Default | Hover (primary) | Focus | Active | Selected | Disabled |
| --- | --- | --- | --- | --- | --- | --- |
| Button | No bezel | Translucent rounded fill | Halo ring | Slight darken | Accent tint | 50% opacity |
| List row | Plain | Subtle background fill across row | Highlight fill | Brief flash | Accent fill, on-accent text | Dimmed |
| Card | Flat | `scale(1.01)` plus soft shadow (lift) | Halo | Press scale `0.99` | Accent border | Reduced opacity |
| Link | Accent text | Underline appears | Halo | Darker accent | Visited variant | Dimmed |
| Sidebar item | Symbol + label | Background fill, symbol tints | Halo | Brief flash | Accent fill, on-accent text | Dimmed |
| Toolbar item | Borderless symbol | Translucent rounded background | Halo | Pressed look | Accent tint for toggled | Dimmed |
| Image / tile | Static | Hover effect with tint and shadow | Halo | Press scale | Accent border | Dimmed |

```css
@media (hover: hover) and (pointer: fine) {
  button, [role="button"] {
    transition:
      background-color 180ms ease-out,
      transform 180ms ease-out,
      box-shadow 180ms ease-out;
  }

  button:hover {
    background: color-mix(in oklab, currentColor 8%, transparent);
  }

  /* Card lift */
  .card:hover {
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  /* List row hover */
  tr:hover,
  [role="row"]:hover {
    background: color-mix(in oklab, currentColor 6%, transparent);
  }

  /* Link */
  a:hover {
    text-decoration: underline;
  }
}

/* Reduced motion: keep colour transitions, drop transforms */
@media (prefers-reduced-motion: reduce) {
  .card:hover {
    transform: none;
    box-shadow: none;
  }
}
```

Hover must never be the only way to expose a control. Always pair with focus and click affordances.

---

## Cursor

macOS publishes a fixed palette of cursors. Each communicates what an interaction will do. Map directly to CSS cursor values.

| macOS pointer | Meaning | CSS cursor |
| --- | --- | --- |
| arrow | Default selection | `default` |
| pointingHand | Hovering interactive link | `pointer` |
| iBeam | Text selectable / editable | `text` |
| iBeamCursorForVerticalLayout | Vertical text | `vertical-text` |
| crosshair | Precise rectangular selection | `crosshair` |
| openHand | Draggable | `grab` |
| closedHand | Currently dragging | `grabbing` |
| resizeLeftRight | Horizontal resize | `ew-resize` or `col-resize` |
| resizeUpDown | Vertical resize | `ns-resize` or `row-resize` |
| resizeLeft / resizeRight | Single-direction horizontal | `w-resize` / `e-resize` |
| resizeUp / resizeDown | Single-direction vertical | `n-resize` / `s-resize` |
| operationNotAllowed | Invalid drop target | `not-allowed` |
| dragCopy | Will duplicate on drop (Option held) | `copy` |
| dragLink | Will create alias (Option-Command held) | `alias` |
| disappearingItem | Item evaporates on drop | `no-drop` |
| contextualMenu | Control-click opens context menu | `context-menu` |

Cursor change alone is never sufficient. Always pair with text and hover styles.

---

## Focus ring

Focus is shown by a halo (focus ring) for text-like targets and by a row highlight for list / collection items. Show ring on keyboard input only, hide on mouse click.

Apple does not publish focus halo thickness or colour. The system uses the user's accent colour.

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 30%, transparent);
}

/* List rows: background fill instead of ring */
[role="option"]:focus-visible,
[role="row"]:focus-visible {
  outline: none;
  background: color-mix(in oklab, var(--accent) 16%, transparent);
}

/* Text fields: halo ring */
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

The ring must remain visible under Increase Contrast and must not depend on colour alone (use ring plus weight or thickness).

Never use `:focus` alone for keyboard rings — mouse clicks will trigger it. Always `:focus-visible`.

---

## Keyboard navigation

Full Keyboard Access (FKA) is the macOS standard. Tab moves between focus groups (sidebar, list, content). Arrow keys move within a group. Escape cancels. Return activates. Type-ahead jumps to matching items in lists. Command-key shortcuts mirror menu items.

Reserved shortcuts (must remain functional, never override):

| Action | Shortcut |
| --- | --- |
| Select all / Copy / Paste / Cut | Cmd-A / C / V / X |
| Undo / Redo | Cmd-Z / Shift-Cmd-Z |
| Find / Find next / Find previous | Cmd-F / Cmd-G / Shift-Cmd-G |
| New / Open / Print / Close / Save / Quit | Cmd-N / O / P / W / S / Q |
| Settings | Cmd-Comma |
| Help | Cmd-? |
| Focus next group / previous group | Ctrl-Tab / Shift-Ctrl-Tab |
| Focus menu bar / toolbar / next panel | Ctrl-F2 / Ctrl-F5 / Ctrl-F6 |
| Toggle Full Keyboard Access | Ctrl-F1 |
| Cancel | Esc |
| Tab forward / back | Tab / Shift-Tab |
| Selection extends | Shift-Arrow |
| Word selection | Option-Shift-Arrow |
| Document-level selection | Shift-Cmd-Arrow |

Detect platform with `event.metaKey` on Mac and `event.ctrlKey` elsewhere.

ARIA composite widget patterns:

```html
<!-- Listbox -->
<ul role="listbox" aria-multiselectable="true">
  <li role="option" aria-selected="false" tabindex="0">Item</li>
  <li role="option" aria-selected="true" tabindex="-1">Item</li>
</ul>

<!-- Menu -->
<div role="menu">
  <button role="menuitem">Action</button>
  <button role="menuitemcheckbox" aria-checked="false">Toggle</button>
  <button role="menuitemradio" aria-checked="true">Option</button>
</div>

<!-- Tablist -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Tab 2</button>
</div>
<div role="tabpanel" id="panel-1">...</div>

<!-- Tree (Finder-style outline) -->
<div role="tree">
  <div role="treeitem" aria-expanded="true" tabindex="0">
    Folder
    <div role="group">
      <div role="treeitem" tabindex="-1">File</div>
    </div>
  </div>
</div>

<!-- Toolbar -->
<div role="toolbar" aria-label="Editor" aria-orientation="horizontal">
  <button>Bold</button>
  <button>Italic</button>
</div>

<!-- Treegrid (outline view with columns) -->
<div role="treegrid">
  <div role="row">
    <div role="gridcell">...</div>
  </div>
</div>
```

Roving tabindex inside composites. Single Tab stop. Arrow keys move within. Home and End jump to start and end. Type-ahead matches first character on listbox and tree.

Multi-select rules in lists and tables:
- Shift extends contiguous selection
- Cmd toggles individual items
- Click without modifier replaces selection
- Arrow keys move focus
- Shift-Arrow extends selection

---

## Menus

macOS menu bar height 24pt. Each app's menu order is fixed: App, File, Edit, Format, View, app-specific, Window, Help. Submenus should not nest deeper than one level. About five items per submenu before splitting. Up to three logical groups per context menu.

Rules:
- Always show the same set of menu items; greyed-out beats hidden in the menu bar
- Context menus hide unavailable items (except Cut / Copy / Paste)
- Append ellipsis to items that need further input
- Show keyboard shortcuts only in menu bar menus, not context menus
- Destructive items in context menus render red, positioned at the bottom

State matrix:

| Element | Default | Hover | Focus (keyboard) | Active | Selected (toggled) | Disabled |
| --- | --- | --- | --- | --- | --- | --- |
| Menu item | Plain | Background fill, accent text | Highlight fill | Brief flash | Checkmark glyph | Dimmed, no hover |

```html
<button popovertarget="actions-menu" aria-haspopup="menu" aria-expanded="false">
  Actions
</button>
<div id="actions-menu" popover role="menu">
  <button role="menuitem">Edit...</button>
  <button role="menuitemcheckbox" aria-checked="false">Show preview</button>
  <hr role="separator">
  <button role="menuitem" class="destructive">Delete</button>
</div>
```

Open on click or Down arrow. Close on Esc or focus loss. Context menu fires from `contextmenu` event — do not strip the native menu unless the custom one is fully equivalent.

---

## Toolbar

Three positional groupings: leading, centre, trailing. At most three groups. Title under 15 characters. Toolbar items are borderless; corner radii are concentric with the bar.

Leading and trailing items are not customisable. Centre items can be reordered and the centre overflows first into a chevron menu.

State matrix:

| Element | Default | Hover | Focus | Active | Selected | Disabled |
| --- | --- | --- | --- | --- | --- | --- |
| Toolbar item | Borderless symbol | Rounded translucent fill | Halo | Pressed look | Accent tint | Dimmed |
| Search field | I-beam region | I-beam pointer | Halo ring | Cursor blink | Filled value | Dimmed |
| Primary action | Tinted | Slight scale or fill change | Halo | Pressed | n/a | Dimmed |

```html
<div role="toolbar" aria-label="Document" aria-orientation="horizontal">
  <button>New</button>
  <button>Save</button>
  <div role="search">
    <input type="search" aria-label="Search">
  </div>
  <button class="primary">Publish</button>
</div>
```

Single tab stop. Arrow keys move among items. Every toolbar action must also exist elsewhere (menu bar, command menu, settings) — toolbar must not be the only place a command appears.

Overflow: a trailing button with `aria-haspopup="menu"` reveals hidden items. CSS container query collapses items in order from the centre.

---

## Sidebar

Leading-side navigation surface. Uses disclosure triangles for hierarchy. Drag-to-resize. Row size is selectable (small, medium, large) by the user system-wide.

Maximum two levels of hierarchy. Deeper hierarchy belongs in a split view with a content list between sidebar and detail. Avoid placing critical info at the bottom (windows often clip the bottom edge). Items use accent colour for symbols by default.

State matrix:

| Element | Default | Hover | Focus | Active | Selected | Disabled |
| --- | --- | --- | --- | --- | --- | --- |
| Sidebar item | Symbol + label | Background fill, symbol tint | Halo | Brief flash | Accent fill, on-accent text, persistent | Dimmed |
| Disclosure triangle | Right-facing chevron | Tint change | Halo | Rotates 90deg | Down-facing chevron | n/a |
| Resize handle | 1px thin divider | `col-resize` cursor | n/a | Active drag | n/a | n/a |

```html
<aside aria-label="Sidebar">
  <nav>
    <div role="tree">
      <div role="treeitem" aria-expanded="true" tabindex="0">
        Collections
        <div role="group">
          <a role="treeitem" aria-selected="true" tabindex="-1" href="...">All</a>
          <a role="treeitem" tabindex="-1" href="...">Recent</a>
        </div>
      </div>
    </div>
  </nav>
  <div role="separator" aria-orientation="vertical"
       tabindex="0" aria-valuenow="280"
       aria-valuemin="200" aria-valuemax="400"></div>
</aside>
```

Drag-to-resize: `role="separator"` with pointer event handlers. Arrow keys nudge in 8px steps. Home and End jump to min and max width.

```css
[role="separator"][aria-orientation="vertical"] {
  cursor: col-resize;
  width: 4px;
}
```

Persist sidebar visibility in `localStorage`. Expose a Show / Hide command in the View menu equivalent. Auto-collapse below window width threshold using a container query.

---

## Lists and tables

Dense by default. Sortable column headers. Resizable columns. Multi-select with Shift and Command. Alternating row backgrounds for wide tables. Hover row highlight is primary.

State matrix:

| Element | Default | Hover | Focus | Active | Selected | Disabled |
| --- | --- | --- | --- | --- | --- | --- |
| Row | Default or zebra | Subtle background fill | Highlight fill | Brief flash | Accent fill, on-accent text | Dimmed |
| Column header | Plain bold label | Background fill, sort hint | Halo | Pressed | Active sort with arrow | n/a |
| Column divider | 1px gridline | `col-resize` cursor | n/a | Active drag | n/a | n/a |
| Outline disclosure | Chevron | Tint | Halo | Rotates | Down-facing | n/a |

```html
<table role="grid" aria-multiselectable="true">
  <thead>
    <tr>
      <th aria-sort="ascending" scope="col">
        <button>Name</button>
      </th>
      <th scope="col"><button>Date</button></th>
    </tr>
  </thead>
  <tbody>
    <tr role="row" aria-selected="false" tabindex="0">
      <td role="gridcell">Item</td>
      <td role="gridcell">Today</td>
    </tr>
  </tbody>
</table>
```

```css
tbody tr:nth-child(even) {
  background: color-mix(in oklab, currentColor 3%, transparent);
}

@media (hover: hover) {
  tbody tr:hover {
    background: var(--row-hover-bg);
  }
}

@media (prefers-contrast: more) {
  tbody tr:nth-child(even) {
    background: none;
  }
  tbody tr {
    border-bottom: 1px solid currentColor;
  }
}
```

For hierarchy, use the `treegrid` ARIA pattern (the AppKit "outline view" equivalent).

---

## Inspector and detail panes

Trailing-side pane. Shows details of current selection. Updates as selection changes. Groups properties into collapsible sections with key-value layout.

```html
<aside aria-label="Inspector">
  <details open>
    <summary>Properties</summary>
    <dl>
      <dt>Name</dt>
      <dd>Example</dd>
      <dt>Type</dt>
      <dd>Item</dd>
    </dl>
  </details>
  <details>
    <summary>Metadata</summary>
    <dl>...</dl>
  </details>
</aside>
```

```css
aside[aria-label="Inspector"] dl {
  display: grid;
  grid-template-columns: minmax(96px, max-content) 1fr;
  gap: 4px 12px;
}
```

Hide inspector first when window narrows below the desktop base. Expose a toggle in the toolbar's trailing edge.

---

## Modals: sheets, modal windows, alerts, panels

macOS distinguishes between attached sheet, free-floating modal window, alert, and floating panel.

| Surface | Behaviour |
| --- | --- |
| Sheet | Card attached to parent window. Parent dims while sheet is open. People expect to interact with other windows in the app even while a sheet is open. |
| Modal window | Free-floating, centred, dims parent. |
| Alert | Centred, blocking. Focus on default non-destructive action. |
| Panel | Floating, non-modal. Typically no minimize button. HUD-style panel is dark and translucent. |

State matrix:

| Surface | Open | Focus | Closing |
| --- | --- | --- | --- |
| Sheet | Drops from parent's top | Halo on first focusable | Slides back up |
| Modal window | Centred, dimmed parent | Halo | Fades |
| Alert | Dimmed parent | Halo on default button | Fades |
| Panel | Above main window | Halo | Slide or fade |

```html
<dialog role="dialog" aria-modal="true" aria-labelledby="sheet-title" class="sheet">
  <h2 id="sheet-title">Edit settings</h2>
  <form method="dialog">
    <button autofocus value="cancel">Cancel</button>
    <button value="save">Save</button>
  </form>
</dialog>
```

```css
.sheet[open] {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  animation: sheet-drop 250ms ease-out;
}

@keyframes sheet-drop {
  from { transform: translate(-50%, -100%); }
  to { transform: translate(-50%, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .sheet[open] {
    animation: none;
    opacity: 0;
    animation: sheet-fade 150ms ease-out forwards;
  }
}

@keyframes sheet-fade {
  to { opacity: 1; }
}
```

Trap focus inside modal. Restore focus on close. `role="dialog"` with `aria-modal="true"` and `aria-labelledby`. Esc closes sheet, panel, alert.

Apple says: do not block other windows of the same app while a sheet is open. On the web, the sheet must not freeze background tabs or other top-level views.

---

## Popovers and tooltips

Popover is a transient view anchored to its trigger, with an arrow pointing at the anchor. Closes when user clicks outside or selects an item. Tooltips appear after roughly a 500ms hover.

Show one popover at a time. Never cascade. A macOS popover can be detached into a panel by dragging.

```html
<button popovertarget="info" aria-describedby="info-tip">More info</button>
<div id="info" popover="auto" role="dialog" aria-labelledby="info-title">
  <h3 id="info-title">Details</h3>
  <p>...</p>
</div>
```

```css
[popover] {
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: pop-open 180ms ease-out;
}

@keyframes pop-open {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  [popover] {
    animation: pop-fade 150ms ease-out;
  }
}
```

For tooltips, render with `role="tooltip"` referenced by `aria-describedby`. Show on `mouseenter` and `focus-visible`. Hide on `mouseleave`, `blur`, and `Escape`.

Tooltip text must also exist in `aria-label` or visible text. Never rely on hover alone.

---

## Scrolling

macOS uses overlay scrollbars that appear during scroll and fade. Users can switch to persistent scrollbars in System Settings. Clicking the title bar scrolls the document to top. Edges have elastic bounce.

```css
.scroll-container {
  overflow: auto;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in oklab, currentColor 30%, transparent) transparent;
}

.scroll-snap {
  scroll-snap-type: x mandatory;
}

.scroll-snap > * {
  scroll-snap-align: start;
}

/* Scroll-to-top on header click */
header.app-header {
  cursor: pointer;
}
```

```js
document.querySelector('header.app-header').addEventListener('click', (e) => {
  if (e.target.closest('button, a, input')) return; // don't hijack child controls
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, behavior });
});
```

Under `prefers-contrast: more`, prefer persistent scrollbars and stronger thumb contrast.

---

## Motion and animation

macOS animations are subtle, brief, precise. The system avoids gratuitous motion. Custom animations must respect Reduce Motion.

Duration tokens:

```css
:root {
  --duration-micro: 120ms;    /* focus ring, hover tint */
  --duration-short: 180ms;    /* background fills, scale */
  --duration-medium: 250ms;   /* sheet entrance, popover */
  --ease-standard: ease-out;
  --ease-exit: ease-in;
  --ease-reposition: ease-in-out;
}
```

For state changes, use `transition`, not `animation`, so it can be reversed.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Apple gives no public spring values. The pattern above matches "brief and precise" guidance.

---

## Drag and drop

Drop within same container is move. Drop in different container is copy. Drop between apps is always copy. Option modifier forces copy. Multi-item drags are common.

Show drag image after roughly 3px of pointer movement from press location. Multi-item drag shows a count badge.

Spring loading: hover over a control during a drag to activate it. Apply after ~600ms of hover with active payload.

State matrix:

| Element | Default | Hover | Drag over (valid) | Drag over (invalid) | Dropping | Disabled |
| --- | --- | --- | --- | --- | --- | --- |
| Draggable source | Plain | Cursor `grab` | n/a | n/a | Cursor `grabbing` | n/a |
| Drop target | Plain | Subtle fill | Highlight outline | Cursor `not-allowed` | Brief flash | Dimmed |
| Drag image | Hidden | n/a | Translucent representation | Translucent + slash glyph | Fades or returns | n/a |
| Multi-item badge | Hidden | n/a | Count badge on cursor | Count updates if subset | n/a | n/a |

Implementation: Pointer Events for in-page drag. HTML5 Drag and Drop API for files from outside.

```js
let dragTimer;

source.addEventListener('pointerdown', (e) => {
  source.setPointerCapture(e.pointerId);
  // begin drag after 3px movement, in pointermove handler
});

target.addEventListener('pointerenter', () => {
  dragTimer = setTimeout(() => {
    // spring-load: activate target while drag still in progress
    target.click();
  }, 600);
});

target.addEventListener('pointerleave', () => clearTimeout(dragTimer));
```

Always provide alternative menu commands (Copy / Paste / Move) for every drag operation. VoiceOver and full keyboard access must reach the same outcome:

```
Space: pick up
Arrows: move
Space: drop
Esc: cancel
```

---

## Full screen

macOS supports system-managed full-screen mode, distinct from a maximised window. In full screen, the menu bar and Dock hide until the user moves the pointer to the screen edge.

Enter Full Screen shortcut: Ctrl-Cmd-F.

State matrix:

| Element | Default | Full screen | Exiting |
| --- | --- | --- | --- |
| Menu bar | Visible (24pt) | Hidden by default, reveals on pointer at top edge | Reappears |
| Dock | Visible | Hidden, reveals on pointer near edge | Reappears |
| Toolbar | Visible | Auto-hide optional | n/a |

```js
fullscreenButton.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Auto-hide chrome after 3s idle
let idleTimer;
document.addEventListener('mousemove', () => {
  document.body.classList.remove('chrome-hidden');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (document.fullscreenElement) {
      document.body.classList.add('chrome-hidden');
    }
  }, 3000);
});
```

Esc exits full screen (browser-managed). Provide a visible "Exit full screen" button that is keyboard reachable. Full keyboard access must continue to work.

---

## Accessibility

WCAG AA contrast minimums:
- Up to 17pt text, any weight: 4.5:1
- 18pt text, any weight: 3:1
- Any size, bold: 3:1

| macOS feature | Native effect | Web equivalent |
| --- | --- | --- |
| VoiceOver | System screen reader announces labels, roles, states | Semantic HTML, ARIA roles and attributes, live regions |
| Full Keyboard Access | Tab reaches every control | Default `tabindex="0"` on interactive elements; roving tabindex inside composites |
| Increase Contrast | Strips translucency, thickens borders, bolder text | `@media (prefers-contrast: more)` swaps to opaque fills and stronger borders |
| Reduce Motion | Disables non-essential animations and parallax | `@media (prefers-reduced-motion: reduce)` removes transitions and animations |
| Reduce Transparency | Replaces vibrancy with opaque colour | `@media (prefers-reduced-transparency: reduce)` switches surface variables |
| Colour filters | Re-maps colours system-wide | Use semantic colour tokens, never hard-coded hex; do not convey information by colour alone |
| Dynamic Type | User-set text size up to ~200% | `rem`-based sizing, respect `font-size` user preferences, no fixed-px text |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}

@media (prefers-contrast: more) {
  :root {
    --surface: white;
    --border: 2px solid black;
    --link: #00428a;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .glass-bar {
    background: var(--surface-opaque);
    backdrop-filter: none;
  }
}
```

Avoid `vh` and `vw` for text — use `rem` and `em`. Make every action keyboard reachable in a logical tab order.

---

## Layout adaptability

macOS windows are freely resizable. Desktop base must adapt fluidly between roughly 720px and 2560px without unexpected jumps. Defer switching to a compact layout as late as possible. Hide the inspector first when the window narrows.

Container queries on the main layout shell:

```css
.app-shell {
  container-type: inline-size;
  display: grid;
  grid-template-areas: "side main inspect";
  grid-template-columns: 260px 1fr 320px;
  min-width: 720px;
}

@container (max-width: 1280px) {
  .app-shell {
    grid-template-areas: "side main";
    grid-template-columns: 260px 1fr;
  }
  .inspector { display: none; }
}

@container (max-width: 960px) {
  .app-shell {
    grid-template-areas: "side-icons main";
    grid-template-columns: 64px 1fr;
  }
  .sidebar-label { display: none; }
}

@container (max-width: 720px) {
  /* hand off to touch base */
}
```

Reflow must keep all focusable elements reachable and order consistent. Do not reorder content for visual reasons only.

---

## Non-negotiable rules

These rules survive any brand override. Claude Code must not weaken them.

1. Every interactive element has visible `:focus-visible` outline. Never `outline: none` without a replacement.
2. Hover effects gated by `@media (hover: hover) and (pointer: fine)`. Never sticky on touch.
3. Cursor type matches interaction (`pointer` for links, `text` for text fields, `grab` and `grabbing` for drag, `not-allowed` for invalid drop, `col-resize` and `row-resize` for dividers).
4. Hover must never be the only way to expose a control. Always pair with focus and click affordances.
5. Tooltip text also exists in `aria-label` or visible text. Tooltip is supplementary, not load-bearing.
6. Reserved system shortcuts (Cmd-A, C, V, X, Z, S, F, N, O, W, Q, comma, period, Escape) remain functional.
7. Use Cmd (Mac) and Ctrl (other) via `event.metaKey` or `event.ctrlKey` detection. Never assume one platform.
8. ARIA composite widgets use the canonical patterns (listbox, menu, menubar, tablist, tree, treegrid, toolbar) with roving tabindex and single Tab stop.
9. Every dialog uses `<dialog>` with `aria-modal="true"` and `aria-labelledby` for focus trapping.
10. Esc closes sheets, panels, alerts, popovers, menus.
11. Multi-select rules: Shift extends range, Cmd toggles individual, click without modifier replaces.
12. Drag and drop always has menu alternative (Copy / Paste / Move) and keyboard equivalent (Space pick up, Arrows move, Space drop, Esc cancel).
13. Sidebar maximum two levels of hierarchy. Deeper structures use a split view with content list between.
14. Toolbar action must also exist elsewhere (menu, command menu). Toolbar is never the only home of a command.
15. Layouts must reflow from 720px to 2560px without unexpected jumps, with content order preserved.
16. Density compact only inside `(hover: hover) and (pointer: fine)`. Touch defaults to regular.
17. WCAG AA contrast minimums (4.5:1 for text up to 17pt, 3:1 for 18pt or bold).
18. Use `rem` and `em` for text, never `vh` or `vw`. Respect browser zoom up to 200%.
19. Container queries on layout shell, not viewport media queries, for component-level layout.
20. Apple is not responsible for cursor effects in the visible cursor area. Cursor changes are signals, never the sole indicator.

---

## Sources

- https://developer.apple.com/macos/
- https://developer.apple.com/design/human-interface-guidelines/designing-for-macos
- https://developer.apple.com/design/human-interface-guidelines/the-menu-bar
- https://developer.apple.com/design/human-interface-guidelines/sidebars
- https://developer.apple.com/design/human-interface-guidelines/toolbars
- https://developer.apple.com/design/human-interface-guidelines/windows
- https://developer.apple.com/design/human-interface-guidelines/pointing-devices
- https://developer.apple.com/design/human-interface-guidelines/keyboards
- https://developer.apple.com/design/human-interface-guidelines/focus-and-selection
- https://developer.apple.com/design/human-interface-guidelines/menus
- https://developer.apple.com/design/human-interface-guidelines/context-menus
- https://developer.apple.com/design/human-interface-guidelines/popovers
- https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- https://developer.apple.com/design/human-interface-guidelines/sheets
- https://developer.apple.com/design/human-interface-guidelines/panels
- https://developer.apple.com/design/human-interface-guidelines/split-views
- https://developer.apple.com/design/human-interface-guidelines/drag-and-drop
- https://developer.apple.com/design/human-interface-guidelines/motion
- https://developer.apple.com/design/human-interface-guidelines/going-full-screen
- https://developer.apple.com/design/human-interface-guidelines/accessibility
- https://developer.apple.com/design/human-interface-guidelines/layout
