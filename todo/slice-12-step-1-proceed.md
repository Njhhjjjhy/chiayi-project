# Slice 12 step 1: proceed

Proceed with step 1. Value `1.0` as written.

Halo flag acknowledged. At `1.0`, bloom contribution likely drops to zero per the AgX threshold check. Expected behaviour, not a blocker. Step 2 captures will show whether texture-readable + no-halo reads as "warm glow" or as "dead".

Iteration plan if it reads dead:

- Tune to `1.5` (likely retains some bloom halo while still major drop from `3.0`).
- If `1.5` still reads too hot, drop to `1.2`.

No bloom retune this slice. Only source intensity.
