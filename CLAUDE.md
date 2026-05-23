# Fireflies

## Deployment policy (NEVER VIOLATE)

**NEVER commit, push, or deploy without an explicit instruction from the user for that specific change.** A previous "push this" is NOT a standing order for future changes. Each commit, push, and deploy must be explicitly authorized for the specific change at hand. Default behavior is: make the change locally, leave it uncommitted, and let the user verify in the browser. The user reviews UI changes visually before anything goes to git. When in doubt, stop and ask.

## How to talk to the user (read this first)

**The user is a designer, not a developer.** Never use code jargon, file names, function names, or technical shorthand in conversation. Describe everything in plain or design terms — what the user would *see, feel, or do*, not how the code does it.

Examples of what NOT to say:
- "MeasureTool.jsx hardcodes [10, 3.52] planes"
- "Refactored ClickPlane to derive from ROOM constants"
- "kebab-case the dropdown values"
- "rename PARTITION_HEIGHT to PATHWAY_HEIGHT"

Translated to plain language:
- "the click-to-measure tool was still set up for the old, bigger room — fixed it to follow the current room size"
- "the room dropdown buttons in the QA panel were named with the old labels — updated"
- "the partition's height value had the old name — renamed to match the new naming"

If a code change has no visible effect, just *do it silently* and don't mention it. If it does have a visible effect, describe the effect, not the change.

When the user asks "what is X?", explain X in terms a non-developer can picture. Do not assume they know any naming conventions, file structures, or programming concepts.

## Design Context

### Users
Primarily non-artsy visitors: families, tourists already visiting Alishan, casual travelers. They arrive without art-world knowledge and should leave with a shifted perspective on nature. The storyline must be self-evident. Bilingual audience (Chinese/English) — both languages deserve equal design consideration.

### Brand Personality
**Poetic, scientific, alive.** Art + science + tech. The exhibition draws on large-scale immersive environmental art and on atmospheric installation work that treats real-world phenomena — light, weather, perception — as the medium itself. It must feel like a proper art exhibition — never a theme park, never a tech demo, never a DIY project.

### Two Stories
There are two narrative layers, and they must not be confused:
- **Outer story (promotional):** Tells the story *of* the project — what it is, why it exists, why you should visit. This is the website, marketing, social media. It sells the exhibition.
- **Inner story (the experience):** What happens *inside* the room. This is the immersive journey itself — an environmental piece that visitors walk through and inhabit. No text panels, no explanation needed. The room tells the story through light, darkness, and rhythm.

Both need a clear storyline because the audience is primarily non-artsy. The inner story must land without art-world knowledge.

### Emotional Arc
Wonder → connection → care. Visitors experience awe through bioluminescence and atmosphere, then arrive at a quiet realization: the fireflies are not separate from you. They are a reflection of you. The goal is positive reinforcement — visitors leave seeing nature differently, wanting to protect it because it is part of them. Not guilt, not doom.

### Core Theme
Fireflies represent the delicate balance between humans and nature. Their bioluminescence works through the same fundamental mechanism as electrical signals in human brain synapses — both are living systems communicating through light and chemistry. This scientific parallel connects to a Buddhist philosophical idea: everything you see is an extension of yourself, and you are part of everything.

### Aesthetic Direction
- **Dark, immersive, gallery-like.** Background #0a0a0a. UI recedes; content breathes.
- **Opacity-driven hierarchy.** White text at varying opacities (90/75/60/40/30/20) rather than multiple colors.
- **Accent colors are nature-coded:** green (moss/life), orange (warmth/sunset), purple (twilight/mystery).
- **Typography:** System font stack, light weight for headings, tight hierarchy from text-xs to text-5xl. Uppercase micro-labels with wide tracking for navigation.
- **Transitions:** Smooth, subtle. Backdrop blur on navigation. Hover states through opacity shifts, not color changes.
- **References:** large-scale environmental installation (immersive scale), atmospheric and scientifically-grounded installation work (scientific wonder), the physical Nanghia venue (rooted in place).
- **Anti-references:** Theme park (no flashy spectacle), corporate / sterile (no cold minimalism), academic / dry (no lecture-hall energy), DIY (no rough, unfinished feel).

### Design Principles

1. **The room is the interface.** Design for a physical space first. The digital tools (3D preview, website) serve the real installation — they are not the product.
2. **Darkness is a material.** The absence of light is as designed as its presence. Respect the dark. Don't over-illuminate UI or environment.
3. **Quiet confidence over spectacle.** Every element should feel considered, not showy. If it draws attention to the technology, it's wrong. If it draws attention to the fireflies, it's right.
4. **Accessible wonder.** No art-world gatekeeping. Families and casual visitors should feel the experience without explanation. Support web accessibility (WCAG AA), motion sensitivity (reduced motion options), and bilingual Chinese/English parity.
5. **Nature sets the palette.** Colors, timing, and rhythm come from the real Alishan sunset cycle and firefly behavior — golden hour → twilight → blue hour → darkness. The 4-phase lighting transition is the backbone of the experience.

### Attribution policy
No designer, artist, studio, or specific-artwork names appear anywhere in this codebase: not in comments, not in UI, not in plan documents, not in commit messages, not in asset filenames. The form carries the reference.

