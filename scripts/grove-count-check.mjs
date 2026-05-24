#!/usr/bin/env node
// Smoke check: confirm grove placement reaches the spec target count
// of 110 stems × 16 LEDs = 1,760 LEDs without relying on the dev
// server. Run from the repo root: node scripts/grove-count-check.mjs

import { buildGrove } from '../src/geometry/grovePlacement.js'
import { GROVE_STEM_COUNT, GROVE_LED_PER_STEM } from '../src/geometry/dimensions.js'

const expectedStems = GROVE_STEM_COUNT
const expectedLeds = GROVE_STEM_COUNT * GROVE_LED_PER_STEM
const { stems, leds } = buildGrove()

console.log(`stems placed: ${stems.count} (expected ${expectedStems})`)
console.log(`LEDs placed: ${leds.count} (expected ${expectedLeds})`)

if (stems.count !== expectedStems) {
  console.error(`FAIL: stem count ${stems.count} ≠ expected ${expectedStems}`)
  process.exit(1)
}
if (leds.count !== expectedLeds) {
  console.error(`FAIL: LED count ${leds.count} ≠ expected ${expectedLeds}`)
  process.exit(1)
}
console.log('OK')
