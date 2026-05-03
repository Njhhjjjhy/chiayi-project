# Fireflies

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
- `public/` – static assets (research-trip photos, references, proposal screenshots).
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

## Obsidian vault

- Path: /Users/riaan/Documents/personal/obsidian-vault
- After each session, write a handoff note to /Users/riaan/Documents/personal/obsidian-vault/sessions/
- Use filename format: YYYY-MM-DD-[project-name]-[topic].md
