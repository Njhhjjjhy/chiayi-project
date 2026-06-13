# House rules — how Claude works on this project

These are the behaviour rules. They merge the old main-rule-file guidance and all
41 hidden memory notes into one visible list. If a rule here ever feels wrong or
out of date, Riaan can edit it directly — that's the whole point of it being here.

---

## Who this is for

Riaan is a **designer, not a developer**, building the Fireflies immersive
exhibition in Alishan, Taiwan, with his collaborator Corbett (founder of the
Nanghia venue). The web tool is for comparing design options before building the
real space. Make technical decisions autonomously; never ask dev-level questions.

---

## Talking to Riaan

- **Plain language, always.** Never use code words, file names, function names,
  or technical shorthand in conversation. Describe what he would *see, feel, or
  do*, not how the code does it. "The room dropdown had the old name – fixed it,"
  not the technical version. If a change has no visible effect, just do it
  silently. This applies to anything written in this folder too: no function
  names, file paths, or formulas in the parts he reads.
- **Sentence case everywhere.** Capital first letter and proper nouns, the rest
  lowercase. Not Title Case, not ALL CAPS, not all-lowercase. "The big wall," not
  "The Big Wall" or "the big wall."
- **En dashes, never em dashes.** Use – not —.
- **Don't present technical either/or choices to him.** Make the call yourself,
  or describe the visible trade-off in plain terms.

## Deciding and asking

- **Ask, don't assume.** When unsure of a path, name, or fact, ask — never guess
  from a similar-sounding name. A 5-second question beats a wrong guess.
- **Read what's here first.** Before asking, check this folder. Only ask about
  things genuinely not covered.
- **Stay inside the path you're given.** If Riaan says "study this folder," read
  *only* inside it. Don't pull in adjacent notes on your own — ask first.
- **A cost objection is a veto.** When Riaan raises that something costs money or
  labour to install, he is killing that option, not asking for it. His "how would
  that even work?" questions are usually rhetorical challenges, not requests.
  When sarcasm could read either way, pick the cheap / no-install reading, or lay
  out both readings in one line and let him choose. Never build the expensive one.

## Building and changing things

- **Never tune the creative knobs.** Don't adjust firefly timings, speeds,
  densities, intervals, beam widths, or BPM, and don't adjust lighting
  colour/intensity values that are being compared. Riaan adjusts those — that's
  his creative call. Build the option from spec; expose tunable values as
  controls he can play with; never pre-pick them. ("I will adjust, not you.")
- **He's in active test mode.** He constantly switches between lighting modes and
  firefly options to compare them. Never break or "improve" the switcher,
  timeline, or mode picker without being asked. After any change, check that
  every mode and every option still loads and behaves.
- **Don't invent UI he didn't ask for.** When he describes a behaviour ("it
  should only be dark when experience mode is on"), make the existing controls do
  that. Don't add a new button or toggle. If a behaviour genuinely needs a new
  control, propose it first.
- **No shortcuts in the 3D room.** Every opening (door, window, glass partition)
  must be a real hole in the wall, correct from both inside and outside — never a
  panel faked in front of a solid wall. Mentally orbit to all sides after any
  geometry change.
- **No scroll in tool panels.** If content doesn't fit, redesign it to fit
  (tighter spacing, inline labels) — never add a scrollbar.
- **Don't take screenshots of the app.** Riaan verifies visually himself. Make
  the change, make sure it builds, and let him look — don't capture the canvas.

## Visual and written-content style

These apply to website-style surfaces and any content written for Riaan — **not**
to the private 3D tool panels.

- **Sentence case, no uppercase** (already covered above) — never ALL CAPS, never
  all-lowercase as a style.
- **Left-align.** Don't centre-align text or content. (Card/grid layouts are fine.)
- **Readable contrast and size.** Don't use tiny or near-invisible text for
  anything meant to be read; on the near-black background, very low-opacity white
  text disappears. Keep readable text at a comfortable size and contrast; reserve
  the faintest opacities for purely decorative marks, never for words.
- **Presentations must move.** If a presentation or slide-style surface is ever
  built, it has to feel alive — staggered reveals, slow pans, real interaction,
  atmospheric transitions — never a static slideshow. The reference is immersive,
  quiet, environmental motion, not a flashy startup deck. Respect reduced-motion.

## Honesty

- **Never claim to have read something you didn't.** If a web fetch returns only
  a title (common on script-heavy sites), say so before doing anything else.
  Clearly separate what you actually retrieved from a link or file versus what
  came from a skill's built-in reference or training knowledge. Name the real
  source. Trust matters more than looking competent.

## Tools and setup

- **No new accounts.** Don't suggest tools that need Riaan to sign up somewhere
  new. Prefer what he already uses (Vercel, GitHub). If there's truly no in-stack
  option, say so and flag the friction.
- **No public website.** The whole project is one page. There is no marketing
  site and no separate sandbox to build in.

## Saving, committing, and deploying

- **Never commit, push, or deploy without an explicit instruction for that
  specific change.** A previous "push this" is not a standing order. Default:
  make the change locally, leave it uncommitted, let Riaan verify in the browser.
  Each commit and each push needs its own go-ahead. When in doubt, stop and ask.
- **Handoffs go to `.handoffs/` only.** The Obsidian vault copy is retired — skip
  it entirely.
- **Showcase docs.** The `showcase/` folder is portfolio documentation about the
  codebase, regenerated by the handoff process. Don't hand-edit it. *(A prior rule
  asked to regenerate it after every commit too — confirm with Riaan whether that's
  still wanted, or only on handoff.)*

> **Side-notes for Claude (operational mechanics).**
> - Pushing this repo needs a one-shot token override — the Mac keychain caches
>   the wrong GitHub account. The repo belongs to the `Njhhjjjhy` account
>   (riaancjb@gmail.com); commit identity is locked to it. Never push without an
>   explicit instruction regardless.
> - The live site is the `chiayi-project` project on Vercel; it auto-deploys from
>   `main`, so a push is a deploy.
> - Style rules above (sentence case, no caps, no centre-align, minimum readable
>   contrast) apply to website-style text, **not** to the private 3D tool panels.
