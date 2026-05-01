// Canonical defaults for the proposals review page.

// First-load variant. Null is the calibration anchor — starting here
// means a reviewer sees the room without any treatment before stepping
// through the other five.
export const DEFAULT_PROPOSAL_VARIANT_ID = 'null'

// Firefly density default. Matches the existing `distributeUnits`
// output (~1,584). The slider in chunk 1b exposes a 500–3000 range.
export const DEFAULT_FIREFLY_COUNT = 1584

// Global haze override default. 0 = off, 1 = full haze.
export const DEFAULT_HAZE_LEVEL = 0.2

// Default timeline position on first load.
//
// Not "blue hour" — PALETTE's blue-hour range is 0.5–0.75. This value
// is just past the firefly threshold (FireflySystem renders when time
// ≥ 0.75, with a five-frame ramp over 0.05), partway through the ramp,
// so the treatment and fireflies both read on first load. Matches the
// existing "skip to fireflies" convention in TimelineProvider, where
// the same 0.78 lands a reviewer at "fireflies have just emerged."
export const DEFAULT_TIMELINE_T = 0.78

// Optional architectural overlays. Curtain off by default; both
// entry-pathway sides on by default so first-load shows the corridor
// layout under review. Independent flags so either side can be toggled
// off in the panel.
export const DEFAULT_SHOW_CURTAIN = false
export const DEFAULT_SHOW_PATHWAY = true
export const DEFAULT_SHOW_PATHWAY_LEFT = true
