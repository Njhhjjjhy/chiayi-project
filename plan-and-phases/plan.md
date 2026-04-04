# Firefly immersive experience — build plan

## What this project is

A web-based 3d proposal visualization tool for the Firefly Immersive Experience, an installation being built in a 10x10 meter indoor space in the Alishan mountain range, Taiwan. The web tool lets Riaan and Corbett compare design variants side-by-side, make decisions, and eventually refine into a final design that becomes a public promotional website.

The entire 3d world is built in code using React, React Three Fiber, and @react-three/drei. No imported model files. Everything is constructed from geometric primitives.

## Tech stack

- React 18+ with Vite
- React Three Fiber + @react-three/drei
- Tailwind CSS for ui elements
- Leva (debug controls for tweaking parameters in real time)
- Deployed to Vercel

## File structure

Each phase has its own markdown file with detailed instructions:

- plan.md — this file (overview and summary)
- phase-1.md — foundation and variant infrastructure
- phase-2.md — mountain wall variants
- phase-3.md — lighting and the 4-phase sunset transition
- phase-4.md — firefly behavior variants (6 proposals)
- phase-5.md — room environment variants
- phase-6.md — structure qa tool
- phase-7.md — decision consolidation
- phase-8.md — public promotional website
- references.md — links to 3d web experiences, particle systems, and technical resources

## Summary

| Phase | Focus | Sessions | Priority |
|---|---|---|---|
| 1 | Foundation and variant infrastructure | 1 | Now |
| 2 | Mountain wall variants | 1-2 | Now |
| 3 | Lighting and 4-phase transition | 1-2 | Now |
| 4 | Firefly behavior variants (6 proposals) | 2-3 | Now |
| 5 | Room environment variants | 1-2 | Now |
| 6 | Structure qa tool | 1 | After phase 5 |
| 7 | Decision consolidation | 1 | After decisions are made |
| 8 | Public promotional website | 2-3 | Future |

Total estimated effort: 10-16 Claude Code sessions across all phases.

Phases 1-5 are the core proposal tool. Phase 6 is a practical build-planning addition. Phases 7-8 happen after decisions are made.

## How to use this plan

1. Start with phase 1. Read phase-1.md and follow its instructions.
2. After each phase, review what was built. Flag anything that needs adjustment.
3. Move to the next phase only when you're satisfied with the current one.
4. At any point, you can go back and add more variants to an earlier phase.
5. After phase 5, sit down with Corbett and walk through all the combinations.
6. Make your choices, then run phase 7 to consolidate.
