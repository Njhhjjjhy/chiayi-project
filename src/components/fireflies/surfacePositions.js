import {
  ROOM,
  FOREST_X_START, FOREST_X_END,
  FOREST_Z_START, FOREST_Z_END,
  CEILING_FORM_Y_MIN, CEILING_FORM_Y_MAX,
  CEILING_VARIANT_DEFAULT,
} from '../../geometry/dimensions.js'
import { buildCeiling } from '../../geometry/ceilingForms.js'

// Firefly surface positions. Delegates to the sculptural-ceiling
// pipeline in src/geometry/ceilingForms.js so the static LED renderer
// (CeilingLEDs.jsx) and the animated firefly behaviours always target
// the same LEDs.
//
// Unit concept: each LED belongs to one module (a "unit"). One form may
// hold zero to four modules. Flashlight's beam wakes a coherent module
// (16 LEDs at once); the cascade has a natural neighbour graph through
// the module's anchor position on the form.

export { makeRng } from '../../utils/parkMillerRng.js'

// Returns:
//   positions:    Float32Array of xyz flat triples (length count * 3)
//   unitIndices:  Uint16Array, module each LED belongs to (0..unitCount-1)
//   unitCenters:  Array of [x, y, z] module anchor positions
//   count:        total LED count (= 1,760 for the locked spec)
//   unitCount:    module count (= 110 for the locked spec, minus any
//                  forms that ended up with zero modules — same value)
export function getLedSurface(variant = CEILING_VARIANT_DEFAULT) {
  return buildCeiling(variant).leds
}

// Convenience constants for behaviours that need them.
export const FOREST_CENTER_X = (FOREST_X_START + FOREST_X_END) / 2
export const FOREST_CENTER_Z = (FOREST_Z_START + FOREST_Z_END) / 2
export const FOREST_SPAN_X = FOREST_X_END - FOREST_X_START
export const FOREST_SPAN_Z = FOREST_Z_END - FOREST_Z_START
export const PANEL_Y_MID = (CEILING_FORM_Y_MIN + CEILING_FORM_Y_MAX) / 2

export { ROOM }
