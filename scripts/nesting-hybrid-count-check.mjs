#!/usr/bin/env node
// Smoke check: confirm nesting hybrid LED placement adds up to 264
// on bolster surfaces (with the ceiling carrying the other 1,496).

import { buildNesting } from '../src/geometry/nestingPlacement.js'
import {
  NESTING_HYBRID_LED_TOTAL_BOLSTERS,
  NESTING_HYBRID_LED_TOTAL_CEILING,
} from '../src/geometry/dimensions.js'

const { bolsters, leds } = buildNesting()

console.log(`bolsters placed: ${bolsters.length}`)
console.log(`bolster LEDs placed: ${leds.count} (expected ${NESTING_HYBRID_LED_TOTAL_BOLSTERS})`)
console.log(`per-bolster split: [${leds.perBolsterCounts.join(', ')}]`)
console.log(`sum check: ${leds.perBolsterCounts.reduce((a, b) => a + b, 0)}`)
console.log(`ceiling LEDs (from CeilingLEDs slice): ${NESTING_HYBRID_LED_TOTAL_CEILING}`)
console.log(`total: ${leds.count + NESTING_HYBRID_LED_TOTAL_CEILING}`)

if (bolsters.length < 6 || bolsters.length > 8) {
  console.error(`FAIL: bolster count ${bolsters.length} out of expected 6-8 range`)
  process.exit(1)
}
if (leds.count !== NESTING_HYBRID_LED_TOTAL_BOLSTERS) {
  console.error(`FAIL: bolster LED count ${leds.count} ≠ expected ${NESTING_HYBRID_LED_TOTAL_BOLSTERS}`)
  process.exit(1)
}
if (leds.count + NESTING_HYBRID_LED_TOTAL_CEILING !== 1760) {
  console.error(`FAIL: total ${leds.count + NESTING_HYBRID_LED_TOTAL_CEILING} ≠ 1760`)
  process.exit(1)
}
console.log()
console.log('OK')
