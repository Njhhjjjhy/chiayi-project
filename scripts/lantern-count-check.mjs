#!/usr/bin/env node
// Smoke check: confirm lantern placement reaches the spec target
// of 15 pillars × deterministic LED counts = 1,760 LEDs.
// Reports per-pillar tier + LED count for designer review.

import { buildLanterns } from '../src/geometry/lanternPlacement.js'
import {
  LANTERN_PILLAR_COUNT, LANTERN_LED_TOTAL, LANTERN_PER_TIER,
  LANTERN_TIER_HEIGHTS,
} from '../src/geometry/dimensions.js'

const { pillars, leds } = buildLanterns()

console.log(`pillars placed: ${pillars.count} (expected ${LANTERN_PILLAR_COUNT})`)
console.log(`LEDs placed: ${leds.count} (expected ${LANTERN_LED_TOTAL})`)
console.log()
console.log('per-pillar breakdown (index, tier, height, led count):')
for (let i = 0; i < pillars.count; i++) {
  const tierIdx = Math.floor(i / LANTERN_PER_TIER)
  const tier = LANTERN_TIER_HEIGHTS[Math.min(tierIdx, LANTERN_TIER_HEIGHTS.length - 1)]
  console.log(
    `  pillar ${String(i).padStart(2)}: tier ${tierIdx} (${tier}m), ` +
    `height ${pillars.heights[i]}m, ${pillars.ledCounts[i]} LEDs`,
  )
}

if (pillars.count !== LANTERN_PILLAR_COUNT) {
  console.error(`FAIL: pillar count ${pillars.count} ≠ expected ${LANTERN_PILLAR_COUNT}`)
  process.exit(1)
}
if (leds.count !== LANTERN_LED_TOTAL) {
  console.error(`FAIL: LED count ${leds.count} ≠ expected ${LANTERN_LED_TOTAL}`)
  process.exit(1)
}
console.log()
console.log('OK')
