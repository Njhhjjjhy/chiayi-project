import { useVariant } from '../../hooks/useVariant.js'
import { useTimeline } from '../../hooks/useTimeline.js'
import { fireflyComponentMap, defaultFireflyId } from '../../variants/fireflies.js'

export default function FireflySystem() {
  const { selections, isExperience } = useVariant()
  const { time } = useTimeline()

  if (!isExperience) return null

  const darknessProgress = Math.max(0, (time - 0.75) / 0.05)
  const masterOpacity = Math.min(1, darknessProgress)

  if (masterOpacity <= 0) return null

  const variantId = selections.fireflies || defaultFireflyId
  const VariantComponent = fireflyComponentMap[variantId] || fireflyComponentMap[defaultFireflyId]

  return <VariantComponent masterOpacity={masterOpacity} />
}
