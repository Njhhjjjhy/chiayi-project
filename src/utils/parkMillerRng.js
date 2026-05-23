// Park–Miller seeded PRNG. Deterministic — the same seed produces the
// same sequence on every call. Required for procedural placements that
// must render identically across reloads and across React 19 strict-
// mode double-invocation.
export function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