### Tech Stack
- React 19 + Vite 8 + Tailwind CSS 4
- Three.js via @react-three/fiber + drei + postprocessing
- Leva for debug controls
- React Router for multi-page structure
- Design tokens live as CSS variables in `src/styles/index.css` (`--color-bg`, `--color-text`, `--color-muted`, `--color-dim`, `--color-rule`, `--color-red`, `--color-blue`, `--color-amber`, `--font-serif`, `--font-mono`). Use them via `var(--token)` rather than hardcoded values. Layout/spacing still uses Tailwind utilities inline.

### Room glossary
When interpreting QA notes from Corbett (or any informal language about room elements), read `docs/room-glossary.md` first. It maps every wall / fixture / fabric / firefly group to its canonical name and code reference, plus a translation cheatsheet for common informal phrases.

### Naming rule (locked)
Every room element has one canonical name with a hyphen: front-wall, back-wall, window-wall, entrance-wall, pathway, pathway-partition, entrance-wall-partition, column, forest, exhibition-area, hvac-plenum, silver-service-door, etc. Use these everywhere — comments, doc text, dropdown labels, file names. Old names like "corridor", "Segment 1/2/3", "EntryPathway" are forbidden — see `docs/room-glossary.md` for the translation table when reading old QA notes.

**There are two partitions** — pathway-partition and entrance-wall-partition. Never say just "partition" alone — always qualify which one. The walking strip is always called "pathway", never "walking strip" or "corridor".

### Real-world room sizes (locked)
The room is rectangular: 8.83 m (front-wall and back-wall) × 8.78 m (entrance-wall and window-wall) × 3.52 m tall (working ceiling, after beams). Total height to the original structural ceiling is 4.2 m, but only 3.52 m is modelled. Visitor entrance is 2.4 m wide × full-height. Source of truth lives in `src/geometry/dimensions.js` — every other position derives from it. Don't hardcode numbers.

### Window-wall layout (locked)
Walking along the window-wall from the front-wall corner toward the back-wall corner: 119 cm plain wall (with the small 59 × 178 cm window cut in flush-left), then 99 cm silver service door, then 90 cm plain wall, then 570 cm main glass partition that ends flush with the back-wall corner. Total 878 cm.

### Visual diagnostic snapshots
The folder `baselines/` (top-level, gitignored) holds PNG screenshots from `scripts/baseline-screenshot.mjs` and `scripts/screenshot-all-presets.mjs`. One PNG per significant change, filename `<YYYY-MM-DD-HHMMSS>-<label>.png`. Used to visually verify geometry changes side-by-side with prior states. Do not commit these.

### Honesty about sources
Never claim to have read documentation or URLs that weren't actually retrieved. WebFetch fails silently on JavaScript-rendered sites (e.g. developer.apple.com) — when that happens, say so explicitly and propose an alternative (puppeteer, user paste, PDF). Distinguish clearly between (a) content actually retrieved from a URL/file and (b) reference info from a Claude skill or training data. Do not substitute one for the other.


## Folder map

- `src/components/` – top-level UI components (3D scene chrome, panels, overlays).
- `src/components/room/` – physical room geometry (walls, ceiling, doors, windows, wainscot, HVAC, curtain).
- `src/components/fireflies/` – firefly system (LED behind fabric simulation: surface positions, particles, behavior modules).
- `src/components/wallCoverings/` – proposal variants for wall covering (e.g. bamboo lattice).
- `src/components/proposals/` – `/proposals` sandbox for experience proposals (picker + experience modules).
- `src/components/QAPanel/` – shared QA notes panel backed by Vercel Blob.
- `src/pages/` – `/3d` (private 3D preview) and `/proposals` (experience sandbox).
- `src/hooks/` – context providers and hooks (variant, timeline, tour, measure, lighting state).
- `src/variants/` – named option sets the variant picker selects between.
- `src/geometry/dimensions.js` – single source of truth for room measurements (cm → scene units).
- `src/styles/index.css` – design tokens (CSS variables) + base styles.
- `api/` – Vercel functions (`notes.js`, `upload.js`) backing the QA panel via `@vercel/blob`.
- `scripts/capture-phase.mjs` – puppeteer screenshot tool for proposal phase exports.
- `docs/` – internal docs; start with `room-glossary.md` when reading QA notes.
- `public/` – static assets shipped to the live site. Keep this lean (currently just favicon and icons).
- `reference/` – local-only project material: research-trip photos, exhibition references, PBR texture libraries, ideas/notes. Never deployed. If you want to wire a texture or photo into the running app, copy it into `public/` first.
- `showcase/` – auto-generated portfolio docs (regenerated by `/handoff`; do not hand-edit).

## Commands

- `pnpm dev` – start the Vite dev server.
- `pnpm build` – production build.
- `pnpm lint` – eslint over the project.
- `pnpm preview` – serve the production build locally.
- `node scripts/capture-phase.mjs` – capture proposal phase screenshots via puppeteer.

## Off-limits

- `dist/`, `node_modules/`, `.vercel/` – build/install artifacts, never edit.
- `showcase/` – regenerated by `/handoff`, do not hand-edit.
- `.handoffs/` – session handoff log, append-only.
- Files currently in the user's stash or active edits – check `git status` first; do not refactor files mid-edit.

## Obsidian vault (DISABLED)

Obsidian vault writing is disabled. Do not write session notes to the vault.
