# Discovery prompt – paste this into Claude Code

Copy everything below the line into Claude Code. It tells Claude Code to look at the current state of the sim and report back. It will not change anything.

After Claude Code finishes, copy its report and paste it back to me in our chat. Then I will write the real update prompts based on what is actually there.

---

You are about to make zero changes. This is a read-only inspection. Do not edit, create, delete, or modify any file. If at any point you find yourself about to write to a file, stop.

The project has gone through a significant design direction change. Before any updates happen, the user needs a clear report of the current state of the simulation, so the update prompts can be written against reality, not assumptions.

Use Read, Glob, and Grep only.

Report on the following. Give one section per item, with file paths quoted, and short prose answers. Do not include code blocks unless quoting specific lines is necessary for clarity.

## 1. Project structure

- Where is the project root.
- Top-level folder structure (one level deep).
- What build tool (Vite, Next, other) and what version.
- What rendering library and what version (React Three Fiber, three.js, drei, post-processing).

## 2. The room

- Which file(s) define the room shell (walls, floor, ceiling plane).
- Which file(s) define the partitions.
- Which file(s) define the column.
- Which file(s) define the entrance gap and exit gap.
- The current dimensions used (width, depth, working ceiling height) and where those constants live.

## 3. The ceiling

- Which file(s) currently render the ceiling.
- What geometry approach is used right now (flat plane, faceted grid of squares, individual panels, sculptural placeholder, something else).
- Whether the ceiling identifier `mountain-topology` is still in the codebase, and what it currently renders.
- The current ceiling LED count and where that number is set.
- The current ceiling LED colour and where that is set.
- How LEDs are positioned on the ceiling (Poisson distribution, grid, manual, other).

## 4. Walls

- Which file(s) define the back-wall, front-wall, window-wall, and entrance-wall surfaces.
- Whether the front-wall currently has any kind of feature element on it (loofah placeholder, sunset shader, light strip, anything).
- Whether any of the walls currently carry firefly LEDs and how many.

## 5. Floor

- Which file defines the floor.
- The current floor material (colour, reflectivity, any texture maps).
- Whether the floor uses a marble texture, a solid colour, or something else.

## 6. Pathway and forest

- How are the pathway and forest zones currently expressed in the code (named geometry, logical zones, separate components, other).
- Whether there is any floor edge LED strip rendering in the pathway.

## 7. Curtain

- Whether the blackout curtain exists in the sim.
- Which file renders it.
- Whether it has a toggle (on / off).

## 8. Lighting and post-processing

- Whether the post-processing stack from the previous research (HalfFloat framebuffer, N8AO, Bloom, AgX tone mapping, vignette, noise, SMAA) is currently implemented.
- Which file holds the post-processing setup.
- What ambient and directional lighting is set.
- Whether emissive materials are used on geometry visible at full darkness.

## 9. Firefly behaviour

- Which files implement the firefly behaviours (`Blinking.jsx`, `Motion.jsx`, `Interaction.jsx`, `TheWave.jsx`, `FireflyParticles.jsx` were named in the project history – confirm which exist).
- Which variants are wired up to the proposals viewer.

## 10. Proposals viewer

- Whether the `/proposals/:variantId` route exists.
- Which variants are currently registered.
- Whether toggles like `?curtain=off` work.

## 11. Camera presets

- Whether the saved viewpoint strip exists.
- How many viewpoints are saved and what they are named.

## 12. Dead code

- Any files, components, or constants that look like leftovers from the previous ceiling direction (fold geometry, four fold profiles `square-a`, `square-b`, `square-c`, `square-d`, CSP solver, 14×14 or 14×16 grid math).
- Quote file paths.

## 13. Anything else surprising

- Anything in the codebase that you cannot easily categorise, looks half-finished, or looks like it might be in the wrong state.

## Final summary

After all 13 sections, write a short summary (no more than 10 lines) that answers: if someone wants to update this sim to match a new room direction with sculptural ceiling, loofah wall on front-wall, cabinet partitions, marble floor with shoes-on, and a new LED count of 1,760, what are the biggest things that would need to change.

Stop. Do not propose changes. Do not start implementation. Wait for the user to confirm the report is complete.
