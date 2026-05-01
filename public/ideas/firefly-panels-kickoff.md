# Kickoff: firefly panels R3F review tool

## Task

Patch the existing `CLAUDE.md` with one missing rule, read context, interview Riaan on open areas, produce a spec file, stop. Do not write scene or component code in this session.

## Steps

1. Read `CLAUDE.md` at the project root. If it does not already contain a rule equivalent to the attribution policy below, append the following under a new section titled "Attribution policy" (sentence case section heading), preserving everything else in the file exactly as it is. If a rule like this is already present, skip the append and note that in step 4.

   ```
   No designer, artist, studio, or specific-artwork names appear anywhere in this codebase: not in comments, not in UI, not in plan documents, not in commit messages, not in asset filenames. The form carries the reference.
   ```

2. Read `plan-and-phases/firefly-panels-reference.md` end to end.
3. Inspect the existing codebase and confirm: state management pattern in use, scene mount path, camera and controls in use, asset path convention, whether `drei` and `r3f-perf` are installed, whether any output from the superseded prompt (`claude-code-prompt-firefly-proposals-r3f.md`) still exists in the repo.
4. Report findings from steps 1 and 3 in one short paragraph (whether `CLAUDE.md` was patched or already had the rule, plus the codebase state). Do not propose architecture yet.
5. Use the `AskUserQuestion` tool to interview Riaan on the items listed in the reference document under "Open areas requiring interview before spec is written". Group by topic. Offer 2 to 4 concrete options per question. Skip anything already resolved by the reference or `CLAUDE.md`.
6. Once all open areas are resolved, write `plan-and-phases/firefly-panels-spec.md`. Structure it as: shared systems with acceptance criteria per system, five big-wall treatments with acceptance criteria per treatment, UI shell, routing, phase-gated execution plan with per-phase verification and screenshot gates.
7. Summarize the spec to Riaan in chat in 5 to 8 sentences: what shared systems are specified, what the five treatments do differently, what the phase plan looks like, and what the first phase gate will render. Ask whether anything needs revision. If so, revise the spec file and re-summarize. Only proceed once Riaan confirms the spec is ready.
8. Stop.

## Do not

- Write any scene or component code in this session.
- Read `plan-and-phases/plan.md` or any of the phase files (`phase-1.md` through `phase-6.md`). They are out of date. The reference document is the only project context for this task.
- Modify any file except creating `plan-and-phases/firefly-panels-spec.md` and, if needed, appending to `CLAUDE.md`.
- Overwrite or restructure the existing `CLAUDE.md` content. Append only.
- Restate `CLAUDE.md` rules inside the spec.
- Ask questions already resolved by the reference or `CLAUDE.md`.
- Proceed past step 8 without Riaan explicitly starting a new session.

## Expected output

One new file at `plan-and-phases/firefly-panels-spec.md`. Optionally, a small additive edit to `CLAUDE.md` appending the attribution policy. Nothing else.
