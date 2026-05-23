import { fireflyComponentMap } from '../../variants/fireflies.js'

// Dispatches to the right firefly variant component. 'off' (or any
// unknown id) renders nothing — the static panel LEDs in Ceiling.jsx
// remain visible in that case so the verification page can compare
// the static layout against each animated variant side-by-side.

export default function FireflySystem({ variantId, masterOpacity = 1, ceilingVariant }) {
  if (!variantId || variantId === 'off') return null
  const Component = fireflyComponentMap[variantId]
  if (!Component) return null
  return <Component masterOpacity={masterOpacity} ceilingVariant={ceilingVariant} />
}
