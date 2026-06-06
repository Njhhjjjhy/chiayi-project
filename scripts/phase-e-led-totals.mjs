#!/usr/bin/env node
// Phase E verification: per-variant LED total table.
// All six proposals must equal 1,760.

import { buildCeiling } from '../src/geometry/ceilingForms.js'
import { buildFlock } from '../src/geometry/flockPlacement.js'
import { buildGrove } from '../src/geometry/grovePlacement.js'
import { buildLanterns } from '../src/geometry/lanternPlacement.js'
import { buildNesting } from '../src/geometry/nestingPlacement.js'

const ceiling = buildCeiling()
const flock = buildFlock()
const grove = buildGrove()
const lanterns = buildLanterns()
const nesting = buildNesting()

const totals = [
  { variant: 'fireflies-suspended-sky', surface: 'ceiling', count: ceiling.leds.count },
  { variant: 'fireflies-within-reach',  surface: 'ceiling', count: ceiling.leds.count },
  { variant: 'fireflies-flock',         surface: 'wall strings + ceiling field', count: flock.leds.count },
  { variant: 'fireflies-grove',         surface: 'grove stems', count: grove.leds.count },
  { variant: 'fireflies-lanterns',      surface: 'lantern pillars', count: lanterns.leds.count },
  { variant: 'fireflies-nesting',       surface: 'pebble undersides', count: nesting.leds.count },
]

console.log('Per-variant LED totals (expected 1760 for each):')
console.log()
let allPass = true
for (const t of totals) {
  const pass = t.count === 1760
  if (!pass) allPass = false
  const status = pass ? 'OK' : 'FAIL'
  console.log(`  ${t.variant.padEnd(28)} ${String(t.count).padStart(5)}  on ${t.surface}  [${status}]`)
}
console.log()
console.log(allPass ? 'PASS: all six variants at 1,760' : 'FAIL: at least one variant off-target')
if (!allPass) process.exit(1)
