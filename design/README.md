# Design — the one place to look

This folder is the single home for everything that used to be scattered across
the main rule file, a hidden memory store, and a few dozen overlapping docs.

It is written for **both Riaan and Claude**. Plain language throughout. The few
exact file references Claude needs are kept in clearly marked side-notes so they
don't get in the way of reading.

## The one rule

**Every piece of information is exactly one of three things, and it lives in the
file that matches.** If you ever find the same thing in two places, one of them
is wrong — fix it so it lives in one place only.

| If it is… | It lives in… | Means |
| --- | --- | --- |
| **Locked** — a final decision or a fixed fact | [decisions.md](decisions.md) | Settled. Don't reopen it, don't offer alternatives, build to it. |
| **Open** — still being decided, or an unresolved conflict | [open.md](open.md) | Not settled. Options are on the table. Never treat as decided. |
| **Reference** — context, research, history | [reference/](reference/) | Background only. Never a rule, never the current truth. |

Plus two living reference docs that describe the **current state** in detail:

- [room.md](room.md) — the physical room: names, layout, what's on each wall.
- [experience.md](experience.md) — the visitor experience: the journey, the
  options still in play, the staging.

And the behaviour rulebook:

- [rules.md](rules.md) — how Claude must work and talk. The "house rules."

## How to use this

- **"Is X decided, and what is it?"** → start in [decisions.md](decisions.md).
- **"What does the room actually look like / what's on the window-wall?"** →
  [room.md](room.md).
- **"What's still up in the air?"** → [open.md](open.md).
- **"How should Claude behave / talk to me?"** → [rules.md](rules.md).

## How this stays trustworthy

1. When something gets decided, it moves **into [decisions.md](decisions.md)
   with the date** — and out of [open.md](open.md). Decisions are never left
   buried in a session log.
2. When two files disagree, the files in this folder win over anything in
   `reference/`, `archive/`, or old session logs. Newest dated entry wins.
3. Nothing about this project's rules lives outside this folder anymore. The
   old hidden auto-memory has been retired (the feature is off) and its content
   pulled in here where you can see and edit it.

> **Side-note for Claude.** The room's measurements are not re-typed in these
> docs — the single source of truth for every number is the measurements file
> the 3D room is built from (`src/geometry/dimensions.js`). Quote from there,
> never from memory. These docs describe and decide; the code holds the numbers.
